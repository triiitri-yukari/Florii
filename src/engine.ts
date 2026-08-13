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
  cloverlight: ["lime-white", "pale gold", "spring green"],
  snowlace: ["snow-white", "ice-blue", "winter silver"],
  sunsigh: ["sun-gold", "amber", "warm cream"],
  tideglass: ["sea-glass blue", "tidal teal", "foam-white"],
  velvethorn: ["mulberry", "wine-purple", "deep plum"],
  lanternmoss: ["lantern green", "moss-gold", "lichen green"],
  cloudpoppy: ["cloud violet", "mist-pink", "pale sky"]
};

const FRAGRANCES: PlantPhenotype["fragrance"][] = ["none", "green", "honey", "rain", "citrus", "night-sweet"];
const PATTERNS: PlantPhenotype["pattern"][] = ["solid", "gradient", "tipped", "speckled", "bicolor"];
const AUTO_POSITION_CANDIDATES = 256;

interface EventCandidate {
  type: GardenEvent["type"];
  title: string;
  description: string;
  variations?: readonly { title?: string; description: string }[];
  eligible: (state: GardenState, weather: WeatherDay) => boolean;
  biodiversity?: number;
  richness?: number;
  tranquility?: number;
  seedChance?: number;
}

export const EVENT_CATALOG: readonly EventCandidate[] = [
  {
    type: "mushrooms",
    title: "A ring of small mushrooms",
    description: "Small caps appeared in the dampest corner, darkening the soil around them.",
    variations: [
      { title: "Mushrooms after rain", description: "Three pearl-grey caps pushed through the leaf litter before the soil had dried." },
      { title: "A hidden mushroom ring", description: "A loose circle of tiny mushrooms showed beneath the lowest leaves." }
    ],
    eligible: (state) => state.soilMoisture >= 52,
    richness: 1
  },
  {
    type: "fireflies",
    title: "Fireflies at dusk",
    description: "A handful of quiet lights drifted between the leaves.",
    variations: [
      { title: "Low lights at dusk", description: "Small green lights blinked close to the soil, disappearing whenever they crossed a stem." },
      { title: "Fireflies between the stems", description: "Several fireflies traced slow, uneven paths through the darker half of the patch." }
    ],
    eligible: (_state, weather) => weather.season !== "winter",
    biodiversity: 2,
    tranquility: 0.5
  },
  {
    type: "moth",
    title: "A pale moth",
    description: "It rested beneath a flower and continued on before dawn.",
    variations: [
      { title: "A moth under one petal", description: "A cream-coloured moth folded itself beneath an open flower until the air warmed." },
      { title: "Powdered wings", description: "A small moth left a faint dusting on the leaf where it had rested." }
    ],
    eligible: (state) => state.plants.length > 0,
    biodiversity: 2
  },
  {
    type: "bird",
    title: "A visiting bird",
    description: "It paused beside the path and left a tiny unfamiliar seed behind.",
    variations: [
      { title: "A bird at the garden edge", description: "A brown bird searched the loose soil, then flicked a seed from its beak." },
      { title: "Brief wingbeats", description: "A bird landed between two plants, disturbed the mulch, and was gone again." }
    ],
    eligible: (state) => state.plants.length > 0,
    biodiversity: 2,
    seedChance: 0.36
  },
  {
    type: "soft_rain",
    title: "A very soft rain",
    description: "The shower was barely audible, stippling the leaves and exposed soil.",
    variations: [
      { title: "Rain fine as dust", description: "Fine rain silvered the stems without flattening even the smallest flower." },
      { title: "A passing shower", description: "A short shower darkened the earth in scattered patches and left beads under the leaves." }
    ],
    eligible: (_state, weather) => weather.rainMm > 0,
    tranquility: 0.6
  },
  {
    type: "gift_seed",
    title: "A wind-carried seed",
    description: "A seed crossed into the garden on the wind.",
    variations: [
      { title: "A seed in the grass", description: "A papery seed caught at the garden edge after travelling in on a dry gust." },
      { title: "An unexpected seed", description: "A small winged seed settled into an open pocket of soil." }
    ],
    eligible: (state) => state.plants.length < MAX_PLANTS,
    seedChance: 0.72
  },
  {
    type: "ladybird",
    title: "A ladybird on a leaf",
    description: "A red-backed ladybird crossed the veins of a low leaf.",
    variations: [
      { title: "A spotted visitor", description: "A ladybird climbed to the tip of a leaf and opened its wings into the light." },
      { title: "Red among the green", description: "A tiny red shell moved slowly along the underside of a stem." }
    ],
    eligible: (state, weather) => state.plants.length > 0 && weather.season !== "winter",
    biodiversity: 1
  },
  {
    type: "bumblebee",
    title: "A bumblebee among the blooms",
    description: "It moved from flower to flower, dusted with fine gold pollen.",
    variations: [
      { title: "A heavy bumblebee", description: "A bumblebee bent one bloom under its weight before lifting toward the next." },
      { title: "Gold-dusted wings", description: "A low hum travelled across the flowers as a bee worked through the open petals." }
    ],
    eligible: (state, weather) =>
      ["spring", "summer"].includes(weather.season) && state.plants.some((plant) => ["blooming", "mature"].includes(plant.stage)),
    biodiversity: 2
  },
  {
    type: "spiderweb",
    title: "Dew on a spiderweb",
    description: "A fine web between two stems held a row of bright droplets.",
    variations: [
      { title: "A web drawn in dew", description: "Dew revealed a small wheel of silk that had been invisible the day before." },
      { title: "Silver thread between stems", description: "A loose spider thread caught the light and bowed under three clear drops." }
    ],
    eligible: (state, weather) =>
      state.plants.length >= 2 && (["mist", "cloudy"].includes(weather.condition) || state.soilMoisture >= 62),
    biodiversity: 1
  },
  {
    type: "snail",
    title: "A silver snail trail",
    description: "A narrow shining trail curved beneath the lower leaves.",
    variations: [
      { title: "A snail in the wet shade", description: "A small striped snail rested where damp soil met the lowest leaf." },
      { title: "A shining path", description: "A silver line crossed the dark soil and vanished beneath a plant." }
    ],
    eligible: (state, weather) => state.plants.length > 0 && (weather.rainMm > 0 || state.soilMoisture >= 68),
    biodiversity: 1,
    richness: 0.4
  },
  {
    type: "dragonfly",
    title: "A blue dragonfly",
    description: "It balanced on a stem, its wings flashing blue when the light shifted.",
    variations: [
      { title: "A dragonfly at rest", description: "Four glassy wings held still above a wet stem for several minutes." },
      { title: "Blue over the wet leaves", description: "A blue dragonfly made two quick circuits of the patch before settling." }
    ],
    eligible: (state, weather) => state.plants.length > 0 && (weather.rainMm > 0 || state.soilMoisture >= 72),
    biodiversity: 2
  },
  {
    type: "frog",
    title: "A frog beneath the leaves",
    description: "A small frog called once from the wet shade and moved deeper into the patch.",
    variations: [
      { title: "A frog in the mulch", description: "Two bright eyes appeared between damp leaves before the frog slipped out of sight." },
      { title: "One note from the shade", description: "A soft frog call came from beneath the densest plants after the rain." }
    ],
    eligible: (state, weather) => state.plants.length >= 3 && state.biodiversity >= 20 && (weather.rainMm > 0 || state.soilMoisture >= 76),
    biodiversity: 2
  },
  {
    type: "fallen_feather",
    title: "A fallen feather",
    description: "A small barred feather lay caught between the stems.",
    variations: [
      { title: "A feather at the path", description: "A pale feather turned slowly in the grass until a stem held it in place." },
      { title: "A small grey feather", description: "One grey feather had landed point-first in the loose earth." }
    ],
    eligible: (state) => state.plants.length > 0,
    biodiversity: 0.5
  },
  {
    type: "rain_puddle",
    title: "A rain-bright puddle",
    description: "A shallow puddle held an upside-down piece of sky between the plants.",
    variations: [
      { title: "Sky in a puddle", description: "Rain gathered in a low place, reflecting stems that seemed to grow downward." },
      { title: "A temporary pool", description: "A clear puddle formed beside the path, with one petal floating at its edge." }
    ],
    eligible: (_state, weather) => weather.rainMm >= 4,
    tranquility: 0.4
  },
  {
    type: "seed_husks",
    title: "Empty seed husks",
    description: "Several pale husks gathered where a mature stem met the soil.",
    variations: [
      { title: "Husks beneath an old bloom", description: "Dry seed cases rattled softly against the base of a mature plant." },
      { title: "Signs of scattered seed", description: "Split husks and a little chaff had collected in the shelter of the stems." }
    ],
    eligible: (state) => state.plants.some((plant) => plant.bloomCount > 0),
    richness: 0.6
  },
  {
    type: "butterfly",
    title: "A white butterfly",
    description: "It circled the open flowers before settling on a sunlit leaf.",
    variations: [
      { title: "White wings over the flowers", description: "A white butterfly moved through the blooms in a slow, wavering line." },
      { title: "A butterfly in the warm light", description: "Pale wings opened and closed on a leaf above the soil." }
    ],
    eligible: (state, weather) =>
      ["spring", "summer"].includes(weather.season) && state.plants.some((plant) => ["blooming", "mature"].includes(plant.stage)),
    biodiversity: 2
  },
  {
    type: "earthworm_casts",
    title: "Fresh earthworm casts",
    description: "Small dark coils of earth appeared where the soil stayed moist beneath the mulch.",
    variations: [
      { title: "Earth moved overnight", description: "Fine, newly turned soil marked an earthworm's route below the surface." },
      { title: "A living soil", description: "Tiny mounds beside the stems showed where earthworms had worked after rain." }
    ],
    eligible: (state) => state.soilMoisture >= 58 && state.soilRichness >= 42,
    richness: 0.8
  },
  {
    type: "lacewing",
    title: "A green lacewing",
    description: "A lacewing rested under a leaf, its clear wings crossed like two pieces of glass.",
    variations: [
      { title: "Glass wings beneath a leaf", description: "A pale green lacewing stayed motionless in the cool underside of the plant." },
      { title: "A lacewing at dusk", description: "Delicate netted wings flickered once before their owner moved deeper into the stems." }
    ],
    eligible: (state, weather) => state.plants.length >= 2 && weather.season !== "winter",
    biodiversity: 1.5
  },
  {
    type: "cricket",
    title: "A cricket after sunset",
    description: "A cricket called from the garden edge, pausing whenever the leaves shifted.",
    variations: [
      { title: "A hidden cricket", description: "A steady chirp came from somewhere beneath the warmest stones." },
      { title: "Evening rhythm", description: "One cricket set a slow rhythm in the grass beyond the flowers." }
    ],
    eligible: (state, weather) => state.plants.length >= 2 && ["summer", "autumn"].includes(weather.season),
    biodiversity: 1,
    tranquility: 0.4
  },
  {
    type: "petal_drift",
    title: "Petals caught in the grass",
    description: "A few spent petals had fallen together, keeping their colour against the soil.",
    variations: [
      { title: "A small drift of petals", description: "Loose petals gathered on one side of the path after a light breeze." },
      { title: "Colour on the soil", description: "Two fallen petals lay bright and flat beneath the flowering stems." }
    ],
    eligible: (state) => state.plants.some((plant) => plant.bloomCount > 0),
    richness: 0.3,
    tranquility: 0.3
  },
  {
    type: "frost_crystals",
    title: "Frost along the leaf edges",
    description: "Fine crystals traced the smallest leaves and began to melt where the light touched them.",
    variations: [
      { title: "A lace of frost", description: "White frost outlined every serration on the sheltered leaves." },
      { title: "Cold-bright stems", description: "The stems glittered briefly with frost before the garden warmed." }
    ],
    eligible: (state, weather) => state.plants.length > 0 && weather.condition === "frost",
    tranquility: 0.5
  },
  {
    type: "field_mouse",
    title: "A field mouse's narrow path",
    description: "A small tunnel through the grass ended beneath the thickest cluster of stems.",
    variations: [
      { title: "Tracks no wider than a thumb", description: "Tiny prints crossed a bare patch of soil and disappeared under the leaves." },
      { title: "A rustle under the plants", description: "Something mouse-small moved through the mulch, leaving a curved path behind." }
    ],
    eligible: (state) => state.plants.length >= 6 && state.soilRichness >= 45,
    biodiversity: 2
  },
  {
    type: "pollen_dust",
    title: "Pollen on the lower leaves",
    description: "A fine yellow dust had settled beneath the open flowers.",
    variations: [
      { title: "Gold beneath the blooms", description: "Loose pollen marked the leaves below the busiest flowers." },
      { title: "A trace of pollen", description: "One stem wore a soft line of yellow where a visitor had brushed past." }
    ],
    eligible: (state, weather) =>
      weather.condition === "clear" && state.plants.some((plant) => ["blooming", "mature"].includes(plant.stage)),
    biodiversity: 0.5
  },
  {
    type: "beetle_tracks",
    title: "Beetle tracks in soft soil",
    description: "A pair of delicate tracks stitched across the damp earth between two plants.",
    variations: [
      { title: "A small beetle's crossing", description: "A dark beetle pushed through the loose soil and vanished into the mulch." },
      { title: "Fine tracks after rain", description: "Tiny repeated marks crossed the garden where the surface remained soft." }
    ],
    eligible: (state, weather) => state.plants.length >= 2 && (weather.rainMm > 0 || state.soilMoisture >= 62),
    biodiversity: 1,
    richness: 0.3
  }
];

interface AmbientObservation {
  eligible: (state: GardenState, weather: WeatherDay) => boolean;
  text: (state: GardenState, weather: WeatherDay) => string;
}

interface SpeciesObservation {
  eligible: (plant: Plant, weather: WeatherDay) => boolean;
  text: (plant: Plant, weather: WeatherDay) => string;
}

const hasStem = (plant: Plant) => plant.stage !== "seed";
const isBudding = (plant: Plant) => plant.stage === "budding";
const hasFlower = (plant: Plant) => ["blooming", "mature"].includes(plant.stage);
const isWetWeather = (_plant: Plant, weather: WeatherDay) => weather.rainMm > 0 || ["drizzle", "mist"].includes(weather.condition);
const isWetStem = (plant: Plant, weather: WeatherDay) => hasStem(plant) && isWetWeather(plant, weather);
const isWetFlower = (plant: Plant, weather: WeatherDay) => hasFlower(plant) && isWetWeather(plant, weather);
const isWetBudOrFlower = (plant: Plant, weather: WeatherDay) => (isBudding(plant) || hasFlower(plant)) && isWetWeather(plant, weather);

export const SPECIES_OBSERVATIONS: Record<SpeciesId, readonly SpeciesObservation[]> = {
  moonbell: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} keeps its paired leaves close to the upright stem.` },
    { eligible: isBudding, text: (plant) => `${displayPlant(plant)}'s pale bell hangs just over the topmost leaf.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)} holds its bell in a quiet curve, as if saving the light for evening.` },
    { eligible: isWetFlower, text: (plant) => `A clear drop rests beneath ${displayPlant(plant)}'s lowest bell-shaped fold.` }
  ],
  starpetal: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} has set its leaves in a neat ladder up the stem.` },
    { eligible: isBudding, text: (plant) => `The pointed bud on ${displayPlant(plant)} already hints at the flower's many rays.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)} catches the light separately on each narrow petal point.` },
    { eligible: (plant, weather) => hasFlower(plant) && weather.condition === "clear", text: (plant) => `${displayPlant(plant)} draws a small star-shaped shadow across the leaves below.` }
  ],
  rainmint: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} shows a cool, blue-green edge along its newest leaves.` },
    { eligible: isBudding, text: (plant) => `${displayPlant(plant)}'s mint-coloured bud sits between two jagged leaves.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)} keeps a green hush of petals around its small centre.` },
    { eligible: isWetStem, text: (plant) => `Round beads of water have gathered along ${displayPlant(plant)}'s leaf tips.` }
  ],
  emberbloom: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} carries narrow leaves that leave plenty of warm soil visible.` },
    { eligible: isBudding, text: (plant) => `A line of ember colour shows through ${displayPlant(plant)}'s closed bud.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)}'s papery petals keep their warm colour at the driest edge of the patch.` },
    { eligible: (plant, weather) => hasFlower(plant) && weather.condition === "clear", text: (plant) => `The clear light makes ${displayPlant(plant)} look lit from the centre outward.` }
  ],
  duskfern: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)}'s lowest fronds make a small green shelter over the soil.` },
    { eligible: hasStem, text: (plant) => `A new crozier on ${displayPlant(plant)} is still curled tightly at the tip.` },
    { eligible: (plant) => ["young", "budding", "blooming", "mature"].includes(plant.stage), text: (plant) => `One fresh frond on ${displayPlant(plant)} has loosened another turn since it emerged.` },
    { eligible: isWetStem, text: (plant) => `Moisture darkens the midrib of ${displayPlant(plant)}'s newest frond.` }
  ],
  cloverlight: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} stays low enough for its leaves to meet the soil's small shadows.` },
    { eligible: isBudding, text: (plant) => `The tiny bud on ${displayPlant(plant)} rises only a little above its clover-like leaves.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)} makes a close, pale point of light near the ground.` },
    { eligible: isWetStem, text: (plant) => `After the wet weather, ${displayPlant(plant)}'s leaf centres look briefly luminous.` }
  ],
  snowlace: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)}'s fine leaves hold their shape without crowding the stem.` },
    { eligible: isBudding, text: (plant) => `${displayPlant(plant)}'s pale bud is finely divided along its outer seam.` },
    { eligible: hasFlower, text: (plant) => `Each narrow edge of ${displayPlant(plant)} gives the flower its lace-like outline.` },
    { eligible: (plant, weather) => hasFlower(plant) && weather.condition === "frost", text: (plant) => `Frost continues the pattern of ${displayPlant(plant)} beyond the ends of its petals.` }
  ],
  sunsigh: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} spaces its sturdy leaves along the sunward side of the stem.` },
    { eligible: isBudding, text: (plant) => `${displayPlant(plant)}'s bud has begun to tilt toward the broadest light.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)} spreads its papery rays around a warm, round centre.` },
    { eligible: (plant, weather) => hasFlower(plant) && weather.condition === "clear", text: (plant) => `${displayPlant(plant)} has turned its open face toward the clearest part of the sky.` }
  ],
  tideglass: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)}'s long leaves angle away from the stem like narrow green currents.` },
    { eligible: isBudding, text: (plant) => `The blue-green bud on ${displayPlant(plant)} is almost translucent at its tip.` },
    { eligible: hasFlower, text: (plant) => `Light passes softly through the outer petals of ${displayPlant(plant)}.` },
    { eligible: isWetFlower, text: (plant) => `Droplets line ${displayPlant(plant)}'s petal edges like a second clear outline.` }
  ],
  velvethorn: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)}'s small leaves show a thin silver line around their darker green.` },
    { eligible: isBudding, text: (plant) => `${displayPlant(plant)} holds a dark bud above its silver-edged leaves.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)}'s velvet petals absorb the light, leaving the centre brighter by contrast.` },
    { eligible: (plant, weather) => hasFlower(plant) && weather.condition === "cloudy", text: (plant) => `Cloud cover deepens ${displayPlant(plant)}'s bloom from plum to near-shadow.` }
  ],
  lanternmoss: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)} grows close to the dampest side of its slender stem.` },
    { eligible: isBudding, text: (plant) => `A row of tiny knobs rims the closed cup of ${displayPlant(plant)}.` },
    { eligible: hasFlower, text: (plant) => `${displayPlant(plant)}'s little cup holds a muted gold-green glow above the leaves.` },
    { eligible: isWetBudOrFlower, text: (plant) => `The damp air deepens the mossy green around ${displayPlant(plant)}'s cup.` }
  ],
  cloudpoppy: [
    { eligible: hasStem, text: (plant) => `${displayPlant(plant)}'s broad leaves gather loosely around its straight stem.` },
    { eligible: isBudding, text: (plant) => `${displayPlant(plant)}'s rounded bud is wrapped in several soft overlapping folds.` },
    { eligible: hasFlower, text: (plant) => `The wide petals of ${displayPlant(plant)} shift slightly even while the other stems are still.` },
    { eligible: isWetFlower, text: (plant) => `Rain makes the outer folds of ${displayPlant(plant)} look almost transparent.` }
  ]
};

export const AMBIENT_OBSERVATIONS: readonly AmbientObservation[] = [
  { eligible: (state) => state.plants.length === 0, text: () => "The open soil shows a scatter of pale grit and last night's shallow marks." },
  { eligible: (state) => state.plants.length === 0, text: () => "A loose leaf has stopped near the centre of the unplanted patch." },
  { eligible: (state) => state.plants.length === 0, text: () => "The bare earth is darker in the hollows and dry along the path." },
  { eligible: (state) => state.plants.length > 0, text: () => "The stems lean in slightly different directions, each following its own patch of light." },
  { eligible: (state) => state.plants.length > 0, text: () => "New and old leaves make several distinct shades of green across the patch." },
  { eligible: (state) => state.plants.length > 0, text: () => "The lowest leaves hold the garden's finest dust along their edges." },
  {
    eligible: (state) => state.plants.some((plant) => plant.stage === "seed"),
    text: (state) => `${displayPlant(state.plants.find((plant) => plant.stage === "seed") as Plant)} is still a hidden shape beneath the soil.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.stage === "sprout"),
    text: (state) => `${displayPlant(state.plants.find((plant) => plant.stage === "sprout") as Plant)} has opened two small leaves close to the ground.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.stage === "young"),
    text: (state) => `${displayPlant(state.plants.find((plant) => plant.stage === "young") as Plant)} is putting more distance between its newest leaves.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.stage === "budding"),
    text: (state) => `The bud on ${displayPlant(state.plants.find((plant) => plant.stage === "budding") as Plant)} is showing a narrow seam of colour.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.stage === "blooming"),
    text: (state) => {
      const plant = state.plants.find((candidate) => candidate.stage === "blooming") as Plant;
      return `${displayPlant(plant)} is open in ${plant.phenotype.colorName}${plant.phenotype.pattern === "solid" ? "" : `, with ${plant.phenotype.pattern} petals`}.`;
    }
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.bloomCount >= 2),
    text: (state) => `${displayPlant(state.plants.find((plant) => plant.bloomCount >= 2) as Plant)} carries the small asymmetries of having flowered before.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.generation >= 2),
    text: (state) => `${displayPlant(state.plants.find((plant) => plant.generation >= 2) as Plant)} belongs to a generation born inside this garden.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.origin === "wind"),
    text: (state) => `${displayPlant(state.plants.find((plant) => plant.origin === "wind") as Plant)} occupies the place the wind chose for it.`
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.phenotype.rarity !== "common"),
    text: (state) => {
      const plant = state.plants.find((candidate) => candidate.phenotype.rarity !== "common") as Plant;
      return `${displayPlant(plant)} shows its ${plant.phenotype.pattern} colouring most clearly from this angle.`;
    }
  },
  {
    eligible: (state) => state.plants.some((plant) => plant.phenotype.fragrance !== "none" && ["blooming", "mature"].includes(plant.stage)),
    text: (state) => {
      const plant = state.plants.find((candidate) => candidate.phenotype.fragrance !== "none" && ["blooming", "mature"].includes(candidate.stage)) as Plant;
      return `Close to ${displayPlant(plant)}, the air carries a ${plant.phenotype.fragrance} scent.`;
    }
  },
  { eligible: (state) => state.soilMoisture >= 78, text: () => "The soil gives slightly under the leaf litter, still holding plenty of water." },
  { eligible: (state) => state.soilMoisture >= 68, text: () => "Moisture has gathered in a dark line along the lowest edge of the patch." },
  { eligible: (state) => state.soilMoisture <= 34, text: () => "Fine cracks have begun to map the most exposed soil." },
  { eligible: (state) => state.soilMoisture <= 44, text: () => "The upper soil is pale and loose where the light reaches it." },
  { eligible: (state) => state.soilRichness >= 68, text: () => "The mulch is breaking down into a dark, crumbly layer around the stems." },
  { eligible: (state) => state.soilRichness <= 38, text: () => "The soil between the plants looks thin, with small stones showing at the surface." },
  { eligible: (_state, weather) => weather.condition === "drizzle", text: () => "Drizzle hangs from the leaf tips in a row of uneven beads." },
  { eligible: (_state, weather) => weather.condition === "rain", text: () => "Rain has pressed the loose soil smooth around the stems." },
  { eligible: (_state, weather) => weather.condition === "storm", text: () => "The heavier weather has turned several leaves to show their paler undersides." },
  { eligible: (_state, weather) => weather.condition === "mist", text: () => "Mist softens the far edge of the garden and beads along every fine hair." },
  { eligible: (_state, weather) => weather.condition === "frost", text: () => "The shaded edges keep a white trace of frost after the open soil has cleared." },
  { eligible: (_state, weather) => weather.condition === "clear", text: () => "Clear light separates the stems into thin shadows across the soil." },
  { eligible: (_state, weather) => weather.condition === "cloudy", text: () => "Under the cloud cover, the flower colours look cooler and more even." },
  { eligible: (_state, weather) => weather.season === "spring", text: () => "Spring growth is brightest at the tips, where the leaves are still soft." },
  { eligible: (_state, weather) => weather.season === "summer", text: () => "The summer light reaches deep between the stems before the shadows close again." },
  { eligible: (_state, weather) => weather.season === "autumn", text: () => "A few autumn-coloured fragments have collected against the greener plants." },
  { eligible: (_state, weather) => weather.season === "winter", text: () => "Winter has sharpened the outlines of stems, soil, and fallen leaves." },
  { eligible: (state) => state.plants.length >= 12, text: () => "The denser part of the garden now makes its own small pocket of shade." },
  { eligible: (state) => state.plants.length >= 24, text: () => "Several plants meet leaf to leaf, turning the open patch into narrow paths." },
  { eligible: (state) => state.plants.length >= 1 && state.plants.length <= 3, text: () => "Most of the soil remains open around the few planted residents." }
];

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

function placementDistance(left: { x: number; y: number }, right: { x: number; y: number }): number {
  const horizontal = (left.x - right.x) / 8;
  const vertical = (left.y - right.y) / 12;
  return Math.hypot(horizontal, vertical);
}

function chooseOpenPosition(state: GardenState, id: string): { x: number; y: number } {
  let best = {
    x: 8 + randomFor(state.seed, `${id}:x:0`) * 84,
    y: 12 + randomFor(state.seed, `${id}:y:0`) * 75
  };
  let bestDistance = -1;
  for (let index = 0; index < AUTO_POSITION_CANDIDATES; index += 1) {
    const candidate = {
      x: 8 + randomFor(state.seed, `${id}:x:${index}`) * 84,
      y: 12 + randomFor(state.seed, `${id}:y:${index}`) * 75
    };
    const nearest = state.plants.reduce(
      (distance, plant) => Math.min(distance, placementDistance(candidate, plant)),
      Number.POSITIVE_INFINITY
    );
    if (nearest > bestDistance) {
      best = candidate;
      bestDistance = nearest;
    }
  }
  return best;
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
    herbarium: { registeredPlantIds: [], species: [], archivedPlants: [] },
    weather: [],
    weatherConfig: {
      source: "simulated",
      latitude: null,
      longitude: null,
      placeName: null,
      timezone: null,
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

function desiredStage(plant: Plant): PlantStage {
  const species = SPECIES[plant.species];
  if (plant.ageDays < species.daysToSprout || plant.growth < species.daysToSprout * 0.55) return "seed";
  if (plant.ageDays < species.daysToBud * 0.48) return "sprout";
  if (plant.ageDays < species.daysToBud || plant.growth < species.daysToBud * 0.72) return "young";
  const individualMaturityAge = Math.ceil(species.daysToMature / plant.phenotype.growthRate);
  if (plant.ageDays < individualMaturityAge || plant.growth < species.daysToMature * 0.5) return "budding";
  return plant.bloomCount === 0 ? "blooming" : "mature";
}

function displayPlant(plant: Plant): string {
  return plant.nickname ? `${plant.nickname} the ${SPECIES[plant.species].name}` : SPECIES[plant.species].name;
}

function ensureHerbariumShape(state: GardenState): boolean {
  let changed = false;
  const legacyState = state as GardenState & { herbarium?: GardenState["herbarium"] };
  if (!legacyState.herbarium || !Array.isArray(legacyState.herbarium.species)) {
    state.herbarium = { registeredPlantIds: [], species: [], archivedPlants: [] };
    return true;
  }
  if (!Array.isArray(state.herbarium.registeredPlantIds)) {
    state.herbarium.registeredPlantIds = [];
    changed = true;
  }
  if (!Array.isArray(state.herbarium.archivedPlants)) {
    state.herbarium.archivedPlants = [];
    changed = true;
  }
  return changed;
}

function recordHerbariumDiscovery(state: GardenState, plant: Plant, gardenDay: number): boolean {
  let changed = ensureHerbariumShape(state);
  if (state.herbarium.registeredPlantIds.includes(plant.id)) return changed;

  let speciesRecord = state.herbarium.species.find((entry) => entry.species === plant.species);
  if (!speciesRecord) {
    speciesRecord = {
      species: plant.species,
      firstDiscoveredAt: plant.plantedAt,
      firstDiscoveredGardenDay: gardenDay,
      individualsSeen: 0,
      variants: [],
      notableFinds: []
    };
    state.herbarium.species.push(speciesRecord);
  }

  speciesRecord.individualsSeen += 1;
  const variant = speciesRecord.variants.find(
    (entry) => entry.colorName === plant.phenotype.colorName && entry.pattern === plant.phenotype.pattern
  );
  if (variant) variant.individualsSeen += 1;
  else {
    speciesRecord.variants.push({
      colorName: plant.phenotype.colorName,
      pattern: plant.phenotype.pattern,
      phenotype: structuredClone(plant.phenotype),
      firstDiscoveredAt: plant.plantedAt,
      firstDiscoveredGardenDay: gardenDay,
      examplePlantId: plant.id,
      individualsSeen: 1
    });
  }

  if (plant.phenotype.rarity !== "common") {
    speciesRecord.notableFinds.push({
      plantId: plant.id,
      name: displayPlant(plant),
      rarity: plant.phenotype.rarity,
      colorName: plant.phenotype.colorName,
      pattern: plant.phenotype.pattern,
      discoveredAt: plant.plantedAt,
      gardenDay,
      origin: plant.origin,
      generation: plant.generation
    });
  }
  state.herbarium.registeredPlantIds.push(plant.id);
  return true;
}

export function ensureHerbarium(state: GardenState): boolean {
  let changed = ensureHerbariumShape(state);
  for (const plant of state.plants) {
    ensurePlantPhenotype(state, plant);
    const gardenDay = Math.max(0, Math.round((Date.parse(plant.plantedAt) - Date.parse(state.createdAt)) / DAY_MS));
    if (recordHerbariumDiscovery(state, plant, gardenDay)) changed = true;
  }
  return changed;
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
  const seasonalFit = species.preferredSeasons.includes(weather.season) ? 1 : 0.78;
  const healthFit = 0.55 + plant.health / 220;
  const growthGain = (0.35 + moistureFit * 0.45) * seasonalFit * healthFit * plant.phenotype.growthRate;
  plant.ageDays += 1;
  plant.growth = Math.round((plant.growth + growthGain) * 100) / 100;

  const harshness = weather.condition === "frost" && !species.preferredSeasons.includes("winter") ? 2.4 : 0;
  const moistureStress = Math.max(0, Math.abs(state.soilMoisture - plant.phenotype.waterNeed) - 34) / 22;
  const recovery = moistureStress === 0 ? 0.45 + plant.phenotype.resilience / 400 : 0;
  plant.health = clamp(plant.health + recovery - moistureStress - harshness, 35, 100);

  const before = plant.stage;
  const next = desiredStage(plant);
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
  if (bloomReady && daysSinceBloom >= bloomInterval) {
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
    addMilestone(state, "first-bloom", "First bloom", "The garden's first flower opened.", "✦", gardenDay);
  }
}

function maybeCreateEvent(state: GardenState, day: number, weather: WeatherDay, summary: AdvanceSummary): void {
  if (state.events.filter((event) => !event.acknowledged && event.expiresAtGardenDay >= day).length >= 3) return;
  const chance = 0.022 + state.biodiversity / 8_000;
  if (randomFor(state.seed, `event:${day}`) > chance) return;
  const eligible = EVENT_CATALOG.filter((candidate) => candidate.eligible(state, weather));
  const recentlySeen = new Set(
    state.events.filter((event) => event.expiresAtGardenDay >= day - 22).map((event) => event.type)
  );
  const fresh = eligible.filter((candidate) => !recentlySeen.has(candidate.type));
  const candidates = fresh.length > 0 ? fresh : eligible;
  if (candidates.length === 0) return;
  const chosen = pick(candidates, randomFor(state.seed, `event-kind:${day}`));
  const rendering = pick(
    [
      { title: chosen.title, description: chosen.description },
      ...(chosen.variations ?? []).map((variation) => ({
        title: variation.title ?? chosen.title,
        description: variation.description
      }))
    ],
    randomFor(state.seed, `event-words:${day}:${chosen.type}`)
  );
  const event: GardenEvent = {
    id: randomUUID(),
    appearedAt: isoAtGardenDay(state, day),
    expiresAtGardenDay: day + 8,
    acknowledged: false,
    type: chosen.type,
    title: rendering.title,
    description: rendering.description
  };
  state.events.push(event);
  summary.discoveries.push(rendering.title);
  addChronicle(state, { kind: "discovery", title: rendering.title, text: rendering.description, icon: "✧" }, day);

  if (chosen.seedChance && state.plants.length < MAX_PLANTS && randomFor(state.seed, `event-seed:${day}`) < chosen.seedChance) {
    const species = pick(SPECIES_LIST, randomFor(state.seed, `event-species:${day}`));
    state.plants.push(makePlant(state, species.id, day, "wind", 1));
  }
  state.biodiversity = clamp(state.biodiversity + (chosen.biodiversity ?? 0));
  state.soilRichness = clamp(state.soilRichness + (chosen.richness ?? 0), 25, 100);
  state.tranquility = clamp(state.tranquility + (chosen.tranquility ?? 0));
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
  if (state.plants.length >= MAX_PLANTS) throw new Error("The living patch has reached its 48-plant capacity.");
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
  const resolvedPosition = position ?? chooseOpenPosition(state, id);
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
    x: resolvedPosition.x,
    y: resolvedPosition.y,
    generation,
    origin,
    traits: [],
    phenotype
  };
  plant.traits = phenotypeTraits(phenotype, species);
  recordHerbariumDiscovery(state, plant, gardenDay);
  return plant;
}

export function plantSeed(
  state: GardenState,
  species: SpeciesId,
  options: { nickname?: string; x?: number; y?: number } = {},
  now = new Date()
): Plant {
  advanceGarden(state, now);
  if (state.plants.length >= MAX_PLANTS) throw new Error("The living patch has reached its 48-plant capacity.");
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
    text: "A seed was tucked into the soil.",
    icon: "·"
  });
  return plant;
}

export function transplantPlant(
  state: GardenState,
  targetId: string,
  options: { note?: string } = {},
  now = new Date()
): GardenState["herbarium"]["archivedPlants"][number] {
  advanceGarden(state, now);
  const index = state.plants.findIndex((plant) => plant.id === targetId);
  if (index < 0) throw new Error(`No living plant with id ${targetId} lives here.`);
  const plant = state.plants[index];
  if (!plant) throw new Error(`No living plant with id ${targetId} lives here.`);
  ensurePlantPhenotype(state, plant);
  ensureHerbarium(state);
  if (state.herbarium.archivedPlants.some((entry) => entry.plant.id === plant.id)) {
    throw new Error(`${displayPlant(plant)} is already preserved in the herbarium archive.`);
  }

  const archived = {
    plant: structuredClone(plant),
    name: displayPlant(plant),
    archivedAt: now.toISOString(),
    archivedGardenDay: Math.floor(state.simulatedDays),
    ...(options.note?.trim() ? { note: options.note.trim() } : {})
  };
  state.herbarium.archivedPlants.push(archived);
  state.plants.splice(index, 1);
  addChronicle(state, {
    kind: "care",
    title: `${archived.name} was transplanted`,
    text: options.note?.trim()
      ? `It left the living patch for a new place. ${options.note.trim()}`
      : "It left the living patch for a new place, while its story stayed in the herbarium.",
    icon: "↟"
  });
  return archived;
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
  const moistureBefore = state.soilMoisture;
  const careChoice = (choices: readonly string[]) =>
    pick(choices, randomFor(state.seed, `care:${action}:${state.chronicle.length}:${now.toISOString()}:${target?.id ?? "whole-garden"}`));
  let result: string;
  switch (action) {
    case "water":
      state.soilMoisture = clamp(state.soilMoisture + 24);
      result = careChoice(
        moistureBefore < 38
          ? [
              "The dry surface drank quickly, and dark water spread outward around the roots.",
              "Water vanished into the pale soil before gathering more slowly around the roots.",
              "The first pour disappeared at once; the next settled into the soil around the roots."
            ]
          : [
              "Water darkened the soil and settled around the roots.",
              "A thin sheen crossed the soil before sinking evenly toward the roots.",
              "Water followed the smallest hollows and soaked into the roots' darker ground."
            ]
      );
      break;
    case "mulch":
      state.soilMoisture = clamp(state.soilMoisture + 10);
      state.soilRichness = clamp(state.soilRichness + 7);
      result = careChoice([
        "A soft layer of mulch now lies between the stems, holding the darker soil beneath it.",
        "Dry leaves and fine bark were tucked into the open spaces around the plants.",
        "Fresh mulch softened the bare ground and gathered into the garden's shallow hollows."
      ]);
      break;
    case "prune":
      if (!target) throw new Error("Pruning needs a targetId.");
      target.health = clamp(target.health + 8);
      target.growth = Math.max(0, target.growth - 1.5);
      result = careChoice([
        `${displayPlant(target)} was gently pruned, opening a little space around the newest growth.`,
        `A tired piece was lifted from ${displayPlant(target)}, leaving the stem clearer.`,
        `${displayPlant(target)} now has a cleaner outline where the crowded growth was trimmed.`
      ]);
      break;
    case "sing":
      state.tranquility = clamp(state.tranquility + 8);
      result = careChoice([
        "The song moved through the taller stems and faded into the grass.",
        "For a while, the garden held a melody alongside the weather.",
        "The last note lingered between the leaves after the voice had stopped."
      ]);
      break;
    case "observe":
      state.biodiversity = clamp(state.biodiversity + 0.5);
      result = careChoice([
        "A pause beside the patch revealed fine tracks between the lower leaves.",
        "A closer look found several greens that had seemed like one from the path.",
        "Standing still made the smallest movements between the stems easier to follow."
      ]);
      break;
    case "leave_wild":
      state.biodiversity = clamp(state.biodiversity + 6);
      state.soilRichness = clamp(state.soilRichness + 2);
      result = careChoice([
        "A corner was left untidy, with stems and leaf litter making room for smaller lives.",
        "One edge of the patch now keeps its fallen leaves and uncut growth.",
        "The wild corner gained a little tangle of cover close to the soil."
      ]);
      break;
    case "shelter":
      for (const plant of target ? [target] : state.plants) plant.health = clamp(plant.health + 3);
      result = careChoice(
        target
          ? [
              `${displayPlant(target)} was given a little shelter on its exposed side.`,
              `A small screen now breaks the open weather around ${displayPlant(target)}.`,
              `${displayPlant(target)} stands in a quieter pocket behind the new shelter.`
            ]
          : [
              "The most exposed plants were given a little shelter.",
              "A low screen now takes the open edge off the weather across the patch.",
              "The outer stems gained a sheltered side without losing the light."
            ]
      );
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

function visitChoice<T>(state: GardenState, now: Date, key: string, choices: readonly T[]): T {
  return pick(choices, randomFor(state.seed, `visit:${Math.floor(state.simulatedDays)}:${state.revision}:${now.toISOString()}:${key}`));
}

function namesWithAnd(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

function makeNarrative(state: GardenState, summary: AdvanceSummary, awayDays: number, now: Date): string {
  const lines: string[] = [];
  const latestWeather = state.weather.at(-1) ?? weatherFor(state, Math.max(0, Math.floor(state.simulatedDays)));
  const activeEvents = state.events.filter((event) => !event.acknowledged && event.expiresAtGardenDay >= state.simulatedDays);
  if (awayDays >= 1) {
    const days = Math.floor(awayDays);
    lines.push(visitChoice(state, now, "arrival", [
      `${days} real day${days === 1 ? " has" : "s have"} passed since the last visit.`,
      `The previous visit was ${days} real day${days === 1 ? "" : "s"} ago.`,
      `The garden has had ${days} real day${days === 1 ? "" : "s"} of weather since it was last visited.`
    ]));
  } else if (state.lastVisitedAt) {
    lines.push(visitChoice(state, now, "arrival", [
      "You return on the same real day as the previous visit.",
      "This is another look at the garden on the same real day.",
      "The light still belongs to the same real day as the last visit."
    ]));
  } else {
    lines.push(visitChoice(state, now, "arrival", [
      "This is the first visit.",
      "The garden opens on its first visit.",
      "This is the first recorded look across the patch."
    ]));
  }

  if (summary.rainDays > 0) {
    lines.push(visitChoice(state, now, "rain", [
      `Rain visited on ${summary.rainDays} garden day${summary.rainDays === 1 ? "" : "s"}.`,
      `The passing interval included ${summary.rainDays} wet garden day${summary.rainDays === 1 ? "" : "s"}.`,
      `The soil records rain on ${summary.rainDays} garden day${summary.rainDays === 1 ? "" : "s"}.`
    ]));
  }
  if (summary.sprouts.length > 0) {
    const names = namesWithAnd(summary.sprouts);
    lines.push(visitChoice(state, now, "sprouts", [
      `${names} ${summary.sprouts.length === 1 ? "has" : "have"} emerged.`,
      `New green appeared from ${names}.`,
      `${names} ${summary.sprouts.length === 1 ? "is" : "are"} now above the soil.`
    ]));
  }
  if (summary.blooms.length > 0) {
    const names = namesWithAnd(summary.blooms);
    lines.push(visitChoice(state, now, "blooms", [
      `${names} bloomed while time was passing.`,
      `New flowers opened on ${names}.`,
      `${names} reached ${summary.blooms.length === 1 ? "its" : "their"} next bloom.`
    ]));
  }
  if (summary.discoveries.length > 0 && activeEvents.length === 0) {
    lines.push(visitChoice(state, now, "discoveries", [
      `The garden recorded ${namesWithAnd(summary.discoveries).toLowerCase()}.`,
      `A new detail entered the chronicle: ${namesWithAnd(summary.discoveries).toLowerCase()}.`,
      `Among the changes was ${namesWithAnd(summary.discoveries).toLowerCase()}.`
    ]));
  }
  if (state.plants.length === 0) {
    lines.push(visitChoice(state, now, "population", [
      "There are no planted seeds yet.",
      "The living patch is still open soil.",
      "No seed has been planted in the patch so far."
    ]));
  }
  else {
    const blooming = state.plants.filter((plant) => plant.stage === "blooming").length;
    const population = state.plants.length === 1 ? "One plant lives" : `${state.plants.length} plants live`;
    lines.push(visitChoice(state, now, "population", [
      `${population} here${blooming ? `, with ${blooming} in bloom` : ""}.`,
      `The living patch holds ${state.plants.length} plant${state.plants.length === 1 ? "" : "s"}${blooming ? `; ${blooming} ${blooming === 1 ? "is" : "are"} flowering` : ""}.`,
      `${state.plants.length} resident${state.plants.length === 1 ? " occupies" : "s occupy"} the patch${blooming ? `, including ${blooming} open bloom${blooming === 1 ? "" : "s"}` : ""}.`
    ]));
  }

  const ambient = AMBIENT_OBSERVATIONS.filter((observation) => observation.eligible(state, latestWeather));
  if (ambient.length > 0) {
    lines.push(visitChoice(state, now, "ambient", ambient).text(state, latestWeather));
  }

  const speciesDetails = state.plants.flatMap((plant) =>
    SPECIES_OBSERVATIONS[plant.species]
      .filter((observation) => observation.eligible(plant, latestWeather))
      .map((observation) => ({ plant, observation }))
  );
  if (speciesDetails.length > 0) {
    const detail = visitChoice(state, now, "species-detail", speciesDetails);
    lines.push(detail.observation.text(detail.plant, latestWeather));
  }

  if (activeEvents.length > 0) {
    lines.push(visitChoice(state, now, "event-intro", [
      "A closer look reveals another change.",
      "One detail stands apart from the ordinary growth.",
      "The garden has added a small scene to its chronicle."
    ]));
    lines.push(...activeEvents.map((event) => `${event.title}: ${event.description}`));
  }
  return lines.join(" ");
}

export function visitGarden(state: GardenState, now = new Date()): VisitReport {
  const previousVisit = state.lastVisitedAt ? Date.parse(state.lastVisitedAt) : Date.parse(state.createdAt);
  const awayForRealDays = Math.max(0, (now.getTime() - previousVisit) / DAY_MS);
  const summary = advanceGarden(state, now);
  const narrative = makeNarrative(state, summary, awayForRealDays, now);
  state.lastVisitedAt = now.toISOString();
  state.updatedAt = now.toISOString();
  state.events.forEach((event) => {
    if (event.expiresAtGardenDay >= state.simulatedDays) event.acknowledged = true;
  });
  if (awayForRealDays >= 7) {
    const returnTitle = visitChoice(state, now, "return-title", ["A return", "Footsteps again", "A look around"]);
    const returnText = visitChoice(state, now, "return-text", [
      `After ${Math.floor(awayForRealDays)} days away, someone came back to look around.`,
      `The garden was visited again after ${Math.floor(awayForRealDays)} days.`,
      `After ${Math.floor(awayForRealDays)} days, the path held fresh footsteps again.`
    ]);
    addChronicle(state, {
      kind: "visit",
      title: returnTitle,
      text: returnText,
      icon: "◌"
    });
  }
  return { state, summary, awayForRealDays, narrative };
}

export function gardenSnapshot(
  state: GardenState,
  options: { includeInternalMilestones?: boolean } = {}
): Record<string, unknown> {
  state.plants.forEach((plant) => ensurePlantPhenotype(state, plant));
  ensureHerbarium(state);
  const latestWeather = state.weather.at(-1) ?? weatherFor(state, Math.max(0, Math.floor(state.simulatedDays)));
  const herbariumEntries = state.herbarium.species.map((entry) => ({
    ...entry,
    variants: entry.variants.map((variant) => ({ ...variant, phenotype: structuredClone(variant.phenotype) })),
    notableFinds: entry.notableFinds.map((find) => ({ ...find }))
  }));
  const archivedResidents = state.herbarium.archivedPlants.map((entry) => ({
    id: entry.plant.id,
    species: entry.plant.species,
    name: entry.name,
    stage: entry.plant.stage,
    health: Math.round(entry.plant.health),
    ageDays: entry.plant.ageDays,
    blooms: entry.plant.bloomCount,
    position: { x: Math.round(entry.plant.x), y: Math.round(entry.plant.y) },
    generation: entry.plant.generation,
    origin: entry.plant.origin,
    traits: entry.plant.traits,
    phenotype: entry.plant.phenotype,
    archivedAt: entry.archivedAt,
    archivedGardenDay: entry.archivedGardenDay,
    note: entry.note ?? null
  }));
  return {
    name: state.name,
    gardenDay: Math.floor(state.simulatedDays),
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
    herbarium: {
      speciesDiscovered: herbariumEntries.length,
      speciesTotal: SPECIES_LIST.length,
      variantCount: herbariumEntries.reduce((total, entry) => total + entry.variants.length, 0),
      notableCount: herbariumEntries.reduce((total, entry) => total + entry.notableFinds.length, 0),
      archivedCount: archivedResidents.length,
      archivedResidents,
      entries: herbariumEntries
    },
    milestones: options.includeInternalMilestones
      ? state.milestones
      : state.milestones.filter((milestone) => milestone.id !== "first-chapter"),
    recentChronicle: state.chronicle
      .filter((entry) => options.includeInternalMilestones || entry.title !== "The first chapter")
      .slice(-8)
  };
}
