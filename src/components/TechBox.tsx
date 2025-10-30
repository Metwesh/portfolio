import { Float } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import BoxShader from "../shaders/BoxShader";

interface TechBoxProps {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
  position: THREE.Vector3;
  onClick: () => void;
  scale: number | undefined;
  animateTo: THREE.Vector3;
  isInView: boolean;
}

export function TechBox({
  data,
  position,
  onClick,
  scale,
  animateTo,
  isInView,
}: TechBoxProps) {
  const [meshRotation] = useState(
    () => new THREE.Euler(Math.random(), Math.random(), Math.random()),
  );

  const meshRef = useRef<THREE.Mesh>(null);

  const { camera } = useThree();

  const prevCameraPosition = useRef(new THREE.Vector3());
  const rotationSpeed = useRef(0);
  // Reuse Vector3 object instead of creating new one every frame
  const targetScaleRef = useRef(new THREE.Vector3());
  const hasInitialized = useRef(false);

  // Track touch/pointer events to distinguish between tap and drag
  const pointerDown = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  // Ensure geometry UVs are properly set for iOS
  useEffect(() => {
    if (meshRef.current?.geometry) {
      const geometry = meshRef.current.geometry;
      if (geometry.attributes.uv) {
        geometry.attributes.uv.needsUpdate = true;
      }
    }
  }, []);

  // Reset initialization when hasAnimated becomes false (so animation can re-trigger)
  useEffect(() => {
    if (!isInView) {
      hasInitialized.current = false;
    }
  }, [isInView]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Record pointer down position and time for tap detection
    pointerDown.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    // Check if this was a tap (not a drag)
    if (!pointerDown.current) return;

    const deltaX = Math.abs(e.clientX - pointerDown.current.x);
    const deltaY = Math.abs(e.clientY - pointerDown.current.y);
    const deltaTime = Date.now() - pointerDown.current.time;

    // Consider it a tap if movement is minimal and time is short
    const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 300;

    if (
      isTap &&
      e.intersections &&
      e.intersections[0]?.object === meshRef.current
    ) {
      e.stopPropagation();
      onClick();
    }

    pointerDown.current = null;
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    // Fallback for non-mobile clicks
    if (e.intersections && e.intersections[0]?.object === meshRef.current) {
      e.stopPropagation();
      onClick();
    }
  };

  useFrame(() => {
    if (!meshRef.current || !camera) return;

    // Initialize position off-screen if hasn't animated yet
    if (!hasInitialized.current && !isInView) {
      // Start position far away from center (off-screen)
      const startPos = new THREE.Vector3(0, 0, -500);
      meshRef.current.position.copy(startPos);
      meshRef.current.scale.set(0.1, 0.1, 0.1);
      hasInitialized.current = true;
    }

    // Only animate if has been triggered
    if (!isInView) return;

    // Randomly moves boxes around as you rotate (the cool floating effect!)
    const deltaPosition = camera.position
      .clone()
      .sub(prevCameraPosition.current);
    rotationSpeed.current = deltaPosition.length() * 0.1; // Rotation scale factor

    meshRef.current.rotation.x += rotationSpeed.current;
    meshRef.current.rotation.y += rotationSpeed.current;

    prevCameraPosition.current = camera.position.clone();

    // Animate position to target
    const targetPos = animateTo || position;
    meshRef.current.position.lerp(targetPos, 0.15);

    // Scales boxes up to custom scale if provided, else default 3
    const scaleValue = scale || 3;
    targetScaleRef.current.set(scaleValue, scaleValue, scaleValue);
    meshRef.current.scale.lerp(targetScaleRef.current, 0.08);

    // Rotates boxes around themselves
    meshRef.current.rotation.x = meshRef.current.rotation.x + 0.005;
    meshRef.current.rotation.y = meshRef.current.rotation.y - 0.005;
  });

  return (
    <Float
      speed={1.75}
      rotationIntensity={1}
      floatIntensity={1}
      position={[0, 0, 0.05]}
      floatingRange={[0.25, 0.25]}
    >
      <mesh
        ref={meshRef}
        name={data.name}
        castShadow
        receiveShadow
        // position is now animated in useFrame
        rotation={meshRotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <BoxShader data={data} />
      </mesh>
    </Float>
  );
}
