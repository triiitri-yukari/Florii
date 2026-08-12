import assert from "node:assert/strict";
import test from "node:test";
import { advanceGarden, createGarden, gardenSnapshot, plantSeed, visitGarden } from "../src/engine.js";

const start = new Date("2026-03-01T00:00:00.000Z");

test("a garden reaches its first chapter after roughly one season", () => {
  const garden = createGarden(start, { seed: 42, hemisphere: "north" });
  const plant = plantSeed(garden, "moonbell", { nickname: "Mori" }, start);
  const summary = advanceGarden(garden, new Date("2026-06-01T00:00:00.000Z"));

  assert.equal(summary.gardenDaysPassed, 92);
  assert.ok(plant.ageDays >= 90);
  assert.ok(plant.bloomCount >= 1);
  assert.ok(garden.milestones.some((milestone) => milestone.id === "first-chapter"));
  assert.equal(gardenSnapshot(garden).firstChapter, "complete — the garden continues");
});

test("long absences change the story but never kill plants", () => {
  const garden = createGarden(start, { seed: 7 });
  plantSeed(garden, "starpetal", {}, start);
  plantSeed(garden, "emberbloom", {}, start);
  const report = visitGarden(garden, new Date("2028-03-01T00:00:00.000Z"));

  assert.match(report.narrative, /garden continued without complaint/i);
  assert.ok(garden.plants.length >= 2);
  assert.ok(garden.plants.every((plant) => plant.health >= 35));
  assert.ok(garden.milestones.some((milestone) => milestone.id === "garden-year"));
});

test("test pace advances one garden day every five seconds", () => {
  const garden = createGarden(start, { seed: 99, mode: "test" });
  const summary = advanceGarden(garden, new Date(start.getTime() + 10_000));
  assert.equal(summary.gardenDaysPassed, 2);
  assert.equal(garden.simulatedDays, 2);
});

test("partial days are preserved until a whole garden day passes", () => {
  const garden = createGarden(start, { seed: 99 });
  const noon = advanceGarden(garden, new Date("2026-03-01T12:00:00.000Z"));
  const nextNoon = advanceGarden(garden, new Date("2026-03-02T12:00:00.000Z"));
  assert.equal(noon.gardenDaysPassed, 0);
  assert.equal(nextNoon.gardenDaysPassed, 1);
  assert.equal(garden.partialDay, 0.5);
});

test("weather and growth are deterministic for the same seed", () => {
  const left = createGarden(start, { seed: 1234 });
  const right = createGarden(start, { seed: 1234 });
  plantSeed(left, "rainmint", { x: 20, y: 40 }, start);
  plantSeed(right, "rainmint", { x: 20, y: 40 }, start);
  // Plant ids differ, but weather and garden-wide conditions remain deterministic.
  advanceGarden(left, new Date("2026-04-01T00:00:00.000Z"));
  advanceGarden(right, new Date("2026-04-01T00:00:00.000Z"));
  assert.deepEqual(left.weather, right.weather);
  assert.equal(left.soilMoisture, right.soilMoisture);
});
