import assert from "node:assert/strict";
import test from "node:test";
import { createGarden, plantSeed } from "../src/engine.js";
import { SPECIES, SPECIES_LIST } from "../src/species.js";
import { SPECIES_IDS } from "../src/types.js";

const start = new Date("2026-03-01T00:00:00.000Z");

test("the seed catalogue exposes twelve complete and distinct species", () => {
  assert.equal(SPECIES_IDS.length, 12);
  assert.deepEqual(Object.keys(SPECIES), [...SPECIES_IDS]);
  assert.deepEqual(SPECIES_LIST.map((species) => species.id), [...SPECIES_IDS]);
  assert.equal(new Set(SPECIES_LIST.map((species) => species.name)).size, 12);

  for (const species of SPECIES_LIST) {
    assert.ok(species.description.length >= 30, `${species.name} needs a meaningful description`);
    assert.ok(species.preferredSeasons.length >= 1);
    assert.ok(species.colors.length >= 3);
    assert.ok(species.colors.every((color) => /^#[0-9a-f]{6}$/i.test(color)));
    assert.ok(species.daysToSprout < species.daysToBud);
    assert.ok(species.daysToBud < species.daysToMature);
    assert.ok(species.daysToMature <= 24, `${species.name} should reach its first bloom within the month-long baseline`);
    assert.ok(species.waterPreference >= 20 && species.waterPreference <= 85);
    assert.ok(species.resilience >= 50 && species.resilience <= 100);
  }
});

test("every catalogued seed can become a persistent individual plant", () => {
  const garden = createGarden(start, { seed: 1_212 });
  const plants = SPECIES_IDS.map((species) => plantSeed(garden, species, {}, start));

  assert.equal(plants.length, 12);
  assert.deepEqual(plants.map((plant) => plant.species), [...SPECIES_IDS]);
  assert.ok(plants.every((plant) => plant.phenotype.primaryColor.startsWith("#")));
  assert.ok(plants.every((plant) => plant.phenotype.waterNeed >= 22 && plant.phenotype.waterNeed <= 88));
  assert.equal(new Set(plants.map((plant) => plant.phenotype.primaryColor)).size, 12);
});
