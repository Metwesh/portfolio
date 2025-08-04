import { useState } from "react";
import { ScrollHelper } from "../components";
import TechCanvas from "../components/TechCanvas";
import { navLinks } from "../constants";
import Switch from "../components/Switch";
import TechList from "../components/TechList";

export function TechStacksSection() {
  const [isList, setIsList] = useState(window.innerWidth < 768);

  return (
    <section
      id="tech-stacks"
      className="flex min-h-[60vh] flex-col items-center justify-center py-24"
    >
      <h2 className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg">
        Tech Stacks
      </h2>
      <div
        className={`w-full max-w-4xl scroll-mt-18 ${
          !isList ? "h-[420px] md:h-[520px] lg:h-[600px]" : ""
        }`}
        id="tech-stacks-container"
      >
        {isList ? <TechList /> : <TechCanvas />}
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
