import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface AnimatedStarsProps {
  scrollY: number;
  reducedMotion?: boolean;
}

export function AnimatedStars({
  scrollY,
  reducedMotion = false,
}: AnimatedStarsProps) {
  const group = useRef<THREE.Group>(null);

  // Reduce star count on mobile devices for better performance
  // Simple calculation - no need for memoization
  const starCount = window.innerWidth < 768 ? 3000 : 7500;

  useFrame(() => {
    if (!group.current || reducedMotion) return;
    group.current.position.z = -scrollY * 0.02;
    group.current.position.y = -scrollY * 0.005;
  });

  return (
    <group ref={group}>
      <Stars
        radius={100}
        depth={50}
        count={starCount}
        factor={4}
        fade
        speed={reducedMotion ? 0 : 3}
      />
    </group>
  );
}
