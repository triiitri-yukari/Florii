import assert from "node:assert/strict";
import { mkdtemp, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { GardenStore } from "../src/store.js";
import { createGarden, plantSeed } from "../src/engine.js";
import type { GardenState } from "../src/types.js";

test("the store serializes concurrent writes and leaves valid JSON", async () => {
  const directory = await mkdtemp(join(tmpdir(), "florii-store-"));
  const store = new GardenStore(directory);
  await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      store.transaction((garden) => {
        garden.tranquility += 1;
        garden.name = `Revision ${index}`;
      })
    )
  );
  const garden = await store.read();
  const raw = JSON.parse(await readFile(store.path, "utf8"));
  assert.equal(garden.revision, 20);
  assert.equal(garden.tranquility, 90);
  assert.equal(raw.schemaVersion, 1);
});

test("the store creates a private persistent garden on first read", async () => {
  const directory = await mkdtemp(join(tmpdir(), "florii-store-"));
  const store = new GardenStore(directory);
  const garden = await store.read();
  assert.equal(garden.schemaVersion, 1);
  assert.equal(garden.revision, 1);
  assert.match(await readFile(store.path, "utf8"), /A Quiet Patch/);
});

test("the store keeps one previous save and recovers a damaged primary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "florii-store-"));
  const store = new GardenStore(directory);
  await store.transaction((garden) => { garden.name = "Before the rain"; });
  await store.transaction((garden) => { garden.name = "After the rain"; });

  const backup = JSON.parse(await readFile(store.backupPath, "utf8")) as GardenState;
  assert.equal(backup.name, "Before the rain");
  await writeFile(store.path, "{not valid json", "utf8");

  const recovered = await store.read();
  assert.equal(recovered.name, "Before the rain");
  assert.equal((JSON.parse(await readFile(store.path, "utf8")) as GardenState).name, "Before the rain");
});

test("the store recovers from the backup when the primary is missing", async () => {
  const directory = await mkdtemp(join(tmpdir(), "florii-store-"));
  const store = new GardenStore(directory);
  await store.transaction((garden) => { garden.name = "Kept in reserve"; });
  await store.transaction((garden) => { garden.name = "Latest primary"; });
  await unlink(store.path);

  const recovered = await store.read();
  assert.equal(recovered.name, "Kept in reserve");
});

test("the store rejects saves from older test builds instead of migrating them", async () => {
  const directory = await mkdtemp(join(tmpdir(), "florii-store-"));
  const store = new GardenStore(directory);
  const at = new Date("2026-08-12T00:00:00.000Z");
  const garden = createGarden(at, { seed: 321 });
  plantSeed(garden, "rainmint", {}, at);

  const oldShape = structuredClone(garden) as unknown as Record<string, unknown>;
  const oldPlants = oldShape.plants as Array<Record<string, unknown>>;
  if (oldPlants[0]) delete oldPlants[0].phenotype;
  delete oldShape.herbarium;
  await writeFile(store.path, JSON.stringify(oldShape), "utf8");

  await assert.rejects(store.read(), /Saves from older test builds are not migrated/);
  const unchanged = JSON.parse(await readFile(store.path, "utf8")) as Record<string, unknown>;
  assert.equal(unchanged.herbarium, undefined);
});
