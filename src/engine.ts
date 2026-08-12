import { randomUUID } from "node:crypto";
import { SPECIES, SPECIES_LIST } from "./species.js";
import type {
  AdvanceSummary,
  ChronicleEntry,
  GardenEvent,
  GardenState,
  Hemisphere,
  Milestone,
  Plant,
  PlantPhenotype,
  PlantStage,
  Season,
  SpeciesId,
  TendAction,
  TimeMode,
  VisitReport,
  WeatherDay
} from "./types.js";

const DAY_MS = 86_400_000;
const MAX_PLANTS = 48;
const MAX_WEATHER_HISTORY = 120;
const MAX_SIMULATION_DAYS_PER_CALL = 3_650;
const BLOOM_COLOR_WORDS: Record<SpeciesId, string[]> = {
  moonbell: ["lavender", "pearl", "soft violet"],
  starpetal: ["blush", "butter-yellow", "rose"],
  rainmint: ["mint-green", "sea-glass", "cool jade"],
  emberbloom: ["coral", "apricot", "warm red"],
  duskfern: ["moss-green", "silver-green", "deep green"],
  cloverlight: ["lime-white", "pale gold", "spring green"]
};

const FRAGRANCES: PlantPhenotype["fragrance"][] = ["none", "green", "honey", "rain", "citrus", "night-sweet"];
const PATTERNS: PlantPhenotype["pattern"][] = ["solid", "gradient", "tipped", "speckled", "bicolor"];

export const MODE_SPEED: Record<TimeMode, number> = {
  real: 1,
  demo: 144,
  test: 17_280
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

function hash32(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFor(seed: number, key: string): number {
  let value = hash32(`${seed}:${key}`);
  value += 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
}

function pick<T>(items: readonly T[], roll: number): T {
  return items[Math.min(items.length - 1, Math.floor(roll * items.length))] as T;
}

function mixHex(left: string, right: string, rightWeight: number): string {
  const parse = (value: string) => [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
  const a = parse(left);
  const b = parse(right);
  const channels = a.map((value, index) => Math.round(value * (1 - rightWeight) + (b[index] ?? value) * rightWeight));
  return `#${channels.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function phenotypeTraits(phenotype: PlantPhenotype, speciesId: SpeciesId): string[] {
  const species = SPECIES[speciesId];
  const traits: string[] = [];
  if (phenotype.growthRate >= 1.08) traits.push("quick-growing");
  else if (phenotype.growthRate <= 0.92) traits.push("patient");
  if (phenotype.waterNeed >= species.waterPreference + 7) traits.push("rain-loving");
  else if (phenotype.waterNeed <= species.waterPreference - 7) traits.push("dry-rooted");
  if (phenotype.resilience >= Math.min(98, species.resilience + 6)) traits.push("weather-hardy");
  if (phenotype.height >= 1.09) traits.push("tall-stemmed");
  else if (phenotype.height <= 0.91) traits.push("low-growing");
  if (phenotype.pattern !== "solid") traits.push(phenotype.pattern);
  if (phenotype.fragrance !== "none") traits.push(`${phenotype.fragrance}-scented`);
  if (phenotype.rarity === "rare") traits.push("rare variation");
  return traits.slice(0, 4);
}

function createPhenotype(
  state: GardenState,
  id: string,
  speciesId: SpeciesId,
  parent?: PlantPhenotype
): PlantPhenotype {
  const species = SPECIES[speciesId];
  const roll = (key: string) => randomFor(state.seed, `${id}:phenotype:${key}`);
  const paletteIndex = Math.min(species.colors.length - 1, Math.floor(roll("palette") * species.colors.length));
  const paletteColor = species.colors[paletteIndex] ?? species.colors[0] ?? "#d9d7ff";
  const accentColor = species.colors[(paletteIndex + 1 + Math.floor(roll("accent") * (species.colors.length - 1))) % species.colors.length] ?? paletteColor;
  const rarityRoll = roll("rarity");
  const rarity: PlantPhenotype["rarity"] = rarityRoll > 0.975 ? "rare" : rarityRoll > 0.82 ? "unusual" : "common";
  const mutation = parent ? (rarity === "rare" ? 0.28 : rarity === "unusual" ? 0.16 : 0.08) : 0.22;
  const patternPool = rarity === "common" ? PATTERNS.slice(0, 3) : PATTERNS;
  const baseNumber = (base: number, spread: number, key: string, min: number, max: number) =>
    clamp(base + (roll(key) - 0.5) * spread, min, max);
  const inheritNumber = (parentValue: number, speciesBase: number, spread: number, key: string, min: number, max: number) =>
    clamp(parentValue * 0.72 + speciesBase * 0.28 + (roll(key) - 0.5) * spread, min, max);

  const phenotype: PlantPhenotype = {
    primaryColor: parent ? mixHex(parent.primaryColor, paletteColor, mutation) : mixHex(paletteColor, accentColor, roll("blend") * 0.18),
    secondaryColor: parent ? mixHex(parent.secondaryColor, accentColor, mutation) : mixHex(accentColor, "#fff7df", 0.08 + roll("soften") * 0.18),
    centerColor: parent ? mixHex(parent.centerColor, "#d7b66d", mutation * 0.55) : mixHex("#d7b66d", accentColor, roll("center") * 0.2),
    colorName:
      parent && roll("color-name-inherit") < 0.85
        ? parent.colorName
        : BLOOM_COLOR_WORDS[speciesId][paletteIndex] ?? BLOOM_COLOR_WORDS[speciesId][0] ?? "soft-colored",
    pattern: parent && roll("pattern-inherit") < 0.78 ? parent.pattern : pick(patternPool, roll("pattern")),
    height: parent ? inheritNumber(parent.height, 1, 0.16, "height", 0.78, 1.25) : baseNumber(1, 0.36, "height", 0.78, 1.25),
    bloomSize: parent ? inheritNumber(parent.bloomSize, 1, 0.14, "bloom-size", 0.78, 1.28) : baseNumber(1, 0.38, "bloom-size", 0.78, 1.28),
    growthRate: parent ? inheritNumber(parent.growthRate, 1, 0.12, "growth-rate", 0.84, 1.18) : baseNumber(1, 0.3, "growth-rate", 0.84, 1.18),
    waterNeed: parent
      ? inheritNumber(parent.waterNeed, species.waterPreference, 9, "water", 22, 88)
      : baseNumber(species.waterPreference, 22, "water", 22, 88),
    resilience: parent
      ? inheritNumber(parent.resilience, species.resilience, 8, "resilience", 50, 99)
      : baseNumber(species.resilience, 18, "resilience", 50, 99),
    fragrance: parent && roll("fragrance-inherit") < 0.82 ? parent.fragrance : pick(FRAGRANCES, roll("fragrance")),
    rarity
  };
  phenotype.height = Math.round(phenotype.height * 100) / 100;
  phenotype.bloomSize = Math.round(phenotype.bloomSize * 100) / 100;
  phenotype.growthRate = Math.round(phenotype.growthRate * 100) / 100;
  phenotype.waterNeed = Math.round(phenotype.waterNeed);
  phenotype.resilience = Math.round(phenotype.resilience);
  return phenotype;
}

export function ensurePlantPhenotype(state: GardenState, plant: Plant): void {
  if (!plant.phenotype) plant.phenotype = createPhenotype(state, plant.id, plant.species);
  plant.traits = phenotypeTraits(plant.phenotype, plant.species);
}

function isoAtGardenDay(state: GardenState, gardenDay: number): string {
  return new Date(Date.parse(state.createdAt) + gardenDay * DAY_MS).toISOString();
}

export function seasonFor(date: Date, hemisphere: Hemisphere): Season {
  const month = date.getUTCMonth();
  const north: Season =
    month >= 2 && month <= 4
      ? "spring"
      : month >= 5 && month <= 7
        ? "summer"
        : month >= 8 && month <= 10
          ? "autumn"
          : "winter";
  if (hemisphere === "north") return north;
  return ({ spring: "autumn", summer: "winter", autumn: "spring", winter: "summer" } as const)[north];
}

export function createGarden(
  now = new Date(),
  options: { name?: string; mode?: TimeMode; hemisphere?: Hemisphere; seed?: number } = {}
): GardenState {
  const at = now.toISOString();
  const seed = options.seed ?? Math.floor(Math.random() * 2_147_483_647);
  const season = seasonFor(now, options.hemisphere ?? "north");
  return {
    schemaVersion: 1,
    revision: 0,
    seed,
    name: options.name ?? "A Quiet Patch",
    createdAt: at,
    updatedAt: at,
    lastSimulatedAt: at,
    lastVisitedAt: null,
    simulatedDays: 0,
    partialDay: 0,
    mode: options.mode ?? "real",
    hemisphere: options.hemisphere ?? "north",
    soilMoisture: 62,
    soilRichness: 58,
    biodiversity: 15,
    tranquility: 70,
    plants: [],
    weather: [],
    weatherConfig: {
      source: "simulated",
      latitude: null,
      longitude: null,
      placeName: null,
      lastSyncAt: null,
      cachedDays: [],
      lastError: null
    },
    events: [],
    chronicle: [
      {
        id: randomUUID(),
        at,
        gardenDay: 0,
        kind: "beginning",
        title: "A patch of earth",
        text: "The garden began quietly, with open soil and time ahead of it.",
        icon: "·"
      }
    ],
    milestones: [],
    lastSeason: season
  };
}

function weatherFor(state: GardenState, gardenDay: number): WeatherDay {
  const date = new Date(isoAtGardenDay(state, gardenDay));
  const season = seasonFor(date, state.hemisphere);
  const dateKey = date.toISOString().slice(0, 10);
  if (state.mode === "real" && state.weatherConfig.source === "open-meteo") {
    const external = state.weatherConfig.cachedDays.find((day) => day.date === dateKey);
    if (external) return external;
  }
  const roll = randomFor(state.seed, `weather:${gardenDay}`);
  const tempRoll = randomFor(state.seed, `temperature:${gardenDay}`);
  const seasonBase = { spring: 17, summer: 26, autumn: 16, winter: 7 }[season];
  const wetBias = { spring: 0.42, summer: 0.34, autumn: 0.4, winter: 0.3 }[season];
  let condition: WeatherDay["condition"];
  let rainMm = 0;
  if (season === "winter" && roll < 0.08) condition = "frost";
  else if (roll < wetBias * 0.12) {
    condition = "storm";
    rainMm = 22 + randomFor(state.seed, `rain:${gardenDay}`) * 30;
  } else if (roll < wetBias * 0.46) {
    condition = "rain";
    rainMm = 8 + randomFor(state.seed, `rain:${gardenDay}`) * 16;
  } else if (roll < wetBias) {
    condition = "drizzle";
    rainMm = 2 + randomFor(state.seed, `rain:${gardenDay}`) * 6;
  } else if (roll < wetBias + 0.13) condition = "mist";
  else if (roll < 0.72) condition = "cloudy";
  else condition = "clear";
  return {
    date: dateKey,
    season,
    condition,
    temperatureC: Math.round((seasonBase + (tempRoll - 0.5) * 12) * 10) / 10,
    rainMm: Math.round(rainMm * 10) / 10,
    source: "simulated"
  };
}

function addChronicle(
  state: GardenState,
  entry: Omit<ChronicleEntry, "id" | "at" | "gardenDay">,
  gardenDay = Math.floor(state.simulatedDays)
): void {
  state.chronicle.push({
    id: randomUUID(),
    at: isoAtGardenDay(state, gardenDay),
    gardenDay,
    ...entry
  });
}

function addMilestone(
  state: GardenState,
  id: string,
  title: string,
  description: string,
  icon: string,
  gardenDay: number
): boolean {
  if (state.milestones.some((milestone) => milestone.id === id)) return false;
  const milestone: Milestone = { id, unlockedAt: isoAtGardenDay(state, gardenDay), title, description };
  state.milestones.push(milestone);
  addChronicle(state, { kind: "milestone", title, text: description, icon }, gardenDay);
  return true;
}

function desiredStage(plant: Plant, season: Season): PlantStage {
  const species = SPECIES[plant.species];
  if (plant.ageDays < species.daysToSprout || plant.growth < species.daysToSprout * 0.55) return "seed";
  if (plant.ageDays < species.daysToBud * 0.48) return "sprout";
  if (plant.ageDays < species.daysToBud || plant.growth < species.daysToBud * 0.72) return "young";
  if (plant.ageDays < species.daysToMature || plant.growth < species.daysToMature * 0.78) return "budding";
  if (!species.preferredSeasons.includes(season)) return "resting";
  return plant.bloomCount === 0 ? "blooming" : "mature";
}

function displayPlant(plant: Plant): string {
  return plant.nickname ? `${plant.nickname} the ${SPECIES[plant.species].name}` : SPECIES[plant.species].name;
}

function advancePlant(
  state: GardenState,
  plant: Plant,
  weather: WeatherDay,
  gardenDay: number,
  summary: AdvanceSummary
): void {
  const species = SPECIES[plant.species];
  ensurePlantPhenotype(state, plant);
  const moistureFit = 1 - Math.min(1, Math.abs(state.soilMoisture - plant.phenotype.waterNeed) / 75);
  const seasonalFit = species.preferredSeasons.includes(weather.season) ? 1 : 0.48;
  const healthFit = 0.55 + plant.health / 220;
  const growthGain = (0.35 + moistureFit * 0.45) * seasonalFit * healthFit * plant.phenotype.growthRate;
  plant.ageDays += 1;
  plant.growth = Math.round((plant.growth + growthGain) * 100) / 100;

  const harshness = weather.condition === "frost" && !species.preferredSeasons.includes("winter") ? 2.4 : 0;
  const moistureStress = Math.max(0, Math.abs(state.soilMoisture - plant.phenotype.waterNeed) - 34) / 22;
  const recovery = moistureStress === 0 ? 0.45 + plant.phenotype.resilience / 400 : 0;
  plant.health = clamp(plant.health + recovery - moistureStress - harshness, 35, 100);

  const before = plant.stage;
  const next = desiredStage(plant, weather.season);
  plant.stage = next;
  if (before === "seed" && next === "sprout") {
    const name = displayPlant(plant);
    summary.sprouts.push(name);
    addChronicle(
      state,
      { kind: "growth", title: `${name} emerged`, text: "A new green shape appeared above the soil.", icon: "⌁" },
      gardenDay
    );
    addMilestone(state, "first-sprout", "First green", "The garden raised its first sprout.", "⌁", gardenDay);
  }

  const bloomReady = next === "blooming" || next === "mature";
  const daysSinceBloom = gardenDay - (plant.lastBloomGardenDay ?? -999);
  const bloomInterval = 24 + Math.floor(randomFor(state.seed, `${plant.id}:interval`) * 24);
  if (bloomReady && plant.health >= 48 && daysSinceBloom >= bloomInterval) {
    plant.stage = "blooming";
    plant.bloomCount += 1;
    plant.lastBloomGardenDay = gardenDay;
    plant.lastBloomAt = isoAtGardenDay(state, gardenDay);
    const name = displayPlant(plant);
    summary.blooms.push(name);
    addChronicle(
      state,
      {
        kind: "bloom",
        title: `${name} bloomed`,
        text: `Its ${plant.phenotype.colorName}${plant.phenotype.pattern === "solid" ? "" : ` ${plant.phenotype.pattern}`} petals opened in the ${weather.condition} light${plant.phenotype.fragrance === "none" ? "." : `, carrying a ${plant.phenotype.fragrance} scent.`}`,
        icon: species.emoji
      },
      gardenDay
    );
    addMilestone(state, "first-bloom", "First bloom", "The first flower opened without being hurried.", "✦", gardenDay);
  }
}

function maybeCreateEvent(state: GardenState, day: number, weather: WeatherDay, summary: AdvanceSummary): void {
  if (state.events.filter((event) => !event.acknowledged && event.expiresAtGardenDay >= day).length >= 3) return;
  const chance = 0.012 + state.biodiversity / 10_000;
  if (randomFor(state.seed, `event:${day}`) > chance) return;
  const candidates: Array<Omit<GardenEvent, "id" | "appearedAt" | "expiresAtGardenDay" | "acknowledged">> = [
    {
      type: "mushrooms",
      title: "A ring of small mushrooms",
      description: "They appeared in the dampest corner and will fade naturally after a while."
    },
    {
      type: "fireflies",
      title: "Fireflies at dusk",
      description: "A handful of quiet lights drifted between the leaves."
    },
    { type: "moth", title: "A pale moth", description: "It rested beneath a flower and continued on before dawn." },
    { type: "bird", title: "A visiting bird", description: "It left a tiny unfamiliar seed beside the path." },
    {
      type: "soft_rain",
      title: "A very soft rain",
      description: "The shower was barely audible, but the whole garden noticed."
    }
  ];
  if (state.plants.length < MAX_PLANTS) {
    candidates.push({
      type: "gift_seed",
      title: "A wind-carried seed",
      description: "It may settle on its own. Nothing needs to be done."
    });
  }
  const chosen = pick(candidates, randomFor(state.seed, `event-kind:${day}`));
  const event: GardenEvent = {
    id: randomUUID(),
    appearedAt: isoAtGardenDay(state, day),
    expiresAtGardenDay: day + 8,
    acknowledged: false,
    ...chosen
  };
  state.events.push(event);
  summary.discoveries.push(chosen.title);
  addChronicle(state, { kind: "discovery", title: chosen.title, text: chosen.description, icon: "✧" }, day);

  if (chosen.type === "gift_seed" && randomFor(state.seed, `event-seed:${day}`) < 0.72) {
    const species = pick(SPECIES_LIST, randomFor(state.seed, `event-species:${day}`));
    state.plants.push(makePlant(state, species.id, day, "wind", 1));
  }
  if (["fireflies", "moth", "bird"].includes(chosen.type)) state.biodiversity = clamp(state.biodiversity + 2);
  if (weather.rainMm > 0) state.tranquility = clamp(state.tranquility + 0.6);
}

function maybeSelfSeed(state: GardenState, day: number): void {
  if (state.plants.length >= MAX_PLANTS) return;
  const parents = state.plants.filter((plant) => plant.bloomCount > 0 && plant.health > 55);
  for (const parent of parents) {
    const chance = 0.0007 + state.biodiversity / 80_000;
    if (randomFor(state.seed, `self-seed:${parent.id}:${day}`) < chance) {
      createSelfSeededPlant(state, parent, day);
      addChronicle(
        state,
        {
          kind: "growth",
          title: `${SPECIES[parent.species].name} scattered seed`,
          text: "A second generation found its own place in the soil.",
          icon: "·"
        },
        day
      );
      break;
    }
  }
}

export function createSelfSeededPlant(
  state: GardenState,
  parent: Plant,
  gardenDay = Math.floor(state.simulatedDays)
): Plant {
  if (!state.plants.includes(parent)) throw new Error("A parent plant must belong to this garden.");
  if (state.plants.length >= MAX_PLANTS) throw new Error("The garden is full enough to grow on its own for now.");
  ensurePlantPhenotype(state, parent);
  const child = makePlant(state, parent.species, gardenDay, "self-seeded", parent.generation + 1, undefined, undefined, parent);
  state.plants.push(child);
  return child;
}

function updateMilestones(state: GardenState, day: number): void {
  if (day >= 90) {
    addMilestone(
      state,
      "first-chapter",
      "The first chapter",
      "A full garden season has left its shape here. Florii continues beyond it.",
      "❋",
      day
    );
  }
  if (day >= 365) addMilestone(state, "garden-year", "A garden year", "The garden has held a full year of weather.", "◌", day);
  if (state.plants.some((plant) => plant.generation >= 2)) {
    addMilestone(state, "second-generation", "Roots and echoes", "A second generation grew from the first.", "⌁", day);
  }
  if (state.biodiversity >= 55) {
    addMilestone(state, "living-corner", "A living corner", "The garden became a small habitat of its own.", "✧", day);
  }
}

function runDay(state: GardenState, day: number, summary: AdvanceSummary): void {
  const weather = weatherFor(state, day);
  state.weather.push(weather);
  if (state.weather.length > MAX_WEATHER_HISTORY) state.weather.splice(0, state.weather.length - MAX_WEATHER_HISTORY);
  if (weather.rainMm > 0) summary.rainDays += 1;

  const evaporation = Math.max(1.1, 2.2 + weather.temperatureC / 17 + state.plants.length * 0.035);
  const dew = weather.condition === "mist" || weather.condition === "cloudy" ? 2.2 : 0.7;
  state.soilMoisture = clamp(state.soilMoisture - evaporation + dew + weather.rainMm * 1.45);
  state.soilRichness = clamp(state.soilRichness - state.plants.length * 0.012 + 0.025, 25, 100);

  if (weather.season !== state.lastSeason) {
    state.lastSeason = weather.season;
    summary.seasonsChanged.push(weather.season);
    addChronicle(
      state,
      {
        kind: "season",
        title: `${weather.season[0]?.toUpperCase()}${weather.season.slice(1)} arrived`,
        text: "The light shifted, and the garden quietly changed its pace.",
        icon: "◌"
      },
      day
    );
  }

  for (const plant of state.plants) advancePlant(state, plant, weather, day, summary);
  maybeCreateEvent(state, day, weather, summary);
  maybeSelfSeed(state, day);
  state.events = state.events.filter((event) => event.expiresAtGardenDay >= day - 30);
  state.biodiversity = clamp(state.biodiversity + Math.min(0.08, state.plants.length * 0.004));
  state.tranquility = clamp(state.tranquility + 0.03);
  updateMilestones(state, day);
}

export function advanceGarden(state: GardenState, now = new Date()): AdvanceSummary {
  const from = state.lastSimulatedAt;
  const elapsedMs = Math.max(0, now.getTime() - Date.parse(state.lastSimulatedAt));
  const effectiveDays = (elapsedMs / DAY_MS) * MODE_SPEED[state.mode] + state.partialDay;
  const requestedDays = Math.floor(effectiveDays);
  const daysToRun = Math.min(requestedDays, MAX_SIMULATION_DAYS_PER_CALL);
  const summary: AdvanceSummary = {
    from,
    to: now.toISOString(),
    gardenDaysPassed: daysToRun,
    blooms: [],
    sprouts: [],
    discoveries: [],
    seasonsChanged: [],
    rainDays: 0
  };
  for (let offset = 1; offset <= daysToRun; offset += 1) {
    const day = Math.floor(state.simulatedDays) + 1;
    state.simulatedDays = day;
    runDay(state, day, summary);
  }
  state.partialDay = effectiveDays - daysToRun;
  state.lastSimulatedAt = now.toISOString();
  state.updatedAt = now.toISOString();
  return summary;
}

function makePlant(
  state: GardenState,
  species: SpeciesId,
  gardenDay: number,
  origin: Plant["origin"],
  generation: number,
  nickname?: string,
  position?: { x: number; y: number },
  parent?: Plant
): Plant {
  const id = randomUUID();
  const phenotype = createPhenotype(state, id, species, parent?.phenotype);
  const plant: Plant = {
    id,
    species,
    ...(nickname ? { nickname } : {}),
    plantedAt: isoAtGardenDay(state, gardenDay),
    ageDays: 0,
    growth: 0,
    health: 88,
    stage: "seed",
    bloomCount: 0,
    x: position?.x ?? 8 + randomFor(state.seed, `${id}:x`) * 84,
    y: position?.y ?? 12 + randomFor(state.seed, `${id}:y`) * 75,
    generation,
    origin,
    traits: [],
    phenotype
  };
  plant.traits = phenotypeTraits(phenotype, species);
  return plant;
}

export function plantSeed(
  state: GardenState,
  species: SpeciesId,
  options: { nickname?: string; x?: number; y?: number } = {},
  now = new Date()
): Plant {
  advanceGarden(state, now);
  if (state.plants.length >= MAX_PLANTS) throw new Error("The garden is full enough to grow on its own for now.");
  const position =
    options.x === undefined && options.y === undefined
      ? undefined
      : { x: clamp(options.x ?? 50, 2, 98), y: clamp(options.y ?? 50, 4, 94) };
  const plant = makePlant(
    state,
    species,
    Math.floor(state.simulatedDays),
    "planted",
    1,
    options.nickname,
    position
  );
  state.plants.push(plant);
  state.soilMoisture = clamp(state.soilMoisture - 2);
  addChronicle(state, {
    kind: "plant",
    title: `${displayPlant(plant)} was planted`,
    text: "A seed was tucked into the soil. It does not need to be rushed.",
    icon: "·"
  });
  return plant;
}

export function tendGarden(
  state: GardenState,
  action: TendAction,
  options: { targetId?: string; note?: string } = {},
  now = new Date()
): string {
  advanceGarden(state, now);
  const target = options.targetId ? state.plants.find((plant) => plant.id === options.targetId) : undefined;
  if (options.targetId && !target) throw new Error(`No plant with id ${options.targetId} lives here.`);
  let result: string;
  switch (action) {
    case "water":
      state.soilMoisture = clamp(state.soilMoisture + 24);
      result = "Water darkened the soil and settled around the roots.";
      break;
    case "mulch":
      state.soilMoisture = clamp(state.soilMoisture + 10);
      state.soilRichness = clamp(state.soilRichness + 7);
      result = "A soft layer of mulch will help the garden hold water for longer.";
      break;
    case "prune":
      if (!target) throw new Error("Pruning needs a targetId.");
      target.health = clamp(target.health + 8);
      target.growth = Math.max(0, target.growth - 1.5);
      result = `${displayPlant(target)} was gently pruned and has room for new growth.`;
      break;
    case "sing":
      state.tranquility = clamp(state.tranquility + 8);
      result = "The song changed no numbers that mattered, but the garden kept it anyway.";
      break;
    case "observe":
      state.biodiversity = clamp(state.biodiversity + 0.5);
      result = "Nothing was changed. Small movements became easier to notice.";
      break;
    case "leave_wild":
      state.biodiversity = clamp(state.biodiversity + 6);
      state.soilRichness = clamp(state.soilRichness + 2);
      result = "A corner was left untidy on purpose, making room for smaller lives.";
      break;
    case "shelter":
      for (const plant of target ? [target] : state.plants) plant.health = clamp(plant.health + 3);
      result = target ? `${displayPlant(target)} was given a little shelter.` : "The most exposed plants were given a little shelter.";
      break;
  }
  addChronicle(state, {
    kind: "care",
    title: action.replace("_", " "),
    text: options.note ? `${result} ${options.note}` : result,
    icon: "⌁"
  });
  return result;
}

export function writeNote(state: GardenState, text: string, mood = "quiet", now = new Date()): void {
  advanceGarden(state, now);
  addChronicle(state, { kind: "note", title: `A ${mood} note`, text, icon: "✎" });
}

export function renameGarden(state: GardenState, name: string, now = new Date()): void {
  advanceGarden(state, now);
  const before = state.name;
  state.name = name.trim();
  addChronicle(state, { kind: "note", title: `The garden became ${state.name}`, text: `Before this, it was called ${before}.`, icon: "✦" });
}

export function configureGarden(
  state: GardenState,
  changes: { mode?: TimeMode; hemisphere?: Hemisphere },
  now = new Date()
): void {
  advanceGarden(state, now);
  if (changes.mode) state.mode = changes.mode;
  if (changes.hemisphere) {
    state.hemisphere = changes.hemisphere;
    state.lastSeason = seasonFor(new Date(isoAtGardenDay(state, state.simulatedDays)), changes.hemisphere);
  }
  state.lastSimulatedAt = now.toISOString();
  state.partialDay = 0;
  state.updatedAt = now.toISOString();
}

function makeNarrative(state: GardenState, summary: AdvanceSummary, awayDays: number): string {
  const lines: string[] = [];
  if (awayDays >= 1) {
    lines.push(`You were away for ${Math.floor(awayDays)} day${awayDays >= 2 ? "s" : ""}. The garden continued without complaint.`);
  } else if (state.lastVisitedAt) lines.push("You return while the garden is still close to how you left it.");
  else lines.push("This is your first visit. The soil is open and waiting, but not impatient.");

  if (summary.rainDays > 0) lines.push(`Rain visited on ${summary.rainDays} garden day${summary.rainDays === 1 ? "" : "s"}.`);
  if (summary.sprouts.length > 0) lines.push(`${summary.sprouts.join(", ")} ${summary.sprouts.length === 1 ? "has" : "have"} emerged.`);
  if (summary.blooms.length > 0) lines.push(`${summary.blooms.join(", ")} bloomed while time was passing.`);
  if (summary.discoveries.length > 0) lines.push(`Something new: ${summary.discoveries.join("; ")}.`);
  if (state.plants.length === 0) lines.push("There are no planted seeds yet. An empty garden is still a garden beginning.");
  else {
    const blooming = state.plants.filter((plant) => plant.stage === "blooming").length;
    lines.push(`${state.plants.length} plant${state.plants.length === 1 ? " lives" : "s live"} here${blooming ? `, with ${blooming} in bloom` : ""}.`);
  }
  const activeEvents = state.events.filter((event) => !event.acknowledged && event.expiresAtGardenDay >= state.simulatedDays);
  if (activeEvents.length > 0) lines.push(`You notice ${activeEvents.map((event) => event.title.toLowerCase()).join(" and ")}. Nothing demands an immediate response.`);
  return lines.join(" ");
}

export function visitGarden(state: GardenState, now = new Date()): VisitReport {
  const previousVisit = state.lastVisitedAt ? Date.parse(state.lastVisitedAt) : Date.parse(state.createdAt);
  const awayForRealDays = Math.max(0, (now.getTime() - previousVisit) / DAY_MS);
  const summary = advanceGarden(state, now);
  const narrative = makeNarrative(state, summary, awayForRealDays);
  state.lastVisitedAt = now.toISOString();
  state.updatedAt = now.toISOString();
  state.events.forEach((event) => {
    if (event.expiresAtGardenDay >= state.simulatedDays) event.acknowledged = true;
  });
  if (awayForRealDays >= 7) {
    addChronicle(state, {
      kind: "visit",
      title: "A return",
      text: `After ${Math.floor(awayForRealDays)} days away, someone came back to look around.`,
      icon: "◌"
    });
  }
  return { state, summary, awayForRealDays, narrative };
}

export function gardenSnapshot(state: GardenState): Record<string, unknown> {
  state.plants.forEach((plant) => ensurePlantPhenotype(state, plant));
  const latestWeather = state.weather.at(-1) ?? weatherFor(state, Math.max(0, Math.floor(state.simulatedDays)));
  return {
    name: state.name,
    gardenDay: Math.floor(state.simulatedDays),
    mode: state.mode,
    season: latestWeather.season,
    weather: latestWeather,
    weatherSource: {
      selected: state.weatherConfig.source,
      active: latestWeather.source,
      placeName: state.weatherConfig.placeName,
      lastSyncAt: state.weatherConfig.lastSyncAt,
      fallbackReason: state.weatherConfig.lastError
    },
    soil: {
      moisture: Math.round(state.soilMoisture),
      richness: Math.round(state.soilRichness)
    },
    character: {
      biodiversity: Math.round(state.biodiversity),
      tranquility: Math.round(state.tranquility)
    },
    plants: state.plants.map((plant) => ({
      id: plant.id,
      species: plant.species,
      name: displayPlant(plant),
      stage: plant.stage,
      health: Math.round(plant.health),
      ageDays: plant.ageDays,
      blooms: plant.bloomCount,
      position: { x: Math.round(plant.x), y: Math.round(plant.y) },
      generation: plant.generation,
      origin: plant.origin,
      traits: plant.traits,
      phenotype: plant.phenotype
    })),
    milestones: state.milestones,
    recentChronicle: state.chronicle.slice(-8),
    firstChapter: state.milestones.some((milestone) => milestone.id === "first-chapter")
      ? "complete — the garden continues"
      : `${Math.max(0, 90 - Math.floor(state.simulatedDays))} garden days remain`
  };
}
