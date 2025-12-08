import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { TextureLoader } from "three";

interface FrameProps {
  imageUrl: string;
  side: "left" | "right";
  index: number;
  spacing?: number;
}

export function Frame({ imageUrl, side, index, spacing = 8 }: FrameProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, imageUrl);

  // Frame dimensions
  const frameWidth = 2.5;
  const frameHeight = 2;
  const frameDepth = 0.1;
  const frameThickness = 0.15;

  // Calculate position
  const zPosition = index * spacing;
  const xPosition = side === "left" ? -4.5 : 4.5;
  const yPosition = 1.5;

  // Rotation to face inward
  const rotation: [number, number, number] = [
    0,
    side === "left" ? Math.PI / 2 : -Math.PI / 2,
    0,
  ];

  // Hover effect
  useFrame((state) => {
    if (meshRef.current) {
      const hoverScale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
      meshRef.current.scale.setScalar(hoverScale);
    }
  });

  return (
    <group
      ref={meshRef}
      position={[xPosition, yPosition, zPosition]}
      rotation={rotation}
    >
      {/* Frame border (outer box) */}
      <mesh position={[0, 0, -frameDepth / 2]}>
        <boxGeometry
          args={[
            frameWidth + frameThickness,
            frameHeight + frameThickness,
            frameThickness,
          ]}
        />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Image plane */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Glass effect (optional subtle overlay) */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          metalness={0.9}
          roughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
    </group>
  );
}
