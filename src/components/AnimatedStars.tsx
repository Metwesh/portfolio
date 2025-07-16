import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface AnimatedStarsProps {
  scrollY: number;
}

export function AnimatedStars({ scrollY }: AnimatedStarsProps) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.z = -scrollY * 0.02;
    group.current.position.y = -scrollY * 0.005;
  });

  return (
    <group ref={group}>
      <Stars radius={100} depth={50} count={7500} factor={4} fade speed={3} />
    </group>
  );
}
