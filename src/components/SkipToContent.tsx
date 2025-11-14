/**
 * Skip to content link for keyboard accessibility
 * Allows keyboard users to skip navigation and jump directly to main content
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="-translate-x-1/2 sr-only top-4 left-1/2 z-50 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:translate-y-0 focus:px-4 focus:py-2"
    >
      Skip to main content
    </a>
  );
}
