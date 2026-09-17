import { Vector3 } from "three";

export interface CameraWaypoint {
  /** Normalized scroll progress (0 = top, 1 = bottom of page) */
  progress: number;
  position: Vector3;
  lookAt: Vector3;
  fov: number;
  /**
   * Optional mobile-only override for position.z / fov. Applied live in
   * CameraRig via useIsMobile() rather than baked into `position`/`fov`
   * directly — a `window.innerWidth` check here would only ever run once,
   * at module import, and never react to a resize or orientation change.
   */
  mobile?: { z: number; fov: number };
}

/**
 * Camera waypoints for the scroll-driven universe journey.
 * All Vector3 instances are created at module level (no per-frame allocation).
 * CameraRig lerps between the two surrounding waypoints every frame.
 *
 * Tune these values to adjust the camera drift as the user scrolls.
 */
export const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  {
    progress: 0,
    position: new Vector3(0, 0, 10),
    lookAt: new Vector3(0, 0, 0),
    fov: 60,
  },
  {
    progress: 0.2,
    // Projects — centered head-on view for the 3D gallery flyby
    position: new Vector3(0, -1, 14),
    lookAt: new Vector3(0, -1, 0),
    fov: 65,
  },
  {
    progress: 0.45,
    // Tech constellation — sphere radius 8 centred at z=-6.
    // Desktop gets a closer camera; mobile is already well-framed at z=16
    // (see `mobile` override above, applied live by CameraRig).
    position: new Vector3(0, -2, 13),
    lookAt: new Vector3(0, -3, -8),
    fov: 60,
    mobile: { z: 16, fov: 65 },
  },
  {
    progress: 0.7,
    // Experience — subtle left drift
    position: new Vector3(-2, 0.5, 14),
    lookAt: new Vector3(0, 0, 0),
    fov: 62,
  },
  {
    progress: 1.0,
    // Certificates — elevated view, slight pullback
    position: new Vector3(1, 2, 12),
    lookAt: new Vector3(0, 0, 0),
    fov: 58,
  },
];
