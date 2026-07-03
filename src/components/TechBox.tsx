import { Float } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  Euler as ThreeEuler,
  type Mesh as ThreeMesh,
  Vector3 as ThreeVector3,
} from "three";
import BoxShader from "../shaders/BoxShader";
import { scrollStore } from "../stores/scrollStore";
import { qualityTier } from "../utils/performance";

const ENABLE_SHADOWS = qualityTier !== "low";

interface TechBoxProps {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
  position: ThreeVector3;
  onClick: () => void;
  scale: number | undefined;
  animateTo: ThreeVector3;
  isInView: boolean;
  isSelected?: boolean;
}

export function TechBox({
  data,
  position,
  onClick,
  scale,
  animateTo,
  isInView,
  isSelected,
}: TechBoxProps) {
  const [meshRotation] = useState(
    () => new ThreeEuler(Math.random(), Math.random(), Math.random()),
  );

  const meshRef = useRef<ThreeMesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const prevCameraPosition = useRef(new ThreeVector3());
  const rotationSpeed = useRef(0);
  // Reuse Vector3 object instead of creating new one every frame
  const targetScaleRef = useRef(new ThreeVector3());
  // Exit animation: progress 0→1, boxes drift outward from their sphere position
  const exitProgressRef = useRef(0);
  const exitStartPosRef = useRef(new ThreeVector3());
  const exitTargetPosRef = useRef(new ThreeVector3());

  // Track touch/pointer events to distinguish between tap and drag
  const pointerDown = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  // Ensure geometry UVs are properly set for iOS
  useEffect(() => {
    if (meshRef.current?.geometry) {
      const geometry = meshRef.current.geometry;
      if (geometry.attributes.uv) geometry.attributes.uv.needsUpdate = true;
    }
  }, []);

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

  const handlePointerEnter = () => {
    setIsHovered(true);
    scrollStore.techBoxHovered = true;
    window.dispatchEvent(new Event("techbox:pointerenter"));
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    scrollStore.techBoxHovered = false;
    window.dispatchEvent(new Event("techbox:pointerleave"));
  };

  useFrame(({ camera }) => {
    if (!meshRef.current) return;

    if (isInView) {
      // Rotate with camera movement — distanceTo avoids a Vector3 allocation per frame
      rotationSpeed.current =
        camera.position.distanceTo(prevCameraPosition.current) * 0.1;
      meshRef.current.rotation.x += rotationSpeed.current;
      meshRef.current.rotation.y += rotationSpeed.current;

      // Animate position to target
      const targetPos = animateTo || position;
      meshRef.current.position.lerp(targetPos, 0.15);

      // Scales boxes up to custom scale if provided, else hover bump, else default 1
      const scaleValue =
        isSelected && isHovered
          ? (scale ?? 1) * 0.88
          : (scale ?? (isHovered ? 1.18 : 1));
      targetScaleRef.current.set(scaleValue, scaleValue, scaleValue);
      meshRef.current.scale.lerp(targetScaleRef.current, 0.08);

      // Self-rotation
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y -= 0.002;
    } else {
      // Animate OUT: boxes drift outward (away from group center) and shrink.
      // On the first frame of exit, snapshot start pos and compute an outward target
      // (2× the current sphere position — same direction, further out).
      if (exitProgressRef.current === 0) {
        exitStartPosRef.current.copy(meshRef.current.position);
        exitTargetPosRef.current
          .copy(meshRef.current.position)
          .multiplyScalar(2.5);
      }
      exitProgressRef.current = Math.min(exitProgressRef.current + 0.003, 1);
      // Cubic ease-in so motion starts imperceptibly slow then sweeps outward
      const t = exitProgressRef.current;
      const eased = t * t * t;
      meshRef.current.position.lerpVectors(
        exitStartPosRef.current,
        exitTargetPosRef.current,
        eased,
      );
      targetScaleRef.current.set(0.05, 0.05, 0.05);
      meshRef.current.scale.lerp(targetScaleRef.current, 0.004 + eased * 0.1);
    }

    // Reset exit progress when back in view so next entry/exit cycle starts fresh
    if (isInView) exitProgressRef.current = 0;

    prevCameraPosition.current.copy(camera.position);
  });

  return (
    <Float
      speed={1.75}
      rotationIntensity={1}
      floatIntensity={1}
      position={[0, 0, 0.05]}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh
        ref={meshRef}
        name={data.name}
        castShadow={ENABLE_SHADOWS}
        receiveShadow={ENABLE_SHADOWS}
        // position is now animated in useFrame
        rotation={meshRotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[1, 1, 1]} />
        <BoxShader
          data={data}
          isHovered={isHovered || isSelected}
          isDimmed={isSelected && isHovered}
        />
      </mesh>
    </Float>
  );
}
