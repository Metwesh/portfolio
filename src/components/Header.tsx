import { refractive } from "@hashintel/refractive";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ANIMATION_CONFIG } from "../constants/animations";
import { LOGO_GRADIENT_STOPS, LOGO_PATH, NAV_LINKS } from "../constants/misc";
import { cn } from "../lib/utils";
import { MobileMenu } from "./MobileMenu";

// Safari (desktop + all iOS browsers via WebKit) accepts backdrop-filter:url()
// as valid CSS but doesn't render SVG filters — @supports is an unreliable false positive.
// navigator.vendor === "Apple Computer, Inc." reliably identifies all WebKit engines.
const supportsRefractive =
  typeof window !== "undefined" &&
  typeof CSS !== "undefined" &&
  CSS.supports("backdrop-filter", "url(#x)") &&
  navigator.vendor !== "Apple Computer, Inc.";

function HeaderShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  if (supportsRefractive) {
    return (
      <refractive.header
        className={className}
        refraction={{ radius: 16, blur: 4, bezelWidth: 16 }}
      >
        {children}
      </refractive.header>
    );
  }
  return <header className={className}>{children}</header>;
}

export const Header = memo(({ scrollY }: { scrollY: number }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const headerBg = scrollY > ANIMATION_CONFIG.HEADER_VISIBLE_THRESHOLD;

  // Scroll-spy: highlight whichever nav section's top has crossed the
  // "active" line near the top of the viewport. Piggybacks on the scrollY
  // updates Header already re-renders on (throttled upstream to >20px).
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollY is only a re-run trigger, the effect reads live DOM rects instead of the value itself
  useEffect(() => {
    const threshold = window.innerHeight * 0.35;
    let current: string | null = null;
    for (const link of NAV_LINKS) {
      const el = document.querySelector(link.href);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= threshold) current = link.href;
    }
    setActiveHref(current);
  }, [scrollY]);

  const handleMenuOpen = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleNavClick = useCallback(() => {
    setMenuOpen(false);
    setTimeout(() => menuButtonRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") handleNavClick();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, handleNavClick]);

  // MobileMenu's <dialog> uses show() (not showModal()), so the browser
  // doesn't make background content inert on its own — do it manually so
  // aria-modal="true" holds up for screen-reader swipe/virtual-cursor nav,
  // not just Tab. Header itself (this component) stays untouched so the
  // hamburger/X toggle remains reachable to close the menu.
  useEffect(() => {
    const mainEl = document.getElementById("main-content");
    mainEl?.toggleAttribute("inert", menuOpen);
    return () => mainEl?.removeAttribute("inert");
  }, [menuOpen]);

  return (
    <HeaderShell
      className={cn(
        "pointer-events-auto fixed top-gutter right-gutter left-gutter z-40 flex items-center justify-between rounded-2xl px-4 py-3 md:px-6",
        !supportsRefractive &&
          "border border-white/10 bg-black/10 backdrop-blur-sm",
      )}
    >
      <div className="relative z-40 flex items-center justify-between max-md:w-full">
        {/* Logo + name */}
        <a className="group flex items-center gap-3" href="#" aria-label="Home">
          <svg
            viewBox="0 0 478 478"
            fill="none"
            className="h-9 w-9 drop-shadow-lg"
            aria-hidden="true"
          >
            <path d={LOGO_PATH} fill="url(#header-logo-gradient)" />
            <defs>
              <linearGradient
                id="header-logo-gradient"
                x1="39"
                y1="39"
                x2="439"
                y2="439"
                gradientUnits="userSpaceOnUse"
              >
                {LOGO_GRADIENT_STOPS.map((stop) => (
                  <stop
                    key={stop.color}
                    offset={stop.offset}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            </defs>
          </svg>
          <span
            className={cn(
              "bg-linear-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text font-extrabold text-2xl text-transparent tracking-tight drop-shadow-lg transition-opacity delay-500 duration-700 group-hover:opacity-100 group-hover:delay-0 group-hover:duration-300 group-focus-visible:opacity-100 group-focus-visible:delay-0 group-focus-visible:duration-300 max-md:hidden md:text-3xl",
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
          className="flex size-11 flex-col items-center justify-center md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
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
      <div className="relative z-40 hidden items-center gap-6 md:flex">
        <nav className="flex gap-6 font-semibold text-lg">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeHref === link.href ? "location" : undefined}
              className={cn(
                "transition-colors hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-offset-2 max-lg:text-base",
                activeHref === link.href && "text-cyan-400",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        onNavClick={handleNavClick}
        activeHref={activeHref}
      />
    </HeaderShell>
  );
});
