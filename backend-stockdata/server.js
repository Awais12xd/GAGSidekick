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
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://your-vercel-site.vercel.app",   // add prod frontends here
];

// cors options
const corsOptions = {
  origin: (origin, cb) => {
    // allow no-origin (curl, Postman) or allowed origins
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  credentials: false, // set true only if you need cookies/auth
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// also ensure express handles OPTIONS preflight for all routes:
// app.options("*", cors(corsOptions));
app.use(express.json());
app.set("trust proxy", 1);

// Shutdown helpers
let shuttingDown = false;

// In-memory aggregated snapshot
const latestData = {
  weather: [],
  seeds: [],
  gear: [],
  eggs: [],
  cosmetics: [],
  timestamp: 0,
};

// helper: map route -> accepted upstream keys (incoming keys mapped to routes)
const routeKeyMap = {
  weather: ["weather", "WEATHER"],
  seeds: ["seed_stock", "seedStock", "seeds", "SEED_STOCK", "seed", "seed_stock"],
  gear: ["gear_stock", "gear", "GEAR_STOCK"],
  eggs: ["egg_stock", "eggs", "EGG_STOCK", "egg", "egg_stock"],
  cosmetics: ["cosmetic_stock", "cosmetics", "COSMETIC_STOCK"],
  alldata: [], // special
};

// reverse lookup key -> route (lowercased)
const keyToRoute = {};
for (const [route, keys] of Object.entries(routeKeyMap)) {
  for (const k of keys) keyToRoute[String(k).toLowerCase()] = route;
}

// ----------------- HTTP endpoints (snapshots) -----------------
app.get("/", (req, res) => res.json({ status: 200 }));

app.get("/alldata", (req, res) => {
  res.json(latestData);
});

app.get("/weather", (req, res) => {
  res.json(latestData.weather ?? []);
});
app.get("/seeds", (req, res) => {
  res.json(latestData.seeds ?? []);
});
app.get("/gear", (req, res) => {
  res.json(latestData.gear ?? []);
});
app.get("/eggs", (req, res) => {
  res.json(latestData.eggs ?? []);
});
app.get("/cosmetics", (req, res) => {
  res.json(latestData.cosmetics ?? []);
});

// ----------------- HTTP server + upgrade handling -----------------
const server = http.createServer(app);

// We'll accept WS upgrades ourselves and attach sockets to route-specific sets.
const routeClients = {
  weather: new Set(),
  seeds: new Set(),
  gear: new Set(),
  eggs: new Set(),
  cosmetics: new Set(),
  alldata: new Set(),
};

// Accept upgrade and attach connection to a route (by pathname)
server.on("upgrade", (request, socket, head) => {
  if (shuttingDown) {
    socket.destroy();
    return;
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = url.pathname.replace(/^\/+/, "").split("/")[0]; // first segment
    const route = pathname || "alldata";

    if (!Object.prototype.hasOwnProperty.call(routeClients, route)) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    // Use a noServer WebSocketServer to perform the upgrade
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
          const keyData = latestData[route] ?? [];
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

// helper to broadcast only for a specific route (route = seeds, weather, etc)
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

// Broadcast alldata to alldata clients
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

    const payload = parsed.data ?? parsed;
    if (!payload || typeof payload !== "object") return;

    // We'll shallow-merge top-level keys into latestData and broadcast only updated routes
    const updatedRoutes = new Set();
    const incomingKeys = Object.keys(payload);

    for (const k of incomingKeys) {
      const lower = String(k).toLowerCase();
      const route = keyToRoute[lower] ?? (routeClients[k] ? k : null);

      const value = payload[k];

      if (route) {
        // assign under route name (e.g., payload.seed_stock => latestData.seeds)
        latestData[route] = value;
        updatedRoutes.add(route);
      } else {
        // unknown top-level key -> attach raw
        latestData[k] = value;
      }
    }

    latestData.timestamp = Date.now();
    prettyLog(payload);

    // Broadcast updates
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
      // refresh alldata viewers too
      broadcastAlldata();
    }
  });

  upstream.on("close", (code, reasonBuf) => {
    const reason = reasonBuf && reason.toString ? reasonBuf.toString() : String(reasonBuf || "");
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

// small pretty logger for incoming keys
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

// start upstream and HTTP server
server.listen(PORT, () => {
  console.log(`Bridge listening HTTP + WS on http://localhost:${PORT}`);
  connectUpstream();
});

// graceful shutdown
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
