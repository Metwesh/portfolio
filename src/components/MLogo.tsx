import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SassyMLogoProps {
  scrollY: number;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  mouse: React.RefObject<{ x: number; y: number }>;
}

export function MLogo({ scrollY, cameraRef, mouse }: SassyMLogoProps) {
  const { scene } = useGLTF("./m-logo/M-logo.gltf");

  const group = useRef<THREE.Group>(null);

  // Enter animation: scale and opacity
  const { scale, opacity } = useSpring({
    from: { scale: [0, 0, 0], opacity: 0 },
    to: { scale: [2.2, 2.2, 2.2], opacity: 1 },
    config: { duration: 2200, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
    delay: 500,
  });
  // Camera parallax effect
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.7) * 0.7 + scrollY * 0.002;
      group.current.rotation.x = Math.cos(t * 0.5) * 0.2;
      group.current.position.y = Math.sin(t * 1.2) * 0.2 - scrollY * 0.003;
      group.current.position.z = -scrollY * 0.01;
    }
    // Subtle shimmer/pulse color effect
    const shimmer = 0.5 + 0.5 * Math.sin(t * 2.2);
    const color = new THREE.Color().lerpColors(
      new THREE.Color("#00eaff"),
      new THREE.Color("#e12afb"),
      shimmer * 0.5,
    );
    meshMaterials.current.forEach((mat) => {
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.emissiveIntensity = 0.18 + shimmer * 0.22;
    });
    if (cameraRef.current) {
      const targetX = mouse.current.x * 1.5;
      const targetY = mouse.current.y * 0.7;
      cameraRef.current.position.x +=
        (targetX - cameraRef.current.position.x) * 0.08;
      cameraRef.current.position.y +=
        (targetY - cameraRef.current.position.y) * 0.08;
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  // Store mesh materials for animation
  const meshMaterials = useRef<THREE.MeshPhysicalMaterial[]>([]);

  useEffect(() => {
    scene.rotation.set(-Math.PI / 2, 0, 0);
    meshMaterials.current = [];
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
        meshMaterials.current.push(mat);
      }
    });
  }, [scene]);

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
