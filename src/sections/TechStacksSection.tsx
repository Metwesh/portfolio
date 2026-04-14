import { useEffect, useState } from "react";
import { ScrollHelper } from "../components";
import { SectionHeading } from "../components/SectionHeading";
import { navLinks } from "../constants";
import { technologies } from "../constants/technologies";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { cn } from "../lib/utils";
import { scrollStore } from "../stores/scrollStore";

const SKILL_CATEGORIES = ["Frontend", "Backend", "DevOps", "Tools", "Design"];

export function TechStacksSection() {
  const { targetRef: sentinelRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.2,
    rootMargin: "0px",
  });

  const [boxSelected, setBoxSelected] = useState(false);
  const [boxEverSelected, setBoxEverSelected] = useState(false);
  const [sphereRotated, setSphereRotated] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const selected = (e as CustomEvent<{ selected: boolean }>).detail
        .selected;
      setBoxSelected(selected);
      if (selected) setBoxEverSelected(true);
    };
    document.addEventListener("universe:boxselected", handler);
    return () => document.removeEventListener("universe:boxselected", handler);
  }, []);

  useEffect(() => {
    const handler = () => setSphereRotated(true);
    document.addEventListener("universe:sphererotated", handler);
    return () =>
      document.removeEventListener("universe:sphererotated", handler);
  }, []);

  // Activate trackball controls + drive 3D constellation visibility
  // Also disable <main> pointer events so the canvas below can receive drag input
  useEffect(() => {
    scrollStore.techSectionActive = isIntersecting;
    const mainEl = document.getElementById("main-content");
    if (mainEl) mainEl.style.pointerEvents = isIntersecting ? "none" : "";
    document.dispatchEvent(
      new CustomEvent("universe:interactive", {
        detail: { active: isIntersecting },
      }),
    );
    return () => {
      if (mainEl) mainEl.style.pointerEvents = "";
    };
  }, [isIntersecting]);

  return (
    <section
      ref={sentinelRef as React.RefObject<HTMLElement>}
      id="tech-stacks"
      aria-labelledby="tech-stacks-heading"
      className="pointer-events-none relative z-10 h-svh md:h-[400svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col py-20">
        {/* Radial glow — blooms in as sphere arrives */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="h-175 w-175 rounded-full transition-all duration-1000"
            style={{
              background:
                "radial-gradient(circle, rgba(0,238,255,0.07) 0%, rgba(168,85,247,0.05) 45%, transparent 70%)",
              opacity: isIntersecting ? 1 : 0,
              transform: isIntersecting ? "scale(1)" : "scale(0.6)",
            }}
          />
        </div>

        {/* Heading — hidden while a tech box is selected */}
        <div
          className="mb-6 w-full px-gutter transition-opacity duration-300 sm:px-12 md:px-20"
          style={{ opacity: boxSelected ? 0 : 1 }}
        >
          <SectionHeading
            id="tech-stacks-heading"
            isIntersecting={isIntersecting}
          >
            Tech Stacks
          </SectionHeading>
        </div>

        {/* Screen-reader fallback — the 3D sphere is purely visual */}
        <ul className="sr-only">
          {technologies.map((t) => (
            <li key={t.name}>{t.name}</li>
          ))}
        </ul>

        {/* Spacer — sphere lives here in canvas */}
        <div className="flex-1" />

        {/* Bottom content — hidden while a tech box is selected */}
        <div
          className="flex flex-col items-center gap-4 pb-6 transition-opacity duration-300"
          style={{
            opacity: boxSelected ? 0 : 1,
          }}
        >
          {/* Count */}
          <p
            className="font-bold text-4xl tracking-[-0.04em] transition-all duration-700 sm:text-5xl"
            style={{
              color: "rgba(255,255,255,0.08)",
              opacity: isIntersecting ? 1 : 0,
              transform: isIntersecting ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {technologies.length} tools.
          </p>

          {/* Drag hint */}
          <div className="relative h-6 w-full">
            <p
              className="absolute inset-0 text-center text-white/25 text-xs uppercase tracking-widest transition-all duration-700"
              style={{
                transitionDelay: "150ms",
                opacity: isIntersecting && !sphereRotated ? 1 : 0,
                transform:
                  isIntersecting && !sphereRotated
                    ? "translateY(0)"
                    : "translateY(10px)",
              }}
            >
              Drag the sphere to explore
            </p>
            <p
              className="absolute inset-0 text-center text-white/25 text-xs uppercase tracking-widest transition-all duration-700"
              style={{
                transitionDelay: "150ms",
                opacity:
                  isIntersecting && sphereRotated && !boxEverSelected ? 1 : 0,
                transform:
                  isIntersecting && sphereRotated && !boxEverSelected
                    ? "translateY(0)"
                    : "translateY(10px)",
              }}
            >
              Click box to explore
            </p>
          </div>

          {/* Category row — staggered */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium text-white/20 text-xs uppercase tracking-widest">
            {SKILL_CATEGORIES.map((cat, i, arr) => (
              <span
                key={cat}
                className="flex items-center gap-6 transition-all duration-500"
                style={{
                  transitionDelay: `${200 + i * 80}ms`,
                  opacity: isIntersecting ? 1 : 0,
                  transform: isIntersecting
                    ? "translateY(0)"
                    : "translateY(8px)",
                }}
              >
                {cat}
                {i < arr.length - 1 && (
                  <span className="h-px w-4 bg-white/10" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>

          <div
            className={cn(
              "pointer-events-auto mt-2",
              boxSelected && "pointer-events-none",
            )}
          >
            <ScrollHelper
              href={navLinks[3].href}
              ariaLabel="Scroll to experience"
              className="flex w-fit"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
