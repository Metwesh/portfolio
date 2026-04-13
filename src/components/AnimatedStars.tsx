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
const STAR_COUNTS = { low: 500, medium: 1500, high: 3000 } as const;
const starCount = STAR_COUNTS[qualityTier];
const shootingStarCount =
  qualityTier === "low" ? 0 : qualityTier === "medium" ? 6 : 12;

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
    <group ref={group}>
      <Stars
        radius={250}
        depth={100}
        count={starCount}
        factor={4}
        fade
        speed={reducedMotion ? 0 : 3}
      />
      {shootingStarCount > 0 && <ShootingStars count={shootingStarCount} />}
    </group>
  );
}
