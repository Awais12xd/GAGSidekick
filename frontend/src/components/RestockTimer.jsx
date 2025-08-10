import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * RestockTimer
 * Props:
 *   - timestamp: target unix ms (server-provided)
 *   - serverNow (optional): server's Date.now() in ms when the API response was produced.
 *
 * If you pass serverNow, the component will compute a clockOffset = serverNow - Date.now()
 * and use it to correct local clock differences so timer lines up with server/game time.
 */
const RestockTimer = ({ timestamp, serverNow = null }) => {
  // timeLeft in ms
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, timestamp - Date.now()));
  const timerRef = useRef(null);
  const navigatedRef = useRef(false);
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // compute clock offset (serverNow - clientNow)
  const clockOffsetRef = useRef(0);
  useEffect(() => {
    if (typeof serverNow === "number") {
      clockOffsetRef.current = serverNow - Date.now();
    } else {
      clockOffsetRef.current = 0;
    }
  }, [serverNow]);

  useEffect(() => {
    mountedRef.current = true;

    // Clear existing timer if any
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    navigatedRef.current = false;

    const getNow = () => Date.now() + clockOffsetRef.current;

    const updateAndSchedule = () => {
      if (!mountedRef.current) return;

      const now = getNow();
      let diff = timestamp - now;
      if (diff <= 0) {
        // reached or passed target
        setTimeLeft(0);

        // trigger navigate once
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          const refreshed = parseInt(searchParams.get("refresh") || "0", 10);
          // use replace so history doesn't fill with refresh query
          navigate(`?refresh=${refreshed + 1}`, { replace: true });
        }
        return; // no further scheduling
      }

      // Update displayed ms
      setTimeLeft(diff);

      // compute when next displayed second change will happen:
      // we are showing seconds with floor(ms/1000), so schedule next update
      // exactly when ms crosses the next lower second boundary.
      const msToNextSecond = diff % 1000;
      // if msToNextSecond is 0, schedule in ~1000ms (next second)
      const delay = msToNextSecond === 0 ? 1000 : msToNextSecond;

      // Add a tiny safety clamp so we don't schedule 0ms repeatedly
      const safeDelay = Math.max(10, Math.floor(delay));

      timerRef.current = setTimeout(updateAndSchedule, safeDelay);
    };

    // Initial immediate tick (aligns to exact second quickly)
    updateAndSchedule();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timestamp, navigate, searchParams]);

  // formatting (same as yours, kept readable)
  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    } else if (minutes > 0) {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${String(seconds)}s`;
    }
  };

  return <div className="text-white ml-1 text-lg font-bold">{timeLeft <= 0 ? "Restocked" : formatTime(timeLeft)}</div>;
};

export default RestockTimer;
