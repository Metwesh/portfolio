import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { navLinks } from "../constants";

export function Header() {
  const [headerBg, setHeaderBg] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let ticking = false;
    // Only close menu if user scrolls after menu is already open
    let lastScrollY = window.scrollY;
    const updateScroll = () => {
      setHeaderBg(window.scrollY > 8);
      ticking = false;
      if (menuOpen && window.scrollY !== lastScrollY) setMenuOpen(false);
      lastScrollY = window.scrollY;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, {
      signal: controller.signal,
    });
    updateScroll();
    return () => controller.abort();
  }, [menuOpen]);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      // Focus trap for accessibility
      // const navOverlay = document.getElementById("mobile-nav-overlay");
      // if (navOverlay) navOverlay.click();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on nav click (mobile)
  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={`pointer-events-auto fixed top-0 left-0 z-40 flex w-full items-center justify-between px-4 py-4 transition-all duration-500 md:px-8 ${
        headerBg
          ? "bg-gradient-to-b from-black/80 to-black/0 shadow-lg backdrop-blur-md"
          : "backdrop-blur-0 bg-transparent shadow-none"
      }`}
      style={{
        WebkitBackdropFilter: headerBg ? "blur(12px)" : "none",
        backdropFilter: headerBg ? "blur(12px)" : "none",
      }}
    >
      <a className="group flex items-center gap-4" href="#" aria-label="Home">
        <svg
          viewBox="0 0 478 478"
          fill="none"
          className="h-10 w-10 drop-shadow-lg"
        >
          <path
            d="M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z"
            fill="#00D3F2"
          />
        </svg>
        <span className="animate-gradient-x bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent drop-shadow-lg md:text-3xl">
          Mohamed H. Aly
        </span>
      </a>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 right-4 flex h-10 w-10 flex-col items-center justify-center shadow-lg md:hidden"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span
          className={`block h-0.5 w-7 rounded bg-white transition-all duration-300 ${
            menuOpen ? "translate-y-1.5 rotate-45" : ""
          }`}
        />
        <span
          className={`my-1 block h-0.5 w-7 rounded bg-white transition-all duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-7 rounded bg-white transition-all duration-300 ${
            menuOpen ? "-translate-y-1.5 -rotate-45" : ""
          } }`}
        />
      </button>
      {/* Desktop nav */}
      <nav className="hidden gap-6 text-lg font-semibold md:flex">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-cyan-400 max-lg:text-base"
          >
            {link.label}
          </a>
        ))}
      </nav>
      {/* Mobile nav overlay as portal, always mounted for animation */}
      {createPortal(
        <div
          aria-modal="true"
          // id="mobile-nav-overlay"
          // tabIndex={0}
          role="dialog"
          className={`fixed inset-0 z-10 flex h-screen w-screen flex-col items-center justify-center gap-10 bg-black/80 text-2xl font-bold text-white backdrop-blur-xl transition-all duration-500 md:hidden ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          } `}
          style={{ transitionProperty: "opacity, transform" }}
        >
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className={`focus:ring-none focus rounded transition-all duration-500 hover:text-cyan-400 focus:text-cyan-400 focus:outline-none ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: menuOpen ? `${index * 80 + 120}ms` : "0ms",
              }}
              tabIndex={menuOpen ? 0 : -1}
              id={index === 0 ? "mobile-nav-first-link" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>,
        document.body,
      )}
    </header>
  );
}
