/**
 * Animation and UI configuration constants
 * Extracted to avoid magic numbers and improve maintainability
 */

export const ANIMATION_CONFIG = {
  // Scroll position to show header background
  HEADER_VISIBLE_THRESHOLD: 8,
} as const;

export const INTERSECTION_OBSERVER_CONFIG = {
  DEFAULT_THRESHOLD: 0.1,
  DEFAULT_ROOT_MARGIN: "50px 0px 50px",
} as const;
