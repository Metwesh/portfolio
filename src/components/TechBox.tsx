import { Float } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import BoxShader from "../shaders/BoxShader";

interface TechBoxProps {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
  position: THREE.Vector3;
  onClick: () => void;
  scale: number | undefined;
  animateTo: THREE.Vector3;
}

export default function TechBox({
  data,
  position,
  onClick,
  scale,
  animateTo,
}: TechBoxProps) {
  const [meshRotation] = useState(
    () => new THREE.Euler(Math.random(), Math.random(), Math.random()),
  );

  const meshRef = useRef<THREE.Mesh>(null);

  const { camera } = useThree();

  const prevCameraPosition = useRef(new THREE.Vector3());
  const rotationSpeed = useRef(0);
  // Reuse Vector3 object instead of creating new one every frame
  const targetScaleRef = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshRef.current || !camera) return;

    // Randomly moves boxes around as you rotate
    const deltaPosition = camera.position
      .clone()
      .sub(prevCameraPosition.current);
    rotationSpeed.current = deltaPosition.length() * 0.1; // Rotation scale factor

    meshRef.current.rotation.x += rotationSpeed.current;
    meshRef.current.rotation.y += rotationSpeed.current;

    prevCameraPosition.current = camera.position.clone();

    // Animate position
    const targetPos = animateTo || position;
    meshRef.current.position.lerp(
      targetPos,
      animateTo.z === -500 ? 0.01 : 0.15, // Adjust lerp speed based on z position
    );

    // Scales boxes up to custom scale if provided, else default 3
    // Reuse Vector3 object to avoid memory allocation every frame
    const scaleValue = scale || 3;
    targetScaleRef.current.set(scaleValue, scaleValue, scaleValue);
    meshRef.current.scale.lerp(
      targetScaleRef.current,
      animateTo.z === -500 ? 0.01 : 0.025, // Adjust lerp speed based on z position
    );

    // Rotates boxes around themselves
    meshRef.current.rotation.x = meshRef.current.rotation.x + 0.005;
    meshRef.current.rotation.y = meshRef.current.rotation.y - 0.005;
  });

  return (
    <Float
      speed={1.75}
      rotationIntensity={1}
      floatIntensity={1}
      position={[0, 0, 0.05]}
      floatingRange={[0.25, 0.25]}
    >
      <mesh
        ref={meshRef}
        name={data.name}
        castShadow
        receiveShadow
        // position is now animated in useFrame
        rotation={meshRotation}
        onClick={(e) => {
          if (
            e.intersections &&
            e.intersections[0]?.object === meshRef.current
          ) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <BoxShader data={data} />
      </mesh>
    </Float>
  );
}
