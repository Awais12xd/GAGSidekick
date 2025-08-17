// src/hooks/useBridgeKey.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import bridgeClient from "../lib/bridgeClient.js";

/**
 * useBridgeKey({ path, candidateKeys = [key], httpBase })
 * - path: HTTP route to fetch initial snapshot (e.g. "/seeds")
 * - candidateKeys: array of possible keys that may appear in incoming WS payloads
 * - httpBase: base URL for REST backend (default from REACT_APP_BRIDGE_HTTP or http://localhost:8000)
 */
export default function useBridgeKey({
  path = "/",
  candidateKeys = [],
  httpBase,
} = {}) {
  const inferredBase =
    import.meta.env.VITE_STOCK_SERVER || "http://localhost:8000";
  const base = inferredBase.replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // store latest incoming value for debug/reference, not used for rendering
  const incomingRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // fetch initial snapshot via HTTP
    (async () => {
      try {
        const res = await axios.get(url, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!mounted) return;
        setData(res.data ?? null);
        console.log(res.data)
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to fetch initial data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    /**
     * skjdh
     * Normalize incoming payloads to a 'body' that likely contains the resource.
     * Common shapes:
     *  - { weather: [...] }
     *  - { data: { weather: [...] } }
     *  - { type: "weather", data: [...] }
     *  - direct array/object
     */
    function normalizePayload(raw) {
      if (!raw) return raw;
      // If the bridge client already sent detail normalized, allow it through
      const maybeData = raw?.data ?? raw?.payload ?? raw?.body;
      if (maybeData !== undefined) {
        return maybeData;
      }
      return raw;
    }

    function updateStateWithIncoming(incoming) {
      incomingRef.current = incoming;
      // always compare against previous state via the functional setState
      setData((prev) => {
        try {
          const prevStr = prev === undefined ? undefined : JSON.stringify(prev);
          const newStr = JSON.stringify(incoming);
          if (prevStr === newStr) return prev;
        } catch (e) {
          // if stringify fails, fall through and set incoming
        }
        return incoming;
      });
    }

    function onMessage(ev) {
      console.log("hello")
      const raw = ev?.detail ?? ev;
      // Uncomment to debug raw incoming messages
      console.debug("[useBridgeKey] raw payload:", raw);

      // 1) quick guard - sometimes bridge sends simple heartbeat or non-json; handle gracefully
      if (raw === undefined || raw === null) return;

      // Normalize candidate body.
      const body = normalizePayload(raw);

      // Uncomment to debug normalized body
      // console.debug("[useBridgeKey] normalized body:", body);

      // If candidate keys provided, try them in order against the normalized body
      for (const key of candidateKeys) {
        if (body && Object.prototype.hasOwnProperty.call(body, key)) {
          const incoming = body[key];
          updateStateWithIncoming(incoming);
          return;
        }

        // Also support message shape where type indicates resource, e.g. { type: 'weather', data: [...] }
        if (
          raw?.type &&
          key &&
          String(raw.type).toLowerCase() === String(key).toLowerCase()
        ) {
          // raw.data might be the actual payload
          const incoming = raw?.data ?? body;
          updateStateWithIncoming(incoming);
          return;
        }

        // Support a nested `data` that itself contains the resource key
        if (raw?.data && Object.prototype.hasOwnProperty.call(raw.data, key)) {
          const incoming = raw.data[key];
          updateStateWithIncoming(incoming);
          return;
        }
      }

      // If no candidate keys were provided, or nothing matched, accept the normalized body
      // when it looks like the resource itself (an array or object).
      if (candidateKeys.length === 0) {
        if (Array.isArray(body) || (body && typeof body === "object")) {
          updateStateWithIncoming(body);
        }
        return;
      }

      // Fallback: some servers send { type: 'alldata', data: { weather: [...], eggs: [...] } }
      // If candidateKeys includes a key and the body is an object with that key under it, handle it.
      if (body && typeof body === "object") {
        for (const key of candidateKeys) {
          if (Object.prototype.hasOwnProperty.call(body, key)) {
            updateStateWithIncoming(body[key]);
            return;
          }
        }
      }

      // No match — ignore
    }

    function onStatus(ev) {
      const det = ev?.detail || {};
      setWsConnected(Boolean(det.connected));
    }

    // subscribe to bridge client events
    if (bridgeClient) {
      bridgeClient.addEventListener("message", onMessage);
      bridgeClient.addEventListener("status", onStatus);
    }

    return () => {
      mounted = false;
      if (bridgeClient) {
        bridgeClient.removeEventListener("message", onMessage);
        bridgeClient.removeEventListener("status", onStatus);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, path, candidateKeys.join(","), httpBase]);

  return { data, loading, error, wsConnected };
}
