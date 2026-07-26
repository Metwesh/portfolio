import { a, useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  type Group as ThreeGroup,
  type Mesh as ThreeMesh,
  MeshMatcapMaterial as ThreeMeshMatcapMaterial,
  Vector2,
} from "three";
import { CENTERPIECE_PATH } from "../constants/misc";
import { useIsMobile } from "../hooks/useIsMobile";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scrollStore } from "../stores/scrollStore";

// Module-level constants — no allocation inside useFrame
const _lerpVal = (a: number, b: number, t: number) => a + (b - a) * t;
const RING_BASES = [0.95, 0.8, 0.65] as const;
// Ordered center-out by ring radius (ring3=2.4 innermost, ring1=2.8, ring2=3.2 outermost):
// cyan -> white -> purple
const RING_HUES = [0.0, 0.78, 0.53] as const;
const RING_SATS = [0.0, 0.85, 1.0] as const;

// Fresnel rim-glow shader — the tube brightens toward its silhouette edges
// (grazing view angle), reading as a soft glowing energy ring instead of a
// flat-shaded matte tube. Additive blending + toneMapped=false in the JSX
// let the color punch past ACES tonemapping instead of getting crushed.
// Opacity/pulse/fade is baked into uColor's magnitude (scaled in JS) rather
// than a separate float uniform — three shares one compiled program across
// all 3 rings (identical shader source), and a second scalar uniform on that
// shared program was silently failing to reach the GPU across instances;
// folding fade into the already-working vec3 color sidesteps it.
// uParams is vec2, not two separate floats — a prior float uniform on this
// same shared-program setup silently failed to reach the GPU per-instance;
// packing scalars into a vector uniform sidesteps that, mirroring the
// already-working vec3 uColor below.
const RING_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  uniform vec2 uParams; // x: time phase (frozen under reduced motion), y: random flare glow
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const RING_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec2 uParams;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float rim = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.4);
    // Traveling brightness pulse around the ring path — doubles as a
    // comet-style gradient since it's never flat at any single instant.
    float pathWave = 0.78 + 0.22 * sin(vUv.x * 12.566 - uParams.x * 1.6);
    float intensity = (0.4 + rim * 1.6) * pathWave + uParams.y * 1.8;
    gl_FragColor = vec4(uColor * intensity, 1.0);
  }
`;

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
  const { scene } = useGLTF(CENTERPIECE_PATH);
  const group = useRef<ThreeGroup>(null);
  const isMobile = useIsMobile();
  const matcapTexture = useMemo(() => createMatcapTexture(), []);

  // Dispose of the matcap texture when the component unmounts — otherwise it will leak memory
  useEffect(() => {
    return () => matcapTexture.dispose();
  }, [matcapTexture]);

  const [{ scale, position }, springApi] = useSpring(() => ({
    scale: reducedMotion ? [1.5, 1.5, 1.5] : [0, 0, 0],
    position: reducedMotion ? [10, -5, -8] : [0, 0, 0],
    immediate: true,
  }));

  const outerRef = useRef<ThreeGroup>(null);
  const ringGroupRef = useRef<ThreeGroup>(null);
  const selectZRef = useRef(0);
  const selectOpacityRef = useRef(1.0);
  const mMaterialsRef = useRef<ThreeMeshMatcapMaterial[]>([]);
  const smoothScrollRef = useRef({ y: 0, z: 0, rot: 0 });
  const ring1Ref = useRef<ThreeMesh>(null);
  const ring2Ref = useRef<ThreeMesh>(null);
  const ring3Ref = useRef<ThreeMesh>(null);
  // Stable array — avoids allocating [ring1Ref, ring2Ref, ring3Ref] every frame
  const ringRefsArrRef = useRef([ring1Ref, ring2Ref, ring3Ref]);
  // Stable shader uniforms — one {uColor, uParams} per ring, mutated in-place
  // each frame. Fade/pulse is baked into the color's magnitude (see shader consts).
  const ringUniformsRef = useRef([
    { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
    { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
    { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
  ]);

  // Afterimage echoes — 2 trailing tubes per ring (tier 0 = closer/brighter,
  // tier 1 = further/dimmer), only shown once selection spin-up makes the
  // lag readable.
  const ring1EchoRef = useRef<ThreeMesh>(null);
  const ring2EchoRef = useRef<ThreeMesh>(null);
  const ring3EchoRef = useRef<ThreeMesh>(null);
  const ring1Echo2Ref = useRef<ThreeMesh>(null);
  const ring2Echo2Ref = useRef<ThreeMesh>(null);
  const ring3Echo2Ref = useRef<ThreeMesh>(null);
  const ringEchoRefsArrRef = useRef([
    [ring1EchoRef, ring2EchoRef, ring3EchoRef],
    [ring1Echo2Ref, ring2Echo2Ref, ring3Echo2Ref],
  ]);
  const ringEchoUniformsRef = useRef([
    [
      { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
      { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
      { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
    ],
    [
      { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
      { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
      { uColor: { value: new Color() }, uParams: { value: new Vector2() } },
    ],
  ]);

  // Ring animation state
  const ringTiltRef = useRef(0); // 0 = all-flat (saturn rings), 1 = orb config
  const ringReadyRef = useRef(false);
  const ring1SpinRef = useRef(0); // accumulated z-spin
  const ring2SpinRef = useRef(0); // accumulated x-spin
  const ring3SpinRef = useRef(0); // accumulated y-spin
  const ringDramaRef = useRef(0); // 0→1 when box selected
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Random flare timer per ring — replaces pointer-proximity glow with an
  // autonomous flare on a randomized interval. 0 = counting down to next
  // flare, >0 = mid-flare (elapsed seconds within the pulse envelope).
  const ringGlowCountdownRef = useRef([
    2 + Math.random() * 4,
    2 + Math.random() * 4,
    2 + Math.random() * 4,
  ]);
  const ringGlowPhaseRef = useRef([0, 0, 0]);

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
    const t = state.clock.getElapsedTime();

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

    // Ring drama: spin up + expand + flatten on selection, glow through
    // (capped, not full-bright) instead of fading away with the retreating M.
    ringDramaRef.current +=
      ((isSelected ? 1 : 0) - ringDramaRef.current) * 0.05;
    const drama = ringDramaRef.current;
    const glow = drama > 0 ? 1 + Math.sin(drama * Math.PI) * 0.5 : 1;
    // op == (1-drama)^2 always (both driven by the same isSelected lerp), so
    // this dips mid-transition then swells back up — capped well under full
    // opacity so the glow doesn't dominate the view once selected.
    const ringFade = Math.max(op, drama) * 0.65;

    for (let i = 0; i < 3; i++) {
      if (!ringRefsArrRef.current[i].current) continue;
      const uniforms = ringUniformsRef.current[i];
      // Per-ring opacity pulse + hue drift, both driven directly by elapsed
      // clock time — the one continuous idle animation in this component
      // not otherwise gated by reducedMotion (ring spin/rotation below IS,
      // via the early return a few lines down). Static base values instead
      // of the sin(t * ...) oscillation under reduced motion; the
      // selection-driven fade (glow/ringFade, from `drama`) still comes
      // through since that's a discrete transition, not an idle loop.
      const pulse = reducedMotion
        ? 1
        : 0.72 + Math.sin(t * (1.0 + i * 0.35) + i * 2.09) * 0.28;
      const newOpacity = Math.min(1, RING_BASES[i] * glow * ringFade * pulse);
      const hShift = reducedMotion ? 0 : Math.sin(t * 0.25 + i * 1.57) * 0.04;
      const lum = reducedMotion
        ? 0.7
        : 0.7 + Math.sin(t * 0.6 + i * 1.0) * 0.12;
      uniforms.uColor.value
        .setHSL(RING_HUES[i] + hShift, RING_SATS[i], lum)
        .multiplyScalar(newOpacity);

      // uParams.x: wave/wobble time driver — frozen to a static per-ring
      // offset under reduced motion (same convention as hShift/lum above).
      const wavePhase = reducedMotion ? i * 2.1 : t * (1.4 + i * 0.2) + i * 2.1;

      // uParams.y: random flare — same glow the hover version drove, but
      // fired autonomously on a random per-ring timer instead of by pointer
      // proximity. Skipped under reduced motion (sudden brightness swings
      // are exactly what that setting exists to avoid).
      let flareGlow = 0;
      if (!reducedMotion) {
        if (ringGlowPhaseRef.current[i] > 0) {
          ringGlowPhaseRef.current[i] += delta;
          const dur = 1.1;
          if (ringGlowPhaseRef.current[i] >= dur) {
            ringGlowPhaseRef.current[i] = 0;
            ringGlowCountdownRef.current[i] = 3 + Math.random() * 5;
          } else {
            flareGlow = Math.sin((ringGlowPhaseRef.current[i] / dur) * Math.PI);
          }
        } else {
          ringGlowCountdownRef.current[i] -= delta;
          if (ringGlowCountdownRef.current[i] <= 0) {
            ringGlowPhaseRef.current[i] = 0.0001;
          }
        }
      }
      uniforms.uParams.value.set(wavePhase, flareGlow);
    }

    if (reducedMotion || !group.current) return;

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

    // Rings live in a separate group (see JSX) so the M's selection z-drift
    // — applied to outerRef, an ANCESTOR of group so it stays a straight
    // world-space offset unaffected by group's own rotation above — never
    // reaches them. Mirror the same rotation/position here so rings still
    // co-move with the M during normal (non-selected) motion.
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = group.current.rotation.y;
      ringGroupRef.current.rotation.x = group.current.rotation.x;
      ringGroupRef.current.position.y = posY;
      ringGroupRef.current.position.z = posZ;
    }

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

    // Accumulated spins (each ring spins on its primary axis)
    ring1SpinRef.current += delta * 0.4 * spinMult;
    ring2SpinRef.current -= delta * 0.28 * spinMult;
    ring3SpinRef.current += delta * 0.18 * spinMult;

    // Expand outward on selection — a modest 1.8x, framing the selected box
    // close-up rather than trying to reach the full flung-out sphere shell
    // (which would put the ring right up against the camera).
    const ringScale = 1 + drama * 0.8;

    if (ring1Ref.current) {
      // ring1 target tilt = [PI/2, 0, 0] = same as flat, so it just spins on z
      ring1Ref.current.rotation.x = Math.PI / 2;
      ring1Ref.current.rotation.y = 0;
      ring1Ref.current.rotation.z =
        ring1SpinRef.current + raw * 0.0003 * (1 - drama);
      const breathe1 = 1 + Math.sin(t * 0.9 + 0.0) * 0.04;
      ring1Ref.current.scale.setScalar(ringScale * breathe1);
    }
    if (ring2Ref.current) {
      // ring2 target tilt: x→0.4, z→0.3; spins on x
      ring2Ref.current.rotation.x =
        _lerpVal(Math.PI / 2, 0.4, et) + ring2SpinRef.current;
      ring2Ref.current.rotation.y = raw * 0.0002 * (1 - drama);
      ring2Ref.current.rotation.z = _lerpVal(0, 0.3, et);
      const breathe2 = 1 + Math.sin(t * 0.7 + 2.1) * 0.04;
      ring2Ref.current.scale.setScalar(ringScale * breathe2);
    }
    if (ring3Ref.current) {
      // ring3 target tilt: x→1.1, y→0.6; spins on y
      ring3Ref.current.rotation.x = _lerpVal(Math.PI / 2, 1.1, et);
      ring3Ref.current.rotation.y = _lerpVal(0, 0.6, et) + ring3SpinRef.current;
      ring3Ref.current.rotation.z = raw * 0.00015 * (1 - drama);
      const breathe3 = 1 + Math.sin(t * 1.1 + 4.2) * 0.04;
      ring3Ref.current.scale.setScalar(ringScale * breathe3);
    }

    // Afterimage echoes — 2 trailing tubes per ring, lagging behind each
    // ring's live spin at increasing distance. Only worth drawing once the
    // selection spin-up (drama) makes the lag visible; otherwise hidden to
    // avoid idle clutter.
    // ring2's spin ref DECREASES (see ring2SpinRef above) while ring1/ring3's
    // INCREASE — lag must subtract in the direction of travel, so ring2's
    // sign flips, or the "trailing" echo ends up leading instead.
    const echoVisible = drama > 0.02;
    const SPIN_SIGN = [1, -1, 1] as const;
    for (let tier = 0; tier < 2; tier++) {
      const lagMult = tier === 0 ? 1 : 2;
      const dimMult = tier === 0 ? 0.4 : 0.2;
      for (let i = 0; i < 3; i++) {
        const echo = ringEchoRefsArrRef.current[tier][i].current;
        const main = ringRefsArrRef.current[i].current;
        if (!echo) continue;
        echo.visible = echoVisible;
        if (!echoVisible || !main) continue;
        echo.rotation.copy(main.rotation);
        echo.scale.copy(main.scale);
        const lag = 0.35 * drama * lagMult * SPIN_SIGN[i];
        if (i === 0) echo.rotation.z -= lag;
        else if (i === 1) echo.rotation.x -= lag;
        else echo.rotation.y -= lag;
        const echoUniforms = ringEchoUniformsRef.current[tier][i];
        echoUniforms.uColor.value
          .copy(ringUniformsRef.current[i].uColor.value)
          .multiplyScalar(dimMult * drama);
        echoUniforms.uParams.value.copy(
          ringUniformsRef.current[i].uParams.value,
        );
      }
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
    <>
      {/* outerRef is the OUTER ancestor here (not nested inside the rotating
          a.group) — its selection z-drift is applied in world space, so the
          M retreats in a straight line instead of wobbling with group's
          oscillating rotation. */}
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
        </a.group>
      </group>

      {/* Orbital rings — a separate group (see useFrame) that mirrors group's
          rotation/position but sits outside outerRef, so the M's selection
          z-drift never reaches them. Fresnel rim-glow shader: brightens
          toward the silhouette edge like a lit energy ring, instead of a
          flat matte tube. */}
      <a.group
        ref={ringGroupRef}
        scale={scale as unknown as [number, number, number]}
        {...(reducedMotion
          ? { position: position as unknown as [number, number, number] }
          : false)}
      >
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.042, 16, 80]} />
          <shaderMaterial
            uniforms={ringUniformsRef.current[0]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.034, 16, 80]} />
          <shaderMaterial
            uniforms={ringUniformsRef.current[1]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.038, 16, 80]} />
          <shaderMaterial
            uniforms={ringUniformsRef.current[2]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Afterimage echoes — 2 per ring, hidden until selection spin-up
            makes the lag readable (see useFrame). Same tube, dimmer trailing
            color, tier 1 further behind + dimmer than tier 0. */}
        <mesh ref={ring1EchoRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[2.8, 0.042, 16, 80]} />
          <shaderMaterial
            uniforms={ringEchoUniformsRef.current[0][0]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={ring2EchoRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[3.2, 0.034, 16, 80]} />
          <shaderMaterial
            uniforms={ringEchoUniformsRef.current[0][1]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={ring3EchoRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[2.4, 0.038, 16, 80]} />
          <shaderMaterial
            uniforms={ringEchoUniformsRef.current[0][2]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh
          ref={ring1Echo2Ref}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <torusGeometry args={[2.8, 0.042, 16, 80]} />
          <shaderMaterial
            uniforms={ringEchoUniformsRef.current[1][0]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh
          ref={ring2Echo2Ref}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <torusGeometry args={[3.2, 0.034, 16, 80]} />
          <shaderMaterial
            uniforms={ringEchoUniformsRef.current[1][1]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh
          ref={ring3Echo2Ref}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <torusGeometry args={[2.4, 0.038, 16, 80]} />
          <shaderMaterial
            uniforms={ringEchoUniformsRef.current[1][2]}
            vertexShader={RING_VERTEX_SHADER}
            fragmentShader={RING_FRAGMENT_SHADER}
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </a.group>
    </>
  );
}
