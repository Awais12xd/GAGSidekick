// RestockTimer.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * RestockTimer
 *
 * Props:
 *  - timestamp: (number|string) target unix time (ms) OR last-restock time (ms/seconds) — normalized automatically
 *  - serverNow: optional server time (ms/seconds) when the API response was produced (for clock sync)
 *  - name: optional string (e.g. "cosmetics") — when "cosmetics" we assume cyclical period default 4 hours
 *  - periodHours: optional number; when using cyclical "since" mode this is the refresh period (hours)
 *  - timestampMode: "absolute" | "since" — if "since", timestamp is treated as last-restock time. Default: "absolute"
 *
 * Behavior:
 *  - Default: timestampMode="absolute" (timestamp is the future target)
 *  - If name === "cosmetics" and timestampMode not provided -> timestampMode="since" and periodHours default to 4.
 *  - Normalizes seconds -> milliseconds automatically.
 */
const RestockTimer = ({
  timestamp: rawTimestamp,
  serverNow: rawServerNow = null,
  name = "",
  periodHours = null,
  timestampMode = "absolute",
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // refs
  const timerRef = useRef(null);
  const navigatedRef = useRef(false);
  const mountedRef = useRef(true);
  const clockOffsetRef = useRef(0);

  // --- normalize numeric times to milliseconds ---
  const toMs = (v) => {
    if (v == null) return v;
    if (typeof v === "number") {
      return v < 1e12 ? v * 1000 : v; // < 1e12 likely seconds, convert
    }
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n;
    }
    return v;
  };

  const timestamp = toMs(rawTimestamp);
  const serverNow = toMs(rawServerNow);

  // If resource is cosmetics and no explicit timestampMode passed, assume cyclical "since" mode
  let effectiveTimestampMode = timestampMode;
  let effectivePeriodHours = periodHours;
  if (String(name).toLowerCase() === "cosmetics" && !timestampMode) {
    effectiveTimestampMode = "since";
    if (!periodHours) effectivePeriodHours = 4; // cosmetics refresh period = 4 hours (default)
  }

  // period in ms if using "since" mode
  const periodMs = typeof effectivePeriodHours === "number" ? Math.max(0, effectivePeriodHours * 3600 * 1000) : null;

  // compute corrected "now" using server offset if present
  useEffect(() => {
    if (typeof serverNow === "number") {
      clockOffsetRef.current = serverNow - Date.now();
    } else {
      clockOffsetRef.current = 0;
    }
  }, [serverNow]);

  const getNowWithOffset = () => Date.now() + clockOffsetRef.current;

  // initial timeLeft computed using serverNow if available to avoid flash-of-wrong-time
  const initialTimeLeft = (() => {
    const now = getNowWithOffset();
    if (effectiveTimestampMode === "absolute") {
      if (typeof timestamp !== "number") return 0;
      return Math.max(0, timestamp - now);
    } else if (effectiveTimestampMode === "since" && typeof timestamp === "number" && typeof periodMs === "number" && periodMs > 0) {
      // timestamp = lastRestock (ms). compute elapsed since last restock:
      const elapsed = Math.max(0, now - timestamp);
      const rem = periodMs - (elapsed % periodMs);
      // if rem === periodMs then treat as 0 (just at boundary)
      return rem === periodMs ? 0 : rem;
    } else {
      // fallback: if timestamp present treat as absolute
      if (typeof timestamp === "number") return Math.max(0, timestamp - now);
      return 0;
    }
  })();

  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  // update scheduling
  useEffect(() => {
    mountedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    navigatedRef.current = false;

    const updateAndSchedule = () => {
      if (!mountedRef.current) return;
      const now = getNowWithOffset();

      let diff = 0;
      if (effectiveTimestampMode === "absolute") {
        diff = typeof timestamp === "number" ? timestamp - now : 0;
      } else if (effectiveTimestampMode === "since" && typeof timestamp === "number" && typeof periodMs === "number" && periodMs > 0) {
        const elapsed = Math.max(0, now - timestamp);
        let rem = periodMs - (elapsed % periodMs);
        if (rem === periodMs) rem = 0;
        diff = rem;
      } else {
        diff = typeof timestamp === "number" ? timestamp - now : 0;
      }

      if (diff <= 0) {
        setTimeLeft(0);
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          const refreshed = parseInt(searchParams.get("refresh") || "0", 10);
          navigate(`?refresh=${refreshed + 1}`, { replace: true });
        }
        return;
      }

      setTimeLeft(diff);

      const msToNextSecond = diff % 1000;
      const delay = msToNextSecond === 0 ? 1000 : msToNextSecond;
      const safeDelay = Math.max(10, Math.floor(delay));
      timerRef.current = setTimeout(updateAndSchedule, safeDelay);
    };

    // initial tick
    updateAndSchedule();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // re-run if timestamp, serverNow, mode or period changes
  }, [timestamp, serverNow, effectiveTimestampMode, periodMs, navigate, searchParams]);

  // Formatting same as before
  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else if (minutes > 0) {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${String(seconds)}s`;
    }
  };

  return <div className="text-white ml-1 text-lg font-bold">{timeLeft <= 0 ? "Restocked" : formatTime(timeLeft)}</div>;
};

export default RestockTimer;
