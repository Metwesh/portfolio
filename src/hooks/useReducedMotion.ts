import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const controller = new AbortController();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener(
      "change",
      ({ matches }) => setPrefersReducedMotion(matches),
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  return prefersReducedMotion;
}
