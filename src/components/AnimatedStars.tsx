import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group as ThreeGroup } from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scrollStore } from "../stores/scrollStore";
import { qualityTier } from "../utils/performance";
import { ShootingStars } from "./ShootingStars";

// Sampled once at module load — stable for the session.
// Quality-aware: low-end devices get fewer stars to reduce GPU load.
const STAR_COUNTS = { low: 500, medium: 1000, high: 2500 } as const;
const SHOOTING_STAR_COUNTS = { low: 0, medium: 6, high: 12 } as const;

const starCount = STAR_COUNTS[qualityTier];
const shootingStarCount = SHOOTING_STAR_COUNTS[qualityTier];

export function AnimatedStars() {
  const reducedMotion = useReducedMotion();
  const group = useRef<ThreeGroup>(null);

  useFrame(() => {
    if (!group.current || reducedMotion) return;
    // Read directly from scrollStore — no prop, no re-render
    group.current.position.z = -scrollStore.raw * 0.02;
    group.current.position.y = -scrollStore.raw * 0.005;
  });

  return (
    <>
      <group ref={group}>
        <Stars
          radius={250}
          depth={100}
          count={starCount}
          factor={4}
          fade
          speed={reducedMotion ? 0 : 3}
        />
      </group>
      {/* Not inside the parallax group above: ShootingStars already spawns
          relative to the live camera every frame, so it needs to sit in the
          scene's untranslated space — nesting it under that group's
          scroll-driven offset would double-apply the shift and push stars
          out of frame past the hero. */}
      {shootingStarCount > 0 && <ShootingStars count={shootingStarCount} />}
    </>
  );
}
