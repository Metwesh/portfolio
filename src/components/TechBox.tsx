import { Float } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  Euler as ThreeEuler,
  type Mesh as ThreeMesh,
  Vector3 as ThreeVector3,
} from "three";
import BoxShader from "../shaders/BoxShader";
import { scrollStore } from "../stores/scrollStore";

// Entrance/exit: boxes fly in from (or out to) wherever they last were,
// staggered by index so the sphere visibly assembles/disperses instead of
// fading as a rigid blob. Same timing shape both directions. Durations are
// in seconds (accumulated from useFrame's delta) rather than frame counts —
// every other animated piece in the scene (CameraRig, MLogo, ProjectGallery)
// is delta-scaled, so a frame-count timer here would visibly run faster on
// a 120Hz display and slower under frame drops. Values below preserve the
// original feel, which was tuned at a 60fps baseline (26 frames, 3 frames).
const TRANSITION_TRAVEL_S = 26 / 60;
const TRANSITION_STAGGER_S = 3 / 60;
const TRANSITION_STAGGER_MOD = 14;
// Self-rotation speed, radians/second (was a flat +=0.002/frame, i.e. *60).
const SELF_ROTATION_SPEED = 0.002 * 60;
const MIN_SCALE = 0.05;
// Exit target = current sphere position pushed further out along the same
// radial direction — away from the centerpiece, into open space.
const EXIT_DISTANCE_MULTIPLIER = 3;

interface TechBoxProps {
  data: {
    icon: string;
    name: string;
    wip?: boolean;
  };
  position: ThreeVector3;
  onClick: () => void;
  scale: number | undefined;
  animateTo: ThreeVector3;
  isInView: boolean;
  isSelected?: boolean;
  index: number;
  reducedMotion?: boolean;
}

export function TechBox({
  data,
  position,
  onClick,
  scale,
  animateTo,
  isInView,
  isSelected,
  index,
  reducedMotion,
}: TechBoxProps) {
  const [meshRotation] = useState(
    () => new ThreeEuler(Math.random(), Math.random(), Math.random()),
  );

  const meshRef = useRef<ThreeMesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const prevCameraPosition = useRef(new ThreeVector3());
  const rotationSpeed = useRef(0);
  // Reuse Vector3 object instead of creating new one every frame
  const targetScaleRef = useRef(new ThreeVector3());
  // Exit animation: staggered fly-out, boxes drift away from their sphere position.
  // Elapsed seconds since exit began, not a frame count — see TRANSITION_TRAVEL_S.
  const exitElapsedRef = useRef(0);
  const exitStartPosRef = useRef(new ThreeVector3());
  const exitTargetPosRef = useRef(new ThreeVector3());
  const exitStartScaleRef = useRef(1);

  // Entry animation: staggered fly-in from wherever the box last was, eased in.
  // Elapsed seconds since entry began, not a frame count — see TRANSITION_TRAVEL_S.
  const entryElapsedRef = useRef(0);
  const entryStartPosRef = useRef(new ThreeVector3());

  // Track touch/pointer events to distinguish between tap and drag
  const pointerDown = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  // Ensure geometry UVs are properly set for iOS
  useEffect(() => {
    if (meshRef.current?.geometry) {
      const geometry = meshRef.current.geometry;
      if (geometry.attributes.uv) geometry.attributes.uv.needsUpdate = true;
    }
  }, []);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Record pointer down position and time for tap detection
    pointerDown.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    // Check if this was a tap (not a drag)
    if (!pointerDown.current) return;

    const deltaX = Math.abs(e.clientX - pointerDown.current.x);
    const deltaY = Math.abs(e.clientY - pointerDown.current.y);
    const deltaTime = Date.now() - pointerDown.current.time;

    // Consider it a tap if movement is minimal and time is short
    const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 300;

    if (
      isTap &&
      e.intersections &&
      e.intersections[0]?.object === meshRef.current
    ) {
      e.stopPropagation();
      onClick();
    }

    pointerDown.current = null;
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    scrollStore.techBoxHovered = true;
    window.dispatchEvent(new Event("techbox:pointerenter"));
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    scrollStore.techBoxHovered = false;
    window.dispatchEvent(new Event("techbox:pointerleave"));
  };

  useFrame(({ camera }, delta) => {
    if (!meshRef.current) return;

    if (isInView) {
      // Rotate with camera movement — distanceTo avoids a Vector3 allocation per frame
      rotationSpeed.current =
        camera.position.distanceTo(prevCameraPosition.current) * 0.1;
      meshRef.current.rotation.x += rotationSpeed.current;
      meshRef.current.rotation.y += rotationSpeed.current;

      const targetPos = animateTo || position;

      // Scales boxes up to custom scale if provided, else hover bump, else default 1
      const scaleValue =
        isSelected && isHovered
          ? (scale ?? 1) * 0.88
          : (scale ?? (isHovered ? 1.18 : 1));

      const entryDelayS = reducedMotion
        ? 0
        : (index % TRANSITION_STAGGER_MOD) * TRANSITION_STAGGER_S;
      const entryDone =
        reducedMotion ||
        entryElapsedRef.current - entryDelayS >= TRANSITION_TRAVEL_S;

      if (!entryDone) {
        // On the first frame in view, snapshot wherever the box currently sits
        // as the fly-in start point (origin on first mount, exit position on re-entry).
        if (entryElapsedRef.current === 0) {
          entryStartPosRef.current.copy(meshRef.current.position);
        }
        entryElapsedRef.current += delta;

        const t = Math.max(
          0,
          Math.min(
            1,
            (entryElapsedRef.current - entryDelayS) / TRANSITION_TRAVEL_S,
          ),
        );
        // Ease-out cubic — fast start, gentle settle into place
        const eased = 1 - (1 - t) ** 3;

        meshRef.current.position.lerpVectors(
          entryStartPosRef.current,
          targetPos,
          eased,
        );
        const currentScale = MIN_SCALE + (scaleValue - MIN_SCALE) * eased;
        meshRef.current.scale.setScalar(currentScale);
      } else {
        // Exit cascade replays fresh on the next out-of-view stretch.
        exitElapsedRef.current = 0;

        // Steady state: smooth follow for target-position/scale changes (e.g. selection).
        meshRef.current.position.lerp(targetPos, 0.15);
        targetScaleRef.current.set(scaleValue, scaleValue, scaleValue);
        meshRef.current.scale.lerp(targetScaleRef.current, 0.08);
      }

      // Self-rotation
      meshRef.current.rotation.x += delta * SELF_ROTATION_SPEED;
      meshRef.current.rotation.y -= delta * SELF_ROTATION_SPEED;
    } else {
      // Reset entry cascade so the next time this box comes into view it replays.
      entryElapsedRef.current = 0;

      const exitDelayS = reducedMotion
        ? 0
        : (index % TRANSITION_STAGGER_MOD) * TRANSITION_STAGGER_S;
      const exitDone =
        reducedMotion ||
        exitElapsedRef.current - exitDelayS >= TRANSITION_TRAVEL_S;

      if (!exitDone) {
        // On the first frame of exit, snapshot start pos/scale and push the
        // target further out along the same radial direction — away from
        // the centerpiece into open space, not back toward it.
        if (exitElapsedRef.current === 0) {
          exitStartPosRef.current.copy(meshRef.current.position);
          exitTargetPosRef.current
            .copy(meshRef.current.position)
            .multiplyScalar(EXIT_DISTANCE_MULTIPLIER);
          exitStartScaleRef.current = meshRef.current.scale.x;
        }
        exitElapsedRef.current += delta;

        const t = Math.max(
          0,
          Math.min(
            1,
            (exitElapsedRef.current - exitDelayS) / TRANSITION_TRAVEL_S,
          ),
        );
        // Ease-out cubic — same snappy feel as the entrance, mirrored outward
        const eased = 1 - (1 - t) ** 3;

        meshRef.current.position.lerpVectors(
          exitStartPosRef.current,
          exitTargetPosRef.current,
          eased,
        );
        const currentScale =
          exitStartScaleRef.current +
          (MIN_SCALE - exitStartScaleRef.current) * eased;
        meshRef.current.scale.setScalar(currentScale);
      }
      // Once done, the box sits parked offscreen — no further work needed
      // until it re-enters view.
    }

    prevCameraPosition.current.copy(camera.position);
  });

  return (
    <Float
      speed={1.75}
      rotationIntensity={1}
      floatIntensity={1}
      position={[0, 0, 0.05]}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh
        ref={meshRef}
        name={data.name}
        // position is now animated in useFrame
        rotation={meshRotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[1, 1, 1]} />
        <BoxShader
          data={data}
          isHovered={isHovered || isSelected}
          isDimmed={isSelected && isHovered}
        />
      </mesh>
    </Float>
  );
}
