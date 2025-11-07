/**
 * Animation and UI configuration constants
 * Extracted to avoid magic numbers and improve maintainability
 */

export const ANIMATION_CONFIG = {
  // Scroll thresholds
  SCROLL_THRESHOLD: 5, // Minimum scroll delta to trigger updates
  HEADER_VISIBLE_THRESHOLD: 8, // Scroll position to show header background

  // Hero section parallax
  HERO_PARALLAX_SPEED: 0.6,
  HERO_MAX_OFFSET: 400,
  HERO_FADE_FACTOR: 0.6,

  // Projects section
  PROJECTS_SLIDE_DISTANCE: 150,
  PROJECTS_STAGGER_DELAY: 0.15, // seconds between each project card animation

  // Experience section
  EXPERIENCE_STAGGER_DELAY: 0.2,
  EXPERIENCE_BASE_DELAY: 0.5,
  EXPERIENCE_ROTATION_ANGLE: 5, // degrees

  // Certificates section
  CERTIFICATES_STAGGER_DELAY: 0.12,
  CERTIFICATES_DEPTH_OFFSET: 50,
  CERTIFICATES_ROTATION_FACTOR: 3,
  CERTIFICATES_BASE_OFFSET: 150,
  CERTIFICATES_OFFSET_STEP: 20,
} as const;

export const INTERSECTION_OBSERVER_CONFIG = {
  DEFAULT_THRESHOLD: 0.1,
  DEFAULT_ROOT_MARGIN: "50px",
  PROJECTS_ROOT_MARGIN: "50px 0px 200px 0px",
  TECH_STACKS_ROOT_MARGIN: "50px 0px 200px 0px",
} as const;
