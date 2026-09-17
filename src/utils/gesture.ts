interface PointerDownRecord {
  x: number;
  y: number;
  time: number;
}

const TAP_MAX_DISTANCE_PX = 10;
const TAP_MAX_DURATION_MS = 300;

/** True if a pointerup at `up` following `down` reads as a tap, not a drag. */
export function isTapGesture(
  down: PointerDownRecord,
  up: { clientX: number; clientY: number },
): boolean {
  const dx = Math.abs(up.clientX - down.x);
  const dy = Math.abs(up.clientY - down.y);
  const dt = Date.now() - down.time;
  return (
    dx < TAP_MAX_DISTANCE_PX &&
    dy < TAP_MAX_DISTANCE_PX &&
    dt < TAP_MAX_DURATION_MS
  );
}
