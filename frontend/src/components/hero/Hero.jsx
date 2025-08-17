// Hero.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import "./hero.css";

/*
  This file is the same Hero component you provided with a focused improvement
  to the text block: a subtle backdrop for readability, a bold gradient title
  using #64ffda, responsive sizing, and mobile-friendly spacing.

  Replace your existing Hero.jsx with this file and merge/append the
  accompanying CSS (below) into your hero.css.
*/

const baseItems = [
  {
    id: "egg1",
    src: "https://api.joshlei.com/v2/growagarden/image/levelup_lollipop",
    size: 92,
    delay: 0,
    dur: 4200,
  },
  {
    id: "seed1",
    src: "https://api.joshlei.com/v2/growagarden/image/grandmaster_sprinkler",
    size: 68,
    delay: 200,
    dur: 5200,
  },
  {
    id: "gear1",
    src: "https://api.joshlei.com/v2/growagarden/image/bug_egg",
    size: 74,
    delay: 400,
    dur: 4600,
  },
  {
    id: "cos1",
    src: "https://api.joshlei.com/v2/growagarden/image/burning_bud",
    size: 56,
    delay: 600,
    dur: 5000,
  },
  {
    id: "egg2",
    src: "https://api.joshlei.com/v2/growagarden/image/kitsune",
    size: 96,
    delay: 800,
    dur: 4800,
  },
  {
    id: "seed2",
    src: "https://api.joshlei.com/v2/growagarden/image/red_fox",
    size: 62,
    delay: 1000,
    dur: 5400,
  },
  {
    id: "gear2",
    src: "https://api.joshlei.com/v2/growagarden/image/queen_bee",
    size: 78,
    delay: 1200,
    dur: 4700,
  },
  {
    id: "cos2",
    src: "https://api.joshlei.com/v2/growagarden/image/mimic_octopus",
    size: 70,
    delay: 1400,
    dur: 5200,
  },
  {
    id: "egg3",
    src: "https://api.joshlei.com/v2/growagarden/image/carrot",
    size: 82,
    delay: 1600,
    dur: 4600,
  },
  {
    id: "seed3",
    src: "https://api.joshlei.com/v2/growagarden/image/bone_blossom",
    size: 58,
    delay: 1800,
    dur: 5000,
  },
  {
    id: "gear3",
    src: "https://api.joshlei.com/v2/growagarden/image/candy_blossom",
    size: 72,
    delay: 2000,
    dur: 4800,
  },
  {
    id: "cos3",
    src: "https://api.joshlei.com/v2/growagarden/image/t-rex",
    size: 66,
    delay: 2200,
    dur: 5200,
  },
];

const desktopLayout = [
  { top: "14%", left: "18%", layer: "back" },
  { top: "10%", left: "70%", layer: "mid" },
  { top: "56%", left: "12%", layer: "mid" },
  { top: "44%", left: "82%", layer: "front" },
  { top: "30%", left: "46%", layer: "back" },
  { top: "8%", left: "58%", layer: "back" },
  { top: "72%", left: "68%", layer: "mid" },
  { top: "54%", left: "34%", layer: "mid" },
  { top: "36%", left: "8%", layer: "front" },
  { top: "62%", left: "24%", layer: "back" },
  { top: "22%", left: "86%", layer: "front" },
  { top: "78%", left: "48%", layer: "back" },
];

const mobileLayout = [
  { top: "8%", left: "8%", layer: "back" },
  { top: "6%", left: "70%", layer: "mid" },
  { top: "46%", left: "8%", layer: "mid" },
  { top: "40%", left: "82%", layer: "front" },
  { top: "28%", left: "44%", layer: "back" },
  { top: "10%", left: "56%", layer: "back" },
  { top: "72%", left: "66%", layer: "mid" },
  { top: "50%", left: "30%", layer: "mid" },
  { top: "34%", left: "12%", layer: "front" },
  { top: "68%", left: "20%", layer: "back" },
  { top: "18%", left: "86%", layer: "front" },
  { top: "86%", left: "48%", layer: "back" },
];

const layerZ = { back: 20, mid: 40, front: 80 };

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

  useEffect(() => {
    let mounted = true;
    const loaders = [];

    baseItems.forEach((it) => {
      setImagesLoaded((prev) => {
        if (prev[it.id]) return prev;
        return prev;
      });

      const img = new Image();
      const onLoad = () => {
        if (!mounted) return;
        setImagesLoaded((prev) => {
          if (prev[it.id]) return prev;
          return { ...prev, [it.id]: true };
        });
      };
      const onErr = () => {
        if (!mounted) return;
        setImagesLoaded((prev) => {
          if (prev[it.id]) return prev;
          return { ...prev, [it.id]: true };
        });
      };

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onErr);
      img.src = it.src;
      loaders.push({ img, onLoad, onErr });
    });

    return () => {
      mounted = false;
      loaders.forEach(({ img, onLoad, onErr }) => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onErr);
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
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerHeightRef.current}px`
      );
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
    <section
      id="home"
      className="w-full relative bg-[#0a192f] text-text min-h-screen h-[600px] flex items-center justify-center "
    >
      <div className=" relative w-full px-6 flex items-center justify-center bg-[#0a192f]">
        {/* ===== enhanced text block ===== */}
        <div className="z-50 text-center px-6 max-w-2xl hero-text-block bg-[#64ffda] bg-opacity-90">
          <p className="uppercase text-[10px] sm:text-sm  tracking-widest mb-2 hero-pretitle text-gray-500">
            Greetings — It's
          </p>

          {/* gradient-title applied here. responsive sizing handled in CSS via clamp + tailwind fallback */}
          <h1 className="text-4xl md:text-6xl font-bold text-[#64ffda]">
            Garden Side
          </h1>

          <p className="mt-6 text-muted !text-[12px] sm:text-[15px] leading-relaxed hero-description">
            Where you can see live <strong>stock</strong> info for eggs, seeds,
            gears and cosmetics, get real-time <strong>weather</strong> and{" "}
            <strong>traveling-merchant</strong> updates, and use our in-app{" "}
            <strong>Trading Calculator</strong> to instantly check whether a
            trade is fair. Fast, simple, and built for players who want to trade
            with confidence.
          </p>

          <div className="mt-6 flex gap-3 justify-center">
            <a href="#stock">
              <button
                onClick={() => scrollToId("contact")}
                className="sm:px-4 sm:py-2 px-2 py-1 rounded-md bg-[#64ffda] text-midnight font-semibold shadow-accent-lg cursor-pointer sm:text-base text-xs"
              >
                View Stock
              </button>
            </a>
            {/* <button onClick={() => scrollToId("stock")} className="px-4 py-2 rounded-md bg-transparent border border-white/6 text-text">View Stock</button> */}
          </div>
        </div>

        {/* ===== floating canvas (kept as-is) ===== */}
        <div
          className="floating-canvas-centered h-full"
          ref={canvasRef}
          aria-hidden
        >
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />

          {baseItems.map((it, i) => {
            const pos = positions[i] || {
              top: "50%",
              left: "50%",
              layer: "mid",
            };
            const loaded = !!imagesLoaded[it.id];
            const visible = reveal && loaded;
            const transitionDelay = `${Math.min(600, 60 + i * 60)}ms`;
            const animStyle = reduceMotion
              ? { animationName: "none", animationDuration: "0ms" }
              : {
                  animationDelay: `${it.delay}ms`,
                  animationDuration: `${it.dur}ms`,
                };
            const z = layerZ[pos.layer];

            return (
              <div
                key={it.id}
                className="floating-item pointer-events-none"
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: `${it.size}px`,
                  height: `${it.size}px`,
                  transform: visible
                    ? "translate(-50%,-50%) scale(1)"
                    : "translate(-50%,-50%) scale(0.94)",
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
                  onLoad={() =>
                    setImagesLoaded((prev) =>
                      prev[it.id] ? prev : { ...prev, [it.id]: true }
                    )
                  }
                  className="w-full h-full object-contain rounded-md drop-shadow-2xl"
                  loading="lazy"
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
