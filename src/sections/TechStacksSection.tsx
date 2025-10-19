import { useState } from "react";
import { ScrollHelper } from "../components";
import TechCanvas from "../components/TechCanvas";
import { navLinks } from "../constants";
import Switch from "../components/Switch";
import TechList from "../components/TechList";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export function TechStacksSection() {
  const [isList, setIsList] = useState(window.innerWidth < 768);

  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px 0px 200px 0px",
  });

  return (
    <section
      id="tech-stacks"
      className="flex min-h-[60vh] flex-col items-center justify-center py-24"
    >
      <h2 className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg">
        Tech Stacks
      </h2>
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
        <Switch
          value={isList}
          onChange={setIsList}
          className="max-md:mx-auto md:col-start-3 md:col-end-4 md:ml-auto"
          labels={["Canvas", "List"]}
        />
      </div>
    </section>
  );
}
