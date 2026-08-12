import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { GardenStore } from "../src/store.js";

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
