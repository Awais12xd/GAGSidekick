// src/hooks/useBridgeData.js
import { useEffect, useRef, useState } from "react";

/**
 * useBridgeData({ url })
 * - Connects to a WS (default ws://localhost:8000)
 * - Exposes { data, wsConnected, lastUpdated, error }
 */
export default function useBridgeData({
  url = "ws://localhost:8000",
  heartbeatInterval = 25000,
} = {}) {
  const [data, setData] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const lastUpdatedRef = useRef(null);

  const wsRef = useRef(null);
  const reconnectRef = useRef({ attempts: 0, timer: null });
  const heartbeatRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    function connect() {
      if (!mounted) return;

      // avoid duplicate connect
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mounted) return;
        reconnectRef.current.attempts = 0;
        setWsConnected(true);
        setError(null);

        // heartbeat ping (keep NAT alive)
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          try {
            if (ws.readyState === WebSocket.OPEN)
              ws.send(JSON.stringify({ type: "ping" }));
          } catch {}
        }, heartbeatInterval);
      };

      ws.onmessage = (ev) => {
        if (!mounted) return;
        try {
          const msg = JSON.parse(ev.data);
          // normalize incoming payload: prefer msg.data, otherwise msg itself
          let incoming =
            msg?.type === "alldata" && msg.data ? msg.data : msg.data ?? msg;

          // Helper: crude deep-equal via JSON.stringify (safe fallback)
          const equal = (a, b) => {
            try {
              return JSON.stringify(a) === JSON.stringify(b);
            } catch {
              return a === b;
            }
          };

          // If incoming is a non-plain object (array / primitive), try to infer a key:
          if (!incoming || typeof incoming !== "object") {
            // primitive — put under "payload" key so we don't destroy previous keys
            incoming = { payload: incoming };
          } else if (Array.isArray(incoming)) {
            // try to detect what this array is (weather, seeds, gear, eggs, cosmetics)
            const first = incoming[0] || {};
            if (
              first &&
              (first.weather_id || first.weather_name || first.icon)
            ) {
              incoming = { weather: incoming };
            } else if (
              first &&
              (first.item_id || first.display_name || first.name)
            ) {
              // many stock items include item_id/display_name
              // we don't know which stock (seed/gear/egg/cosmetic), so try to guess by common fields
              // heuristic: eggs often have "rarity" or egg-specific keys — fallback to "seed_stock"
              // If you know your upstream always uses specific keys (seed_stock, gear_stock),
              // this block won't run because incoming would be { seed_stock: [...] } instead of raw array.
              incoming = { seed_stock: incoming };
            } else {
              // unknown array, store as generic payload
              incoming = { payload: incoming };
            }
          }

          // Now incoming is a plain object: merge *only its keys* into state
          setData((prev) => {
            const base = prev && typeof prev === "object" ? prev : {};
            let changed = false;
            const next = { ...base };

            for (const key of Object.keys(incoming)) {
              const prevVal = base[key];
              const newVal = incoming[key];

              if (!equal(prevVal, newVal)) {
                next[key] = newVal;
                changed = true;
              }
            }

            // if nothing actually changed, return previous state (avoids re-render)
            if (!changed) return prev;

            // update timestamp here because an actual change will happen
            lastUpdatedRef.current = Date.now();
            return next;
          });
        } catch (err) {
          console.warn("Bridge parse error:", err);
        }
      };

      ws.onerror = (err) => {
        if (!mounted) return;
        console.error("bridge ws error", err);
        setError(err?.message ?? "WebSocket error");
      };

      ws.onclose = (ev) => {
        if (!mounted) return;
        setWsConnected(false);
        // exponential backoff reconnect
        reconnectRef.current.attempts =
          (reconnectRef.current.attempts || 0) + 1;
        const delay = Math.min(
          30000,
          1000 * 2 ** Math.min(reconnectRef.current.attempts, 8)
        );
        reconnectRef.current.timer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      mounted = false;
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      try {
        wsRef.current?.close?.();
      } catch {}
    };
  }, [url, heartbeatInterval]);

  return {
    data,
    wsConnected,
    lastUpdated: lastUpdatedRef.current,
    error,
  };
}
