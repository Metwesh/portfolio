import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { INTERSECTION_OBSERVER_CONFIG } from "../../constants";
import { projects } from "../../constants/projects";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { SectionHeading } from "../SectionHeading";
import { Frame } from "./Frame";
import { Walkway } from "./Walkway";

const SPACING = 8;
const BUFFER_VH = 20; // Buffer before camera starts moving

function CameraController({
  scrollY,
  sectionRef,
  onCameraMove,
}: {
  scrollY: number;
  sectionRef: React.RefObject<HTMLElement | null>;
  onCameraMove?: (z: number) => void;
}) {
  const cameraRef = useRef<THREE.Camera | null>(null);
  const spotlightRef = useRef<THREE.SpotLight | null>(null);
  const [scrollTarget, setScrollTarget] = useState(0);
  const spotlightTargetRef = useRef({ x: 0, y: 1.5, z: 0 });

  const maxZ = (projects.length - 1) * SPACING + 10;
  const minZ = -10;

  useEffect(() => {
    if (!sectionRef.current) return;

    const sectionTop = sectionRef.current.offsetTop;
    const sectionHeightPx = sectionRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Calculate scroll relative to section start
    const scrollIntoSection = Math.max(0, scrollY - sectionTop);
    const bufferHeightPx = (BUFFER_VH / 100) * viewportHeight;

    // Only start moving camera after buffer
    const effectiveScroll = Math.max(0, scrollIntoSection - bufferHeightPx);
    const effectiveHeight = sectionHeightPx - bufferHeightPx - viewportHeight;

    const scrollPercentage = Math.min(1, effectiveScroll / effectiveHeight);
    const targetZ = scrollPercentage * maxZ;
    setScrollTarget(Math.max(minZ, Math.min(maxZ, targetZ)));
  }, [scrollY, maxZ, sectionRef]);

  useFrame(({ camera }) => {
    cameraRef.current = camera;
    // Smooth lerp to target position
    const lerpFactor = 0.05;
    camera.position.z += (scrollTarget - camera.position.z) * lerpFactor;

    // Notify parent of camera position
    if (onCameraMove) {
      onCameraMove(camera.position.z);
    }

    // Update spotlight to follow camera and point to nearest frame
    if (spotlightRef.current) {
      spotlightRef.current.position.copy(camera.position);
      spotlightRef.current.position.y += 2; // Slightly above camera

      // Find the closest frame index to camera position
      // Frames use (index + 1) * SPACING, so first frame is at z=8, second at z=16, etc.
      const cameraZ = camera.position.z;
      // Adjust to aim at frames earlier - when camera approaches them
      const lookaheadDistance = 5; // Look ahead by 5 units
      const adjustedZ = cameraZ + lookaheadDistance;
      const closestIndex = Math.round(adjustedZ / SPACING - 1);
      const closestFrameZ = (closestIndex + 1) * SPACING;

      // Determine which side the frame is on (alternating pattern)
      // index 0 = left, index 1 = right, etc.
      const isLeftSide = closestIndex % 2 === 0;
      const frameX = isLeftSide ? -4.5 : 4.5;

      // Smoothly lerp spotlight target position
      const targetLerpFactor = 0.1;
      spotlightTargetRef.current.x +=
        (frameX - spotlightTargetRef.current.x) * targetLerpFactor;
      spotlightTargetRef.current.z +=
        (closestFrameZ - spotlightTargetRef.current.z) * targetLerpFactor;

      // Apply smoothed position to spotlight target
      spotlightRef.current.target.position.set(
        spotlightTargetRef.current.x,
        spotlightTargetRef.current.y,
        spotlightTargetRef.current.z
      );
      spotlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <spotLight
      ref={spotlightRef}
      intensity={6}
      angle={Math.PI / 6}
      penumbra={0.4}
      distance={30}
      decay={2}
      castShadow
    />
  );
}

export function Scene({ scrollY }: { scrollY: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [cameraZ, setCameraZ] = useState(0);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  const hallwayLength = projects.length * SPACING + 5;
  const sectionHeight = projects.length * 100 + BUFFER_VH; // vh units per project + buffer

  return (
    <section
      ref={sectionRef}
      className="-ms-gutter relative w-screen pt-32"
      style={{
        height: `${sectionHeight}vh`,
      }}
    >
      {/* Invisible trigger element for intersection observer */}
      <div
        ref={targetRef as React.RefObject<HTMLDivElement>}
        className="pointer-events-none absolute top-0 left-0 h-screen w-px"
      />

      <SectionHeading id="projects" isIntersecting={true}>
        Projects
      </SectionHeading>

      <div className="sticky top-20 left-0 h-screen w-full">
        <Canvas
          camera={{
            position: [0, 1, -10],
            fov: 80,
            near: 0.1,
            far: 1000,
          }}
          shadows
          gl={{ antialias: true }}
        >
          {/* Fog */}
          <fog attach="fog" args={["#000000", 10, 80]} />

          {/* Lighting */}
          <ambientLight intensity={0.15} />
          <directionalLight
            position={[0, 5, 5]}
            intensity={0.3}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Point lights along the corridor */}
          {Array.from({ length: Math.ceil(hallwayLength / 15) }, (_, i) => (
            <pointLight
              key={`corridor-light-${i * 15}`}
              position={[0, 3, i * 15]}
              intensity={0.3}
              distance={20}
              decay={2}
              color="#fff5e6"
            />
          ))}

          {/* Camera Controller */}
          <CameraController
            scrollY={scrollY}
            sectionRef={sectionRef}
            onCameraMove={setCameraZ}
          />

          {/* Walkway */}
          <Walkway length={hallwayLength} isIntersecting={isIntersecting} />

          {/* Frames - alternating sides */}
          {projects.map((project, index) => (
            <Frame
              key={project.name}
              imageUrl={project.image}
              side={index % 2 === 0 ? "left" : "right"}
              index={index + 1}
              spacing={SPACING}
              cameraZ={cameraZ}
            />
          ))}
        </Canvas>
      </div>
    </section>
  );
}
