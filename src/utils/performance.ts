/**
 * Performance utility functions
 */

/**
 * Device quality tier based on memory + CPU.
 * Sampled once at module load — stable for the session.
 *
 * low    → mobile / ≤2 GB RAM / ≤2 cores
 * medium → ≤4 GB RAM / ≤4 cores
 * high   → everything else
 */
export type QualityTier = "low" | "medium" | "high";

export const qualityTier: QualityTier = (() => {
  const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);
  if (isMobile || mem <= 2 || cores <= 2) return "low";
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

/**
 * Request idle callback with fallback for browsers that don't support it
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  ((cb: IdleRequestCallback) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  });

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  ((id: number) => {
    clearTimeout(id);
  });
