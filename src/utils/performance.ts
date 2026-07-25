/**
 * Performance utility functions
 */

/**
 * Device quality tier based on memory + CPU.
 * Sampled once at module load — stable for the session.
 *
 * low    → ≤2 GB RAM / ≤2 cores, or mobile with ≤4 GB RAM / ≤4 cores
 * medium → ≤4 GB RAM / ≤4 cores (desktop), or a capable mobile device
 * high   → everything else
 *
 * Being mobile alone no longer forces "low" — a flagship phone with decent
 * RAM/cores gets the same medium/high treatment a desktop would, since the
 * old blanket downgrade was flattening every phone's canvas resolution
 * regardless of how capable it actually was.
 */
export type QualityTier = "low" | "medium" | "high";

export const qualityTier: QualityTier = (() => {
  const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);
  if (mem <= 2 || cores <= 2 || (isMobile && (mem <= 4 || cores <= 4))) {
    return "low";
  }
  if (mem <= 4 || cores <= 4) return "medium";
  return "high";
})();

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
