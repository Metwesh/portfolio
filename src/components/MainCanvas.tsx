import {
  Environment,
  Float,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { AnimatedStars } from "./AnimatedStars";
import { MLogo } from "./MLogo";

export function MainCanvas() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ticking = false;
    const updateScroll = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, {
      signal: controller.signal,
    });
    updateScroll();
    return () => controller.abort();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 60, position: [0, 0, 10] }}>
        <Suspense fallback={null}>
          <AnimatedStars scrollY={scrollY} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
          {/* M-Logo centerpiece */}
          <Float speed={2} rotationIntensity={0.8} floatIntensity={0.8}>
            <MLogo scrollY={scrollY} />
          </Float>
          <Environment preset="sunset" background={false} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
