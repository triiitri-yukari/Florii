import { mkdir, open, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createGarden } from "./engine.js";
import type { GardenState } from "./types.js";

const LOCK_WAIT_MS = 40;
const LOCK_TIMEOUT_MS = 5_000;
const STALE_LOCK_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

export function defaultDataDirectory(): string {
  return process.env.FLORII_DATA_DIR
    ? resolve(process.env.FLORII_DATA_DIR)
    : join(homedir(), ".florii");
}

export class GardenStore {
  readonly path: string;
  private readonly lockPath: string;

  constructor(dataDirectory = defaultDataDirectory()) {
    this.path = join(dataDirectory, "garden.json");
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

  private async readUnlocked(): Promise<GardenState> {
    try {
      const content = await readFile(this.path, "utf8");
      const parsed = JSON.parse(content) as GardenState;
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.plants) || !Array.isArray(parsed.chronicle)) {
        throw new Error("Unsupported or damaged garden data.");
      }
      if (!parsed.weatherConfig) {
        parsed.weatherConfig = {
          source: "simulated",
          latitude: null,
          longitude: null,
          placeName: null,
          lastSyncAt: null,
          cachedDays: [],
          lastError: null
        };
      }
      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return createGarden();
    }
  }

  private async writeUnlocked(state: GardenState): Promise<void> {
    state.revision += 1;
    const temporaryPath = `${this.path}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
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
