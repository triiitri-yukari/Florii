const $ = (selector) => document.querySelector(selector);

const speciesStyle = {
  moonbell: { color: "#d7d1f0", symbol: "◡̈", shape: "bell", petals: 5 },
  starpetal: { color: "#f2cad8", symbol: "✦", shape: "star", petals: 6 },
  rainmint: { color: "#b7ddc9", symbol: "⌇", shape: "leaf", petals: 3 },
  emberbloom: { color: "#efa18e", symbol: "✺", shape: "ray", petals: 8 },
  duskfern: { color: "#8aab95", symbol: "⌁", shape: "frond", petals: 6 },
  cloverlight: { color: "#d4e89c", symbol: "❋", shape: "round", petals: 4 },
  snowlace: { color: "#dce9f7", symbol: "✼", shape: "lace", petals: 8 },
  sunsigh: { color: "#f5c45f", symbol: "☼", shape: "ray", petals: 10 },
  tideglass: { color: "#9cd7dc", symbol: "◇", shape: "diamond", petals: 5 },
  velvethorn: { color: "#85536d", symbol: "◆", shape: "velvet", petals: 6 },
  lanternmoss: { color: "#c5cf72", symbol: "◈", shape: "cup", petals: 5 },
  cloudpoppy: { color: "#d8d3f2", symbol: "✿", shape: "cloud", petals: 5 }
};

const weatherIcons = {
  clear: "◉",
  cloudy: "◌",
  drizzle: "⌇",
  rain: "≋",
  storm: "ϟ",
  mist: "≈",
  frost: "✧"
};

const phrases = {
  seed: "resting beneath the soil",
  sprout: "a new green beginning",
  young: "growing at its own pace",
  budding: "holding a small promise",
  blooming: "open to the light",
  mature: "settled into the garden",
  resting: "resting with the season"
};

function makePlant(plant) {
  const style = speciesStyle[plant.species] ?? speciesStyle.starpetal;
  const phenotype = plant.phenotype ?? {
    primaryColor: style.color,
    secondaryColor: style.color,
    centerColor: "#d7b66d",
    pattern: "solid",
    height: 1,
    bloomSize: 1,
    colorName: "soft-colored",
    fragrance: "none",
    rarity: "common"
  };
  const element = document.createElement("div");
  element.className = "plant";
  element.dataset.stage = plant.stage;
  element.dataset.species = plant.species;
  element.dataset.shape = style.shape;
  element.dataset.pattern = phenotype.pattern;
  element.dataset.rarity = phenotype.rarity;
  element.style.left = `${plant.position.x}%`;
  element.style.top = `${Math.max(51, plant.position.y)}%`;
  element.style.setProperty("--flower", phenotype.primaryColor);
  element.style.setProperty("--flower-2", phenotype.secondaryColor);
  element.style.setProperty("--flower-center", phenotype.centerColor);
  element.style.setProperty("--genetic-scale", phenotype.height);
  element.style.setProperty("--bloom-scale", phenotype.bloomSize);
  element.style.zIndex = String(Math.round(plant.position.y));

  const label = document.createElement("span");
  label.className = "plant-label";
  const traitText = plant.traits?.length ? ` · ${plant.traits.join(", ")}` : "";
  label.textContent = `${plant.name} · ${phenotype.colorName} ${phenotype.pattern} · ${phrases[plant.stage] ?? plant.stage}${traitText}`;
  element.append(label);

  for (const className of ["stem", "leaf left", "leaf right"]) {
    const part = document.createElement("i");
    part.className = className;
    element.append(part);
  }
  const flower = document.createElement("span");
  flower.className = "flower";
  for (let index = 0; index < style.petals; index += 1) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.setProperty("--petal-angle", `${(360 / style.petals) * index}deg`);
    flower.append(petal);
  }
  element.append(flower);
  return element;
}

function renderChronicle(entries, total) {
  const container = $("#chronicle");
  container.replaceChildren();
  const newestFirst = [...entries].reverse().slice(0, 6);
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
  for (const milestone of milestones.slice(-4).reverse()) {
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
  const state = data.state;
  const weather = data.weather;
  const plants = data.plants ?? [];
  const day = Number(data.gardenDay ?? 0);
  const chapterPercent = Math.min(100, Math.floor((day / 90) * 100));

  document.title = `${data.name} · Florii`;
  $("#garden-name").textContent = data.name;
  $("#garden-day").textContent = String(day);
  $("#season-label").textContent = `${data.season} light`;
  $(".garden-card").dataset.season = data.season;
  $("#plant-count").textContent = `${plants.length} ${plants.length === 1 ? "plant" : "plants"}`;
  $("#empty-message").hidden = plants.length > 0;
  $("#chapter-percent").textContent = `${chapterPercent}%`;
  $("#chapter-progress").style.width = `${chapterPercent}%`;
  $("#chapter-copy").textContent = chapterPercent >= 100
    ? "The first chapter is complete. The garden is not."
    : day < 14
      ? "The first season has only just begun."
      : `${90 - day} patient garden days remain in this first chapter.`;
  $("#soil-value").textContent = `${data.soil.moisture}% moist`;
  $("#wild-value").textContent = `${data.character.biodiversity}%`;
  $("#quiet-value").textContent = `${data.character.tranquility}%`;

  const weatherIcon = weatherIcons[weather.condition] ?? "◌";
  $("#weather-icon").textContent = weatherIcon;
  $("#temperature").textContent = `${Math.round(weather.temperatureC)}°`;
  $("#weather-caption").textContent = `${weather.condition} · ${weather.rainMm ? `${weather.rainMm} mm rain` : "dry light"}`;
  const source = data.weatherSource;
  $("#source-label").textContent = source.active === "open-meteo" ? `weather near ${source.placeName ?? "the garden"}` : "living locally";
  $("#weather-detail").textContent = source.active === "open-meteo"
    ? `Real weather near ${source.placeName ?? "the chosen place"} is touching the garden today.`
    : source.selected === "open-meteo" && source.fallbackReason
      ? "Live weather is resting; Florii is safely using its own weather for now."
      : "The garden is making its own seasonal weather.";

  const plantContainer = $("#plants");
  plantContainer.replaceChildren(...plants.map(makePlant));
  renderChronicle(data.recentChronicle ?? [], state.chronicle.length);
  renderMilestones(data.milestones ?? []);
  $("#updated-at").textContent = `Garden state checked ${new Date(state.updatedAt).toLocaleString()}`;
}

async function loadGarden() {
  const button = $("#refresh");
  button.classList.add("loading");
  button.firstChild.textContent = "visiting… ";
  try {
    const response = await fetch("/api/garden", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.json());
  } catch (error) {
    $("#garden-subtitle").textContent = "The garden could not be reached, but its saved state is safe.";
    console.error(error);
  } finally {
    button.classList.remove("loading");
    button.firstChild.textContent = "visit now ";
  }
}

$("#refresh").addEventListener("click", loadGarden);
void loadGarden();
setInterval(loadGarden, 60_000);
