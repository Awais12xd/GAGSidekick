import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url'; // ✅ Added pathToFileURL
import { readdir as readdirAsync } from 'fs/promises';
import 'dotenv/config';
import helmet from 'helmet';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url); // ✅ __filename for ESM
const __dirname = dirname(__filename);             // ✅ __dirname replacement

const configPath = join(__dirname, 'config.json');
// Default config
let config = {
  IPWhitelist: false,
  WhitelistedIPs: [],
  Port: process.env.PORT,
  UseGithubMutationData: true,
  Dashboard: false
};

// Load or create config.json
if (existsSync(configPath)) {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} else {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Created config.json with default settings.`);
}

const app = express();
const PORT = config.Port;
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://gag-sidekick-mhfiwf3uo-awais12xds-projects.vercel.app",
  "https://gag-sidekick-lj0r7xuih-awais12xds-projects.vercel.app/",   // add prod frontends here
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
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());

const activityLog = [];

// IP helper
function extractClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const remoteAddr = req.connection?.remoteAddress || req.socket?.remoteAddress;

  let ip = forwarded || realIp || remoteAddr || '';
  if (ip.includes(',')) ip = ip.split(',')[0];
  if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
  if (ip === '::1' || ip === '127.0.0.1') ip = 'localhost';
  return ip;
}

// Log formatter
function formatLogEntry(timestamp, method, path, ip) {
  return `[${timestamp}] ${method} ${path} - ${ip}`;
}

// Middleware: IP logging + whitelist
app.use((req, res, next) => {
  const ip = extractClientIP(req);
  const timestamp = new Date().toISOString();
  const logEntry = formatLogEntry(timestamp, req.method, req.originalUrl, ip);

  activityLog.push(logEntry);
  console.log(logEntry);

  if (config.IPWhitelist && !config.WhitelistedIPs.includes(ip)) {
    console.log(`[403] Blocked IP: ${ip}`);
    return res.status(403).json({ error: 'Forbidden - Your IP is not allowed' });
  }

  next();
});

// Health route
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Dynamic module loader from Funcs/
const funcsDir = join(__dirname, 'Funcs');
if (!existsSync(funcsDir)) mkdirSync(funcsDir);

(async () => {
  try {
    const files = await readdirAsync(funcsDir);
    let loadCount = 0;

    for (const file of files) {
      if (file.endsWith('.js')) {
        const funcPath = join(funcsDir, file);

        try {
          // ✅ Use pathToFileURL for ESM-compatible imports
          const funcModule = await import(pathToFileURL(funcPath).href);

          if (typeof funcModule.register === 'function') {
            funcModule.register(app);
            console.log(`[Loader] Registered module: ${file}`);
            loadCount++;
          } else {
            console.log(`[Loader] No register() export in ${file}`);
          }
        } catch (error) {
          console.log(`[Loader] Error in ${file}: ${error.message}`);
        }
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server live at http://localhost:${PORT}`);
      console.log(`Loaded modules: ${loadCount}`);
    });

  } catch (err) {
    console.log(`❌ Failed to read Funcs directory: ${err.message}`);
  }
})();
