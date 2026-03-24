import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
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
  } = options;
  const prefersReducedMotion = useReducedMotion();
  const [observerIntersecting, setObserverIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If disabled, set to true (always visible)
    if (!enabled) {
      setObserverIntersecting(true);
      return;
    }

    // Skip observer if user prefers reduced motion
    if (prefersReducedMotion) return;

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
  }, [threshold, root, rootMargin, prefersReducedMotion, enabled]);

  // Derive final value: always true for reduced motion or disabled, otherwise use observer
  return {
    targetRef,
    isIntersecting: !enabled || prefersReducedMotion || observerIntersecting,
  };
}
