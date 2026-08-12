import assert from "node:assert/strict";
import test from "node:test";
import { EVENT_CATALOG, advanceGarden, createGarden, createSelfSeededPlant, gardenSnapshot, plantSeed, transplantPlant, visitGarden } from "../src/engine.js";

const start = new Date("2026-03-01T00:00:00.000Z");

test("the garden offers a varied condition-aware encounter catalogue", () => {
  assert.equal(EVENT_CATALOG.length, 16);
  assert.equal(new Set(EVENT_CATALOG.map((event) => event.type)).size, EVENT_CATALOG.length);
  assert.ok(EVENT_CATALOG.every((event) => event.title.length > 5 && event.description.length > 20));

  const dryEmpty = createGarden(start, { seed: 1 });
  dryEmpty.soilMoisture = 20;
  const clearSummer = { date: "2026-07-01", season: "summer", condition: "clear", temperatureC: 28, rainMm: 0, source: "simulated" } as const;
  assert.equal(EVENT_CATALOG.find((event) => event.type === "snail")?.eligible(dryEmpty, clearSummer), false);
  assert.equal(EVENT_CATALOG.find((event) => event.type === "rain_puddle")?.eligible(dryEmpty, clearSummer), false);

  plantSeed(dryEmpty, "starpetal", {}, start).stage = "blooming";
  assert.equal(EVENT_CATALOG.find((event) => event.type === "bumblebee")?.eligible(dryEmpty, clearSummer), true);
  assert.equal(EVENT_CATALOG.find((event) => event.type === "butterfly")?.eligible(dryEmpty, clearSummer), true);
});

test("a garden reaches its first chapter after roughly one season", () => {
  const garden = createGarden(start, { seed: 42, hemisphere: "north" });
  const plant = plantSeed(garden, "moonbell", { nickname: "Mori" }, start);
  const summary = advanceGarden(garden, new Date("2026-06-01T00:00:00.000Z"));

  assert.equal(summary.gardenDaysPassed, 92);
  assert.ok(plant.ageDays >= 90);
  assert.ok(garden.milestones.some((milestone) => milestone.id === "first-chapter"));
  assert.equal(gardenSnapshot(garden).firstChapter, undefined);
});

test("long absences change the story but never kill plants", () => {
  const garden = createGarden(start, { seed: 7 });
  plantSeed(garden, "starpetal", {}, start);
  plantSeed(garden, "emberbloom", {}, start);
  const report = visitGarden(garden, new Date("2028-03-01T00:00:00.000Z"));

  assert.match(report.narrative, /real days have passed since the last visit/i);
  assert.doesNotMatch(report.narrative, /nothing|without complaint|not impatient|immediate response/i);
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

test("a preferred season changes pace without locking an out-of-season bloom", () => {
  const garden = createGarden(start, { seed: 314, hemisphere: "north" });
  const plant = plantSeed(garden, "velvethorn", {}, start);
  assert.equal(garden.lastSeason, "spring");

  advanceGarden(garden, new Date("2026-04-15T00:00:00.000Z"));

  assert.ok(plant.bloomCount >= 1);
  assert.ok(garden.chronicle.some((entry) => entry.kind === "bloom" && entry.title.startsWith("Velvethorn")));
});

test("seeds of one species grow into persistent individual variations", () => {
  const garden = createGarden(start, { seed: 808 });
  const plants = Array.from({ length: 16 }, () => plantSeed(garden, "moonbell", {}, start));
  const colors = new Set(plants.map((plant) => `${plant.phenotype.primaryColor}:${plant.phenotype.pattern}`));
  const growthRates = new Set(plants.map((plant) => plant.phenotype.growthRate));
  const waterNeeds = new Set(plants.map((plant) => plant.phenotype.waterNeed));

  assert.ok(colors.size >= 3);
  assert.ok(growthRates.size >= 5);
  assert.ok(waterNeeds.size >= 5);
  assert.ok(plants.every((plant) => plant.traits.length <= 4));
  assert.deepEqual(
    (gardenSnapshot(garden).plants as Array<{ phenotype: unknown }>).map((plant) => plant.phenotype),
    plants.map((plant) => plant.phenotype)
  );
});

test("automatic planting spreads a full patch across the available soil", () => {
  const garden = createGarden(start, { seed: 505 });
  const plants = Array.from({ length: 48 }, () => plantSeed(garden, "cloverlight", {}, start));
  const closePairs = plants.flatMap((left, index) => plants.slice(index + 1).filter((right) => {
    const horizontal = (left.x - right.x) / 8;
    const vertical = (left.y - right.y) / 12;
    return Math.hypot(horizontal, vertical) < 0.55;
  }));
  assert.ok(new Set(plants.map((plant) => Math.round(plant.y))).size >= 12);
  assert.ok(closePairs.length <= 4);
});

test("growth-rate phenotype changes actual growth", () => {
  const garden = createGarden(start, { seed: 909 });
  const plants = Array.from({ length: 20 }, () => plantSeed(garden, "starpetal", {}, start));
  const sorted = [...plants].sort((left, right) => left.phenotype.growthRate - right.phenotype.growthRate);
  const slow = sorted[0];
  const fast = sorted.at(-1);
  assert.ok(slow && fast);
  slow.phenotype.waterNeed = 55;
  fast.phenotype.waterNeed = 55;
  slow.health = fast.health = 90;
  advanceGarden(garden, new Date("2026-03-21T00:00:00.000Z"));
  assert.ok(fast.growth > slow.growth);
});

test("self-seeded plants inherit their parent's phenotype with small variation", () => {
  const garden = createGarden(start, { seed: 3 });
  const parent = plantSeed(garden, "starpetal", {}, start);
  const child = createSelfSeededPlant(garden, parent, 90);
  assert.equal(child.species, parent.species);
  assert.equal(child.generation, 2);
  assert.equal(child.origin, "self-seeded");
  assert.ok(Math.abs(child.phenotype.growthRate - parent.phenotype.growthRate) <= 0.12);
  assert.ok(Math.abs(child.phenotype.waterNeed - parent.phenotype.waterNeed) <= 9);
  assert.ok(Math.abs(child.phenotype.height - parent.phenotype.height) <= 0.16);
  assert.ok(garden.herbarium.registeredPlantIds.includes(child.id));
  assert.equal(garden.herbarium.species.find((entry) => entry.species === "starpetal")?.individualsSeen, 2);
});

test("the herbarium permanently records species, variations, and notable finds", () => {
  const garden = createGarden(start, { seed: 808 });
  const plants = Array.from({ length: 12 }, () => plantSeed(garden, "moonbell", {}, start));
  const record = garden.herbarium.species.find((entry) => entry.species === "moonbell");

  assert.ok(record);
  assert.equal(record.individualsSeen, plants.length);
  assert.equal(garden.herbarium.registeredPlantIds.length, plants.length);
  assert.ok(record.variants.length >= 3);
  assert.equal(record.firstDiscoveredGardenDay, 0);
  assert.equal(record.notableFinds.length, plants.filter((plant) => plant.phenotype.rarity !== "common").length);

  const herbarium = gardenSnapshot(garden).herbarium as {
    speciesDiscovered: number;
    speciesTotal: number;
    variantCount: number;
    entries: unknown[];
  };
  assert.equal(herbarium.speciesDiscovered, 1);
  assert.equal(herbarium.speciesTotal, 12);
  assert.equal(herbarium.variantCount, record.variants.length);
  assert.equal(herbarium.entries.length, 1);
});

test("transplanting frees a space while preserving the complete resident record", () => {
  const garden = createGarden(start, { seed: 212 });
  const residents = Array.from({ length: 48 }, (_, index) => plantSeed(garden, "moonbell", { nickname: `Moon ${index + 1}` }, start));
  assert.throws(() => plantSeed(garden, "starpetal", {}, start), /48-plant capacity/i);

  const chosen = residents[12];
  assert.ok(chosen);
  const archived = transplantPlant(garden, chosen.id, { note: "Moved beside the old gate." }, start);
  assert.equal(garden.plants.length, 47);
  assert.equal(archived.plant.id, chosen.id);
  assert.deepEqual(archived.plant.phenotype, chosen.phenotype);
  assert.equal(archived.plant.generation, chosen.generation);
  assert.equal(archived.plant.origin, chosen.origin);
  assert.equal(archived.note, "Moved beside the old gate.");
  assert.ok(garden.chronicle.some((entry) => entry.title.includes("was transplanted")));

  const replacement = plantSeed(garden, "starpetal", { nickname: "A New Corner" }, start);
  assert.equal(garden.plants.length, 48);
  assert.ok(garden.plants.includes(replacement));
  const herbarium = gardenSnapshot(garden).herbarium as { archivedCount: number; archivedResidents: Array<{ id: string; note: string }> };
  assert.equal(herbarium.archivedCount, 1);
  assert.equal(herbarium.archivedResidents[0]?.id, chosen.id);
  assert.equal(herbarium.archivedResidents[0]?.note, "Moved beside the old gate.");
});
