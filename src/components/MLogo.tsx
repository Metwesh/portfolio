import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import {
  Color as ThreeColor,
  type Group as ThreeGroup,
  type Mesh as ThreeMesh,
  type MeshPhysicalMaterial as ThreeMeshPhysicalMaterial,
  type PerspectiveCamera as ThreePerspectiveCamera,
} from "three";
import { mainLogoPath } from "../constants";
import { useIsMobile } from "../hooks/useIsMobile";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface SassyMLogoProps {
  scrollY: number;
  cameraRef: React.RefObject<ThreePerspectiveCamera | null>;
  mouse: React.RefObject<{ x: number; y: number }>;
}

export function MLogo({ scrollY, cameraRef, mouse }: SassyMLogoProps) {
  const reducedMotion = useReducedMotion();

  const { scene } = useGLTF(mainLogoPath);

  const group = useRef<ThreeGroup>(null);

  const isMobile = useIsMobile();

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
    config: { duration: 2200, easing: (t: number) => 1 - (1 - t) ** 3 },
    delay: 500,
    immediate: reducedMotion, // Only skip animation if reduced motion
  });

  const { scale, opacity, position } = springConfig;

  // Store mesh materials for animation
  const meshMaterialsRef = useRef<ThreeMeshPhysicalMaterial[]>([]);

  // Reuse color objects to avoid creating new ones every frame
  const colorARef = useRef(new ThreeColor("#00eaff"));
  const colorBRef = useRef(new ThreeColor("#e12afb"));
  const targetColorRef = useRef(new ThreeColor());

  // Smooth scroll values for weighted/inertial feel
  // Initialize z to 0 so logo is visible on load (camera is at z=10, looking at origin)
  const smoothScrollRef = useRef({ y: 0, z: 0, rot: 0 });

  // Camera parallax effect
  // Note: Three.js animation loops require mutations - this is intentional
  useFrame((state) => {
    // Skip animations if user prefers reduced motion
    if (reducedMotion || !group.current) return;

    const t = state.clock.getElapsedTime();

    // Smooth/lerp scroll values for weight/inertia (0.05 = heavy, 0.2 = light)
    const damping = 0.08;
    const minYOffset = -4;
    const yTarget = Math.max(scrollY * -0.003, minYOffset);
    smoothScrollRef.current.y +=
      (yTarget - smoothScrollRef.current.y) * damping;
    const maxZOffset = isMobile ? -20 : -12;
    const zTarget = Math.max(scrollY * -0.01, maxZOffset);
    smoothScrollRef.current.z +=
      (zTarget - smoothScrollRef.current.z) * damping;
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

  // Set rotation and materials BEFORE first paint (prevents flip and ensures proper setup)
  useLayoutEffect(() => {
    // Set rotation
    scene.rotation.set(-Math.PI / 2, 0, 0);

    // Setup materials (only needs to run once per scene)
    const materials: ThreeMeshPhysicalMaterial[] = [];
    scene.traverse((child) => {
      if ((child as ThreeMesh).isMesh && (child as ThreeMesh).material) {
        const mesh = child as ThreeMesh;
        const mat = mesh.material as ThreeMeshPhysicalMaterial;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mat.metalness = 0.95;
        mat.roughness = 0.15;
        mat.clearcoat = 1;
        mat.clearcoatRoughness = 0.05;
        mat.emissive = new ThreeColor("#00eaff");
        mat.emissiveIntensity = 0.25;
        mat.color = new ThreeColor("#00eaff");
        mat.envMapIntensity = 1.5;
        materials.push(mat);
      }
    });
    meshMaterialsRef.current = materials;
  }, [scene]); // Only depends on scene, not reducedMotion

  // Set initial position for normal mode
  useLayoutEffect(() => {
    if (!reducedMotion && group.current?.position) {
      group.current.position.set(0, 0, 0);
    }
  }, [reducedMotion]);

  // Cleanup: GLTFs loaded with useGLTF are cached globally, no disposal needed
  // However, if materials are cloned, they should be disposed
  // In this case, we're using the original materials so no cleanup needed

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
