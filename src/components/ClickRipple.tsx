import { useEffect } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Matches the matcap cyan/magenta accent pair established for the M logo
// (see MLogo.tsx's createMatcapTexture / the "Matcap (cyan/magenta) won"
// material decision), plus white between them. All three fire together per
// click as concentric rings — cyan tightest (innermost), white middle,
// pink loosest (outermost) — rather than alternating one color per click.
const RINGS = [
  { color: "#00dcff", size: 14 },
  { color: "#ffffff", size: 22 },
  { color: "#ff14b4", size: 30 },
];
// Must track index.css's `--animate-click-ripple` keyframe duration
// (currently 1500ms) — this is only a fallback for when `animationend`
// is suppressed, so it needs to fire after the real animation ends, not
// before it.
const RIPPLE_DURATION_MS = 1500;

/**
 * Three concentric expanding rings fired from click/tap position, anywhere on the page
 * (not scoped to any particular CTA) — a restrained "sonar ping" rather than
 * a particle scatter (an earlier scattered-dot version read as confetti,
 * out of place against the rest of the site's restrained ring/glass
 * language). Purely decorative — CSS-driven (`.animate-click-ripple` in
 * index.css), no per-frame JS animation loop.
 */
export function ClickRipple() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Skipped outright under reduced motion rather than degraded — same
    // convention as ShootingStars/TagsPopover elsewhere in the scene.
    if (reducedMotion) return;

    const handlePointerDown = (e: PointerEvent) => {
      for (const { color, size } of RINGS) {
        const ring = document.createElement("span");
        ring.className = "animate-click-ripple";
        ring.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: ${size}px;
          height: ${size}px;
          border-radius: 9999px;
          border: 2px solid ${color};
          box-shadow: 0 0 20px ${color}, 0 0 6px ${color};
          pointer-events: none;
          z-index: 9990;
        `;
        document.body.appendChild(ring);

        // Belt-and-suspenders cleanup: `animationend` handles the normal
        // case, but a timeout still removes the node if that event is ever
        // suppressed (e.g. the tab was backgrounded mid-animation) so rings
        // can never pile up in the DOM.
        const remove = () => ring.remove();
        ring.addEventListener("animationend", remove, { once: true });
        setTimeout(remove, RIPPLE_DURATION_MS + 150);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [reducedMotion]);

  return null;
}
