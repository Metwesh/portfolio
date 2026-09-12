import { useEffect, useState } from "react";

// Shared across the few call sites that can't use the hook itself (outside
// component scope) — keeps App.tsx/useLenisScroll.ts from hand-typing their
// own copy of the same query string.
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    return mediaQuery.matches;
  });

  useEffect(() => {
    const controller = new AbortController();
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    mediaQuery.addEventListener(
      "change",
      ({ matches }) => setPrefersReducedMotion(matches),
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  return prefersReducedMotion;
}
