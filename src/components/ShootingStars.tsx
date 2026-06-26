import { useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import {
  AdditiveBlending as ThreeAdditiveBlending,
  BufferAttribute as ThreeBufferAttribute,
  BufferGeometry as ThreeBufferGeometry,
  Group as ThreeGroup,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  Mesh as ThreeMeshType,
  type PerspectiveCamera as ThreePerspectiveCamera,
  Quaternion as ThreeQuaternion,
  ShaderMaterial as ThreeShaderMaterial,
  SphereGeometry as ThreeSphereGeometry,
  Vector3 as ThreeVector3,
} from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";

// ─── Shared geometries (session singletons) ───────────────────────────────────
const _headGeo = new ThreeSphereGeometry(0.06, 7, 7);
const _glowGeo = new ThreeSphereGeometry(0.32, 7, 7);

// Flat quad trail: head at Y=0 (bright/narrow), tail at Y=-TRAIL_L (transparent/wide).
// Rotating Y→velocity makes the trail stream behind the head naturally.
const TRAIL_L = 9;
const TRAIL_W = 0.065;
const _trailGeo = (() => {
  const geo = new ThreeBufferGeometry();
  const hw = TRAIL_W * 0.06; // head half-width (nearly a point)
  const tw = TRAIL_W; // tail half-width
  // biome-ignore format: keep vertex layout readable
  const pos = new Float32Array([
    -hw,
    0,
    0, // 0 head-left
    hw,
    0,
    0, // 1 head-right
    -tw,
    -TRAIL_L,
    0, // 2 tail-left
    tw,
    -TRAIL_L,
    0, // 3 tail-right
  ]);
  const alpha = new Float32Array([1.0, 1.0, 0.0, 0.0]);
  geo.setAttribute("position", new ThreeBufferAttribute(pos, 3));
  geo.setAttribute("aAlpha", new ThreeBufferAttribute(alpha, 1));
  geo.setIndex([0, 2, 1, 1, 2, 3]);
  return geo;
})();

// Trail shader: alpha-gradient streak using per-vertex aAlpha
const TRAIL_VERT = `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const TRAIL_FRAG = `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * uOpacity);
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface StarMaterials {
  head: ThreeMeshBasicMaterial;
  trail: ThreeShaderMaterial;
  glow: ThreeMeshBasicMaterial;
}

interface ShootingStar {
  id: number;
  position: ThreeVector3;
  velocity: ThreeVector3;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  groupRef: ThreeGroup | null;
  materials: StarMaterials | null;
}

// ─── Reusable vectors (avoid per-frame allocation) ───────────────────────────
const _right = new ThreeVector3();
const _up = new ThreeVector3();
const _fwd = new ThreeVector3();
const _camPos = new ThreeVector3();

const SPAWN_INTERVAL = 2.2;
const BURST_INTERVAL = 0.35;
const BURST_COUNT = 3;

interface ShootingStarsProps {
  count?: number;
}

export function ShootingStars({ count = 20 }: ShootingStarsProps) {
  const reducedMotion = useReducedMotion();
  const starsRef = useRef<ShootingStar[]>([]);
  const nextIdRef = useRef(0);
  const groupRef = useRef<ThreeGroup>(null);
  const spawnTimerRef = useRef(BURST_INTERVAL); // fire immediately on first frame
  const burstRemainingRef = useRef(BURST_COUNT);

  const createStarGroup = useCallback((star: ShootingStar): ThreeGroup => {
    const group = new ThreeGroup();
    group.position.copy(star.position);

    const headMat = new ThreeMeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: ThreeAdditiveBlending,
    });
    group.add(new ThreeMeshType(_headGeo, headMat));

    const trailMat = new ThreeShaderMaterial({
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: TRAIL_VERT,
      fragmentShader: TRAIL_FRAG,
      transparent: true,
      depthWrite: false,
      blending: ThreeAdditiveBlending,
      side: 2, // DoubleSide
    });
    const trailMesh = new ThreeMeshType(_trailGeo, trailMat);
    const q = new ThreeQuaternion().setFromUnitVectors(
      new ThreeVector3(0, 1, 0),
      star.velocity.clone().normalize(),
    );
    trailMesh.quaternion.copy(q);
    group.add(trailMesh);

    const glowMat = new ThreeMeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: ThreeAdditiveBlending,
    });
    group.add(new ThreeMeshType(_glowGeo, glowMat));

    star.materials = { head: headMat, trail: trailMat, glow: glowMat };
    return group;
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const camera = state.camera as ThreePerspectiveCamera;

    // ─── Spawning ───────────────────────────────────────────────────────────
    // starsRef.current is compacted to alive-only at end of each frame
    if (starsRef.current.length < count) {
      const isBurst = burstRemainingRef.current > 0;
      spawnTimerRef.current += delta;
      if (
        spawnTimerRef.current >= (isBurst ? BURST_INTERVAL : SPAWN_INTERVAL)
      ) {
        spawnTimerRef.current = 0;
        if (isBurst) burstRemainingRef.current--;

        // Camera basis vectors
        _right.setFromMatrixColumn(camera.matrixWorld, 0);
        _up.setFromMatrixColumn(camera.matrixWorld, 1);
        _fwd.setFromMatrixColumn(camera.matrixWorld, 2).negate();
        _camPos.setFromMatrixPosition(camera.matrixWorld);

        // Spawn on a plane 20 units in front of camera, upper portion of frustum
        const dist = 20;
        const halfH = Math.tan(((camera.fov ?? 60) * Math.PI) / 360) * dist;
        const halfW = halfH * (camera.aspect ?? 1.6);

        const lx = (Math.random() - 0.5) * halfW * 2.6;
        const ly = halfH * (0.5 + Math.random() * 1.1); // top half + above screen

        const pos = _camPos
          .clone()
          .addScaledVector(_fwd, dist)
          .addScaledVector(_right, lx)
          .addScaledVector(_up, ly);

        // Velocity: downward in camera space with slight horizontal drift
        const speed = 18 + Math.random() * 17; // 18–35 units/second
        const vel = new ThreeVector3()
          .addScaledVector(_right, (Math.random() - 0.5) * 0.65)
          .addScaledVector(_up, -(0.8 + Math.random() * 0.4))
          .normalize()
          .multiplyScalar(speed);

        const star: ShootingStar = {
          id: nextIdRef.current++,
          position: pos,
          velocity: vel,
          opacity: 0,
          lifetime: 0,
          maxLifetime: 0.4 + Math.random() * 0.5, // 0.4–0.9s streak
          groupRef: null,
          materials: null,
        };
        const sg = createStarGroup(star);
        star.groupRef = sg;
        groupRef.current.add(sg);
        starsRef.current.push(star);
      }
    }

    // ─── Animate ────────────────────────────────────────────────────────────
    const alive: ShootingStar[] = [];
    for (const star of starsRef.current) {
      star.position.addScaledVector(star.velocity, delta);
      star.lifetime += delta;

      const fadeIn = Math.min(1, star.lifetime / 0.05); // near-instant appear
      const fadeStart = star.maxLifetime * 0.75;
      const fadeOut =
        star.lifetime > fadeStart
          ? 1 - (star.lifetime - fadeStart) / (star.maxLifetime - fadeStart)
          : 1;
      star.opacity = fadeIn * fadeOut;

      if (star.groupRef) {
        star.groupRef.position.copy(star.position);
        if (star.materials) {
          const op = star.opacity;
          star.materials.head.opacity = op;
          star.materials.trail.uniforms.uOpacity.value = op * 0.55;
          star.materials.glow.opacity = op * 0.12;
        }
      }

      if (star.lifetime >= star.maxLifetime) {
        if (star.groupRef && groupRef.current) {
          groupRef.current.remove(star.groupRef);
          star.materials?.head.dispose();
          star.materials?.trail.dispose();
          star.materials?.glow.dispose();
        }
      } else {
        alive.push(star);
      }
    }
    starsRef.current = alive;
  });

  if (reducedMotion) return null;
  return <group ref={groupRef} />;
}
