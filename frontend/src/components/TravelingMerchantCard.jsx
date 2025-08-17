// TravelingMerchantCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import RestockTimer from "./RestockTimer.jsx";
import Heading from "./Heading.jsx";

/* helpers (time parsing / formatting) */
const toMs = (v) => {
  if (!v && v !== 0) return null;
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n;
    const p = Date.parse(v);
    if (!Number.isNaN(p)) return p;
  }
  return null;
};

const fmtTime = (tsMs) =>
  tsMs
    ? new Date(tsMs).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const relative = (targetMs, nowMs = Date.now()) => {
  if (!targetMs) return "";
  const diff = Math.floor((targetMs - nowMs) / 1000);
  if (diff > 0) {
    if (diff >= 3600) return `in ${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    if (diff >= 60) return `in ${Math.floor(diff / 60)}m`;
    return `in ${diff}s`;
  }
  const a = Math.abs(diff);
  if (a >= 3600) return `${Math.floor(a / 3600)}h ago`;
  if (a >= 60) return `${Math.floor(a / 60)}m ago`;
  return `${a}s ago`;
};

const ACTIVE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const INTERVAL_MS = 3.5 * 60 * 60 * 1000; // 3 hours 30 minutes (next spawn interval)

/**
 * TravelingMerchantCard
 * - merchant: object with merchantName, start_ms / start_date_unix or per-item timestamps, stock array
 * - serverNow: optional server-provided timestamp (ms or secs or parseable string)
 */
export default function TravelingMerchantCard({ merchant, serverNow = null }) {
  if (!merchant) return null;

  // central clock so relative labels update live
  const [nowMs, setNowMs] = useState(() => toMs(serverNow) || Date.now());
  useEffect(() => {
    // sync to serverNow if it changes
    if (serverNow) setNowMs(toMs(serverNow) || Date.now());
  }, [serverNow]);

  useEffect(() => {
    const id = setInterval(() => setNowMs(toMs(serverNow) || Date.now()), 1000);
    return () => clearInterval(id);
    // we intentionally allow serverNow to be read each tick in case server time drifts
  }, [serverNow]);

  const items = Array.isArray(merchant.stock) ? merchant.stock : [];

  // authoritative start (merchant-level preferred, fallback to first item)
  const startMs = useMemo(() => {
    return (
      toMs(merchant.start_ms) ||
      (merchant.start_date_unix ? Number(merchant.start_date_unix) * 1000 : null) ||
      toMs(merchant.Date_Start) ||
      toMs(items[0]?.start_ms) ||
      (items[0]?.start_date_unix ? Number(items[0].start_date_unix) * 1000 : null) ||
      toMs(items[0]?.Date_Start) ||
      null
    );
  }, [merchant, items]);

  const endMs = startMs ? startMs + ACTIVE_DURATION_MS : null;

  let state = "unknown"; // upcoming | active | left
  if (startMs && endMs) {
    if (nowMs < startMs) state = "upcoming";
    else if (nowMs >= startMs && nowMs < endMs) state = "active";
    else state = "left";
  }

  // next arrival = end + INTERVAL_MS (when left) OR start (if start upcoming)
  const nextArrivalMs =
    state === "upcoming" && startMs ? startMs : endMs ? endMs + INTERVAL_MS : null;

  const [open, setOpen] = useState(false);

  // visual classes using your palette
  const statusPillClass =
    state === "active"
      ? "bg-[#30957d] text-[white]  "
      : state === "upcoming"
      ? "bg-[#fff7e6] text-[#6b4b05] ring-1 ring-[#f1d9a8]"
      : "bg-[#eef2f6] text-[#374151] ring-1 ring-[#dbe7f3]";

  return (
    <div className="max-w-[1700px] mx-auto p-1 sm:p-3 ">
      <Heading headingText={"Travelling Merchant"} />
      <div className="rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:-translate-y-0.5 bg-[#112240] mt-6 border-3 border-[#112240]">
        {/* header */}
        <button
          className="w-full sm:px-4 sm:py-4 p-2 text-left cursor-pointer select-none"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls={`merchant-${merchant.merchantId ?? merchant.id ?? "card"}`}
        >
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-4">
              <div
                className="sm:w-14 sm:h-14 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(48,149,125,0.08), rgba(6,95,70,0.04))",
                }}
              >
                {/* merchant icon */}
                <svg className="sm:w-8 sm:h-8 w-5 h-5 text-[#64ffda]" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2l3 6 6 .5-4.5 4 1.5 6L12 16l-6 3 1.5-6L3 8.5 9 8 12 2z" fill="currentColor" />
                </svg>
              </div>

              <div>
                <div className="text-sm sm:text-md md:text-lg font-extrabold text-[#cfeee4]">
                  {merchant.merchantName || "Traveling Merchant"}
                </div>

                <div className="text-[10px] sm:text-xs text-[#9fb0c8] mt-0.5">
                  {startMs && endMs ? (
                    <>
                      <span className="font-semibold text-[#cfeee4]">{fmtTime(startMs)}</span>{" "}
                      <span className="text-[#7ea3b2]">→</span>{" "}
                      <span className="font-semibold text-[#cfeee4]">{fmtTime(endMs)}</span>
                    </>
                  ) : (
                    <span>Schedule unavailable</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end sm:justify-center gap-3">
              {/* next arrival quick highlight when left */}
              {/* {state === "left" && nextArrivalMs ? (
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <div className="text-xs text-[#9fb0c8]">Next</div>
                  <div className="text-sm font-bold text-[#ffb4b4]">{fmtTime(nextArrivalMs)}</div>
                </div>
              ) : null} */}

              <div className={`sm:px-3 px-2 py-1 rounded-full text-[10px] whitespace-nowrap sm:text-sm font-semibold ${statusPillClass}`}>
                {state === "active" ? "Active now" : state === "upcoming" ? `Starts ${relative(startMs, nowMs)}` : "Left"}
              </div>

             
            </div>
          </div>
        </button>

        {/* content */}
        <div
          id={`merchant-${merchant.merchantId ?? merchant.id ?? "card"}`}
          className={`transition-max-h duration-300 ease-in-out overflow-hidden max-h-[2000px]`}
        >
          <div className="bg-[#0a192f] px-3 sm:px-5 pb-5 pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] sm:text-sm font-semibold text-[#cfeee4]">
                {state === "active" ? "Merchant is available — grab items!" : state === "upcoming" ? "Arriving soon" : "Last merchant (waiting for next)"}
              </div>
              <div className="text-xs text-[#9fb0c8]">
                {state === "active" && endMs ? <>Ends {relative(endMs, nowMs)}</> : state === "upcoming" && startMs ? <>Starts {relative(startMs, nowMs)}</> : null}
              </div>
            </div>

            {/* items grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it, idx) => {
                const id = it.item_id ?? it.id ?? `${it.display_name ?? "item"}-${idx}`;
                const image = it.icon ?? it.image ?? "";
                const name = it.display_name ?? it.displayName ?? it.name ?? id;
                const qty = it.quantity ?? it.qty ?? 1;
                const itemBadgeClass = state === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700";

                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-2 sm:p-3 bg-[#112240] rounded-lg border border-white/6"
                  >
                    <div className="sm:w-14 sm:h-14 w-10 h-10  rounded-md bg-white/6 flex items-center justify-center overflow-hidden shadow-sm">
                      {image ? (
                        <img src={image} alt={name} className="sm:w-11 sm:h-11 w-8 h-8 object-contain" />
                      ) : (
                        <div className="text-xs text-[#9fb0c8]">No image</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] sm:text-sm font-bold text-[#cfeee4] leading-5 truncate">{name}</div>
                      <div className="text-[9px] sm:text-xs text-[#9fb0c8] mt-1">Qty: {qty}</div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${itemBadgeClass}`}>
                        {state === "active" ? "Available" : "Ended"}
                      </div>

                      {state === "active" && endMs ? (
                        <div className="text-xs text-[#9fb0c8]">
                          <RestockTimer timestamp={endMs} serverNow={nowMs} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* footer */}
            <div className="mt-4 flex sm:flex-row flex-col items-center justify-between gap-3">
              <div className="text-[8px] text-center sm:text-xs text-[#9fb0c8]">Merchant has a chance to  spawns every 4 hours • Stays for 30 minutes</div>

              {state === "left" && nextArrivalMs ? (
                <div className="text-right flex items-center gap-3">
                  <div className="text-[9px] sm:text-xs text-[#9fb0c8]">Next arrival</div>
                  <div className="text-sm sm:text-lg font-extrabold text-[#64ffda]">{fmtTime(nextArrivalMs)}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
