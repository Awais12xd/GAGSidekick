#!/usr/bin/env node
/**
 * groupPlants.js
 *
 * Reads plantsData.json (array of plant objects) and groups them into categories
 * defined in the builtin `CATEGORIES` map (based on your lists).
 *
 * Outputs:
 *  - categorizedPlants.json  (object: { fetchedAt, sourceFile, categories: { [categoryName]: [plantObjects] }, stats })
 *  - plantsWithCategories.json (array of all plants with added `categories` array)
 *
 * Usage:
 *   node groupPlants.js [plantsDataPath] [outCategorizedPath]
 *
 * If no args given, defaults:
 *   plantsDataPath = ./plantsData.json
 *   outCategorizedPath = ./categorizedPlants.json
 */

const fs = require("fs");
const path = require("path");

// --- configuration / categories mapping (from your provided lists) ---
const CATEGORIES = {
  "Berry Plants": [
    "Blueberry",
    "Celestiberry",
    "Cranberry",
    "Elder Strawberry",
    "Grape",
    "Lingonberry",
    "Raspberry",
    "Strawberry",
    "White Mulberry",
  ],

  "Candy Plants": [
    "Blue Lollipop",
    "Candy Blossom",
    "Candy Sunflower",
    "Chocolate Carrot",
    "Easter Egg",
    "Red Lollipop",
    "Sugarglaze",
  ],

  "Flower Plants": [
    "Artichoke","Bee Balm","Burning Bud","Candy Blossom","Candy Sunflower","Cherry Blossom","Crocus","Cyclamen","Daffodil","Dezen","Ember Lily","Firework Flower","Flare Daisy","Foxglove","Grand Volcania","Hinomai","Honeysuckle","Lavender","Liberty Lily","Lilac","Lily of the Valley","Lotus","Manuka Flower","Monoblooma","Moonflower","Moon Blossom","Nightshade","Noble Flower","Orange Tulip","Parasol Flower","Pink Lily","Pink Tulip","Purple Dahlia","Rafflesia","Rose","Rosy Delight","Serenity","Soft Sunshine","Stonebite","Sunflower","Succulent","Taro Flower","Veinpetal","Zenflare"
  ],

  "Fruit Plants": [
    "Apple","Avocado","Banana","Blood Banana","Blueberry","Canary Melon","Coconut","Cranberry","Crown Melon","Dragon Fruit","Durian","Grand Tomato","Grape","Green Apple","Hive Fruit","Kiwi","Lemon","Lime","Lingonberry","Loquat","Mango","Mangosteen","Maple Apple","Moon Melon","Nectarine","Papaya","Passionfruit","Peach","Pear","Pineapple","Pricklefruit","Raspberry","Spiked Mango","Starfruit","Strawberry"
  ],

  "Fungus Plants": [
    "Duskpuff","Glowshroom","Horned Dinoshroom","Mega Mushroom","Mushroom","Nectarshade","Sinisterdrip"
  ],

  "Leafy Plants": [
    "Aloe Vera","Apple","Artichoke","Beanstalk","Bee Balm","Blood Banana","Blueberry","Celestiberry","Cacao","Cantaloupe","Cauliflower","Cranberry","Cyclamen","Dragon Sapling","Eggplant","Elephant Ears","Firefly Fern","Foxglove","Giant Pinecone","Grand Tomato","Grape","Green Apple","Hive Fruit","Honeysuckle","Lilac","Lily of the Valley","Log Pumpkin","Lumina","Mandrake","Mango","Mangosteen","Maple Apple","Mint","Moonflower","Moon Blossom","Moon Mango","Nectarine","Noble Flower","Parasol Flower","Peach","Pineapple","Pink Lily","Pitcher Plant","Princess Thorn","Pumpkin","Purple Dahlia","Rafflesia","Raspberry","Romanesco","Rose","Rosy Delight","Sakura Bush","Serenity","Soft Sunshine","Spiked Mango","Starfruit","Strawberry","Sugar Apple","Sunflower","Tomato","Traveler's Fruit","Twisted Tangle","Watermelon"
  ],

  "Night Plants": [
    "Aura Flora","Blood Banana","Celestiberry","Gleamroot","Glowshroom","Mint","Moonflower","Moonglow","Moon Blossom","Moon Mango","Moon Melon","Nightshade","Starfruit"
  ],

  "Prehistoric Plants": [
    "Amber Spine","Boneboo","Bone Blossom","Firefly Fern","Fossilight","Horned Dinoshroom","Horsetail","Lingonberry","Grand Volcania","Paradise Petal","Stonebite"
  ],

  "Prickly Plants": [
    "Aloe Vera","Cactus","Celestiberry","Dragon Fruit","Durian","Horned Dinoshroom","Nectar Thorn","Pineapple","Pricklefruit","Prickly Pear","Princess Thorn","Spiked Mango","Twisted Tangle","Venus Fly Trap"
  ],

  "Root Plants": [
    "Carrot","Chocolate Carrot","Horsetail","Mandrake","Mutant Carrot","Onion","Potato","Rhubarb","Taro Flower","Tall Asparagus","Wild Carrot"
  ],

  "Sour Plants": [
    "Cranberry","Lemon","Lime","Mangosteen","Passionfruit","Starfruit"
  ],

  "Spicy Plants": [
    "Badlands Pepper","Cacao","Cursed Fruit","Dragon Pepper","Ember Lily","Grand Volcania","Horned Dinoshroom","Jalapeno","Pepper"
  ],

  "Stalky Plants": [
    "Beanstalk","Burning Bud","Bamboo","Bendboo","Dandelion","Elephant Ears","Firefly Fern","Grand Volcania","Hinomai","Horned Dinoshroom","Lily of the Valley","Lucky Bamboo","Lotus","Mushroom","Mutant Carrot","Pitcher Plant","Poseidon Plant","Pricklefruit","Sinisterdrip","Soft Sunshine","Spring Onion","Stonebite","Sugarglaze","Tall Asparagus","Veinpetal"
  ],

  "Summer Plants": [
    "Aloe Vera","Avocado","Banana","Bell Pepper","Blueberry","Butternut Squash","Cantaloupe","Carrot","Cauliflower","Delphinium","Elephant Ears","Feijoa","Green Apple","Guanabana","Kiwi","Lily of the Valley","Loquat","Parasol Flower","Peace Lily","Pear","Pineapple","Pitcher Plant","Prickly Pear","Rafflesia","Rosy Delight","Strawberry","Sugar Apple","Tomato","Traveler's Fruit","Watermelon","Wild Carrot"
  ],

  "Sweet Plants": [
    "Banana","Blue Lollipop","Blueberry","Canary Melon","Candy Blossom","Candy Sunflower","Chocolate Carrot","Crown Melon","Easter Egg","Grape","Mango","Mangosteen","Moon Melon","Nectar Thorn","Peach","Pear","Pineapple","Raspberry","Red Lollipop","Romanesco","Spiked Mango","Starfruit","Strawberry","Sugarglaze","Sugar Apple","Watermelon"
  ],

  "Toxic Plants": [
    "Amber Spine","Cursed Fruit","Horned Dinoshroom","Foxglove","Nightshade","Pitcher Plant","Rafflesia","Sinisterdrip"
  ],

  "Tropical Fruit Plants": [
    "Banana","Coconut","Cocovine","Dragon Fruit","Durian","Honeysuckle","Mango","Papaya","Parasol Flower","Passionfruit","Pineapple","Pitcher Plant","Starfruit","Traveler's Fruit","Watermelon"
  ],

  "Vegetable Plants": [
    "Artichoke","Badlands Pepper","Beanstalk","Bell Pepper","Bitter Melon","Carrot","Cauliflower","Chocolate Carrot","Corn","Dragon Pepper","Eggplant","Grand Tomato","Jalapeno","King Cabbage","Log Pumpkin","Mandrake","Mutant Carrot","Mint","Onion","Pepper","Pumpkin","Purple Cabbage","Romanesco","Rhubarb","Tall Asparagus","Taro Flower","Tomato","Violet Corn","Wild Carrot"
  ],

  "Woody Plants": [
    "Amberheart","Apple","Avocado","Cacao","Coconut","Cocovine","Dragon Sapling","Durian","Duskpuff","Feijoa","Giant Pinecone","Gleamroot","Hive Fruit","Kiwi","Maple Apple","Mango","Mangosteen","Moon Blossom","Moon Mango","Nectarine","Papaya","Peach","Pear","Rhubarb","Sakura Bush","Spiked Mango","Traveler's Fruit"
  ],

  "Zen Plants": [
    "Dezen","Enkaku","Hinomai","Lucky Bamboo","Maple Apple","Monoblooma","Sakura Bush","Serenity","Soft Sunshine","Spiked Mango","Taro Flower","Tranquil Bloom","Zenflare","Zen Rocks"
  ],
};

// --- utilities ---
function normalizeName(s) {
  if (!s || typeof s !== "string") return "";
  // remove diacritics, lower, keep letters/numbers/spaces
  const noDiacritics = s.normalize ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : s;
  return noDiacritics
    .toLowerCase()
    .replace(/[\u2019'’`"]/g, "") // curly apostrophes/quotes
    .replace(/[^a-z0-9\s]/g, " ") // replace non-alnum with space
    .replace(/\s+/g, " ")
    .trim();
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

// --- main ---
async function main() {
  const argv = process.argv.slice(2);
  const plantsPath = argv[0] || path.join(process.cwd(), "plantsData.json");
  const outPath = argv[1] || path.join(process.cwd(), "categorizedPlants.json");
  const outPerPlant = path.join(path.dirname(outPath), "plantsWithCategories.json");

  if (!fs.existsSync(plantsPath)) {
    console.error("plantsData.json not found at:", plantsPath);
    process.exit(1);
  }

  console.log("Loading plants from:", plantsPath);
  const plants = loadJson(plantsPath);
  if (!Array.isArray(plants)) {
    console.error("plantsData.json must be an array of plant objects.");
    process.exit(1);
  }

  // build lookup map: normalized display_name -> array of plant objects (allow duplicates)
  const nameMap = new Map();
  for (const p of plants) {
    const n = normalizeName(p.display_name || p.item_id || "");
    if (!nameMap.has(n)) nameMap.set(n, []);
    nameMap.get(n).push(p);
  }

  // prepare categories normalized sets
  const categoriesNormalized = {};
  for (const [cat, names] of Object.entries(CATEGORIES)) {
    categoriesNormalized[cat] = names.map(n => ({ raw: n, norm: normalizeName(n) }));
  }

  // result containers
  const categorized = {};
  const unmatchedCategoryNames = {}; // cat -> [names not found]
  const plantsAssignedCount = new Map(); // plant.item_id -> count

  // initialize categories arrays
  for (const cat of Object.keys(CATEGORIES)) categorized[cat] = [];

  // helper to add plant to category (avoid duplicates)
  function addPlantToCategory(cat, plant) {
    // avoid duplicates by item_id if present, otherwise by display_name
    const key = plant.item_id || plant.display_name || JSON.stringify(plant);
    const existing = categorized[cat].find(p => (p.item_id && p.item_id === plant.item_id) || p.display_name === plant.display_name);
    if (!existing) {
      categorized[cat].push(plant);
      plantsAssignedCount.set(key, (plantsAssignedCount.get(key) || 0) + 1);
    }
  }

  // matching pass: try exact normalized name -> exact plant; fallback to word-boundary substring search
  for (const [cat, nameObjs] of Object.entries(categoriesNormalized)) {
    unmatchedCategoryNames[cat] = [];
    for (const nm of nameObjs) {
      const targetNorm = nm.norm;
      let matched = false;

      // 1) exact normalized match
      if (nameMap.has(targetNorm)) {
        for (const plant of nameMap.get(targetNorm)) addPlantToCategory(cat, plant);
        matched = true;
      }

      // 2) fuzzy: find plants where normalized display_name contains the target as a whole word
      if (!matched) {
        const re = new RegExp(`\\b${escapeRegExp(targetNorm)}\\b`, "i");
        for (const [plantNorm, plantObjs] of nameMap.entries()) {
          if (re.test(plantNorm)) {
            for (const plant of plantObjs) addPlantToCategory(cat, plant);
            matched = true;
          }
        }
      }

      // 3) very permissive substring (last resort)
      if (!matched) {
        for (const [plantNorm, plantObjs] of nameMap.entries()) {
          if (plantNorm.includes(targetNorm) || targetNorm.includes(plantNorm)) {
            for (const plant of plantObjs) addPlantToCategory(cat, plant);
            matched = true;
          }
        }
      }

      if (!matched) {
        unmatchedCategoryNames[cat].push(nm.raw);
      }
    } // names loop
  } // category loop

  // build per-plant categories
  const plantsWithCategories = plants.map((p) => {
    const pKey = p.item_id || p.display_name;
    const pNorm = normalizeName(p.display_name || p.item_id || "");
    const assigned = [];
    for (const [cat, list] of Object.entries(categorized)) {
      // see if this plant object is present by item_id or display_name
      if (list.some(lp => (lp.item_id && p.item_id && lp.item_id === p.item_id) || (lp.display_name && lp.display_name === p.display_name))) {
        assigned.push(cat);
      } else {
        // fallback: if normalized names match
        for (const lp of list) {
          if (normalizeName(lp.display_name || lp.item_id || "") === pNorm) {
            assigned.push(cat);
            break;
          }
        }
      }
    }
    return { ...p, categories: assigned };
  });

  // find plants not assigned to any category
  const unassignedPlants = plantsWithCategories.filter(p => !p.categories || p.categories.length === 0);

  const output = {
    fetchedAt: new Date().toISOString(),
    sourceFile: path.resolve(plantsPath),
    categories: categorized,
    stats: {
      totalPlants: plants.length,
      totalCategories: Object.keys(CATEGORIES).length,
      assignedPlantsCount: plants.length - unassignedPlants.length,
      unassignedPlantsCount: unassignedPlants.length,
    },
    unmatchedCategoryNames,
  };

  // write outputs
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  fs.writeFileSync(outPerPlant, JSON.stringify(plantsWithCategories, null, 2), "utf8");

  console.log("Wrote categorized file:", outPath);
  console.log("Wrote per-plant categories file:", outPerPlant);
  console.log("Total plants:", plants.length);
  console.log("Assigned plants:", output.stats.assignedPlantsCount);
  console.log("Unassigned plants:", output.stats.unassignedPlantsCount);

  // show summary of unmatched category names (if any)
  let totalUnmatched = 0;
  for (const [cat, arr] of Object.entries(unmatchedCategoryNames)) {
    if (arr.length > 0) {
      totalUnmatched += arr.length;
      console.log(`\nCategory "${cat}" - ${arr.length} unmatched names:`);
      console.log("  ", arr.map(x => `"${x}"`).join(", "));
    }
  }
  if (totalUnmatched === 0) {
    console.log("\nAll category names matched at least one plant object (or an inclusive fallback matched).");
  } else {
    console.log(`\nTotal unmatched category names: ${totalUnmatched}. You may need to add aliases or correct spellings.`);
  }
}

// small util
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
