// TradeCalculator.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { items as importedItems } from "/src/data/info.js";

/* ---------- Utilities ---------- */
const formatBig = (n) => {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  const fmt = (v) =>
    // up to 2 decimals; trim trailing .00 and trailing zero in .X0
    v.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");

  // >= 1e24 -> Sp (septillion)
  if (abs >= 1e24) return `${sign}${fmt(num / 1e24)}Sp`;
  // >= 1e21 -> Sx (sextillion)
  if (abs >= 1e21) return `${sign}${fmt(num / 1e21)}Sx`;
  // >= 1e18 -> Qi (quintillion)
  if (abs >= 1e18) return `${sign}${fmt(num / 1e18)}Qi`;
  // >= 1e15 -> Q (quadrillion)
  if (abs >= 1e15) return `${sign}${fmt(num / 1e15)}Q`;
  // >= 1e12 -> T (trillion)
  if (abs >= 1e12) return `${sign}${fmt(num / 1e12)}T`;
  // >= 1e9  -> B (billion)
  if (abs >= 1e9) return `${sign}${fmt(num / 1e9)}B`;
  // >= 1e6  -> M (million)
  if (abs >= 1e6) return `${sign}${fmt(num / 1e6)}M`;
  // >= 1e3  -> K (thousand)
  if (abs >= 1e3) return `${sign}${fmt(num / 1e3)}K`;

  return String(num);
};

const clamp = (v, min = 0, max = Infinity) => Math.max(min, Math.min(max, v));
const makeSlug = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");

/* ---------- Placeholder image ---------- */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="100%" height="100%" fill="#0f172a"/>
    <text x="50%" y="50%" fill="#9ca3af" font-family="system-ui,Arial" font-size="18" text-anchor="middle" dominant-baseline="middle">No Image</text>
  </svg>
`);

/* ---------- Rarity -> dark gradient helper (inline style only) ---------- */
const rarityToGradient = (rarity) => {
  if (!rarity) return "linear-gradient(90deg,#0f172a,#111827)";
  const r = String(rarity).toLowerCase();
  switch (r) {
    case "common":
      return "linear-gradient(90deg,#374151,#1f2937)"; // gray
    case "uncommon":
      return "linear-gradient(90deg,#064e3b,#065f46)"; // green (dark)
    case "rare":
      return "linear-gradient(90deg,#083344,#0369a1)"; // blue (dark)
    case "legendary":
    case "legend":
      return "linear-gradient(90deg,#ECE33A,#949804)"; // gold / yellow (distinct)
    case "mythical":
    case "mythic":
      return "linear-gradient(90deg,#4c1d95,#6d28d9)"; // purple
    case "divine":
      return "linear-gradient(90deg,#E08308,#c2410c)"; // orange (distinct)
    case "prismatic":
      return "linear-gradient(90deg,#7f1d1d,#b91c1c)"; // red / prismatic
    default:
      return "linear-gradient(90deg,#374151,#111827)";
  }
};

/* ---------- GridTile (now uses centralized openDetailSlotId via props) ---------- */
const GridTile = React.memo(function GridTile({
  slot,
  pet,
  onOpenPicker,
  onRemove,
  onQuickEdit,
  presentMode,
  openDetailSlotId,
  setOpenDetailSlotId,
}) {
  const imgSrc = pet?.image || PLACEHOLDER;

  // detect hover capability
  const [supportsHover, setSupportsHover] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(hover: hover)");
      setSupportsHover(!!mq.matches);
      const handler = () => setSupportsHover(!!mq.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }
    return undefined;
  }, []);

  // local hovering flag for desktop
  const [hovering, setHovering] = useState(false);

  // ensure popup hidden when presentMode turned off
  useEffect(() => {
    if (!presentMode && openDetailSlotId === slot?.slotId) {
      setOpenDetailSlotId(null);
    }
  }, [presentMode, openDetailSlotId, setOpenDetailSlotId, slot]);

  const handleMouseEnter = (e) => {
    if (presentMode && supportsHover) {
      setHovering(true);
      setOpenDetailSlotId(slot?.slotId ?? null);
      e.stopPropagation();
    }
  };
  const handleMouseLeave = (e) => {
    if (presentMode && supportsHover) {
      setHovering(false);
      // only clear if this slot is the open one
      setOpenDetailSlotId((cur) => (cur === slot?.slotId ? null : cur));
      e.stopPropagation();
    }
  };

  const handleClick = (e) => {
    // stop document handler
    e.stopPropagation();
    if (!presentMode) return;
    if (!supportsHover) {
      // toggle centralized detail slot id (ensures only one open)
      setOpenDetailSlotId((cur) => (cur === slot?.slotId ? null : slot?.slotId));
    } else {
      // on hover-capable devices, also open details when clicking
      setOpenDetailSlotId((cur) => (cur === slot?.slotId ? null : slot?.slotId));
    }
  };

  const { age, sizeKg, mutation } = slot || {};
  const isOpen = openDetailSlotId === slot?.slotId;
  const showDetails = presentMode && (supportsHover ? (hovering || isOpen) : isOpen);

  // gradient background for image area
  const rarityBg = rarityToGradient(pet?.rarity);

  return (
    /* NOTE: data-tile attribute for measurement by OfferGrid */
    <div
      data-tile="true"
      className="relative rounded-lg shadow-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="w-full flex items-center justify-center">
        <div
          className="w-full h-full rounded-md overflow-hidden flex items-center justify-center relative"
          style={{
            background: rarityBg,
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.35)",
            padding: 6,
          }}
        >
          <img
            src={imgSrc}
            alt={pet?.petName || "empty"}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        </div>
      </div>

      <div className="w-full flex items-center justify-between gap-2 mt-2">
        {pet ? (
          <>
            {!presentMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(slot.slotId);
                }}
                className="sm:px-2 px-1 py-[2px] sm:py-1 m-1 rounded-full bg-[#ff6b6b] hover:bg-[#ff7b7b] text-white text-[10px]  font-semibold absolute top-0 right-0"
                title="Remove"
              >
                ✖
              </button>
            )}
            {presentMode && <div className="flex-1" />}
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPicker(slot);
            }}
            className="w-full px-2 py-1 rounded-md bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-semibold text-sm"
            title="Add pet"
          >
            Add
          </button>
        )}
      </div>

      {/* details popup (presentMode only) */}
      {/* {presentMode && showDetails && pet && (
        <div
          className="absolute z-30 top-2 left-2 right-2 p-2 rounded-md bg-black/85 border border-white/10 text-xs text-white shadow-xl min-w-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-semibold truncate text-[8px]">{pet.petName}</div>
          <div className="text-[7px] text-slate-300 mt-1">
            Rarity: <span className="text-white font-semibold">{pet.rarity || "—"}</span>
          </div>

          {age != null || sizeKg != null || (mutation && mutation !== "None") ? (
            <div className="mt-2 space-y-1">
              {age != null && <div className="text-[7px]">Age: <span className="font-semibold text-[8px]">{age}</span></div>}
              {sizeKg != null && <div className="text-[7px]">Size: <span className="font-semibold text-[8px]">{sizeKg} kg</span></div>}
              {mutation && mutation !== "None" && <div className="text-[7px]">Mutation: <span className="font-semibold text-[8px]">{mutation}</span></div>}
            </div>
          ) : (
            <div className="mt-2 text-slate-400 text-[8px]">No extra details</div>
          )}
        </div>
      )} */}
    </div>
  );
});

/* ---------- PlusTile ---------- */
function PlusTile({ onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className="relative group rounded-lg md:p-2 p-1 flex items-center justify-center cursor-pointer transition-shadow duration-200 h-23 border border-[#64ffda]"
      title="Add a pet"
      aria-label="Add a pet"
    >
      <div className="w-14 h-8 rounded-full bg-slate-900/60 flex items-center justify-center text-xl md:text-3xl text-[#64ffda] font-extrabold shadow-md">
        +
      </div>
    </div>
  );
}

/* ---------- OfferGrid (accepts presentMode, passes centralized handlers) ---------- */
const OfferGrid = React.memo(function OfferGrid({
  label,
  offerState,
  visibleSlotsCount,
  onOpenPicker,
  onRemove,
  onQuickEdit,
  setShekInput,
  shekInput,
  finalizeShek,
  lookup,
  totalValue,
  shekNum,
  presentMode,
  openDetailSlotId,
  setOpenDetailSlotId,
}) {
  const totalSlots = visibleSlotsCount;
  const filled = offerState || [];

  const gridColsClass =
    totalSlots <= 9 ? "grid-cols-3" : totalSlots <= 15 ? "grid-cols-3" : "grid-cols-4";

  const approxTileHeight = 96; // fallback
  const gap = 12;
  const maxRows = 3;
  const approxMaxHeight = maxRows * approxTileHeight + (maxRows - 1) * gap;

  // measurement ref + state to store measured tile row height
  const gridRef = useRef(null);
  const [measuredRowHeight, setMeasuredRowHeight] = useState(null);

  // measure first tile height whenever grid or children change or window resizes.
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    let ro;
    const measure = () => {
      try {
        const gridEl = gridRef.current;
        if (!gridEl) {
          setMeasuredRowHeight(null);
          return;
        }
        // find the first element with data-tile attribute
        const firstTile = gridEl.querySelector('[data-tile="true"]');
        if (firstTile) {
          const h = Math.ceil(firstTile.getBoundingClientRect().height);
          if (h && h > 0) setMeasuredRowHeight(h);
        } else {
          setMeasuredRowHeight(null);
        }
      } catch (e) {
        // ignore measurement errors
        setMeasuredRowHeight(null);
      }
    };

    // run initial measure
    // use requestAnimationFrame to ensure layout finished
    const rafId = window.requestAnimationFrame(measure);

    // ResizeObserver to detect internal tile size changes (preferred)
    if (typeof ResizeObserver !== "undefined" && gridRef.current) {
      ro = new ResizeObserver(() => {
        // use RAF inside observer to avoid layout thrash
        window.requestAnimationFrame(measure);
      });
      ro.observe(gridRef.current);
      // also observe first tile (if present) to catch its height changes
      const firstTile = gridRef.current.querySelector('[data-tile="true"]');
      if (firstTile) ro.observe(firstTile);
    }

    // fallback to window resize event
    const onWinResize = () => window.requestAnimationFrame(measure);
    window.addEventListener("resize", onWinResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onWinResize);
      if (ro && ro.disconnect) ro.disconnect();
    };
  }, [filled.length, gridColsClass]);

  // compute the actual maxHeight: measuredRowHeight * rows + gaps
  const computedMaxHeight = measuredRowHeight
    ? measuredRowHeight * maxRows + gap * (maxRows - 1)
    : approxMaxHeight;

  return (
    <div className="py-2 px-1 md:p-4 rounded-2xl bg-[#071226]/60 border border-white/6 shadow-lg">
      <div className="flex md:flex-row flex-col items-center md:justify-between gap-y-1 justify-center mb-3">
        <div>
          <div className="md:text-md text-xs font-extrabold text-white">Player {label}</div>
        </div>
        

        {!presentMode ? (

          <div className="flex items-center gap-2">
            
            <div className="text-xs text-slate-300 mr-2">Sheckles</div>
            <input
              value={shekInput}
              onChange={(e) => setShekInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  finalizeShek();
                }
              }}
              onBlur={() => finalizeShek()}
              className="w-28 sm:w-20 lg:w-28 rounded-md sm:px-2 py-1 px-1 bg-[#0f172a]/40 border border-white/6 text-white text-xs sm:text-sm h-6 outline-none"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              title="Enter sheckles (numbers only)"
              aria-label={`${label} sheckles input`}
            />
            <button
              onClick={() => finalizeShek()}
              className="sm:px-3  px-1 rounded-sm text-xs  bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-semibold h-6"
            >
              Apply
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
        <div className="md:pl-3">
          {Number(shekNum || 0) > 0 && (
            <div className="inline-flex items-center gap-2 px-1 md:px-2 py-1 rounded-full bg-[#f59e0b]/10 text-amber-200 border border-[#f59e0b]/20 text-[8px] md:text-xs font-semibold">
              <span className="text-amber-300 font-bold">₪</span>
              <span>{formatBig(shekNum)} added</span>
            </div>
          )}
        </div>
      </div>
      <div
        ref={gridRef}
        className={`grid w-full ${gridColsClass} md:gap-3`}
        style={{
          maxHeight: `${computedMaxHeight}px`,
          overflowY: "auto",
          overflowX: "hidden",
          gridAutoRows: "auto",
          alignContent: "start",
        }}
      >
        {filled.map((slot) => {
          const key = slot.slotId;
          const pet = slot.slug ? lookup[slot.slug] : null;
          return (
            <GridTile
              key={key}
              slot={slot}
              pet={pet}
              onOpenPicker={(s) => onOpenPicker(s)}
              onRemove={(id) => onRemove(id)}
              onQuickEdit={(s) => onQuickEdit(s)}
              presentMode={presentMode}
              openDetailSlotId={openDetailSlotId}
              setOpenDetailSlotId={setOpenDetailSlotId}
            />
          );
        })}

        <PlusTile onClick={() => onOpenPicker(null)} />
      </div>

     
    </div>
  );
});

/* ---------- Main Component ---------- */
export default function TradeCalculator({ pets: petsProp = null }) {
  // pets source & loading
  const [pets, setPets] = useState(petsProp ?? null);
  const [loadingPets, setLoadingPets] = useState(!petsProp);
  const [petsError, setPetsError] = useState(null);

  // offers
  const [offerA, setOfferA] = useState([]);
  const [offerB, setOfferB] = useState([]);

  // shek inputs
  const [shekAInput, setShekAInput] = useState("0");
  const [shekBInput, setShekBInput] = useState("0");
  const [shekANum, setShekANum] = useState(0);
  const [shekBNum, setShekBNum] = useState(0);

  // banner / timer
  const [banner, setBanner] = useState("Make a change to see live updates");
  const bannerTimerRef = useRef(null);

  // picker modal
  const [picker, setPicker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // quick-edit modal
  const [quickEdit, setQuickEdit] = useState({
    open: false,
    offer: null,
    slot: null,
  });

  // responsive
  const [visibleSlotsCount, setVisibleSlotsCount] = useState(9);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleSlotsCount(9);
      else if (w < 1024) setVisibleSlotsCount(15);
      else setVisibleSlotsCount(25);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // present mode
  const [presentMode, setPresentMode] = useState(false);

  // centralized open detail slot id
  const [openDetailSlotId, setOpenDetailSlotId] = useState(null);

  // display mode: 'meter' | 'bar'
  const [displayMode, setDisplayMode] = useState("bar");

  // when presentMode enabled, clicking anywhere closes details (only one open)
  useEffect(() => {
    if (!presentMode) {
      setOpenDetailSlotId(null);
      return;
    }
    const onDocClick = () => setOpenDetailSlotId(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [presentMode]);

  // load pets
  useEffect(() => {
    if (petsProp) return;
    let mounted = true;
    setLoadingPets(true);
    setPetsError(null);
    (async () => {
      try {
        if (
          typeof importedItems !== "undefined" &&
          Array.isArray(importedItems)
        ) {
          const normalized = importedItems.map((p) => ({
            ...p,
            slug: p.slug || makeSlug(p.petName || p.name),
          }));
          if (mounted) {
            setPets(normalized);
            setLoadingPets(false);
          }
          return;
        }
        const r = await fetch("/info.json", { cache: "no-store" });
        if (!r.ok) throw new Error(`Failed to fetch /info.json: ${r.status}`);
        const json = await r.json();
        const arr = Array.isArray(json.items)
          ? json.items
          : Array.isArray(json)
          ? json
          : json.items || [];
        const normalized = arr.map((p) => ({
          ...p,
          slug: p.slug || makeSlug(p.petName || p.name),
        }));
        if (mounted) {
          setPets(normalized);
          setLoadingPets(false);
        }
      } catch (err) {
        if (mounted) {
          setPetsError(String(err));
          setLoadingPets(false);
        }
      }
    })();
    return () => (mounted = false);
  }, [petsProp]);

  // lookup
  const lookup = useMemo(() => {
    if (!pets) return {};
    return Object.fromEntries(
      pets.map((p) => [p.slug || makeSlug(p.petName || p.name || ""), p])
    );
  }, [pets]);

  // value for entry
  const valueForEntry = useCallback(
    (entry) => {
      if (!entry || !entry.slug) return 0;
      const pet = lookup[entry.slug];
      if (!pet) return 0;
      const base =
        Number(pet.avgValue ?? pet.minValue ?? pet.maxValue ?? 0) || 0;
      const qty = Number(entry.qty || 0);
      const mult = Number(entry.mult || 1);
      return base * qty * mult;
    },
    [lookup]
  );
  // totals
  const totalA = useMemo(
    () =>
      (offerA || []).reduce((s, e) => s + valueForEntry(e), 0) +
      Number(shekANum || 0),
    [offerA, shekANum, valueForEntry]
  );
  const totalB = useMemo(
    () =>
      (offerB || []).reduce((s, e) => s + valueForEntry(e), 0) +
      Number(shekBNum || 0),
    [offerB, shekBNum, valueForEntry]
  );

  // fairness calc
  const diff = totalA - totalB;
  const absDiff = Math.abs(diff);
  const mid = Math.max((Math.abs(totalA) + Math.abs(totalB)) / 2, 1);
  const pct = (absDiff / mid) * 100;
  const verdict = useMemo(() => {
    if (pct <= 10) return { text: "Fair", kind: "fair" };
    if (diff > 0) return { text: "You lose", kind: "lose" };
    return { text: "You win", kind: "win" };
  }, [pct, diff]);

  const fairnessLeftPct = useMemo(() => {
    if (totalA === 0 && totalB === 0) return 50;
    const sum = Math.abs(totalA) + Math.abs(totalB);
    return sum === 0 ? 50 : Math.round((Math.abs(totalA) / sum) * 100);
  }, [totalA, totalB]);

  // banner helper
  const flashBanner = useCallback((text) => {
    setBanner(text);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(
      () => setBanner("Make a change to see live updates"),
      3500
    );
  }, []);

  useEffect(
    () => () => bannerTimerRef.current && clearTimeout(bannerTimerRef.current),
    []
  );

  // "pulse" animation when totals change
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 700);
    return () => clearTimeout(t);
  }, [totalA, totalB]);

  // slot id generator; also include details on slot
  const nextSlotIdRef = useRef(1);
  const makeSlot = useCallback((slug = "", qty = 1, mult = 1) => {
    const id = `s-${Date.now()}-${nextSlotIdRef.current++}`;
    return { slotId: id, slug, qty, mult, age: null, sizeKg: null, mutation: "None" };
  }, []);

  // CRUD helpers
  const addPetToOffer = useCallback(
    (setter, state, defaultSlug = "") => {
      const newSlot = makeSlot(
        defaultSlug || (pets && pets[0] ? pets[0].slug : "")
      );
      setter([...state, newSlot]);
      flashBanner("Added pet");
    },
    [makeSlot, flashBanner, pets]
  );

  const removePetFromOffer = useCallback(
    (setter, state, slotId) => {
      const newOffer = state.filter((s) => s.slotId !== slotId);
      setter(newOffer);
      flashBanner("Removed pet");
    },
    [flashBanner]
  );

  const updateSlotForOffer = useCallback(
    (setter, state, slotId, patch) => {
      const newOffer = state.map((s) =>
        s.slotId === slotId ? { ...s, ...patch } : s
      );
      setter(newOffer);
      flashBanner("Updated slot");
    },
    [flashBanner]
  );

  const addA = useCallback(
    () => addPetToOffer(setOfferA, offerA),
    [addPetToOffer, offerA]
  );
  const addB = useCallback(
    () => addPetToOffer(setOfferB, offerB),
    [addPetToOffer, offerB]
  );
  const removeA = useCallback(
    (id) => removePetFromOffer(setOfferA, offerA, id),
    [removePetFromOffer, offerA]
  );
  const removeB = useCallback(
    (id) => removePetFromOffer(setOfferB, offerB, id),
    [removePetFromOffer, offerB]
  );
  const updateA = useCallback(
    (id, patch) => updateSlotForOffer(setOfferA, offerA, id, patch),
    [updateSlotForOffer, offerA]
  );
  const updateB = useCallback(
    (id, patch) => updateSlotForOffer(setOfferB, offerB, id, patch),
    [updateSlotForOffer, offerB]
  );

  const resetOffers = useCallback(() => {
    setOfferA([]);
    setOfferB([]);
    setShekAInput("0");
    setShekBInput("0");
    setShekANum(0);
    setShekBNum(0);
    flashBanner("Reset both offers");
  }, [flashBanner]);

  // picker modal
  const openPicker = useCallback((offer, slotId = null) => {
    setPicker({ offer, slotId });
    setSearchQuery("");
  }, []);
  const closePicker = useCallback(() => setPicker(null), []);

  const pickPetToSlot = useCallback(
    (chosenSlug) => {
      if (!picker) return;
      const { offer, slotId } = picker;
      const target = offer === "A" ? offerA : offerB;
      const setter = offer === "A" ? setOfferA : setOfferB;
      if (slotId) {
        const newOffer = target.map((s) =>
          s.slotId === slotId ? { ...s, slug: chosenSlug } : s
        );
        setter(newOffer);
        flashBanner(
          `Updated slot to ${lookup[chosenSlug]?.petName ?? chosenSlug}`
        );
      } else {
        const newSlot = makeSlot(chosenSlug, 1, 1);
        setter([...target, newSlot]);
        flashBanner(
          `Added ${lookup[chosenSlug]?.petName ?? chosenSlug} to Offer ${offer}`
        );
      }
      closePicker();
    },
    [picker, offerA, offerB, lookup, makeSlot, flashBanner, closePicker]
  );

  // filtered pets for picker
  const filteredPetsMemo = useMemo(() => {
    if (!pets) return [];
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return pets.slice(0, 80);
    return pets
      .filter((p) =>
        ((p.petName || p.name || "") + " " + (p.slug || ""))
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 80);
  }, [pets, searchQuery]);

  // Shek finalize handlers
  useEffect(() => {
    setShekAInput(String(shekANum));
    setShekBInput(String(shekBNum));
  }, []); // run once

  const finalizeShekA = useCallback(() => {
    const n = clamp(
      Number((shekAInput || "0").replace(/[^\d.-]/g, "") || 0),
      0
    );
    setShekANum(n);
    setShekAInput(String(n));
    flashBanner("Updated sheckles for A");
  }, [shekAInput, flashBanner]);

  const finalizeShekB = useCallback(() => {
    const n = clamp(
      Number((shekBInput || "0").replace(/[^\d.-]/g, "") || 0),
      0
    );
    setShekBNum(n);
    setShekBInput(String(n));
    flashBanner("Updated sheckles for B");
  }, [shekBInput, flashBanner]);

  // quick-edit (now includes age,sizeKg,mutation)
  const openQuickEdit = useCallback(
    (offerLabel, slot) => setQuickEdit({ open: true, offer: offerLabel, slot }),
    []
  );
  const closeQuickEdit = useCallback(
    () => setQuickEdit({ open: false, offer: null, slot: null }),
    []
  );
  const saveQuickEdit = useCallback(
    (patch) => {
      const { offer, slot } = quickEdit;
      if (!slot) return closeQuickEdit();
      if (offer === "A") updateA(slot.slotId, patch);
      else updateB(slot.slotId, patch);
      closeQuickEdit();
      flashBanner("Saved quick edit & details");
    },
    [quickEdit, updateA, updateB, flashBanner, closeQuickEdit]
  );

  // swap offers
  const swapOffers = useCallback(() => {
    setOfferA((prevA) => {
      const curA = prevA;
      setOfferB(curA);
      return offerB;
    });
    setShekANum((a) => {
      const oldA = shekANum;
      setShekBNum(oldA);
      return shekBNum;
    });
    setShekAInput(String(shekBNum));
    setShekBInput(String(shekANum));
    flashBanner("Swapped offers");
  }, [offerB, shekANum, shekBNum, flashBanner]);

  // auto-balance
  const autoBalance = useCallback(() => {
    const diffNum = Math.round(Math.abs(diff));
    if (diffNum === 0) {
      flashBanner("No balance needed");
      return;
    }
    if (totalA < totalB) {
      setShekANum((n) => n + diffNum);
      setShekAInput(String(Number(shekAInput || 0) + diffNum));
      flashBanner(`Auto-added ${formatBig(diffNum)} to A`);
    } else {
      setShekBNum((n) => n + diffNum);
      setShekBInput(String(Number(shekBInput || 0) + diffNum));
      flashBanner(`Auto-added ${formatBig(diffNum)} to B`);
    }
  }, [diff, totalA, totalB, shekAInput, shekBInput, flashBanner]);

  // badge styles (inline style to ensure palette colors)
  const leftBadgeStyle =
    totalA > totalB
      ? { background: "#ff6b6b", color: "#fff", boxShadow: "0 6px 18px rgba(255,107,107,0.08)" }
      : totalA < totalB
      ? { background: "#064d3e", color: "#fff", boxShadow: "0 6px 18px rgba(6,77,62,0.08)" }
      : { background: "#0f172a", color: "#fff", boxShadow: "0 6px 18px rgba(2,6,23,0.07)" };

  const rightBadgeStyle =
    totalB > totalA
      ? { background: "#ff6b6b", color: "#fff", boxShadow: "0 6px 18px rgba(255,107,107,0.08)" }
      : totalB < totalA
      ? { background: "#064d3e", color: "#fff", boxShadow: "0 6px 18px rgba(6,77,62,0.08)" }
      : { background: "#0f172a", color: "#fff", boxShadow: "0 6px 18px rgba(2,6,23,0.07)" };

  /* Result banner - uses displayMode to pick visualization (meter or bar) */
  const ResultBanner = (
    <div
      className="mb-6 rounded-lg overflow-hidden py-3 px-1 sm:p-4 text-white bg-[#112240]"
      // style={{
      //   background: "linear-gradient(90deg,#071226,#064d3e,#0f172a)",
      // }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`sm:px-2 py-1 rounded-lg min-w-[50px] text-center transform transition-all duration-500 ${pulse ? "scale-105" : "scale-100"}`}
            aria-hidden
            role="status"
            style={leftBadgeStyle}
          >
            <div className="text-[6px] sm:text-[10px] uppercase opacity-90">Player A</div>
            <div className="text-xs sm:text-lg font-extrabold tracking-tight -mt-1">
              {formatBig(totalA)}
            </div>
          </div>
        </div>

        <div className="flex-1 text-center min-w-0">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-sm sm:text-xl md:text-2xl font-extrabold text-center tracking-tight ">
              Trading Calculator
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`sm:px-2 py-1 rounded-md min-w-[50px] text-center transform transition-all duration-500 ${pulse ? "scale-105" : "scale-100"}`}
            aria-hidden
            role="status"
            style={rightBadgeStyle}
          >
            <div className="text-[6px] sm:text-[10px] uppercase opacity-90">Player B</div>
            <div className="text-xs sm:text-lg font-extrabold tracking-tight -mt-1">
              {formatBig(totalB)}
            </div>
          </div>
        </div>
      </div>

      {/* Top control row: displayMode selector (bar | meter) placed above the visualization for clarity */}
    {
      !presentMode && (
          <div className="mt-3 flex items-center justify-end gap-3">
        <label className="text-xs text-[#cfeee4] mr-2">Visualization</label>
        <select
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value)}
          className="rounded-md px-2 py-1 bg-[#0f172a] text-white text-xs border border-white/6"
        >
          <option value="meter">Meter</option>
          <option value="bar">Bar</option>
        </select>
      </div>
      )
    }

      {/* replaced status bar with either gauge (meter) or a horizontal bar depending on displayMode */}
      <div className="mt-4 w-full">
        {displayMode === "meter" ? (
          (() => {
            const sumAbs = Math.abs(totalA) + Math.abs(totalB);
            const normalized = sumAbs === 0 ? 0 : (totalA - totalB) / sumAbs;
            const maxAngle = 60; // degrees to each side
            const angle = Math.max(-maxAngle, Math.min(maxAngle, normalized * maxAngle));

            // SVG geometry (kept identical, but colors tuned to palette)
            const cx = 100;
            const cy = 80;
            const radius = 70;
            const needleLen = 60;

            const ticks = [-60, -30, 0, 30, 60];

            return (
              <div className="w-full flex flex-col items-center">
                <svg
                  width="100%"
                  height="100"
                  viewBox="0 0 200 100"
                  aria-hidden={false}
                  role="img"
                >
                  {/* arc */}
                  <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* colored arc segments: left (A) -> right (B) using site palette */}
                  <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx} ${cy}`}
                    stroke="rgba(6,77,62,0.28)" // dark-green left
                    strokeWidth="8"
                    fill="none"
                  />
                   <path
                    d={`M ${cx} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    stroke="rgba(100,159,250,0.22)" // bluish right
                    strokeWidth="8"
                    fill="none"
                  />

                  {/* ticks */}
                  {ticks.map((t, i) => {
                    const rad = (t * Math.PI) / 180;
                    const outerX = cx + radius * Math.sin(rad);
                    const outerY = cy - radius * Math.cos(rad);
                    const innerX = cx + (radius - 8) * Math.sin(rad);
                    const innerY = cy - (radius - 8) * Math.cos(rad);
                    return (
                      <line
                        key={i}
                        x1={innerX}
                        y1={innerY}
                        x2={outerX}
                        y2={outerY}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2"
                      />
                    );
                  })}

                  {/* labels A / B */}
                  <text x={cx - radius + 6} y={cy + 18} fontSize="10" fill="#ffffff" opacity="0.85">
                    A
                  </text>
                  <text x={cx + radius - 12} y={cy + 18} fontSize="10" fill="#ffffff" opacity="0.85">
                    B
                  </text>

                  {/* needle group rotated around pivot (cx,cy) */}
                  <g transform={`rotate(${angle} ${cx} ${cy})`} style={{ transition: "transform 600ms cubic-bezier(.2,.9,.2,1)" }}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={cx}
                      y2={cy - needleLen}
                      stroke="#fffbeb"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1={cx}
                      y1={cy}
                      x2={cx}
                      y2={cy - Math.round(needleLen * 0.6)}
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* pivot */}
                  <circle cx={cx} cy={cy} r="5" fill="#071226" stroke="#fff" strokeWidth="1" />
                </svg>

                {/* numeric/text readout below the gauge */}
                <div className="mt-2 w-full flex items-center justify-between text-[10px] sm:text-xs text-slate-200 max-w-3xl">
                  <div className="font-semibold">
                    Difference: <span className="ml-2 text-white">{formatBig(diff)}</span>
                  </div>
                  <div className="font-semibold text-[10px] sm:text-xs ">
                    Relative: <span className="ml-2 text-white">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* BAR mode: a horizontal segmented bar that visually represents fairness */
          (() => {
            const leftPct = Math.max(0, Math.min(100, fairnessLeftPct));
            const rightPct = Math.max(0, 100 - leftPct);
            // colors: left uses green if A is lower (A wins), red if A is higher (A loses) — keep intuitive
            const leftColor = totalA <= totalB ? "#064d3e" : "#ff6b6b";
            const rightColor = totalB <= totalA ? "#064d3e" : "#ff6b6b";

            return (
              <div className="w-full ">
                <div className="relative h-4 rounded-full overflow-hidden bg-[#06202b] border border-white/6">
                  <div
                    className="absolute left-0 top-0 bottom-0 transition-all"
                    style={{ width: `${leftPct}%`, background: `linear-gradient(90deg, ${leftColor})` }}
                    aria-hidden
                  />
                  <div
                    className="absolute right-0 top-0 bottom-0 transition-all"
                    style={{ width: `${rightPct}%`, background: `linear-gradient(90deg, ${rightColor})` }}
                    aria-hidden
                  />
                  {/* center overlay text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-[10px] text-white font-semibold">
                      {verdict.text} • Diff {formatBig(diff)} • {pct.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* legend */}
                <div className="mt-2 flex items-center justify-between text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: leftColor }} />
                    <span className="text-[10px]">A • {leftPct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: rightColor }} />
                    <span className="text-[10px]">B • {rightPct}%</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div
          className={`sm:px-4 sm:py-2 px-2 py-1 rounded-lg text-center text-xs sm:text-sm font-semibold`}
          style={{
            background:
              verdict.kind === "fair"
                ? "#7dd3fc"
                : verdict.kind === "lose"
                ? "#fecaca"
                : "#bbf7d0",
            color: verdict.kind === "fair" ? "#052e3f" : "#541114",
          }}
        >
          {verdict.text}
        </div>

        <div className="flex items-center gap-2">
          {!presentMode && (
            <button
              onClick={() => swapOffers()}
              className="px-2 py-1  text-sm bg-[#0f172a]/70 hover:bg-[#0f172a]/60 text-white border border-white/5 rounded-md"
            >
              Swap
            </button>
          )}

          <button
            onClick={() => setPresentMode((s) => !s)}
            className="px-2 py-1 text-sm rounded-md bg-[#6d28d9] hover:bg-[#7c3aed] text-white"
          >
            {presentMode ? "Exit Present" : "Present"}
          </button>
        </div>
      </div>
    </div>
  );

  /* MAIN RENDER */
  return (
    <div className="min-h-full p-2 sm:p-5 md:p-6">
      <div className=" mx-auto ">
        {ResultBanner}

        <div
          className={`grid gap-3 md:gap-6 items-start `}
          style={
            presentMode
              ? visibleSlotsCount > 6
                ? { gridTemplateColumns: "2fr 0px 2fr" }
                : undefined
              : visibleSlotsCount > 10
              ? { gridTemplateColumns: "1fr 0px 1fr" }
              : undefined
          }
        >
          {/* Left */}
          <div>
            <OfferGrid
              label="A"
              offerState={offerA}
              visibleSlotsCount={visibleSlotsCount}
              onOpenPicker={(slotId) => openPicker("A", slotId)}
              onRemove={(id) => removeA(id)}
              onQuickEdit={(slot) => openQuickEdit("A", slot)}
              setShekInput={setShekAInput}
              shekInput={shekAInput}
              finalizeShek={finalizeShekA}
              lookup={lookup}
              totalValue={totalA}
              shekNum={shekANum}
              presentMode={presentMode}
              openDetailSlotId={openDetailSlotId}
              setOpenDetailSlotId={setOpenDetailSlotId}
            />
          </div>

          {/* center compact verdict */}
          <div className="flex flex-col items-center justify-center h-full">
            <div
              className={`md:px-2 px-1 py-1 rounded-lg text-center text-[10px] md:text-sm font-semibold text-white`}
              // style={{
              //   background:
              //     verdict.kind === "fair"
              //       ? "#7dd3fc"
              //       : verdict.kind === "lose"
              //       ? "#fecaca"
              //       : "#bbf7d0",
              //   color: verdict.kind === "fair" ? "#052e3f" : "#541114",
              // }}
            >
             ~
            </div>
          </div>

          {/* Right */}
          <div className="w-full">
            <OfferGrid
              label="B"
              offerState={offerB}
              visibleSlotsCount={visibleSlotsCount}
              onOpenPicker={(slotId) => openPicker("B", slotId)}
              onRemove={(id) => removeB(id)}
              onQuickEdit={(slot) => openQuickEdit("B", slot)}
              setShekInput={setShekBInput}
              shekInput={shekBInput}
              finalizeShek={finalizeShekB}
              lookup={lookup}
              totalValue={totalB}
              shekNum={shekBNum}
              presentMode={presentMode}
              openDetailSlotId={openDetailSlotId}
              setOpenDetailSlotId={setOpenDetailSlotId}
            />
          </div>
        </div>

        {/* Controls row: hidden entirely in present mode */}
        {!presentMode && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
           
            <button
              onClick={resetOffers}
              className="px-2 py-1 text-sm rounded-md bg-[#ff6b6b] hover:bg-[#ff7b7b] text-white font-semibold"
            >
              Reset
            </button>
           
          </div>
        )}

        <div className="mt-4">
          {loadingPets && (
            <div className="text-xs text-slate-400">Loading pets…</div>
          )}
          {petsError && (
            <div className="text-xs text-rose-400">
              Pets load error: {petsError}
            </div>
          )}
        </div>
      </div>

      {/* Picker Modal */}
      {picker ? (
        <div className="fixed inset-0 top-20 bg-[#0000008f] z-5000 flex items-start md:items-center justify-center p-4 ">
          <div className="absolute inset-0 bg-black/60" onClick={closePicker} />
          <div className="relative z-10 w-full max-w-3xl bg-[#071226] rounded-lg border border-white/6 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-lg font-bold text-white">
                  {picker.slotId ? "Edit slot" : "Add pet"}
                </div>
                <div className="text-xs text-slate-400">
                  Search by name and click a pet to place it in the slot.
                </div>
              </div>
              <div>
                <button
                  onClick={closePicker}
                  className="px-3 py-1 rounded-md bg-[#ff6b6b] text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mb-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type pet name (e.g. Kitsune)"
                className="w-full rounded-md px-3 py-2 bg-[#0f172a]/40 border border-white/6 text-white text-sm"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[56vh] overflow-auto">
              {!filteredPetsMemo.length ? (
                <div className="text-sm text-slate-400 col-span-full p-4">
                  No pets match.
                </div>
              ) : (
                filteredPetsMemo.map((p) => (
                  <button
                    key={p.slug || p.petName}
                    onClick={() => pickPetToSlot(p.slug || makeSlug(p.petName))}
                    className="group flex flex-col items-center  p-2 bg-[#071226]/40 border border-white/6 rounded-md transition"
                    title={p.petName}
                  >
                    <div
                      className="w-13 h-13 rounded-md overflow-hidden bg-slate-700 flex items-center justify-center"
                      style={{ background: rarityToGradient(p.rarity) }}
                    >
                      <img
                        src={p.image || PLACEHOLDER}
                        alt={p.petName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="text-[10px] md:text-sm text-white font-semibold mt-2">
                      {p.petName}
                    </div>
                    <div className="text-[9px] md:text-xs text-slate-400">{p.rarity}</div>
                    <div className="text-[10px] md:text-xs text-[#43d8c9] font-bold">{formatBig(p.avgValue)}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Edit Modal (extended with age,sizeKg,mutation) */}
      {quickEdit.open && quickEdit.slot ? (
        <div className="fixed inset-0 top-20 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeQuickEdit}
          />
          <div className="relative z-10 w-full max-w-md bg-[#071226] rounded-lg border border-white/6 p-4">
            <div className="mb-3">
              <div className="text-lg font-bold text-white">Quick edit</div>
              <div className="text-xs text-slate-400">
                Set quantity, multiplier — and optional pet details (age, size, mutation). These details don't affect price.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300">Quantity</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={quickEdit.slot.qty || 1}
                  id="qe-qty"
                  className="w-full mt-1 rounded-md px-2 py-1 bg-[#0f172a]/40 border border-white/6 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Multiplier</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={quickEdit.slot.mult || 1}
                  id="qe-mult"
                  className="w-full mt-1 rounded-md px-2 py-1 bg-[#0f172a]/40 border border-white/6 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">Age</label>
                <input
                  type="number"
                  min="0"
                  defaultValue={quickEdit.slot.age ?? ""}
                  id="qe-age"
                  placeholder="years"
                  className="w-full mt-1 rounded-md px-2 py-1 bg-[#0f172a]/40 border border-white/6 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Size (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={quickEdit.slot.sizeKg ?? ""}
                  id="qe-size"
                  placeholder="kg"
                  className="w-full mt-1 rounded-md px-2 py-1 bg-[#0f172a]/40 border border-white/6 text-white text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-300">Mutation</label>
                <select
                  defaultValue={quickEdit.slot.mutation || "None"}
                  id="qe-mutation"
                  className="w-full mt-1 rounded-md px-2 py-1 bg-[#0f172a]/40 border border-white/6 text-white text-sm"
                >
                  <option value="None">None</option>
                  <option value="Albino">Albino</option>
                  <option value="Giant">Giant</option>
                  <option value="Tiny">Tiny</option>
                  <option value="Prismatic">Prismatic</option>
                  <option value="Shiny">Shiny</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={closeQuickEdit}
                className="px-3 py-1 rounded-md bg-[#0f172a] text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const qtyV = Number(document.getElementById("qe-qty")?.value || 1);
                  const multV = Number(document.getElementById("qe-mult")?.value || 1);
                  const ageV = document.getElementById("qe-age")?.value;
                  const sizeV = document.getElementById("qe-size")?.value;
                  const mutationV = document.getElementById("qe-mutation")?.value || "None";

                  const patch = {
                    qty: clamp(qtyV, 1),
                    mult: clamp(multV, 1),
                    age: ageV === "" ? null : Number(ageV),
                    sizeKg: sizeV === "" ? null : Number(sizeV),
                    mutation: mutationV || "None",
                  };
                  saveQuickEdit(patch);
                }}
                className="px-4 py-1 rounded-md bg-[#064d3e] text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
