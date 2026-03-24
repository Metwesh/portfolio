import { Html, TrackballControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { Vector3 as ThreeVector3 } from "three";
import type { TrackballControls as TrackballControlsImpl } from "three-stdlib";
import { technologies } from "../constants/technologies";
import { FOG_ARGUMENTS, LIGHT_ARGUMENTS } from "../shaders/FogArguments";
import { TechBox } from "./TechBox";
import { TechTooltip } from "./TechTooltip";

const SPHERE_RADIUS = 20;

interface TechCanvasProps {
  isInView: boolean;
}

export function TechCanvas({ isInView }: TechCanvasProps) {
  // Golden Spiral algorithm
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
  const [showHint, setShowHint] = useState(true);

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[window.devicePixelRatio, 2]}
        camera={{ position: [0, 0, 35], fov: 90 }}
        frameloop={isInView ? "always" : "demand"}
        performance={{ min: 0.5 }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <Controls
          points={points}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          isInView={isInView}
          onInteraction={() => setShowHint(false)}
        />
        <ControlsReset isInView={isInView} />
      </Canvas>

      {/* Hint overlay */}
      {showHint && selectedIndex === null && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up">
          <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-linear-to-r from-white/5 to-white/10 px-5 py-2.5 backdrop-blur-sm">
            <svg
              className="h-4 w-4 animate-pulse text-cyan-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium text-white/90 text-xs md:text-sm">
              Click to explore
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to handle orbital controls reset
function ControlsReset({ isInView }: { isInView: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<TrackballControlsImpl | null>(null);
  const hasReset = useRef(false);

  useFrame(() => {
    if (!isInView && !hasReset.current) {
      // Reset camera to default position
      camera.position.set(0, 0, 35);
      camera.lookAt(0, 0, 0);

      // Reset controls if available
      if (controlsRef.current) controlsRef.current.reset();

      hasReset.current = true;
    } else if (isInView) {
      hasReset.current = false;
    }
  });

  return (
    <TrackballControls
      ref={controlsRef}
      noZoom
      noPan
      makeDefault
      dynamicDampingFactor={0.05}
      staticMoving={false}
    />
  );
}

// Moved so that the InnerControls component can access the camera
function Controls({
  points,
  selectedIndex,
  setSelectedIndex,
  isInView,
  onInteraction,
}: {
  points: Array<ThreeVector3>;
  selectedIndex: number | null;
  setSelectedIndex: (i: number | null) => void;
  isInView: boolean;
  onInteraction: () => void;
}) {
  // Note: offscreenPositions removed as we now use dynamic positioning

  // Calculate zoomed positions based on current state
  const getBoxPosition = (originalPos: ThreeVector3, index: number) => {
    let scale = 1; // default

    if (selectedIndex !== null) {
      scale = selectedIndex === index ? 0.3 : 2; // selected vs non-selected
    } else {
      scale = isInView ? 1 : 1.25; // in view vs not
    }

    return originalPos.clone().multiplyScalar(scale);
  };

  // Track touch/pointer events for close button to distinguish tap from drag
  const buttonPointerDown = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handleBoxClick = (index: number) => () => {
    onInteraction();
    setSelectedIndex(index);
  };

  const handleButtonPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    buttonPointerDown.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleButtonPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!buttonPointerDown.current) return;

    const deltaX = Math.abs(e.clientX - buttonPointerDown.current.x);
    const deltaY = Math.abs(e.clientY - buttonPointerDown.current.y);
    const deltaTime = Date.now() - buttonPointerDown.current.time;

    // Consider it a tap if movement is minimal and time is short
    const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 200;

    if (isTap) handleClose();

    buttonPointerDown.current = null;
  };
  return (
    <group>
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
      <group rotation={[0, 0, 35]}>
        {points.map((pos, index) => {
          // Calculate the target position based on zoom state
          const targetPosition = getBoxPosition(pos, index);
          const isSelected = selectedIndex === index;

          return (
            <TechBox
              key={`${technologies[index].name}-${index}`}
              position={targetPosition}
              data={technologies[index]}
              onClick={handleBoxClick(index)}
              scale={isSelected ? 20 : undefined}
              isInView={isInView}
              animateTo={targetPosition}
              isSelected={isSelected}
            />
          );
        })}
        {selectedIndex !== null && (
          <Html
            center
            position={[0, -14, 0]}
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
    </group>
  );
}
