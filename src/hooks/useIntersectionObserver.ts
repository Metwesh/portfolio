import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
  /**
   * When true (default), reduced-motion users get `isIntersecting: true`
   * immediately instead of waiting for the real observer — fine for a
   * one-shot "fade in now instead of on scroll" reveal. Set false for
   * consumers that use `isIntersecting` as an ongoing "is this section
   * actually in view" signal (e.g. driving 3D scene activity/pointer
   * events) — those need the real, live intersection state regardless of
   * motion preference.
   */
  respectReducedMotion?: boolean;
}

/**
 * Custom hook for intersection observer
 * Useful for lazy loading and animations on scroll
 * Respects prefers-reduced-motion by immediately showing content
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    enabled = true,
    respectReducedMotion = true,
  } = options;
  const prefersReducedMotion = useReducedMotion();
  const bypassForReducedMotion = respectReducedMotion && prefersReducedMotion;
  const [observerIntersecting, setObserverIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If disabled, set to true (always visible)
    if (!enabled) {
      setObserverIntersecting(true);
      return;
    }

    // Skip observer if user prefers reduced motion
    if (bypassForReducedMotion) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setObserverIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, bypassForReducedMotion, enabled]);

  // Derive final value: always true for reduced motion (unless opted out) or
  // disabled, otherwise use observer
  return {
    targetRef,
    isIntersecting: !enabled || bypassForReducedMotion || observerIntersecting,
  };
}
