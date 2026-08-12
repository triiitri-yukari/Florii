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

export type SpeciesId =
  | "moonbell"
  | "starpetal"
  | "rainmint"
  | "emberbloom"
  | "duskfern"
  | "cloverlight";

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
