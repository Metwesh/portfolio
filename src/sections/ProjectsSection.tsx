import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { TagsPopover } from "../components/TagsPopover";
import { projects } from "../constants/projects";
import { lenisInstance } from "../lib/lenisInstance";
import { cn } from "../lib/utils";
import { scrollStore } from "../stores/scrollStore";

let _touchStartX = 0;
let _touchStartY = 0;
let _touchLastX = 0;
let _touchLock: "x" | "y" | null = null;

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Active project index for DOM overlay — updated by GSAP onUpdate
  const [activeIndex, setActiveIndex] = useState(0);
  // displayIndex trails activeIndex: updates after fade-out completes
  const [displayIndex, setDisplayIndex] = useState(0);
  const isMounted = useRef(false);
  const prevIndexRef = useRef(-1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollDist = (projects.length - 1) * window.innerWidth * 0.65;

    const setHeight = () => {
      section.style.height = `${(projects.length - 1) * window.innerWidth * 0.65 + window.innerHeight}px`;
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
            gsap.to([nameRef.current, descRef.current, actionsRef.current], {
              opacity: 1,
              y: 0,
              duration: 0.2,
              ease: "power2.out",
              stagger: 0.025,
            });
          },
          onLeave: () => {
            scrollStore.projectSectionActive = false;
            const els = [nameRef.current, descRef.current, actionsRef.current];
            gsap.killTweensOf(els);
            gsap.to(els, {
              opacity: 0,
              y: -8,
              duration: 0.15,
              ease: "power2.in",
              stagger: 0.02,
            });
          },
          onEnterBack: () => {
            scrollStore.projectSectionActive = true;
            gsap.to([nameRef.current, descRef.current, actionsRef.current], {
              opacity: 1,
              y: 0,
              duration: 0.2,
              ease: "power2.out",
              stagger: 0.025,
            });
          },
          onLeaveBack: () => {
            scrollStore.projectSectionActive = false;
            const els = [nameRef.current, descRef.current, actionsRef.current];
            gsap.killTweensOf(els);
            gsap.to(els, {
              opacity: 0,
              y: -8,
              duration: 0.15,
              ease: "power2.in",
              stagger: 0.02,
            });
          },
          onUpdate: (self) => {
            scrollStore.projectProgress = self.progress;

            const idx = Math.round(self.progress * (projects.length - 1));
            if (counterRef.current) {
              counterRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
            }
            if (idx !== prevIndexRef.current) {
              prevIndexRef.current = idx;
              setActiveIndex(idx);
            }
          },
        },
      },
    );

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    function handleWheel(e: WheelEvent) {
      if (!scrollStore.projectSectionActive) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > absY && absX > 3) {
        e.preventDefault();
        const lenis = lenisInstance.current;
        if (!lenis) return;
        lenis.scrollTo(
          Math.max(0, Math.min(lenis.limit, lenis.scroll + e.deltaX * 1.5)),
          { immediate: true },
        );
      }
    }

    function handleTouchStart(e: TouchEvent) {
      if (!scrollStore.projectSectionActive) return;
      _touchStartX = _touchLastX = e.touches[0].clientX;
      _touchStartY = e.touches[0].clientY;
      _touchLock = null;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!scrollStore.projectSectionActive) return;
      const touch = e.touches[0];
      const dx = touch.clientX - _touchStartX;
      const dy = touch.clientY - _touchStartY;
      if (_touchLock === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        _touchLock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (_touchLock === "x") {
        e.preventDefault();
        const lenis = lenisInstance.current;
        if (!lenis) return;
        const delta = _touchLastX - touch.clientX;
        lenis.scrollTo(
          Math.max(0, Math.min(lenis.limit, lenis.scroll + delta)),
          { immediate: true },
        );
        _touchLastX = touch.clientX;
      }
    }

    function handleTouchEnd() {
      _touchLock = null;
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      section.style.height = "";
      scrollStore.projectProgress = 0;
      scrollStore.projectSectionActive = false;
    };
  }, []);

  // Animate out → swap content → animate in on index change
  useEffect(() => {
    const els = [nameRef.current, descRef.current, actionsRef.current].filter(
      Boolean,
    );
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gsap.killTweensOf(els);
    gsap.to(els, {
      opacity: 0,
      y: -8,
      duration: 0.12,
      ease: "power2.in",
      stagger: 0.025,
      onComplete: () => {
        setDisplayIndex(activeIndex);
      },
    });
  }, [activeIndex]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: displayIndex is the trigger, refs don't need listing
  useEffect(() => {
    const els = [nameRef.current, descRef.current, actionsRef.current].filter(
      Boolean,
    );
    gsap.killTweensOf(els);
    gsap.fromTo(
      els,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.18, ease: "power2.out", stagger: 0.03 },
    );
  }, [displayIndex]);

  const activeProject = projects[displayIndex];
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-7 md:pb-14">
          {/* Logo + Project name */}
          <div
            ref={nameRef}
            className="mb-3 flex flex-col items-center gap-2 opacity-0"
          >
            <div className="relative flex items-end gap-2">
              {activeProject.logo && (
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border p-1",
                    activeProject.darkLogo
                      ? "border-white/30 bg-white/90"
                      : "border-white/20 bg-white/10 backdrop-blur-sm",
                  )}
                >
                  <img
                    src={activeProject.logo}
                    alt={`${activeProject.name} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <h3 className="relative inline-block text-balance font-bold text-2xl text-white tracking-tight sm:text-3xl">
                {activeProject.name}
              </h3>
              <span
                className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${activeProject.color}, transparent)`,
                }}
              />
            </div>
          </div>

          {/* Description */}
          <p
            ref={descRef}
            className="mb-4 max-w-sm px-6 text-center text-white/60 text-xs leading-relaxed opacity-0 sm:max-w-lg sm:px-0 sm:text-sm"
          >
            {activeProject.description}
          </p>

          {/* Tags + visit button */}
          <div
            ref={actionsRef}
            className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 opacity-0"
          >
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
