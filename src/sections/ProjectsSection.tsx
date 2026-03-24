import { useEffect, useRef, useState } from "react";
import { ProjectScrollbar } from "../components/ProjectScrollbar";
import { SectionHeading } from "../components/SectionHeading";
import { breakpoints, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { projects } from "../constants/projects";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useScrollSnap } from "../hooks/useScrollSnap";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection({ scrollY }: { scrollY: number }) {
  // Intersection observer for title animation (mobile only)
  const { targetRef: titleRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
    enabled: window.innerWidth < breakpoints.mobile,
  });

  // Section ref for horizontal scroll calculations (desktop)
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < breakpoints.mobile,
  );

  useEffect(() => {
    const controller = new AbortController();

    const handleResize = () =>
      setIsMobile(window.innerWidth < breakpoints.mobile);

    window.addEventListener("resize", handleResize, {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, []);

  const [horizontalTranslate, setHorizontalTranslate] = useState(0);

  // Calculate current project index for accessibility announcements
  const currentProjectIndex = Math.max(
    0,
    Math.min(projects.length, Math.round(-horizontalTranslate / 100)),
  );

  // Function to scroll to a specific project
  const scrollToProject = (targetIndex: number, smooth = true) => {
    const element = sectionRef.current;
    if (!element || isMobile) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionHeight = rect.height;
    const totalScrollDistance = sectionHeight - viewportHeight;

    // Calculate target scroll progress (0 to 1)
    const targetScrollProgress = targetIndex / projects.length;
    const targetScrollAmount = targetScrollProgress * totalScrollDistance;

    // Get current scroll position relative to section top
    const sectionTop = element.offsetTop;
    const targetScroll = sectionTop + targetScrollAmount;

    window.scrollTo({
      top: targetScroll,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Calculate horizontal translation based on scroll - must use effect since we read DOM
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollY is intentionally used to trigger re-runs on scroll, calculation reads from DOM
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // Calculate scroll progress through the section
    const enterProgress = -sectionTop;
    const totalScrollDistance = sectionHeight - viewportHeight;
    const scrollProgress = Math.max(
      0,
      Math.min(1, enterProgress / totalScrollDistance),
    );

    // Calculate horizontal translation (projects.length + title card)
    const maxTranslate = projects.length * 100;
    setHorizontalTranslate(-(scrollProgress * maxTranslate));
  }, [scrollY, sectionRef]);

  // Smooth scroll snapping - snaps to nearest project when scrolling stops
  useScrollSnap({
    enabled: !isMobile,
    itemCount: projects.length, // Match the maxTranslate calculation
    sectionRef,
    debounceMs: 150, // Wait 150ms after scroll stops before snapping
    threshold: 0.15, // Snap if more than 15% away from center
  });

  // Keyboard navigation support
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section) return;

      // Check if user is focused on the projects section or its children
      const isInSection = section.contains(document.activeElement);
      if (!isInSection) return;

      const scrollAmount = window.innerHeight * 0.8; // 80vh per key press

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
      aria-live={!isMobile ? "polite" : undefined}
      aria-atomic={!isMobile ? "false" : undefined}
      aria-describedby={!isMobile ? "projects-navigation-help" : undefined}
      tabIndex={!isMobile ? -1 : undefined}
      className="relative z-10 overflow-x-clip py-20 outline-none md:px-0 md:py-0"
      style={
        !isMobile
          ? {
              height: `${100 + (projects.length + 1) * 100}vh`,
            }
          : undefined
      }
    >
      {/* Keyboard navigation help for screen readers - Desktop only */}
      {!isMobile && (
        <div id="projects-navigation-help" className="sr-only">
          Horizontal scrolling section. Use arrow keys or scroll to navigate
          through projects. Press Home to go to the beginning, End to go to the
          end.
        </div>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!isMobile && currentProjectIndex > 0
          ? `Viewing project ${currentProjectIndex} of ${projects.length}: ${
              projects[currentProjectIndex - 1]?.name
            }`
          : ""}
      </div>

      {/* Mobile: vertical stack, Desktop: horizontal scroll */}
      <div className="flex flex-col gap-8 overflow-x-clip md:sticky md:top-0 md:-ms-gutter md:h-screen md:w-screen md:flex-row md:items-center md:gap-0 md:overflow-hidden">
        <div
          className="flex flex-col gap-8 md:h-full md:flex-row md:items-center md:gap-0"
          style={{
            transform: !isMobile
              ? `translateX(${horizontalTranslate}vw)`
              : "none",
            // Smooth transition for both user scrolling and snap animations
            transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: isIntersecting && !isMobile ? "transform" : "auto",
            width: !isMobile ? `${(projects.length + 1) * 100}vw` : "auto",
          }}
        >
          {/* Title card - slides with projects */}
          <div
            ref={titleRef}
            className="mb-12 flex h-full w-full items-center justify-center md:mb-0 md:w-screen md:shrink-0"
          >
            <SectionHeading
              id="projects-heading"
              isIntersecting={isMobile ? isIntersecting : true}
            >
              Projects
            </SectionHeading>
          </div>

          {projects.map((proj, index) => (
            <ProjectCard
              key={proj.name}
              project={proj}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Progress indicator / Scrollbar - only on desktop */}
        {!isMobile && (
          <ProjectScrollbar
            projectCount={projects.length}
            currentIndex={currentProjectIndex}
            onNavigate={scrollToProject}
          />
        )}
      </div>
    </section>
  );
}
