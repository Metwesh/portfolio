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

  // Store mesh materials for animation
  const meshMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  // Reuse color objects to avoid creating new ones every frame
  const colorARef = useRef(new THREE.Color("#00eaff"));
  const colorBRef = useRef(new THREE.Color("#e12afb"));
  const targetColorRef = useRef(new THREE.Color());

  // Smooth scroll values for weighted/inertial feel
  const smoothScrollRef = useRef({ y: 0, z: 0, rot: 0 });

  // Camera parallax effect
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smooth/lerp scroll values for weight/inertia (0.05 = heavy, 0.2 = light)
    const damping = 0.08;
    smoothScrollRef.current.y +=
      (scrollY * -0.003 - smoothScrollRef.current.y) * damping;
    smoothScrollRef.current.z +=
      (scrollY * -0.01 - smoothScrollRef.current.z) * damping;
    smoothScrollRef.current.rot +=
      (scrollY * 0.002 - smoothScrollRef.current.rot) * damping;

    if (group.current) {
      group.current.rotation.y =
        Math.sin(t * 0.7) * 0.7 + smoothScrollRef.current.rot;
      group.current.rotation.x = Math.cos(t * 0.5) * 0.2;
      group.current.position.y =
        Math.sin(t * 1.2) * 0.2 + smoothScrollRef.current.y;
      group.current.position.z = smoothScrollRef.current.z;
    }
    // Subtle shimmer/pulse color effect - reuse color objects
    const shimmer = 0.5 + 0.5 * Math.sin(t * 2.2);
    targetColorRef.current.lerpColors(
      colorARef.current,
      colorBRef.current,
      shimmer * 0.5,
    );

    const emissiveIntensity = 0.18 + shimmer * 0.22;
    const materialsCount = meshMaterialsRef.current.length;

    for (let i = 0; i < materialsCount; i++) {
      const mat = meshMaterialsRef.current[i];
      mat.color.copy(targetColorRef.current);
      mat.emissive.copy(targetColorRef.current);
      mat.emissiveIntensity = emissiveIntensity;
    }

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

  useEffect(() => {
    scene.rotation.set(-Math.PI / 2, 0, 0);
    const materials: THREE.MeshPhysicalMaterial[] = [];
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
        materials.push(mat);
      }
    });
    meshMaterialsRef.current = materials;
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
