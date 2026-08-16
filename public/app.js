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

const translations = {
  en: {
    pageTitle: "Florii · a garden in real time",
    pageDescription: "A human-readable window into a quiet Florii garden growing in real time.",
    brandHome: "Florii garden home",
    navSections: "Garden sections",
    navGarden: "garden",
    navPlants: "plants",
    navHerbarium: "herbarium",
    navSeeds: "seed library",
    navChronicle: "chronicle",
    livingLocally: "living locally",
    visitNow: "visit now",
    visiting: "visiting…",
    switchToChinese: "Switch to Chinese",
    switchToEnglish: "Switch to English",
    heroEyebrow: "A garden growing between conversations",
    gardenStatus: "Garden status",
    gardenDay: "garden day",
    season: "season",
    livingPlants: "living plants",
    liveGarden: "Live garden",
    todayPatch: "Today in the patch",
    choosePlant: "Choose a plant to see its story",
    currentGarden: "The current Florii garden",
    quietWeather: "quiet weather",
    openSoil: "Open soil. A beginning, not an absence.",
    springLight: "spring light",
    zeroPlants: "0 plants",
    gardenConditions: "Garden conditions",
    todaysWeather: "today's weather",
    quiet: "quiet",
    weatherDetailSimulated: "The garden is making its own weather.",
    gardenCharacter: "garden character",
    soilMoisture: "soil moisture",
    biodiversity: "biodiversity",
    tranquility: "tranquility",
    firstChapter: "first chapter",
    firstChapterProgress: "First chapter progress",
    firstSeason: "The first season has only just begun.",
    collectionEyebrow: "The ones growing here",
    livingCollection: "Living collection",
    everySeed: "Every seed becomes an individual.",
    firstPlanted: "The first planted seed will appear here.",
    herbariumEyebrow: "Every form the garden remembers",
    herbarium: "Herbarium",
    herbariumProgress: "Herbarium progress",
    species: "species",
    variations: "variations",
    notableFinds: "notable finds",
    transplanted: "transplanted",
    herbariumIntro: "A permanent record of planted, wind-carried, and second-generation flowers. Empty places are discoveries still ahead.",
    seedEyebrow: "Twelve possible beginnings",
    seedLibrary: "Seed library",
    filterSeeds: "Filter seeds by season",
    all: "all",
    spring: "spring",
    summer: "summer",
    autumn: "autumn",
    winter: "winter",
    chronicleEyebrow: "What time left behind",
    gardenChronicle: "Garden chronicle",
    zeroEntries: "0 entries",
    keptMoments: "kept moments",
    firstMilestone: "The first little milestone is still ahead.",
    footerLine: "Florii grows between conversations.",
    lastLooked: "Last looked at just now",
    weatherBy: "weather by Open-Meteo",
    closePlant: "Close plant details",
    plant: "Plant",
    smallPlant: "A small plant",
    smallPlantDescription: "A quiet individual growing at its own pace.",
    undiscovered: "Undiscovered",
    flowerColors: "Flower colors",
    defaultGardenName: "A Quiet Patch",
    defaultChronicleTitle: "A patch of earth",
    defaultChronicleText: "The garden began quietly, with open soil and time ahead of it.",
    siteTitleSuffix: "Florii",
    seasonLight: "{season} · {time} light",
    plantCountOne: "{count} plant",
    plantCountMany: "{count} plants",
    chapterComplete: "The first chapter is complete. The garden is not.",
    patientDays: "{days} patient garden days remain in this first chapter.",
    weatherNear: "weather near {place}",
    weatherLocal: "living locally",
    weatherDetailOpen: "Real weather near {place} is touching the garden today.",
    weatherDetailFallback: "Live weather is resting; Florii is safely using its own weather for now.",
    weatherCaption: "{condition} · {time}",
    gardenStateChecked: "Garden state checked {date}",
    loadError: "The garden could not be reached, but its saved state is safe.",
    savedSafe: "The saved garden is safe, but could not be reached.",
    refreshNotice: "The garden has been gently refreshed.",
    viewPlant: "View {name}, {stage}",
    generation: "gen {count}",
    foundDay: "found day {day}",
    seenOne: "{count} seen",
    seenMany: "{count} seen",
    variationOne: "{count} variation remembered for this species.",
    variationMany: "{count} variations remembered for this species.",
    blankHerbarium: "A blank page waiting for the garden to introduce itself.",
    more: "+{count} more",
    unusualOne: "✦ {count} unusual individual",
    unusualMany: "✦ {count} unusual individuals",
    rareAndUnusual: "✦ {rare} rare and {unusual} unusual individuals",
    transplantedOne: "{count} transplanted resident",
    transplantedMany: "{count} transplanted residents",
    day: "day {day}",
    daysShort: "{count}d",
    water: "water {count}%",
    entriesOne: "{count} entry",
    entriesMany: "{count} entries",
    gardenDays: "{count} garden days",
    factStage: "stage",
    factAge: "age",
    factBlooms: "blooms",
    factFlower: "flower",
    factFragrance: "fragrance",
    factWaterNeed: "water need",
    factGrowthPace: "growth pace",
    factResilience: "resilience",
    factStatus: "status",
    factLeftGarden: "left garden",
    unscented: "unscented",
    transplantedPreserved: "transplanted · preserved",
    familyGeneration: "A generation {count} descendant, carrying a gently changed version of its family's colors and tendencies.",
    familyWind: "A first-generation seed carried here by the wind.",
    familyPlanted: "A first-generation plant, placed here deliberately.",
    familyArchived: "{family} It was transplanted on garden day {day}; its portrait and complete record remain here.{note}",
    primary: "primary",
    secondary: "secondary",
    center: "center",
    colorWord: "color"
  },
  zh: {
    pageTitle: "Florii · 一座正在长大的小花园",
    pageDescription: "一扇能看见 Florii 安静花园的窗口，它正一边聊天一边慢慢长大。",
    brandHome: "回到 Florii 花园",
    navSections: "花园分区",
    navGarden: "花园",
    navPlants: "植物",
    navHerbarium: "标本册",
    navSeeds: "种子库",
    navChronicle: "花园手记",
    livingLocally: "本地天气",
    visitNow: "去看看",
    visiting: "正在探头…",
    switchToChinese: "切换到中文",
    switchToEnglish: "切换到英文",
    heroEyebrow: "一座在对话缝隙里长大的花园",
    gardenStatus: "花园状态",
    gardenDay: "花园日",
    season: "季节",
    livingPlants: "在住植物",
    liveGarden: "正在生长",
    todayPatch: "今天的小土坡",
    choosePlant: "挑一株植物，听听它的故事",
    currentGarden: "眼前这座 Florii 小花园",
    quietWeather: "天气很安静",
    openSoil: "空着的土，也是一种开场，不是缺席。",
    springLight: "春日的光",
    zeroPlants: "0 株植物",
    gardenConditions: "花园状况",
    todaysWeather: "今天的天气",
    quiet: "安静",
    weatherDetailSimulated: "花园正在自己调一份季节天气。",
    gardenCharacter: "花园脾气",
    soilMoisture: "土壤湿度",
    biodiversity: "小小生物多样性",
    tranquility: "安静指数",
    firstChapter: "第一章",
    firstChapterProgress: "第一章进度",
    firstSeason: "第一季才刚刚掀开一角。",
    collectionEyebrow: "住在这里的那些小家伙",
    livingCollection: "在住名册",
    everySeed: "每一颗种子，都会长成自己的样子。",
    firstPlanted: "第一颗种子还在路上。",
    herbariumEyebrow: "花园记得的每一种模样",
    herbarium: "植物标本册",
    herbariumProgress: "标本册进度",
    species: "个物种",
    variations: "种变化",
    notableFinds: "个特别发现",
    transplanted: "已移栽",
    herbariumIntro: "这里收着种下的、随风来的，还有第二代小花。空白处不是空白，是还没遇见。",
    seedEyebrow: "十二个可能的开头",
    seedLibrary: "种子小铺",
    filterSeeds: "按季节筛选种子",
    all: "全部",
    spring: "春",
    summer: "夏",
    autumn: "秋",
    winter: "冬",
    chronicleEyebrow: "时间悄悄留下的东西",
    gardenChronicle: "花园手记",
    zeroEntries: "0 条记录",
    keptMoments: "被好好留下的时刻",
    firstMilestone: "第一枚小里程碑还在前面探头。",
    footerLine: "Florii 在对话之间生长。",
    lastLooked: "刚刚看过",
    weatherBy: "天气数据来自 Open-Meteo",
    closePlant: "关掉植物详情",
    plant: "植物",
    smallPlant: "一株小小的植物",
    smallPlantDescription: "一株按自己节奏长大的安静小家伙。",
    undiscovered: "还没遇见",
    flowerColors: "花朵颜色",
    defaultGardenName: "一小块安静的土",
    defaultChronicleTitle: "一小块土",
    defaultChronicleText: "花园安安静静地开始了，眼前是松开的土，还有一大把时间。",
    siteTitleSuffix: "Florii",
    seasonLight: "{season} · {time}的光",
    plantCountOne: "{count} 株植物",
    plantCountMany: "{count} 株植物",
    chapterComplete: "第一章写完啦，花园还没写完。",
    patientDays: "还有 {days} 个耐心的花园日，在这一章里慢慢走。",
    weatherNear: "{place}附近的天气",
    weatherLocal: "花园自带天气",
    weatherDetailOpen: "今天，{place}附近的真天气也来花园串门了。",
    weatherDetailFallback: "实时天气先歇会儿，Florii 暂时用自己的小天气撑场。",
    weatherCaption: "{condition} · {time}",
    gardenStateChecked: "花园状态查看于 {date}",
    loadError: "花园暂时够不着，但保存好的小世界很安全。",
    savedSafe: "保存好的花园没事，只是暂时联系不上。",
    refreshNotice: "花园刚刚被轻轻看过啦。",
    viewPlant: "查看{name}，它现在{stage}",
    generation: "第 {count} 代",
    foundDay: "第 {day} 日发现",
    seenOne: "见过 {count} 株",
    seenMany: "见过 {count} 株",
    variationOne: "这个物种留下了 1 种变化。",
    variationMany: "这个物种留下了 {count} 种变化。",
    blankHerbarium: "一页空白，等花园自己来介绍。",
    more: "还有 {count} 种",
    unusualOne: "✦ {count} 株特别的小家伙",
    unusualMany: "✦ {count} 株特别的小家伙",
    rareAndUnusual: "✦ {rare} 株稀有，{unusual} 株少见",
    transplantedOne: "{count} 位已移栽居民",
    transplantedMany: "{count} 位已移栽居民",
    day: "第 {day} 日",
    daysShort: "{count} 天",
    water: "需水 {count}%",
    entriesOne: "{count} 条记录",
    entriesMany: "{count} 条记录",
    gardenDays: "{count} 个花园日",
    factStage: "阶段",
    factAge: "年龄",
    factBlooms: "开花次数",
    factFlower: "花色",
    factFragrance: "香气",
    factWaterNeed: "需水量",
    factGrowthPace: "生长速度",
    factResilience: "抗性",
    factStatus: "状态",
    factLeftGarden: "离开花园",
    unscented: "没有香气",
    transplantedPreserved: "已移栽 · 好好保存着",
    familyGeneration: "第 {count} 代的小后代，带着家族颜色和脾气的一点点新变化。",
    familyWind: "第一代风送来的种子，刚好落在这里。",
    familyPlanted: "第一代植物，被认真放进了这里。",
    familyArchived: "{family} 它在花园第 {day} 日移栽；花影和完整记录都还在这里。{note}",
    primary: "主色",
    secondary: "辅色",
    center: "花心",
    colorWord: "颜色"
  }
};

const speciesTranslations = {
  moonbell: { name: "月铃", description: "一朵淡淡的铃铛花，在安静的晚光里打开。" },
  starpetal: { name: "星瓣", description: "一朵长着许多小尖角的花，喜欢亮晶晶地挤成一簇。" },
  rainmint: { name: "雨薄荷", description: "清凉的绿叶，每场雨后都挂满小水珠。" },
  emberbloom: { name: "余烬花", description: "一朵暖珊瑚色的花，干燥的午后也不肯褪色。" },
  duskfern: { name: "暮蕨", description: "喜欢阴影的蕨，新的叶片总在黄昏慢慢展开。" },
  cloverlight: { name: "三叶微光", description: "一小片地被，雨后偶尔会偷偷发亮。" },
  snowlace: { name: "雪蕾丝", description: "一朵霜光里的花，细细的花瓣扛得住冷清晨。" },
  sunsigh: { name: "太阳叹", description: "一朵暖暖的纸片花，整天把脸朝向干燥的长午后。" },
  tideglass: { name: "潮玻璃", description: "一朵半透明的蓝花，每片花瓣边都收着水珠。" },
  velvethorn: { name: "绒刺", description: "一朵慢吞吞的深色花，花瓣像天鹅绒，叶边还镶着银。" },
  lanternmoss: { name: "灯笼苔", description: "喜欢湿气的地面小花，杯子一样的花在黄昏像点了灯。" },
  cloudpoppy: { name: "云罂粟", description: "一朵软软的宽瓣花，空气不动时也会轻轻发抖。" }
};

const stagePhrases = {
  en: {
    seed: "resting beneath the soil",
    sprout: "a new green beginning",
    young: "growing at its own pace",
    budding: "holding a small promise",
    blooming: "open to the light",
    mature: "settled into the garden",
    resting: "resting with the season"
  },
  zh: {
    seed: "在土里乖乖躺着",
    sprout: "一小截新绿，刚刚冒头",
    young: "按自己的节奏长大",
    budding: "揣着一枚小小的愿望",
    blooming: "把花脸交给光",
    mature: "已经在花园里安顿好啦",
    resting: "和季节一起打个盹"
  }
};

const seasonNames = {
  en: { spring: "spring", summer: "summer", autumn: "autumn", winter: "winter" },
  zh: { spring: "春天", summer: "夏天", autumn: "秋天", winter: "冬天" }
};

const timeNames = {
  en: { dawn: "dawn", day: "day", afternoon: "afternoon", night: "night" },
  zh: { dawn: "黎明", day: "白天", afternoon: "午后", night: "夜里" }
};

const weatherNames = {
  en: { clear: "clear", cloudy: "cloudy", drizzle: "drizzle", rain: "rain", storm: "storm", mist: "mist", frost: "frost" },
  zh: { clear: "晴朗", cloudy: "多云", drizzle: "细雨", rain: "下雨", storm: "雷雨", mist: "薄雾", frost: "霜" }
};

const colorNames = {
  lavender: "薰衣草紫", pearl: "珍珠白", "soft violet": "柔紫", blush: "晕粉", "butter-yellow": "奶油黄", rose: "玫瑰粉",
  "mint-green": "薄荷绿", "sea-glass": "海玻璃色", "cool jade": "冷翡翠", coral: "珊瑚", apricot: "杏子色", "warm red": "暖红",
  "moss-green": "苔藓绿", "silver-green": "银绿", "deep green": "深绿", "lime-white": "青柠白", "pale gold": "淡金", "spring green": "春日绿",
  "snow-white": "雪白", "ice-blue": "冰蓝", "winter silver": "冬银", "sun-gold": "太阳金", amber: "琥珀", "warm cream": "暖奶油",
  "sea-glass blue": "海玻璃蓝", "tidal teal": "潮汐青", "foam-white": "泡沫白", mulberry: "桑葚色", "wine-purple": "酒红紫", "deep plum": "深梅紫",
  "lantern green": "灯笼绿", "moss-gold": "苔金", "lichen green": "地衣绿", "cloud violet": "云紫", "mist-pink": "雾粉", "pale sky": "淡天蓝",
  "soft-colored": "柔和色", catalog: "样本色"
};

const enumNames = {
  pattern: { solid: "素色", gradient: "渐变", tipped: "双色尖", speckled: "小斑", bicolor: "双彩" },
  fragrance: { none: "没有香气", green: "青草香", honey: "蜂蜜香", rain: "雨后香", citrus: "柑橘香", "night-sweet": "夜甜香" },
  rarity: { common: "常见", unusual: "少见", rare: "稀有" }
};

const languageStorageKey = "florii-language";
function readLanguage() {
  try {
    return localStorage.getItem(languageStorageKey) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

let language = readLanguage();

function t(key, values = {}) {
  const template = translations[language][key] ?? translations.en[key] ?? key;
  return Object.entries(values).reduce((result, [name, value]) => result.split(`{${name}}`).join(String(value)), template);
}

function localizedSeason(value) {
  return seasonNames[language][value] ?? value;
}

function localizedTime(value) {
  return timeNames[language][value] ?? value;
}

function localizedWeather(value) {
  return weatherNames[language][value] ?? value;
}

function localizedStage(value) {
  return stagePhrases[language][value] ?? stagePhrases.en[value] ?? value;
}

function localizedSpeciesName(species) {
  return language === "zh" ? speciesTranslations[species.id]?.name ?? species.name : species.name;
}

function localizedSpeciesDescription(species) {
  return language === "zh" ? speciesTranslations[species.id]?.description ?? species.description : species.description;
}

function localizedColor(value) {
  return language === "zh" ? colorNames[value] ?? value : value;
}

function localizedPattern(value) {
  return language === "zh" ? enumNames.pattern[value] ?? value : value;
}

function localizedFragrance(value) {
  return language === "zh" ? enumNames.fragrance[value] ?? value : value;
}

function localizedRarity(value) {
  return language === "zh" ? enumNames.rarity[value] ?? value : value;
}

function localizedGardenName(value) {
  return value === "A Quiet Patch" ? t("defaultGardenName") : value;
}

function localizedChronicleText(value) {
  if (value === "A patch of earth") return t("defaultChronicleTitle");
  if (value === "The garden began quietly, with open soil and time ahead of it.") return t("defaultChronicleText");
  return value;
}

function localizedTrait(value) {
  if (language !== "zh") return value;
  const direct = {
    "quick-growing": "长得很快",
    patient: "很有耐心",
    "rain-loving": "爱雨",
    "dry-rooted": "耐旱根",
    "weather-hardy": "抗天气",
    "tall-stemmed": "高高的茎",
    "low-growing": "贴地生长",
    "rare variation": "稀有变体"
  };
  if (direct[value]) return direct[value];
  if (enumNames.pattern[value]) return enumNames.pattern[value];
  if (value.endsWith("-scented")) return `${localizedFragrance(value.slice(0, -8))}`;
  return value;
}

function applyLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  $$('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-content]').forEach((element) => { element.setAttribute("content", t(element.dataset.i18nContent)); });
  $$('[data-i18n-aria-label]').forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)); });
  $$('[data-i18n-title]').forEach((element) => { element.setAttribute("title", t(element.dataset.i18nTitle)); });
  const toggle = $("#language-toggle");
  if (toggle) {
    toggle.textContent = language === "zh" ? "EN" : "中";
    toggle.setAttribute("aria-label", t(language === "zh" ? "switchToEnglish" : "switchToChinese"));
    toggle.title = t(language === "zh" ? "switchToEnglish" : "switchToChinese");
    toggle.setAttribute("aria-pressed", String(language === "zh"));
  }
  if (currentData) render(currentData);
}

function setLanguage(nextLanguage) {
  language = nextLanguage === "zh" ? "zh" : "en";
  try { localStorage.setItem(languageStorageKey, language); } catch { /* private browsing can decline storage */ }
  applyLanguage();
}

export function timeOfDayForHour(hour) {
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 15) return "day";
  if (hour >= 15 && hour < 19) return "afternoon";
  return "night";
}

function hourInTimezone(timezone) {
  if (!timezone) return new Date().getHours();
  try {
    const hour = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date()).find((part) => part.type === "hour")?.value;
    return Number.parseInt(hour ?? "", 10);
  } catch {
    return new Date().getHours();
  }
}
export const phrases = stagePhrases.en;

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
    element.setAttribute("aria-label", t("viewPlant", { name: plant.name, stage: localizedStage(plant.stage) }));
    element.style.left = `${plant.position.x}%`;
    const gardenDepth = 49 + plant.position.y * .47;
    element.style.top = `${gardenDepth}%`;
    element.style.zIndex = String(Math.round(gardenDepth));
    element.style.setProperty("--depth-scale", String(.68 + plant.position.y * .0037));
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
    label.textContent = `${plant.name} · ${localizedColor(phenotype.colorName)} ${localizedPattern(phenotype.pattern)}`;
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

function familyDescription(plant) {
  const family = plant.generation > 1
    ? t("familyGeneration", { count: plant.generation })
    : plant.origin === "wind"
      ? t("familyWind")
      : t("familyPlanted");
  if (!plant.archivedAt) return family;
  return t("familyArchived", {
    family,
    day: plant.archivedGardenDay,
    note: plant.note ? ` ${plant.note}` : ""
  });
}

function openPlant(plant) {
  const dialog = $("#plant-dialog");
  const catalog = currentData?.catalog ?? [];
  const species = catalog.find((item) => item.id === plant.species);
  const phenotype = phenotypeFor(plant, speciesStyle[plant.species] ?? speciesStyle.starpetal);
  $("#dialog-species").textContent = `${species ? localizedSpeciesName(species) : plant.species} · ${t("generation", { count: plant.generation })}`;
  $("#dialog-plant-name").textContent = plant.name;
  $("#dialog-description").textContent = species ? localizedSpeciesDescription(species) : t("smallPlantDescription");
  const portrait = $("#dialog-portrait");
  portrait.replaceChildren(makePlantFigure({ ...plant, stage: plant.stage === "seed" ? "young" : plant.stage }, false));
  portrait.style.setProperty("--portrait-color", phenotype.primaryColor);

  const swatches = $("#dialog-swatches");
  swatches.replaceChildren();
  for (const [key, color] of [["primary", phenotype.primaryColor], ["secondary", phenotype.secondaryColor], ["center", phenotype.centerColor]]) {
    const swatch = document.createElement("span");
    swatch.style.background = color;
    swatch.title = `${t(key)}: ${color}`;
    swatch.setAttribute("aria-label", `${t(key)} ${t("colorWord")} ${color}`);
    swatches.append(swatch);
  }

  const facts = $("#dialog-facts");
  facts.replaceChildren();
  addFact(facts, t("factStage"), localizedStage(plant.stage));
  addFact(facts, t("factAge"), t("gardenDays", { count: plant.ageDays }));
  addFact(facts, t("factBlooms"), String(plant.blooms));
  addFact(facts, t("factFlower"), `${localizedColor(phenotype.colorName)} · ${localizedPattern(phenotype.pattern)}`);
  addFact(facts, t("factFragrance"), localizedFragrance(phenotype.fragrance));
  addFact(facts, t("factWaterNeed"), `${phenotype.waterNeed}%`);
  addFact(facts, t("factGrowthPace"), `${Math.round(phenotype.growthRate * 100)}%`);
  addFact(facts, t("factResilience"), `${phenotype.resilience}%`);
  if (plant.archivedAt) {
    addFact(facts, t("factStatus"), t("transplantedPreserved"));
    addFact(facts, t("factLeftGarden"), t("day", { day: plant.archivedGardenDay }));
  }

  const traits = $("#dialog-traits");
  traits.replaceChildren();
  for (const trait of plant.traits ?? []) {
    const chip = document.createElement("span");
    chip.textContent = localizedTrait(trait);
    traits.append(chip);
  }
  $("#dialog-family").textContent = familyDescription(plant);
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
  rarity.textContent = localizedRarity(phenotype.rarity);
  art.append(rarity);

  const copy = document.createElement("div");
  copy.className = "plant-card-copy";
  const heading = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = plant.name;
  const generation = document.createElement("span");
  generation.textContent = t("generation", { count: plant.generation });
  heading.append(name, generation);
  const subtitle = document.createElement("p");
  subtitle.textContent = `${localizedColor(phenotype.colorName)} ${localizedPattern(phenotype.pattern)} · ${localizedStage(plant.stage)}`;
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
    empty.textContent = t("firstPlanted");
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...plants.map(makeCollectionCard));
}

function makeHerbariumCard(species, entry, archivedResidents = []) {
  const card = document.createElement("article");
  card.className = `herbarium-card${entry ? " discovered" : " locked"}`;

  const art = document.createElement("div");
  art.className = "herbarium-art";
  const style = speciesStyle[species.id] ?? speciesStyle.starpetal;
  if (entry?.variants?.length) {
    const variant = entry.variants[0];
    const phenotype = variant.phenotype;
    art.style.setProperty("--herbarium-color", phenotype.primaryColor);
    art.style.setProperty("--herbarium-color-2", phenotype.secondaryColor);
    art.append(makePlantFigure({
      species: species.id,
      name: localizedSpeciesName(species),
      stage: "blooming",
      generation: 1,
      traits: [],
      phenotype
    }, false));
    const found = document.createElement("span");
    found.className = "herbarium-found";
    found.textContent = t("foundDay", { day: entry.firstDiscoveredGardenDay });
    art.append(found);
  } else {
    const symbol = document.createElement("span");
    symbol.className = "herbarium-silhouette";
    symbol.textContent = style.symbol;
    art.append(symbol);
  }

  const copy = document.createElement("div");
  copy.className = "herbarium-copy";
  const heading = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = entry ? localizedSpeciesName(species) : t("undiscovered");
  const count = document.createElement("span");
  count.textContent = entry
    ? t("seenMany", { count: entry.individualsSeen })
    : species.preferredSeasons.map(localizedSeason).join(" · ");
  heading.append(name, count);

  const note = document.createElement("p");
  note.textContent = entry
    ? t(entry.variants.length === 1 ? "variationOne" : "variationMany", { count: entry.variants.length })
    : t("blankHerbarium");
  copy.append(heading, note);

  if (entry) {
    const variants = document.createElement("div");
    variants.className = "herbarium-variants";
    for (const variant of entry.variants.slice(0, 3)) {
      const chip = document.createElement("span");
      const color = document.createElement("i");
      color.style.background = `linear-gradient(135deg, ${variant.phenotype.primaryColor}, ${variant.phenotype.secondaryColor})`;
      const label = document.createElement("b");
      label.textContent = `${localizedColor(variant.colorName)} · ${localizedPattern(variant.pattern)}`;
      chip.append(color, label);
      variants.append(chip);
    }
    if (entry.variants.length > 3) {
      const more = document.createElement("small");
      more.textContent = t("more", { count: entry.variants.length - 3 });
      variants.append(more);
    }
    copy.append(variants);

    if (entry.notableFinds?.length) {
      const notable = document.createElement("p");
      notable.className = "herbarium-notable";
      const rare = entry.notableFinds.filter((find) => find.rarity === "rare").length;
      notable.textContent = rare
        ? t("rareAndUnusual", { rare, unusual: entry.notableFinds.length - rare })
        : t(entry.notableFinds.length === 1 ? "unusualOne" : "unusualMany", { count: entry.notableFinds.length });
      copy.append(notable);
    }

    if (archivedResidents.length) {
      const archive = document.createElement("div");
      archive.className = "herbarium-residents";
      const label = document.createElement("small");
      label.textContent = t(archivedResidents.length === 1 ? "transplantedOne" : "transplantedMany", { count: archivedResidents.length });
      archive.append(label);
      for (const resident of archivedResidents) {
        const button = document.createElement("button");
        button.type = "button";
        button.addEventListener("click", () => openPlant(resident));
        const dot = document.createElement("i");
        dot.style.background = `linear-gradient(135deg, ${resident.phenotype.primaryColor}, ${resident.phenotype.secondaryColor})`;
        const name = document.createElement("span");
        name.textContent = resident.name;
        const day = document.createElement("b");
        day.textContent = t("day", { day: resident.archivedGardenDay });
        button.append(dot, name, day);
        archive.append(button);
      }
      copy.append(archive);
    }
  }

  card.append(art, copy);
  return card;
}

function renderHerbarium(herbarium, catalog) {
  const data = herbarium ?? { speciesDiscovered: 0, speciesTotal: catalog.length, variantCount: 0, notableCount: 0, archivedCount: 0, archivedResidents: [], entries: [] };
  $("#herbarium-species").textContent = `${data.speciesDiscovered ?? 0} / ${data.speciesTotal ?? catalog.length}`;
  $("#herbarium-variants").textContent = String(data.variantCount ?? 0);
  $("#herbarium-notable").textContent = String(data.notableCount ?? 0);
  $("#herbarium-archived").textContent = String(data.archivedCount ?? 0);
  const entries = new Map((data.entries ?? []).map((entry) => [entry.species, entry]));
  const archivedBySpecies = new Map();
  for (const resident of data.archivedResidents ?? []) {
    const residents = archivedBySpecies.get(resident.species) ?? [];
    residents.push(resident);
    archivedBySpecies.set(resident.species, residents);
  }
  $("#herbarium-grid").replaceChildren(...catalog.map((species) => makeHerbariumCard(species, entries.get(species.id), archivedBySpecies.get(species.id) ?? [])));
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
      name: localizedSpeciesName(species),
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
    name.textContent = localizedSpeciesName(species);
    const pace = document.createElement("span");
    pace.textContent = t("daysShort", { count: species.daysToMature });
    top.append(name, pace);
    const description = document.createElement("p");
    description.textContent = localizedSpeciesDescription(species);
    const meta = document.createElement("div");
    meta.className = "seed-meta";
    const seasons = document.createElement("span");
    seasons.textContent = species.preferredSeasons.map(localizedSeason).join(" · ");
    const water = document.createElement("span");
    water.textContent = t("water", { count: species.waterPreference });
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
    title.textContent = localizedChronicleText(entry.title);
    const text = document.createElement("p");
    text.textContent = localizedChronicleText(entry.text);
    copy.append(title, text);
    const time = document.createElement("time");
    time.textContent = t("day", { day: entry.gardenDay });
    row.append(icon, copy, time);
    container.append(row);
  }
  $("#entry-count").textContent = t(total === 1 ? "entriesOne" : "entriesMany", { count: total });
}

function renderMilestones(milestones) {
  const container = $("#milestones");
  container.replaceChildren();
  if (!milestones.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("firstMilestone");
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
  const meta = data.meta ?? {};
  const weather = data.weather;
  const plants = data.plants ?? [];
  const day = Number(data.gardenDay ?? 0);
  const chapterPercent = Math.min(100, Math.floor((day / 90) * 100));
  const timeOfDay = timeOfDayForHour(hourInTimezone(meta.timezone));

  document.title = `${localizedGardenName(data.name)} · ${t("siteTitleSuffix")}`;
  $("#garden-name").textContent = localizedGardenName(data.name);
  $("#garden-day").textContent = String(day);
  $("#hero-season").textContent = localizedSeason(data.season);
  $("#hero-plant-count").textContent = String(plants.length);
  $("#season-label").textContent = t("seasonLight", { season: localizedSeason(data.season), time: localizedTime(timeOfDay) });
  $(".garden-card").dataset.season = data.season;
  $(".garden-card").dataset.weather = weather.condition;
  $(".garden-card").dataset.time = timeOfDay;
  $("#plant-count").textContent = t(plants.length === 1 ? "plantCountOne" : "plantCountMany", { count: plants.length });
  $("#empty-message").hidden = plants.length > 0;
  $("#chapter-percent").textContent = `${chapterPercent}%`;
  $("#chapter-progress").style.width = `${chapterPercent}%`;
  $(".progress").setAttribute("aria-valuenow", String(chapterPercent));
  $("#chapter-copy").textContent = chapterPercent >= 100
    ? t("chapterComplete")
    : day < 14 ? t("firstSeason") : t("patientDays", { days: 90 - day });
  $("#soil-value").textContent = `${data.soil.moisture}%`;
  $("#wild-value").textContent = `${data.character.biodiversity}%`;
  $("#quiet-value").textContent = `${data.character.tranquility}%`;

  $("#weather-icon").textContent = weatherIcons[weather.condition] ?? "◌";
  $("#weather-condition").textContent = localizedWeather(weather.condition);
  $("#temperature").textContent = `${Math.round(weather.temperatureC)}°`;
  $("#weather-caption").textContent = t("weatherCaption", { condition: localizedWeather(weather.condition), time: localizedTime(timeOfDay) });
  const source = data.weatherSource;
  const place = source.placeName ?? (language === "zh" ? "花园" : "the garden");
  $("#source-label").textContent = source.active === "open-meteo" ? t("weatherNear", { place }) : t("weatherLocal");
  $("#weather-detail").textContent = source.active === "open-meteo"
    ? t("weatherDetailOpen", { place })
    : source.selected === "open-meteo" && source.fallbackReason
      ? t("weatherDetailFallback")
      : t("weatherDetailSimulated");

  $("#plants-stage").replaceChildren(...plants.map((plant) => makePlantFigure(plant, true)));
  renderCollection(plants);
  const catalog = data.catalog ?? [];
  renderHerbarium(data.herbarium, catalog);
  renderSeedLibrary(catalog);
  renderChronicle(data.recentChronicle ?? [], Number(meta.chronicleCount ?? data.recentChronicle?.length ?? 0));
  renderMilestones(data.milestones ?? []);
  $("#updated-at").textContent = t("gardenStateChecked", {
    date: new Date(meta.updatedAt ?? Date.now()).toLocaleString(language === "zh" ? "zh-CN" : "en-GB")
  });
}

async function loadGarden(showNotice = false) {
  const button = $("#refresh");
  button.classList.add("loading");
  button.querySelector("span").textContent = t("visiting");
  try {
    const response = await fetch("/api/garden", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.json());
    if (showNotice) showToast(t("refreshNotice"));
  } catch (error) {
    $("#garden-subtitle").textContent = t("loadError");
    showToast(t("savedSafe"));
    console.error(error);
  } finally {
    button.classList.remove("loading");
    button.querySelector("span").textContent = t("visitNow");
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

if ($("#language-toggle")) {
  $("#language-toggle").addEventListener("click", () => setLanguage(language === "zh" ? "en" : "zh"));
}

applyLanguage();

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
