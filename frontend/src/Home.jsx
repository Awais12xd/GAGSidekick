// src/pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import StockCard from "./components/StockCard.jsx";
import "./App.css";
import { useSearchParams } from "react-router-dom";
import {
  cosmetics as DB_COSMETICS,
  eggs as DB_EGGS,
  fruits as DB_FRUITS,
  gears as DB_GEARS,
} from "./database.js";
console
// NEW: per-route hooks (you said these exist in ../hooks/index.js)
import {
  useWeather,
  useSeeds,
  useGear,
  useEggs,
  useCosmetics,
} from "./hooks/index.js";

import BridgeDashboard from "./components/TestCard.jsx";
import TestNewLogic from "./components/TestNewLogic.jsx";
import api from "./lib/api.js";

/* ---------- Small UI pieces (kept simple / same as your originals) ---------- */

const LoadingSkeleton = ({ rows = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl bg-gradient-to-br from-green-50 to-white/60 border border-green-200 p-4 animate-pulse min-h-[120px]"
      >
        <div className="w-3/5 h-6 bg-green-200 rounded mb-3" />
        <div className="h-8 bg-green-100 rounded mb-2" />
        <div className="flex gap-2 mt-3">
          <div className="w-10 h-10 bg-green-100 rounded" />
          <div className="w-10 h-10 bg-green-100 rounded" />
          <div className="w-10 h-10 bg-green-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const Header = ({ wsConnected, lastUpdated }) => (
  <header className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white py-6 px-6 rounded-b-2xl shadow-lg mb-6">
    <div className="max-w-6xl mx-auto flex flex-col  sm:flex-row  items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="text-3xl">🌱</div>
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">
            Garden Side — Live Stock
          </h1>
          <p className="text-sm opacity-90">
            Real-time stock , weather updates and restock timers
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
            ? `Updated: ${lastUpdated}`
            : "No updates yet"}
        </div>
      </div>
    </div>
  </header>
);

const WeatherGrid = ({ currentWeathers }) => (
  <div className="max-w-6xl mx-auto p-4">
    {currentWeathers && currentWeathers.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {currentWeathers.map((w, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform"
          >
            <div className="flex gap-4 items-center">
              <img className="w-7 h-7 shadow-xl" src={w.icon} alt="" />
              <div className="flex flex-col gap-1">
                <div className="font-bold text-lg text-emerald-800">
                  {w.type ?? w.weather_name ?? w.weather_id ?? w.name}
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  Active Weather
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white/80 border border-gray-200 rounded-xl p-4 text-center text-gray-700 shadow-sm">
        No active weather right now!
      </div>
    )}
  </div>
);

/* ---------- Home component (uses per-route hooks) ---------- */

const deepEqual = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

const enrichItems = (items = [], db = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const name = item.display_name ?? item.name ?? item.item_id ?? item.id;
    const match = db.find((d) => d.name === name);
    return match
      ? { ...item, image: match.image, rarity: match.metadata?.tier }
      : item;
  });
};

const Home = () => {
  // timers (kept)
  const [timersData, setTimersData] = useState({ restockTimers: null });
  const [timersLoading, setTimersLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // enriched arrays for UI (local state per route)
  const [seedData, setSeedData] = useState([]);
  const [eggData, setEggData] = useState([]);
  const [gearData, setGearData] = useState([]);
  const [cosmeticData, setCosmeticData] = useState([]);

  const newServerTsRef = useRef(0);

  // ---------- Per-route hooks (your new hooks) ----------
  const { data: seeds, loading: seedsLoading } = useSeeds(); // array or null
  const { data: gear, loading: gearLoading } = useGear();
  const { data: eggs, loading: eggsLoading } = useEggs();
  const { data: cosmetics, loading: cosmeticsLoading } = useCosmetics();
  const { data: weather, loading: weatherLoading } = useWeather();

  // initial-load coordination: we consider "wsReady" true when any of the hooks provides non-null data
  const timersReadyRef = useRef(false);
  const wsReadyRef = useRef(false);

  const [searchParams] = useSearchParams();

  // fetch restock timers only (unchanged)
  const fetchAllData = async () => {
    if (!initialLoading) setTimersLoading(true);
    setError(null);
    try {
      const timestamp = Date.now();
      const API_BASE = import.meta.env.VITE_TIMER_SERVER ?? "";
      const endpoint = API_BASE
        ? `${API_BASE.replace(/\/$/, "")}/api/stock/restock-time`
        : "/api/stock/restock-time";
      const timerRes = await api.get(`/api/stock/restock-time`, {
        params: { ts: Date.now() },
      });
      setTimersData({ restockTimers: timerRes.data });
      timersReadyRef.current = true;

      if (wsReadyRef.current && initialLoading) setInitialLoading(false);
    } catch (err) {
      console.error("Error fetching restock timers:", err);
      setError("Could not load restock timers. Try retrying.");
      if (wsReadyRef.current && initialLoading) setInitialLoading(false);
    } finally {
      setTimersLoading(false);
    }
  };
  useEffect(() => {
  // initial call (so timersReadyRef becomes true after successful fetch)
  fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

 useEffect(() => {
  if (!searchParams.get("refresh")) return;

  fetchAllData();

  // Remove ?refresh=... from URL without reloading
  const url = new URL(window.location);
  url.searchParams.delete("refresh");
  window.history.replaceState({}, "", url);
}, [searchParams.get("refresh")]);

  // When any hook yields data (first non-null), mark wsReady
  useEffect(() => {
    const anyData =
      (Array.isArray(seeds) && seeds.length > 0) ||
      (Array.isArray(gear) && gear.length > 0) ||
      (Array.isArray(eggs) && eggs.length > 0) ||
      (Array.isArray(cosmetics) && cosmetics.length > 0) ||
      (Array.isArray(weather) && weather.length > 0);

    if (anyData) {
      wsReadyRef.current = true;
      if (timersReadyRef.current && initialLoading) setInitialLoading(false);
    }
  }, [seeds, gear, eggs, cosmetics, weather]);

  // Per-route effects: only update that specific card when new data arrives.
  useEffect(() => {
    if (!Array.isArray(seeds)) return; // don't clobber when undefined/null
    const enriched = enrichItems(seeds, DB_FRUITS);
    if (!deepEqual(enriched, seedData)) setSeedData(enriched);
  }, [seeds]); // run only when seeds hook changes

  useEffect(() => {
    if (!Array.isArray(eggs)) return;
    const enriched = enrichItems(eggs, DB_EGGS);
    if (!deepEqual(enriched, eggData)) setEggData(enriched);
  }, [eggs]);

  useEffect(() => {
    if (!Array.isArray(gear)) return;
    const enriched = enrichItems(gear, DB_GEARS);
    if (!deepEqual(enriched, gearData)) setGearData(enriched);
  }, [gear]);

  useEffect(() => {
    if (!Array.isArray(cosmetics)) return;
    const enriched = enrichItems(cosmetics, DB_COSMETICS);
    if (!deepEqual(enriched, cosmeticData)) setCosmeticData(enriched);
  }, [cosmetics]);

  // If you want to display weather, we can use the weather hook directly
  const currentWeathers = useMemo(() => {
    const w = weather ?? [];
    return Array.isArray(w) ? w.filter((i) => i.active) : [];
  }, [weather]);

  // Simple WS-connected indicator: true if at least one route is *not* loading
  const anyRouteConnected = !(
    seedsLoading &&
    gearLoading &&
    eggsLoading &&
    cosmeticsLoading &&
    weatherLoading
  );

  // UI: initial full-screen loading while we wait for both timers AND at least one route snapshot
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
        <Header
          wsConnected={anyRouteConnected}
          lastUpdated={newServerTsRef.current || null}
        />
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

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-b w-full from-emerald-50 to-white pb-8">
      <Header
        wsConnected={anyRouteConnected}
        lastUpdated={new Date().toLocaleTimeString()}
      />

      <main className="max-w-[1700px] mx-auto px-1 sm:px-4 space-y-6 ">
        <WeatherGrid currentWeathers={currentWeathers} />

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

            <div className="text-xs text-gray-600 ml-2">
              {/* you can show last snapshot ts here if you maintain one */}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Made By:</span> Awais Ali (roblox id
            "awais_ali5")
          </div>
        </div>

        <div className="sm:grid gap-y-10 sm:gap-4 flex flex-col items-center sm:items-start mx-auto sm:justify-items-center md:grid-cols-2 2xl:grid-cols-4 ">
          <StockCard
            title="🌱 Seeds Stock"
            items={seedData}
            name="seeds"
            restockTimers={timersData.restockTimers}
          />
          <StockCard
            title="⚙️ Gear Stock"
            items={gearData}
            name="gears"
            restockTimers={timersData.restockTimers}
          />
          <StockCard
            title="🥚 Egg Stock"
            items={eggData}
            name="eggs"
            restockTimers={timersData.restockTimers}
          />
          <StockCard
            title="🎨 Cosmetics Stock"
            items={cosmeticData}
            name="cosmetics"
            restockTimers={timersData.restockTimers}
          />
        </div>

        <div className="text-center text-xs text-gray-500 mt-8 pb-6">
          Built for Grow A Garden players — data is proxied . Live updates powered by WebSocket.
        </div>
      </main>
    </div>
  );
};

export default Home;
