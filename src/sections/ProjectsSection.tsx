import { useState } from "react";
import { projects } from "../constants/projects";
import { ANIMATION_CONFIG, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export function ProjectsSection() {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.PROJECTS_ROOT_MARGIN,
  });
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlip = (title: string): void => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <section
      ref={targetRef}
      id="projects"
      aria-labelledby="projects-heading"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center py-32"
    >
      <h2
        id="projects-heading"
        className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg"
        style={{
          opacity: isIntersecting ? 1 : 0,
          transform: `translateY(${isIntersecting ? 0 : 30}px)`,
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        Projects
      </h2>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-2">
        {projects.map((proj, index) => {
          const isFlipped = flippedCards.has(proj.name);
          const isOdd = index % 2 === 1;
          const translateX = isOdd
            ? ANIMATION_CONFIG.PROJECTS_SLIDE_DISTANCE
            : -ANIMATION_CONFIG.PROJECTS_SLIDE_DISTANCE;

          return (
            <div
              key={proj.name}
              className="group relative transition-transform duration-300 hover:scale-105"
              style={{
                perspective: 1200,
                minHeight: "20rem",
                opacity: isIntersecting ? 1 : 0,
                transform: isIntersecting
                  ? "translateX(0) scale(1)"
                  : `translateX(${translateX}px) scale(0.8)`,
                transition: `all 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * ANIMATION_CONFIG.PROJECTS_STAGGER_DELAY}s`,
              }}
            >
              {/* Inner container for flip effect */}
              <div
                className="relative h-full w-full transform-gpu rounded-3xl transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                }}
              >
                {/* Front of card */}
                <div
                  className="absolute inset-0 cursor-pointer overflow-hidden rounded-3xl bg-white/5 p-10 shadow-2xl backdrop-blur-lg transition-colors hover:bg-white/2"
                  style={{
                    backfaceVisibility: "hidden",
                    boxShadow: `0 8px 32px 0 ${proj.color}33`,
                  }}
                  onClick={() => toggleFlip(proj.name)}
                >
                  {/* Subtle background image */}
                  {proj.image && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <img
                        src={proj.image}
                        alt={`${proj.name} preview`}
                        loading="lazy"
                        className="h-full w-full scale-[0.85] object-contain opacity-10 blur-[1px] transition-[scale,opacity] duration-500 group-hover:scale-90 group-hover:opacity-30"
                      />
                    </div>
                  )}

                  {/* Decorative glow */}
                  <div
                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
                    style={{ background: proj.color }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col">
                    <h3 className="mb-3 text-2xl font-bold text-white drop-shadow-lg">
                      {proj.name}
                    </h3>
                    <p className="mb-4 font-medium text-white/80">
                      {proj.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-semibold transition-all hover:underline"
                          style={{ color: proj.color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Project
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 7h10v10" />
                            <path d="M7 17 17 7" />
                          </svg>
                        </a>
                      )}
                      {proj.source_code_link && (
                        <a
                          href={proj.source_code_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-2 font-semibold transition-all hover:underline"
                          style={{ color: proj.color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Source
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 7h10v10" />
                            <path d="M7 17 17 7" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Flip hint */}
                    <div className="mt-4 text-center text-xs text-white/40">
                      Click card to view image
                    </div>
                  </div>
                </div>

                {/* Back of card */}
                <div
                  className="absolute inset-0 cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-black/90 to-black/70 shadow-2xl backdrop-blur-lg"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    boxShadow: `0 8px 32px 0 ${proj.color}66`,
                  }}
                  onClick={() => toggleFlip(proj.name)}
                >
                  {/* Full image display only */}
                  {proj.image && (
                    <div className="flex h-full w-full items-center justify-center p-4">
                      <img
                        src={proj.image}
                        alt={`${proj.name} full preview`}
                        className="max-h-full max-w-full object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}

                  {/* Title overlay only */}
                  <div
                    className="absolute right-0 bottom-0 left-0 p-6 pt-12"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)",
                    }}
                  >
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ color: proj.color }}
                    >
                      {proj.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
