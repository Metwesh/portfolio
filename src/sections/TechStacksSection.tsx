import { useState } from "react";
import { ScrollHelper } from "../components";
import { TechCanvas } from "../components/TechCanvas";
import {
  navLinks,
  ANIMATION_CONFIG,
  INTERSECTION_OBSERVER_CONFIG,
} from "../constants";
import { Switch } from "../components/Switch";
import { TechList } from "../components/TechList";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function TechStacksSection() {
  const prefersReducedMotion = useReducedMotion();
  const [isList, setIsList] = useState(
    () =>
      window.innerWidth < ANIMATION_CONFIG.MOBILE_BREAKPOINT ||
      prefersReducedMotion,
  );

  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.TECH_STACKS_ROOT_MARGIN,
  });

  return (
    <section
      id="tech-stacks"
      className="flex min-h-[60vh] flex-col items-center justify-center py-24"
      aria-labelledby="tech-stacks-heading"
    >
      {/* Animated section title */}
      <div className="relative mb-20">
        <h2
          id="tech-stacks-heading"
          className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl"
          style={{
            opacity: isIntersecting ? 1 : 0,
            transform: `translateY(${isIntersecting ? 0 : 50}px) scale(${isIntersecting ? 1 : 0.9})`,
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          Tech Stacks
          <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-3xl" />
        </h2>
      </div>
      <div
        ref={targetRef}
        className={`scroll-mt-18 ${
          !isList
            ? "-mx-4 h-[520px] w-screen md:h-[650px] lg:h-[750px]"
            : "w-full max-w-6xl"
        }`}
        id="tech-stacks-container"
      >
        {isList ? (
          <TechList isInView={isIntersecting} />
        ) : (
          <TechCanvas isInView={isIntersecting} />
        )}
      </div>
      <div className="mx-8 mt-2 grid w-full items-center gap-8 md:grid-cols-3 md:gap-4">
        <a
          href={navLinks[3].href}
          aria-label="Scroll to projects"
          className="mx-auto flex w-fit justify-center md:col-start-2 md:col-end-3"
        >
          <ScrollHelper />
        </a>
        {!prefersReducedMotion && (
          <Switch
            value={isList}
            onChange={setIsList}
            className="max-md:mx-auto md:col-start-3 md:col-end-4 md:ml-auto"
            labels={["Canvas", "List"]}
          />
        )}
      </div>
    </section>
  );
}
