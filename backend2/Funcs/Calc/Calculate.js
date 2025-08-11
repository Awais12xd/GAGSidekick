import fs from "fs/promises";
import https from "https";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const githubURL =
  "https://raw.githubusercontent.com/Just3itx/Grow-A-Garden-API/main/Funcs/Calc/FruitDatabase.js";
const localPath = path.resolve(__dirname, "./FruitDatabase.mjs");

let ItemData, Rarity, Mutations;

// ✅ Download and convert CommonJS to ESM
async function downloadAndConvertCommonJSToESM(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download ${url}, status code: ${res.statusCode}`
            )
          );
          return;
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", async () => {
          try {
            // Check if response is HTML (e.g., GitHub 404 page)
            if (data.trim().startsWith("<!DOCTYPE html>")) {
              return reject(new Error("Received HTML instead of JS module. Check the GitHub URL."));
            }

            const transformed = data.replace(
              /module\.exports\s*=\s*{([^}]+)}/,
              (match, exports) => {
                const cleaned = exports
                  .split(",")
                  .map(e => e.trim())
                  .filter(Boolean)
                  .map(name => name.replace(/:.*$/, "")) // remove value if it's `name: something`
                  .join(", ");
                return `export { ${cleaned} };`;
              }
            );

            await fs.writeFile(dest, transformed, "utf-8");
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

// ✅ Load FruitDatabase module
async function loadFruitDatabase() {
  try {
    await downloadAndConvertCommonJSToESM(githubURL, localPath);
    const moduleURL = pathToFileURL(localPath).href + `?cacheBust=${Date.now()}`;
    const mod = await import(moduleURL);

    ItemData = mod.ItemData;
    Rarity = mod.Rarity;
    Mutations = mod.Mutations;
  } catch (err) {
    console.error("❌ Failed to load FruitDatabase:", err.message);
    throw err;
  }
}

// 🧠 Utility & Calculation Functions
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFruitData(name) {
  return ItemData.find((item) => item[0] === name) || null;
}

function calculateVariant(variantName) {
  const variant = Rarity.find((v) => v[0] === variantName);
  return variant ? variant[2] : 1;
}

function calculateMutation(tool) {
  if (!tool.attributes || !Array.isArray(tool.attributes)) return 1;

  let mutationCount = 1;
  for (const attr of tool.attributes) {
    const mutation = Mutations[attr];
    if (mutation?.ValueMulti) {
      mutationCount += mutation.ValueMulti - 1;
    }
  }
  return mutationCount;
}

function calculateFruit(tool) {
  if (!tool || typeof tool.Name !== "string") {
    console.warn("Invalid tool or missing Name.");
    return 0;
  }

  const itemData = getFruitData(tool.Name);
  if (!itemData || itemData.length < 3) {
    console.warn(`No item data found for fruit: ${tool.Name}`);
    return 0;
  }

  const { Weight, Variant } = tool;
  if (typeof Weight !== "object" || typeof Weight.value !== "number") {
    console.warn("Missing or invalid weight for the tool.");
    return 0;
  }

  const baseValue = itemData[2];
  const weightDivisor = itemData[1];
  const variantMultiplier = calculateVariant(Variant?.value || "Normal");
  const mutationValue = calculateMutation(tool);

  const weightRatio = Weight.value / weightDivisor;
  const clampedRatio = clamp(weightRatio, 0.95, 1e8);

  const finalValue = baseValue * mutationValue * variantMultiplier * (clampedRatio ** 2);
  return Math.round(finalValue);
}

// 🔁 Auto-load FruitDatabase at runtime
(async () => {
  try {
    await loadFruitDatabase();
    console.log(`✅ Loaded FruitDatabase with ${ItemData.length} items.`);
  } catch (e) {
    console.error("❌ Error initializing FruitDatabase from remote:", e.message);
    // Attempt to load local cached DB file instead (if available)
    try {
      const cached = await fs.readFile(path.resolve(__dirname, "./FruitDatabaseLocal.json"), "utf8");
      const parsed = JSON.parse(cached);
      ItemData = parsed.ItemData || [];
      Rarity = parsed.Rarity || [];
      Mutations = parsed.Mutations || {};
      console.log(`✅ Loaded cached FruitDatabase with ${ItemData.length} items.`);
    } catch (err) {
      console.warn("⚠️ Could not load cached fruit DB either. Falling back to empty database.");
      ItemData = [];
      Rarity = [];
      Mutations = {};
    }
  }
})();


export { calculateFruit };
