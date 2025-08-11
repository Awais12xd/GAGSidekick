import React from "react";
import RestockTimer from "./RestockTimer.jsx";
import "../App.css"
import RarityBadge from "./RarityBadge.jsx";

/**
 * StockCard.jsx
 * - title: string
 * - items: array of { name, quantity, image, value, seen, rarity }
 * - name: 'seeds' | 'gears' | 'eggs' | 'cosmetics'
 * - restockTimers: object containing timestamps e.g. { seeds: { timestamp }, egg: { timestamp }, ... }
 *
 * Note: Put a fallback image at public/assets/question.jpeg
 */

// StockCard: rarityColor helper (Tailwind classes)
const rarityColor = (tier) => {
  // Normalize input: accept strings ("Rare") or numbers (3)
  const t = (tier ?? "").toString().toLowerCase().trim();

  // map numeric tiers to names (if your DB uses numbers)
  const numMap = {
    1: "common",
    2: "uncommon",
    3: "rare",
    4: "legendary",
    5: "mythical",
    6: "divine",
    7: "prismatic",
  };
  const name = numMap[t] ?? t; // if t is number, map it; otherwise keep string

  switch (name) {
    case "common":
      return "bg-gray-100 text-white border-gray-200";
    case "uncommon":
      return "bg-green-200 text-white border-green-300";
    case "rare":
      return "bg-sky-300 text-white border-sky-400";
    case "legendary":
      return "bg-yellow-300 text-white border-amber-500";
    case "mythical":
      return "bg-violet-400 text-white border-violet-500";
    case "divine":
      return "bg-orange-400 text-white border-teal-500 ";
    case "prismatic":
      // gradient + white text + subtle ring/glow for strong highlight
      return "bg-gradient-to-r from-pink-500 via-yellow-400 to-indigo-500 text-white border-transparent shadow-md ring-1 ring-white/20";
    default:
      return "bg-gray-200 text-white border-gray-300";
  }
};

const getTimerByName = (name, restockTimers) => {
  if (!restockTimers) return null;
  if (name === "eggs") return restockTimers?.egg?.timestamp ?? null;
  if (name === "seeds") return restockTimers?.seeds?.timestamp ?? null;
  if (name === "gears") return restockTimers?.gear?.timestamp ?? null;
  if (name === "cosmetics") return restockTimers?.cosmetic?.timestamp ?? null;
  return null;
};

const StockCard = ({ title, items = [], name, restockTimers }) => {
  if (!items || items.length === 0) return null;

  const timer = getTimerByName(name, restockTimers);

  return (
    <section
      aria-label={title}
      className="rounded-2xl shadow-xl border border-green-100 overflow-hidden bg-white/90 backdrop-blur-sm max-w-md w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white">
        <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>

        <div className="text-right">
          <div className="text-xs opacity-90">New Stock in</div>
          {timer ? (
            <div className="mt-1">
              {
                name === "cosmetics" ? (
                  <RestockTimer timestamp={timer} name="cosmetics"/>
                ) : (
                  <RestockTimer timestamp={timer} />
                )
              }
            </div>
          ) : (
            <div className="mt-1 text-sm font-medium">—</div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid gap-3">
          {items.map((item, idx) => {
            const imageSrc = item.image || "/src/assets/question.jpeg"; // place fallback in public/assets
            const rarity = item.rarity ?? item.tier ?? item.metadata?.tier;
            return (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-green-50 bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="w-16 h-16 flex-shrink-0 rounded-md bg-emerald-50 border border-green-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/src/assets/question.jpeg";
                    }}
                  />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="pr-2">
                      {/* Name - big and bold for instant recognition */}
                      <p className="text-lg font-extrabold text-emerald-900 truncate">
                        {item.display_name}
                      </p>

                      {/* Sub info (value, last seen) */}
                      <div className="mt-1 text-sm text-gray-600">
                        {item.value !== undefined && (
                          <span className="mr-3">
                            Value:{" "}
                            <span className="font-semibold text-gray-800">
                              {item.value}
                            </span>
                          </span>
                        )}
                        {item.seen && (
                          <span>
                            Last seen:{" "}
                            <span className="font-semibold text-gray-800">
                              {new Date(item.seen).toLocaleTimeString()}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right column: rarity badge and big quantity */}
                    <div className="flex flex-col items-end gap-2">
                     <RarityBadge label={rarity || "COMMON"} className="prismatic-badge" strokeWidth={4} fontSize={15} />


                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-lg shadow">
                        x{item.quantity ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StockCard;
