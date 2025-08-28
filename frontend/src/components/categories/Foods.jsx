import React, { useState, useEffect } from "react";
import Heading from "../Heading";

/**
 * RecipesViewer.js
 * Plain React + Tailwind component for viewing cooking recipes.
 * Replaced food images with emoji icons (large preview + list-friendly fallback).
 *
 * - Left: list of foods (vertical desktop / horizontal mobile)
 * - Right: selected food with recipe tiers (Transcendent, Prismatic, Divine, Mythical, Legendary, Rare, Uncommon, Common)
 * - Palette uses your colors (bg #0a192f, primary #64ffda, etc.)
 *
 * Replace / extend `recipesData` with your full dataset.
 */

/* ---------- Data (you can replace placeholders later) ---------- */
const recipesData = [
  {
    id: "corn-dog",
    name: "Corn Dog",
    notes: ["Source: user table"],
    tiers: {
      transcendent: [],
      prismatic: ["1 Giant Pinecone + 1 Pepper + 1 Corn + 2 Beanstalk"],
      divine: ["1 Giant Pinecone + 2 Pepper + 2 Corn + 2 Beanstalk"],
      mythical: [
        "1 Giant Pinecone + 1 Pepper + 1 Corn",
        "1 Giant Pinecone + 1 Pepper + 1 Corn",
      ],
      legendary: [],
      rare: [],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "spaghetti",
    name: "Spaghetti",
    notes: [
      "Swap variants only apply when Spaghetti is the craving (see notes)",
    ],
    tiers: {
      transcendent: [],
      prismatic: ["1 Tomato + 1 Cauliflower + 3 Bone Blossom"],
      divine: ["1 Tomato + 1 Corn + 1 Bone Blossom + 2 Beanstalk"],
      mythical: [
        "1 Tomato + 1 Cauliflower + 1 Jalapeno + 1 Bone Blossom",
        "1 Tomato + 1 Cauliflower + 1 Taco Fern + 1 Beanstalk",
      ],
      legendary: ["1 Corn + 1 Bell Pepper + 1 Cauliflower + 1 Tomato"],
      rare: [],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "candy-apple",
    name: "Candy Apple",
    notes: ["Swap variants only when CandyApple is the craving"],
    tiers: {
      transcendent: [
        "1 Beanstalk + 1 Ember Lily + 1 Sugar Apple + 1 Giant Pinecone + 1 Bone Blossom",
      ],
      prismatic: [
        "1 Sugar Apple + 1 Giant Pinecone",
        "2 Sugarglaze + 2 Sugar Apple",
      ],
      divine: [],
      mythical: [],
      legendary: ["1 Sugar Apple + 1 Blueberry"],
      rare: [],
      uncommon: [],
      common: [],
    },
  },
  // ... (other food objects kept from previous data) ...
  // For brevity I include the same items used earlier. In your project include all entries.
  {
    id: "porridge",
    name: "Porridge",
    notes: ["Swap variants only when Porridge is the craving"],
    tiers: {
      transcendent: ["1 Banana + 1 Sugar Apple + 3 Bone Blossom"],
      prismatic: ["1 Corn + 4 Sugar Apple"],
      divine: [],
      mythical: ["2 Sugarglaze + 1 Blood Banana"],
      legendary: ["2 Banana + 1 Apple"],
      rare: ["1 Cauliflower + 1 Corn + 1 Lingonberry"],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "sweet-tea",
    name: "Sweet Tea",
    notes: ["Swap variants only when Sweet Tea is the craving"],
    tiers: {
      transcendent: [
        "3 Sugar Apple + 1 Burning Bud",
        "1 Ember Lily + 1 Burning Bud + 2 Sugar Apple",
      ],
      prismatic: ["1 Burning Bud + 1 Sugar Apple"],
      divine: ["1 Ember Lily + 1 Mango", "1 Rosy Delight + 1 Sugar Apple"],
      mythical: ["1 Serenity + 1 Sugar Apple"],
      legendary: [
        "1 Mint + 1 Pineapple",
        "1 Soft Sunshine + 1 Mango",
        "1 Serenity + 1 Mango",
      ],
      rare: ["2 Blueberry + 2 Serenity"],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "smoothie",
    name: "Smoothie",
    notes: [],
    tiers: {
      transcendent: [
        "3 Bone Blossom + 1 Pricklefruit",
        "4 Bone Blossom + 1 Sugar Apple",
      ],
      prismatic: ["2 Sugar Apple"],
      divine: [
        "1 Coconut + 1 Elder Strawberry",
        "2 Grape",
        "1 Sugar Apple + 1 Mango",
      ],
      mythical: [
        "3 Apple + 1 Peach",
        "2 Elder Strawberry + 1 Blueberry + 1 Strawberry + 1 Apple",
      ],
      legendary: ["1 Mango + 1 Peach + 1 Strawberry + 1 Apple"],
      rare: [],
      uncommon: ["1 Carrot + 1 Apple"],
      common: [],
    },
  },
  {
    id: "salad",
    name: "Salad",
    notes: [],
    tiers: {
      transcendent: ["4 Bone Blossom + 1 Tomato"],
      prismatic: ["3 Bone Blossom + 1 Giant Pinecone + 1 Tomato"],
      divine: ["4 Bone Blossom + 1 Tomato"],
      mythical: ["2 Sugar Apple + 1 Tomato"],
      legendary: ["1 Ember Lily + 1 Dragon Fruit + 1 Bamboo + 1 Tomato"],
      rare: [
        "1 Corn + 1 Tomato",
        "2 Tomato + 1 Dragon Fruit",
        "1 Peach + 1 Tomato + 1 Jalapeno",
        "1 Cauliflower + 1 Bamboo",
      ],
      uncommon: ["1 Orange Tulip + 1 Bamboo + 1 Carrot + 1 Tomato"],
      common: ["3 Carrot + 1 Bamboo"],
    },
  },
  {
    id: "soup",
    name: "Soup",
    notes: [
      "Flexible: any combination of plants that don't make something else",
    ],
    tiers: {
      transcendent: [],
      prismatic: [],
      divine: [],
      mythical: [],
      legendary: [],
      rare: [
        "1 Coconut + 1 Elder Strawberry",
        "1 Grape + 1 Sugar Apple + 1 Dragon Fruit",
      ],
      uncommon: [
        "2 Coconuts",
        "1 Coconut + 1 Dragon Fruit",
        "1 Green Apple + 1 Grape",
        "1 Apple",
      ],
      common: ["1 Carrot", "1 Strawberry", "1 Peach", "1 Mango"],
    },
  },
  {
    id: "sandwich",
    name: "Sandwich",
    notes: ["Swap variants only when Sandwich is the craving"],
    tiers: {
      transcendent: [],
      prismatic: ["1 Corn + 1 Tomato + 3 Bone Blossom"],
      divine: ["2 Sugar Apple + 1 Corn + 1 Tomato"],
      mythical: ["1 Corn + 1 Tomato + 3 Bell Pepper"],
      legendary: ["1 Corn + 1 Tomato + 3 Avocado"],
      rare: ["1 Corn + 2 Tomato", "1 Tomato + 1 Corn + 1 Prickly Pear"],
      uncommon: [
        "1 Tomato + 1 Carrot + 1 Corn",
        "1 Tomato + 1 Corn + 1 Artichoke",
      ],
      common: [],
    },
  },
  {
    id: "pie",
    name: "Pie",
    notes: [],
    tiers: {
      transcendent: ["4 Bone Blossom + 1 Pumpkin"],
      prismatic: ["4 Bone Blossom + 1 Pumpkin"],
      divine: ["1 Ember Lily or 1 Beanstalk + 1 Coconut"],
      mythical: [
        "1 Pumpkin + 1 Sugar Apple",
        "1 Cactus + 1 Cacao + 1 Pumpkin + 1 Peach",
        "1 Pumpkin + 1 Ember Lily + 1 Green Apple",
      ],
      legendary: [
        "1 Pumpkin + 1 Apple",
        "1 Coconut + 1 Tomato",
        "1 Pumpkin + 1 Dragon Fruit",
      ],
      rare: ["1 Crown Melon + 1 Jalapeno"],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "burger",
    name: "Burger",
    notes: ["Many variants; some 'swap' recipes only when craving"],
    tiers: {
      transcendent: ["1 Sugarglaze + 1 Sunflower + 3 Bone Blossom"],
      prismatic: ["1 Tomato + 1 Cauliflower + 3 Bone Blossom"],
      divine: ["1 Corn + 1 Tomato + 3 Bone Blossom"],
      mythical: [
        "1 Pepper + 1 Corn + 1 Tomato + 1 Bone Blossom",
        "1 Corn + 3 Bell Pepper",
      ],
      legendary: [
        "1 Corn + 1 Tomato + 1 Ember Lily",
        "1 Corn + 1 Tomato + 1 Beanstalk + 1 Cactus",
      ],
      rare: [
        "1 Pepper + 1 Corn + 1 Tomato + 1 Mint",
        "1 Ember Lily + 1 Carrot + 1 Tomato + 1 Corn",
      ],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "hot-dog",
    name: "Hot Dog",
    notes: ["Swap recipes may apply when craving"],
    tiers: {
      transcendent: ["4 Bone Blossom + 1 Corn"],
      prismatic: ["4 Bone Blossom + 1 Corn"],
      divine: [
        "1 Corn + 1 Lucky Bamboo + 3 Bone Blossom",
        "1 Corn + 1 Ember Lily + 2 Elder Strawberry",
      ],
      mythical: ["2 Pepper + 1 Corn"],
      legendary: ["1 Pepper + 1 Corn", "1 Ember Lily + 1 Corn + 1 Bamboo"],
      rare: [],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "waffle",
    name: "Waffle",
    notes: ["Swap variants available when Waffle is the craving"],
    tiers: {
      transcendent: ["1 Sugar Apple + 1 Coconut + 3 Bone Blossom"],
      prismatic: ["1 Sugarglaze + 2 Bone Blossom", "2 Coconut + 3 Sugar Apple"],
      divine: ["1 Coconut + 1 Sugar Apple"],
      mythical: ["1 Coconut + 1 Peach"],
      legendary: ["1 Peach + 1 Coconut + 1 Apple"],
      rare: ["1 Coconut + 1 Strawberry"],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "ice-cream",
    name: "Ice Cream",
    notes: ["Swap recipes may apply when Ice Cream is the craving"],
    tiers: {
      transcendent: [
        "1 Banana + 3 Bone Blossom",
        "1 Sugarglaze + 4 Bone Blossom",
      ],
      prismatic: [
        "1 Corn + 3 Sugar Apple",
        "1 Sugarglaze + 1 Tomato + 3 Bone Blossom",
      ],
      divine: ["1 Sugar Apple + 1 Sugarglaze"],
      mythical: ["1 Banana + 1 Pepper or 1 Loquat", "1 Corn + 1 Sugar Apple"],
      legendary: [
        "1 Banana + 1 Watermelon / or 1 Apple / or 1 Crown Melon / or 1 Prickly Pear",
        "1 Mango + 1 Corn",
      ],
      rare: ["1 Watermelon + 1 Corn", "1 Blueberry + 1 Banana"],
      uncommon: [
        "1 Corn + 1 Blueberry + 1 Strawberry",
        "1 Strawberry + 1 Corn + 1 Tomato + 1 Jalapeno",
      ],
      common: [],
    },
  },
  {
    id: "donut",
    name: "Donut",
    notes: ["Swap variants only when Donut is the craving"],
    tiers: {
      transcendent: ["4 Bone Blossom + 1 Sugarglaze"],
      prismatic: ["3 Sugar Apple + 1 Corn"],
      divine: ["1 Sugarglaze + 2 Sugar Apple"],
      mythical: ["1 Sugar Glaze + 1 Corn + 1 Peach"],
      legendary: [
        "1 Sugar Apple + 1 Serenity + 1 Corn",
        "1 Corn + 1 Mango + 1 Banana",
      ],
      rare: ["1 Corn + 1 Pineapple + 1 Blueberry"],
      uncommon: ["1 Tomato + 1 Strawberry + 1 Corn"],
      common: [],
    },
  },
  {
    id: "sushi",
    name: "Sushi",
    notes: ["Swap variants / prismatic sushi exists"],
    tiers: {
      transcendent: [],
      prismatic: ["2 Bone Blossom + 1 Elder Strawberry + 1 Corn + 1 Bamboo"],
      divine: ["3 Bone Blossom + 1 Bamboo + 1 Corn"],
      mythical: ["3 Ember Lily + 1 Bamboo + 1 Corn"],
      legendary: ["1 Bamboo + 1 Corn + 1 Cactus"],
      rare: [
        "4 Bamboo + 1 Corn",
        "1 Corn + 1 Apple (or Cauliflower) + 1 Bamboo",
      ],
      uncommon: [],
      common: [],
    },
  },
  {
    id: "cake",
    name: "Cake",
    notes: [],
    tiers: {
      transcendent: ["3 Bone Blossom + 1 Beanstalk + 1 Banana"],
      prismatic: [
        "3 Bone Blossom + 1 Sugar Apple + 1 Banana",
        "1 Corn + 4 Sugar Apple",
      ],
      divine: [
        "1 Bone Blossom + 1 Coconut + 3 Banana",
        "2 Sugar Apple + 1 Celestiberry + 1 Pineapple + 1 Banana",
      ],
      mythical: ["1 Bone Blossom + 1 Coconut + 3 Banana"],
      legendary: ["1 Corn + 1 Tomato + 1 Banana + 1 Sugar Apple"],
      rare: [
        "2 Watermelon + 2 Corn",
        "1 Corn + 1 Watermelon + 1 Tomato + 1 Apple",
      ],
      uncommon: [
        "1 Strawberry + 1 Tomato + 1 Corn + 1 Apple",
        "1 Strawberry + 1 Carrot + 1 Corn + 1 Apple",
      ],
      common: [],
    },
  },
  {
    id: "pizza",
    name: "Pizza",
    notes: [],
    tiers: {
      transcendent: [],
      prismatic: ["3 Bone Blossom + 1 Banana + 1 Beanstalk"],
      divine: [],
      mythical: [],
      legendary: [
        "1 Corn + 1 Tomato + 1 Pepper + 1 Sugar Apple",
        "1 Jalapeno + 1 Corn + 1 Dragon Fruit + 1 Ember Lily",
      ],
      rare: ["1 Strawberry + 1 Pepper + 1 Tomato + 1 Corn"],
      uncommon: [],
      common: [],
    },
  },
];

/* ---------- Emoji map (use emoji instead of images) ---------- */
const emojiMap = {
  "corn-dog": "🌭",
  spaghetti: "🍝",
  "candy-apple": "🍎", // or 🍭
  porridge: "🥣",
  "sweet-tea": "🧋",
  smoothie: "🥤",
  salad: "🥗",
  soup: "🍲",
  sandwich: "🥪",
  pie: "🥧",
  burger: "🍔",
  "hot-dog": "🌭",
  waffle: "🧇",
  "ice-cream": "🍨",
  donut: "🍩",
  sushi: "🍣",
  cake: "🍰",
  pizza: "🍕",
  corn: "🌽",
  // fallback for any others
  default: "🍽️",
};

/* ---------- Palette (CSS variables) ---------- */
const paletteStyle = {
  "--bg": "#0a192f",
  "--primary": "#64ffda",
  "--slate": "#8892b0",
  "--lightest-slate": "#ccd6f6",
  "--card-bg": "#071428",
  "--card-border": "#102a3a",
};

/* ---------- UI helpers ---------- */
function Badge({ children, small }) {
  return (
    <span
      className={`inline-block rounded-full font-semibold ${
        small ? "text-[10px] px-2 py-[2px]" : "text-[11px] px-2 py-0.5"
      }`}
      style={{ background: "rgba(100,255,218,0.08)", color: "var(--primary)" }}
    >
      {children}
    </span>
  );
}

function RecipeVariant({ text }) {
  return (
    <li className="text-sm text-[var(--lightest-slate)] leading-snug">
      <span className="inline-block mr-2 text-xs text-[var(--slate)]">•</span>
      <span>{text}</span>
    </li>
  );
}

const TIER_ORDER = [
  "transcendent",
  "prismatic",
  "divine",
  "mythical",
  "legendary",
  "rare",
  "uncommon",
  "common",
];

const TIER_LABEL = {
  transcendent: "Transcendent",
  prismatic: "Prismatic",
  divine: "Divine",
  mythical: "Mythical",
  legendary: "Legendary",
  rare: "Rare",
  uncommon: "Uncommon",
  common: "Common",
};

export default function RecipesViewer() {
  const [items] = useState(recipesData);
  const [selectedId, setSelectedId] = useState(items[0]?.id || null);
  const [isLoading, setIsLoading] = useState(false);

  const current = items.find((i) => i.id === selectedId);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 120);
    return () => clearTimeout(t);
  }, [selectedId]);

  function emojiFor(id) {
    return emojiMap[id] || emojiMap.default;
  }

  return (
    <section
      id="recipes"
      className="min-h-screen py-12 "
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--lightest-slate)",
        ...paletteStyle,
      }}
    >
      <div className="">
        <div className="mb-4">
          <Heading headingText={"Cooking Recipes"} />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left list */}
          <div className="md:w-56 w-full">
            <div
              className="hidden md:block rounded-md border shadow-sm overflow-auto custom-scrollbar max-h-[520px]"
              style={{
                borderColor: "var(--card-border)",
                background: "transparent",
              }}
            >
              {items.map((it) => {
                const active = it.id === selectedId;
                const count =
                  Object.values(it.tiers || {}).reduce(
                    (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
                    0
                  ) || 0;
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className="w-full text-left px-4 py-3 border-b last:border-b-0 flex items-center justify-between"
                    style={{
                      backgroundColor: active
                        ? "rgba(100,255,218,0.06)"
                        : "transparent",
                      color: active
                        ? "var(--primary)"
                        : "var(--lightest-slate)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg" aria-hidden>
                        {emojiFor(it.id)}
                      </span>
                      <span className="truncate">{it.name}</span>
                    </div>

                    <span className="text-xs" style={{ color: "var(--slate)" }}>
                      {count > 0 ? <Badge small>{count}</Badge> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* mobile */}
            <div className="md:hidden overflow-x-auto custom-scrollbar pb-3">
              <div className="flex gap-3">
                {items.map((it) => {
                  const active = it.id === selectedId;
                  return (
                    <button
                      key={it.id}
                      onClick={() => setSelectedId(it.id)}
                      className="flex-shrink-0 sm:px-4 sm:py-2 p-1 text-xs rounded-md border  flex items-center gap-2"
                      style={{
                        backgroundColor: active
                          ? "var(--primary)"
                          : "transparent",
                        color: active ? "#001219" : "var(--lightest-slate)",
                        borderColor: active
                          ? "transparent"
                          : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <span className="text-lg">{emojiFor(it.id)}</span>
                      <span>{it.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div
            className="flex-1 rounded-md border p-4 min-h-[320px] overflow-y-auto custom-scrollbar"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            {isLoading ? (
              <div className="w-full h-48 flex items-center justify-center">
                <svg
                  className="animate-spin h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "var(--primary)" }}
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              </div>
            ) : current ? (
              <>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div
                    className="w-full md:w-52 aspect-[4/3] rounded-md overflow-hidden flex items-center justify-center border"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {/* emoji preview (large) */}
                    <div
                      role="img"
                      aria-label={current.name + " emoji"}
                      className="text-7xl md:text-8xl leading-none select-none"
                      title={current.name}
                    >
                      {emojiFor(current.id)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3
                        className="text-xl font-semibold"
                        style={{ color: "var(--lightest-slate)" }}
                      >
                        {current.name}
                      </h3>
                      <div className="text-xs text-[var(--slate)]">
                        {current.notes?.join(" • ")}
                      </div>
                    </div>

                    <p
                      className="mt-2 text-sm"
                      style={{ color: "var(--slate)" }}
                    >
                      Total variants:{" "}
                      <strong>
                        {Object.values(current.tiers).reduce(
                          (acc, arr) =>
                            acc + (Array.isArray(arr) ? arr.length : 0),
                          0
                        )}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TIER_ORDER.map((tierKey) => {
                    const arr = current.tiers[tierKey] || [];
                    return (
                      <section
                        key={tierKey}
                        className="rounded-md p-3"
                        style={{
                          background:
                            tierKey === "divine"
                              ? "linear-gradient(180deg, rgba(100,255,218,0.02), transparent)"
                              : "linear-gradient(180deg, rgba(255,255,255,0.01), transparent)",
                          border:
                            tierKey === "divine"
                              ? "1px solid rgba(100,255,218,0.08)"
                              : "1px solid var(--card-border)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className="text-sm font-semibold"
                            style={{
                              color:
                                tierKey === "prismatic"
                                  ? "#9fb7ff"
                                  : tierKey === "divine"
                                  ? "var(--primary)"
                                  : "var(--lightest-slate)",
                            }}
                          >
                            {TIER_LABEL[tierKey]}
                          </h4>
                          <span className="text-xs text-[var(--slate)]">
                            {arr.length} variant(s)
                          </span>
                        </div>

                        {arr && arr.length > 0 ? (
                          <ul className="flex flex-col gap-2">
                            {arr.map((r, i) => (
                              <RecipeVariant key={i} text={r} />
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-[var(--slate)]">—</div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-sm text-[var(--slate)]">
                No food selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
