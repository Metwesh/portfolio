import { Environment, Html, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  lazy,
  type PointerEvent as ReactPointerEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type * as THREE from "three";
import { Vector3 as ThreeVector3 } from "three";
import { TECHNOLOGIES } from "../constants/technologies";
import { useLazyRef } from "../hooks/useLazyRef";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { LIGHT_ARGUMENTS } from "../shaders/FogArguments";
import { scrollStore } from "../stores/scrollStore";
import { damp, dampAlpha } from "../utils/damp";
import { isTapGesture } from "../utils/gesture";
import { QualityTierEnum, qualityTier } from "../utils/performance";
import { AnimatedStars } from "./AnimatedStars";
import { CameraRig } from "./CameraRig";
import { MLogo } from "./MLogo";
import { ProjectGallery } from "./ProjectGallery";
import { TechBox } from "./TechBox";
import { TechTooltip } from "./TechTooltip";

const Stats = lazy(() =>
  import("@react-three/drei").then((mod) => ({ default: mod.Stats })),
);

// Quality-derived constants — stable for the session
// Cap DPR per tier: still well under a phone's native 2-3x to keep fill-rate
// in check, but no longer flattened to a flat 1x on "low" — that was the
// biggest contributor to a visibly blocky/pixelated canvas on Retina phones.
const MAX_DPR =
  qualityTier === QualityTierEnum.High
    ? 2
    : qualityTier === QualityTierEnum.Medium
      ? 1.75
      : 1.5;

const SPHERE_RADIUS = 8;

// ─── Module-level drag state ──────────────────────────────────────────────────
// Written by the DOM pointer handlers in UniverseCanvas, read each frame by
// TechConstellation. Avoids prop-drilling / context without React overhead.
const _techDrag = {
  velY: 0, // Y-axis (horizontal drag) velocity
  velX: 0, // X-axis (vertical drag) velocity
  active: false, // true while a grab-drag gesture is in progress
};

// ─── TechBox batched-animation constants ─────────────────────────────────────
// Entrance/exit: boxes fly in from (or out to) wherever they last were,
// staggered by index so the sphere visibly assembles/disperses instead of
// fading as a rigid blob. Same timing shape both directions. Durations are
// in seconds (accumulated from useFrame's delta) rather than frame counts —
// every other animated piece in the scene (CameraRig, MLogo, ProjectGallery)
// is delta-scaled, so a frame-count timer here would visibly run faster on
// a 120Hz display and slower under frame drops. Values below preserve the
// original feel, which was tuned at a 60fps baseline (26 frames, 3 frames).
const TECHBOX_TRANSITION_TRAVEL_S = 26 / 60;
const TECHBOX_TRANSITION_STAGGER_S = 3 / 60;
const TECHBOX_TRANSITION_STAGGER_MOD = 14;
// Self-rotation speed, radians/second (was a flat +=0.002/frame, i.e. *60).
const TECHBOX_SELF_ROTATION_SPEED = 0.002 * 60;
const TECHBOX_MIN_SCALE = 0.05;
// Exit target = current sphere position pushed further out along the same
// radial direction — away from the centerpiece, into open space.
const TECHBOX_EXIT_DISTANCE_MULTIPLIER = 3;

// ─── Idle-attract constants ────────────────────────────────────────────────
// After the sphere sits untouched (no drag, hover, selection, or scroll)
// for this long, it ramps into a slow, sustained rotation to invite
// interaction — unlike the scroll-driven flywheel above, this holds a
// constant rate instead of decaying, and only while genuinely idle.
const IDLE_ATTRACT_DELAY_S = 4;
const IDLE_ATTRACT_SPEED = 0.12; // radians/second at full ramp-in

// ─── Tech Constellation ──────────────────────────────────────────────────────
// Only ever mounted when !prefersReducedMotion (see UniverseCanvas below) —
// reduced-motion users get TechIconsFallback instead.
function TechConstellation() {
  // Only ever read inside this component's own useFrame closure below — a
  // ref avoids re-rendering (and reconciling all 43 TechBox children) on
  // every tech-section enter/leave.
  const isActiveRef = useRef(false);
  useEffect(() => {
    const handler = (e: Event) => {
      isActiveRef.current = (
        e as CustomEvent<{ active: boolean }>
      ).detail.active;
    };
    document.addEventListener("universe:interactive", handler);
    return () => document.removeEventListener("universe:interactive", handler);
  }, []);

  const points = useMemo(() => {
    const temp = [];
    const offset = 2 / TECHNOLOGIES.length;
    const increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < TECHNOLOGIES.length; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(1 - y ** 2);
      const phi = ((i + 1) % TECHNOLOGIES.length) * increment;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      temp.push(
        new ThreeVector3(
          x * SPHERE_RADIUS,
          y * SPHERE_RADIUS,
          z * SPHERE_RADIUS,
        ),
      );
    }
    return temp;
  }, []);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    scrollStore.techBoxSelected = selectedIndex !== null;
    // Selecting/deselecting jumps the box's scale+position away from the
    // cursor without a follow-up pointermove, so the mesh never fires
    // pointerleave — clear the stale hover flag here or scroll-driven spin
    // (gated on !techBoxHovered in TechConstellation's useFrame) stays
    // frozen forever after the first click.
    scrollStore.techBoxHovered = false;
    document.dispatchEvent(
      new CustomEvent("universe:boxselected", {
        detail: { selected: selectedIndex !== null },
      }),
    );
  }, [selectedIndex]);

  const groupRef = useRef<THREE.Group>(null);
  const visibilityRef = useRef(0);
  const prevRawRef = useRef(0);
  const rotYRef = useRef(0);
  const rotXRef = useRef(0);
  const scrollVelRef = useRef(0);
  const idleElapsedRef = useRef(0);
  const idleSpinRef = useRef(0);

  // ─── TechBox batched animation state ─────────────────────────────────────
  // All 43 boxes are driven from this single useFrame below instead of each
  // mounting its own (see TechBox.tsx and ProjectGallery's GalleryCards for
  // the same "one loop, N refs" pattern).
  const boxRefsRef = useRef<Array<React.RefObject<THREE.Mesh | null> | null>>(
    Array(TECHNOLOGIES.length).fill(null),
  );
  const registerBox = useCallback(
    (index: number, meshRef: React.RefObject<THREE.Mesh | null>) => {
      boxRefsRef.current[index] = meshRef;
    },
    [],
  );
  // Singular, like ProjectGallery's hoveredIndexRef — only the nearest hit
  // ever calls this (TechBox stops propagation on enter/leave).
  const hoveredIndexRef = useRef<number | null>(null);
  const prevCamPosRef = useLazyRef(() => new ThreeVector3());
  const scratchScaleVecRef = useLazyRef(() => new ThreeVector3());
  const entryElapsedRef = useLazyRef<number[]>(() =>
    Array(TECHNOLOGIES.length).fill(0),
  );
  const entryStartPosRef = useLazyRef(() =>
    Array.from({ length: TECHNOLOGIES.length }, () => new ThreeVector3()),
  );
  const exitElapsedRef = useLazyRef<number[]>(() =>
    Array(TECHNOLOGIES.length).fill(0),
  );
  const exitStartPosRef = useLazyRef(() =>
    Array.from({ length: TECHNOLOGIES.length }, () => new ThreeVector3()),
  );
  const exitTargetPosRef = useLazyRef(() =>
    Array.from({ length: TECHNOLOGIES.length }, () => new ThreeVector3()),
  );
  const exitStartScaleRef = useLazyRef<number[]>(() =>
    Array(TECHNOLOGIES.length).fill(1),
  );
  // Per-box resting target position — mutated in place (never reallocated)
  // whenever selection changes, instead of recomputing a fresh Vector3 per
  // box on every render like the old getBoxPosition() did.
  const targetPositionsRef = useLazyRef(() => points.map((p) => p.clone()));

  useEffect(() => {
    for (let i = 0; i < points.length; i++) {
      // Non-selected boxes scatter outward to 2x their sphere radius when a
      // box is selected — an "explosion" burst around the focused box.
      const scale = selectedIndex === null ? 1 : selectedIndex === i ? 0.3 : 2;
      targetPositionsRef.current[i].copy(points[i]).multiplyScalar(scale);
    }
  }, [selectedIndex, points, targetPositionsRef.current]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const inView = scrollStore.techSectionActive;
    // Fast both ways — matches the staggered box entry/exit cascade timing.
    visibilityRef.current = damp(
      visibilityRef.current,
      inView ? 1 : 0,
      0.05,
      delta,
    );

    // Idle "breathing" — same technique as MLogo's ring breathe
    // (MLogo.tsx: `1 + Math.sin(t * freq) * amp`), but MLogo gets its
    // organic feel from 3 separate rings each breathing at a different
    // freq/phase — one sphere has no such second voice, and a single clean
    // sine here just reads as a metronome. Superposing two incommensurate
    // frequencies (0.8 and 1.37 share no small common period) breaks that
    // regularity: the combined peak drifts in timing and depth cycle to
    // cycle instead of repeating identically forever. Reads as "alive and
    // waiting" while at rest, distinct from the scroll-driven spin below so
    // scrolling feels like a separate, causal kick instead of blending into
    // ambient motion.
    const t = state.clock.getElapsedTime();
    const breathe =
      1 + (Math.sin(t * 0.8) * 0.6 + Math.sin(t * 1.37 + 1.7) * 0.4) * 0.035;
    groupRef.current.scale.setScalar(visibilityRef.current * breathe);
    groupRef.current.position.y = scrollStore.mLogoY;
    groupRef.current.position.z = scrollStore.mLogoZ;

    // Apply drag velocity (set by DOM handler, coasts here)
    const selected = scrollStore.techBoxSelected;
    const hovered = scrollStore.techBoxHovered;
    rotYRef.current += _techDrag.velY;
    rotXRef.current += _techDrag.velX;
    // More friction when a box is selected so rotation dies out quickly
    const dragFriction = selected ? 0.82 : 0.9;
    _techDrag.velY *= dragFriction;
    _techDrag.velX *= dragFriction;

    // Scroll-driven spin only — a flywheel, not idle auto-spin: scrolling
    // winds the sphere up and it coasts back down (decay below), rather
    // than spinning at a constant rate regardless of scroll. That constant
    // used to run at the same order of magnitude as the scroll-linked
    // nudge, so the two were indistinguishable and scrolling never read as
    // the cause of anything. Paused while a box is selected, hovered, or
    // dragging.
    const rawDelta = scrollStore.raw - prevRawRef.current;
    prevRawRef.current = scrollStore.raw;
    const dragging = _techDrag.active;
    if (inView && !selected && !hovered && !dragging) {
      scrollVelRef.current += rawDelta * 0.00032;
    }
    // Decay factor tuned at a 60fps baseline (dampAlpha(factor, 1/60) ===
    // factor) — damp() keeps the same feel at any frame rate instead of
    // decaying faster on high-refresh displays.
    const decayFactor = selected || hovered || dragging ? 0.07 : 0.03;
    scrollVelRef.current = damp(scrollVelRef.current, 0, decayFactor, delta);
    rotYRef.current += scrollVelRef.current;

    // Idle-attract — a second, independent rotation source from the
    // flywheel above. After the sphere sits genuinely untouched (in view,
    // no drag/hover/selection, no scroll) for IDLE_ATTRACT_DELAY_S, it
    // ramps into a slow, sustained rotation to invite interaction, and
    // ramps back out the instant the user touches it again. Sustained
    // rate (rad/s, delta-multiplied) rather than impulse-and-decay — same
    // convention as TECHBOX_SELF_ROTATION_SPEED below, not scrollVelRef's.
    const untouched =
      inView && !selected && !hovered && !dragging && Math.abs(rawDelta) < 0.01;
    idleElapsedRef.current = untouched ? idleElapsedRef.current + delta : 0;
    const idleTarget =
      idleElapsedRef.current > IDLE_ATTRACT_DELAY_S ? IDLE_ATTRACT_SPEED : 0;
    idleSpinRef.current = damp(idleSpinRef.current, idleTarget, 0.04, delta);
    rotYRef.current += idleSpinRef.current * delta;

    // Clamp X tilt so the sphere never flips completely upside-down
    rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current));

    groupRef.current.rotation.y = rotYRef.current;
    groupRef.current.rotation.x = rotXRef.current;

    // ─── Batched TechBox animation ─────────────────────────────────────────
    // Camera-movement rotation speed only depends on how far the camera
    // moved since last frame — identical for every box, so it's computed
    // once here instead of 43 times (each box previously tracked its own
    // redundant copy of the same camera.position comparison).
    const camDelta = state.camera.position.distanceTo(prevCamPosRef.current);
    prevCamPosRef.current.copy(state.camera.position);
    const rotationSpeed = camDelta * 0.1;

    for (let i = 0; i < TECHNOLOGIES.length; i++) {
      const mesh = boxRefsRef.current[i]?.current;
      if (!mesh) continue;

      if (isActiveRef.current) {
        mesh.rotation.x += rotationSpeed;
        mesh.rotation.y += rotationSpeed;

        const targetPos = targetPositionsRef.current[i];
        const boxSelected = selectedIndex === i;
        const boxHovered = hoveredIndexRef.current === i;
        // Scales boxes up to a custom scale when selected, else hover bump,
        // else default 1 — mirrors TechBox's original scale/hover prop math.
        const scaleValue =
          boxSelected && boxHovered
            ? 6 * 0.88
            : boxSelected
              ? 6
              : boxHovered
                ? 1.18
                : 1;

        const entryDelayS =
          (i % TECHBOX_TRANSITION_STAGGER_MOD) * TECHBOX_TRANSITION_STAGGER_S;
        const entryDone =
          entryElapsedRef.current[i] - entryDelayS >=
          TECHBOX_TRANSITION_TRAVEL_S;

        if (!entryDone) {
          // Fly in from far out along the same radial direction the exit
          // cascade pushes to — always, not just on re-entry, so the very
          // first entry (before any exit has run) also starts from outer
          // space instead of growing from the origin.
          if (entryElapsedRef.current[i] === 0) {
            entryStartPosRef.current[i]
              .copy(targetPos)
              .multiplyScalar(TECHBOX_EXIT_DISTANCE_MULTIPLIER);
          }
          entryElapsedRef.current[i] += delta;

          const t = Math.max(
            0,
            Math.min(
              1,
              (entryElapsedRef.current[i] - entryDelayS) /
                TECHBOX_TRANSITION_TRAVEL_S,
            ),
          );
          // Ease-out cubic — fast start, gentle settle into place
          const eased = 1 - (1 - t) ** 3;

          mesh.position.lerpVectors(
            entryStartPosRef.current[i],
            targetPos,
            eased,
          );
          const currentScale =
            TECHBOX_MIN_SCALE + (scaleValue - TECHBOX_MIN_SCALE) * eased;
          mesh.scale.setScalar(currentScale);
        } else {
          // Exit cascade replays fresh on the next out-of-view stretch.
          exitElapsedRef.current[i] = 0;

          // Steady state: smooth follow for target position/scale changes
          // (e.g. selection) — delta-scaled so the chase speed doesn't vary
          // with frame rate (see damp.ts).
          mesh.position.lerp(targetPos, dampAlpha(0.15, delta));
          scratchScaleVecRef.current.set(scaleValue, scaleValue, scaleValue);
          mesh.scale.lerp(scratchScaleVecRef.current, dampAlpha(0.08, delta));
        }

        // Self-rotation — a continuous idle spin.
        mesh.rotation.x += delta * TECHBOX_SELF_ROTATION_SPEED;
        mesh.rotation.y -= delta * TECHBOX_SELF_ROTATION_SPEED;
      } else {
        // Reset entry cascade so the next time this box comes into view it replays.
        entryElapsedRef.current[i] = 0;

        const exitDelayS =
          (i % TECHBOX_TRANSITION_STAGGER_MOD) * TECHBOX_TRANSITION_STAGGER_S;
        const exitDone =
          exitElapsedRef.current[i] - exitDelayS >= TECHBOX_TRANSITION_TRAVEL_S;

        if (!exitDone) {
          // On the first frame of exit, snapshot start pos/scale and push
          // the target further out along the same radial direction — away
          // from the centerpiece into open space, not back toward it.
          if (exitElapsedRef.current[i] === 0) {
            exitStartPosRef.current[i].copy(mesh.position);
            exitTargetPosRef.current[i]
              .copy(mesh.position)
              .multiplyScalar(TECHBOX_EXIT_DISTANCE_MULTIPLIER);
            exitStartScaleRef.current[i] = mesh.scale.x;
          }
          exitElapsedRef.current[i] += delta;

          const t = Math.max(
            0,
            Math.min(
              1,
              (exitElapsedRef.current[i] - exitDelayS) /
                TECHBOX_TRANSITION_TRAVEL_S,
            ),
          );
          // Ease-out cubic — same snappy feel as the entrance, mirrored outward
          const eased = 1 - (1 - t) ** 3;

          mesh.position.lerpVectors(
            exitStartPosRef.current[i],
            exitTargetPosRef.current[i],
            eased,
          );
          const currentScale =
            exitStartScaleRef.current[i] +
            (TECHBOX_MIN_SCALE - exitStartScaleRef.current[i]) * eased;
          mesh.scale.setScalar(currentScale);
        }
        // Once done, the box sits parked offscreen — no further work needed
        // until it re-enters view.
      }
    }
  });

  const buttonPointerDown = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleClose = () => setSelectedIndex(null);

  const handleButtonPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    buttonPointerDown.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleButtonPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!buttonPointerDown.current) return;
    if (isTapGesture(buttonPointerDown.current, e)) handleClose();
    buttonPointerDown.current = null;
  };

  return (
    <>
      <group
        ref={groupRef as React.RefObject<THREE.Group>}
        rotation={[0, 0, 35]}
      >
        <directionalLight
          intensity={3.75}
          color={LIGHT_ARGUMENTS.color}
          position={LIGHT_ARGUMENTS.position}
        />
        {points.map((_, index) => (
          <TechBox
            key={`${TECHNOLOGIES[index].name}-${index}`}
            index={index}
            data={TECHNOLOGIES[index]}
            onClick={() =>
              setSelectedIndex(selectedIndex === index ? null : index)
            }
            isSelected={selectedIndex === index}
            onMount={registerBox}
            hoveredIndexRef={hoveredIndexRef}
          />
        ))}
      </group>
      {selectedIndex !== null && (
        <Html
          center
          position={[0, -6, 0]}
          zIndexRange={[100, 0]}
          pointerEvents="auto"
          className="select-none"
        >
          <TechTooltip
            technologyName={TECHNOLOGIES[selectedIndex].name}
            isWip={TECHNOLOGIES[selectedIndex].wip || false}
            onClose={handleClose}
            onPointerDown={handleButtonPointerDown}
            onPointerUp={handleButtonPointerUp}
          />
        </Html>
      )}
    </>
  );
}

// ─── Scene Ready Signal ───────────────────────────────────────────────────────
function SceneReadySignal({ onReady }: { onReady?: () => void }) {
  const called = useRef(false);
  useEffect(() => {
    if (!called.current) {
      called.current = true;
      onReady?.();
    }
  }, [onReady]);
  return null;
}

// ─── Universe Canvas ─────────────────────────────────────────────────────────

interface UniverseCanvasProps {
  onReady?: () => void;
}

export function UniverseCanvas({ onReady }: UniverseCanvasProps) {
  const prefersReducedMotion = useReducedMotion();
  const mouse = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mouse parallax for camera
  useEffect(() => {
    if (prefersReducedMotion) return;
    const controller = new AbortController();
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [prefersReducedMotion]);

  // Canvas wrapper pointer events toggle — off by default so the fixed
  // full-viewport canvas doesn't block clicks on ordinary DOM content
  // elsewhere on the page; opened while either the tech sphere or the
  // projects gallery is the active section, since both need real pointer
  // events reaching their 3D meshes (drag-to-rotate / click-to-center).
  // touchAction stays tech-only — that's a pinch/drag gesture concern;
  // the projects gallery already runs its own non-passive touch handlers
  // (see ProjectsSection) that don't need the CSS touch-action override.
  useEffect(() => {
    let techActive = false;
    let projectsActive = false;
    const applyPointerEvents = () => {
      if (!wrapperRef.current) return;
      wrapperRef.current.style.pointerEvents =
        techActive || projectsActive ? "auto" : "none";
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      wrapperRef.current.style.touchAction = techActive
        ? isTouch
          ? "pan-y"
          : "none"
        : "";
    };
    const handleTechInteractive = (e: Event) => {
      techActive = (e as CustomEvent<{ active: boolean }>).detail.active;
      applyPointerEvents();
    };
    const handleProjectsInteractive = (e: Event) => {
      projectsActive = (e as CustomEvent<{ active: boolean }>).detail.active;
      applyPointerEvents();
    };
    document.addEventListener("universe:interactive", handleTechInteractive);
    document.addEventListener(
      "universe:projectsinteractive",
      handleProjectsInteractive,
    );
    return () => {
      document.removeEventListener(
        "universe:interactive",
        handleTechInteractive,
      );
      document.removeEventListener(
        "universe:projectsinteractive",
        handleProjectsInteractive,
      );
    };
  }, []);

  // Tooltip a11y — drei's <Html> portals the selected-tech tooltip into this
  // wrapper by default (gl.domElement.parentNode), which is otherwise
  // aria-hidden since the wrapper is pure decorative canvas. Lift aria-hidden
  // only while a tooltip's real, focusable close button is actually mounted.
  useEffect(() => {
    const handleBoxSelected = (e: Event) => {
      if (!wrapperRef.current) return;
      const selected = (e as CustomEvent<{ selected: boolean }>).detail
        .selected;
      if (selected) wrapperRef.current.removeAttribute("aria-hidden");
      else wrapperRef.current.setAttribute("aria-hidden", "true");
    };
    document.addEventListener("universe:boxselected", handleBoxSelected);
    return () =>
      document.removeEventListener("universe:boxselected", handleBoxSelected);
  }, []);

  // Globe drag — handled at DOM level so R3F raycasting for TechBox clicks is
  // completely unaffected. setPointerCapture ensures pointermove keeps firing on
  // mobile even when the finger moves outside the element.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let lastX = 0;
    let lastY = 0;
    let active = false;
    let hasRotated = false;

    const onDown = (e: PointerEvent) => {
      if (!scrollStore.techSectionActive) return;
      lastX = e.clientX;
      lastY = e.clientY;
      active = true;
      _techDrag.active = true;
      _techDrag.velY = 0;
      _techDrag.velX = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      _techDrag.velY = dx * 0.006;
      _techDrag.velX = dy * 0.006;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!hasRotated) {
        hasRotated = true;
        document.dispatchEvent(new CustomEvent("universe:sphererotated"));
      }
    };

    const onUp = () => {
      active = false;
      _techDrag.active = false;
      // Pointer may have come to rest over a box mesh with no further move
      // event to fire its pointerleave (e.g. trackpad scroll afterward) —
      // clear the stale hover so scroll-driven spin doesn't stay frozen.
      scrollStore.techBoxHovered = false;
    };

    el.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-universe-canvas
      aria-hidden="true"
      className="fade-in pointer-events-none fixed inset-0 z-0 h-svh animate-in duration-1000"
    >
      <Canvas
        gl={{ antialias: qualityTier !== QualityTierEnum.Low }}
        dpr={[1, MAX_DPR]}
        // R3F's default useMeasure config re-measures the container on
        // native "scroll" events (debounced 50ms) in case a scrolled-into-
        // view canvas needs to resize. This wrapper is `fixed inset-0` —
        // its size never depends on scroll position — so that listener
        // only ever adds a forced-layout task ~50ms after scrolling stops,
        // which is exactly when a user pauses on a focused gallery card.
        resize={{ scroll: false }}
        // "never": rendering is driven manually by advance() from the same
        // gsap.ticker callback that drives Lenis + ScrollTrigger, so scroll
        // and camera share one clock instead of racing two independent rAF
        // loops (R3F's default "always" loop vs GSAP's ticker). Tab-hidden
        // pause lives in that ticker callback (see useLenisScroll) rather
        // than here — flipping this prop's string at runtime resets R3F's
        // internal clock, which produced a one-frame delta spike on every
        // tab switch. Reduced motion isn't a render-rate throttle (removed
        // deliberately, see useLenisScroll) — it's handled below by simply
        // not mounting TechConstellation/ProjectGallery.
        frameloop="never"
        performance={{ min: 0.5 }}
      >
        {import.meta.env.DEV && <Stats />}
        <Suspense fallback={null}>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 10]}
            fov={60}
            ref={cameraRef}
          />
          {/* Scroll-progress driven (plus mouse parallax, already neutralized
              under reduced motion since the mousemove listener above never
              updates `mouse` in that case) — always mounted, or the camera
              never leaves its mount position and never frames later
              sections (e.g. the tech sphere) correctly. */}
          <CameraRig mouse={mouse} />

          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <Environment background={false} resolution={64}>
            <ambientLight intensity={0.1} />
            <pointLight
              position={[10, 10, 10]}
              intensity={0.5}
              color="#88f0ff"
            />
            <pointLight
              position={[-10, -5, -10]}
              intensity={0.3}
              color="#d080ff"
            />
          </Environment>

          <AnimatedStars />
          <MLogo />
          {/* Reduced-motion users get TechIconsFallback/ProjectCardsFallback
              (static HTML) instead of these two — the heaviest, most
              animation-centric pieces of the scene. */}
          {!prefersReducedMotion && <TechConstellation />}
          <SceneReadySignal onReady={onReady} />
        </Suspense>

        <Suspense fallback={null}>
          {!prefersReducedMotion && <ProjectGallery />}
        </Suspense>
      </Canvas>
    </div>
  );
}
