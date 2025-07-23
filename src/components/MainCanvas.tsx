import { Environment, Float, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useEffect } from "react";
import { AnimatedStars } from "./AnimatedStars";
import { MLogo } from "./MLogo";
import * as THREE from "three";

export function MainCanvas({ scrollY }: { scrollY: number }) {
  // Track mouse position for parallax
  const mouse = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "mousemove",
      (e) => {
        // Normalize to [-1, 1]
        mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      {
        signal: controller.signal,
      },
    );
    return () => {
      controller.abort();
    };
  }, []);
  return (
    <div className="animate-in fade-in pointer-events-none fixed inset-0 z-0 h-lvh duration-1000">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 60, position: [0, 0, 10] }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <AnimatedStars scrollY={scrollY} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 10]}
            fov={60}
            ref={cameraRef}
          />
          {/* M-Logo centerpiece */}
          <Float speed={2} rotationIntensity={0.8} floatIntensity={0.8}>
            <MLogo scrollY={scrollY} cameraRef={cameraRef} mouse={mouse} />
          </Float>
          <Environment preset="sunset" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
