// src/lib/bridgeClient.js
// Singleton bridge client that connects to the local bridge WS and emits events.
// Configure via REACT_APP_BRIDGE_WS (default ws://localhost:8000)

// src/lib/bridgeClient.js
// --- top of file ---
const envSocket = import.meta.env.VITE_STOCK_SOCKET || ""; // e.g. "gagsidekick-backend-stockserver-rtx5y.ondigitalocean.app" or "https://domain"
function buildDefaultWs() {
  if (!envSocket) return "ws://localhost:8000/alldata";

  // if envSocket already has protocol (http(s) or ws(s)), normalize
  let s = envSocket.trim();
  if (/^https?:\/\//i.test(s)) s = s.replace(/^https?:\/\//i, "");
  if (/^wss?:\/\//i.test(s)) s = s.replace(/^wss?:\/\//i, "");

  // choose proto depending on page protocol
  const pageIsSecure = (typeof window !== "undefined") && window.location && window.location.protocol === "https:";
  const proto = pageIsSecure ? "wss" : "ws";

  // include the path (use /alldata by default)
  return `${proto}://${s.replace(/\/$/, "")}/alldata`;
}

const DEFAULT_WS = buildDefaultWs();
const WS_URL = typeof window !== "undefined" && window.__BRIDGE_WS_URL ? window.__BRIDGE_WS_URL : DEFAULT_WS;
// --- rest of file unchanged ---


class BridgeClient extends EventTarget {
  constructor() {
    super();
    this.url = WS_URL;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.lastSig = null;
    this.connect();
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.dispatchEvent(new CustomEvent("status", { detail: { connected: true } }));
    });

    this.ws.addEventListener("message", (ev) => {
      let parsed;
      try {
        parsed = JSON.parse(ev.data);
      } catch (e) {
        // ignore non-json
        return;
      }
      // dedupe identical payloads
      let sig;
      try {
        sig = JSON.stringify(parsed);
      } catch {
        sig = String(Date.now());
      }
      if (sig === this.lastSig) return;
      this.lastSig = sig;

      // emit parsed payload
      this.dispatchEvent(new CustomEvent("message", { detail: parsed }));
    });

    this.ws.addEventListener("close", (ev) => {
      this.dispatchEvent(new CustomEvent("status", { detail: { connected: false, code: ev.code, reason: ev.reason?.toString?.() } }));
      // don't reconnect on auth failure (code 4000), otherwise exponential backoff
      const reason = (ev.reason && String(ev.reason).toLowerCase()) || "";
      if (ev.code === 4000 || /auth|token|no token/i.test(reason)) {
        console.error("[bridgeClient] upstream auth failed, not reconnecting:", ev.code, ev.reason);
        return;
      }
      this._scheduleReconnect();
    });

    this.ws.addEventListener("error", (err) => {
      // we'll get close event too - just notify
      this.dispatchEvent(new CustomEvent("status", { detail: { connected: false, error: err?.message || err } }));
    });
  }

  _scheduleReconnect() {
    this.reconnectAttempts = Math.min(12, (this.reconnectAttempts || 0) + 1);
    const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempts);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), delay + Math.floor(Math.random() * 300));
  }

  close() {
    try {
      if (this.ws) this.ws.close();
    } catch {}
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
  }
}

const client = typeof window !== "undefined" ? new BridgeClient() : null;
export default client;
