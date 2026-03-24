import { Environment, Float, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import {
  PCFShadowMap,
  type PerspectiveCamera as ThreePerspectiveCamera,
} from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { AnimatedStars } from "./AnimatedStars";
import { MLogo } from "./MLogo";

export function MainCanvas({
  scrollY,
  onReady,
}: {
  scrollY: number;
  onReady?: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Track mouse position for parallax
  const mouse = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  useEffect(() => {
    // Skip mouse tracking if user prefers reduced motion
    if (prefersReducedMotion) return;

    const controller = new AbortController();
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Normalize to [-1, 1]
          mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
      signal: controller.signal,
    });
    return () => {
      controller.abort();
    };
  }, [prefersReducedMotion]);
  return (
    <div className="fade-in pointer-events-none fixed inset-0 z-0 h-lvh animate-in duration-1000">
      <Canvas
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 2]}
        camera={{ fov: 60, position: [0, 0, 10] }}
        frameloop={prefersReducedMotion ? "demand" : "always"}
        performance={{ min: 0.5 }}
        onCreated={() =>
          // Wait a bit for M logo to initialize, then signal ready
          setTimeout(() => onReady?.(), 100)
        }
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
          <Float
            speed={prefersReducedMotion ? 0 : 2}
            rotationIntensity={prefersReducedMotion ? 0 : 0.8}
            floatIntensity={prefersReducedMotion ? 0 : 0.8}
          >
            <MLogo scrollY={scrollY} cameraRef={cameraRef} mouse={mouse} />
          </Float>
          <Environment preset="sunset" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
