import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  type Group as ThreeGroup,
  type Mesh as ThreeMesh,
  MeshMatcapMaterial as ThreeMeshMatcapMaterial,
} from "three";
import { mainLogoPath } from "../constants";
import { useIsMobile } from "../hooks/useIsMobile";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scrollStore } from "../stores/scrollStore";

function createMatcapTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new CanvasTexture(canvas);

  // Dark base
  ctx.fillStyle = "#060612";
  ctx.fillRect(0, 0, size, size);

  // Key light — top-left, white → cyan specular highlight
  const highlight = ctx.createRadialGradient(
    size * 0.3,
    size * 0.25,
    0,
    size * 0.3,
    size * 0.25,
    size * 0.48,
  );
  highlight.addColorStop(0, "rgba(240, 255, 255, 1)");
  highlight.addColorStop(0.12, "rgba(0, 220, 255, 0.95)");
  highlight.addColorStop(0.45, "rgba(70, 0, 200, 0.4)");
  highlight.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, size, size);

  // Fill / bounce light — bottom-right, magenta
  const fill = ctx.createRadialGradient(
    size * 0.76,
    size * 0.78,
    0,
    size * 0.76,
    size * 0.78,
    size * 0.4,
  );
  fill.addColorStop(0, "rgba(255, 20, 180, 0.85)");
  fill.addColorStop(0.35, "rgba(130, 0, 255, 0.4)");
  fill.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, size, size);

  // Rim light — sphere edge, cyan glow
  const rim = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.28,
    size * 0.5,
    size * 0.5,
    size * 0.52,
  );
  rim.addColorStop(0, "rgba(0, 0, 0, 0)");
  rim.addColorStop(0.72, "rgba(0, 120, 220, 0.1)");
  rim.addColorStop(1, "rgba(0, 210, 255, 0.55)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, size, size);

  return new CanvasTexture(canvas);
}

export function MLogo() {
  const reducedMotion = useReducedMotion();
  const { scene } = useGLTF(mainLogoPath);
  const group = useRef<ThreeGroup>(null);
  const isMobile = useIsMobile();
  const matcapTexture = useMemo(() => createMatcapTexture(), []);

  const [{ scale, position }, springApi] = useSpring(() => ({
    scale: reducedMotion ? [1.5, 1.5, 1.5] : [0, 0, 0],
    position: reducedMotion ? [10, -5, -8] : [0, 0, 0],
    immediate: true,
  }));

  // Fire the entrance animation only after the loader finishes sliding out
  useEffect(() => {
    if (reducedMotion) return;
    const start = () => {
      springApi.start({
        scale: [2.2, 2.2, 2.2],
        position: [0, 0, 0],
        config: { duration: 2200, easing: (t: number) => 1 - (1 - t) ** 3 },
      });
    };
    document.addEventListener("app:ready", start, { once: true });
    return () => document.removeEventListener("app:ready", start);
  }, [reducedMotion, springApi]);

  const outerRef = useRef<ThreeGroup>(null);
  const selectScaleRef = useRef(1.0);
  const smoothScrollRef = useRef({ y: 0, z: 0, rot: 0 });
  const ring1Ref = useRef<ThreeMesh>(null);
  const ring2Ref = useRef<ThreeMesh>(null);
  const ring3Ref = useRef<ThreeMesh>(null);

  useFrame((state, delta) => {
    // Selection shrink — runs regardless of reducedMotion so it always responds
    if (outerRef.current) {
      const targetScale = scrollStore.techBoxSelected ? 0 : 1.0;
      selectScaleRef.current += (targetScale - selectScaleRef.current) * 0.09;
      outerRef.current.scale.setScalar(selectScaleRef.current);
    }

    if (reducedMotion || !group.current) return;

    const t = state.clock.getElapsedTime();
    const raw = scrollStore.raw;

    const damping = 0.08;
    smoothScrollRef.current.y +=
      (Math.max(raw * -0.003, -4) - smoothScrollRef.current.y) * damping;
    const zMax = isMobile ? -8 : -12;
    // Monotonic push-back: M moves away steadily as user scrolls (no sin oscillation that
    // would stutter when sin cycles back toward 0 around the tech-stack section)
    const zT = 1 - Math.exp(-raw * 0.0003);
    const zTarget = zMax * zT;
    smoothScrollRef.current.z +=
      (zTarget - smoothScrollRef.current.z) * damping;
    smoothScrollRef.current.rot +=
      (raw * 0.002 - smoothScrollRef.current.rot) * damping;

    group.current.rotation.y =
      Math.sin(t * 0.7) * 0.7 + smoothScrollRef.current.rot;
    group.current.rotation.x = Math.cos(t * 0.5) * 0.2;
    const posY = Math.sin(t * 1.2) * 0.2 + smoothScrollRef.current.y;
    // Offset 3 units back so the orbital rings clear the project gallery planes (z=3)
    const posZ = smoothScrollRef.current.z - 3;
    group.current.position.y = posY;
    group.current.position.z = posZ;

    // Publish for TechConstellation to co-locate on the M
    scrollStore.mLogoY = posY;
    scrollStore.mLogoZ = posZ;

    // Rings rotate on independent axes, scroll also nudges their tilt
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.4;
      ring1Ref.current.rotation.x = raw * 0.0003;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * 0.28;
      ring2Ref.current.rotation.y = raw * 0.0002;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y += delta * 0.18;
      ring3Ref.current.rotation.z = raw * 0.00015;
    }
  });

  useLayoutEffect(() => {
    scene.rotation.set(-Math.PI / 2, 0, 0);

    // Collect first — avoid mutating children during traverse
    const realMeshes: ThreeMesh[] = [];
    scene.traverse((child) => {
      const mesh = child as ThreeMesh;
      if (mesh.isMesh) realMeshes.push(mesh);
    });

    const created: ThreeMeshMatcapMaterial[] = [];
    for (const mesh of realMeshes) {
      const mat = new ThreeMeshMatcapMaterial({ matcap: matcapTexture });
      const old = mesh.material;
      if (old && !Array.isArray(old)) old.dispose();
      mesh.material = mat;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      created.push(mat);
    }

    return () => {
      for (const mat of created) mat.dispose();
    };
  }, [scene, matcapTexture]);

  useLayoutEffect(() => {
    if (!reducedMotion && group.current?.position) {
      group.current.position.set(0, 0, 0);
    }
  }, [reducedMotion]);

  return (
    <group ref={outerRef}>
      <a.group
        ref={group}
        dispose={null}
        scale={scale as unknown as [number, number, number]}
        {...(reducedMotion
          ? { position: position as unknown as [number, number, number] }
          : false)}
      >
        <primitive object={scene} />

        {/* Orbital rings — co-move with the M logo */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.025, 8, 120]} />
          <meshBasicMaterial color="#00eeff" opacity={0.35} transparent />
        </mesh>
        <mesh ref={ring2Ref} rotation={[0.4, 0, 0.3]}>
          <torusGeometry args={[3.2, 0.018, 8, 120]} />
          <meshBasicMaterial color="#a855f7" opacity={0.28} transparent />
        </mesh>
        <mesh ref={ring3Ref} rotation={[1.1, 0.6, 0]}>
          <torusGeometry args={[2.4, 0.022, 8, 120]} />
          <meshBasicMaterial color="#ffffff" opacity={0.18} transparent />
        </mesh>
      </a.group>
    </group>
  );
}
