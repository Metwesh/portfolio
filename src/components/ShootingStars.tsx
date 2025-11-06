import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import {
  CylinderGeometry as ThreeCylinderGeometry,
  Group as ThreeGroup,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  Mesh as ThreeMeshType,
  Quaternion as ThreeQuaternion,
  SphereGeometry as ThreeSphereGeometry,
  Vector3 as ThreeVector3,
} from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface ShootingStar {
  id: number;
  position: ThreeVector3;
  velocity: ThreeVector3;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  groupRef: ThreeGroup | null;
}

interface ShootingStarsProps {
  count?: number;
}

export function ShootingStars({ count = 20 }: ShootingStarsProps) {
  const reducedMotion = useReducedMotion();
  const starsRef = useRef<ShootingStar[]>([]);
  const nextIdRef = useRef(0);
  const groupRef = useRef<ThreeGroup>(null);

  // Create a new shooting star
  const createShootingStar = useCallback((): ShootingStar => {
    // Random position in view
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 50 + 20; // Bias towards upper area
    const z = (Math.random() - 0.5) * 50;

    // Direction: mostly diagonal downward-right
    const velocityX = -(Math.random() * 0.5 + 0.3);
    const velocityY = -(Math.random() * 0.3 + 0.2);
    const velocityZ = Math.random() * 0.2 - 0.1;

    return {
      id: nextIdRef.current++,
      position: new ThreeVector3(x, y, z),
      velocity: new ThreeVector3(velocityX, velocityY, velocityZ),
      opacity: 1,
      lifetime: 0,
      maxLifetime: Math.random() * 2 + 2, // 2-4 seconds
      groupRef: null,
    };
  }, []);

  // Helper to create Three.js group for a star
  const createStarGroup = useCallback((star: ShootingStar): ThreeGroup => {
    const group = new ThreeGroup();
    group.position.copy(star.position);

    // Calculate trail orientation
    const direction = star.velocity.clone().normalize();
    const length = 3;

    // Main bright point
    const mainGeometry = new ThreeSphereGeometry(0.05, 8, 8);
    const mainMaterial = new ThreeMeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: star.opacity,
      depthWrite: false,
    });
    const mainMesh = new ThreeMeshType(mainGeometry, mainMaterial);
    group.add(mainMesh);

    // Trail
    const trailGeometry = new ThreeCylinderGeometry(0.02, 0.08, length, 8);
    const trailMaterial = new ThreeMeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: star.opacity * 0.2,
      depthWrite: false,
    });
    const trailMesh = new ThreeMeshType(trailGeometry, trailMaterial);

    // Orient trail
    const trailOffset = direction.clone().multiplyScalar(-length / 2);
    trailMesh.position.copy(trailOffset);
    const axis = new ThreeVector3(0, 1, 0);
    const quaternion = new ThreeQuaternion().setFromUnitVectors(
      axis,
      direction
    );
    trailMesh.quaternion.copy(quaternion);
    group.add(trailMesh);

    // Glow
    const glowGeometry = new ThreeSphereGeometry(0.2, 8, 8);
    const glowMaterial = new ThreeMeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: star.opacity * 0.15,
      depthWrite: false,
    });
    const glowMesh = new ThreeMeshType(glowGeometry, glowMaterial);
    group.add(glowMesh);

    return group;
  }, []);

  // Spawn shooting stars at random intervals
  useEffect(() => {
    if (reducedMotion) return;

    const spawnStar = () => {
      // Defensive check: ensure groupRef is a valid THREE.Group
      if (!groupRef.current || typeof groupRef.current.add !== "function")
        return;

      const activeStars = starsRef.current.filter(
        (star) => star.lifetime < star.maxLifetime
      );

      if (activeStars.length < count) {
        const newStar = createShootingStar();
        const starGroup = createStarGroup(newStar);
        newStar.groupRef = starGroup;
        groupRef.current.add(starGroup);
        starsRef.current = [...activeStars, newStar];
      }
    };

    // Delay initial spawn to ensure Three.js group is ready
    const initialSpawn = setTimeout(() => {
      for (let i = 0; i < Math.min(count, 2); i++) {
        spawnStar();
      }
    }, 100);

    // Spawn new stars at intervals
    const spawnInterval = setInterval(spawnStar, 3000); // Spawn every 3 seconds

    return () => {
      clearTimeout(initialSpawn);
      clearInterval(spawnInterval);
    };
  }, [count, reducedMotion, createShootingStar, createStarGroup]);

  // Animate stars using direct mutation - no React re-renders
  // This is the proper way to handle animations in React Three Fiber
  useFrame((_, delta) => {
    if (
      reducedMotion ||
      !groupRef.current ||
      typeof groupRef.current.remove !== "function"
    ) {
      return;
    }

    const stars = starsRef.current;
    const newStars: ShootingStar[] = [];

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Update position directly (no state updates)
      star.position.x += star.velocity.x * delta * 60;
      star.position.y += star.velocity.y * delta * 60;
      star.position.z += star.velocity.z * delta * 60;

      // Update lifetime
      star.lifetime += delta;

      // Fade out in the last 20% of lifetime
      const fadeStart = star.maxLifetime * 0.8;
      if (star.lifetime > fadeStart) {
        star.opacity =
          1 - (star.lifetime - fadeStart) / (star.maxLifetime - fadeStart);
      }

      // Update the group position if it exists
      if (star.groupRef) {
        star.groupRef.position.copy(star.position);

        // Update opacity on all materials
        star.groupRef.traverse((child) => {
          if ((child as ThreeMeshType).isMesh) {
            const mesh = child as ThreeMeshType;
            const material = mesh.material as ThreeMeshBasicMaterial;
            if (material.transparent) {
              // Different opacity for different elements
              if (mesh.geometry.type === "SphereGeometry") {
                const radius = (mesh.geometry as ThreeSphereGeometry).parameters
                  .radius;
                material.opacity =
                  radius > 0.1 ? star.opacity * 0.15 : star.opacity;
              } else if (mesh.geometry.type === "CylinderGeometry") {
                material.opacity = star.opacity * 0.2;
              }
            }
          }
        });
      }

      // Remove expired stars
      if (star.lifetime >= star.maxLifetime) {
        if (star.groupRef && groupRef.current) {
          groupRef.current.remove(star.groupRef);
          // Dispose geometries and materials to prevent memory leaks
          star.groupRef.traverse((child) => {
            if ((child as ThreeMeshType).isMesh) {
              const mesh = child as ThreeMeshType;
              mesh.geometry?.dispose();
              if (Array.isArray(mesh.material)) {
                for (const mat of mesh.material) {
                  mat.dispose();
                }
              } else {
                mesh.material?.dispose();
              }
            }
          });
        }
      } else {
        newStars.push(star);
      }
    }

    starsRef.current = newStars;
  });

  if (reducedMotion) return null;

  return <group ref={groupRef}>{/* Stars are managed imperatively */}</group>;
}
