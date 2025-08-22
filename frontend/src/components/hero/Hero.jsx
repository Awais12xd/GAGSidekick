// Hero.jsx (optimized image loading - drop in replacement)
import React, { useEffect, useRef, useState, useCallback } from "react";
import "./hero.css";

/* ---------- Throttled JS preloader (no <link rel=preload> to avoid warnings) ---------- */
const imagePreloadCache = new Map();
const preloadQueue = [];
let activePreloads = 0;
const MAX_CONCURRENT_PRELOADS = 6;

function _startNextPreload() {
  if (activePreloads >= MAX_CONCURRENT_PRELOADS) return;
  const next = preloadQueue.shift();
  if (!next) return;
  activePreloads++;
  const { url, resolve, reject } = next;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.referrerPolicy = "no-referrer";
  img.decoding = "async";
  img.onload = () => {
    activePreloads--;
    imagePreloadCache.set(url, Promise.resolve(true));
    resolve(true);
    _startNextPreload();
  };
  img.onerror = () => {
    activePreloads--;
    imagePreloadCache.set(url, Promise.reject(new Error("image preload failed")));
    reject(new Error("image preload failed"));
    _startNextPreload();
  };
  img.src = url;
}

function preloadImage(url) {
  if (!url) return Promise.resolve(false);
  const existing = imagePreloadCache.get(url);
  if (existing) return existing;
  const p = new Promise((resolve, reject) => {
    preloadQueue.push({ url, resolve, reject });
    _startNextPreload();
  });
  imagePreloadCache.set(url, p);
  return p;
}

function preloadImages(urls = [], limit = 40) {
  if (!Array.isArray(urls) || urls.length === 0) return Promise.resolve([]);
  const slice = urls.slice(0, limit);
  return Promise.allSettled(slice.map((u) => preloadImage(u)));
}

/* ---------- your existing data and helpers (kept intact) ---------- */
const baseItems = [
  { id: "egg1", src: "https://api.joshlei.com/v2/growagarden/image/levelup_lollipop", size: 92, delay: 0, dur: 4200 },
  { id: "seed1", src: "https://api.joshlei.com/v2/growagarden/image/grandmaster_sprinkler", size: 68, delay: 200, dur: 5200 },
  { id: "gear1", src: "https://api.joshlei.com/v2/growagarden/image/bug_egg", size: 74, delay: 400, dur: 4600 },
  { id: "cos1", src: "https://api.joshlei.com/v2/growagarden/image/burning_bud", size: 56, delay: 600, dur: 5000 },
  { id: "egg2", src: "https://api.joshlei.com/v2/growagarden/image/kitsune", size: 96, delay: 800, dur: 4800 },
  { id: "seed2", src: "https://api.joshlei.com/v2/growagarden/image/red_fox", size: 62, delay: 1000, dur: 5400 },
  { id: "gear2", src: "https://api.joshlei.com/v2/growagarden/image/queen_bee", size: 78, delay: 1200, dur: 4700 },
  { id: "cos2", src: "https://api.joshlei.com/v2/growagarden/image/mimic_octopus", size: 70, delay: 1400, dur: 5200 },
  { id: "egg3", src: "https://api.joshlei.com/v2/growagarden/image/carrot", size: 82, delay: 1600, dur: 4600 },
  { id: "seed3", src: "https://api.joshlei.com/v2/growagarden/image/bone_blossom", size: 58, delay: 1800, dur: 5000 },
  { id: "gear3", src: "https://api.joshlei.com/v2/growagarden/image/candy_blossom", size: 72, delay: 2000, dur: 4800 },
  { id: "cos3", src: "https://api.joshlei.com/v2/growagarden/image/t-rex", size: 66, delay: 2200, dur: 5200 },
];

const desktopLayout = [ /* unchanged */ 
  { top: "14%", left: "18%", layer: "back" }, { top: "10%", left: "70%", layer: "mid" }, { top: "56%", left: "12%", layer: "mid" },
  { top: "44%", left: "82%", layer: "front" }, { top: "30%", left: "46%", layer: "back" }, { top: "8%", left: "58%", layer: "back" },
  { top: "72%", left: "68%", layer: "mid" }, { top: "54%", left: "34%", layer: "mid" }, { top: "36%", left: "8%", layer: "front" },
  { top: "62%", left: "24%", layer: "back" }, { top: "22%", left: "86%", layer: "front" }, { top: "78%", left: "48%", layer: "back" }
];

const mobileLayout = [ /* unchanged */
  { top: "8%", left: "8%", layer: "back" }, { top: "6%", left: "70%", layer: "mid" }, { top: "46%", left: "8%", layer: "mid" },
  { top: "40%", left: "82%", layer: "front" }, { top: "28%", left: "44%", layer: "back" }, { top: "10%", left: "56%", layer: "back" },
  { top: "72%", left: "66%", layer: "mid" }, { top: "50%", left: "30%", layer: "mid" }, { top: "34%", left: "12%", layer: "front" },
  { top: "68%", left: "20%", layer: "back" }, { top: "18%", left: "86%", layer: "front" }, { top: "86%", left: "48%", layer: "back" }
];

const layerZ = { back: 20, mid: 40, front: 80 };

/* ---------- component ---------- */
export default function Hero() {
  const canvasRef = useRef(null);
  const [layout, setLayout] = useState("desktop");
  const [imagesLoaded, setImagesLoaded] = useState(() => {
    const map = {};
    baseItems.forEach((it) => (map[it.id] = false));
    return map;
  });
  const [reveal, setReveal] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const headerHeightRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const setFromMq = () => setReduceMotion(!!mq?.matches);
    setFromMq();
    mq?.addEventListener?.("change", setFromMq);
    return () => mq?.removeEventListener?.("change", setFromMq);
  }, []);

  useEffect(() => {
    const chooseLayout = () => {
      const w = window.innerWidth;
      setLayout(w <= 900 ? "mobile" : "desktop");
      setReveal(false);
      requestAnimationFrame(() => {
        setTimeout(() => setReveal(true), 60);
      });
    };

    chooseLayout();
    window.addEventListener("resize", chooseLayout);
    return () => window.removeEventListener("resize", chooseLayout);
  }, []);

  /* ---------- improved preloading strategy ---------- */
  useEffect(() => {
    let mounted = true;

    // Build urls list; only top-priority images preloaded with higher concurrency
    const allUrls = baseItems.map((it) => it.src);
    // Preload the first N as high-priority (above-the-fold)
    const PREFETCH_FIRST = Math.min(8, allUrls.length);
    const highPriority = allUrls.slice(0, PREFETCH_FIRST);
    const rest = allUrls.slice(PREFETCH_FIRST);

    // preload high priority first (smaller concurrency cap so network isn't flooded)
    preloadImages(highPriority, 12)
      .catch(() => {})
      .finally(() => {
        // preload remaining with normal concurrency in background
        if (!mounted) return;
        preloadImages(rest, 40).catch(() => {});
      });

    // also listen for individual image load events for reveal (keeps your existing reveal logic)
    const loaders = [];
    baseItems.forEach((it) => {
      // if already cached by our preloader promise, mark as loaded quickly
      const cached = imagePreloadCache.get(it.src);
      if (cached && cached instanceof Promise) {
        cached
          .then(() => {
            if (!mounted) return;
            setImagesLoaded((prev) => (prev[it.id] ? prev : { ...prev, [it.id]: true }));
          })
          .catch(() => {});
      } else {
        // fallback — attach a one-off Image() listener (safe)
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.referrerPolicy = "no-referrer";
        img.decoding = "async";
        const onLoad = () => {
          if (!mounted) return;
          setImagesLoaded((prev) => (prev[it.id] ? prev : { ...prev, [it.id]: true }));
        };
        const onErr = () => {
          if (!mounted) return;
          setImagesLoaded((prev) => (prev[it.id] ? prev : { ...prev, [it.id]: true }));
        };
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onErr, { once: true });
        img.src = it.src;
        loaders.push({ img, onLoad, onErr });
      }
    });

    return () => {
      mounted = false;
      loaders.forEach(({ img, onLoad, onErr }) => {
        try {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onErr);
        } catch (e) {}
      });
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setReveal(true);
      return;
    }
    const anyLoaded = Object.values(imagesLoaded).some(Boolean);
    if (anyLoaded) {
      const t = setTimeout(() => setReveal(true), 60);
      return () => clearTimeout(t);
    }
  }, [imagesLoaded, reduceMotion]);

  useEffect(() => {
    const computeHeaderHeight = () => {
      const header = document.querySelector("header");
      const h = header ? header.getBoundingClientRect().height : 0;
      headerHeightRef.current = Math.round(h);
      document.documentElement.style.setProperty("--header-height", `${headerHeightRef.current}px`);
    };
    computeHeaderHeight();
    window.addEventListener("resize", computeHeaderHeight);
    return () => window.removeEventListener("resize", computeHeaderHeight);
  }, []);

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    const headerOffset = headerHeightRef.current || 0;
    if (el) {
      const rect = el.getBoundingClientRect();
      const absoluteY = rect.top + window.pageYOffset;
      const target = Math.max(absoluteY - headerOffset - 8, 0);
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }, []);

  const positions = layout === "desktop" ? desktopLayout : mobileLayout;

  return (
    <section id="home" className="w-full relative bg-[#0a192f] text-text min-h-screen h-[600px] flex items-center justify-center ">
      <div className=" relative w-full px-6 flex items-center justify-center bg-[#0a192f]">
        {/* ===== enhanced text block ===== */}
        <div className="z-50 text-center px-6 max-w-2xl hero-text-block bg-[#64ffda] bg-opacity-90">
          <p className="uppercase text-[10px] sm:text-sm  tracking-widest mb-2 hero-pretitle text-gray-500">Greetings — It's</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[#64ffda]">Garden Side</h1>
          <p className="mt-6 text-muted !text-[12px] sm:text-[15px] leading-relaxed hero-description">
            Where you can see live <strong>stock</strong> info for eggs, seeds, gears and cosmetics, get real-time <strong>weather</strong> and{" "}
            <strong>traveling-merchant</strong> updates, and use our in-app <strong>Trading Calculator</strong> to instantly check whether a trade is fair. Fast, simple, and built for players who want to trade with confidence.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <a href="#stock">
              <button onClick={() => scrollToId("contact")} className="sm:px-4 sm:py-2 px-2 py-1 rounded-md bg-[#64ffda] text-midnight font-semibold shadow-accent-lg cursor-pointer sm:text-base text-xs">
                View Stock
              </button>
            </a>
          </div>
        </div>

        {/* ===== floating canvas (kept as-is) ===== */}
        <div className="floating-canvas-centered h-full" ref={canvasRef} aria-hidden>
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />

          {baseItems.map((it, i) => {
            const pos = positions[i] || { top: "50%", left: "50%", layer: "mid" };
            const loaded = !!imagesLoaded[it.id];
            const visible = reveal && loaded;
            const transitionDelay = `${Math.min(600, 60 + i * 60)}ms`;
            const animStyle = reduceMotion ? { animationName: "none", animationDuration: "0ms" } : { animationDelay: `${it.delay}ms`, animationDuration: `${it.dur}ms` };
            const z = layerZ[pos.layer];

            // IMPORTANT: above-fold visible images get eager + high priority, others lazy
            const loadingAttr = visible ? "eager" : "lazy";
            const fetchPriority = visible ? "high" : "low";

            return (
              <div
                key={it.id}
                className="floating-item pointer-events-none"
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: `${it.size}px`,
                  height: `${it.size}px`,
                  transform: visible ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.94)",
                  opacity: visible ? 1 : 0,
                  transition: `opacity 420ms ease ${transitionDelay}, transform 520ms cubic-bezier(.2,.95,.18,1) ${transitionDelay}`,
                  zIndex: z,
                  ...animStyle,
                }}
                aria-hidden
              >
                <img
                  src={it.src}
                  alt=""
                  onLoad={() => setImagesLoaded((prev) => (prev[it.id] ? prev : { ...prev, [it.id]: true }))}
                  className="w-full h-full object-contain rounded-md drop-shadow-2xl"
                  loading={loadingAttr}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  width={it.size}
                  height={it.size}
                  fetchPriority={fetchPriority}
                  style={{ display: "block" }}
                />
                <span className="item-halo" aria-hidden />
              </div>
            );
          })}

          <div className="foreground-vignette" aria-hidden />
        </div>
      </div>
    </section>
  );
}
