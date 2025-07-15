import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SassyMLogoProps {
  scrollY: number;
}

export function MLogo({ scrollY }: SassyMLogoProps) {
  const { scene } = useGLTF("/m-logo/M-logo.gltf");
  const group = useRef<THREE.Group>(null);

  // Enter animation: scale and opacity
  const { scale, opacity } = useSpring({
    from: { scale: [0, 0, 0], opacity: 0 },
    to: { scale: [2.2, 2.2, 2.2], opacity: 1 },
    config: { duration: 2200, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
    delay: 200,
  });

  useEffect(() => {
    scene.rotation.set(-Math.PI / 2, 0, 0);
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mat.metalness = 0.95;
        mat.roughness = 0.15;
        mat.clearcoat = 1;
        mat.clearcoatRoughness = 0.05;
        mat.emissive = new THREE.Color("#00eaff");
        mat.emissiveIntensity = 0.25;
        mat.color = new THREE.Color("#00eaff");
        mat.envMapIntensity = 1.5;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.7) * 0.7 + scrollY * 0.002;
      group.current.rotation.x =
        Math.cos(state.clock.getElapsedTime() * 0.5) * 0.2;
      group.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 1.2) * 0.2 - scrollY * 0.003;
      group.current.position.z = -scrollY * 0.01;
    }
  });

  return (
    <a.group
      ref={group}
      dispose={null}
      scale={scale.to((x: number, y: number, z: number) => [x, y, z])}
    >
      <primitive object={scene} />
      <a.meshStandardMaterial attach="material" transparent opacity={opacity} />
    </a.group>
  );
}

// Preload the model
useGLTF.preload("/m-logo/M-logo.gltf");
