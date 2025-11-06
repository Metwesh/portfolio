import { useEffect, useState } from "react";

/**
 * Custom hook to detect if user prefers reduced motion
 * Returns true if user has enabled reduced motion in their OS settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check initial state
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const controller = new AbortController();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener(
      "change",
      ({ matches }) => setPrefersReducedMotion(matches),
      { signal: controller.signal }
    );
    return () => controller.abort();
  }, []);

  return prefersReducedMotion;
}
