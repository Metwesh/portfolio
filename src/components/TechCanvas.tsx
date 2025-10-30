import { TrackballControls, Html } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { TrackballControls as TrackballControlsImpl } from "three-stdlib";
import {
  useMemo,
  useState,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
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
      const r = Math.sqrt(1 - Math.pow(y, 2));
      const phi = ((i + 1) % technologies.length) * increment;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      temp.push(
        new THREE.Vector3(
          x * SPHERE_RADIUS,
          y * SPHERE_RADIUS,
          z * SPHERE_RADIUS,
        ),
      );
    }
    return temp;
  }, []);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
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
      />
      <ControlsReset isInView={isInView} />
    </Canvas>
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
}: {
  points: Array<THREE.Vector3>;
  selectedIndex: number | null;
  setSelectedIndex: (i: number | null) => void;
  isInView: boolean;
}) {
  // Note: offscreenPositions removed as we now use dynamic positioning

  // Calculate zoomed positions based on current state
  const getBoxPosition = (originalPos: THREE.Vector3, index: number) => {
    const isSelected = selectedIndex === index;

    if (selectedIndex !== null) {
      if (isSelected) {
        // Selected box moves closer to camera
        return new THREE.Vector3(
          originalPos.x * 0.3,
          originalPos.y * 0.3,
          originalPos.z * 0.3,
        );
      } else {
        // Non-selected boxes move away from camera
        return new THREE.Vector3(
          originalPos.x * 2,
          originalPos.y * 2,
          originalPos.z * 2,
        );
      }
    } else if (isInView) {
      // When in view, boxes are closer to camera (bigger sphere)
      return new THREE.Vector3(originalPos.x, originalPos.y, originalPos.z);
    } else {
      // When not in view, boxes are further from camera
      return new THREE.Vector3(
        originalPos.x * 1.25,
        originalPos.y * 1.25,
        originalPos.z * 1.25,
      );
    }
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
              key={`technology-${index}`}
              position={targetPosition}
              data={technologies[index]}
              onClick={handleBoxClick(index)}
              scale={isSelected ? 20 : undefined}
              isInView={isInView}
              animateTo={targetPosition}
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
