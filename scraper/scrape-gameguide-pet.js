// scrape-gameguide-pets-batch-singlefile.js
// (only modified numeric/suffix parsing and companion regexes; rest of your original file is intact)

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const USER_AGENT = "Mozilla/5.0 (compatible; GrowAGardenScraper/1.6; +https://your.site/)";
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
  return name
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("-")
    .replace(/[^A-Za-z0-9\-]/g, "");
}

/**
 * convertSuffix:
 * accepts tokens like:
 *  - "50k", "1.2m", "3b", "5t", "2q"
 *  - "5Sx" or "5 sx", "7qi" (quintillion), etc.
 * returns Number (when safe) or Number (possibly imprecise for huge values)
 * NOTE: JavaScript Number loses integer precision > Number.MAX_SAFE_INTEGER (~9.007e15).
 * If you need exact integers for very large suffixes (e.g. up to 999 Sx), request the BigInt-safe output.
 */
function convertSuffix(token) {
  if (!token) return null;
  // normalize token (remove commas, trim)
  const tRaw = String(token).trim().replace(/,/g, "");
  // match number part + optional suffix (1-3 letters)
  const m = tRaw.match(/^(-?\d+(?:\.\d+)?)(?:\s*([a-z]{1,3}))?$/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const suf = (m[2] || "").toLowerCase();

  // multiplier map expressed as exact powers-of-ten (use Numbers)
  // k = thousand, m = million, b = billion, t = trillion, q = quadrillion,
  // qi = quintillion (1e18), sx = sextillion (1e21), sp = septillion (1e24)
  const multipliers = {
    "": 1,
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12,
    q: 1e15,    // quadrillion
    qa: 1e15,   // sometimes used
    qi: 1e18,   // quintillion
    sx: 1e21,   // sextillion
    sp: 1e24,   // septillion
    oc: 1e27    // octillion (if needed)
  };

  const multiplier = multipliers[suf] || 1;

  const result = num * multiplier;

  // warn if result exceeds safe integer range
  if (Math.abs(result) > Number.MAX_SAFE_INTEGER) {
    console.warn(
      `Warning: parsed value "${token}" => ${result} exceeds Number.MAX_SAFE_INTEGER (${Number.MAX_SAFE_INTEGER}). ` +
      `This may lose integer precision in JS Number. If you need exact integers (no precision loss) request the BigInt-safe parser.`
    );
  }

  return Math.round(result);
}

/**
 * parseAllNumericTokens:
 * find tokens like "1,234", "3.5m", "12 sx", "7Sx", etc.
 * returns array of { rawToken, parsed } where parsed is result of convertSuffix (Number or null)
 */
function parseAllNumericTokens(raw) {
  if (!raw || typeof raw !== "string") return [];
  // allow 1-3 letter suffixes (k,m,b,t,q,qi,sx,sp,...)
  const tokens = (raw.match(/-?\d+(?:[.,]\d+)?(?:\s*[a-z]{1,3})?/gi) || [])
    .map(t => t.replace(/\s+/g, ""));
  const out = [];
  for (const t of tokens) {
    const p = convertSuffix(t);
    if (p != null) out.push({ rawToken: t, parsed: p });
  }
  return out;
}

// parseRangeStr: accept suffixes as above (update regex to accept 1-3-letter suffix)
function parseRangeStr(raw) {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.replace(/\u2013|\u2014/g, "-");
  const m = s.match(/(-?\d+(?:[.,]\d+)?(?:\s*[a-z]{1,3})?)\s*[-–—]\s*(-?\d+(?:[.,]\d+)?(?:\s*[a-z]{1,3})?)/i);
  if (m) {
    const a = convertSuffix(m[1].replace(/,/g, "").replace(/\s+/g, ""));
    const b = convertSuffix(m[2].replace(/,/g, "").replace(/\s+/g, ""));
    if (a != null && b != null) return { min: Math.min(a, b), max: Math.max(a, b), rawA: m[1].trim(), rawB: m[2].trim() };
  }
  return null;
}

// isDateLikeNumber unchanged (works with numbers)
function extractDateStrict(text) {
  if (!text) return null;
  const m = text.match(/([0-9]{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+[0-9]{4})/i);
  if (m) return m[1];
  return null;
}

function looksLikeDateContext(snippet) {
  if (!snippet) return false;
  return /last updated|posted on|updated|posted|august|september|october|november|december|january|february|march|april|may|june|july|posted on/i.test(
    snippet
  );
}

function isDateLikeNumber(parsedNum, surroundingText = "") {
  if (parsedNum == null) return false;
  // parsedNum expected to be Number here
  if (parsedNum >= 1900 && parsedNum <= 2100) return true; // years
  if (looksLikeDateContext(surroundingText)) return true;
  return false;
}

function isValueLikely(token, surroundingText = "") {
  if (!token) return false;
  const sufMatch = String(token).match(/([a-z]{1,3})$/i);
  if (sufMatch) return true;
  const num = Number(String(token).replace(/[^0-9.-]/g, ""));
  if (!Number.isNaN(num) && Math.abs(num) >= 1000 && !(num >= 1900 && num <= 2100)) return true;
  if (/sheckle|shekels|value|submitted|submitted user value|submitted user|trading value/i.test(surroundingText)) return true;
  return false;
}

// (rest of your script follows unchanged) ------------------------------------------------
// URL_TEMPLATES, fetchHtml, textFrom, findMainContainer, scrapePet, sleep, main, etc.
// For brevity I will re-include the unchanged functions/flow exactly as you provided earlier,
// since only the suffix/number parsing needed updating.
//
// Paste the remaining body of your original file here (unchanged) — i.e. the fetchHtml, textFrom,
// findMainContainer, extractDateStrict, scrapePet implementation and the main() driver loop.


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
  return /last updated|posted on|updated|posted|august|september|october|november|december|january|february|march|april|may|june|july|posted on/i.test(
    snippet
  );
}

function isDateLikeNumber(parsedNum, surroundingText = "") {
  if (parsedNum == null) return false;
  if (parsedNum >= 1900 && parsedNum <= 2100) return true; // years
  if (looksLikeDateContext(surroundingText)) return true;
  return false;
}

function isValueLikely(token, surroundingText = "") {
  if (!token) return false;
  const sufMatch = String(token).match(/(k|m|b|t|q|sx)$/i);
  if (sufMatch) return true;
  const num = Number(String(token).replace(/[^0-9.-]/g, ""));
  if (!Number.isNaN(num) && Math.abs(num) >= 1000 && !(num >= 1900 && num <= 2100)) return true;
  if (/sheckle|shekels|value|submitted|submitted user value|submitted user|trading value/i.test(surroundingText)) return true;
  return false;
}

// URL templates (tries each until fetch succeeds)
const URL_TEMPLATES = [
  (slug) => `https://www.game.guide/${slug}-value-in-grow-a-garden`,
  (slug) => `https://www.game.guide/${slug}-value-grow-a-garden`,
  (slug) => `https://www.game.guide/${slug}-grow-a-garden`,
  () => `https://www.game.guide/seedling-value-in-grow-a-garden-whats-it-worth`,
];

async function scrapePet(petName) {
  const slug = slugify(petName);

  const out = {
    petName,
    slug,
    url: null,
    triedUrls: [],
    fetchedAt: new Date().toISOString(),
    title: null,
    description: null,
    // single price field (number) - exact final numeric value or null
    price: null,
    demandRating: null,
    rarity: null,
    lastUpdated: null,
    image: null,
    fetchError: null
  };

  // try URLs
  let html = null;
  let successfulUrl = null;
  for (const tpl of URL_TEMPLATES) {
    const tryUrl = typeof tpl === "function" ? tpl(slug) : tpl;
    try {
      html = await fetchHtml(tryUrl);
      successfulUrl = tryUrl;
      out.triedUrls.push({ url: tryUrl, ok: true });
      break;
    } catch (err) {
      const msg = err && err.response ? `${err.response.status} ${err.response.statusText}` : (err && err.message ? err.message : String(err));
      out.triedUrls.push({ url: tryUrl, ok: false, error: msg });
    }
  }

  if (!html) {
    out.fetchError = `Failed to fetch any of the candidate URLs for slug "${slug}".`;
    out.url = out.triedUrls.length ? out.triedUrls[0].url : null;
    return out;
  }

  out.url = successfulUrl;
  const $ = cheerio.load(html);

  out.title = textFrom($("h1").first()) || textFrom($("title").first()) || petName;
  const main = findMainContainer($);
  const mainHtml = $.html(main);
  const mainText = textFrom(main);

  // ---------- description ----------
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

  // ---------- image ----------
  const og = $('meta[property="og:image"]').attr("content") || $('meta[name="og:image"]').attr("content");
  const tw = $('meta[name="twitter:image"]').attr("content");
  let imageUrl = og || tw || null;
  if (!imageUrl) {
    const articleImg = main.find("img").first();
    if (articleImg && articleImg.attr("src")) imageUrl = articleImg.attr("src");
  }
  if (!imageUrl) {
    const formatted = petName.trim().replace(/\s+/g, '_').toLowerCase();
    const generated = `https://api.joshlei.com/v2/growagarden/image/${formatted}`;
    imageUrl = generated;
  }
  out.image = imageUrl || null;

  // ---------- price extraction (priority rules) ----------
  let priceFound = false;

  // helper to parse tokens in a string and return largest non-date-like parsed value (or null)
  function largestParsedInStringIgnoringDates(s) {
    const toks = parseAllNumericTokens(s);
    if (!toks || toks.length === 0) return null;
    const filtered = toks.filter(t => !isDateLikeNumber(t.parsed, s));
    const pick = filtered.length ? filtered : toks;
    pick.sort((a, b) => b.parsed - a.parsed);
    return pick[0] ? pick[0].parsed : null;
  }

  // 1) explicit "Sheckles:" label (prefer)
  const shecklesMatch = mainText.match(/Sheckles[:\s]*([0-9.,]+(?:\s*[sS]x)?)/i);
  if (shecklesMatch) {
    const raw = shecklesMatch[1].replace(/\s+/g, "");
    const parsed = convertSuffix(raw);
    if (parsed != null && !isDateLikeNumber(parsed, shecklesMatch[0])) {
      out.price = parsed;
      priceFound = true;
    }
  }

  // 2) any 'Sx' tokens anywhere (prefer the largest Sx)
  if (!priceFound) {
    const sxTokens = (mainText.match(/-?\d+(?:[.,]\d+)?\s*[sS]x/g) || []).map(t => t.replace(/\s+/g, ""));
    if (sxTokens.length) {
      const parsed = sxTokens.map(t => convertSuffix(t)).filter(p => p != null && !isDateLikeNumber(p, mainText));
      if (parsed.length) {
        parsed.sort((a, b) => b - a);
        out.price = parsed[0];
        priceFound = true;
      }
    }
  }

  // 3) explicit "Value:" label (e.g. "Value: 250K")
  if (!priceFound) {
    const valMatch = mainText.match(/Value[:\s]*([0-9.,]+(?:\s*(?:k|m|b|t|q|sx))?)/i);
    if (valMatch) {
      const raw = valMatch[1].replace(/\s+/g, "");
      const parsed = convertSuffix(raw);
      if (parsed != null && !isDateLikeNumber(parsed, valMatch[0])) {
        out.price = parsed;
        priceFound = true;
      }
    }
  }

  // 4) explicit "Trading Value:" label
  if (!priceFound) {
    const tradingMatch = mainText.match(/Trading Value[:\s]*([0-9.,]+\s*(?:k|m|b|t|q|sx)?)/i);
    if (tradingMatch) {
      const raw = tradingMatch[1].trim().replace(/\s+/g, "");
      const parsed = convertSuffix(raw);
      if (parsed != null && !isDateLikeNumber(parsed, tradingMatch[0])) {
        out.price = parsed;
        priceFound = true;
      }
    }
  }

  // 5) any min-max anywhere (take max)
  if (!priceFound) {
    const anywhereRange = parseRangeStr(mainText) || parseRangeStr(mainHtml);
    if (anywhereRange && !isDateLikeNumber(anywhereRange.max, mainText)) {
      out.price = anywhereRange.max;
      priceFound = true;
    }
  }

  // 6) Value / "GG Value" / Submitted blocks — largest numeric inside block
  if (!priceFound) {
    const valueEl = main.find("*").filter((i, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      return /\b(Value|GG Value|SUBMITTED USER VALUE|SUBMIT VALUE)\b/i.test(t) && /\d/.test(t);
    }).first();

    if (valueEl && valueEl.length) {
      const blockText = textFrom(valueEl);
      const candidate = largestParsedInStringIgnoringDates(blockText);
      if (candidate != null) {
        out.price = candidate;
        priceFound = true;
      }
    }
  }

  // 7) Small window after H1 — largest parsed token among the next few siblings
  if (!priceFound) {
    let walker = h1.next();
    let hops = 0;
    const collected = [];
    while (walker && walker.length && hops < 12) {
      const t = textFrom(walker);
      if (t && /\d/.test(t)) collected.push(t);
      walker = walker.next();
      hops++;
    }
    if (collected.length > 0) {
      let best = null;
      for (const block of collected) {
        const r = parseRangeStr(block);
        if (r && !isDateLikeNumber(r.max, block)) {
          if (!best || r.max > best) best = r.max;
        } else {
          const l = largestParsedInStringIgnoringDates(block);
          if (l && (!best || l > best)) best = l;
        }
      }
      if (best) {
        out.price = best;
        priceFound = true;
      }
    }
  }

  // 8) final conservative fallback
  if (!priceFound) {
    const fallbackMatch = mainText.match(/([0-9]+(?:[.,]\d+)?\s*(?:k|m|b|t|q|sx)?)/i);
    if (fallbackMatch) {
      const token = fallbackMatch[1].replace(/\s+/g, "");
      const surrounding = mainText.slice(0, 400);
      const parsed = convertSuffix(token);
      if (parsed != null && !isDateLikeNumber(parsed, surrounding) && isValueLikely(token, surrounding)) {
        out.price = parsed;
        priceFound = true;
      }
    }
  }

  // leave price null if not found
  // ---------- demand / rarity / lastUpdated ----------
  const demandMatch = mainText.match(/rated at\s*([0-9]{1,2}\/10)/i);
  if (demandMatch) out.demandRating = demandMatch[1];

  let rarity = null;
  const tradableMatch = mainText.match(/tradable\s+([A-Za-z]+)\s+Pet/i);
  if (tradableMatch) rarity = tradableMatch[1];
  if (!rarity) {
    const rarityMatch = mainText.match(/\b(Common|Uncommon|Rare|Epic|Legendary|Mythical|Divine|Prismatic|Event)\b/i);
    if (rarityMatch) rarity = rarityMatch[1];
  }
  out.rarity = rarity || null;

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
        price: data.price,
        rarity: data.rarity,
        demandRating: data.demandRating,
        lastUpdated: data.lastUpdated,
        image: data.image ? "(found)" : "(none)",
        fetchError: data.fetchError ? "(fetch error)" : undefined,
      });
      if (data.fetchError) {
        console.warn(`     Tried URLs:`, data.triedUrls);
      }
    } catch (err) {
      console.error(`  Error scraping ${pet}: ${err.message}`);
    }
    if (i < pets.length - 1) await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), items: results }, null, 2), "utf8");
  console.log(`Wrote ${OUT_FILE} with ${results.length} items.`);
}

if (require.main === module) main();
