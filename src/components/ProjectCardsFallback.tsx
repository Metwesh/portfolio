import { GLASS_CARD_CLASS } from "../constants/misc";
import { PROJECTS } from "../constants/projects";
import { cn } from "../lib/utils";
import { TagsPopover } from "./TagsPopover";

// Reduced-motion fallback for the 3D project card gallery — a plain, static
// Tailwind grid, no scroll-scrubbed sweep, no pinned scroll, no WebGL.
export function ProjectCardsFallback() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {PROJECTS.map((project) => (
        <article
          key={project.name}
          className={cn(
            GLASS_CARD_CLASS,
            "group relative flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-500 hover:border-white/20 hover:shadow-2xl",
          )}
          style={{ boxShadow: `0 8px 32px -10px ${project.color}30` }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div
              className="absolute top-0 right-0 h-48 w-48 translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${project.color}80, transparent 70%)`,
              }}
            />
          </div>

          {/* Border glow on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: `inset 0 0 0 1px ${project.color}60` }}
          />

          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={project.image}
              alt={`${project.name} screenshot`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative z-10 flex flex-1 flex-col p-6">
            <div className="mb-2 flex items-center gap-2">
              {project.logo && (
                <div className="relative h-9 w-9 shrink-0">
                  <div
                    className="absolute inset-0 rounded-lg opacity-40 blur-md transition-opacity duration-500 group-hover:opacity-80"
                    style={{ background: project.color }}
                  />
                  <div
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-lg border p-1",
                      project.darkLogo
                        ? "border-white/30 bg-white/90"
                        : "border-white/20 bg-white/15",
                    )}
                  >
                    <img
                      src={project.logo}
                      alt={`Logo for ${project.name}`}
                      width={36}
                      height={36}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}
              <h3 className="relative font-bold text-lg text-white">
                {project.name}
                <div
                  className="absolute -bottom-1 left-0 h-px w-15 rounded-full transition-all duration-500 group-hover:w-30"
                  style={{
                    background: `linear-gradient(90deg, ${project.color}, transparent)`,
                    boxShadow: `0 0 8px ${project.color}80`,
                  }}
                />
              </h3>
            </div>

            <p className="mb-4 text-sm text-white/60 transition-colors duration-300 group-hover:text-white/80">
              {project.description}
            </p>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              {project.tags && project.tags.length > 0 && (
                <TagsPopover
                  tags={project.tags}
                  visibleCount={3}
                  projectColor={project.color}
                />
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-auto flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3 py-1 font-semibold text-white text-xs transition-colors duration-300 hover:border-white/40 hover:bg-white/15"
                  style={{ boxShadow: `0 0 16px ${project.color}40` }}
                >
                  Visit
                  <svg
                    className="h-3 w-3"
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
        </article>
      ))}
    </div>
  );
}
