import { useEffect, useState } from "react";

/**
 * Custom hook to track scroll position with performance optimizations
 * Uses requestAnimationFrame to throttle updates and only updates on significant changes
 */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ticking = false;
    let lastScrollY = window.scrollY;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      // Only update if scroll changed significantly (reduces re-renders)
      if (Math.abs(currentScrollY - lastScrollY) > 1) {
        setScrollY(currentScrollY);
        lastScrollY = currentScrollY;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
      signal: controller.signal,
    });
    updateScroll();
    return () => controller.abort();
  }, []);

  return scrollY;
}
