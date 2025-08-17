// scrape-gameguide-pets-batch-singlefile.js
// Reads pet names from pets.txt (one per line) and scrapes Game.Guide pet pages.
// Writes a single info.json containing an array of pet objects.

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const USER_AGENT = "Mozilla/5.0 (compatible; GrowAGardenScraper/1.2; +https://your.site/)";
const DELAY_MS = 2000; // polite delay between requests
const PETS_FILE = path.join(process.cwd(), "pets.txt");
const OUT_FILE = path.join(process.cwd(), "info.json");

if (!fs.existsSync(PETS_FILE)) {
  console.error(`pets.txt not found in ${process.cwd()}. Create pets.txt with one pet name per line.`);
  process.exit(1);
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function titleizeForImage(name) {
  // produce "Dog" -> "Dog", "red fox" -> "Red-Fox"
  return name
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("-")
    .replace(/[^A-Za-z0-9\-]/g, "");
}

function convertSuffix(token) {
  if (!token) return null;
  const t = String(token).trim().replace(/,/g, "");
  const m = t.match(/(-?\d+(\.\d+)?)(\s*([kmbtq]))?/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const suf = (m[4] || "").toLowerCase();
  const multipliers = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };
  return Math.round(num * (multipliers[suf] || 1));
}

function parseValueStr(raw) {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.replace(/\u2013|\u2014/g, "-").trim().replace(/\s+/g, " ");
  const m = s.match(/(-?\d+(\.\d+)?\s*[kmbtq]?)/i);
  if (!m) return null;
  return convertSuffix(m[0]);
}

function parseRangeStr(raw) {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.replace(/\u2013|\u2014/g, "-");
  const m = s.match(/(-?\d+(?:[.,]\d+)?\s*[kmbtq]?)\s*[-–—]\s*(-?\d+(?:[.,]\d+)?\s*[kmbtq]?)/i);
  if (m) {
    const a = convertSuffix(m[1]);
    const b = convertSuffix(m[2]);
    if (a != null && b != null) return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  return null;
}

async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    timeout: 20000,
  });
  return res.data;
}

function textFrom($el) {
  if (!$el || $el.length === 0) return "";
  return $el.text().replace(/\s+/g, " ").trim();
}

function findMainContainer($) {
  const selectors = ["main", "#main", ".entry-content", ".post-content", ".content", ".article"];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el && el.length) return el;
  }
  return $("body");
}

function extractDateStrict(text) {
  if (!text) return null;
  const m = text.match(/([0-9]{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+[0-9]{4})/i);
  if (m) return m[1];
  return null;
}

function looksLikeDateContext(snippet) {
  if (!snippet) return false;
  return /last updated|posted on|updated|posted|august|september|october|november|december|january|february|march|april|may|june|july/i.test(
    snippet
  );
}

function isValueLikely(token, surroundingText = "") {
  if (!token) return false;
  const sufMatch = String(token).match(/[kmbtq]$/i);
  if (sufMatch) return true;
  const num = Number(String(token).replace(/[^0-9.-]/g, ""));
  if (!Number.isNaN(num) && Math.abs(num) >= 1000) return true;
  if (/sheckle|shekels|value|submitted|submitted user value|submitted user/i.test(surroundingText)) return true;
  return false;
}
//if you are doing scraping again in future remember there are two urls for pets means some pets have different urls here they are
// const url = `https://www.game.guide/${slug}-value-in-grow-a-garden`;
// const url = `https://www.game.guide/${slug}-value-grow-a-garden`;
// const url = `https://www.game.guide/${slug}-grow-a-garden`;




async function scrapePet(petName) {
  const slug = slugify(petName);
  const url = `https://www.game.guide/${slug}-value-in-grow-a-garden`;
  const out = {
    petName,
    slug,
    url,
    fetchedAt: new Date().toISOString(),
    title: null,
    description: null,      // <-- added description field
    minValue: null,
    maxValue: null,
    avgValue: null,
    demandRating: null,
    rarity: null,
    lastUpdated: null,
    image: null
  };

  let html;
  try {
    html = await fetchHtml(url);
  } catch (err) {
    throw new Error(`Failed fetching ${url}: ${err.response ? `${err.response.status} ${err.response.statusText}` : err.message}`);
  }

  const $ = cheerio.load(html);

  out.title = textFrom($("h1").first()) || textFrom($("title").first()) || petName;

  // find main article area
  const main = findMainContainer($);

  // -------------------------
  // Description extraction
  // -------------------------
  // Prefer paragraph immediately after H1 that is substantial (skip breadcrumbs/short nav)
  const h1 = $("h1").first();
  let desc = null;
  if (h1 && h1.length) {
    const candidates = h1.nextAll("p").toArray();
    for (const c of candidates) {
      const t = textFrom($(c));
      if (!t) continue;
      if (/home\s*»/i.test(t) || t.length < 30) continue;
      desc = t;
      break;
    }
  }
  if (!desc) {
    // fallback: first paragraph in main which looks substantial
    const p0s = main.find("p").toArray();
    for (const p0 of p0s) {
      const t = textFrom($(p0));
      if (!t) continue;
      if (/home\s*»/i.test(t) || t.length < 30) continue;
      desc = t;
      break;
    }
  }
  out.description = desc || null;

  // find image: og:image -> twitter image -> first article img -> fallback generate
  const og = $('meta[property="og:image"]').attr("content") || $('meta[name="og:image"]').attr("content");
  const tw = $('meta[name="twitter:image"]').attr("content");
  let imageUrl = og || tw || null;
  if (!imageUrl) {
    const articleImg = main.find("img").first();
    if (articleImg && articleImg.attr("src")) imageUrl = articleImg.attr("src");
  }
  // fallback: guess image by pattern (Game.Guide uses Title-based filenames often)
  if (!imageUrl) {
    const generated = `https://www.game.guide/wp-content/uploads/2025/06/${titleizeForImage(petName)}-Value-Grow-a-Garden.png`;
    imageUrl = generated;
  }
  out.image = imageUrl || null;

  // --------------------------
  // Value extraction (improved)
  // --------------------------
  let valueText = null;
  let range = null;

  // 1) Prefer an element whose trimmed text *starts with* "Value"
  const startsWithValue = main.find("*").filter((i, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    return /^Value[:\s]/i.test(t);
  }).first();

  if (startsWithValue && startsWithValue.length) {
    const valT = textFrom(startsWithValue);
    range = parseRangeStr(valT);
    if (!range) {
      const cleaned = valT.replace(/^[\s\S]*?Value[:\s]*/i, "").split(/\n/)[0].trim();
      valueText = cleaned || null;
    }
  }

  // 2) Look for elements containing "Value" and numbers
  if (!valueText && !range) {
    const candidates = main.find("*").filter((i, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      return /\bValue\b/i.test(t) && /\d/.test(t);
    }).toArray();

    for (const el of candidates) {
      const t = textFrom($(el));
      const r = parseRangeStr(t);
      if (r) {
        range = r;
        break;
      }
      const tokens = (t.match(/(-?\d+[\d.,]*\s*[kmbtq]?)/gi) || []).map(s => s.trim());
      for (const tok of tokens) {
        if (isValueLikely(tok, t)) {
          valueText = tok;
          break;
        }
      }
      if (range || valueText) break;
    }
  }

  // 3) Small window after H1
  if (!valueText && !range) {
    let found = null;
    let walker = h1.next();
    let hops = 0;
    while (walker && walker.length && hops < 12) {
      const t = textFrom(walker);
      if (/\d/.test(t) && /k|m|b|t|q|value|sheckle/i.test(t)) {
        found = t;
        break;
      }
      walker = walker.next();
      hops++;
    }
    if (found) {
      const r = parseRangeStr(found);
      if (r) range = r;
      else {
        const m = found.match(/(-?\d+[\d.,]*\s*[kmbtq]?)/i);
        if (m && isValueLikely(m[1], found)) valueText = m[1];
      }
    }
  }

  // 4) HTML search fallback for "Value:" label
  if (!valueText && !range) {
    const mainHtml = $.html(main);
    const vMatch = mainHtml.match(/Value[:\s]*([^<]{1,160})/i);
    if (vMatch && vMatch[1]) {
      const candidate = vMatch[1].trim();
      const r = parseRangeStr(candidate);
      if (r) range = r;
      else {
        const num = candidate.match(/(-?\d+[\d.,]*\s*[kmbtq]?)/i);
        if (num && isValueLikely(num[1], candidate)) valueText = num[1];
      }
    }
  }

  // 5) Final fallback: first numeric token in main but skip date-like tokens
  if (!valueText && !range) {
    const fallbackMatch = textFrom(main).match(/(-?\d+[\d.,]*\s*[kmbtq]?)/i);
    if (fallbackMatch) {
      const token = fallbackMatch[1];
      const surrounding = textFrom(main).slice(0, 200);
      if (isValueLikely(token, surrounding) && !looksLikeDateContext(surrounding)) {
        valueText = token;
      }
    }
  }

  // parse results
  if (range) {
    out.minValue = range.min;
    out.maxValue = range.max;
    out.avgValue = Math.round((range.min + range.max) / 2);
  } else if (valueText) {
    const r2 = parseRangeStr(valueText);
    if (r2) {
      out.minValue = r2.min;
      out.maxValue = r2.max;
      out.avgValue = Math.round((r2.min + r2.max) / 2);
    } else {
      const v = parseValueStr(valueText);
      if (v != null) {
        out.minValue = v;
        out.maxValue = v;
        out.avgValue = v;
      }
    }
  }

  // demand rating (strict)
  const mainText = textFrom(main);
  const demandMatch = mainText.match(/rated at\s*([0-9]{1,2}\/10)/i);
  if (demandMatch) out.demandRating = demandMatch[1];

  // rarity/tier
  let rarity = null;
  const tradableMatch = mainText.match(/tradable\s+([A-Za-z]+)\s+Pet/i);
  if (tradableMatch) rarity = tradableMatch[1];
  if (!rarity) {
    const rarityMatch = mainText.match(/\b(Common|Uncommon|Rare|Epic|Legendary|Mythical|Divine|Prismatic|Event)\b/i);
    if (rarityMatch) rarity = rarityMatch[1];
  }
  out.rarity = rarity || null;

  // lastUpdated — strict date pattern
  const last = extractDateStrict(mainText);
  if (last) out.lastUpdated = last;

  return out;
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  const pets = fs.readFileSync(PETS_FILE, "utf8")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (pets.length === 0) {
    console.error("pets.txt is empty. Add one pet name per line (e.g. Dog).");
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < pets.length; i++) {
    const pet = pets[i];
    console.log(`(${i+1}/${pets.length}) Scraping: ${pet}`);
    try {
      const data = await scrapePet(pet);
      results.push(data);
      console.log("  ->", {
        petName: data.petName,
        minValue: data.minValue,
        maxValue: data.maxValue,
        avgValue: data.avgValue,
        rarity: data.rarity,
        demandRating: data.demandRating,
        lastUpdated: data.lastUpdated,
        image: data.image ? "(found)" : "(none)",
      });
    } catch (err) {
      console.error(`  Error scraping ${pet}: ${err.message}`);
    }
    if (i < pets.length - 1) await sleep(DELAY_MS);
  }

  // write single output file
  fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), items: results }, null, 2), "utf8");
  console.log(`Wrote ${OUT_FILE} with ${results.length} items.`);
}

if (require.main === module) main();
