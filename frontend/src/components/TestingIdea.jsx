import React, { useEffect, useMemo, useState } from "react";

/* ---------- helpers (same as yours) ---------- */
function slugify(str = "") {
  return String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
}

function buildLookup(arr = []) {
  const map = new Map();
  for (const item of arr) {
    const display = item.display_name || item.name || item.petName || "";
    const id = item.item_id || item.id || item.slug || "";
    const keys = new Set([
      slugify(display),
      slugify(id),
      slugify(item.name || ""),
      (item.item_id || "").toLowerCase(),
    ]);
    for (const k of keys) if (k) map.set(k, item);
  }
  return map;
}

/* ---------- defaults ---------- */
const DEFAULT_UPDATE = {
  id: "1.20.0",
  title: "",
  date: "",
  notes:
    "New seeds, gears/items, cosmetics and powerful new mutations. Click a category to explore.",
};

/* ---------- main component ---------- */
export default function UpdateShowcase({
  dataSources = {},
  newNames = {},
  update = DEFAULT_UPDATE,
}) {
  const [activeCat, setActiveCat] = useState("seeds");
  const [featured, setFeatured] = useState(null);

  // lookups
  const lookups = useMemo(() => ({
    seeds: buildLookup(dataSources.seeds || []),
    items: buildLookup(dataSources.items || []),
    cosmetics: buildLookup(dataSources.cosmetics || []),
    pets: buildLookup(dataSources.pets || []),
    mutations: buildLookup(dataSources.mutations || []),
  }), [dataSources]);

  // normalized new names (fallback list included)
  const normalizedNew = useMemo(() => ({
    seeds: (newNames.seeds || [
      "Cyclamen","Willowberry","Snaparino Beanarini","Calla Lily","Flare Melon","Glowpod","Crown of Thorns",
    ]).map(n => ({ name: n, slug: slugify(n), emoji: null })),
    items: (newNames.items || [
      "Skyroot Chest","Can of Beans","Cleansing Pet Shard","Giantbean Pet Shard","Rainbow Pet Shard","Gold Pet Shard","Silver Pet Shard","Mega Level Up Lollipop","Gold Level Up Lollipop","Silver Level Up Lollipop"
    ]).map(n => ({ name: n, slug: slugify(n), emoji: null })),
    cosmetics: (newNames.cosmetics || [
      "Egg Incubator","Mutation Machine Booster","New Fence Skin #1","New Fence Skin #2","Golden Goose Painting","Bean Chair"
    ]).map(n => ({ name: n, slug: slugify(n), emoji: null })),
    pets: (newNames.pets || [
      "Griffin","Elk","Mandrake","Gnome","Apple Gazelle"
    ]).map(n => ({ name: n, slug: slugify(n), emoji: null })),
    mutations: (newNames.mutations || [
      { name: "Brainrot", multiplier: "100×" },
      { name: "Warped", multiplier: "75×" },
      { name: "Beanbound", multiplier: "100×" },
      { name: "Gnomed", multiplier: "15×" },
      { name: "Rot", multiplier: "8×" },
      { name: "Cyclonic", multiplier: "50×" },
      { name: "Maelstrom", multiplier: "100×" }
    ]).map(m => typeof m === "string" ? { name: m, slug: slugify(m), multiplier: null } : { name: m.name, slug: slugify(m.name), multiplier: m.multiplier })
  }), [newNames]);

  // rendered entries (try to match new names to provided dataset)
  const rendered = useMemo(() => ({
    seeds: normalizedNew.seeds.map(s => ({ meta: s, found: lookups.seeds.get(s.slug) || null })),
    items: normalizedNew.items.map(s => ({ meta: s, found: lookups.items.get(s.slug) || lookups.cosmetics.get(s.slug) || null })),
    cosmetics: normalizedNew.cosmetics.map(s => ({ meta: s, found: lookups.cosmetics.get(s.slug) || null })),
    pets: normalizedNew.pets.map(s => ({ meta: s, found: lookups.pets.get(s.slug) || null })),
    mutations: normalizedNew.mutations.map(m => ({ meta: m, found: lookups.mutations.get(m.slug) || null })),
  }), [normalizedNew, lookups]);

  // pool of items used for "featured"
  const pool = useMemo(() => {
    const all = [];
    ["seeds","items","cosmetics","pets","mutations"].forEach(cat => {
      (rendered[cat] || []).forEach(entry => {
        all.push({ ...entry, category: cat });
      });
    });
    return all;
  }, [rendered]);

  // random featured rotation (every 3s)
  useEffect(() => {
    if (!pool.length) {
      setFeatured(null);
      return;
    }
    // set initial featured immediately
    setFeatured(pool[Math.floor(Math.random() * pool.length)]);
    const id = setInterval(() => {
      setFeatured(prev => {
        if (!pool.length) return null;
        // pick a random different item (max attempts 6)
        let next;
        let attempts = 0;
        do {
          next = pool[Math.floor(Math.random() * pool.length)];
          attempts++;
        } while (prev && next && prev.meta.slug === next.meta.slug && attempts < 6);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [pool]);

  /* palette */
  const palette = {
    bg: "#0a192f",
    primary: "#64ffda",
    slate: "#8892b0",
    lightest: "#ccd6f6",
    cardBg: "#071428",
    cardBorder: "#102a3a",
  };

  /* Utility: get icon/emoji for display (prefer found data if available) */
  function getIconFor(slot) {
    // try found object fields: icon, image, emoji, or fallback to an emoji map
    const found = slot?.found;
    if (found) {
      if (found.icon) return found.icon;
      if (found.image) return found.image;
      if (found.emoji) return found.emoji;
      // sometimes dataset has small images - return placeholder data URI with first letters
      const initials = (found.display_name || found.name || slot.meta.name || "").slice(0,2).toUpperCase();
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%23071a2a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%2364ffda'>${encodeURIComponent(initials)}</text></svg>`;
    }
    // fallback to simple emoji suggestions (mutations show multiplier)
    const name = (slot.meta && slot.meta.name) || "";
    if (/melon|pumpkin|berry|apple|pear|mango|coco/i.test(name)) return "🍈";
    if (/lollipop|sugar|sugarglaze|lollipop/i.test(name)) return "🍭";
    if (/shard|pet|charm/i.test(name)) return "🔹";
    if (/egg|incubator/i.test(name)) return "🥚";
    if (/ma elstrom|cyclonic|rot|brainrot|warped|gnomed/i.test(name.toLowerCase())) return "🌀";
    // default placeholder using meta initials as data URI
    const initials = (name || "").slice(0,2).toUpperCase();
    return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%23071a2a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%2364ffda'>${encodeURIComponent(initials)}</text></svg>`;
  }

  /* production ready: ensure no debug buttons or global side-effects remain */

  return (
    <section className="min-h-[60vh]" style={{ background: palette.cardBg, color: palette.lightest }}>
      <style>{`
        /* small local styles */
        @keyframes floatyY { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
        .floatyY { animation: floatyY 3s ease-in-out infinite; }
        .fade-in { animation: fadeIn .45s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0);} }

        /* custom scrollbar (narrow) */
        .custom-scrollbar::-webkit-scrollbar { height:8px; width:8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,255,218,0.12); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 999px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100,255,218,0.12) transparent; }
      `}</style>

      <div className="">
        <div className="flex flex-col md:flex-row gap-6">
          {/* LEFT: heading + subheading + featured rotating item */}
          <aside className="md:w-1/3">
            <div className="rounded p-4 border" style={{ borderColor: palette.cardBorder, background: "linear-gradient(180deg, rgba(255,255,255,0.01), transparent)" }}>
              <h1 className="text-lg sm:text-xl  font-bold" style={{ color: palette.lightest }}>{update.title}</h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: palette.slate }}>{update.date}</p>
              <p className="text-[10px] sm:text-sm mt-3" style={{ color: palette.slate }}>{update.notes}</p>

              <div className="mt-6">
                <div
                  className="mt-4 rounded-md p-4 flex flex-col items-center text-center fade-in"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.cardBorder}` }}
                >
                  {featured ? (
                    <>
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 floatyY" style={{ background: "radial-gradient(circle at 30% 20%, rgba(100,255,218,0.04), rgba(255,255,255,0.01))" }}>
                        {/* If icon is data-uri or emoji or URL */}
                        {String(getIconFor(featured)).startsWith("data:image") || String(getIconFor(featured)).startsWith("http") ? (
                          <img src={getIconFor(featured)} alt={featured.meta.name} className="w-16 h-16 object-contain" />
                        ) : (
                          <div className="text-4xl" aria-hidden>{getIconFor(featured)}</div>
                        )}
                      </div>

                      <div className="font-semibold text-sm">{featured.meta.name}</div>
                      <div className="text-xs mt-1" style={{ color: palette.slate }}>
                        {featured.found?.rarity || featured.meta.multiplier || featured.found?.type || "New"}
                      </div>
                      {/* subtle hint */}
                      <div className="text-[11px] mt-2 text-[#9fb7ff]">Category: <span className="text-[#64ffda]">{featured.category}</span></div>
                    </>
                  ) : (
                    <div className="py-6 text-sm text-[#8892b0]">No featured item available</div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: categories + grid */}
          <main className="flex-1">
            <div className="mb-4 flex gap-2 flex-wrap">
              {[
                { id: "seeds", label: "Seeds" },
                { id: "pets", label: "Pets" },
                { id: "items", label: "Gears / Items" },
                { id: "cosmetics", label: "Cosmetics" },
                { id: "mutations", label: "Mutations" },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`px-1 sm:px-3 py-1 rounded-md text-sm font-semibold transition-all ${activeCat === c.id ? "bg-[#0f2a35] text-[#64ffda]" : "bg-transparent text-[#ccd6f6] border border-[#102a3a]"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="rounded border p-1 sm:p-4" style={{ borderColor: palette.cardBorder, background: palette.cardBg }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 custom-scrollbar" style={{ maxHeight: "56vh", overflowY: "auto", paddingBottom: 8 }}>
                {(rendered[activeCat] || []).map((slot) => {
                  const { meta, found } = slot;
                  const title = meta.name;
                  const icon = getIconFor(slot);
                  if (activeCat === "mutations") {
                    const mult = meta.multiplier || (found && (found.multiplier || found.multiplier_str)) || "—";
                    return (
                      <div key={meta.slug} className="bg-[#071a2a] rounded p-3 border border-[#102a3a] flex flex-col items-center text-center">
                        <div className="text-4xl mb-2">{typeof icon === "string" && icon.startsWith("data:image") ? <img src={icon} alt={title} className="w-14 h-14 object-contain" /> : <span aria-hidden>{icon}</span>}</div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-xs text-[#8892b0] mt-1">Multiplier</div>
                        <div className="text-sm font-bold mt-1 text-[#64ffda]">{mult}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={meta.slug} className="bg-[#071a2a] rounded p-3 border border-[#102a3a]">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                          
                            <img src={icon} alt={title} className="w-12 h-12 object-contain" />
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold">{title}</div>
                          <div className="text-xs text-[#8892b0] mt-1">{found?.rarity || found?.type || "New"}</div>
                        </div>
                      </div>

                      {!found && (
                        <div className="mt-3 text-xs text-yellow-300">
                          <strong>Missing:</strong> not found in provided dataset (this is expected when using placeholder names).
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
