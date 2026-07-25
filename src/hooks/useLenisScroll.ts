import { advance } from "@react-three/fiber";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import { lenisInstance } from "../lib/lenisInstance";
import { scrollStore } from "../stores/scrollStore";

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

    // Drive Lenis from GSAP's own ticker instead of a separate rAF loop.
    // Two independent requestAnimationFrame loops (Lenis's + GSAP's, which
    // also drives ScrollTrigger's `scrub` interpolation) race each other
    // frame-to-frame with no guaranteed ordering — the resulting timing
    // skew shows up as scrub stutter, worst when scroll velocity (and thus
    // the per-frame delta) is already small, i.e. mid-deceleration or on
    // slow scrolls. lagSmoothing(0) additionally stops GSAP from injecting
    // its own "catch-up" delta-time correction after any frame hiccup,
    // which otherwise shows up as the same kind of stutter.
    gsap.ticker.lagSmoothing(0);
    // Reduced-motion render cap — throttled here rather than via Canvas's
    // `frameloop` prop: R3F's advance() renders unconditionally regardless
    // of `frameloop` (it only gates R3F's own internal auto-loop), and
    // flipping the `frameloop` prop string at runtime resets R3F's
    // clock.elapsedTime to 0 — the next advance() then computes a huge
    // one-tick delta against that stale 0. Gating the call itself avoids
    // touching frameloop at all, so the clock never resets.
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const REDUCED_MOTION_FRAME_INTERVAL_MS = 1000 / 30;
    let lastAdvanceMs = 0;
    // R3F's Canvas runs frameloop="never" (see UniverseCanvas) and is
    // advanced right here too, so the 3D scene's clock is the same tick as
    // Lenis/ScrollTrigger's — one rAF loop instead of two racing ones.
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
      // Tab backgrounded — skip rendering entirely (rAF still fires,
      // throttled, in most browsers, but nothing needs to render).
      if (document.hidden) return;
      const now = performance.now();
      if (
        reducedMotionQuery.matches &&
        now - lastAdvanceMs < REDUCED_MOTION_FRAME_INTERVAL_MS
      ) {
        return;
      }
      lastAdvanceMs = now;
      // R3F's Clock.elapsedTime is tracked in seconds — advance() in
      // frameloop="never" mode stamps it directly from this timestamp, so
      // it must be seconds too, not performance.now()'s milliseconds.
      advance(now / 1000);
    };
    gsap.ticker.add(tickerCallback);

    // Intercept keyboard scroll keys so they route through Lenis too.
    // Lenis only smooths `wheel`/`touch` input — arrow keys, Page Up/Down,
    // Home/End trigger the browser's own instant native scroll, which
    // Lenis just silently absorbs afterward with no easing. That's why
    // keyboard scrolling looked "stepped" instead of gliding like wheel
    // scroll does.
    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target;
      if (isEditableTarget(target)) return;

      const el = target as HTMLElement | null;
      // Don't hijack Space/Enter's native "activate" behavior on
      // interactive elements (buttons, links, etc).
      if (
        e.key === " " &&
        el &&
        (el.tagName === "BUTTON" ||
          el.tagName === "A" ||
          el.getAttribute("role") === "button")
      ) {
        return;
      }

      const viewport = window.innerHeight;
      let delta: number;
      switch (e.key) {
        case "ArrowDown":
          delta = 120;
          break;
        case "ArrowUp":
          delta = -120;
          break;
        case "PageDown":
        case " ":
          delta = viewport * 0.9;
          break;
        case "PageUp":
          delta = -viewport * 0.9;
          break;
        case "End":
          delta = lenis.limit - lenis.scroll;
          break;
        case "Home":
          delta = -lenis.scroll;
          break;
        default:
          return;
      }

      e.preventDefault();
      lenis.scrollTo(lenis.scroll + delta, { duration: 0.6 });
    }
    window.addEventListener("keydown", handleKeyDown);

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
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisInstance.current = null;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return { scrollY };
}
