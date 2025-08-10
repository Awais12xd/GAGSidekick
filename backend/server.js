// server.js (ESM) — WebSocket forwarding only on actual data changes
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { WebSocket, WebSocketServer } from "ws"; // <-- added WebSocketServer
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import 'dotenv/config';
import helmet from 'helmet';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
const raw = process.env.CORS_ORIGINS || '';
const allowedOrigins = raw.split(',').map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser (curl/postman) requests (origin === undefined)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS not allowed by server'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());


// ----------------------------
// Helpers (equivalents of your Python utils)
// ----------------------------
function combineItemsByName(items = []) {
  const map = new Map();
  for (const it of items) {
    const name = it?.name ?? null;
    const qty = Number(it?.quantity ?? 0);
    if (!name) continue;
    map.set(name, (map.get(name) || 0) + qty);
  }
  const arr = [];
  for (const [name, qty] of map.entries()) {
    arr.push({ name, quantity: qty });
  }
  return arr;
}

function cleanItems(items = [], keysToKeep = new Set(["name", "quantity"])) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const out = {};
    for (const key of keysToKeep) {
      if (key in item) out[key] = item[key];
    }
    return out;
  });
}

// ----------------------------
// Global data store (same shape as your Python latest_data)
// ----------------------------
const latestData = {
  weather: {},
  gear: [],
  seeds: [],
  eggs: [],
  honey: [],
  cosmetics: [],
  timestamp: 0,
};

// keep a last payload signature so we only broadcast on real changes
let lastPayloadSignature = "";

// ----------------------------
// Logging, CORS, rate limit, static
// ----------------------------
app.use(morgan("combined"));

app.use(
  cors({
    origin: "*",
  })
);

// Rate limit: 5 requests / minute per IP (keeps REST safe)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// serve static files from ./assets at /assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ----------------------------
// Simple routes (mirrors your FastAPI routes)
// ----------------------------
app.get("/", (req, res) => {
  res.json({ status: "200" });
});

app.get("/alldata", (req, res) => {
  console.log(
    `[HTTP] /alldata requested - returning snapshot (ts=${latestData.timestamp})`
  );
  res.json( "hello" ,latestData);
});

app.get("/gear", (req, res) => {
  res.json(latestData.gear || []);
});

app.get("/seeds", (req, res) => {
  res.json(latestData.seeds || []);
});

app.get("/cosmetics", (req, res) => {
  res.json(latestData.cosmetics || []);
});

app.get("/eventshop", (req, res) => {
  res.json(latestData.honey || []);
});

app.get("/eggs", (req, res) => {
  res.json(latestData.eggs || []);
});

app.get("/weather", (req, res) => {
  res.json(latestData.weather || {});
});

// ----------------------------
// WebSocket listener: connect to remote Grow A Garden WS and update latestData
// ----------------------------
const GLEEZE_URI = process.env.GLEEZE_WS || "wss://ws.growagardenpro.com/";

// Reconnect with exponential backoff (cap at 30s)
let wsClient = null;
let reconnectAttempts = 0;
let shuttingDown = false;

// WebSocketServer for browsers (will be created after HTTP server starts)
let wss = null;

/**
 * broadcastLatest
 * - Sends the latestData snapshot to all connected browser clients.
 */
function broadcastLatest() {
  if (!wss) return;
  const payload = JSON.stringify({ type: "alldata", data: latestData });
  let sent = 0;
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
        sent++;
      } catch (e) {
        console.warn("[WS-BROADCAST] send error:", e?.message ?? e);
      }
    }
  }
  if (sent > 0)
    console.log(
      `[WS-BROADCAST] Sent snapshot to ${sent} client(s) (ts=${new Date(
        latestData.timestamp
      ).toISOString()})`
    );
}

/**
 * sanitizeAndMergeRemoteData
 * - Logs incoming payload keys & sizes
 * - Merges into latestData and logs resulting counts for categories
 * - Only broadcasts if the incoming payload differs from the last one seen
 */
function sanitizeAndMergeRemoteData(remote) {
  if (!remote || typeof remote !== "object") return;

  const payload = remote.data ?? {};
  const keys = Object.keys(payload);
  if (keys.length === 0) {
    console.log("[WS-REMOTE] Received message with no data keys.");
    return;
  }

  // signature for change detection (simple, effective)
  let sig;
  try {
    sig = JSON.stringify(payload);
  } catch (e) {
    // if circular or too big, fallback to timestamp signature
    sig = String(Date.now());
  }

  // If identical payload to last one, skip merge & broadcast (avoids needless traffic)
  if (sig === lastPayloadSignature) {
    // Optional: update a small heartbeat timestamp if you still want freshness
    // latestData.timestamp = Date.now();
    console.log("[WS-REMOTE] Ignored identical payload (no changes).");
    return;
  }

  // new payload — update signature
  lastPayloadSignature = sig;

  // log incoming keys + sizes (if array)
  const incomingSummary = keys
    .map((k) => {
      const v = payload[k];
      if (Array.isArray(v)) return `${k}(${v.length})`;
      if (v && typeof v === "object") return `${k}(obj)`;
      return `${k}(${typeof v})`;
    })
    .join(", ");

  console.log(`[WS-REMOTE] Incoming payload keys: ${incomingSummary}`);

  // merge shallowly
  keys.forEach((key) => {
    latestData[key] = payload[key];
  });

  // cleaning and counts logging
  const cleanedSummary = [];
  for (const category of ["gear", "seeds", "cosmetics", "honey"]) {
    if (Array.isArray(latestData[category])) {
      const cleaned = cleanItems(
        latestData[category],
        new Set(["name", "quantity"])
      );
      latestData[category] = cleaned;
      cleanedSummary.push(`${category}(${cleaned.length})`);
    }
  }

  if (Array.isArray(latestData.eggs)) {
    latestData.eggs = combineItemsByName(latestData.eggs);
  }

  // update timestamp after merge
  latestData.timestamp = Date.now();

  // final log of merged keys and counts
  const postKeys = Object.keys(payload)
    .map((k) => {
      const v = latestData[k];
      if (Array.isArray(v)) return `${k}=${v.length}`;
      if (v && typeof v === "object") return `${k}=obj`;
      return `${k}=${typeof v}`;
    })
    .join(", ");

  console.log(
    `[WS-REMOTE] Merged keys: ${postKeys} · timestamp: ${new Date(
      latestData.timestamp
    ).toISOString()}`
  );

  // broadcast to browser clients (only when payload actually changed)
  try {
    broadcastLatest();
  } catch (e) {
    console.error("[WS-BROADCAST] error when broadcasting:", e);
  }
}

// Reconnect/connection logic with useful logs
function connectToGleeze() {
  if (shuttingDown) return;
  reconnectAttempts++;
  console.log(
    `Connecting to Gleeze WebSocket: ${GLEEZE_URI} (attempt #${reconnectAttempts})`
  );
  wsClient = new WebSocket(GLEEZE_URI);

  wsClient.onopen = () => {
    console.log(
      `[WS-REMOTE] Connected to Gleeze (attempt ${reconnectAttempts})`
    );
    reconnectAttempts = 0;
  };

  wsClient.onmessage = (msg) => {
    try {
      const text = msg.data?.toString?.() ?? String(msg.data);
      // log raw message size (for debugging)
      console.log(`[WS-REMOTE] Received raw message (${text.length} bytes)`);

      const parsed = JSON.parse(text);

      // log type if present
      if (parsed?.type) {
        console.log(`[WS-REMOTE] message.type = ${parsed.type}`);
      }

      sanitizeAndMergeRemoteData(parsed);
    } catch (err) {
      console.error("[WS-REMOTE] Error parsing message:", err);
    }
  };

  wsClient.onclose = (ev) => {
    if (shuttingDown) return;
    console.warn(
      `[WS-REMOTE] Connection closed (code=${ev?.code ?? "n/a"}, reason=${
        ev?.reason ?? "n/a"
      }). Reconnecting...`
    );
    const delay = Math.min(30000, 1000 * 2 ** (reconnectAttempts || 1));
    console.log(`[WS-REMOTE] Reconnect in ${delay}ms`);
    setTimeout(connectToGleeze, delay);
  };

  wsClient.onerror = (err) => {
    console.error("[WS-REMOTE] Error:", err?.message ?? err);
    // ensure the socket closes to trigger onclose/reconnect
    try {
      wsClient.close();
    } catch (e) {}
  };
}

// start remote WS connection
connectToGleeze();

// ----------------------------
// Start server
// ----------------------------
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  // after: const server = app.listen(PORT, () => { ... })
  server.on("upgrade", (req, socket, head) => {
    console.log("[HTTP UPGRADE] upgrade request path=", req.url, "headers=", {
      upgrade: req.headers.upgrade,
      connection: req.headers.connection,
      origin: req.headers.origin,
    });
  });

  if (wss) {
    wss.on("error", (err) => {
      console.error("[WS-SERVER] error:", err);
    });
  }
  // create WebSocketServer for browsers (attach to same HTTP server)
  wss = new WebSocketServer({ server });
  console.log(
    "[WS-SERVER] WebSocket server ready for browser clients on the same port."
  );

  // wss connection handling
  wss.on("connection", (socket, req) => {
    const remoteIp = req.socket.remoteAddress;
    console.log(
      `[WS-SERVER] Client connected from ${remoteIp} (clients=${wss.clients.size})`
    );

    // send initial snapshot immediately on connect
    try {
      socket.send(JSON.stringify({ type: "alldata", data: latestData }));
    } catch (e) {
      console.warn("[WS-SERVER] send initial snapshot failed:", e);
    }

    socket.on("close", () => {
      console.log(
        `[WS-SERVER] Client disconnected (clients=${wss.clients.size})`
      );
    });

    socket.on("error", (err) => {
      console.error("[WS-SERVER] client error:", err);
    });
  });
});

// periodic status summary so you can glance at terminal
const summaryIntervalMs = 30 * 1000; // 30s
setInterval(() => {
  const gearLen = Array.isArray(latestData.gear) ? latestData.gear.length : 0;
  const seedsLen = Array.isArray(latestData.seeds)
    ? latestData.seeds.length
    : 0;
  const eggsLen = Array.isArray(latestData.eggs) ? latestData.eggs.length : 0;
  const cosLen = Array.isArray(latestData.cosmetics)
    ? latestData.cosmetics.length
    : 0;
  console.log(
    `[SUMMARY] ts=${new Date(
      latestData.timestamp
    ).toISOString()} | gear=${gearLen} seeds=${seedsLen} eggs=${eggsLen} cosmetics=${cosLen} clients=${
      wss ? wss.clients.size : 0
    }`
  );
}, summaryIntervalMs);

// graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  shuttingDown = true;
  if (wsClient) wsClient.close();
  if (wss) wss.close();
  server.close(() => process.exit(0));
});
