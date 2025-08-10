import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = path.join(__dirname, "Database.json");

const options = {
  method: "GET",
  hostname: "growagarden.gg",
  port: null,
  path: "/api/v1/items/Gag/all?page=1&limit=1000000&sortBy=position",
  headers: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    priority: "u=1, i",
    referer: "https://growagarden.gg/values",
    "Content-Length": "0",
  },
};

let cachedData = null;

function fetchAndUpdateData() {
  console.log("[Item-Info] 🔄 Starting fetch from external API...");
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      console.log(`[Item-Info] 🌐 Status Code: ${res.statusCode}`);
      console.log(`[Item-Info] 📦 Receiving data from server...`);

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        try {
          console.log("[Item-Info] ✅ Data fully received. Parsing...");
          const body = Buffer.concat(chunks);
          const jsonResponse = JSON.parse(body.toString());

          delete jsonResponse.pagination;
          console.log("[Item-Info] 🧹 Pagination removed");

          if (jsonResponse.items && Array.isArray(jsonResponse.items)) {
            console.log(`[Item-Info] 🧹 Cleaning ${jsonResponse.items.length} items...`);
            jsonResponse.items.forEach((item) => {
              delete item.id;
              delete item.trend;
            });
          }

          fs.writeFile(DATA_FILE, JSON.stringify(jsonResponse, null, 2), (err) => {
            if (err) {
              console.error("[Item-Info] ❌ Error writing to data file", err);
              return reject(err);
            }
            cachedData = jsonResponse;
            console.log(`[Item-Info] ✅ Database written to ${DATA_FILE}`);
            resolve();
          });
        } catch (parseErr) {
          console.error(
            "[Item-Info] ❌ Failed to parse JSON. Here's the raw response:\n",
            Buffer.concat(chunks).toString()
          );
          reject(parseErr);
        }
      });
    });

    req.on("error", (err) => {
      console.error("[Item-Info] ❌ Request error", err);
      reject(err);
    });

    req.end();
  });
}

function loadCachedData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      console.log(`[Item-Info] 📁 Loading cached data from ${DATA_FILE}`);
      const dataStr = fs.readFileSync(DATA_FILE, "utf-8");
      cachedData = JSON.parse(dataStr);
      console.log(`[Item-Info] ✅ Cached data loaded (${cachedData.items?.length || 0} items)`);
    } else {
      console.warn("[Item-Info] ⚠️ No cached data file found");
    }
  } catch (err) {
    console.error("[Item-Info] ❌ Error loading cached data from file", err);
  }
}

function filterItems(items, filters) {
  console.log("[Item-Info] 🔎 Filtering items using filters:", filters);
  const result = items.filter((item) => {
    const matchesCategory = filters.category
      ? item.category.toLowerCase() === filters.category.toLowerCase()
      : true;
    const matchesRarity = filters.rarity
      ? item.rarity.toLowerCase() === filters.rarity.toLowerCase()
      : true;
    const matchesName = filters.name
      ? item.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;
    return matchesCategory && matchesRarity && matchesName;
  });
  console.log(`[Item-Info] ✅ Filtered down to ${result.length} items`);
  return result;
}

function register(app) {
  console.log("[Item-Info] 🚀 Registering /api/item-info route");

  app.get("/api/item-info", (req, res) => {
    console.log("[Item-Info] 📥 Incoming request with query:", req.query);

    if (!cachedData || !cachedData.items) {
      console.warn("[Item-Info] ⚠️ No cached data available");
      return res.status(500).json({ error: "Item data not available" });
    }

    const filters = {
      category: req.query.filter || req.query.category,
      rarity: req.query.rarity,
      name: req.query.name,
    };

    const filtered = filterItems(cachedData.items, filters);
    res.json(filtered);
  });
}

fetchAndUpdateData()
  .then(() => console.log("[Item-Info] ✅ Initial fetch and write successful"))
  .catch((err) => {
    console.error(
      "[Item-Info] ❌ Initial fetch failed, using cached data if available:",
      err
    );
    loadCachedData();
  });

export { register };
