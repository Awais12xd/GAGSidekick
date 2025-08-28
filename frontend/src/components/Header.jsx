// Header.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Header (React + Tailwind)
 * - shows improved nav tag badges (New / Hot / etc.) matching your palette
 * - copy into your project as Header.jsx (replaces the previous file)
 */

/* palette used across (kept inline to avoid extra imports) */
const PALETTE = {
  bg: "#0a192f",
  primary: "#64ffda",
  slate: "#8892b0",
  lightest: "#ccd6f6",
  cardBorder: "#102a3a",
};

/* ---------------- NavTag component ----------------
   Props:
     - text: string (e.g. "New", "Hot")
     - variant (optional): "auto" (default) | "custom"
     - color (optional if variant === "custom"): CSS color string
   Behavior:
     - if variant === "auto" we pick a palette based on text (new/hot/beta/sale/feature)
     - otherwise uses color prop background
*/
function NavTag({ text, variant = "auto", color }) {
  const lower = (text || "").toLowerCase();

  // default style generator for common tag words
  function pickStyle() {
    if (variant === "custom" && color) {
      return {
        background: color,
        color: "#001219",
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      };
    }

    if (lower.includes("hot") || lower.includes("🔥")) {
      return {
        // warm orange-red
        background: "linear-gradient(90deg,#ff7a59,#ff4d6d)",
        color: "#fff",
        boxShadow: "0 6px 18px rgba(255,77,109,0.12)",
      };
    }
    if (lower.includes("new") || lower.includes("✨")) {
      return {
        // your primary teal
        background: "linear-gradient(90deg, rgba(100,255,218,1), rgba(159,183,255,0.65))",
        color: "#001219",
        boxShadow: "0 6px 18px rgba(100,255,218,0.08)",
      };
    }
    if (lower.includes("beta") || lower.includes("preview")) {
      return {
        background: "linear-gradient(90deg,#9f9bff,#b6a6ff)",
        color: "#071217",
        boxShadow: "0 6px 18px rgba(155,140,255,0.08)",
      };
    }
    if (lower.includes("sale") || lower.includes("%")) {
      return {
        background: "linear-gradient(90deg,#ffd166,#ffb84d)",
        color: "#071217",
        boxShadow: "0 6px 18px rgba(255,184,77,0.08)",
      };
    }
    // fallback: soft slate-blue
    return {
      background: "linear-gradient(90deg,#9fb7ff,#a7d5ff)",
      color: "#071217",
      boxShadow: "0 6px 18px rgba(159,183,255,0.06)",
    };
  }

  const style = pickStyle();

  return (
    <span
      aria-hidden={false}
      role="status"
      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transform transition-transform duration-150 ease-out select-none"
      style={{
        ...style,
        // slightly lift and scale to draw attention when hovered
      }}
      title={text}
    >
      <span className="leading-none" style={{ fontSize: 10, opacity: 0.95 }}>
        {text}
      </span>
    </span>
  );
}

/* ---------------- Hamburger button ---------------- */
function HamburgerBtn({ isOpen, toggle }) {
  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="md:hidden flex items-end flex-col gap-2 cursor-pointer py-3 focus:outline-none z-50"
    >
      <span
        className={`block h-0.5 rounded-md bg-[#64ffda] transform transition-all duration-200 ${
          isOpen ? "w-8 rotate-45 translate-y-1.5" : "w-9 rotate-0"
        }`}
      />
      <span
        className={`block h-0.5 rounded-md bg-[#64ffda] transition-opacity duration-150 ${
          isOpen ? "opacity-0" : "opacity-100 w-[30px]"
        }`}
      />
      <span
        className={`block h-0.5 rounded-md bg-[#64ffda] transform transition-all duration-200 ${
          isOpen ? "w-8 -rotate-45 -translate-y-1.5" : "w-[25px] rotate-0"
        }`}
      />
    </button>
  );
}

/* ---------------- Header ---------------- */
export default function Header() {
  const menu = [
    { title: "Trading Calculator", link: "trading-calculator", tag: "" },
    { title: "Beanstalk Update", link: "beanstalk-update-part2", tag: "New" },
    // add future nav entries like:
    // { title: "Hot Deals", link: "deals", tag: "Hot" },
  ];

  const [lastScrollY, setLastScrollY] = useState(0);
  const [show, setShow] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // prevent frequent re-renders due to scroll
  const rafRef = useRef(null);

  useEffect(() => {
    const controlNavbar = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (currentY > lastScrollY && currentY > 20) {
          setShow(false);
        } else {
          setShow(true);
        }
        setLastScrollY(currentY);
      });
    };

    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => {
      window.removeEventListener("scroll", controlNavbar);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [lastScrollY]);

  // lock body scroll when mobile menu open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  const toggleMenu = useCallback(() => setIsOpen((s) => !s), []);

  // simple smooth scroll to id with offset
  const scrollToId = useCallback((id, offset = -80) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const targetY = window.pageYOffset + rect.top + offset;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);

  // close menu on navigation (mobile)
  const handleNavClick = (link) => {
    toggleMenu();
    setTimeout(() => scrollToId(link, -80), 60);
  };

  return (
    <header
      className={`${
        show ? "translate-y-0" : "-translate-y-full"
      } transform fixed top-0 left-0 w-full ${
        lastScrollY > 10 ? "shadow-xl py-4" : "py-6"
      } transition-all duration-300 ease-in-out backdrop-filter backdrop-blur-md bg-[#0a192f] md:px-16 px-6 z-500`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-10">
        {/* Logo */}
        <Link
          to={"/"}
          role="button"
          tabIndex={0}
          className="shadow text-[#64ffda] flex justify-center items-center transition-all duration-150 ease-linear cursor-pointer text-xl md:text-3xl font-semibold"
          onKeyDown={(e) => e.key === "Enter" && window.location.reload()}
          aria-label="Refresh page"
        >
          Garden <span className="text-white">Side.</span>
        </Link>

        {/* Desktop menu */}
        <nav className="md:flex hidden items-center gap-7">
          {menu.map((nav, index) => (
            <div key={index} className="cursor-pointer flex items-center">
              <Link
                to={nav.link}
                className="text-LightestSlate relative text-[13px] flex items-center group hover:text-[#64ffda] transition-all duration-150 ease-linear bg-transparent border-0 p-0 cursor-pointer font-semibold"
                aria-label={nav.title}
              >
                <span className="heading-num text-[#64ffda] transition-all duration-150 ease-linear mr-1 text-[13px]">
                  0{index + 1}.
                </span>
                <span className="text-[#dde1ed] hover:text-[#64ffda]">{nav.title}</span>

                {/* render tag (if present) */}
                {/* {nav.tag ? (
                 <span className="absolute -right-2 bottom-2"> <NavTag text={nav.tag} /></span>
                ) : null} */}
              </Link>
            </div>
          ))}
        </nav>

        {/* Mobile overlay */}
        {isOpen && (
          <div
            onClick={toggleMenu}
            className="md:hidden block h-screen bg-black/30 w-full fixed top-0 left-0 z-40"
            aria-hidden
          />
        )}

        {/* Mobile slide-in panel */}
        <div
          className={`md:hidden fixed top-0 right-0 h-screen w-72 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } bg-[#0a192f] flex flex-col justify-center items-center gap-7 z-50`}
        >
          {menu.map((nav, index) => (
            <Link
              to={nav.link}
              key={index}
              onClick={() => handleNavClick(nav.link)}
              className="text-[#64ffda] text-[17px] flex items-center group hover:text-[#64ffda] transition-all duration-150 ease-linear z-10000"
            >
              <span className="heading-num text-[#64ffda] mr-2 text-xs ">0{index + 1}.</span>
              <span className="text-gray-300 mr-2">{nav.title}</span>
              {nav.tag ? <NavTag text={nav.tag} /> : null}
            </Link>
          ))}
        </div>

        {/* Hamburger */}
        <HamburgerBtn isOpen={isOpen} toggle={toggleMenu} />
      </div>
    </header>
  );
}
