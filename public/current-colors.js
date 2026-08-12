import { makePlantFigure } from "./app.js";

const samples = [{"id":"moonbell","name":"Moonbell","plants":[{"species":"moonbell","name":"Moonbell","stage":"blooming","phenotype":{"primaryColor":"#e8e3fc","secondaryColor":"#c6c1e6","centerColor":"#d5b675","colorName":"pearl","pattern":"solid","height":0.99,"bloomSize":1.01,"rarity":"common"}},{"species":"moonbell","name":"Moonbell","stage":"blooming","phenotype":{"primaryColor":"#dcdaff","secondaryColor":"#f2ecf7","centerColor":"#dbbf87","colorName":"lavender","pattern":"solid","height":1.15,"bloomSize":0.82,"rarity":"common"}},{"species":"moonbell","name":"Moonbell","stage":"blooming","phenotype":{"primaryColor":"#bebaeb","secondaryColor":"#e0ddf9","centerColor":"#d7bb83","colorName":"soft violet","pattern":"gradient","height":0.83,"bloomSize":0.9,"rarity":"common"}}]},{"id":"starpetal","name":"Starpetal","plants":[{"species":"starpetal","name":"Starpetal","stage":"blooming","phenotype":{"primaryColor":"#f6becc","secondaryColor":"#fff2b5","centerColor":"#d8b86f","colorName":"rose","pattern":"gradient","height":0.98,"bloomSize":1.16,"rarity":"common"}},{"species":"starpetal","name":"Starpetal","stage":"blooming","phenotype":{"primaryColor":"#fdd1e4","secondaryColor":"#f6c0d3","centerColor":"#d7b66e","colorName":"blush","pattern":"gradient","height":0.97,"bloomSize":1.14,"rarity":"common"}},{"species":"starpetal","name":"Starpetal","stage":"blooming","phenotype":{"primaryColor":"#fee9ad","secondaryColor":"#f8c8d5","centerColor":"#ddb681","colorName":"butter-yellow","pattern":"tipped","height":0.89,"bloomSize":0.94,"rarity":"common"}}]},{"id":"rainmint","name":"Rainmint","plants":[{"species":"rainmint","name":"Rainmint","stage":"blooming","phenotype":{"primaryColor":"#a9dac3","secondaryColor":"#d2ecda","centerColor":"#d6ba75","colorName":"mint-green","pattern":"solid","height":0.92,"bloomSize":0.81,"rarity":"common"}},{"species":"rainmint","name":"Rainmint","stage":"blooming","phenotype":{"primaryColor":"#bfe4d1","secondaryColor":"#8dbfa3","centerColor":"#c6b676","colorName":"sea-glass","pattern":"gradient","height":1.13,"bloomSize":1.14,"rarity":"unusual"}},{"species":"rainmint","name":"Rainmint","stage":"blooming","phenotype":{"primaryColor":"#86bea2","secondaryColor":"#bbe0c9","centerColor":"#d6b76f","colorName":"cool jade","pattern":"gradient","height":1.1,"bloomSize":1.03,"rarity":"common"}}]},{"id":"emberbloom","name":"Emberbloom","plants":[{"species":"emberbloom","name":"Emberbloom","stage":"blooming","phenotype":{"primaryColor":"#ef9e8b","secondaryColor":"#e6998a","centerColor":"#d8ab6d","colorName":"coral","pattern":"tipped","height":1.08,"bloomSize":1.14,"rarity":"common"}},{"species":"emberbloom","name":"Emberbloom","stage":"blooming","phenotype":{"primaryColor":"#e08174","secondaryColor":"#f9ceb5","centerColor":"#dbb775","colorName":"warm red","pattern":"tipped","height":0.93,"bloomSize":1.18,"rarity":"common"}},{"species":"emberbloom","name":"Emberbloom","stage":"blooming","phenotype":{"primaryColor":"#f7bea5","secondaryColor":"#f4b5a1","centerColor":"#d9b56f","colorName":"apricot","pattern":"solid","height":1,"bloomSize":1.02,"rarity":"common"}}]},{"id":"duskfern","name":"Duskfern","plants":[{"species":"duskfern","name":"Duskfern","stage":"blooming","phenotype":{"primaryColor":"#7aa08b","secondaryColor":"#a6bfab","centerColor":"#d7b66d","colorName":"moss-green","pattern":"gradient","height":1.08,"bloomSize":1.13,"rarity":"common"}},{"species":"duskfern","name":"Duskfern","stage":"blooming","phenotype":{"primaryColor":"#93b09d","secondaryColor":"#758f80","centerColor":"#c9af6c","colorName":"silver-green","pattern":"tipped","height":0.85,"bloomSize":1.12,"rarity":"common"}},{"species":"duskfern","name":"Duskfern","stage":"blooming","phenotype":{"primaryColor":"#547769","secondaryColor":"#89a994","centerColor":"#c4b172","colorName":"deep green","pattern":"speckled","height":0.85,"bloomSize":1.08,"rarity":"unusual"}}]},{"id":"cloverlight","name":"Cloverlight","plants":[{"species":"cloverlight","name":"Cloverlight","stage":"blooming","phenotype":{"primaryColor":"#d2e791","secondaryColor":"#e5f2b1","centerColor":"#d7b76e","colorName":"lime-white","pattern":"solid","height":1.02,"bloomSize":1.16,"rarity":"common"}},{"species":"cloverlight","name":"Cloverlight","stage":"blooming","phenotype":{"primaryColor":"#a3c86e","secondaryColor":"#d5e797","centerColor":"#d6bc71","colorName":"spring green","pattern":"tipped","height":1.1,"bloomSize":1.13,"rarity":"common"}},{"species":"cloverlight","name":"Cloverlight","stage":"blooming","phenotype":{"primaryColor":"#e0f0a8","secondaryColor":"#d8e89b","centerColor":"#d6be73","colorName":"pale gold","pattern":"gradient","height":1.08,"bloomSize":1.01,"rarity":"common"}}]},{"id":"snowlace","name":"Snowlace","plants":[{"species":"snowlace","name":"Snowlace","stage":"blooming","phenotype":{"primaryColor":"#f3f7ff","secondaryColor":"#d2e0ef","centerColor":"#d5bd84","colorName":"snow-white","pattern":"tipped","height":0.99,"bloomSize":0.99,"rarity":"common"}},{"species":"snowlace","name":"Snowlace","stage":"blooming","phenotype":{"primaryColor":"#cadbf1","secondaryColor":"#baccdf","centerColor":"#d4b776","colorName":"ice-blue","pattern":"tipped","height":1.01,"bloomSize":0.92,"rarity":"unusual"}},{"species":"snowlace","name":"Snowlace","stage":"blooming","phenotype":{"primaryColor":"#a9c2df","secondaryColor":"#d3e0ef","centerColor":"#d7b772","colorName":"winter silver","pattern":"tipped","height":0.9,"bloomSize":0.89,"rarity":"common"}}]},{"id":"sunsigh","name":"Sunsigh","plants":[{"species":"sunsigh","name":"Sunsigh","stage":"blooming","phenotype":{"primaryColor":"#f4b059","secondaryColor":"#f9d77d","centerColor":"#dab86d","colorName":"amber","pattern":"gradient","height":1.1,"bloomSize":0.97,"rarity":"common"}},{"species":"sunsigh","name":"Sunsigh","stage":"blooming","phenotype":{"primaryColor":"#ffe6a0","secondaryColor":"#fadb87","centerColor":"#dab86d","colorName":"warm cream","pattern":"solid","height":1.04,"bloomSize":0.87,"rarity":"common"}},{"species":"sunsigh","name":"Sunsigh","stage":"blooming","phenotype":{"primaryColor":"#f9d573","secondaryColor":"#ffebb2","centerColor":"#dfbf77","colorName":"sun-gold","pattern":"solid","height":1.16,"bloomSize":1.05,"rarity":"common"}}]},{"id":"tideglass","name":"Tideglass","plants":[{"species":"tideglass","name":"Tideglass","stage":"blooming","phenotype":{"primaryColor":"#8dcfd4","secondaryColor":"#e0f5ec","centerColor":"#d7c082","colorName":"tidal teal","pattern":"gradient","height":0.96,"bloomSize":0.99,"rarity":"common"}},{"species":"tideglass","name":"Tideglass","stage":"blooming","phenotype":{"primaryColor":"#cff0ec","secondaryColor":"#a0d4d4","centerColor":"#d4b771","colorName":"foam-white","pattern":"speckled","height":1.12,"bloomSize":1.11,"rarity":"unusual"}},{"species":"tideglass","name":"Tideglass","stage":"blooming","phenotype":{"primaryColor":"#bce8e9","secondaryColor":"#dcf4ed","centerColor":"#d7be7d","colorName":"sea-glass blue","pattern":"tipped","height":0.88,"bloomSize":0.91,"rarity":"common"}}]},{"id":"velvethorn","name":"Velvethorn","plants":[{"species":"velvethorn","name":"Velvethorn","stage":"blooming","phenotype":{"primaryColor":"#985e79","secondaryColor":"#865e6f","centerColor":"#cba96b","colorName":"wine-purple","pattern":"tipped","height":0.84,"bloomSize":1.11,"rarity":"common"}},{"species":"velvethorn","name":"Velvethorn","stage":"blooming","phenotype":{"primaryColor":"#5a3a52","secondaryColor":"#82596b","centerColor":"#d6b56d","colorName":"deep plum","pattern":"solid","height":1.05,"bloomSize":0.88,"rarity":"common"}},{"species":"velvethorn","name":"Velvethorn","stage":"blooming","phenotype":{"primaryColor":"#75485f","secondaryColor":"#745b6a","centerColor":"#d6b56d","colorName":"mulberry","pattern":"gradient","height":1.04,"bloomSize":1.08,"rarity":"common"}}]},{"id":"lanternmoss","name":"Lanternmoss","plants":[{"species":"lanternmoss","name":"Lanternmoss","stage":"blooming","phenotype":{"primaryColor":"#c5d877","secondaryColor":"#a7bf74","centerColor":"#d7b66d","colorName":"lantern green","pattern":"gradient","height":1.01,"bloomSize":1.01,"rarity":"common"}},{"species":"lanternmoss","name":"Lanternmoss","stage":"blooming","phenotype":{"primaryColor":"#abbb68","secondaryColor":"#eac873","centerColor":"#d9b76d","colorName":"lichen green","pattern":"gradient","height":0.96,"bloomSize":0.97,"rarity":"common"}},{"species":"lanternmoss","name":"Lanternmoss","stage":"blooming","phenotype":{"primaryColor":"#e8c46a","secondaryColor":"#b3c782","centerColor":"#cfb66c","colorName":"moss-gold","pattern":"tipped","height":1.02,"bloomSize":0.96,"rarity":"common"}}]},{"id":"cloudpoppy","name":"Cloudpoppy","plants":[{"species":"cloudpoppy","name":"Cloudpoppy","stage":"blooming","phenotype":{"primaryColor":"#eef0ff","secondaryColor":"#f4dce7","centerColor":"#dbbb7f","colorName":"pale sky","pattern":"gradient","height":0.87,"bloomSize":1,"rarity":"common"}},{"species":"cloudpoppy","name":"Cloudpoppy","stage":"blooming","phenotype":{"primaryColor":"#f2ddec","secondaryColor":"#f1f1f9","centerColor":"#dabe80","colorName":"mist-pink","pattern":"tipped","height":1.1,"bloomSize":1.12,"rarity":"common"}},{"species":"cloudpoppy","name":"Cloudpoppy","stage":"blooming","phenotype":{"primaryColor":"#cacaf1","secondaryColor":"#f0f1fc","centerColor":"#dabd7d","colorName":"cloud violet","pattern":"tipped","height":0.89,"bloomSize":0.85,"rarity":"unusual"}}]}];

const previewRoot = document.getElementById("florii-color-preview");
const container = previewRoot.querySelector("#species-rows");

for (const species of samples) {
  const row = document.createElement("article");
  row.className = "species-row";

  const title = document.createElement("div");
  title.className = "species-title";
  const heading = document.createElement("h2");
  heading.textContent = species.name;
  const note = document.createElement("span");
  note.textContent = "3 generated individuals";
  title.append(heading, note);
  row.append(title);

  for (const plant of species.plants) {
    const variant = document.createElement("section");
    variant.className = "variant";
    variant.style.setProperty("--primary", plant.phenotype.primaryColor);
    variant.style.setProperty("--secondary", plant.phenotype.secondaryColor);

    const art = document.createElement("div");
    art.className = "variant-art";
    const previewPlant = {
      ...plant,
      phenotype: {
        ...plant.phenotype,
        height: 1,
        bloomSize: 1
      }
    };
    art.append(makePlantFigure(previewPlant, false));

    const copy = document.createElement("div");
    copy.className = "variant-copy";
    const name = document.createElement("strong");
    name.textContent = plant.phenotype.colorName;
    const pattern = document.createElement("span");
    pattern.textContent = `${plant.phenotype.pattern} · ${plant.phenotype.rarity}`;
    const swatches = document.createElement("div");
    swatches.className = "variant-swatches";
    for (const color of [plant.phenotype.primaryColor, plant.phenotype.secondaryColor, plant.phenotype.centerColor]) {
      const swatch = document.createElement("i");
      swatch.style.background = color;
      swatches.append(swatch);
    }
    copy.append(name, pattern, swatches);
    variant.append(art, copy);
    row.append(variant);
  }
  container.append(row);
}
