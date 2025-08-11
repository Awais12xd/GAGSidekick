// src/lib/bridgeClient.js (top)
const envServer = import.meta.env.VITE_STOCK_SERVER || ""; // e.g. "https://..."

// Build WS url deterministically from VITE_STOCK_SERVER (if available), else fall back to VITE_STOCK_SOCKET or localhost.
function buildDefaultWs() {
  // 1) If VITE_STOCK_SERVER is set and valid, use it:
  if (envServer) {
    try {
      const u = new URL(envServer);
      // choose wss for https and ws for http
      const proto = u.protocol === "https:" ? "wss" : "ws";
      return `${proto}://${u.host.replace(/\/$/, "")}/alldata`;
    } catch (e) {
      // fall back to other logic
      console.warn("[bridgeClient] invalid VITE_STOCK_SERVER:", envServer, e);
    }
  }

  // 2) Next fallback: the older VITE_STOCK_SOCKET (domain only or with protocol)
  const envSocket = import.meta.env.VITE_STOCK_SOCKET || "";
  if (envSocket) {
    let s = envSocket.trim();
    // strip any protocol if present
    s = s.replace(/^https?:\/\//i, "").replace(/^wss?:\/\//i, "");
    // if host empty -> fallback
    if (s) {
      const pageIsSecure =
        typeof window !== "undefined" && window.location?.protocol === "https:";
      const proto = pageIsSecure ? "wss" : "ws";
      return `${proto}://${s.replace(/\/$/, "")}/alldata`;
    }
  }

  // 3) final fallback: localhost (dev)
  const pageIsSecure =
    typeof window !== "undefined" && window.location?.protocol === "https:";
  const proto = pageIsSecure ? "wss" : "ws";
  return `${proto}://localhost:8000/alldata`;
}

const DEFAULT_WS = buildDefaultWs();
console.debug("[bridgeClient] DEFAULT_WS =", DEFAULT_WS);

const WS_URL =
  typeof window !== "undefined" && window.__BRIDGE_WS_URL
    ? window.__BRIDGE_WS_URL
    : DEFAULT_WS;


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
