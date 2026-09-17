import { Float } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Euler as ThreeEuler, type Mesh as ThreeMesh } from "three";
import BoxShader from "../shaders/BoxShader";
import { scrollStore } from "../stores/scrollStore";

interface TechBoxProps {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
  onClick: () => void;
  isSelected?: boolean;
  index: number;
  // Render-only now — all per-frame position/scale/rotation/entry-exit math
  // lives in TechConstellation's single useFrame (see UniverseCanvas.tsx),
  // batched across every box the same way GalleryCards batches its cards
  // (ProjectGallery.tsx) instead of each of the 43 boxes subscribing its
  // own useFrame.
  onMount: (index: number, meshRef: React.RefObject<ThreeMesh | null>) => void;
  // Singular, like ProjectGallery's hoveredIndexRef — only one box can be
  // hovered at a time (pointerEnter/Leave already stopPropagation to the
  // nearest hit only, see below).
  hoveredIndexRef: React.RefObject<number | null>;
}

export function TechBox({
  data,
  onClick,
  isSelected,
  index,
  onMount,
  hoveredIndexRef,
}: TechBoxProps) {
  const [meshRotation] = useState(
    () => new ThreeEuler(Math.random(), Math.random(), Math.random()),
  );

  const meshRef = useRef<ThreeMesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Track touch/pointer events to distinguish between tap and drag
  const pointerDown = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    onMount(index, meshRef);
  }, [index, onMount]);

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

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    // Boxes overlap along the ray (dense sphere layout) — without stopping
    // propagation here, R3F walks every intersection nearest-to-farthest and
    // fires onPointerEnter on each one, hovering boxes behind the one under
    // the cursor. Only the nearest hit should light up.
    if (e.intersections[0]?.object !== meshRef.current) return;
    e.stopPropagation();
    setIsHovered(true);
    hoveredIndexRef.current = index;
    scrollStore.techBoxHovered = true;
    window.dispatchEvent(new Event("techbox:pointerenter"));
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    if (hoveredIndexRef.current === index) hoveredIndexRef.current = null;
    scrollStore.techBoxHovered = false;
    window.dispatchEvent(new Event("techbox:pointerleave"));
  };

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
        // position/scale/rotation are animated in TechConstellation's
        // batched useFrame — see onMount above.
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
