/**
 * Module-level scroll singleton — written by Lenis, read by useFrame hooks.
 * Zero React involvement: no useState, no context, no re-renders.
 * Components in useFrame read this directly each frame.
 */
export const scrollStore = {
  /** Raw scroll position in pixels */
  raw: 0,
  /** Normalized scroll progress 0–1 (0 = top, 1 = bottom of page) */
  progress: 0,
  /** Lenis velocity */
  velocity: 0,
  /** Projects section scroll progress 0–1 (written by GSAP onUpdate in ProjectsSection) */
  projectProgress: 0,
  /** True while the sticky projects section is pinned (GSAP enter/leave callbacks) */
  projectSectionActive: false,
  /** True while the tech stacks section is in view (IntersectionObserver in TechStacksSection) */
  techSectionActive: false,
  /** True while a TechBox is selected (written by TechConstellation, read by MLogo) */
  techBoxSelected: false,
  /** True while any TechBox is hovered (written by TechBox, read by TechConstellation) */
  techBoxHovered: false,
  /** M logo world-space position — written by MLogo useFrame, read by TechConstellation */
  mLogoY: 0,
  mLogoZ: 0,
};
