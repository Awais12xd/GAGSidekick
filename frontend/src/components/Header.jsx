// Header.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Header (React + Tailwind, no framer-motion / no Next.js)
 * - copy into your project as Header.jsx
 * - expected Tailwind classes: bg-body, text-LightestSlate, bg-LightNavy, primary, etc.
 */

function HamburgerBtn({ isOpen, toggle }) {
  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="md:hidden flex items-end flex-col gap-2 cursor-pointer py-3 focus:outline-none z-500"
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

export default function Header() {
  const menu = [
    { title: "Trading Calculator", link: "trading-calculator" },
    // { title: "Features", link: "experience" },
    // { title: "Project", link: "project" },
    // { title: "Contact", link: "contact" },
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
    // small timeout to let menu start closing if you want; otherwise immediate
    setTimeout(() => scrollToId(link, -80), 60);
  };

  return (
    <header
      className={`${
        show ? "translate-y-0" : "-translate-y-full"
      } transform fixed top-0 left-0 w-full ${
        lastScrollY > 10 ? "shadow-xl py-4" : "py-6"
      } transition-all  duration-300 ease-in-out backdrop-filter backdrop-blur-md bg-[#0a192f] md:px-16 px-6 z-510`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-10 ">
        {/* Logo */}
        <Link
          to={"/"}
          role="button"
          tabIndex={0}
          className="shadow  text-[#64ffda] flex justify-center items-center transition-all duration-150 ease-linear cursor-pointer text-xl font-semibold  w-10 h-10 rounded whitespace-now pl-10 md:pl-0"
          onKeyDown={(e) => e.key === "Enter" && window.location.reload()}
          aria-label="Refresh page"
        >
          Garden <span className="text-white">Side.</span>
        </Link>

        {/* Desktop menu */}
        <nav className="md:flex hidden items-center gap-7">
          {menu.map((nav, index) => (
            <div key={index} className="cursor-pointer">
              <Link
                to={nav.link}
                className="text-LightestSlate text-[13px] flex items-center group hover:text-[#64ffda] transition-all duration-150 ease-linear bg-transparent border-0 p-0 cursor-pointer"
              >
                <span className="heading-num hover:text-[#64ffda] text-[#64ffda] transition-all duration-150 ease-linear mr-1 ">
                  0{index + 1}.
                </span>
                <span className="text-[#dde1ed] hover:text-[#64ffda]">{nav.title}</span>
              </Link>
            </div>
          ))}

          {/* <a href="#stock" >
            <button className="inline-flex items-center justify-center rounded-md px-3 py-2 ml-2 bg-primary text-[#64ffda] text-sm shadow-sm hover:opacity-95 border border-[#64ffda]">
              View Stock
            </button>
          </a> */}
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
          className={` md:hidden fixed top-0 right-0 h-screen w-72  transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } bg-[#0a192f] flex flex-col justify-center items-center gap-7 z-300`}
        >
          {menu.map((nav, index) => (
            <Link
            to={nav.link}
              key={index}
              onClick={() => handleNavClick(nav.link)}
              className="text-[#64ffda] text-[17px] flex items-center group hover:text-[#64ffda] transition-all duration-150 ease-linear bg-transparent border-0"
            >
              <span className="heading-num text-[#64ffda] mr-1 text-xs">0{index + 1}.</span>
             <span className="text-gray-300"> {nav.title}</span>
            </Link>
          ))}

          {/* <a href="/files/resume.pdf" download className="mt-3">
            <button className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-[#64ffda] shadow-sm hover:opacity-95">
              Resume
            </button>
          </a> */}
        </div>

        {/* Hamburger */}
        <HamburgerBtn isOpen={isOpen} toggle={toggleMenu} />
      </div>
    </header>
  );
}
