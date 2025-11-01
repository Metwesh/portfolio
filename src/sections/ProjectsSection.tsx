import { useEffect, useState } from "react";
import { projects } from "../constants/projects";
import { breakpoints, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection({ scrollY }: { scrollY: number }) {
  const { targetRef: sectionRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const controller = new AbortController();

    const handleResize = () => setWindowWidth(window.innerWidth);

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

  // Calculate horizontal translation based on scroll - must use effect since we read DOM
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

  // Keyboard navigation support
  useEffect(() => {
    if (windowWidth < breakpoints.mobile) return;

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
  }, [windowWidth, sectionRef]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-heading"
      aria-live="polite"
      aria-atomic="false"
      aria-describedby="projects-navigation-help"
      tabIndex={-1}
      className="relative z-10 py-20 outline-none md:px-0 md:py-0"
      style={{
        height:
          windowWidth >= breakpoints.mobile
            ? `${100 + (projects.length + 1) * 100}vh`
            : "auto",
      }}
    >
      {/* Keyboard navigation help for screen readers */}
      <div id="projects-navigation-help" className="sr-only">
        Horizontal scrolling section. Use arrow keys or scroll to navigate
        through projects. Press Home to go to the beginning, End to go to the
        end.
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {windowWidth >= breakpoints.mobile && currentProjectIndex > 0
          ? `Viewing project ${currentProjectIndex} of ${projects.length}: ${projects[currentProjectIndex - 1]?.name}`
          : ""}
      </div>

      {/* Mobile: vertical stack, Desktop: horizontal scroll */}
      <div className="md:-ms-gutter flex flex-col gap-8 md:sticky md:top-0 md:h-screen md:w-screen md:flex-row md:items-center md:gap-0 md:overflow-hidden">
        {/* Progress indicator - only on desktop */}
        {windowWidth >= breakpoints.mobile && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-2">
            {[...Array(projects.length + 1)].map((_, index) => (
              <div
                key={index}
                className="transition-all duration-600"
                style={{
                  width: currentProjectIndex === index ? "32px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor:
                    currentProjectIndex === index
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.3)",
                }}
                aria-label={
                  index === 0
                    ? "Title"
                    : `Project ${index}: ${projects[index - 1]?.name}`
                }
                role="progressbar"
                aria-valuenow={currentProjectIndex}
                aria-valuemin={0}
                aria-valuemax={projects.length}
              />
            ))}
          </div>
        )}
        <div
          className="flex flex-col gap-8 md:h-full md:flex-row md:items-center md:gap-0"
          style={{
            transform:
              windowWidth >= breakpoints.mobile
                ? `translateX(${horizontalTranslate}vw)`
                : "none",
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange:
              isIntersecting && windowWidth >= breakpoints.mobile
                ? "transform"
                : "auto",
            width:
              windowWidth >= breakpoints.mobile
                ? `${(projects.length + 1) * 100}vw`
                : "auto",
          }}
        >
          {/* Title card - slides with projects */}
          <div className="mb-12 flex h-full w-full items-center justify-center md:mb-0 md:w-screen md:flex-shrink-0">
            <h2
              id="projects-heading"
              className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl"
            >
              Featured Projects
              <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-3xl" />
            </h2>
          </div>

          {projects.map((proj, index) => (
            <ProjectCard key={proj.name} project={proj} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
