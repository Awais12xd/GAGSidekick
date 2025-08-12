// server.js (ESM) — Upstream -> local HTTP + per-route WS bridge
// usage: DISCORD_USER_ID=... JSTUDIO_KEY=... PORT=8000 node server.js

import express from "express";
import cors from "cors";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import process from "process";
import dotenv from "dotenv";
dotenv.config();

const DISCORD_USER_ID = process.env.DISCORD_USER_ID || "";
const JSTUDIO_KEY = process.env.JSTUDIO_KEY || "";
const PORT = Number(process.env.PORT || 8000);
const UPSTREAM_BASE = "wss://websocket.joshlei.com/growagarden";
const app = express();

// allowed origins for CORS (adjust as needed)
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://gardenside.app",
  "https://www.gardenside.app",
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/Postman
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
app.set("trust proxy", 1);

// Shutdown flag
let shuttingDown = false;

// aggregated snapshot
const latestData = {
  weather: [],
  seeds: [],
  gear: [],
  eggs: [],
  cosmetics: [],
  travelingmerchant: {}, // canonical place for traveling merchant snapshot
  timestamp: 0,
};

// routeKeyMap: canonical route -> list of upstream key variants
const routeKeyMap = {
  weather: ["weather", "WEATHER"],
  seeds: [
    "seed_stock",
    "seedStock",
    "seeds",
    "SEED_STOCK",
    "seed",
    "seed_stock",
  ],
  gear: ["gear_stock", "gear", "GEAR_STOCK"],
  eggs: ["egg_stock", "eggs", "EGG_STOCK", "egg", "egg_stock"],
  cosmetics: ["cosmetic_stock", "cosmetics", "COSMETIC_STOCK"],
  // canonical route = travelingmerchant
  travelingmerchant: [
    "travelingmerchant_stock",
    "traveling_merchant_stock",
    "travelingmerchant",
    "traveling_merchant",
    "traveling_merchant_stock_v2",
  ],
  alldata: [], // special
};

// build reverse lookup: lowercased key -> canonical route
const keyToRoute = {};
for (const [route, keys] of Object.entries(routeKeyMap)) {
  for (const k of keys) keyToRoute[String(k).toLowerCase()] = route;
}

// route aliases for WS upgrade pathnames -> canonical route
// ensures clients using /travelingmerchant_stock or /travelingmerchant both work
const pathAliasToRoute = {
  travelingmerchant: "travelingmerchant",
  travelingmerchant_stock: "travelingmerchant",
  "traveling_merchant_stock": "travelingmerchant",
  "traveling_merchant": "travelingmerchant",
  alldata: "alldata",
  weather: "weather",
  seeds: "seeds",
  gear: "gear",
  eggs: "eggs",
  cosmetics: "cosmetics",
};

// ----------------- HTTP endpoints -----------------
app.get("/", (req, res) => res.json({ status: 200 }));

app.get("/alldata", (req, res) => res.json(latestData));
app.get("/weather", (req, res) => res.json(latestData.weather ?? []));
app.get("/seeds", (req, res) => res.json(latestData.seeds ?? []));
app.get("/gear", (req, res) => res.json(latestData.gear ?? []));
app.get("/eggs", (req, res) => res.json(latestData.eggs ?? []));
app.get("/cosmetics", (req, res) => res.json(latestData.cosmetics ?? []));

// Expose both canonical and common alias endpoints for traveling merchant snapshot
app.get("/travelingmerchant", (req, res) => res.json(latestData.travelingmerchant ?? {}));
app.get("/travelingmerchant_stock", (req, res) => res.json(latestData.travelingmerchant ?? {}));
app.get("/traveling_merchant_stock", (req, res) => res.json(latestData.travelingmerchant ?? {}));

// ----------------- HTTP server + WS upgrade handling -----------------
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
    const rawPath = url.pathname.replace(/^\/+/, "").split("/")[0]; // first segment
    let route = rawPath || "alldata";

    // map alias to canonical route
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

      // send initial snapshot for that route
      try {
        if (route === "alldata") {
          ws.send(JSON.stringify({ type: "alldata", data: latestData }));
        } else {
          const keyData = latestData[route] ?? (route === "travelingmerchant" ? {} : []);
          ws.send(
            JSON.stringify({
              type: "update",
              key: route,
              data: keyData,
              timestamp: latestData.timestamp,
            })
          );
        }
      } catch (e) {
        /* ignore send errors */
      }
    });
  } catch (err) {
    socket.destroy();
  }
});

// ----------------- broadcasting helpers -----------------
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
  if (sent > 0) console.log(`[LOCAL WSS] broadcast /${route} -> ${sent} client(s)`);
  return sent;
}

function broadcastAlldata() {
  broadcastForRoute("alldata", { type: "alldata", data: latestData });
}

// ----------------- Upstream WS connection -----------------
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

// Normalize many timestamp representations to ms (number)
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

// Normalize traveling merchant payload to consistent shape.
// Ensures items have start_date_unix (seconds), end_date_unix (seconds),
// and also adds start_ms/end_ms for convenience.
function normalizeTravelingMerchant(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const out = { ...raw };

  if (Array.isArray(out.stock)) {
    out.stock = out.stock.map((it) => {
      const item = { ...it };

      // If we have Date_Start / Date_End ISO strings use them
      if (item.Date_Start && !item.start_date_unix) {
        const sMs = normalizeToMs(item.Date_Start);
        if (sMs) item.start_date_unix = Math.floor(sMs / 1000);
      }
      if (item.Date_End && !item.end_date_unix) {
        const eMs = normalizeToMs(item.Date_End);
        if (eMs) item.end_date_unix = Math.floor(eMs / 1000);
      }

      // If timestamps provided as ms accidentally, convert to seconds fields consistently.
      if (item.start_date_unix && typeof item.start_date_unix === "number" && item.start_date_unix > 1e12) {
        // looks like ms — convert to seconds
        item.start_date_unix = Math.floor(item.start_date_unix / 1000);
      }
      if (item.end_date_unix && typeof item.end_date_unix === "number" && item.end_date_unix > 1e12) {
        item.end_date_unix = Math.floor(item.end_date_unix / 1000);
      }

      // If still missing start/end but ISO fields exist in different names, try parsing generically:
      if (!item.start_date_unix) {
        // try fields like start_date, date_start, StartDate
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

      // Add convenience ms fields (may be useful for consumers)
      item.start_ms = item.start_date_unix ? item.start_date_unix * 1000 : (item.Date_Start ? normalizeToMs(item.Date_Start) : null);
      item.end_ms = item.end_date_unix ? item.end_date_unix * 1000 : (item.Date_End ? normalizeToMs(item.Date_End) : null);

      // Keep Date_Start/Date_End if provided, and ensure they are ISO strings when possible
      if (!item.Date_Start && item.start_ms) item.Date_Start = new Date(item.start_ms).toISOString();
      if (!item.Date_End && item.end_ms) item.Date_End = new Date(item.end_ms).toISOString();

      return item;
    });
  }

  return out;
}

function connectUpstream() {
  if (authFailed || shuttingDown) return;

  const url = buildUpstreamUrl();
  upstreamReconnectAttempts++;
  console.log(`[UPSTREAM] Connecting to ${url} (attempt ${upstreamReconnectAttempts})`);

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

  upstream.on("message", (raw) => {
    const text = raw.toString();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("[UPSTREAM] non-JSON msg:", text.slice(0, 200));
      return;
    }

    // dedupe identical messages
    const sig = safeSig(parsed);
    if (sig === lastPayloadSignature) {
      return;
    }
    lastPayloadSignature = sig;

    // payload might be in parsed.data or parsed directly
    const payload = parsed.data ?? parsed;
    if (!payload || typeof payload !== "object") return;

    // Pick an authoritative upstream timestamp (ms) if supplied.
    // Check a few common fields; fall back to bridge time only if none present.
    let incomingTsMs = null;
    incomingTsMs = incomingTsMs || normalizeToMs(parsed.timestamp);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.timestamp);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.lastGlobalUpdate);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.last_global_update);
    incomingTsMs = incomingTsMs || normalizeToMs(parsed.serverNow);
    incomingTsMs = incomingTsMs || normalizeToMs(payload.serverNow);

    const chosenTs = incomingTsMs || Date.now();
    latestData.timestamp = chosenTs;

    if (incomingTsMs) {
      console.log(`[UPSTREAM] using upstream timestamp: ${new Date(chosenTs).toISOString()} (ms=${chosenTs})`);
    } else {
      console.log(`[UPSTREAM] no upstream timestamp found, using bridge time: ${new Date(chosenTs).toISOString()} (ms=${chosenTs})`);
    }

    // Merge top-level keys into latestData; collect which canonical routes were updated.
    const updatedRoutes = new Set();
    const incomingKeys = Object.keys(payload);

    for (const k of incomingKeys) {
      const lower = String(k).toLowerCase();
      const route = keyToRoute[lower] ?? null; // maps known upstream keys to canonical route

      const value = payload[k];

      if (route) {
        // Special-case normalization for traveling merchant:
        if (route === "travelingmerchant") {
          try {
            latestData.travelingmerchant = normalizeTravelingMerchant(value);
          } catch (e) {
            console.warn("[UPSTREAM] travelingmerchant normalization failed:", e);
            latestData.travelingmerchant = value;
          }
          updatedRoutes.add("travelingmerchant");
        } else {
          latestData[route] = value;
          updatedRoutes.add(route);
        }
      } else {
        // unknown top-level key -> attach raw, preserving original key name
        latestData[k] = value;
      }
    }

    prettyLog(payload);

    // Broadcast changed routes (route-specific WS) and refresh alldata viewers too
    if (updatedRoutes.size === 0) {
      broadcastAlldata();
    } else {
      for (const r of updatedRoutes) {
        broadcastForRoute(r, {
          type: "update",
          key: r,
          data: latestData[r],
          timestamp: latestData.timestamp,
        });
      }
      broadcastAlldata();
    }
  });

  upstream.on("close", (code, reasonBuf) => {
    const reason = reasonBuf && reasonBuf.toString ? reasonBuf.toString() : String(reasonBuf || "");
    console.warn(`[UPSTREAM] closed code=${code} reason=${reason}`);
    const rl = (reason || "").toLowerCase();
    if (code === 4000 || /auth/i.test(rl) || /token/i.test(rl) || /no token/i.test(rl)) {
      console.error("[UPSTREAM] Authentication failure. Not reconnecting until token fixed.");
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
  upstreamReconnectAttempts = Math.min(12, Math.max(1, upstreamReconnectAttempts || 1));
  const delay = Math.min(30000, 1000 * 2 ** upstreamReconnectAttempts);
  console.log(`[UPSTREAM] will reconnect in ${delay}ms`);
  if (upstreamReconnectTimer) clearTimeout(upstreamReconnectTimer);
  upstreamReconnectTimer = setTimeout(connectUpstream, delay);
}

// pretty logger
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

// start
server.listen(PORT, () => {
  console.log(`Bridge listening HTTP + WS on http://localhost:${PORT}`);
  connectUpstream();
});

// graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  shuttingDown = true;
  try { if (upstream) upstream.close(); } catch {}
  try { server.close(() => process.exit(0)); } catch { process.exit(0); }
});
