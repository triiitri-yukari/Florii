import type { SpeciesDefinition, SpeciesId } from "./types.js";

export const SPECIES: Record<SpeciesId, SpeciesDefinition> = {
  moonbell: {
    id: "moonbell",
    name: "Moonbell",
    emoji: "◡̈",
    description: "A pale bell flower that opens in quiet evening light.",
    preferredSeasons: ["spring", "autumn"],
    daysToSprout: 5,
    daysToBud: 30,
    daysToMature: 52,
    waterPreference: 58,
    resilience: 72,
    colors: ["#d9d7ff", "#eee9ff", "#b9b5e8"]
  },
  starpetal: {
    id: "starpetal",
    name: "Starpetal",
    emoji: "✦",
    description: "A small many-pointed flower that gathers in bright clusters.",
    preferredSeasons: ["spring", "summer"],
    daysToSprout: 4,
    daysToBud: 24,
    daysToMature: 44,
    waterPreference: 48,
    resilience: 65,
    colors: ["#ffd6e7", "#fff0a8", "#f5b8d1"]
  },
  rainmint: {
    id: "rainmint",
    name: "Rainmint",
    emoji: "⌇",
    description: "Cool green leaves that pearl with water after every shower.",
    preferredSeasons: ["spring", "summer", "autumn"],
    daysToSprout: 3,
    daysToBud: 20,
    daysToMature: 38,
    waterPreference: 72,
    resilience: 82,
    colors: ["#a9dac3", "#c8ead9", "#7fb89c"]
  },
  emberbloom: {
    id: "emberbloom",
    name: "Emberbloom",
    emoji: "✺",
    description: "A warm coral flower that keeps its color through dry afternoons.",
    preferredSeasons: ["summer", "autumn"],
    daysToSprout: 7,
    daysToBud: 36,
    daysToMature: 60,
    waterPreference: 36,
    resilience: 88,
    colors: ["#f0a08d", "#f7c0a7", "#dd796d"]
  },
  duskfern: {
    id: "duskfern",
    name: "Duskfern",
    emoji: "⌁",
    description: "A shade-loving fern whose new fronds unfurl at dusk.",
    preferredSeasons: ["spring", "autumn", "winter"],
    daysToSprout: 8,
    daysToBud: 42,
    daysToMature: 70,
    waterPreference: 65,
    resilience: 92,
    colors: ["#739b86", "#9bb8a4", "#527568"]
  },
  cloverlight: {
    id: "cloverlight",
    name: "Cloverlight",
    emoji: "❋",
    description: "A tiny groundcover that sometimes glows after rain.",
    preferredSeasons: ["spring", "summer", "autumn"],
    daysToSprout: 2,
    daysToBud: 18,
    daysToMature: 32,
    waterPreference: 52,
    resilience: 95,
    colors: ["#cfe58c", "#e3f2ad", "#9fc66b"]
  }
};

export const SPECIES_LIST = Object.values(SPECIES);
