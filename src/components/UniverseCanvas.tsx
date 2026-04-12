import { Environment, Html, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  type PointerEvent as ReactPointerEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type * as THREE from "three";
import { PCFShadowMap, Vector3 as ThreeVector3 } from "three";
import { technologies } from "../constants/technologies";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { FOG_ARGUMENTS, LIGHT_ARGUMENTS } from "../shaders/FogArguments";
import { scrollStore } from "../stores/scrollStore";
import { AnimatedStars } from "./AnimatedStars";
import { CameraRig } from "./CameraRig";
import { MLogo } from "./MLogo";
import { ProjectGallery } from "./ProjectGallery";
import { TechBox } from "./TechBox";
import { TechTooltip } from "./TechTooltip";

const SPHERE_RADIUS = 8;

// ─── Module-level drag state ──────────────────────────────────────────────────
// Written by the DOM pointer handlers in UniverseCanvas, read each frame by
// TechConstellation. Avoids prop-drilling / context without React overhead.
const _techDrag = {
  velY: 0, // Y-axis (horizontal drag) velocity
  velX: 0, // X-axis (vertical drag) velocity
};

// ─── Tech Constellation ──────────────────────────────────────────────────────
function TechConstellation() {
  // React state mirror — forces re-render so TechBox.isInView animates in.
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => {
      setIsActive((e as CustomEvent<{ active: boolean }>).detail.active);
    };
    document.addEventListener("universe:interactive", handler);
    return () => document.removeEventListener("universe:interactive", handler);
  }, []);

  const points = useMemo(() => {
    const temp = [];
    const offset = 2 / technologies.length;
    const increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < technologies.length; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(1 - y ** 2);
      const phi = ((i + 1) % technologies.length) * increment;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      temp.push(
        new ThreeVector3(
          x * SPHERE_RADIUS,
          y * SPHERE_RADIUS,
          z * SPHERE_RADIUS,
        ),
      );
    }
    return temp;
  }, []);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    scrollStore.techBoxSelected = selectedIndex !== null;
  }, [selectedIndex]);

  const groupRef = useRef<THREE.Group>(null);
  const visibilityRef = useRef(0);
  const prevRawRef = useRef(0);
  const rotYRef = useRef(0);
  const rotXRef = useRef(0);
  const scrollVelRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const inView = scrollStore.techSectionActive;
    visibilityRef.current += ((inView ? 1 : 0) - visibilityRef.current) * 0.012;
    groupRef.current.scale.setScalar(visibilityRef.current);
    groupRef.current.position.y = scrollStore.mLogoY;
    groupRef.current.position.z = scrollStore.mLogoZ;

    // Apply drag velocity (set by DOM handler, coasts here)
    const selected = scrollStore.techBoxSelected;
    rotYRef.current += _techDrag.velY;
    rotXRef.current += _techDrag.velX;
    // More friction when a box is selected so rotation dies out quickly
    const dragFriction = selected ? 0.82 : 0.9;
    _techDrag.velY *= dragFriction;
    _techDrag.velX *= dragFriction;

    // Scroll-driven spin + idle auto-spin — paused while a box is selected
    const rawDelta = scrollStore.raw - prevRawRef.current;
    prevRawRef.current = scrollStore.raw;
    if (inView && !selected) {
      scrollVelRef.current += rawDelta * 0.00008;
      scrollVelRef.current += 0.00018; // idle auto-spin
    }
    scrollVelRef.current *= selected ? 0.93 : 0.97;
    rotYRef.current += scrollVelRef.current;

    // Clamp X tilt so the sphere never flips completely upside-down
    rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current));

    groupRef.current.rotation.y = rotYRef.current;
    groupRef.current.rotation.x = rotXRef.current;
  });

  const getBoxPosition = (originalPos: ThreeVector3, index: number) => {
    const scale =
      selectedIndex === null ? 1 : selectedIndex === index ? 0.3 : 2;
    return originalPos.clone().multiplyScalar(scale);
  };

  const buttonPointerDown = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleClose = () => setSelectedIndex(null);

  const handleButtonPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    buttonPointerDown.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleButtonPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!buttonPointerDown.current) return;
    const dx = Math.abs(e.clientX - buttonPointerDown.current.x);
    const dy = Math.abs(e.clientY - buttonPointerDown.current.y);
    const dt = Date.now() - buttonPointerDown.current.time;
    if (dx < 10 && dy < 10 && dt < 200) handleClose();
    buttonPointerDown.current = null;
  };

  return (
    <group ref={groupRef as React.RefObject<THREE.Group>} rotation={[0, 0, 35]}>
      <directionalLight
        intensity={3.75}
        color={LIGHT_ARGUMENTS.color}
        position={LIGHT_ARGUMENTS.position}
      />
      <fog
        attach="fog"
        args={[FOG_ARGUMENTS.color, FOG_ARGUMENTS.near, FOG_ARGUMENTS.far]}
        color={FOG_ARGUMENTS.color}
        near={FOG_ARGUMENTS.near}
        far={FOG_ARGUMENTS.far}
      />
      {points.map((pos, index) => {
        const targetPosition = getBoxPosition(pos, index);
        const isSelected = selectedIndex === index;
        return (
          <TechBox
            key={`${technologies[index].name}-${index}`}
            position={targetPosition}
            data={technologies[index]}
            onClick={() => setSelectedIndex(index)}
            scale={isSelected ? 6 : undefined}
            isInView={isActive}
            animateTo={targetPosition}
            isSelected={isSelected}
          />
        );
      })}
      {selectedIndex !== null && (
        <Html
          center
          position={[0, -10, 0]}
          style={{ pointerEvents: "auto", userSelect: "none" }}
        >
          <TechTooltip
            technologyName={technologies[selectedIndex].name}
            isWip={technologies[selectedIndex].wip || false}
            onClose={handleClose}
            onPointerDown={handleButtonPointerDown}
            onPointerUp={handleButtonPointerUp}
          />
        </Html>
      )}
    </group>
  );
}

// ─── Scene Ready Signal ───────────────────────────────────────────────────────
function SceneReadySignal({ onReady }: { onReady?: () => void }) {
  const called = useRef(false);
  useEffect(() => {
    if (!called.current) {
      called.current = true;
      onReady?.();
    }
  }, [onReady]);
  return null;
}

// ─── Universe Canvas ─────────────────────────────────────────────────────────

interface UniverseCanvasProps {
  onReady?: () => void;
}

export function UniverseCanvas({ onReady }: UniverseCanvasProps) {
  const prefersReducedMotion = useReducedMotion();
  const mouse = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mouse parallax for camera
  useEffect(() => {
    if (prefersReducedMotion) return;
    const controller = new AbortController();
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
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
    return () => controller.abort();
  }, [prefersReducedMotion]);

  // Canvas wrapper pointer events toggle when tech section activates
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean }>).detail;
      if (wrapperRef.current) {
        wrapperRef.current.style.pointerEvents = detail.active
          ? "auto"
          : "none";
        wrapperRef.current.style.touchAction = detail.active ? "none" : "";
      }
    };
    document.addEventListener("universe:interactive", handler);
    return () => document.removeEventListener("universe:interactive", handler);
  }, []);

  // Globe drag — handled at DOM level so R3F raycasting for TechBox clicks is
  // completely unaffected. setPointerCapture ensures pointermove keeps firing on
  // mobile even when the finger moves outside the element.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let lastX = 0;
    let lastY = 0;
    let active = false;

    const onDown = (e: PointerEvent) => {
      if (!scrollStore.techSectionActive) return;
      lastX = e.clientX;
      lastY = e.clientY;
      active = true;
      _techDrag.velY = 0;
      _techDrag.velX = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      _techDrag.velY = dx * 0.006;
      _techDrag.velX = dy * 0.006;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onUp = () => {
      active = false;
    };

    // Two-finger scroll: hand control back to the browser so Lenis can scroll
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        active = false;
        el.style.touchAction = "pan-y";
        el.style.pointerEvents = "none"; // let events reach Lenis
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && scrollStore.techSectionActive) {
        el.style.touchAction = "none";
        el.style.pointerEvents = "auto";
      }
    };

    el.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-universe-canvas
      className="fade-in pointer-events-none fixed inset-0 z-0 h-svh animate-in duration-1000"
    >
      <Canvas
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 2]}
        frameloop={prefersReducedMotion ? "demand" : "always"}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 10]}
            fov={60}
            ref={cameraRef}
          />
          {!prefersReducedMotion && <CameraRig mouse={mouse} />}

          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <Environment background={false} resolution={64}>
            <ambientLight intensity={0.1} />
            <pointLight
              position={[10, 10, 10]}
              intensity={0.5}
              color="#88f0ff"
            />
            <pointLight
              position={[-10, -5, -10]}
              intensity={0.3}
              color="#d080ff"
            />
          </Environment>

          <AnimatedStars />
          <MLogo />
          <TechConstellation />
          <SceneReadySignal onReady={onReady} />
        </Suspense>

        <Suspense fallback={null}>
          <ProjectGallery />
        </Suspense>
      </Canvas>
    </div>
  );
}
