import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import StockCard from "./components/StockCard.jsx";
import "./App.css";
import { useSearchParams } from "react-router-dom";
import { cosmetics, eggs, fruits, gears } from "./database.js";

/* ... LoadingSkeleton, ErrorBanner, Header, WeatherGrid same as before ... */
/* For brevity I'm including them unchanged. Keep your existing helper components. */

const LoadingSkeleton = ({ rows = 4 }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-gradient-to-br from-green-50 to-white/60 border border-green-200 p-4 animate-pulse min-h-[120px]"
        >
          <div className="w-3/5 h-6 bg-green-200 rounded mb-3"></div>
          <div className="h-8 bg-green-100 rounded mb-2"></div>
          <div className="flex gap-2 mt-3">
            <div className="w-10 h-10 bg-green-100 rounded" />
            <div className="w-10 h-10 bg-green-100 rounded" />
            <div className="w-10 h-10 bg-green-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ErrorBanner = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">Something went wrong</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRetry}
            className="px-3 py-1 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ wsConnected, lastUpdated }) => {
  return (
    <header className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white py-6 px-6 rounded-b-2xl shadow-lg mb-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🌱</div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">
              GAG Sidekick — Live Stock
            </h1>
            <p className="text-sm opacity-90">
              Real-time stock and restock timers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                wsConnected ? "bg-green-300" : "bg-rose-400"
              }`}
              title={wsConnected ? "Live" : "Disconnected"}
            />
            <span>{wsConnected ? "Live" : "Offline"}</span>
          </div>

          <div className="text-xs text-white/90 bg-white/10 px-3 py-1 rounded-md">
            {lastUpdated
              ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}`
              : "No updates yet"}
          </div>
        </div>
      </div>
    </header>
  );
};

const WeatherGrid = ({ currentWeathers }) => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      {currentWeathers && currentWeathers.length > 0 ? (
        <div className="grid gap-4 sm:gr id-cols-2 lg:grid-cols-4">
          {currentWeathers.map((w, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform"
            >
              {/* <div className="text-4xl">{w.emoji}</div> */}
              <div>
                <div className="font-bold text-lg text-emerald-800">
                  {w.type}
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  Active Weather
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 border border-gray-200 rounded-xl p-4 text-center text-gray-700 shadow-sm">
          Working on weather updates! (It will come soon)
        </div>
      )}
    </div>
  );
};

const Home = () => {
  // timers only
  const [data, setData] = useState({ restockTimers: null });

  // initial loading (true until we have both timers AND the first WS snapshot)
  const [initialLoading, setInitialLoading] = useState(true);
  // timersLoading is used for subsequent refreshes only (small spinner)
  const [timersLoading, setTimersLoading] = useState(false);

  const [error, setError] = useState(null);

  // new server live data (source-of-truth for stock + weather)
  const [newServerData, setNewServerData] = useState(null);
  const newServerTsRef = useRef(0);

  // enriched arrays for UI (images/rarity)
  const [seedData, setSeedData] = useState([]);
  const [eggData, setEggData] = useState([]);
  const [gearData, setGearData] = useState([]);
  const [cosmeticData, setCosmeticData] = useState([]);
  const [weatherWsConnected, setWeatherWsConnected] = useState(false);
  // signature refs to avoid no-op updates
  const lastPayloadSigRef = useRef(null); // used by main WS (if you add the sig check there)
  const lastWeatherSigRef = useRef(null);
   const makeSig = (payload) => {
    try {
      const ts = payload?.timestamp ?? (payload?.lastGlobalUpdate ? Date.parse(payload.lastGlobalUpdate) : null);
      if (ts) return `ts:${ts}`;
      return JSON.stringify(payload);
    } catch (e) {
      return String(Date.now());
    }
  };
  // ws status
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchParams] = useSearchParams();

  // refs to coordinate initial load: we mark each source as ready
  const timersReadyRef = useRef(false);
  const wsReadyRef = useRef(false);

  // fetch restock timers only (no full-page loading on subsequent calls)
  const fetchAllData = async () => {
    // if initial load hasn't finished yet, show initialLoading,
    // otherwise show only timersLoading for a small spinner.
    if (!initialLoading) setTimersLoading(true);
    setError(null);
    try {
      const timestamp = Date.now();
      const timerRes = await axios.get(
        `http://localhost:3000/api/stock/restock-time?ts=${timestamp}`,
        {
          headers: { "Cache-Control": "no-cache" },
        }
      );

      setData({ restockTimers: timerRes.data });
      timersReadyRef.current = true;

      // if WS already provided data, we can turn off initialLoading
      if (wsReadyRef.current && initialLoading) {
        setInitialLoading(false);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching restock timers:", err);
      setError("Could not load restock timers. Try retrying.");
      // If it's initial load and WS is present, allow UI to show data anyway
      if (wsReadyRef.current && initialLoading) {
        setInitialLoading(false);
      }
    } finally {
      setTimersLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // refetch when refresh param changes
  }, [searchParams.get("refresh")]);

  // ----------------------------
  // NEW BACKEND WS (ws://localhost:5000)
  // ----------------------------
  useEffect(() => {
    let mounted = true;
    let ws = null;
    let reconnectTimer = null;
    let attempts = 0;

    const connect = () => {
      if (!mounted) return;
      try {
        ws = new WebSocket("ws://localhost:5000");
      } catch (err) {
        console.error("[NEW BACKEND WS] constructor failed:", err);
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        if (!mounted) return;
        console.log("[NEW BACKEND WS] connected to ws://localhost:5000");
        attempts = 0;
        setWsConnected(true);
      };

      ws.onmessage = (e) => {
        if (!mounted) return;
        try {
          const msg = JSON.parse(e.data);
          const payload = msg.data ?? msg;
          // console the payload so you can inspect it
          console.log("[NEW BACKEND WS] message received:", msg);

          // update source-of-truth
          setNewServerData(payload);
          setLastUpdated(Date.now());

          // mark ws ready for initial loading if not already
          wsReadyRef.current = true;
          if (timersReadyRef.current && initialLoading) {
            setInitialLoading(false);
          }

          // timestamp handling
          const ts =
            payload.timestamp ??
            (payload.lastGlobalUpdate
              ? Date.parse(payload.lastGlobalUpdate)
              : null);
          if (ts && ts !== newServerTsRef.current) {
            newServerTsRef.current = ts;
            console.log(
              "[NEW BACKEND WS] new timestamp:",
              new Date(ts).toISOString()
            );
          }
        } catch (err) {
          console.error("[NEW BACKEND WS] parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[NEW BACKEND WS] socket error:", err);
      };

      ws.onclose = (ev) => {
        if (!mounted) return;
        console.warn(
          "[NEW BACKEND WS] connection closed",
          ev?.code,
          ev?.reason
        );
        setWsConnected(false);
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (!mounted) return;
      attempts = Math.min(12, attempts + 1);
      const delay = Math.min(30000, 1000 * 2 ** attempts);
      console.log(
        `[NEW BACKEND WS] reconnecting in ${delay}ms (attempt ${attempts})`
      );
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, delay);
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        if (ws) ws.close();
      } catch (e) {}
    };
  }, []);
   
  //weather
    // ----------------------------
  // WEATHER-ONLY WS (ws://localhost:5000/weather)
  // ----------------------------
  useEffect(() => {
    let mounted = true;
    let ws = null;
    let reconnectTimer = null;
    let attempts = 0;

    const connectWeather = () => {
      if (!mounted) return;

      // build ws url (override with env if needed)
    //   const PROTO = window.location.protocol === "https:" ? "wss" : "ws";
    //   const baseHost = import.meta.env.REACT_APP_WS_BASE || `${PROTO}://${window.location.hostname}:${process.env.REACT_APP_WS_PORT || 5000}`;
    //   const weatherPath = process.env.REACT_APP_WS_WEATHER_PATH || "/weather";
    //   const url = `${baseHost.replace(/\/$/, "")}${weatherPath}`;

      try {
        ws = new WebSocket("ws://localhost:5000/weather");
      } catch (err) {
        console.error("[WEATHER WS] constructor failed:", err);
        scheduleWeatherReconnect();
        return;
      }

      ws.onopen = () => {
        if (!mounted) return;
        console.log("[WEATHER WS] connected to ws://localhost:5000");
        attempts = 0;
        setWeatherWsConnected(true);
      };

      ws.onmessage = (e) => {
        if (!mounted) return;
        try {
          const msg = JSON.parse(e.data);
          // payload may be msg.data or msg itself; normalize
          const payload = msg.data ?? msg;

          // signature check to avoid no-op updates
          const sig = makeSig(payload);
          if (sig === lastWeatherSigRef.current) {
            // no actual change
            return;
          }
          lastWeatherSigRef.current = sig;

          // Merge weather into the existing newServerData without wiping other fields:
          setNewServerData((prev) => {
            // defensive copy
            const next = prev ? { ...prev } : {};
            // support messages that are either { weather: [...] } or the raw weather array/object
            if (payload.weather !== undefined) {
              next.weather = payload.weather;
            } else {
              // payload is weather itself (array or object)
              next.weather = payload;
            }
            // update a timestamp for UI freshness
            next.timestamp = Date.now();
            return next;
          });

          // update lastUpdated and a small debug ts
          setLastUpdated(Date.now());
          const tsFromPayload = payload.timestamp ?? (payload.lastGlobalUpdate ? Date.parse(payload.lastGlobalUpdate) : null);
          if (tsFromPayload && tsFromPayload !== newServerTsRef.current) {
            newServerTsRef.current = tsFromPayload;
            console.log("[WEATHER WS] new weather timestamp:", new Date(tsFromPayload).toISOString());
          } else {
            console.log("[WEATHER WS] weather message merged");
          }
        } catch (err) {
          console.error("[WEATHER WS] parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[WEATHER WS] socket error:", err);
      };

      ws.onclose = (ev) => {
        if (!mounted) return;
        console.warn("[WEATHER WS] connection closed", ev?.code, ev?.reason);
        setWeatherWsConnected(false);
        scheduleWeatherReconnect();
      };
    };

    const scheduleWeatherReconnect = () => {
      if (!mounted) return;
      attempts = Math.min(12, attempts + 1);
      const baseDelay = Math.min(30000, 1000 * 2 ** attempts);
      const jitter = Math.floor(Math.random() * 400) - 200; // ±200ms jitter
      const delay = Math.max(0, baseDelay + jitter);
      console.log(`[WEATHER WS] reconnecting in ${delay}ms (attempt ${attempts})`);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectWeather, delay);
    };

    connectWeather();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        if (ws) ws.close();
      } catch (e) {}
      setWeatherWsConnected(false);
    };
  }, []); // run once


  // Merge newServerData into enriched arrays (images, rarity)
  useEffect(() => {
    if (!newServerData) return;

    const seedsArr = newServerData.seeds ?? newServerData.seed?.items ?? [];
    const eggsArr = newServerData.eggs ?? newServerData.egg?.items ?? [];
    const gearsArr =
      newServerData.gear ??
      newServerData.gear?.items ??
      newServerData.gear ??
      [];
    const cosmeticsArr =
      newServerData.cosmetics ?? newServerData.cosmetics?.items ?? [];

    if (Array.isArray(seedsArr)) {
      const updatedSeeds = seedsArr.map((item) => {
        const match = fruits.find((f) => f.name === item.name);
        return match
          ? { ...item, image: match.image, rarity: match.metadata?.tier }
          : item;
      });
      setSeedData(updatedSeeds);
    }

    if (Array.isArray(eggsArr)) {
      const updatedEggs = eggsArr.map((item) => {
        const match = eggs.find((f) => f.name === item.name);
        return match
          ? { ...item, image: match.image, rarity: match.metadata?.tier }
          : item;
      });
      setEggData(updatedEggs);
    }

    if (Array.isArray(gearsArr)) {
      const updatedGears = gearsArr.map((item) => {
        const match = gears.find((g) => g.name === item.name);
        return match
          ? { ...item, image: match.image, rarity: match.metadata?.tier }
          : item;
      });
      setGearData(updatedGears);
    }

    if (Array.isArray(cosmeticsArr)) {
      const updatedCos = cosmeticsArr.map((item) => {
        const match = cosmetics.find((c) => c.name === item.name);
        return match
          ? { ...item, image: match.image, rarity: match.metadata?.tier }
          : item;
      });
      setCosmeticData(updatedCos);
    }

    if (newServerData.weather) {
      console.log("[NEW BACKEND WS] weather payload:", newServerData.weather);
    }
  }, [newServerData]);

  // Derived display arrays
  const displaySeeds = seedData;
  const displayGears = gearData;
  const displayEggs = eggData;
  const displayCosmetics = cosmeticData;

  const currentWeathers = (() => {
    const weathers = newServerData?.weather ?? [];
    return Array.isArray(weathers) ? weathers.filter((i) => i.isActive) : [];
  })();

  // UI: initial full-screen loading while we wait for both sources
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
        <Header wsConnected={wsConnected} lastUpdated={lastUpdated} />
        <main className="max-w-[1500px] mx-auto px-4">
          <div className="mb-6">
            <div className="text-center text-2xl font-bold text-emerald-800 mb-2">
              Live Garden Stocks
            </div>
            <p className="text-center text-sm text-gray-600">
              Connecting to live feeds — please wait
            </p>
          </div>

          <div className="space-y-4">
            <LoadingSkeleton rows={4} />
          </div>
        </main>
      </div>
    );
  }

  // If we got here initialLoading=false -> show normal UI. timersLoading will show a small spinner instead of full-screen loading.
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-8">
      <Header wsConnected={wsConnected} lastUpdated={lastUpdated} />

      <main className="max-w-[1700px] mx-auto px-4 space-y-6">
        {/* Weather */}
        <WeatherGrid currentWeathers={currentWeathers} />

        {/* Controls & meta */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition flex items-center"
            >
              {timersLoading ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-300 animate-pulse mr-2" />
                  Refreshing Timers...
                </>
              ) : (
                "Refresh Timers"
              )}
            </button>
            {/* small debug/info */}
            <div className="text-xs text-gray-600 ml-2">
              {newServerTsRef.current
                ? `Last snapshot: ${new Date(
                    newServerTsRef.current
                  ).toLocaleTimeString()}`
                : "No snapshot yet"}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Made By:</span> Awais Ali (Here is my roblox id "awais_ali5" lets play GAG)
          </div>
        </div>

        {/* Stocks grid */}
        <div className="sm:grid gap-y-10 sm:gap-4 flex flex-col items-center sm:items-start mx-auto sm:justify-items-center md:grid-cols-2 2xl:grid-cols-4 ">
          <StockCard
            title="🌱 Seeds Stock"
            items={displaySeeds}
            name="seeds"
            restockTimers={data.restockTimers}
          />
          <StockCard
            title="⚙️ Gear Stock"
            items={displayGears}
            name="gears"
            restockTimers={data.restockTimers}
          />
          <StockCard
            title="🥚 Egg Stock"
            items={displayEggs}
            name="eggs"
            restockTimers={data.restockTimers}
          />
          <StockCard
            title="🎨 Cosmetics Stock"
            items={displayCosmetics}
            name="cosmetics"
            restockTimers={data.restockTimers}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8 pb-6">
          Built for Grow A Garden players — data is proxied through your
          backend. Live updates powered by WebSocket.
        </div>
      </main>
    </div>
  );
};

export default Home;
