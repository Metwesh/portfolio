import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { Vector3 } from "three";
import { CAMERA_WAYPOINTS } from "../constants/cameraWaypoints";
import { useIsMobile } from "../hooks/useIsMobile";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { scrollStore } from "../stores/scrollStore";
import { damp, dampAlpha } from "../utils/damp";

interface CameraRigProps {
  mouse: React.RefObject<{ x: number; y: number }>;
}

// Reusable vectors — allocated once, mutated in useFrame (no GC pressure)
const _targetPos = new Vector3();
const _targetLookAt = new Vector3();
const _smoothPos = new Vector3(0, 0, 10);
const _currentLookAt = new Vector3();

/** Smoothstep — creates organic ease-in-out between waypoints */
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// No props — reads scrollStore.progress directly to avoid React re-renders
export function CameraRig({ mouse }: CameraRigProps) {
  const { camera } = useThree();
  const cam = camera as ThreePerspectiveCamera;
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Smooth weight for the projects-section camera lock (0 = free, 1 = locked).
  const projectLockRef = useRef(0);

  useFrame((_state, delta) => {
    const progress = scrollStore.progress;

    const waypoints = CAMERA_WAYPOINTS;
    let prev = waypoints[0];
    let next = waypoints[waypoints.length - 1];

    for (let i = 0; i < waypoints.length - 1; i++) {
      if (
        progress >= waypoints[i].progress &&
        progress <= waypoints[i + 1].progress
      ) {
        prev = waypoints[i];
        next = waypoints[i + 1];
        break;
      }
    }

    // Normalized t between the two waypoints, with smoothstep easing
    const span = next.progress - prev.progress;
    const localT = span > 0 ? (progress - prev.progress) / span : 0;
    const t = smoothstep(Math.max(0, Math.min(1, localT)));

    _targetPos.lerpVectors(prev.position, next.position, t);
    _targetLookAt.lerpVectors(prev.lookAt, next.lookAt, t);

    // Mobile camera override (position.z / fov only) — read live via
    // useIsMobile() so a resize or orientation change re-frames correctly,
    // instead of a `window.innerWidth` check baked into the waypoint data
    // at module load (see CameraWaypoint.mobile). Waypoints with no
    // `mobile` override just keep their desktop framing.
    if (isMobile) {
      const prevMobileZ = prev.mobile?.z ?? prev.position.z;
      const nextMobileZ = next.mobile?.z ?? next.position.z;
      _targetPos.z = prevMobileZ + (nextMobileZ - prevMobileZ) * t;
    }

    // Smooth-lock camera to the projects view while the gallery is pinned —
    // snapped directly under reduced motion instead of eased, same
    // convention as every other selection/state ramp in the scene.
    const wantsLock = scrollStore.projectSectionActive ? 1 : 0;
    projectLockRef.current = reducedMotion
      ? wantsLock
      : damp(projectLockRef.current, wantsLock, 0.08, delta);
    const lw = projectLockRef.current;
    if (lw > 0.001) {
      _targetPos.z = _targetPos.z * (1 - lw) + 14 * lw;
      _targetPos.y = _targetPos.y * (1 - lw) + -1 * lw;
      _targetLookAt.y = _targetLookAt.y * (1 - lw) + -1 * lw;
    }

    _targetPos.x += mouse.current.x * 1.5;
    _targetPos.y += mouse.current.y * 0.7;

    // Target FOV
    let targetFov = prev.fov + (next.fov - prev.fov) * t;
    if (isMobile) {
      const prevMobileFov = prev.mobile?.fov ?? prev.fov;
      const nextMobileFov = next.mobile?.fov ?? next.fov;
      targetFov = prevMobileFov + (nextMobileFov - prevMobileFov) * t;
    }

    if (reducedMotion) {
      // No cinematic lag — the eased chase below keeps the camera drifting
      // for a beat after scroll input stops, which reads as autonomous
      // motion. Track the waypoint target 1:1 instead.
      _smoothPos.copy(_targetPos);
      cam.position.copy(_smoothPos);
      _currentLookAt.copy(_targetLookAt);
      cam.lookAt(_currentLookAt);
      if (cam.fov !== targetFov) {
        cam.fov = targetFov;
        cam.updateProjectionMatrix();
      }
    } else {
      // Normal cinematic lag: smooth position chases target
      _smoothPos.lerp(_targetPos, dampAlpha(0.06, delta));
      cam.position.copy(_smoothPos);

      // Smooth lookAt transition
      _currentLookAt.lerp(_targetLookAt, dampAlpha(0.06, delta));
      cam.lookAt(_currentLookAt);

      // FOV lerp — skip matrix rebuild when converged
      const dampedFov = damp(cam.fov, targetFov, 0.05, delta);
      if (Math.abs(dampedFov - cam.fov) > 0.001) {
        cam.fov = dampedFov;
        cam.updateProjectionMatrix();
      }
    }
  });

  return null;
}
