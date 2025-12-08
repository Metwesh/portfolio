import { useFrame, useLoader } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import { TextureLoader } from "three";

interface FrameProps {
  imageUrl: string;
  side: "left" | "right";
  index: number;
  spacing?: number;
  cameraZ?: number;
}

export function Frame({
  imageUrl,
  side,
  index,
  spacing = 8,
  cameraZ = 0,
}: FrameProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, imageUrl);
  const [offsetX, setOffsetX] = useState(0);
  const [rotationY, setRotationY] = useState(
    side === "left" ? Math.PI / 2 : -Math.PI / 2
  );

  // Frame dimensions
  const maxFrameHeight = 2.8;
  const frameDepth = 0.1;
  const frameThickness = 0.2;

  // Calculate image dimensions maintaining aspect ratio
  const imageAspect = texture.image
    ? texture.image.width / texture.image.height
    : 1;
  const frameHeight = maxFrameHeight;
  const frameWidth = frameHeight * imageAspect;

  // Calculate base position
  const zPosition = index * spacing;
  const baseXPosition = side === "left" ? -4.5 : 4.5;
  const yPosition = 1.5;

  // Animation based on camera proximity
  useFrame(() => {
    if (meshRef.current) {
      // Calculate distance from camera to frame's Z position
      const distanceToCamera = Math.abs(cameraZ - zPosition);

      // Activation range: frame starts moving when camera is within 15 units
      const activationRange = 15;
      const maxSlideOut = 1.5; // Maximum distance to slide out towards center

      if (distanceToCamera < activationRange) {
        // Calculate slide progress (0 to 1, peaks when camera is at frame's position)
        const slideProgress = 1 - distanceToCamera / activationRange;

        // Ease out cubic for smooth motion
        const easedProgress = 1 - (1 - slideProgress) ** 3;

        // Calculate target offset (slide towards center)
        const targetOffset =
          easedProgress * maxSlideOut * (side === "left" ? 1 : -1);

        // Calculate target rotation
        // On wall: left = π/2 (facing right), right = -π/2 (facing left)
        // Facing camera: both should be π (180°, facing down the negative Z / toward camera)
        const baseRotation = side === "left" ? Math.PI / 2 : -Math.PI / 2;
        const cameraFacingRotation = side === "left" ? Math.PI : -Math.PI;
        const targetRotation =
          baseRotation + easedProgress * (cameraFacingRotation - baseRotation);

        // Smooth lerp to target
        setOffsetX((prev) => prev + (targetOffset - prev) * 0.1);
        setRotationY((prev) => prev + (targetRotation - prev) * 0.1);
      } else {
        // Smoothly return to original position and rotation
        setOffsetX((prev) => prev * 0.9);
        const baseRotation = side === "left" ? Math.PI / 2 : -Math.PI / 2;
        setRotationY((prev) => prev + (baseRotation - prev) * 0.1);
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={[baseXPosition + offsetX, yPosition, zPosition]}
      rotation={[0, rotationY, 0]}
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
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Image plane */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Glass effect (optional subtle overlay) */}
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.05}
          metalness={0.9}
          roughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
    </group>
  );
}
