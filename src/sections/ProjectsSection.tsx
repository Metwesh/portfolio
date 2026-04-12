import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { TagsPopover } from "../components/TagsPopover";
import { projects } from "../constants/projects";
import { scrollStore } from "../stores/scrollStore";

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Active project index for DOM overlay — updated by GSAP onUpdate
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollDist = (projects.length - 1) * window.innerWidth;

    const setHeight = () => {
      section.style.height = `${(projects.length - 1) * window.innerWidth + window.innerHeight}px`;
    };
    setHeight();

    const tween = gsap.to(
      {},
      {
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${scrollDist}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: setHeight,
          onEnter: () => {
            scrollStore.projectSectionActive = true;
          },
          onLeave: () => {
            scrollStore.projectSectionActive = false;
          },
          onEnterBack: () => {
            scrollStore.projectSectionActive = true;
          },
          onLeaveBack: () => {
            scrollStore.projectSectionActive = false;
          },
          onUpdate: (self) => {
            scrollStore.projectProgress = self.progress;

            const idx = Math.round(self.progress * (projects.length - 1));
            if (counterRef.current) {
              counterRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
            }
            setActiveIndex(idx);
          },
        },
      },
    );

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener("load", handleLoad);
      section.style.height = "";
      scrollStore.projectProgress = 0;
      scrollStore.projectSectionActive = false;
    };
  }, []);

  const activeProject = projects[activeIndex];
  const isClickable = !!activeProject.link;

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-heading"
      className="relative z-10"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Section label + counter */}
        <div className="pointer-events-none absolute top-30 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 md:top-20">
          <SectionHeading id="projects-heading" className="pb-1" isIntersecting>
            Projects
          </SectionHeading>
          <span
            ref={counterRef}
            className="whitespace-pre font-mono text-sm text-white/40 tabular-nums"
          >
            01 / {String(projects.length).padStart(2, "0")}
          </span>
        </div>

        {/* Active project detail overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-14">
          {/* Project name + underline */}
          <div className="mb-3 text-center">
            <h3
              className="relative inline-block font-bold text-2xl text-white tracking-tight transition-all duration-500 sm:text-3xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              {activeProject.name}
              <span
                className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${activeProject.color}, transparent)`,
                }}
              />
            </h3>
          </div>

          {/* Description */}
          <p className="mb-4 max-w-sm px-6 text-center text-white/60 text-xs leading-relaxed sm:max-w-lg sm:px-0 sm:text-sm">
            {activeProject.description}
          </p>

          {/* Tags + visit button */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3">
            {activeProject.tags && activeProject.tags.length > 0 && (
              <TagsPopover
                tags={activeProject.tags}
                visibleCount={3}
                projectColor={activeProject.color}
              />
            )}
            {isClickable && (
              <a
                href={activeProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-semibold text-white text-xs backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/10"
                style={{ boxShadow: `0 0 16px ${activeProject.color}40` }}
              >
                Visit
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
