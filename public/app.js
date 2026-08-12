const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

export const speciesStyle = {
  moonbell: { color: "#d7d1f0", symbol: "◡̈", shape: "bell", petals: 5, innerPetals: 3, previewPattern: "gradient" },
  starpetal: { color: "#f2cad8", symbol: "✦", shape: "star", petals: 6, innerPetals: 0, previewPattern: "bicolor" },
  rainmint: { color: "#b7ddc9", symbol: "⌇", shape: "leaf", petals: 3, innerPetals: 0, previewPattern: "solid" },
  emberbloom: { color: "#efa18e", symbol: "✺", shape: "ray", petals: 8, innerPetals: 8, previewPattern: "tipped" },
  duskfern: { color: "#8aab95", symbol: "⌁", shape: "frond", petals: 6, innerPetals: 0, previewPattern: "gradient" },
  cloverlight: { color: "#d4e89c", symbol: "❋", shape: "round", petals: 4, innerPetals: 0, previewPattern: "solid" },
  snowlace: { color: "#dce9f7", symbol: "✼", shape: "lace", petals: 8, innerPetals: 8, previewPattern: "tipped" },
  sunsigh: { color: "#f5c45f", symbol: "☼", shape: "ray", petals: 10, innerPetals: 10, previewPattern: "gradient" },
  tideglass: { color: "#9cd7dc", symbol: "◇", shape: "diamond", petals: 5, innerPetals: 5, previewPattern: "gradient" },
  velvethorn: { color: "#85536d", symbol: "◆", shape: "velvet", petals: 8, innerPetals: 5, previewPattern: "bicolor" },
  lanternmoss: { color: "#c5cf72", symbol: "◈", shape: "cup", petals: 5, innerPetals: 3, previewPattern: "tipped" },
  cloudpoppy: { color: "#d8d3f2", symbol: "✿", shape: "cloud", petals: 4, innerPetals: 0, previewPattern: "gradient" }
};

const weatherIcons = { clear: "◉", cloudy: "◌", drizzle: "⌇", rain: "≋", storm: "ϟ", mist: "≈", frost: "✧" };
export const phrases = {
  seed: "resting beneath the soil",
  sprout: "a new green beginning",
  young: "growing at its own pace",
  budding: "holding a small promise",
  blooming: "open to the light",
  mature: "settled into the garden",
  resting: "resting with the season"
};

let currentData = null;
let activeSeason = "all";

function phenotypeFor(plant, style) {
  return plant.phenotype ?? {
    primaryColor: style.color,
    secondaryColor: style.color,
    centerColor: "#d7b66d",
    pattern: "solid",
    height: 1,
    bloomSize: 1,
    growthRate: 1,
    waterNeed: 50,
    resilience: 75,
    colorName: "soft-colored",
    fragrance: "none",
    rarity: "common"
  };
}

function appendFernFigure(element) {
  const crown = document.createElement("span");
  crown.className = "fern-crown";
  const fronds = [
    { angle: -42, scale: 0.78 },
    { angle: -22, scale: 0.94 },
    { angle: 0, scale: 1.08 },
    { angle: 23, scale: 0.92 },
    { angle: 43, scale: 0.76 }
  ];
  for (const [frondIndex, config] of fronds.entries()) {
    const frond = document.createElement("span");
    frond.className = "fern-frond";
    frond.dataset.frond = String(frondIndex + 1);
    frond.style.setProperty("--frond-angle", `${config.angle}deg`);
    frond.style.setProperty("--frond-scale", String(config.scale));
    for (let pair = 0; pair < 4; pair += 1) {
      for (const side of ["left", "right"]) {
        const pinna = document.createElement("i");
        pinna.className = `fern-pinna ${side}`;
        pinna.style.setProperty("--pinna-y", `${18 + pair * 18}%`);
        pinna.style.setProperty("--pinna-scale", String([0.5, 0.72, 0.9, 0.78][pair]));
        frond.append(pinna);
      }
    }
    crown.append(frond);
  }
  element.append(crown);
}

export function makePlantFigure(plant, placement = true) {
  const style = speciesStyle[plant.species] ?? speciesStyle.starpetal;
  const phenotype = phenotypeFor(plant, style);
  const element = document.createElement(placement ? "button" : "div");
  element.className = placement ? "plant" : "plant specimen-plant";
  if (placement) {
    element.type = "button";
    element.setAttribute("aria-label", `View ${plant.name}, ${phrases[plant.stage] ?? plant.stage}`);
    element.style.left = `${plant.position.x}%`;
    element.style.top = `${Math.max(51, plant.position.y)}%`;
    element.style.zIndex = String(Math.round(plant.position.y));
    element.addEventListener("click", () => openPlant(plant));
  }
  element.dataset.stage = plant.stage;
  element.dataset.species = plant.species;
  element.dataset.shape = style.shape;
  element.dataset.display = placement ? "garden" : "specimen";
  element.dataset.pattern = phenotype.pattern;
  element.dataset.rarity = phenotype.rarity;
  element.style.setProperty("--flower", phenotype.primaryColor);
  element.style.setProperty("--flower-2", phenotype.secondaryColor);
  element.style.setProperty("--flower-center", phenotype.centerColor);
  element.style.setProperty("--genetic-scale", phenotype.height);
  element.style.setProperty("--bloom-scale", phenotype.bloomSize);

  if (placement) {
    const label = document.createElement("span");
    label.className = "plant-label";
    label.textContent = `${plant.name} · ${phenotype.colorName} ${phenotype.pattern}`;
    element.append(label);
  }

  if (plant.species === "duskfern") {
    appendFernFigure(element);
    return element;
  }

  const shoot = document.createElement("span");
  shoot.className = "shoot";
  for (const className of ["stem", "leaf left", "leaf right", "leaf accent-left", "leaf accent-right"]) {
    const part = document.createElement("i");
    part.className = className;
    shoot.append(part);
  }
  element.append(shoot);
  const flower = document.createElement("span");
  flower.className = "flower";
  for (let index = 0; index < style.petals; index += 1) {
    const petal = document.createElement("i");
    petal.className = "petal petal-outer";
    petal.style.setProperty("--petal-angle", `${(360 / style.petals) * index}deg`);
    flower.append(petal);
  }
  for (let index = 0; index < style.innerPetals; index += 1) {
    const petal = document.createElement("i");
    petal.className = "petal petal-inner";
    petal.style.setProperty("--petal-angle", `${(360 / style.innerPetals) * index + (180 / style.innerPetals)}deg`);
    flower.append(petal);
  }
  const center = document.createElement("i");
  center.className = "flower-center";
  flower.append(center);
  if (plant.species === "starpetal") {
    for (const position of ["left", "right"]) {
      const satellite = document.createElement("i");
      satellite.className = `satellite-bloom ${position}`;
      flower.append(satellite);
    }
  }
  element.append(flower);
  return element;
}

function addFact(container, label, value) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const detail = document.createElement("dd");
  term.textContent = label;
  detail.textContent = value;
  row.append(term, detail);
  container.append(row);
}

function openPlant(plant) {
  const dialog = $("#plant-dialog");
  const catalog = currentData?.catalog ?? [];
  const species = catalog.find((item) => item.id === plant.species);
  const phenotype = phenotypeFor(plant, speciesStyle[plant.species] ?? speciesStyle.starpetal);
  $("#dialog-species").textContent = `${species?.name ?? plant.species} · generation ${plant.generation}`;
  $("#dialog-plant-name").textContent = plant.name;
  $("#dialog-description").textContent = species?.description ?? "A quiet individual growing at its own pace.";
  const portrait = $("#dialog-portrait");
  portrait.replaceChildren(makePlantFigure({ ...plant, stage: plant.stage === "seed" ? "young" : plant.stage }, false));
  portrait.style.setProperty("--portrait-color", phenotype.primaryColor);

  const swatches = $("#dialog-swatches");
  swatches.replaceChildren();
  for (const [label, color] of [["primary", phenotype.primaryColor], ["secondary", phenotype.secondaryColor], ["center", phenotype.centerColor]]) {
    const swatch = document.createElement("span");
    swatch.style.background = color;
    swatch.title = `${label}: ${color}`;
    swatch.setAttribute("aria-label", `${label} color ${color}`);
    swatches.append(swatch);
  }

  const facts = $("#dialog-facts");
  facts.replaceChildren();
  addFact(facts, "stage", phrases[plant.stage] ?? plant.stage);
  addFact(facts, "age", `${plant.ageDays} garden days`);
  addFact(facts, "blooms", String(plant.blooms));
  addFact(facts, "flower", `${phenotype.colorName} · ${phenotype.pattern}`);
  addFact(facts, "fragrance", phenotype.fragrance === "none" ? "unscented" : phenotype.fragrance);
  addFact(facts, "water need", `${phenotype.waterNeed}%`);
  addFact(facts, "growth pace", `${Math.round(phenotype.growthRate * 100)}%`);
  addFact(facts, "resilience", `${phenotype.resilience}%`);

  const traits = $("#dialog-traits");
  traits.replaceChildren();
  for (const trait of plant.traits ?? []) {
    const chip = document.createElement("span");
    chip.textContent = trait;
    traits.append(chip);
  }
  $("#dialog-family").textContent = plant.generation > 1
    ? `A generation ${plant.generation} descendant, carrying a gently changed version of its family's colors and tendencies.`
    : plant.origin === "wind"
      ? "A first-generation seed carried here by the wind."
      : "A first-generation plant, placed here deliberately.";
  dialog.showModal();
}

function makeCollectionCard(plant) {
  const style = speciesStyle[plant.species] ?? speciesStyle.starpetal;
  const phenotype = phenotypeFor(plant, style);
  const card = document.createElement("button");
  card.type = "button";
  card.className = "plant-card";
  card.addEventListener("click", () => openPlant(plant));

  const art = document.createElement("div");
  art.className = "plant-card-art";
  art.style.background = `linear-gradient(145deg, ${phenotype.primaryColor}55, ${phenotype.secondaryColor}22)`;
  art.append(makePlantFigure({ ...plant, stage: plant.stage === "seed" ? "young" : plant.stage }, false));
  const rarity = document.createElement("span");
  rarity.className = `rarity rarity-${phenotype.rarity}`;
  rarity.textContent = phenotype.rarity;
  art.append(rarity);

  const copy = document.createElement("div");
  copy.className = "plant-card-copy";
  const heading = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = plant.name;
  const generation = document.createElement("span");
  generation.textContent = `gen ${plant.generation}`;
  heading.append(name, generation);
  const subtitle = document.createElement("p");
  subtitle.textContent = `${phenotype.colorName} ${phenotype.pattern} · ${phrases[plant.stage] ?? plant.stage}`;
  const swatches = document.createElement("div");
  swatches.className = "mini-swatches";
  for (const color of [phenotype.primaryColor, phenotype.secondaryColor, phenotype.centerColor]) {
    const dot = document.createElement("i");
    dot.style.background = color;
    swatches.append(dot);
  }
  copy.append(heading, subtitle, swatches);
  card.append(art, copy);
  return card;
}

function renderCollection(plants) {
  const container = $("#plant-collection");
  if (!plants.length) {
    const empty = document.createElement("p");
    empty.className = "soft-empty";
    empty.textContent = "The first planted seed will appear here.";
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...plants.map(makeCollectionCard));
}

function renderSeedLibrary(catalog) {
  const filtered = activeSeason === "all" ? catalog : catalog.filter((species) => species.preferredSeasons.includes(activeSeason));
  const container = $("#seed-library");
  container.replaceChildren();
  for (const species of filtered) {
    const style = speciesStyle[species.id] ?? speciesStyle.starpetal;
    const card = document.createElement("article");
    card.className = "seed-card";
    const art = document.createElement("div");
    art.className = "seed-art";
    art.style.setProperty("--seed-color", species.colors[0]);
    art.style.setProperty("--seed-color-2", species.colors[1]);
    const symbol = document.createElement("span");
    symbol.className = "seed-symbol";
    symbol.textContent = style.symbol;
    const specimen = makePlantFigure({
      species: species.id,
      name: species.name,
      stage: "blooming",
      generation: 1,
      traits: [],
      phenotype: {
        primaryColor: species.colors[0],
        secondaryColor: species.colors[1] ?? species.colors[0],
        centerColor: species.colors[2] ?? "#d7b66d",
        pattern: style.previewPattern,
        height: 1,
        bloomSize: 1,
        growthRate: 1,
        waterNeed: species.waterPreference,
        resilience: species.resilience,
        colorName: "catalog",
        fragrance: "none",
        rarity: "common"
      }
    }, false);
    art.append(specimen, symbol);
    const copy = document.createElement("div");
    const top = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = species.name;
    const pace = document.createElement("span");
    pace.textContent = `${species.daysToMature}d`;
    top.append(name, pace);
    const description = document.createElement("p");
    description.textContent = species.description;
    const meta = document.createElement("div");
    meta.className = "seed-meta";
    const seasons = document.createElement("span");
    seasons.textContent = species.preferredSeasons.join(" · ");
    const water = document.createElement("span");
    water.textContent = `water ${species.waterPreference}%`;
    meta.append(seasons, water);
    copy.append(top, description, meta);
    card.append(art, copy);
    container.append(card);
  }
}

function renderChronicle(entries, total) {
  const container = $("#chronicle-list");
  container.replaceChildren();
  const newestFirst = [...entries].reverse().slice(0, 8);
  for (const entry of newestFirst) {
    const row = document.createElement("article");
    row.className = "entry";
    const icon = document.createElement("span");
    icon.className = "entry-icon";
    icon.textContent = entry.icon;
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = entry.title;
    const text = document.createElement("p");
    text.textContent = entry.text;
    copy.append(title, text);
    const time = document.createElement("time");
    time.textContent = `day ${entry.gardenDay}`;
    row.append(icon, copy, time);
    container.append(row);
  }
  $("#entry-count").textContent = `${total} ${total === 1 ? "entry" : "entries"}`;
}

function renderMilestones(milestones) {
  const container = $("#milestones");
  container.replaceChildren();
  if (!milestones.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "The first little milestone is still ahead.";
    container.append(empty);
    return;
  }
  for (const milestone of milestones.slice(-5).reverse()) {
    const row = document.createElement("div");
    row.className = "milestone";
    const icon = document.createElement("i");
    icon.textContent = "✦";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = milestone.title;
    const description = document.createElement("small");
    description.textContent = milestone.description;
    copy.append(title, description);
    row.append(icon, copy);
    container.append(row);
  }
}

function render(data) {
  currentData = data;
  const state = data.state;
  const weather = data.weather;
  const plants = data.plants ?? [];
  const day = Number(data.gardenDay ?? 0);
  const chapterPercent = Math.min(100, Math.floor((day / 90) * 100));

  document.title = `${data.name} · Florii`;
  $("#garden-name").textContent = data.name;
  $("#garden-day").textContent = String(day);
  $("#hero-season").textContent = data.season;
  $("#hero-plant-count").textContent = String(plants.length);
  $("#season-label").textContent = `${data.season} light`;
  $(".garden-card").dataset.season = data.season;
  $("#plant-count").textContent = `${plants.length} ${plants.length === 1 ? "plant" : "plants"}`;
  $("#empty-message").hidden = plants.length > 0;
  $("#chapter-percent").textContent = `${chapterPercent}%`;
  $("#chapter-progress").style.width = `${chapterPercent}%`;
  $(".progress").setAttribute("aria-valuenow", String(chapterPercent));
  $("#chapter-copy").textContent = chapterPercent >= 100
    ? "The first chapter is complete. The garden is not."
    : day < 14 ? "The first season has only just begun." : `${90 - day} patient garden days remain in this first chapter.`;
  $("#soil-value").textContent = `${data.soil.moisture}%`;
  $("#wild-value").textContent = `${data.character.biodiversity}%`;
  $("#quiet-value").textContent = `${data.character.tranquility}%`;

  $("#weather-icon").textContent = weatherIcons[weather.condition] ?? "◌";
  $("#weather-condition").textContent = weather.condition;
  $("#temperature").textContent = `${Math.round(weather.temperatureC)}°`;
  $("#weather-caption").textContent = `${weather.condition} · ${weather.rainMm ? `${weather.rainMm} mm rain` : "dry light"}`;
  const source = data.weatherSource;
  $("#source-label").textContent = source.active === "open-meteo" ? `weather near ${source.placeName ?? "the garden"}` : "living locally";
  $("#weather-detail").textContent = source.active === "open-meteo"
    ? `Real weather near ${source.placeName ?? "the chosen place"} is touching the garden today.`
    : source.selected === "open-meteo" && source.fallbackReason
      ? "Live weather is resting; Florii is safely using its own weather for now."
      : "The garden is making its own seasonal weather.";

  $("#plants-stage").replaceChildren(...plants.map((plant) => makePlantFigure(plant, true)));
  renderCollection(plants);
  renderSeedLibrary(data.catalog ?? []);
  renderChronicle(data.recentChronicle ?? [], state.chronicle.length);
  renderMilestones(data.milestones ?? []);
  $("#updated-at").textContent = `Garden state checked ${new Date(state.updatedAt).toLocaleString()}`;
}

async function loadGarden(showNotice = false) {
  const button = $("#refresh");
  button.classList.add("loading");
  button.querySelector("span").textContent = "visiting…";
  try {
    const response = await fetch("/api/garden", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.json());
    if (showNotice) showToast("The garden has been gently refreshed.");
  } catch (error) {
    $("#garden-subtitle").textContent = "The garden could not be reached, but its saved state is safe.";
    showToast("The saved garden is safe, but could not be reached.");
    console.error(error);
  } finally {
    button.classList.remove("loading");
    button.querySelector("span").textContent = "visit now";
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

if ($("#refresh")) {
  $("#refresh").addEventListener("click", () => loadGarden(true));
  $("#dialog-close").addEventListener("click", () => $("#plant-dialog").close());
  $("#plant-dialog").addEventListener("click", (event) => {
    if (event.target === $("#plant-dialog")) $("#plant-dialog").close();
  });

  for (const button of $$('[data-season-filter]')) {
    button.addEventListener("click", () => {
      activeSeason = button.dataset.seasonFilter;
      $$('[data-season-filter]').forEach((item) => item.classList.toggle("active", item === button));
      renderSeedLibrary(currentData?.catalog ?? []);
    });
  }

  void loadGarden();
  window.setInterval(loadGarden, 60_000);
}
