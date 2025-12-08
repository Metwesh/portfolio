import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { projects } from "../../constants/projects";
import { SectionHeading } from "../SectionHeading";
import { Frame } from "./Frame";
import { Walkway } from "./Walkway";

const SPACING = 8;
const BUFFER_VH = 20; // Buffer before camera starts moving

function CameraController({
  scrollY,
  sectionRef,
}: {
  scrollY: number;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [scrollTarget, setScrollTarget] = useState(0);

  const maxZ = (projects.length - 1) * SPACING + 10;
  const minZ = -5;

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
  });

  return null;
}

export function Scene({ scrollY }: { scrollY: number }) {
  const sectionRef = useRef<HTMLElement>(null);

  const hallwayLength = projects.length * SPACING + 20;
  const sectionHeight = projects.length * 100 + BUFFER_VH; // vh units per project + buffer

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        height: `${sectionHeight}vh`,
        position: "relative",
        paddingTop: "8rem",
      }}
    >
      <SectionHeading id="projects" isIntersecting={true}>
        Projects
      </SectionHeading>

      <div className="sticky top-0 left-0 h-screen w-full pt-48">
        <Canvas
          camera={{
            position: [0, 1.6, -5],
            fov: 60,
            near: 0.1,
            far: 1000,
          }}
          shadows
          gl={{ antialias: true }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[0, 5, 5]}
            intensity={0.6}
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
          <CameraController scrollY={scrollY} sectionRef={sectionRef} />

          {/* Walkway */}
          <Walkway length={hallwayLength} />

          {/* Frames - alternating sides */}
          {projects.map((project, index) => (
            <Frame
              key={project.name}
              imageUrl={project.image}
              side={index % 2 === 0 ? "left" : "right"}
              index={index}
              spacing={SPACING}
            />
          ))}
        </Canvas>
      </div>
    </section>
  );
}
