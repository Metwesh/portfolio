import { TrackballControls, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { technologies } from "../constants";
import { FOG_ARGUMENTS, LIGHT_ARGUMENTS } from "../shaders/FogArguments";
import TechBox from "./TechBox";
import { WIP } from "../assets";

const SPHERE_RADIUS = 20;

interface TechCanvasProps {
  isInView: boolean;
}

export default function TechCanvas({ isInView }: TechCanvasProps) {
  // Animation triggers every time isInView becomes true
  const hasAnimated = isInView;

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
      dpr={[1, 2]}
      camera={{ position: [0, 0, 35], fov: 90 }}
      frameloop={isInView ? "always" : "demand"}
      performance={{ min: 0.5 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Controls
        points={points}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        hasAnimated={hasAnimated}
      />
    </Canvas>
  );
}

// Moved so that the InnerControls component can access the camera
function Controls({
  points,
  selectedIndex,
  setSelectedIndex,
  hasAnimated,
}: {
  points: Array<THREE.Vector3>;
  selectedIndex: number | null;
  setSelectedIndex: (i: number | null) => void;
  hasAnimated: boolean;
}) {
  // Memoize offscreen positions to avoid creating new Vector3 objects on every render
  const offscreenPositions = useMemo(
    () => points.map((pos) => new THREE.Vector3(pos.x, pos.y, -500)),
    [points],
  );

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
          // Animate unselected boxes off and back on screen
          const isSelected = selectedIndex === index;
          // If selected, lerp to offscreen; if not, lerp to original
          // We'll pass both positions and let TechBox animate between them
          const animateTo =
            selectedIndex !== null && !isSelected
              ? offscreenPositions[index]
              : pos;
          return (
            <TechBox
              key={`technology-${index}`}
              position={pos}
              data={technologies[index]}
              onClick={() => setSelectedIndex(index)}
              scale={isSelected ? 10 : undefined}
              hasAnimated={hasAnimated}
              animateTo={animateTo}
            />
          );
        })}
        {selectedIndex !== null && (
          <Html
            center
            position={[0, -14, 0]}
            style={{ pointerEvents: "auto", userSelect: "none" }}
          >
            <button
              style={{
                background: "rgba(20,24,32,0.92)",
                color: "#fff",
                padding: "1.2rem 2.2rem",
                borderRadius: "1.2rem",
                fontSize: "2rem",
                fontWeight: 700,
                boxShadow: "0 4px 32px #000a",
                marginTop: "2.5rem",
                letterSpacing: "0.02em",
                textAlign: "center",
                cursor: "pointer",
                whiteSpace: "pre",
                backgroundImage: technologies[selectedIndex].wip
                  ? `url(${WIP})`
                  : undefined,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
              onClick={() => setSelectedIndex(null)}
            >
              {technologies[selectedIndex].name}
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 400,
                  marginTop: 8,
                  opacity: 0.7,
                }}
              >
                (Click to close)
              </div>
            </button>
          </Html>
        )}
      </group>
      <TrackballControls noZoom noPan makeDefault />
    </group>
  );
}
