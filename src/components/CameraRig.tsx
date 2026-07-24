import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { Vector3 } from "three";
import { CAMERA_WAYPOINTS } from "../constants/cameraWaypoints";
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

    // Smooth-lock camera to the projects view while the gallery is pinned.
    const wantsLock = scrollStore.projectSectionActive ? 1 : 0;
    projectLockRef.current = damp(
      projectLockRef.current,
      wantsLock,
      0.08,
      delta,
    );
    const lw = projectLockRef.current;
    if (lw > 0.001) {
      _targetPos.z = _targetPos.z * (1 - lw) + 14 * lw;
      _targetPos.y = _targetPos.y * (1 - lw) + -1 * lw;
      _targetLookAt.y = _targetLookAt.y * (1 - lw) + -1 * lw;
    }

    _targetPos.x += mouse.current.x * 1.5;
    _targetPos.y += mouse.current.y * 0.7;

    // Target FOV
    const targetFov = prev.fov + (next.fov - prev.fov) * t;

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
  });

  return null;
}
