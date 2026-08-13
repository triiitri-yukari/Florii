import assert from "node:assert/strict";
import test from "node:test";
import {
  configureGarden,
  createGarden,
  plantSeed,
  renameGarden,
  tendGarden,
  writeNote
} from "../src/engine.js";

const now = new Date("2026-04-10T00:00:00.000Z");

test("care actions are bounded, recoverable, and recorded", () => {
  const garden = createGarden(now, { seed: 55 });
  const plant = plantSeed(garden, "duskfern", { nickname: "Fenn" }, now);
  garden.soilMoisture = 92;
  const watered = tendGarden(garden, "water", {}, now);
  assert.equal(garden.soilMoisture, 100);
  assert.match(watered, /roots/);

  const beforeHealth = plant.health;
  const pruned = tendGarden(garden, "prune", { targetId: plant.id, note: "One tired frond." }, now);
  assert.ok(plant.health >= beforeHealth);
  assert.match(pruned, /Fenn/);
  assert.match(garden.chronicle.at(-1)?.text ?? "", /One tired frond/);
});

test("pruning an unknown or unspecified plant returns a useful error", () => {
  const garden = createGarden(now, { seed: 55 });
  assert.throws(() => tendGarden(garden, "prune", {}, now), /targetId/);
  assert.throws(() => tendGarden(garden, "prune", { targetId: "missing" }, now), /No plant/);
});

test("care replies vary while describing the action that actually happened", () => {
  const replies = new Set<string>();
  for (let seed = 1; seed <= 16; seed += 1) {
    const garden = createGarden(now, { seed });
    garden.soilMoisture = 24;
    replies.add(tendGarden(garden, "water", {}, now));
  }
  assert.ok(replies.size >= 3);
  assert.ok([...replies].every((reply) => /water|pour|soil/i.test(reply) && /roots/i.test(reply)));
});

test("names, notes, and pace changes survive in state", () => {
  const garden = createGarden(now, { seed: 1 });
  renameGarden(garden, "The Small Hours", now);
  writeNote(garden, "The soil smelled like rain.", "hopeful", now);
  configureGarden(garden, { mode: "demo", hemisphere: "south" }, now);
  assert.equal(garden.name, "The Small Hours");
  assert.equal(garden.mode, "demo");
  assert.equal(garden.hemisphere, "south");
  assert.ok(garden.chronicle.some((entry) => entry.text.includes("smelled like rain")));
});
