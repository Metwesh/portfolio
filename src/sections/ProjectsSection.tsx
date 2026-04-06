import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ProjectScrollbar } from "../components/ProjectScrollbar";
import { SectionHeading } from "../components/SectionHeading";
import { INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { projects } from "../constants/projects";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useIsMobile } from "../hooks/useIsMobile";
import { ProjectCard } from "./ProjectCard";

const TOTAL_ITEMS = projects.length + 1; // +1 for title card

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Write coverflow CSS transforms directly to a DOM element — no React re-renders */
function applyCoverflowTransform(
  el: HTMLElement | null,
  offset: number,
  transition: string,
) {
  if (!el) return;

  const absOffset = Math.abs(offset);

  if (absOffset > 2.5) {
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    return;
  }

  el.style.visibility = "visible";
  // Only the active card is interactive
  el.style.pointerEvents = absOffset < 0.6 ? "auto" : "none";

  const spreadX = clamp(offset * 52, -108, 108); // vw — how far cards fan out
  const depthZ = -absOffset * 260; // px — push side cards back
  const rotY = clamp(-offset * 46, -72, 72); // deg — rotate side cards away
  const scale = Math.max(0.68, 1 - absOffset * 0.17);
  const opacity = Math.max(0.08, 1 - absOffset * 0.62);

  el.style.transition = transition;
  el.style.transform = `translate(-50%, -50%) translateX(${spreadX}vw) translateZ(${depthZ}px) rotateY(${rotY}deg) scale(${scale})`;
  el.style.opacity = String(opacity);
  el.style.zIndex = String(Math.round(10 - absOffset * 3));
}

export const ProjectsSection = memo(function ProjectsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleCardRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const currentIndexRef = useRef(0);
  const isSnappingRef = useRef(false);

  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { targetRef: mobileTitleRef, isIntersecting } = useIntersectionObserver(
    {
      threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
      rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
      enabled: isMobile,
    },
  );

  // Scroll to a specific coverflow index
  const scrollToProject = useCallback(
    (targetIndex: number, smooth = true) => {
      const element = sectionRef.current;
      if (!element || isMobile) return;

      const totalScrollDistance = element.offsetHeight - window.innerHeight;
      const targetScroll =
        element.offsetTop +
        (targetIndex / (TOTAL_ITEMS - 1)) * totalScrollDistance;

      window.scrollTo({
        top: targetScroll,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [isMobile],
  );

  // Coverflow scroll handler — writes directly to DOM, zero React re-renders per frame
  useEffect(() => {
    if (isMobile) return;

    const section = sectionRef.current;
    if (!section) return;

    const getActiveIndex = () => {
      const rect = section.getBoundingClientRect();
      const totalScrollDistance = rect.height - window.innerHeight;
      if (totalScrollDistance <= 0) return 0;
      return clamp(-rect.top / totalScrollDistance, 0, 1) * (TOTAL_ITEMS - 1);
    };

    // Fires on every scroll frame — transforms only, no snap logic
    const update = () => {
      const activeIndex = getActiveIndex();
      const snapped = Math.round(activeIndex);

      if (snapped !== currentIndexRef.current) {
        currentIndexRef.current = snapped;
        setCurrentIndex(snapped);
      }

      const transition = isSnappingRef.current
        ? "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.55s ease-out"
        : "none";
      applyCoverflowTransform(
        titleCardRef.current,
        0 - activeIndex,
        transition,
      );
      cardRefs.current.forEach((card, i) => {
        applyCoverflowTransform(card, i + 1 - activeIndex, transition);
      });
    };

    // Debounced snap — fires after scrolling stops
    let debounceTimer: ReturnType<typeof setTimeout>;
    const debouncedSnap = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (isSnappingRef.current) return;
        const activeIndex = getActiveIndex();
        const snapped = Math.round(activeIndex);
        if (Math.abs(activeIndex - snapped) > 0.05) {
          isSnappingRef.current = true;
          scrollToProject(snapped, true);
          setTimeout(() => {
            isSnappingRef.current = false;
          }, 900);
        }
      }, 180);
    };

    // If user starts wheeling mid-snap, cancel immediately so the transition
    // stops fighting the manual scroll
    const cancelSnap = () => {
      if (!isSnappingRef.current) return;
      isSnappingRef.current = false;
      window.scrollTo({ top: window.scrollY }); // interrupts smooth scroll
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("scroll", debouncedSnap, { passive: true });
    window.addEventListener("wheel", cancelSnap, { passive: true });

    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("scroll", debouncedSnap);
      window.removeEventListener("wheel", cancelSnap);
      clearTimeout(debounceTimer);
    };
  }, [isMobile, scrollToProject]);

  // Keyboard navigation
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section?.contains(document.activeElement)) return;

      const scrollAmount = window.innerHeight * 0.8;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          window.scrollBy({ top: scrollAmount, behavior: "smooth" });
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          window.scrollBy({ top: -scrollAmount, behavior: "smooth" });
          break;
        case "Home":
          e.preventDefault();
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        case "End":
          e.preventDefault();
          window.scrollTo({
            top: section.offsetTop + section.offsetHeight,
            behavior: "smooth",
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-heading"
      aria-describedby={!isMobile ? "projects-navigation-help" : undefined}
      tabIndex={!isMobile ? -1 : undefined}
      className="relative z-10 overflow-x-clip py-20 outline-none focus:ring-0 md:px-0 md:py-0"
      style={!isMobile ? { height: `${TOTAL_ITEMS * 100}vh` } : undefined}
    >
      {!isMobile && (
        <div id="projects-navigation-help" className="sr-only">
          Horizontal coverflow section. Use arrow keys or scroll to navigate
          through projects. Press Home to go to the beginning, End to go to the
          end.
        </div>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!isMobile && currentIndex > 0
          ? `Viewing project ${currentIndex} of ${projects.length}: ${
              projects[currentIndex - 1]?.name
            }`
          : ""}
      </div>

      {/* Mobile: vertical stack | Desktop: sticky coverflow viewport */}
      <div className="flex flex-col gap-8 overflow-x-clip md:sticky md:top-0 md:h-screen md:overflow-hidden">
        {/* Perspective container — all cards absolutely positioned inside */}
        <div
          className="relative flex flex-col gap-8 max-md:px-gutter md:h-full md:w-full"
          style={
            !isMobile
              ? { perspective: "1200px", perspectiveOrigin: "50% 50%" }
              : undefined
          }
        >
          {/* Title card */}
          <div
            ref={isMobile ? mobileTitleRef : titleCardRef}
            className={
              isMobile
                ? "mb-12 flex items-center justify-center"
                : "absolute top-1/2 left-1/2 w-screen"
            }
          >
            <SectionHeading
              id="projects-heading"
              isIntersecting={isMobile ? isIntersecting : true}
            >
              Projects
            </SectionHeading>
          </div>

          {/* Project cards */}
          {projects.map((proj, index) => (
            <ProjectCard
              key={proj.name}
              ref={
                !isMobile
                  ? (el) => {
                      cardRefs.current[index] = el;
                    }
                  : undefined
              }
              project={proj}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </div>

        {!isMobile && (
          <ProjectScrollbar
            projectCount={projects.length}
            currentIndex={currentIndex}
            onNavigate={scrollToProject}
          />
        )}
      </div>
    </section>
  );
});
