import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

/**
 * Custom hook for intersection observer
 * Useful for lazy loading and animations on scroll
 * Respects prefers-reduced-motion by immediately showing content
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const { threshold = 0.1, root = null, rootMargin = "0px" } = options;
  const prefersReducedMotion = useReducedMotion();
  const [isIntersecting, setIsIntersecting] = useState(prefersReducedMotion);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If user prefers reduced motion, always show content immediately
    if (prefersReducedMotion) {
      setIsIntersecting(true);
      return;
    }

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, prefersReducedMotion]);

  return { targetRef, isIntersecting };
}
