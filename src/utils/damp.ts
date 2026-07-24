/**
 * Frame-rate-independent lerp alpha — `factor` is the fraction moved toward
 * target during a nominal 1/60s frame; scaled by actual delta so a slow or
 * uneven frame doesn't leave a catch-up snap on the next one. Reduces to
 * `factor` itself whenever delta is exactly 1/60, so existing tuned factors
 * keep their feel at a steady 60fps. Use directly as the alpha for
 * Vector3.lerp/Quaternion.slerp, or via `damp()` below for plain scalars.
 */
export function dampAlpha(factor: number, delta: number): number {
  return 1 - (1 - factor) ** (delta * 60);
}

/** Scalar version of `dampAlpha` — damps `current` toward `target` directly. */
export function damp(
  current: number,
  target: number,
  factor: number,
  delta: number,
): number {
  return current + (target - current) * dampAlpha(factor, delta);
}
