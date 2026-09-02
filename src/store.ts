import { existsSync } from "node:fs";
import { copyFile, mkdir, open, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGarden } from "./engine.js";
import type { GardenState } from "./types.js";

const LOCK_WAIT_MS = 40;
const LOCK_TIMEOUT_MS = 5_000;
const STALE_LOCK_MS = 15_000;
const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const sourceProjectDirectory = resolve(moduleDirectory, "..");
const compiledProjectDirectory = resolve(moduleDirectory, "../..");
const projectDirectory = existsSync(join(sourceProjectDirectory, "package.json"))
  ? sourceProjectDirectory
  : compiledProjectDirectory;

function sleep(ms: number): Promise<void> {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCurrentV1Garden(value: unknown): value is GardenState {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== 1 || typeof value.revision !== "number") return false;
  if (!Array.isArray(value.plants) || !Array.isArray(value.chronicle)) return false;
  if (!Array.isArray(value.weather) || !Array.isArray(value.events) || !Array.isArray(value.milestones)) return false;

  const herbarium = value.herbarium;
  if (
    !isRecord(herbarium) ||
    !Array.isArray(herbarium.registeredPlantIds) ||
    !Array.isArray(herbarium.species) ||
    !Array.isArray(herbarium.archivedPlants)
  ) return false;

  const weatherConfig = value.weatherConfig;
  if (
    !isRecord(weatherConfig) ||
    (weatherConfig.source !== "simulated" && weatherConfig.source !== "open-meteo") ||
    !Object.prototype.hasOwnProperty.call(weatherConfig, "timezone") ||
    !Array.isArray(weatherConfig.cachedDays)
  ) return false;

  return value.plants.every(
    (plant) => isRecord(plant) && isRecord(plant.phenotype) && Array.isArray(plant.traits)
  );
}

export function defaultDataDirectory(): string {
  return process.env.FLORII_DATA_DIR
    ? resolve(process.env.FLORII_DATA_DIR)
    : join(projectDirectory, ".florii");
}

export class GardenStore {
  readonly path: string;
  readonly backupPath: string;
  private readonly lockPath: string;

  constructor(dataDirectory = defaultDataDirectory()) {
    this.path = join(dataDirectory, "garden.json");
    this.backupPath = `${this.path}.bak`;
    this.lockPath = `${this.path}.lock`;
  }

  private async ensureDirectory(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
  }

  private async acquireLock(): Promise<() => Promise<void>> {
    await this.ensureDirectory();
    const started = Date.now();
    while (Date.now() - started < LOCK_TIMEOUT_MS) {
      try {
        const handle = await open(this.lockPath, "wx");
        await handle.writeFile(`${process.pid}\n${new Date().toISOString()}\n`, "utf8");
        await handle.close();
        return async () => {
          await unlink(this.lockPath).catch(() => undefined);
        };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        try {
          const lockInfo = await stat(this.lockPath);
          if (Date.now() - lockInfo.mtimeMs > STALE_LOCK_MS) {
            await unlink(this.lockPath).catch(() => undefined);
            continue;
          }
        } catch {
          continue;
        }
        await sleep(LOCK_WAIT_MS);
      }
    }
    throw new Error("Florii could not acquire its garden lock. Another process may still be writing.");
  }

  private async parseSave(path: string): Promise<GardenState> {
    const content = await readFile(path, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (!isCurrentV1Garden(parsed)) {
      throw new Error("Unsupported or damaged Florii v1 garden data. Saves from older test builds are not migrated.");
    }
    return parsed;
  }

  private async readUnlocked(): Promise<GardenState> {
    try {
      return await this.parseSave(this.path);
    } catch (error) {
      try {
        const recovered = await this.parseSave(this.backupPath);
        await copyFile(this.backupPath, this.path);
        return recovered;
      } catch (backupError) {
        if (
          (error as NodeJS.ErrnoException).code === "ENOENT" &&
          (backupError as NodeJS.ErrnoException).code === "ENOENT"
        ) return createGarden();
        throw error;
      }
    }
  }

  private async writeUnlocked(state: GardenState): Promise<void> {
    state.revision += 1;
    const temporaryPath = `${this.path}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    try {
      await this.parseSave(this.path);
      await copyFile(this.path, this.backupPath);
    } catch {
      // A missing or damaged primary save must never replace the last valid backup.
    }
    await rename(temporaryPath, this.path);
  }

  async read(): Promise<GardenState> {
    const release = await this.acquireLock();
    try {
      const state = await this.readUnlocked();
      if (state.revision === 0) await this.writeUnlocked(state);
      return structuredClone(state);
    } finally {
      await release();
    }
  }

  async transaction<T>(mutate: (state: GardenState) => T | Promise<T>): Promise<{ state: GardenState; result: T }> {
    const release = await this.acquireLock();
    try {
      const state = await this.readUnlocked();
      const result = await mutate(state);
      await this.writeUnlocked(state);
      return { state: structuredClone(state), result };
    } finally {
      await release();
    }
  }
}
