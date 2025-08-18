// StockCard.jsx
import React from "react";
import RestockTimer from "./RestockTimer.jsx";
import "../App.css";
// import the palette you created (adjust path if you placed it elsewhere)
import "../color.css";
import RarityBadge from "./RarityBadge.jsx";

/**
 * StockCard.jsx
 * - title: string
 * - items: array of { name, quantity, image, value, seen, rarity }
 * - name: 'seeds' | 'gears' | 'eggs' | 'cosmetics'
 * - restockTimers: object containing timestamps e.g. { seeds: { timestamp }, egg: { timestamp }, ... }
 *
 * Note: Place fallback image at public/assets/question.jpeg or use the external fallback URL.
 */

const rarityColor = (tier) => {
  const t = (tier ?? "").toString().toLowerCase().trim();
  const numMap = {
    1: "common",
    2: "uncommon",
    3: "rare",
    4: "legendary",
    5: "mythical",
    6: "divine",
    7: "prismatic",
  };
  const name = numMap[t] ?? t;

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
      className="rounded-lg shadow-xl border-1 overflow-hidden bg-[#112240] backdrop-blur-sm max-w-md w-full  "
      /* border-1 + a border color are provided by garden-palette.css */
      
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-1 sm:px-4 sm:py-2 text-text bg-[#30957d]"
       
      >
        <h3 className="text-[10px] sm:text-lg font-extrabold tracking-tight">{title}</h3>

        <div className="flex flex-col items-center">
          <div className="text-[8px] sm:text-xs opacity-90">New Stock in</div>
          {timer ? (
            <div className="">
              {name === "cosmetics" ? (
                <RestockTimer timestamp={timer} name="cosmetics" />
              ) : (
                <RestockTimer timestamp={timer} />
              )}
            </div>
          ) : (
            <div className=" text-sm font-medium">—</div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="sm:px-1 sm:py-4  py-2 bg-[#112240]">
        <div className="grid sm:gap-3 gap-1">
          {items.map((item, idx) => {
            const imageSrc =
              item.image || "https://i.postimg.cc/gJB01rn9/question.jpg";
            const rarity = item.rarity ?? item.tier ?? item.metadata?.tier;
            return (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center gap-1 sm:gap-3 p-1 sm:p-3 rounded-lg surface-elev shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
                /* surface-elev provides a deep semi-transparent surface + subtle border/shadow */
              >
                {/* Image */}
                <div
                  className="sm:w-12 sm:h-12 w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(15,59,46,0.12) 0%, rgba(15,59,46,0.06) 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <img src={imageSrc} alt={item.name} className="w-full h-full object-contain" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <div className="pr-2 fex flex-col items-center">
                      {/* Name - big and bold for instant recognition */}
                      <p className="text-[9px] sm:text-sm md:text-md font-extrabold text-text mb-1">
                        {item.display_name}
                      </p>
                     
                      <div className="sm:block hidden">
                        <RarityBadge
                          label={rarity || "COMMON"}
                          className="prismatic-badge"
                          strokeWidth={4}
                          fontSize={8}
                          res="sm"
                        />
                      </div>

                      {/* Sub info (value, last seen) */}
                      {/* <div className="mt-1 text-sm text-muted">
                        {item.value !== undefined && (
                          <span className="mr-3">
                            Value:{" "}
                            <span className="font-semibold text-text">{item.value}</span>
                          </span>
                        )}
                        {item.seen && (
                          <span>
                            Last seen:{" "}
                            <span className="font-semibold text-text">
                              {new Date(item.seen).toLocaleTimeString()}
                            </span>
                          </span>
                        )}
                      </div> */}
                    </div>

                    {/* Right column: rarity badge and big quantity */}
                    <div className="flex flex-col items-end gap-2">
                      

                      {/* quantity badge uses leaf accent (bright green) with light text */}
                      <div className="inline-flex items-center justify-center sm:px-2 sm:py-1 px-1 py-[2px] rounded-full bg-gray-200 text-[#0a192f]  font-extrabold text-[8px] sm:text-xs shadow-accent-lg">
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
