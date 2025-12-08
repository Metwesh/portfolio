import { useState } from "react";
import { ScrollHelper } from "../components";
import { SectionHeading } from "../components/SectionHeading";
import { Switch } from "../components/Switch";
import { TechCanvas } from "../components/TechCanvas";
import { TechList } from "../components/TechList";
import {
  breakpoints,
  INTERSECTION_OBSERVER_CONFIG,
  navLinks,
} from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { cn } from "../lib/utils";

export function TechStacksSection() {
  const prefersReducedMotion = useReducedMotion();
  const [isList, setIsList] = useState(
    () => window.innerWidth < breakpoints.mobile || prefersReducedMotion
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
        <SectionHeading
          id="tech-stacks-heading"
          isIntersecting={isIntersecting}
        >
          Tech Stacks
        </SectionHeading>
      </div>
      <div
        ref={targetRef}
        className={cn(
          "scroll-mt-18",
          !isList
            ? "-mx-4 h-[520px] w-screen md:h-[650px] lg:h-[750px]"
            : "w-full max-w-6xl"
        )}
        id="tech-stacks-container"
      >
        {isList ? (
          <TechList isInView={isIntersecting} />
        ) : (
          <TechCanvas isInView={isIntersecting} />
        )}
      </div>
      <div className="mx-8 mt-2 grid w-full items-center gap-8 md:grid-cols-3 md:gap-4">
        <ScrollHelper
          href={navLinks[3].href}
          ariaLabel="Scroll to projects"
          className="mx-auto flex w-fit justify-center md:col-start-2 md:col-end-3"
        />
        {!prefersReducedMotion && (
          <Switch
            value={isList}
            onChange={setIsList}
            className="max-md:mx-auto md:col-start-3 md:col-end-4 md:ml-auto"
            target="tech-stacks-container"
            labels={["Canvas", "List"]}
          />
        )}
      </div>
    </section>
  );
}
