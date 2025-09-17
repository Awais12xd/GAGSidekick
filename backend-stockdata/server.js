// server.js (complete)
import express from "express";
import cors from "cors";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import process from "process";
import dotenv from "dotenv";
dotenv.config();

import webpush from "web-push";
import { v4 as uuidv4 } from "uuid";

// VAPID
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || "";
const VAPID_CONTACT = process.env.VAPID_CONTACT || "mailto:you@example.com";

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn(
    "[WEBPUSH] VAPID keys missing — set VAPID_PUBLIC and VAPID_PRIVATE in env to enable push."
  );
} else {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);
}

// In-memory subscriptions (demo)
const pushSubscriptions = [];
function addSubscription(entry) {
  pushSubscriptions.push(entry);
}
function removeSubscriptionById(id) {
  const i = pushSubscriptions.findIndex((s) => s.id === id);
  if (i !== -1) pushSubscriptions.splice(i, 1);
}
function findSubscriptionIndexByEndpoint(endpoint) {
  return pushSubscriptions.findIndex(
    (s) => (s.subscription && s.subscription.endpoint) === endpoint
  );
}

// --------------------------- EDIT: SERVER WATCHLIST HERE ---------------------------
const SERVER_WATCHLIST = {
  seeds: [
    { item_id: "beanstalk", display_name: "beanstalk" },
    { item_id: "ember_lily", display_name: "Ember Lily" },
    { item_id: "sugar_apple", display_name: "Sugar Apple" },
    { item_id: "burning_bud", display_name: "Burning Bud" },
    { item_id: "giant_pinecone", display_name: "Giant Pinecone" },
    { item_id: "elder_strawberry", display_name: "Elder Strawberry" },
    { item_id: "romanesco", display_name: "Romanesco" },
  ],
  gear: [
    { item_id: "master_sprinkler", display_name: "Master Sprinkler" },
    { item_id: "grandmaster_sprinkler", display_name: "Grandmaster Sprinkler" },
    { item_id: "levelup_lollipop", display_name: "Levelup Lollipop" },

  ],
  eggs: [{ item_id: "bug_egg", display_name: "Bug Egg" }],
  eggs: [{ item_id: "mythical_egg", display_name: "Mythical Egg" }],
};
// ---------------------- END EDIT: SERVER WATCHLIST SECTION -------------------------

const DISCORD_USER_ID = process.env.DISCORD_USER_ID || "";
const JSTUDIO_KEY = process.env.JSTUDIO_KEY || "";
const PORT = Number(process.env.PORT || 8000);
const UPSTREAM_BASE = "wss://websocket.joshlei.com/growagarden";
const app = express();

const DEBUG = process.env.DEBUG === "1";

// production-friendly defaults
const DEFAULT_MIN_NOTIFY_INTERVAL_MS = 300 * 1000; // 300 seconds = 5 minutes

// Allowed routes users may choose for their own watch items
const USER_ALLOWED_ROUTES = new Set(["seeds", "gear", "eggs"]);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://gardenside.app",
  "https://www.gardenside.app",
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  if (DEBUG)
    console.log(
      "[HTTP]",
      req.method,
      req.path,
      "body=",
      JSON.stringify(req.body || {})
    );
  next();
});
app.set("trust proxy", 1);

let shuttingDown = false;

const latestData = {
  weather: [],
  seeds: [],
  gear: [],
  eggs: [],
  cosmetics: [],
  travelingmerchant: {},
  timestamp: 0,
};

const routeKeyMap = {
  weather: ["weather", "WEATHER"],
  seeds: ["seed_stock", "seedStock", "seeds", "SEED_STOCK", "seed"],
  gear: ["gear_stock", "gear", "GEAR_STOCK"],
  eggs: ["egg_stock", "eggs", "EGG_STOCK", "egg"],
  cosmetics: ["cosmetic_stock", "cosmetics", "COSMETIC_STOCK"],
  travelingmerchant: [
    "travelingmerchant_stock",
    "traveling_merchant_stock",
    "travelingmerchant",
    "traveling_merchant",
    "traveling_merchant_stock_v2",
  ],
  alldata: [],
};
const keyToRoute = {};
for (const [route, keys] of Object.entries(routeKeyMap)) {
  for (const k of keys) keyToRoute[String(k).toLowerCase()] = route;
}
const pathAliasToRoute = {
  travelingmerchant: "travelingmerchant",
  travelingmerchant_stock: "travelingmerchant",
  traveling_merchant_stock: "travelingmerchant",
  traveling_merchant: "travelingmerchant",
  alldata: "alldata",
  weather: "weather",
  seeds: "seeds",
  gear: "gear",
  eggs: "eggs",
  cosmetics: "cosmetics",
};

app.get("/", (req, res) => res.json({ status: 200 }));
app.get("/alldata", (req, res) => res.json(latestData));
app.get("/weather", (req, res) => res.json(latestData.weather ?? []));
app.get("/seeds", (req, res) => res.json(latestData.seeds ?? []));
app.get("/gear", (req, res) => res.json(latestData.gear ?? []));
app.get("/eggs", (req, res) => res.json(latestData.eggs ?? []));
app.get("/cosmetics", (req, res) => res.json(latestData.cosmetics ?? []));
app.get("/travelingmerchant", (req, res) =>
  res.json(latestData.travelingmerchant ?? {})
);
app.get("/travelingmerchant_stock", (req, res) =>
  res.json(latestData.travelingmerchant ?? {})
);
app.get("/traveling_merchant_stock", (req, res) =>
  res.json(latestData.travelingmerchant ?? {})
);

// --- BEGIN: subscribe endpoint (normalized criteria, safer defaults) ---
app.post("/subscribe", (req, res) => {
  if (DEBUG) console.log("[SUBSCRIBE] body=", JSON.stringify(req.body || {}));
  try {
    const { subscription, criteria } = req.body;
    if (!subscription || !subscription.endpoint)
      return res.status(400).json({ error: "missing subscription" });

    // normalize criteria into object
    const normalizedCriteria =
      criteria && typeof criteria === "object" ? { ...criteria } : {};

    // normalize route: only accept user-allowed routes; if invalid remove it
    if (
      normalizedCriteria.route &&
      !USER_ALLOWED_ROUTES.has(String(normalizedCriteria.route))
    ) {
      delete normalizedCriteria.route;
    }

    // normalize items: allow array of strings or array of {route,q} objects
    if (normalizedCriteria.items && !Array.isArray(normalizedCriteria.items)) {
      normalizedCriteria.items = [normalizedCriteria.items];
    }
    if (Array.isArray(normalizedCriteria.items)) {
      normalizedCriteria.items = normalizedCriteria.items
        .map((it) => {
          if (it && typeof it === "object" && it.q) {
            return { route: (it.route || "").toString(), q: it.q.toString() };
          } else if (
            it &&
            typeof it === "object" &&
            (it.route || it.value || it.name)
          ) {
            return {
              route: (it.route || it.value || it.name || "").toString(),
              q: (it.q || it.value || it.name || "").toString(),
            };
          } else {
            return { q: String(it) };
          }
        })
        .filter((x) => x && x.q);
    }

    // minNotifyIntervalMs normalization (optional)
    if (normalizedCriteria.minNotifyIntervalMs) {
      const n = Number(normalizedCriteria.minNotifyIntervalMs || 0);
      normalizedCriteria.minNotifyIntervalMs = Number.isNaN(n) ? undefined : n;
    }

    const existingIdx = findSubscriptionIndexByEndpoint(subscription.endpoint);
    if (existingIdx !== -1) {
      pushSubscriptions[existingIdx].subscription = subscription;
      pushSubscriptions[existingIdx].criteria = normalizedCriteria;
      return res
        .status(200)
        .json({ success: true, id: pushSubscriptions[existingIdx].id });
    }

    const id = uuidv4();
    addSubscription({
      id,
      subscription,
      criteria: normalizedCriteria,
      created: Date.now(),
      lastNotified: {},
    });
    console.log("[WEBPUSH] added subscription", id);
    return res.status(201).json({ success: true, id });
  } catch (err) {
    console.error("[WEBPUSH] subscribe error", err);
    return res.status(500).json({ error: "server error" });
  }
});
// --- END subscribe ---

app.post("/unsubscribe", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "missing id" });
    removeSubscriptionById(id);
    return res.json({ success: true });
  } catch (err) {
    console.error("[WEBPUSH] unsubscribe error", err);
    return res.status(500).json({ error: "server error" });
  }
});

app.get("/debug/subscriptions", (req, res) => {
  return res.json(
    pushSubscriptions.map((s) => ({
      id: s.id,
      endpoint: s.subscription.endpoint,
      criteria: s.criteria,
    }))
  );
});

app.post("/debug/send-test", async (req, res) => {
  try {
    const { id, title, body } = req.body || {};
    const payload = JSON.stringify({
      title: title || "Test notification",
      body: body || "This is a test push from your server.",
      url: "https://your-site.example/",
    });

    const targets = id
      ? pushSubscriptions.filter((s) => s.id === id)
      : [...pushSubscriptions];
    if (!targets || targets.length === 0)
      return res.status(404).json({ error: "no subscriptions found" });

    let sent = 0;
    for (const target of targets) {
      try {
        await webpush.sendNotification(target.subscription, payload, {
          TTL: 60,
          urgency: "high",
        });
        sent++;
        console.log("[WEBPUSH] test sent to", target.id);
      } catch (err) {
        console.warn(
          "[WEBPUSH] test send failed",
          target.id,
          err && (err.statusCode || err)
        );
        if (err && (err.statusCode === 410 || err.statusCode === 404)) {
          removeSubscriptionById(target.id);
          console.log("[WEBPUSH] removed stale subscription", target.id);
        }
      }
    }

    return res.json({ sent, attempted: targets.length });
  } catch (err) {
    console.error("[WEBPUSH] debug send-test error", err);
    return res.status(500).json({ error: "server error" });
  }
});

// HTTP server + WS upgrade handling (unchanged)
const server = http.createServer(app);

const routeClients = {
  weather: new Set(),
  seeds: new Set(),
  gear: new Set(),
  eggs: new Set(),
  cosmetics: new Set(),
  travelingmerchant: new Set(),
  alldata: new Set(),
};

server.on("upgrade", (request, socket, head) => {
  if (shuttingDown) {
    socket.destroy();
    return;
  }
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const rawPath = url.pathname.replace(/^\/+/, "").split("/")[0];
    let route = rawPath || "alldata";
    if (!Object.prototype.hasOwnProperty.call(routeClients, route)) {
      const mapped = pathAliasToRoute[route];
      if (mapped) route = mapped;
    }
    if (!Object.prototype.hasOwnProperty.call(routeClients, route)) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }
    const wss = new WebSocketServer({ noServer: true });
    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.__route = route;
      routeClients[route].add(ws);
      ws.on("close", () => {
        try {
          routeClients[route].delete(ws);
        } catch {}
      });
      ws.on("error", () => {
        try {
          routeClients[route].delete(ws);
        } catch {}
      });

      try {
        if (route === "alldata")
          ws.send(JSON.stringify({ type: "alldata", data: latestData }));
        else {
          const keyData =
            latestData[route] ?? (route === "travelingmerchant" ? {} : []);
          ws.send(
            JSON.stringify({
              type: "update",
              key: route,
              data: keyData,
              timestamp: latestData.timestamp,
            })
          );
        }
      } catch (e) {}
    });
  } catch (err) {
    socket.destroy();
  }
});

function broadcastForRoute(route, payloadObj) {
  const clients = routeClients[route];
  if (!clients || clients.size === 0) return 0;
  const payload = JSON.stringify(payloadObj);
  let sent = 0;
  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) {
      try {
        c.send(payload);
        sent++;
      } catch (e) {}
    }
  }
  if (sent > 0)
    console.log(`[LOCAL WSS] broadcast /${route} -> ${sent} client(s)`);
  return sent;
}
function broadcastAlldata() {
  broadcastForRoute("alldata", { type: "alldata", data: latestData });
}

// Upstream helpers (unchanged except notify logic will use serverWatchMatches below)
let upstream = null;
let upstreamReconnectAttempts = 0;
let authFailed = false;
let lastPayloadSignature = "";

function buildUpstreamUrl() {
  const url = new URL(UPSTREAM_BASE);
  if (DISCORD_USER_ID) url.searchParams.set("user_id", DISCORD_USER_ID);
  if (JSTUDIO_KEY) url.searchParams.set("jstudio-key", JSTUDIO_KEY);
  return url.toString();
}
function safeSig(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(Date.now());
  }
}
function normalizeToMs(v) {
  if (v == null) return null;
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n;
    const p = Date.parse(v);
    if (!Number.isNaN(p)) return p;
  }
  return null;
}
function normalizeTravelingMerchant(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const out = { ...raw };
  if (Array.isArray(out.stock)) {
    out.stock = out.stock.map((it) => {
      const item = { ...it };
      if (item.Date_Start && !item.start_date_unix) {
        const sMs = normalizeToMs(item.Date_Start);
        if (sMs) item.start_date_unix = Math.floor(sMs / 1000);
      }
      if (item.Date_End && !item.end_date_unix) {
        const eMs = normalizeToMs(item.Date_End);
        if (eMs) item.end_date_unix = Math.floor(eMs / 1000);
      }
      if (
        item.start_date_unix &&
        typeof item.start_date_unix === "number" &&
        item.start_date_unix > 1e12
      )
        item.start_date_unix = Math.floor(item.start_date_unix / 1000);
      if (
        item.end_date_unix &&
        typeof item.end_date_unix === "number" &&
        item.end_date_unix > 1e12
      )
        item.end_date_unix = Math.floor(item.end_date_unix / 1000);
      if (!item.start_date_unix) {
        for (const k of ["start_date", "date_start", "StartDate"]) {
          if (item[k]) {
            const vMs = normalizeToMs(item[k]);
            if (vMs) {
              item.start_date_unix = Math.floor(vMs / 1000);
              break;
            }
          }
        }
      }
      if (!item.end_date_unix) {
        for (const k of ["end_date", "date_end", "EndDate"]) {
          if (item[k]) {
            const vMs = normalizeToMs(item[k]);
            if (vMs) {
              item.end_date_unix = Math.floor(vMs / 1000);
              break;
            }
          }
        }
      }
      item.start_ms = item.start_date_unix
        ? item.start_date_unix * 1000
        : item.Date_Start
        ? normalizeToMs(item.Date_Start)
        : null;
      item.end_ms = item.end_date_unix
        ? item.end_date_unix * 1000
        : item.Date_End
        ? normalizeToMs(item.Date_End)
        : null;
      if (!item.Date_Start && item.start_ms)
        item.Date_Start = new Date(item.start_ms).toISOString();
      if (!item.Date_End && item.end_ms)
        item.Date_End = new Date(item.end_ms).toISOString();
      return item;
    });
  }
  return out;
}

function connectUpstream() {
  if (authFailed || shuttingDown) return;
  const url = buildUpstreamUrl();
  upstreamReconnectAttempts++;
  console.log(
    `[UPSTREAM] Connecting to ${url} (attempt ${upstreamReconnectAttempts})`
  );
  try {
    upstream = new WebSocket(url, { handshakeTimeout: 10000 });
  } catch (err) {
    console.error("[UPSTREAM] constructor error", err);
    scheduleUpstreamReconnect();
    return;
  }

  upstream.on("open", () => {
    upstreamReconnectAttempts = 0;
    console.log("[UPSTREAM] connected");
  });

  function getItemName(item) {
    if (!item || typeof item !== "object") return "";
    return String(
      item.display_name ||
        item.displayName ||
        item.name ||
        item.ItemName ||
        item.itemName ||
        item.Name ||
        item.title ||
        item.item_id ||
        item.id ||
        ""
    );
  }
  function summarizeItemForLog(it) {
    return {
      route: it._route,
      name: getItemName(it) || "(no-name)",
      id: it.item_id || it.id || null,
      keys: Object.keys(it).slice(0, 12),
    };
  }

  function serverWatchMatches(item, route) {
    try {
      if (!route || !SERVER_WATCHLIST) return false;
      const list = SERVER_WATCHLIST[route];
      if (!Array.isArray(list) || list.length === 0) return false;
      const name = (getItemName(item) || "").toLowerCase();
      const id = String(item.item_id || item.id || "").toLowerCase();
      for (const w of list) {
        if (!w) continue;
        const wid = (w.item_id || "").toLowerCase();
        const wname = (w.display_name || "").toLowerCase();
        if (wid && id && wid === id) return true;
        if (wname && name && wname === name) return true;
        if (wid && id && id.includes(wid)) return true;
        if (wname && name && name.includes(wname)) return true;
        if (wname && id && id.includes(wname)) return true;
        if (wid && name && name.includes(wid)) return true;
      }
      return false;
    } catch (e) {
      if (DEBUG) console.warn("[SERVERWATCH] match error", e);
      return false;
    }
  }

  upstream.on("message", (raw) => {
    const text = raw.toString();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      if (DEBUG) console.log("[UPSTREAM] non-JSON msg:", text.slice(0, 200));
      return;
    }

    if (DEBUG) {
      try {
        console.log(
          "[UPSTREAM] parsed keys:",
          Object.keys(parsed || {}).slice(0, 20)
        );
        console.log(
          "[UPSTREAM] parsed preview:",
          JSON.stringify(parsed).slice(0, 2000)
        );
      } catch (e) {}
    }

    const sig = safeSig(parsed);
    if (sig === lastPayloadSignature) return;
    lastPayloadSignature = sig;

    const payload = parsed.data ?? parsed;
    if (DEBUG) {
      console.log(
        "[UPSTREAM] using payload (source):",
        parsed.data ? "parsed.data" : "parsed"
      );
      console.log(
        "[UPSTREAM] payload top-level keys:",
        Object.keys(payload || {}).slice(0, 50)
      );
    }
    if (!payload || typeof payload !== "object") return;

    let incomingTsMs = null;
    incomingTsMs = incomingTsMs || normalizeToMs(parsed.timestamp);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.timestamp);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.lastGlobalUpdate);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.last_global_update);
    incomingTsMs = incomingTsMs || normalizeToMs(parsed.serverNow);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.serverNow);

    const chosenTs = incomingTsMs || Date.now();
    latestData.timestamp = chosenTs;

    if (incomingTsMs)
      console.log(
        `[UPSTREAM] using upstream timestamp: ${new Date(
          chosenTs
        ).toISOString()} (ms=${chosenTs})`
      );
    else if (DEBUG)
      console.log(
        `[UPSTREAM] no upstream timestamp found, using bridge time: ${new Date(
          chosenTs
        ).toISOString()} (ms=${chosenTs})`
      );

    const updatedRoutes = new Set();
    const incomingKeys = Object.keys(payload);

    for (const k of incomingKeys) {
      const lower = String(k).toLowerCase();
      const route = keyToRoute[lower] ?? null;
      const value = payload[k];

      if (DEBUG) {
        try {
          if (Array.isArray(value))
            console.log(
              `[UPSTREAM] key=${k} -> array(${value.length}) sample=`,
              JSON.stringify(value[0]).slice(0, 800)
            );
          else if (value && typeof value === "object")
            console.log(
              `[UPSTREAM] key=${k} -> object keys=${Object.keys(value).slice(
                0,
                20
              )} sample=`,
              JSON.stringify(
                Object.fromEntries(Object.entries(value).slice(0, 10))
              ).slice(0, 800)
            );
          else console.log(`[UPSTREAM] key=${k} -> scalar =>`, value);
        } catch (e) {
          if (DEBUG)
            console.log(
              `[UPSTREAM] key=${k} -> (couldn't preview)`,
              e && e.message
            );
        }
      }

      if (route) {
        if (route === "travelingmerchant") {
          try {
            latestData.travelingmerchant = normalizeTravelingMerchant(value);
          } catch (e) {
            console.warn(
              "[UPSTREAM] travelingmerchant normalization failed:",
              e
            );
            latestData.travelingmerchant = value;
          }
          updatedRoutes.add("travelingmerchant");
        } else {
          latestData[route] = value;
          updatedRoutes.add(route);
        }
      } else {
        latestData[k] = value;
      }
    }

    prettyLog(payload);
    if (DEBUG)
      console.log(
        "[UPSTREAM] canonical updatedRoutes:",
        Array.from(updatedRoutes)
      );

    // notify push subscribers: separate paths
    (async function notifySubscribers(updatedRoutesSet) {
      try {
        const updatedRoutes =
          updatedRoutesSet instanceof Set
            ? updatedRoutesSet
            : new Set(Array.from(updatedRoutesSet || []));
        const candidates = [];
        if (updatedRoutes.has("seeds") || updatedRoutes.size === 0)
          (latestData.seeds || []).forEach((it) =>
            candidates.push({ ...it, _route: "seeds" })
          );
        if (updatedRoutes.has("gear") || updatedRoutes.size === 0)
          (latestData.gear || []).forEach((it) =>
            candidates.push({ ...it, _route: "gear" })
          );
        if (updatedRoutes.has("cosmetics") || updatedRoutes.size === 0)
          (latestData.cosmetics || []).forEach((it) =>
            candidates.push({ ...it, _route: "cosmetics" })
          );
        if (updatedRoutes.has("eggs") || updatedRoutes.size === 0)
          (latestData.eggs || []).forEach((it) =>
            candidates.push({ ...it, _route: "eggs" })
          );
        if (updatedRoutes.has("weather") || updatedRoutes.size === 0)
          (latestData.weather || []).forEach((it) =>
            candidates.push({ ...it, _route: "weather" })
          );
        if (
          latestData.travelingmerchant &&
          Array.isArray(latestData.travelingmerchant.stock) &&
          (updatedRoutes.has("travelingmerchant") || updatedRoutes.size === 0)
        )
          latestData.travelingmerchant.stock.forEach((it) =>
            candidates.push({ ...it, _route: "travelingmerchant" })
          );

        if (candidates.length === 0 || pushSubscriptions.length === 0) {
          if (DEBUG)
            console.log(
              "[NOTIFY] no candidates or no subscriptions - skipping notify (candidates:",
              candidates.length,
              "subs:",
              pushSubscriptions.length,
              ")"
            );
          return;
        }

        // matching helper for user-specified items/keywords
        function userMatches(item, criteria) {
          if (!criteria) return false;

          // if no explicit criteria fields (items/keyword/route), DO NOT match everything by default
          const hasExplicit =
            (criteria.items &&
              Array.isArray(criteria.items) &&
              criteria.items.length > 0) ||
            (criteria.keyword && String(criteria.keyword).trim().length > 0) ||
            (criteria.route && USER_ALLOWED_ROUTES.has(String(criteria.route)));
          if (!hasExplicit) return false;

          // if user specified a route, ensure route matches (user routes limited to seeds/gear/eggs)
          if (criteria.route && criteria.route !== item._route) return false;

          const name = getItemName(item).toLowerCase();
          const id = String(item.item_id || item.id || "").toLowerCase();

          // items may be array of objects {route,q} or {q}
          if (
            criteria.items &&
            Array.isArray(criteria.items) &&
            criteria.items.length > 0
          ) {
            for (const it of criteria.items) {
              if (!it) continue;
              if (typeof it === "string") {
                const qq = String(it).toLowerCase();
                if (qq === id || (name && name.includes(qq))) return true;
              } else if (it && typeof it === "object") {
                const qq = String(it.q || "").toLowerCase();
                if (!qq) continue;
                if (it.route && it.route !== item._route) continue;
                if (qq === id || (name && name.includes(qq))) return true;
              }
            }
            return false;
          }

          // keyword fallback
          if (criteria.keyword) {
            const kw = String(criteria.keyword).toLowerCase();
            const matched =
              (name && name.includes(kw)) || (id && id.includes(kw));
            if (DEBUG)
              console.log(
                `[MATCH] keyword check: item=${name} id=${id} keyword=${criteria.keyword} => ${matched}`
              );
            return matched;
          }

          // explicit route only
          if (criteria.route) return criteria.route === item._route;

          return false;
        }

        // PRECOMPUTE server watch matches by item (server watchlist is independent)
        const itemServerMatch = new Map(); // itemKey -> boolean
        for (const item of candidates) {
          try {
            itemServerMatch.set(item, serverWatchMatches(item, item._route));
          } catch (e) {
            itemServerMatch.set(item, false);
          }
        }

        // send notifications
        for (const subEntry of [...pushSubscriptions]) {
          for (const item of candidates) {
            // 1) user matches (user watchlist) - only when user gave explicit criteria
            let matchedByUser = false;
            try {
              matchedByUser = userMatches(item, subEntry.criteria);
            } catch (e) {
              matchedByUser = false;
            }

            // 2) server default watchlist match (independent of user's criteria)
            const matchedByServerWatch = itemServerMatch.get(item) === true;

            if (!matchedByUser && !matchedByServerWatch) continue;

            const itemKeyId =
              item.item_id ||
              item.id ||
              getItemName(item) ||
              JSON.stringify(item).slice(0, 50);
            const itemKey = `${item._route}:${String(itemKeyId).slice(0, 100)}`;
            // decide min interval (per-sub criteria fallback to server default)
            const minInterval =
              subEntry.criteria && subEntry.criteria.minNotifyIntervalMs
                ? Number(subEntry.criteria.minNotifyIntervalMs)
                : DEFAULT_MIN_NOTIFY_INTERVAL_MS;

            const last = subEntry.lastNotified[itemKey] || 0;
            const now = Date.now();
            if (now - last < minInterval) {
              if (DEBUG)
                console.log(
                  "[NOTIFY] skipping send (minInterval) for",
                  itemKey,
                  "sub=",
                  subEntry.id
                );
              continue;
            }

            // build simplified payload (as you requested earlier)
            const title = `${getItemName(item) || item._route} in stock`;
            const notificationPayload = {
              title,
              body: "Garden Side",
              icon:
                item.icon ||
                item.icon_url ||
                (latestData.travelingmerchant &&
                  latestData.travelingmerchant.icon) ||
                undefined,
              timestamp: Date.now(),
              data: { url: `https://gardenside.app/${item._route}` },
            };

            // Log debug info before sending
            if (DEBUG) {
              console.log(
                "[NOTIFY] sending -> sub=",
                subEntry.id,
                " item:",
                summarizeItemForLog(item),
                "matchedByUser:",
                matchedByUser,
                "matchedByServerWatch:",
                matchedByServerWatch
              );
            }

            // Single send attempt, with stale-sub cleanup
            try {
              await webpush.sendNotification(
                subEntry.subscription,
                JSON.stringify(notificationPayload),
                { TTL: 60, urgency: "high" }
              );
              subEntry.lastNotified[itemKey] = now;
              console.log(
                `[WEBPUSH] sent -> sub=${subEntry.id} item=${itemKey}`
              );
            } catch (err) {
              console.warn(
                "[WEBPUSH] send failed",
                err && (err.statusCode || err),
                err && err.body ? err.body : ""
              );
              if (err && (err.statusCode === 410 || err.statusCode === 404)) {
                removeSubscriptionById(subEntry.id);
                console.log(
                  "[WEBPUSH] removed stale subscription",
                  subEntry.id
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("[WEBPUSH] notifySubscribers error", err);
      }
    })(updatedRoutes);

    // Broadcast changed routes
    if (updatedRoutes.size === 0) broadcastAlldata();
    else {
      for (const r of updatedRoutes)
        broadcastForRoute(r, {
          type: "update",
          key: r,
          data: latestData[r],
          timestamp: latestData.timestamp,
        });
      broadcastAlldata();
    }
  });

  upstream.on("close", (code, reasonBuf) => {
    const reason =
      reasonBuf && reasonBuf.toString
        ? reasonBuf.toString()
        : String(reasonBuf || "");
    console.warn(`[UPSTREAM] closed code=${code} reason=${reason}`);
    const rl = (reason || "").toLowerCase();
    if (
      code === 4000 ||
      /auth/i.test(rl) ||
      /token/i.test(rl) ||
      /no token/i.test(rl)
    ) {
      console.error(
        "[UPSTREAM] Authentication failure. Not reconnecting until token fixed."
      );
      authFailed = true;
      return;
    }
    scheduleUpstreamReconnect();
  });

  upstream.on("error", (err) => {
    console.error("[UPSTREAM] error", err && (err.message || err));
  });
}

let upstreamReconnectTimer = null;
function scheduleUpstreamReconnect() {
  upstreamReconnectAttempts = Math.min(
    12,
    Math.max(1, upstreamReconnectAttempts || 1)
  );
  const delay = Math.min(30000, 1000 * 2 ** upstreamReconnectAttempts);
  console.log(`[UPSTREAM] will reconnect in ${delay}ms`);
  if (upstreamReconnectTimer) clearTimeout(upstreamReconnectTimer);
  upstreamReconnectTimer = setTimeout(connectUpstream, delay);
}

function prettyLog(payload) {
  try {
    const keys = Object.keys(payload || {});
    if (keys.length === 0) {
      console.log("[UPSTREAM] (empty incoming)");
      return;
    }
    const parts = keys.map((k) => {
      const v = payload[k];
      if (Array.isArray(v)) return `${k}:array(${v.length})`;
      if (v && typeof v === "object") return `${k}:obj`;
      return `${k}:${String(v)}`;
    });
    console.log("[UPSTREAM] " + parts.join(" · "));
  } catch {
    console.log("[UPSTREAM] (couldn't summarize payload)");
  }
}

server.listen(PORT, () => {
  console.log(`Bridge listening HTTP + WS on http://localhost:${PORT}`);
  connectUpstream();
});

process.on("SIGINT", () => {
  console.log("Shutting down...");
  shuttingDown = true;
  try {
    if (upstream) upstream.close();
  } catch {}
  try {
    server.close(() => process.exit(0));
  } catch {
    process.exit(0);
  }
});
