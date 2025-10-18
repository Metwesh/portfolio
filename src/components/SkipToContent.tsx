/**
 * Skip to content link for keyboard accessibility
 * Allows keyboard users to skip navigation and jump directly to main content
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only !fixed top-4 left-1/2 z-50 -translate-x-1/2 -translate-y-20 rounded-lg bg-cyan-500 font-semibold text-white shadow-lg focus:not-sr-only focus:translate-y-0 focus:!px-4 focus:!py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
