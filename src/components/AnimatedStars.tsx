import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group as ThreeGroup } from "three";
import { breakpoints } from "../constants";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scrollStore } from "../stores/scrollStore";
import { ShootingStars } from "./ShootingStars";

// Sampled once at module load — stable for the session, avoids reading
// window.innerWidth on every render.
const starCount = window.innerWidth < breakpoints.mobile ? 3000 : 7500;

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
      <ShootingStars count={20} />
    </group>
  );
}
