import { refractive } from "@hashintel/refractive";
import { useEffect, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useReducedMotion } from "../hooks/useReducedMotion";

function isInteractiveTarget(el: Element | null): boolean {
  let node = el;
  while (node && node !== document.body) {
    const tag = node.tagName.toLowerCase();
    if (
      tag === "a" ||
      tag === "button" ||
      node.getAttribute("role") === "button"
    ) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

export function CustomCursor() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number;
    let isPointer = false;
    let canvas3dHovered = false;

    const setPointerState = (next: boolean) => {
      if (next === isPointer) return;
      isPointer = next;
      dot.style.opacity = `${isPointer ? 0 : 1}`;
      ring.style.borderColor = isPointer
        ? "rgba(255,255,255,0.95)"
        : "rgba(255,255,255,0.4)";
      ring.style.borderWidth = isPointer ? "2px" : "1px";
      // spread shadow = visually bigger without changing layout (keeps WebGL stable)
      ring.style.boxShadow = isPointer
        ? "0 0 0 10px rgba(255,255,255,0.2)"
        : "none";
    };

    const handle3dEnter = () => {
      canvas3dHovered = true;
      setPointerState(true);
    };
    const handle3dLeave = () => {
      canvas3dHovered = false;
      setPointerState(false);
    };
    window.addEventListener("techbox:pointerenter", handle3dEnter);
    window.addEventListener("techbox:pointerleave", handle3dLeave);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      if (!canvas3dHovered) {
        const el = document.elementFromPoint(mouseX, mouseY);
        setPointerState(isInteractiveTarget(el));
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("techbox:pointerenter", handle3dEnter);
      window.removeEventListener("techbox:pointerleave", handle3dLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile, prefersReducedMotion]);

  if (isMobile || prefersReducedMotion) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{ transition: "opacity 150ms ease" }}
        className="pointer-events-none fixed top-0 left-0 z-9999 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />
      <refractive.div
        ref={ringRef}
        aria-hidden="true"
        style={{
          transition: "border-color 200ms ease, box-shadow 200ms ease",
        }}
        refraction={{
          blur: 0.5,
          radius: 16,
          glassThickness: 16,
          bezelWidth: 32,
          refractiveIndex: 3,
        }}
        className="pointer-events-none fixed top-0 left-0 z-9998 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
      />
    </>
  );
}
