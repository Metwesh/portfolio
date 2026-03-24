import { useEffect, useRef } from "react";

interface UseScrollSnapOptions {
  enabled: boolean;
  itemCount: number;
  sectionRef: React.RefObject<HTMLElement | null>;
  onSnapToIndex?: (index: number) => void;
  debounceMs?: number;
  threshold?: number; // How close to snap point (0-1)
}

/**
 * Hook that implements smooth scroll snapping behavior for horizontal scroll sections.
 * Detects when scrolling stops and snaps to the nearest item.
 *
 * @param enabled - Whether snapping is enabled
 * @param itemCount - Total number of items (including title card)
 * @param sectionRef - Reference to the section element
 * @param onSnapToIndex - Callback when snapping to an index
 * @param debounceMs - How long to wait after scroll stops before snapping (default: 150ms)
 * @param threshold - Distance from snap point to trigger snap, 0-1 (default: 0.15)
 */
export function useScrollSnap({
  enabled,
  itemCount,
  sectionRef,
  onSnapToIndex,
  debounceMs = 150,
  threshold = 0.15,
}: UseScrollSnapOptions) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSnappingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleScrollEnd = () => {
      const element = sectionRef.current;
      if (!element || isSnappingRef.current) return;

      const rect = element.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate current scroll progress (0-1)
      const enterProgress = -sectionTop;
      const totalScrollDistance = sectionHeight - viewportHeight;
      const scrollProgress = Math.max(
        0,
        Math.min(1, enterProgress / totalScrollDistance),
      );

      // Calculate which item we're closest to
      const currentPosition = scrollProgress * itemCount;
      const nearestIndex = Math.round(currentPosition);

      // Check if we need to snap (if we're not already close enough)
      const distance = Math.abs(currentPosition - nearestIndex);

      if (distance > threshold) {
        // Calculate target scroll position
        const targetScrollProgress = nearestIndex / itemCount;
        const targetScrollAmount = targetScrollProgress * totalScrollDistance;
        const sectionTopOffset = element.offsetTop;
        const targetScroll = sectionTopOffset + targetScrollAmount;

        isSnappingRef.current = true;

        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });

        // Reset snapping flag after animation completes
        setTimeout(() => {
          isSnappingRef.current = false;
        }, 500);

        onSnapToIndex?.(nearestIndex);
      }
    };

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout - snap will occur after user stops scrolling
      scrollTimeoutRef.current = setTimeout(handleScrollEnd, debounceMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, itemCount, sectionRef, onSnapToIndex, debounceMs, threshold]);
}
