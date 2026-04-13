import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  type Group as ThreeGroup,
  type Mesh as ThreeMesh,
  type MeshBasicMaterial as ThreeMeshBasicMaterial,
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

  const outerRef = useRef<ThreeGroup>(null);
  const selectZRef = useRef(0);
  const selectOpacityRef = useRef(1.0);
  const mMaterialsRef = useRef<ThreeMeshMatcapMaterial[]>([]);
  const smoothScrollRef = useRef({ y: 0, z: 0, rot: 0 });
  const ring1Ref = useRef<ThreeMesh>(null);
  const ring2Ref = useRef<ThreeMesh>(null);
  const ring3Ref = useRef<ThreeMesh>(null);

  // Ring animation state
  const ringTiltRef = useRef(0); // 0 = all-flat (saturn rings), 1 = orb config
  const ringReadyRef = useRef(false);
  const ring1SpinRef = useRef(0); // accumulated z-spin
  const ring2SpinRef = useRef(0); // accumulated x-spin
  const ring3SpinRef = useRef(0); // accumulated y-spin
  const ringDramaRef = useRef(0); // 0→1 when box selected
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire the entrance animation only after the loader finishes sliding out
  useEffect(() => {
    if (reducedMotion) return;
    const start = () => {
      springApi.start({
        scale: [2.2, 2.2, 2.2],
        position: [0, 0, 0],
        config: { duration: 2200, easing: (t: number) => 1 - (1 - t) ** 3 },
      });
      // Delay ring fan-out until M is fully scaled in — user sees flat saturn rings
      // first, then they fan out into the orb configuration
      ringTimerRef.current = setTimeout(() => {
        ringReadyRef.current = true;
      }, 2400);
    };
    document.addEventListener("app:ready", start, { once: true });
    return () => {
      document.removeEventListener("app:ready", start);
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    };
  }, [reducedMotion, springApi]);

  useFrame((state, delta) => {
    const isSelected = scrollStore.techBoxSelected;

    // M opacity + Z drift — quadratic curve keeps M bright longer then drops fast
    const targetOpacity = isSelected ? 0 : 1;
    selectOpacityRef.current +=
      (targetOpacity - selectOpacityRef.current) * 0.05;
    const op = selectOpacityRef.current * selectOpacityRef.current;

    if (outerRef.current) {
      const targetZ = isSelected ? -18 : 0;
      selectZRef.current += (targetZ - selectZRef.current) * 0.05;
      outerRef.current.position.z = selectZRef.current;

      for (const mat of mMaterialsRef.current) {
        const shouldBeTransparent = op < 0.99;
        if (mat.transparent !== shouldBeTransparent) {
          mat.transparent = shouldBeTransparent;
          mat.needsUpdate = true;
        }
        mat.opacity = op;
      }
    }

    // Ring drama: spin up + expand + flatten on selection, glow then fade
    ringDramaRef.current +=
      ((isSelected ? 1 : 0) - ringDramaRef.current) * 0.05;
    const drama = ringDramaRef.current;
    const ringBases = [0.35, 0.28, 0.18];
    [ring1Ref, ring2Ref, ring3Ref].forEach((ref, i) => {
      const mat = ref.current?.material as ThreeMeshBasicMaterial | undefined;
      if (!mat) return;
      const glow = drama > 0 ? 1 + Math.sin(drama * Math.PI) * 0.8 : 1;
      const ringFade = drama > 0 ? Math.max(0, 1 - drama * 1.2) : op;
      const newOpacity = Math.min(1, ringBases[i] * glow * ringFade);
      mat.opacity = newOpacity;
      const shouldBeTransparent = newOpacity < 0.99;
      if (mat.transparent !== shouldBeTransparent) {
        mat.transparent = shouldBeTransparent;
        mat.needsUpdate = true;
      }
    });

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

    // ─── Ring animations ──────────────────────────────────────────────────────
    // Enter: lerp tilt 0 (all-flat saturn) → 1 (orb) on app:ready
    const tiltTarget = ringReadyRef.current ? 1 : 0;
    ringTiltRef.current += (tiltTarget - ringTiltRef.current) * 0.028;

    const spinMult = 1 + drama * 5; // spin up to 6× on selection
    // Flatten rings back toward saturn as M retreats
    const et = ringTiltRef.current * (1 - drama * 0.85);
    const lr = (a: number, b: number, tt: number) => a + (b - a) * tt;

    // Accumulated spins (each ring spins on its primary axis)
    ring1SpinRef.current += delta * 0.4 * spinMult;
    ring2SpinRef.current -= delta * 0.28 * spinMult;
    ring3SpinRef.current += delta * 0.18 * spinMult;

    // Expand outward on selection
    const ringScale = 1 + drama * 1.5;

    if (ring1Ref.current) {
      // ring1 target tilt = [PI/2, 0, 0] = same as flat, so it just spins on z
      ring1Ref.current.rotation.x = Math.PI / 2;
      ring1Ref.current.rotation.y = 0;
      ring1Ref.current.rotation.z =
        ring1SpinRef.current + raw * 0.0003 * (1 - drama);
      ring1Ref.current.scale.setScalar(ringScale);
    }
    if (ring2Ref.current) {
      // ring2 target tilt: x→0.4, z→0.3; spins on x
      ring2Ref.current.rotation.x =
        lr(Math.PI / 2, 0.4, et) + ring2SpinRef.current;
      ring2Ref.current.rotation.y = raw * 0.0002 * (1 - drama);
      ring2Ref.current.rotation.z = lr(0, 0.3, et);
      ring2Ref.current.scale.setScalar(ringScale);
    }
    if (ring3Ref.current) {
      // ring3 target tilt: x→1.1, y→0.6; spins on y
      ring3Ref.current.rotation.x = lr(Math.PI / 2, 1.1, et);
      ring3Ref.current.rotation.y = lr(0, 0.6, et) + ring3SpinRef.current;
      ring3Ref.current.rotation.z = raw * 0.00015 * (1 - drama);
      ring3Ref.current.scale.setScalar(ringScale);
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

    mMaterialsRef.current = created;
    return () => {
      mMaterialsRef.current = [];
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
          <torusGeometry args={[2.8, 0.025, 6, 64]} />
          <meshBasicMaterial color="#00eeff" opacity={0.35} transparent />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.018, 6, 64]} />
          <meshBasicMaterial color="#a855f7" opacity={0.28} transparent />
        </mesh>
        <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.022, 6, 64]} />
          <meshBasicMaterial color="#ffffff" opacity={0.18} transparent />
        </mesh>
      </a.group>
    </group>
  );
}
