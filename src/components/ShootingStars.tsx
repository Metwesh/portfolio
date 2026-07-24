import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
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
// Star "slots" are created once and reused for the component's lifetime —
// spawning a star never allocates a Material/Mesh/Group. Materials are
// disposed once at unmount, not per-spawn: disposing per-spawn drops each
// shader program's refcount to zero, evicting it from three.js's WebGLProgram
// cache, so the next spawn has to recompile+link the (identical) shader from
// scratch — a synchronous GPU stall, once per spawn, forever.
interface StarSlot {
  group: ThreeGroup;
  head: ThreeMeshBasicMaterial;
  trail: ThreeShaderMaterial;
  glow: ThreeMeshBasicMaterial;
  alive: boolean;
  position: ThreeVector3;
  velocity: ThreeVector3;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
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

function createSlot(): StarSlot {
  const group = new ThreeGroup();
  group.visible = false;

  const head = new ThreeMeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: ThreeAdditiveBlending,
  });
  group.add(new ThreeMeshType(_headGeo, head));

  const trail = new ThreeShaderMaterial({
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: TRAIL_VERT,
    fragmentShader: TRAIL_FRAG,
    transparent: true,
    depthWrite: false,
    blending: ThreeAdditiveBlending,
    side: 2, // DoubleSide
  });
  const trailMesh = new ThreeMeshType(_trailGeo, trail);
  group.add(trailMesh);

  const glow = new ThreeMeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: ThreeAdditiveBlending,
  });
  group.add(new ThreeMeshType(_glowGeo, glow));

  return {
    group,
    head,
    trail,
    glow,
    alive: false,
    position: new ThreeVector3(),
    velocity: new ThreeVector3(),
    opacity: 0,
    lifetime: 0,
    maxLifetime: 0,
  };
}

export function ShootingStars({ count = 20 }: ShootingStarsProps) {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<ThreeGroup>(null);
  const slotsRef = useRef<StarSlot[]>([]);
  const spawnTimerRef = useRef(BURST_INTERVAL); // fire immediately on first frame
  const burstRemainingRef = useRef(BURST_COUNT);

  useEffect(() => {
    const slots = Array.from({ length: count }, createSlot);
    slotsRef.current = slots;
    const parent = groupRef.current;
    for (const slot of slots) parent?.add(slot.group);

    return () => {
      for (const slot of slots) {
        parent?.remove(slot.group);
        slot.head.dispose();
        slot.trail.dispose();
        slot.glow.dispose();
      }
      slotsRef.current = [];
    };
  }, [count]);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const camera = state.camera as ThreePerspectiveCamera;
    const slots = slotsRef.current;

    // ─── Spawning ───────────────────────────────────────────────────────────
    const freeSlot = slots.find((s) => !s.alive);
    if (freeSlot) {
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

        freeSlot.position
          .copy(_camPos)
          .addScaledVector(_fwd, dist)
          .addScaledVector(_right, lx)
          .addScaledVector(_up, ly);

        // Velocity: downward in camera space with slight horizontal drift
        const speed = 18 + Math.random() * 17; // 18–35 units/second
        freeSlot.velocity
          .set(0, 0, 0)
          .addScaledVector(_right, (Math.random() - 0.5) * 0.65)
          .addScaledVector(_up, -(0.8 + Math.random() * 0.4))
          .normalize()
          .multiplyScalar(speed);

        const q = new ThreeQuaternion().setFromUnitVectors(
          new ThreeVector3(0, 1, 0),
          freeSlot.velocity.clone().normalize(),
        );
        freeSlot.group.quaternion.copy(q);

        freeSlot.opacity = 0;
        freeSlot.lifetime = 0;
        freeSlot.maxLifetime = 0.4 + Math.random() * 0.5; // 0.4–0.9s streak
        freeSlot.alive = true;
        freeSlot.group.visible = true;
      }
    }

    // ─── Animate ────────────────────────────────────────────────────────────
    for (const star of slots) {
      if (!star.alive) continue;

      star.position.addScaledVector(star.velocity, delta);
      star.lifetime += delta;

      const fadeIn = Math.min(1, star.lifetime / 0.05); // near-instant appear
      const fadeStart = star.maxLifetime * 0.75;
      const fadeOut =
        star.lifetime > fadeStart
          ? 1 - (star.lifetime - fadeStart) / (star.maxLifetime - fadeStart)
          : 1;
      star.opacity = fadeIn * fadeOut;

      star.group.position.copy(star.position);
      const op = star.opacity;
      star.head.opacity = op;
      star.trail.uniforms.uOpacity.value = op * 0.55;
      star.glow.opacity = op * 0.12;

      if (star.lifetime >= star.maxLifetime) {
        star.alive = false;
        star.group.visible = false;
      }
    }
  });

  if (reducedMotion) return null;
  return <group ref={groupRef} />;
}
