import { ACCENT_COLORS } from "../constants/misc";

/** Matches index.html's static <meta name="theme-color"> default exactly. */
export const DEFAULT_THEME_COLOR: string = ACCENT_COLORS.cyan;

/**
 * Writes the browser chrome's theme-color meta tag directly — no React
 * state/re-render, called from scroll-driven callbacks (GSAP ScrollTrigger
 * onUpdate, IntersectionObserver) the same way scrollStore is written from
 * outside React elsewhere in the app. Applied unconditionally, not gated by
 * prefers-reduced-motion: it's a discrete meta swap, not motion.
 */
export function setThemeColor(hex: string): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", hex);
}
