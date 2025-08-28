import React, { useEffect, useMemo, useState } from "react";

/**
 * UpdateHero.js
 *
 * - Plain React + Tailwind
 * - Palette (same as earlier): bg #0a192f, primary #64ffda, slate #8892b0, lightest #ccd6f6
 * - Features:
 *    - Compact hero summary with counts and CTA
 *    - "Highlights" carousel (auto-rotates) with subtle float animation
 *    - Collapsible accordion sections for each major area (so users can skip long text)
 *    - "Minimize" button that collapses everything to the short summary
 *    - Accessible buttons & keyboard-friendly toggles
 *    - Responsive typography and layout
 *
 * Usage:
 * <UpdateHero />
 */

const palette = {
  bg: "#0a192f",
  primary: "#64ffda",
  slate: "#8892b0",
  lightest: "#ccd6f6",
  cardBg: "#071428",
  cardBorder: "#102a3a",
};

const NEW_SEEDS = [
  {
    title: "Cyclamen",
    image:"https://api.joshlei.com/v2/growagarden/image/Cyclamen"
  },
  {
    title: "Willowberry",
    image:"https://api.joshlei.com/v2/growagarden/image/Willowberry"
  },
  {
    title: "Snaparino Beanarini",
    image:"https://api.joshlei.com/v2/growagarden/image/Snaparino_Beanarini"
  },
  {
    title: "Calla Lily",
    image:"https://api.joshlei.com/v2/growagarden/image/Calla_Lily"
  },
  {
    title: "Flare Melon",
    image:"https://api.joshlei.com/v2/growagarden/image/Flare_Melon"
  },
  {
    title: "Glowpod",
    image:"https://api.joshlei.com/v2/growagarden/image/Glowpod"
  },
  {
    title: "Crown of Thorns",
    image:"https://api.joshlei.com/v2/growagarden/image/Crown_of_Thorns"
  }
];

const NEW_PETS = [
  "Griffin",
  "Admin War Exclusive Pets (various)",
  "… +3 more to discover",
];

const NEW_ITEMS = [
  "Skyroot Chest",
  "Can of Beans",
  "Cleansing Pet Shard",
  "Giantbean Pet Shard",
  "Rainbow Pet Shard",
  "Gold Pet Shard",
  "Silver Pet Shard",
  "Mega Level Up Lollipop",
  "Gold Level Up Lollipop",
  "Silver Level Up Lollipop",
];

const NEW_MUTATIONS = [
  { name: "Brainrot", multiplier: "100×" },
  { name: "Warped", multiplier: "75×" },
  { name: "Beanbound", multiplier: "100×" },
  { name: "Gnomed", multiplier: "15×" },
  { name: "Rot", multiplier: "8×" },
  { name: "Cyclonic", multiplier: "50×" },
  { name: "Maelstrom", multiplier: "100×" },
];

const HIGHLIGHTS = [
  {
    id: "admin-war",
    title: "The Epic Admin War Event",
    emoji: "👑🔥",
    blurb: "One-time admin-driven chaos: wild weathers, exclusive rewards, and powerful mutations.",
  },
  {
    id: "beanstalk",
    title: "Beanstalk Part 2 — Giant's Domain",
    emoji: "🌱⛅",
    blurb: "New beanstalk variants, a Giant you can befriend, and a cloud shop with crafting.",
  },
  {
    id: "pet-achievements",
    title: "Pet Achievements & Guide",
    emoji: "🐾🏆",
    blurb: "New pet achievement tracks across rarities with epic unlocks and XP rewards.",
  },
];

function IconBadge({ children, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold self-start ${className}`}
      style={{
        background: "rgba(100,255,218,0.06)",
        color: palette.primary,
      }}
    >
      {children}
    </div>
  );
}

function Collapsible({ id, title, summary, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-md border" style={{ borderColor: palette.cardBorder }}>
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex  flex-col  justify-between bg-transparent"
        style={{ background: open ? "rgba(100,255,218,0.02)" : "transparent" }}
      >
        <div className="">
          <div className="flex items-center gap-3">
            <h4 className="text-sm text-start font-semibold" style={{ color: palette.lightest }}>
              {title}
            </h4>
          </div>
        </div>
        <div className="flex justify-between mt-1 items-center gap-2">
         {summary && <div className="text-[10px] sm:text-xs text-start text-[var(--slate)]" style={{ color: palette.slate }}>{summary}</div>}
        <div className="text-xs flex text-[var(--slate)]" style={{ color: palette.slate }}>
            
          <span className="mr-3">{open ? "Hide" : "Show"}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
            <path d="M6 9l6 6 6-6" stroke={palette.lightest} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        </div>
      </button>

      <div
        id={id}
        className={`px-4 pb-4 transition-all ${open ? "pt-0 max-h-screen" : "max-h-0 overflow-hidden"}`}
        style={{ color: palette.slate }}
      >
        {open && <div className="pt-2">{children}</div>}
      </div>
    </section>
  );
}

export default function Text() {
  const [minimized, setMinimized] = useState(false);
  const [spot, setSpot] = useState(0);
  const highlights = HIGHLIGHTS;
  useEffect(() => {
    const t = setInterval(() => setSpot((s) => (s + 1) % highlights.length), 4000);
    return () => clearInterval(t);
  }, [highlights.length]);

  const counts = useMemo(
    () => ({
      seeds: NEW_SEEDS.length,
      pets: NEW_PETS.length,
      items: NEW_ITEMS.length,
      mutations: NEW_MUTATIONS.length,
    }),
    []
  );

  return (
    <section
      className="w-full py-6 rounded-md"
      style={{ background: palette.bg, color: palette.lightest }}
    >
      <style>{`
        /* subtle floaty for highlight emoji */
        @keyframes floaty { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0);} }
        .floaty { animation: floaty 3s ease-in-out infinite; }

        /* small card fade in */
        .card-fade { transition: transform .28s ease, opacity .28s ease; }
        .card-fade:hover { transform: translateY(-6px); opacity: 1; }

        /* custom narrow scrollbar inside detail panels */
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,255,218,0.12); border-radius: 999px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100,255,218,0.12) transparent; }
      `}</style>

      <div className="">
        {/* Header row */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-col  gap-3">
              <IconBadge>
                <span className="text-lg">🌱</span>
                <span>Update</span>
              </IconBadge>

              <div>
                <h1 className=" sm:text-xl md:text-3xl font-bold" style={{ color: palette.lightest }}>
                  Admin War + Beanstalk Part 2 — Update 1.20.0
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm mt-1" style={{ color: palette.slate }}>
                  23 Aug 2025 — New beanstalk content, pet achievements, seeds, pets, items and powerful mutations.
                </p>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-xs text-[var(--slate)]" style={{ color: palette.slate }}>
                Quick summary
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                  Seeds <strong className="ml-2" style={{ color: palette.primary }}>{counts.seeds}</strong>
                </div>
                <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                  Pets <strong className="ml-2" style={{ color: palette.primary }}>{counts.pets}</strong>
                </div>
                <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                  Items <strong className="ml-2" style={{ color: palette.primary }}>{counts.items}</strong>
                </div>
                <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                  Mutations <strong className="ml-2" style={{ color: palette.primary }}>{counts.mutations}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMinimized((m) => !m)}
              className="px-3 py-2 rounded-md text-sm font-semibold"
              style={{
                background: minimized ? "transparent" : "linear-gradient(90deg, rgba(100,255,218,0.08), rgba(159,183,255,0.03))",
                color: minimized ? palette.lightest : palette.primary,
                border: `1px solid ${palette.cardBorder}`,
              }}
            >
              {minimized ? "Expand" : "Minimize"}
            </button>
          </div>
        </header>

        {/* Compact view */}
        {minimized ? (
          <div className="rounded p-4 border" style={{ borderColor: palette.cardBorder, background: palette.cardBg }}>
            <div className="flex sm:flex-row flex-col md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm md:text-lg font-semibold" style={{ color: palette.lightest }}>What's new</h2>
                <p className="text-xs md:text-sm" style={{ color: palette.slate }}>Beanstalk expansion, Pet Achievements, dozens of items & seeds.</p>
                <div className="flex gap-1 md:gap-2 mt-3">
                  <div className="text-xs text-[#ccd6f6] px-2 py-1 bg-[#071a2a] rounded border border-[#102a3a] whitespace-nowrap">Seeds: {counts.seeds}</div>
                  <div className="text-xs text-[#ccd6f6] px-2 py-1 bg-[#071a2a] rounded border border-[#102a3a] whitespace-nowrap">Pets: {counts.pets}</div>
                  <div className="text-xs text-[#ccd6f6] px-2 py-1 bg-[#071a2a] rounded border border-[#102a3a] whitespace-nowrap">Items: {counts.items}</div>
                </div>
              </div>

              <div className="flex justify-end  items-center gap-2 sm:gap-4">
                <div className="text-[10px] sm:text-xs text-[#8892b0]">Jump to:</div>
                <a href="#newItems" className="text-xs sm:text-sm font-medium" style={{ color: palette.primary }}>Check New Items</a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top content area: highlights + counts + CTA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Highlights (left) */}
              <div className="md:col-span-2 rounded border p-4 card-fade " style={{ borderColor: palette.cardBorder, background: palette.cardBg }}>
                <div className="flex flex-col md:flex-row items-center sm:items-start gap-4">
                  <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#071a2a] border border-[#102a3a] floaty" aria-hidden>
                    <div className="text-4xl">{highlights[spot].emoji}</div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-md sm:text-lg font-bold" style={{ color: palette.lightest }}>{highlights[spot].title}</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: palette.slate }}>{highlights[spot].blurb}</p>

                    <div className="mt-4 flex gap-2 flex-wrap">
                      <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                        Beanstalk expansion
                      </div>
                      <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                        Pet Achievements
                      </div>
                      <div className="px-3 py-1 rounded bg-[#071a2a] border border-[#102a3a] text-xs">
                        Mutations & Exclusive Rewards
                      </div>
                    </div>

                  
                  </div>
                </div>
              </div>

              {/* Counts & quick list (right) */}
              <aside className="rounded border p-4 card-fade" style={{ borderColor: palette.cardBorder, background: palette.cardBg }}>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-[10px] sm:text-xs font-semibold" style={{ color: palette.primary }}>New in this update</div>
                    <h4 className="text-md sm:text-lg font-bold mt-1" style={{ color: palette.lightest }}>Quick counts</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 rounded bg-[#071a2a] border border-[#102a3a] text-sm">
                      <div className="text-xs text-[#8892b0]">Seeds</div>
                      <div className="font-semibold text-[#64ffda]">{counts.seeds}</div>
                    </div>
                    <div className="px-3 py-2 rounded bg-[#071a2a] border border-[#102a3a] text-sm">
                      <div className="text-xs text-[#8892b0]">Pets</div>
                      <div className="font-semibold text-[#64ffda]">{counts.pets}</div>
                    </div>
                    <div className="px-3 py-2 rounded bg-[#071a2a] border border-[#102a3a] text-sm">
                      <div className="text-xs text-[#8892b0]">Items</div>
                      <div className="font-semibold text-[#64ffda]">{counts.items}</div>
                    </div>
                    <div className="px-3 py-2 rounded bg-[#071a2a] border border-[#102a3a] text-sm">
                      <div className="text-xs text-[#8892b0]">Mutations</div>
                      <div className="font-semibold text-[#64ffda]">{counts.mutations}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] sm:text-xs text-[var(--slate)]" style={{ color: palette.slate }}>
                    Tip: click a section below to expand the details — everything is collapsible so you can skim quickly.
                  </div>
                </div>
              </aside>
            </div>

            {/* Detailed accordion sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col gap-3">
                <Collapsible id="beanstalk" title="Beanstalk Part 2 — Giant's Domain" summary="New beanstalk types, giant shop & crafting" defaultOpen>
                  <p className="text-xs sm:text-sm" style={{ color: palette.slate }}>
                    The Beanstalk climb has been expanded with four beanstalk variants (including golden & mushroom trampoline types). New rewards were added along the climb. At the top you can interact with the Giant — feed him to increase friendship, unlocking a new cloud shop tab and exclusive crafting recipes.
                  </p>

                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <li className="p-2 rounded border" style={{ borderColor: palette.cardBorder }}>
                      <strong>New shop</strong>
                      <div className="text-xs text-[var(--slate)]">Craft unique gear & buy beanstalk-exclusive seeds and pets.</div>
                    </li>
                    <li className="p-2 rounded border" style={{ borderColor: palette.cardBorder }}>
                      <strong>Friendship shop</strong>
                      <div className="text-xs text-[var(--slate)]">Raise Giant friendship to unlock better rewards.</div>
                    </li>
                  </ul>
                </Collapsible>

                <Collapsible id="pets" title="Pet Achievements & Quality of Life" summary="New pet progression system">
                  <p className="text-xs sm:text-sm" style={{ color: palette.slate }}>
                    Pet Achievements are here — complete sets across 7 rarities to earn epic rewards and XP. Also added: Level Reward Track in the Player section of the Garden Guide, new notifications for achievements, and 4 new badges.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded border" style={{ borderColor: palette.cardBorder }}>
                      <div className="text-xs text-[var(--slate)]">How it works</div>
                      <div className="font-semibold">Complete rarity sets → earn rewards & XP</div>
                    </div>

                    <div className="p-3 rounded border" style={{ borderColor: palette.cardBorder }}>
                      <div className="text-xs text-[var(--slate)]">QOL</div>
                      <div className="font-semibold">Hold purchase button in shops • Sprinkler Merchant • Egg shop updates</div>
                    </div>
                  </div>
                </Collapsible>

                <Collapsible id="items" title="New Items & Gears" summary="Skyroot Chest, Can of Beans, shards & lollipops">
                  <p className="text-xs sm:text-sm" style={{ color: palette.slate }}>
                    The update adds Skyroot Chests (contain pets & seeds), the Can Of Beans (a gear for extra jump), multiple pet shard types (Cleanse, Giantbean, Rainbow, Gold, Silver) and Level Up Lollipops (Mega / Gold / Silver) to instantly level pets.
                  </p>

                  <ul className="mt-3 grid grid-cols-2 gap-2">
                    {NEW_ITEMS.slice(0, 8).map((it) => (
                      <li key={it} className="text-sm p-2 rounded border" style={{ borderColor: palette.cardBorder }}>
                        <span className="block font-semibold">{it}</span>
                        <span className="text-xs text-[var(--slate)]">New</span>
                      </li>
                    ))}
                  </ul>
                </Collapsible>

                <Collapsible id="mutations" title="New Mutations" summary="Powerful multipliers included">
                  <p className="text-xs sm:text-sm" style={{ color: palette.slate }}>
                    Seven new mutations have been added. Some provide massive multipliers — these can significantly boost production or change gameplay when active.
                  </p>

                  <ul className="mt-3 space-y-2">
                    {NEW_MUTATIONS.map((m) => (
                      <li key={m.name} className="flex items-center justify-between p-2 rounded border" style={{ borderColor: palette.cardBorder }}>
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-xs text-[var(--slate)]">Mutation</div>
                        </div>
                        <div className="text-sm font-bold" style={{ color: palette.primary }}>{m.multiplier}</div>
                      </li>
                    ))}
                  </ul>
                </Collapsible>
              </div>

              {/* Right column: Seeds list + CTA */}
              <aside className="hidden md:flex flex-col gap-3">
                <div className="rounded p-4 border" style={{ borderColor: palette.cardBorder }}>
                  <h4 className="text-sm font-semibold" style={{ color: palette.lightest }}>New Seeds</h4>
                  <p className="text-xs mt-1" style={{ color: palette.slate }}>Grow these in your garden</p>

                  <ul className="mt-3 space-y-2 text-sm">
                    {NEW_SEEDS.map((s) => (
                      <li key={s} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#071a2a] flex items-center justify-center border border-[#102a3a]">
                            <img className="w-20 h-20 object-contain" src={s.image} alt={s.title} />
                            </div>
                        <div>
                          <div className="font-medium text-[#64ffda]">{s.title}</div>
                          <div className="text-[10px] text-[var(--slate)]">Seed</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* <div className="rounded p-4 border text-center" style={{ borderColor: palette.cardBorder }}>
                  <div className="text-sm font-semibold" style={{ color: palette.lightest }}>Play now</div>
                  <p className="text-xs mt-1" style={{ color: palette.slate }}>Log in to experience the new Beanstalk & Admin War rewards.</p>
                  <div className="mt-3">
                    <a className="inline-block px-4 py-2 rounded-md font-semibold" style={{ background: palette.primary, color: "#001219" }} href="#play">
                      Launch Game
                    </a>
                  </div>
                </div> */}

                <div className="rounded p-3 border text-xs" style={{ borderColor: palette.cardBorder, color: palette.slate }}>
                  <strong>Quick Notes:</strong>
                  <ul className="mt-2 list-disc ml-5">
                    <li>Achievement notifications added</li>
                    <li>Egg shop reorganized (Summer Eggs moved)</li>
                    <li>4 new badges available</li>
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
