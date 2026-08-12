export type TimeMode = "real" | "demo" | "test";
export type Hemisphere = "north" | "south";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type PlantStage =
  | "seed"
  | "sprout"
  | "young"
  | "budding"
  | "blooming"
  | "mature"
  | "resting";

export const SPECIES_IDS = [
  "moonbell",
  "starpetal",
  "rainmint",
  "emberbloom",
  "duskfern",
  "cloverlight",
  "snowlace",
  "sunsigh",
  "tideglass",
  "velvethorn",
  "lanternmoss",
  "cloudpoppy"
] as const;

export type SpeciesId = (typeof SPECIES_IDS)[number];

export interface SpeciesDefinition {
  id: SpeciesId;
  name: string;
  emoji: string;
  description: string;
  preferredSeasons: Season[];
  daysToSprout: number;
  daysToBud: number;
  daysToMature: number;
  waterPreference: number;
  resilience: number;
  colors: string[];
}

export interface PlantPhenotype {
  primaryColor: string;
  secondaryColor: string;
  centerColor: string;
  colorName: string;
  pattern: "solid" | "gradient" | "tipped" | "speckled" | "bicolor";
  height: number;
  bloomSize: number;
  growthRate: number;
  waterNeed: number;
  resilience: number;
  fragrance: "none" | "green" | "honey" | "rain" | "citrus" | "night-sweet";
  rarity: "common" | "unusual" | "rare";
}

export interface Plant {
  id: string;
  species: SpeciesId;
  nickname?: string;
  plantedAt: string;
  ageDays: number;
  growth: number;
  health: number;
  stage: PlantStage;
  bloomCount: number;
  lastBloomAt?: string;
  lastBloomGardenDay?: number;
  x: number;
  y: number;
  generation: number;
  origin: "planted" | "wind" | "self-seeded";
  traits: string[];
  phenotype: PlantPhenotype;
}

export interface HerbariumVariant {
  colorName: string;
  pattern: PlantPhenotype["pattern"];
  phenotype: PlantPhenotype;
  firstDiscoveredAt: string;
  firstDiscoveredGardenDay: number;
  examplePlantId: string;
  individualsSeen: number;
}

export interface HerbariumFind {
  plantId: string;
  name: string;
  rarity: PlantPhenotype["rarity"];
  colorName: string;
  pattern: PlantPhenotype["pattern"];
  discoveredAt: string;
  gardenDay: number;
  origin: Plant["origin"];
  generation: number;
}

export interface HerbariumSpecies {
  species: SpeciesId;
  firstDiscoveredAt: string;
  firstDiscoveredGardenDay: number;
  individualsSeen: number;
  variants: HerbariumVariant[];
  notableFinds: HerbariumFind[];
}

export interface Herbarium {
  registeredPlantIds: string[];
  species: HerbariumSpecies[];
}

export interface WeatherDay {
  date: string;
  season: Season;
  condition: "clear" | "cloudy" | "drizzle" | "rain" | "storm" | "mist" | "frost";
  temperatureC: number;
  rainMm: number;
  source: "simulated" | "open-meteo";
}

export interface WeatherConfig {
  source: "simulated" | "open-meteo";
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  lastSyncAt: string | null;
  cachedDays: WeatherDay[];
  lastError: string | null;
}

export type ChronicleKind =
  | "beginning"
  | "visit"
  | "plant"
  | "growth"
  | "bloom"
  | "weather"
  | "wildlife"
  | "discovery"
  | "care"
  | "note"
  | "milestone"
  | "season";

export interface ChronicleEntry {
  id: string;
  at: string;
  gardenDay: number;
  kind: ChronicleKind;
  title: string;
  text: string;
  icon: string;
}

export interface GardenEvent {
  id: string;
  type: "gift_seed" | "mushrooms" | "fireflies" | "moth" | "bird" | "soft_rain";
  appearedAt: string;
  expiresAtGardenDay: number;
  title: string;
  description: string;
  acknowledged: boolean;
}

export interface Milestone {
  id: string;
  unlockedAt: string;
  title: string;
  description: string;
}

export interface GardenState {
  schemaVersion: 1;
  revision: number;
  seed: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastSimulatedAt: string;
  lastVisitedAt: string | null;
  simulatedDays: number;
  partialDay: number;
  mode: TimeMode;
  hemisphere: Hemisphere;
  soilMoisture: number;
  soilRichness: number;
  biodiversity: number;
  tranquility: number;
  plants: Plant[];
  herbarium: Herbarium;
  weather: WeatherDay[];
  weatherConfig: WeatherConfig;
  events: GardenEvent[];
  chronicle: ChronicleEntry[];
  milestones: Milestone[];
  lastSeason: Season;
}

export interface AdvanceSummary {
  from: string;
  to: string;
  gardenDaysPassed: number;
  blooms: string[];
  sprouts: string[];
  discoveries: string[];
  seasonsChanged: Season[];
  rainDays: number;
}

export interface VisitReport {
  state: GardenState;
  summary: AdvanceSummary;
  awayForRealDays: number;
  narrative: string;
}

export type TendAction =
  | "water"
  | "mulch"
  | "prune"
  | "sing"
  | "observe"
  | "leave_wild"
  | "shelter";
