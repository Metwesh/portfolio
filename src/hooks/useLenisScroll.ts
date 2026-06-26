import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import { lenisInstance } from "../lib/lenisInstance";
import { scrollStore } from "../stores/scrollStore";

/**
 * Initializes Lenis smooth scroll with its own RAF loop and keeps
 * scrollStore + GSAP ScrollTrigger in sync.
 *
 * Returns scrollY (throttled state for Header re-renders).
 */
export function useLenisScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });
    lenisInstance.current = lenis;

    // Keep GSAP ScrollTrigger in sync with Lenis's virtual scroll position
    lenis.on("scroll", () => ScrollTrigger.update());

    let lastSetY = 0;
    lenis.on(
      "scroll",
      ({
        scroll,
        progress,
        velocity,
      }: {
        scroll: number;
        progress: number;
        velocity: number;
      }) => {
        scrollStore.raw = scroll;
        scrollStore.progress = progress;
        scrollStore.velocity = velocity;

        // Throttle React re-renders: only update if moved > 20px
        if (Math.abs(scroll - lastSetY) > 20) {
          setScrollY(scroll);
          lastSetY = scroll;
        }
      },
    );

    // Lenis's own RAF — independent of R3F to avoid Suspense timing issues
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Intercept hash-link clicks so they route through Lenis instead of
    // jumping natively (which bypasses smooth scroll entirely).
    function handleAnchorClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a[href^='#']");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, {
        offset: 0,
        onComplete: () =>
          (target as HTMLElement).focus({ preventScroll: true }),
      });
    }
    document.addEventListener("click", handleAnchorClick);

    // Refresh ScrollTrigger after fonts/images load
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance.current = null;
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return { scrollY };
}
