import { Float } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
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

export default function TechBox(props: TechBoxProps) {
  const meshRotation = useMemo(
    () => new THREE.Euler(Math.random(), Math.random(), Math.random()),
    [],
  );

  const meshRef = useRef<THREE.Mesh>(null);

  const { camera } = useThree();

  const prevCameraPosition = useRef(new THREE.Vector3());
  const rotationSpeed = useRef(0);

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
    const targetPos = props.animateTo || props.position;
    meshRef.current.position.lerp(
      targetPos,
      props.animateTo.z === -500 ? 0.01 : 0.15, // Adjust lerp speed based on z position
    );

    // Scales boxes up to custom scale if provided, else default 3
    const targetScale = new THREE.Vector3(
      props.scale || 3,
      props.scale || 3,
      props.scale || 3,
    );
    meshRef.current.scale.lerp(
      targetScale,
      props.animateTo.z === -500 ? 0.01 : 0.025, // Adjust lerp speed based on z position
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
        name={props.data.name}
        castShadow
        receiveShadow
        // position is now animated in useFrame
        rotation={meshRotation}
        onClick={props.onClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <BoxShader data={props.data} />
      </mesh>
    </Float>
  );
}
