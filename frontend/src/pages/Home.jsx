// src/pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios, { all } from "axios";
import StockCard from "../components/StockCard.jsx";
import "../App.css";
import { useSearchParams } from "react-router-dom";
import {
  cosmetics as DB_COSMETICS,
  eggs as DB_EGGS,
  fruits as DB_FRUITS,
  gears as DB_GEARS,
} from "../database.js";
// NEW: per-route hooks (you said these exist in ../hooks/index.js)
import {
  useWeather,
  useSeeds,
  useGear,
  useEggs,
  useCosmetics,
  useTravelingMerchant,
  useAllData,
} from "../hooks/index.js";

import api from "../lib/api.js";
import TravelingMerchantCard from "../components/TravelingMerchantCard.jsx";
import Header from "../components/Header.jsx";
import Hero from "../components/hero/Hero.jsx";
import Heading from "../components/Heading.jsx";
import Footer from "../components/Footer.jsx";
import PlantsCategories from "../components/categories/PlantsCategories.jsx";
import Foods from "../components/categories/Foods.jsx";
import TestingIdea from "../components/TestingIdea.jsx";
import Testing2 from "../components/Testing2.jsx";
import Text from "../components/Text.jsx";


/* ---------- Small UI pieces (kept simple / same as your originals) ---------- */

// const LoadingSkeleton = ({ rows = 4 }) => (
//   <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
//     {Array.from({ length: rows }).map((_, i) => (
//       <div
//         key={i}
//         className="rounded-xl bg-gradient-to-br from-green-50 to-white/60 border border-green-200 p-4 animate-pulse min-h-[120px]"
//       >
//         <div className="w-3/5 h-6 bg-green-200 rounded mb-3" />
//         <div className="h-8 bg-green-100 rounded mb-2" />
//         <div className="flex gap-2 mt-3">
//           <div className="w-10 h-10 bg-green-100 rounded" />
//           <div className="w-10 h-10 bg-green-100 rounded" />
//           <div className="w-10 h-10 bg-green-100 rounded" />
//         </div>
//       </div>
//     ))}
//   </div>
// );

const HeaderCompo = ({ wsConnected, lastUpdated }) => (
  <header className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white py-6 px-6 rounded-b-2xl shadow-lg mb-6">
    <div className="max-w-[1700px] mx-auto flex flex-col  sm:flex-row  items-center justify-between gap-4">
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
          {lastUpdated ? `Updated: ${lastUpdated}` : "No updates yet"}
        </div>
      </div>
    </div>
  </header>
);

// WeatherGrid.jsx
/* Small fallback SVGs for common weather types */

/* Small fallback SVGs for common weather types (unchanged) */
function WeatherFallbackSVG({ type = "clear", className = "w-10 h-10" }) {
  if (/rain|drizzle|shower/i.test(type)) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path d="M20 16.6A5 5 0 0016 7h-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 16v2M12 16v2M16 16v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (/cloud|overcast/i.test(type)) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
        <path d="M20 17.58A4 4 0 0016 9H7a4 4 0 00-1 7.83" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  // sunny / clear default
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* small helper to convert seconds to human text */
function formatDurationSeconds(sec) {
  if (sec == null) return null;
  if (sec <= 0) return "0s";
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.ceil(sec / 60)}m`;
  const hrs = Math.floor(sec / 3600);
  const mins = Math.ceil((sec % 3600) / 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/* Main Card - now receives `now` (ms) so it can update live */
function WeatherCard({ w, now }) {
  const name = w.weather_name || w.weather_id || w.type || w.name || "Unknown";
  const icon = w.icon || null;
  const active = !!w.active;

  // duration interpretation:
  // - your sample used duration: 180 (looks like seconds). We treat `duration` as seconds here.
  const durationSec = Number.isFinite(w.duration) ? Number(w.duration) : 0;

  // compute progress using unix start/end fields if present
  const nowSec = Math.floor(now / 1000);

  let progressFraction = null;
  let remainingSec = null;
  if (w.start_duration_unix && w.end_duration_unix && w.end_duration_unix > w.start_duration_unix) {
    const total = w.end_duration_unix - w.start_duration_unix;
    const elapsed = Math.max(0, Math.min(total, nowSec - w.start_duration_unix));
    progressFraction = total > 0 ? elapsed / total : 0;
    remainingSec = Math.max(0, w.end_duration_unix - nowSec);
  } else if (durationSec > 0) {
    // fallback: treat `duration` as total seconds remaining (or total length depending on API).
    // We will treat it as time left; you can change if it's total length instead.
    remainingSec = Math.max(0, durationSec - 0); // here duration is left; if it's total length, you'd compute differently
    // No reliable fraction without a known original total — show an indeterminate pulse instead.
    progressFraction = null;
  }

  // friendly label using remainingSec if present, else computed from duration
  const humanRemaining = remainingSec != null ? formatDurationSeconds(remainingSec) : (durationSec > 0 ? formatDurationSeconds(durationSec) : null);

  return (
    <article
      tabIndex={0}
      role="group"
      aria-label={`${name} weather ${active ? "active" : "inactive"}`}
      className={`rounded-xl p-4 bg-[#0f2336]/60 backdrop-blur-sm shadow-md transition-transform transform hover:-translate-y-1 hover:scale-[1.01] focus-within:scale-[1.01] focus-within:ring-2 focus-within:ring-[#64ffda]/30`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#0b2a33]/40 to-[#07202a]/20 ${active ? "ring-2 ring-[#64ffda]/30 animate-pulse" : ""}`}>
            {icon ? (
              <img src={icon} alt={name} className="sm:w-12 sm:h-12 w-8 h-8 object-contain" />
            ) : (
              <div className="text-[#64ffda]">
                <WeatherFallbackSVG type={w.weather_id || w.weather_name || w.type} />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate">
              <div className="text-sm md:text-base font-semibold text-white truncate">{name}</div>
              <div className="text-xs text-[#9fb0c8] mt-0.5 truncate">{active ? "Active Weather" : "No active event"}</div>
            </div>

            <div className="text-right">
              {humanRemaining ? (
                <div className="text-lg md:text-xl font-extrabold text-white">{humanRemaining}</div>
              ) : (
                <div className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md ${active ? "bg-[#64ffda] text-[#00221f]" : "bg-[#334b61] text-[#cfe5f3]"}`}>
                  {active ? "ACTIVE" : "IDLE"}
                </div>
              )}
            </div>
          </div>

          {/* meta row */}
          <div className="mt-3 flex items-center gap-3 text-[10px] sm:text-xs text-[#bcd4ea]">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{w.icon ? (w.weather_name || w.weather_id || w.type) : (w.type || w.weather_name || "—")}</span>
            </div>

            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 12v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{humanRemaining ? `${humanRemaining} left` : (durationSec ? `${Math.ceil(durationSec / 60)}m` : "—")}</span>
            </div>

            <div className="ml-auto text-[9px] sm:text-[11px] text-[#9fb0c8]">
              {w.start_duration_unix ? new Date(w.start_duration_unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </div>
          </div>

          {/* progress bar when start/end exist */}
          {progressFraction !== null ? (
            <div className="mt-3 h-2 w-full rounded-full bg-[#06202b] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#64ffda] to-[#9effe0] transition-[width] duration-700 ease-linear"
                style={{ width: `${Math.min(100, Math.max(0, Math.round(progressFraction * 100)))}%` }}
                aria-hidden
              />
            </div>
          ) : (
            // indeterminate animated bar for duration-based but no start/end
            durationSec > 0 ? (
              <div className="mt-3  h-2 w-full rounded-full bg-[#06202b] overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-[#64ffda] to-[#9effe0] animate-[shine_1.6s_infinite]" style={{ transform: "translateX(-10%)" }} />
              </div>
            ) : null
          )}
        </div>
      </div>
    </article>
  );
}

/* Main grid component with a central clock that updates each second */
 function WeatherGrid({ currentWeathers }) {
  const items = useMemo(() => currentWeathers || [], [currentWeathers]);

  // central clock (ms). updates every 1 second so cards re-render and their progress updates.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-[1300px] mx-auto py-4 ">
      <Heading headingText="Weather" />
      {/* grid */}
      {items.length === 0 ? (
        <div className="bg-[#112240] rounded-xl mt-4 mx-2 p-6 text-center text-gray-300 shadow-sm ">
          <div className="text-sm sm:text-lg font-semibold mb-1">No active weather right now</div>
          <div className="text-xs sm:text-sm text-[#9fb0c8] mb-3">Monitoring GAG it show no active events.</div>
          
        </div>
      ) : (
        <div className="grid gap-4 px-2 mt-4 grid-cols-1 sm:grid-cols-2 ">
          {items.map((w, i) => <WeatherCard key={w.weather_id ?? w.icon ?? i} w={w} now={now} />)}
        </div>
      )}
    </div>
  );
}
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
    const name =  item.item_id ?? item.id;
    const match = db.find((d) => d.item_id === name);
    return match
      ? { ...item, image: match?.icon, rarity: match?.rarity}
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
  const { data: alldata, loading: alldataLoading } = useAllData();
  const { data: travelingMerchant, loading: travelingMerchantLoading } =
    useTravelingMerchant();
  // console.log(alldata);
  // console.log(travelingMerchant);
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
  // if (initialLoading) {
  //   return (
  //     <div className="min-h-screen  py-8">
  //       <Header
  //         wsConnected={anyRouteConnected}
  //         lastUpdated={newServerTsRef.current || null}
  //       />
  //       <main className="max-w-[1500px] mx-auto px-4">
  //         <div className="mb-6">
  //           <div className="text-center text-2xl font-bold text-emerald-800 mb-2">
  //             Live Garden Stocks
  //           </div>
  //           <p className="text-center text-sm text-gray-600">
  //             Connecting to live feeds — please wait
  //           </p>
  //         </div>

  //         <div className="space-y-4">
  //           <LoadingSkeleton rows={4} />
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }

  // Main UI
  return (
    <div className="overflow-hidden min-h-screen b w-full  pt-5">
      <Hero/>
      {/* <HeaderCompo
        wsConnected={anyRouteConnected}
        lastUpdated={new Date().toLocaleTimeString()}
      /> */}

      <main className="max-w-[1300px] mx-auto px-1 mt-8 sm:px-4 space-y-1 pb-9">
        <WeatherGrid currentWeathers={currentWeathers} />
        <div className="mt-12 max-w-[1300px]">
          <Heading headingText={"Live Stock"} />
           <div id="stock" className="grid gap-y-10 gap-x-2 sm:gap-4 grid-cols-2 sm:items-start mx-auto  md:grid-cols-3 lg:grid-cols-4 mt-6 px-2">
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
        </div>
        
        {/* Traveling merchant card (shows merchantName + stock + per-item countdown) */}
       <div className="mt-12">
         {travelingMerchant && (
          <TravelingMerchantCard
            merchant={travelingMerchant}
            serverNow={alldata?.timestamp}
          />
        )}
       </div>
      </main>
    </div>
  );
};

export default Home;
