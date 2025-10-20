import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { mainLogoPath } from "../constants";

interface SassyMLogoProps {
  scrollY: number;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  mouse: React.RefObject<{ x: number; y: number }>;
  reducedMotion?: boolean;
}

export function MLogo({
  scrollY,
  cameraRef,
  mouse,
  reducedMotion = false,
}: SassyMLogoProps) {
  const { scene } = useGLTF(mainLogoPath);

  const group = useRef<THREE.Group>(null);

  // Scale and opacity - animated entrance for normal mode, instant for reduced motion
  const springConfig = useSpring({
    from: reducedMotion
      ? { scale: [1.5, 1.5, 1.5], opacity: 1, position: [10, -5, -8] }
      : { scale: [0, 0, 0], opacity: 0, position: [0, 0, 0] }, // Animate from 0!
    to: reducedMotion
      ? {
          scale: [1.5, 1.5, 1.5],
          opacity: 1,
          position: [10, -5, -8], // More bottom right
        }
      : { scale: [2.2, 2.2, 2.2], opacity: 1, position: [0, 0, 0] },
    config: { duration: 2200, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
    delay: 500,
    immediate: reducedMotion, // Only skip animation if reduced motion
  });

  const { scale, opacity, position } = springConfig;

  // Store mesh materials for animation
  const meshMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  // Reuse color objects to avoid creating new ones every frame
  const colorARef = useRef(new THREE.Color("#00eaff"));
  const colorBRef = useRef(new THREE.Color("#e12afb"));
  const targetColorRef = useRef(new THREE.Color());

  // Smooth scroll values for weighted/inertial feel
  // Initialize z to 0 so logo is visible on load (camera is at z=10, looking at origin)
  const smoothScrollRef = useRef({ y: 0, z: 0, rot: 0 });

  // Camera parallax effect
  // Note: Three.js animation loops require mutations - this is intentional
  /* eslint-disable react-compiler/react-compiler */
  useFrame((state) => {
    // Skip animations if user prefers reduced motion
    if (reducedMotion || !group.current) return;

    const t = state.clock.getElapsedTime();

    // Smooth/lerp scroll values for weight/inertia (0.05 = heavy, 0.2 = light)
    const damping = 0.08;
    smoothScrollRef.current.y +=
      (scrollY * -0.003 - smoothScrollRef.current.y) * damping;
    smoothScrollRef.current.z +=
      (scrollY * -0.01 - smoothScrollRef.current.z) * damping;
    smoothScrollRef.current.rot +=
      (scrollY * 0.002 - smoothScrollRef.current.rot) * damping;

    group.current.rotation.y =
      Math.sin(t * 0.7) * 0.7 + smoothScrollRef.current.rot;
    group.current.rotation.x = Math.cos(t * 0.5) * 0.2;
    group.current.position.y =
      Math.sin(t * 1.2) * 0.2 + smoothScrollRef.current.y;
    group.current.position.z = smoothScrollRef.current.z;
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

    // Camera parallax
    const camera = cameraRef.current;
    if (!camera) return;
    const currentPos = camera.position;
    const targetX = mouse.current.x * 1.5;
    const targetY = mouse.current.y * 0.7;
    // Create new position to avoid direct mutation
    currentPos.x += (targetX - currentPos.x) * 0.08;
    currentPos.y += (targetY - currentPos.y) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  /* eslint-enable react-compiler/react-compiler */

  // Set rotation and materials BEFORE first paint (prevents flip and ensures proper setup)
  useLayoutEffect(() => {
    // Set rotation
    scene.rotation.set(-Math.PI / 2, 0, 0);

    // Setup materials (only needs to run once per scene)
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
  }, [scene]); // Only depends on scene, not reducedMotion

  // Set initial position for normal mode
  useLayoutEffect(() => {
    if (!reducedMotion && group.current) group.current.position.set(0, 0, 0);
  }, [reducedMotion]);

  return (
    <a.group
      ref={group}
      dispose={null}
      scale={scale.to((x: number, y: number, z: number) => [x, y, z])}
      {...(reducedMotion
        ? {
            position: position.to((x: number, y: number, z: number) => [
              x,
              y,
              z,
            ]),
          }
        : false)}
    >
      <primitive object={scene} />
      <a.meshStandardMaterial attach="material" transparent opacity={opacity} />
    </a.group>
  );
}
