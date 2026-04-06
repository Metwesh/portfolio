import { refractive } from "@hashintel/refractive";
import { useCallback, useEffect, useRef, useState } from "react";
import { ANIMATION_CONFIG, navLinks } from "../constants";
import { cn } from "../lib/utils";
import { MobileMenu } from "./MobileMenu";

export function Header({ scrollY }: { scrollY: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Derive header background state from scrollY instead of using effect
  const headerBg = scrollY > ANIMATION_CONFIG.HEADER_VISIBLE_THRESHOLD;

  const handleMenuOpen = () => {
    setMenuOpen((prev) => !prev);
  };

  // Close menu on nav click (mobile) and restore focus
  const handleNavClick = useCallback(() => {
    setMenuOpen(false);
    // Restore focus to menu button for better keyboard navigation
    setTimeout(() => menuButtonRef.current?.focus(), 100);
  }, []);

  // Handle body scroll lock/unlock as a side effect
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && menuOpen) {
        handleNavClick();
      }
    };
    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [menuOpen, handleNavClick]);

  return (
    <header className="pointer-events-auto fixed top-gutter right-gutter left-gutter z-40 flex items-center justify-between rounded-2xl px-4 py-3 md:px-6">
      <refractive.div
        className="absolute inset-0"
        refraction={{
          radius: 16,
          blur: 4,
          bezelWidth: 16,
        }}
      />
      <div className="relative z-40 flex items-center justify-between max-md:w-full">
        <a className="group flex items-center gap-4" href="#" aria-label="Home">
          <svg
            viewBox="0 0 478 478"
            fill="none"
            className="h-10 w-10 drop-shadow-lg"
            aria-hidden="true"
          >
            <path
              d="M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z"
              fill="#00D3F2"
            />
          </svg>
          <span
            className={cn(
              "bg-linear-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text font-extrabold text-2xl text-transparent tracking-tight drop-shadow-lg transition-opacity delay-1000 duration-1000 group-focus-visible:opacity-100 group-focus-visible:delay-0 group-focus-visible:duration-300 md:text-3xl",
              headerBg ? "opacity-100" : "opacity-0",
            )}
          >
            Mohamed H. Aly
          </span>
        </a>
        {/* Hamburger for mobile */}
        <button
          type="button"
          ref={menuButtonRef}
          className="flex size-10 flex-col items-center justify-center md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={handleMenuOpen}
        >
          <span
            className={cn(
              "block h-0.5 w-7 rounded bg-white transition-all duration-300",
              menuOpen ? "translate-y-1.5 rotate-45" : "",
            )}
          />
          <span
            className={cn(
              "my-1 block h-0.5 w-7 rounded bg-white transition-all duration-300",
              menuOpen ? "opacity-0" : "",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-7 rounded bg-white transition-all duration-300",
              menuOpen ? "-translate-y-1.5 -rotate-45" : "",
            )}
          />
        </button>
      </div>
      {/* Desktop nav */}
      <nav className="relative z-40 hidden gap-6 font-semibold text-lg md:flex">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-offset-2 max-lg:text-base"
          >
            {link.label}
          </a>
        ))}
      </nav>
      {/* Mobile nav overlay as portal, always mounted for animation */}
      <MobileMenu isOpen={menuOpen} onNavClick={handleNavClick} />
    </header>
  );
}
