import { projects } from "../constants/projects";
import { ANIMATION_CONFIG, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { TagsPopover } from "../components/TagsPopover";

export function ProjectsSection() {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.PROJECTS_ROOT_MARGIN,
  });

  return (
    <section
      ref={targetRef}
      id="projects"
      aria-labelledby="projects-heading"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-32"
    >
      {/* Animated section title */}
      <div className="relative mb-20">
        <h2
          id="projects-heading"
          className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl"
          style={{
            opacity: isIntersecting ? 1 : 0,
            transform: `translateY(${isIntersecting ? 0 : 50}px) scale(${isIntersecting ? 1 : 0.9})`,
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          Featured Projects
          <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-3xl" />
        </h2>
      </div>

      {/* Projects grid */}
      <div className="grid w-full max-w-7xl grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
        {projects.map((proj, index) => {
          const isOdd = index % 2 === 1;
          const translateX =
            ANIMATION_CONFIG.PROJECTS_SLIDE_DISTANCE * (isOdd ? 1 : -1);

          return (
            <article
              key={proj.name}
              className="group relative"
              style={{
                opacity: isIntersecting ? 1 : 0,
                transform: isIntersecting
                  ? "translateX(0) scale(1)"
                  : `translateX(${translateX}px) scale(0.95)`,
                transition: `all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * ANIMATION_CONFIG.PROJECTS_STAGGER_DELAY}s`,
              }}
            >
              {/* Glow effect behind card */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100 motion-reduce:transition-none"
                style={{
                  background: `radial-gradient(circle at center, ${proj.color}40, transparent 70%)`,
                }}
              />

              {/* Main card */}
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-white/20 group-hover:shadow-2xl motion-reduce:transition-none">
                {/* Animated gradient mesh */}
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="absolute top-0 right-0 h-96 w-96 translate-x-[20%] -translate-y-[20%] rounded-full blur-3xl transition-all duration-1000 group-hover:translate-x-[10%] group-hover:-translate-y-[10%] group-hover:scale-120 motion-reduce:transition-none"
                    style={{
                      background: `radial-gradient(circle, ${proj.color}60, transparent 70%)`,
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 h-80 w-80 -translate-x-[20%] translate-y-[20%] rounded-full blur-3xl transition-all duration-1000 group-hover:-translate-x-[10%] group-hover:translate-y-[10%] group-hover:scale-120 motion-reduce:transition-none"
                    style={{
                      background: `radial-gradient(circle, ${proj.color}40, transparent 70%)`,
                    }}
                  />
                </div>

                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none">
                  <div
                    className="absolute inset-0 -translate-x-full bg-[length:200%_100%] motion-safe:animate-[shimmer_2s_infinite]"
                    style={{
                      backgroundImage: `linear-gradient(110deg, transparent 25%, ${proj.color}20 50%, transparent 75%)`,
                    }}
                  />
                </div>

                {/* Image section with parallax */}
                <div className="relative h-64 overflow-hidden md:h-80">
                  {proj.image && (
                    <>
                      <div className="absolute inset-0 transition-transform duration-700 not-motion-reduce:group-hover:scale-110 motion-reduce:transition-none">
                        <img
                          src={proj.image}
                          alt={`${proj.name} preview`}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Multi-layer gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div
                        className="absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-60 motion-reduce:transition-none"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${proj.color}80 0%, transparent 60%)`,
                        }}
                      />

                      {/* Spotlight effect */}
                      <div className="spotlight-effect pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
                    </>
                  )}

                  {/* Floating tech tag preview */}
                  {proj.tags && proj.tags.length > 0 && (
                    <div
                      className="absolute top-4 left-4 max-w-[80%]"
                      style={{
                        opacity: isIntersecting ? 1 : 0,
                        transform: `translateY(${isIntersecting ? 0 : -20}px)`,
                        transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`,
                      }}
                    >
                      <TagsPopover
                        tags={proj.tags}
                        visibleCount={3}
                        projectColor={proj.color}
                      />
                    </div>
                  )}
                </div>

                {/* Content section */}
                <div className="relative p-6 md:p-8">
                  {/* Title with animated underline */}
                  <h3 className="relative mb-4 inline-block text-2xl font-bold text-white md:text-3xl">
                    {proj.name}
                    <div
                      className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-16 motion-reduce:transition-none"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${proj.color}, transparent)`,
                        boxShadow: `0 0 20px ${proj.color}80`,
                      }}
                    />
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-sm leading-relaxed text-white/70 transition-colors duration-300 group-hover:text-white/90 motion-reduce:transition-none md:text-base">
                    {proj.description}
                  </p>

                  {/* Action buttons with magnetic effect */}
                  <div className="flex flex-wrap gap-3">
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative min-w-[120px] flex-1 overflow-hidden rounded-xl px-5 py-3 text-center font-bold"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${proj.color}, ${proj.color}CC)`,
                          boxShadow: `0 4px 20px ${proj.color}40`,
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                          View Live
                          <svg
                            className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-45 motion-reduce:transition-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M7 7h10v10M7 17L17 7"
                            />
                          </svg>
                        </span>
                        {/* Button glow */}
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 motion-reduce:transition-none">
                          <div className="absolute inset-0 bg-white/20" />
                        </div>
                      </a>
                    )}
                    {proj.source_code_link && (
                      <a
                        href={proj.source_code_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative min-w-[120px] flex-1 overflow-hidden rounded-xl border-2 px-5 py-3 text-center font-bold"
                        style={{
                          borderColor: proj.color,
                          color: proj.color,
                          backgroundColor: `${proj.color}15`,
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Source Code
                          <svg
                            className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-45 motion-reduce:transition-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M7 7h10v10M7 17L17 7"
                            />
                          </svg>
                        </span>
                        {/* Button glow - colored version */}
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 motion-reduce:transition-none"
                          style={{
                            background: `${proj.color}20`,
                          }}
                        />
                      </a>
                    )}
                  </div>
                </div>

                {/* Corner accents */}
                <div
                  className="absolute top-0 right-0 h-32 w-32 opacity-0 transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at top right, ${proj.color}40, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 h-32 w-32 opacity-0 transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at bottom left, ${proj.color}40, transparent 70%)`,
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
