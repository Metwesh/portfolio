import { forwardRef } from "react";
import { TagsPopover } from "../components/TagsPopover";
import { ANIMATION_CONFIG, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import type { Project } from "../constants/projects";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { cn } from "../lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  isMobile?: boolean;
}

export const ProjectCard = forwardRef<HTMLElement, ProjectCardProps>(
  function ProjectCard({ project, index, isMobile = false }, ref) {
    const isEven = index % 2 === 0;

    // Intersection observer only used on mobile for entrance animations
    const { targetRef, isIntersecting } = useIntersectionObserver({
      threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
      rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
      enabled: isMobile,
    });

    const isClickable = !!project.link;
    const CardInner = isClickable ? "a" : "div";

    return (
      <article
        ref={isMobile ? (targetRef as React.Ref<HTMLElement>) : ref}
        className={cn("w-full", !isMobile && "w-[min(80vw,920px)]")}
        style={
          isMobile
            ? {
                opacity: isIntersecting ? 1 : 0,
                transform: isIntersecting
                  ? "translateX(0) scale(1)"
                  : `translateX(${
                      isEven
                        ? ANIMATION_CONFIG.PROJECTS_SLIDE_DISTANCE
                        : -ANIMATION_CONFIG.PROJECTS_SLIDE_DISTANCE
                    }px) scale(0.85)`,
                transition: "all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)",
                willChange: isIntersecting ? "auto" : "opacity, transform",
              }
            : undefined
        }
      >
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center md:px-8">
          <div className="group relative w-full">
            {/* Glow effect on hover - similar to certificates */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, ${project.color}50, ${project.color}30)`,
              }}
            />

            <CardInner
              className="relative block rounded-[22px] border border-white/10 bg-white/5 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-2xl"
              {...(isClickable
                ? {
                    href: project.link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "aria-label": project.name,
                  }
                : {})}
            >
              {/* Animated gradient mesh background */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px] opacity-30">
                <div
                  className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl transition-all duration-1000 group-hover:scale-125"
                  style={{
                    background: `radial-gradient(circle, ${project.color}70, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl transition-all duration-1000 group-hover:scale-125"
                  style={{
                    background: `radial-gradient(circle, ${project.color}40, transparent 70%)`,
                  }}
                />
              </div>

              {/* Animated border gradient */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${project.color}20, transparent 50%, ${project.color}10)`,
                }}
              />

              <div className="relative grid grid-cols-1 items-center gap-6 p-4 md:grid-cols-12 md:gap-8 md:p-6">
                {/* Image */}
                <div
                  className={cn(
                    "relative",
                    isEven ? "md:col-span-7" : "md:order-2 md:col-span-7",
                  )}
                >
                  {/* Clickable indicator - positioned on image */}
                  {isClickable && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-2 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-white/40 group-hover:bg-black/60 md:top-4 md:right-4">
                      <span className="font-semibold text-white text-xs">
                        Visit
                      </span>
                      <svg
                        className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
                    </div>
                  )}

                  <div className="relative overflow-hidden rounded-xl border border-white/10 transition-all duration-500 group-hover:border-white/20">
                    {project.image && (
                      <>
                        <img
                          src={project.image}
                          alt={`${project.name} preview`}
                          loading="lazy"
                          decoding="async"
                          className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110 md:h-90"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                        <div
                          className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-50"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${project.color}55, transparent 60%)`,
                            opacity: 0.35,
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={
                    isEven ? "md:col-span-5" : "md:order-1 md:col-span-5"
                  }
                >
                  {/* Logo section - prominent brand logo */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="relative">
                      {/* Logo glow */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60"
                        style={{ background: project.color }}
                      />
                      <div
                        className={cn(
                          "relative flex h-20 w-20 items-center justify-center rounded-xl border p-1 transition-all duration-500 group-hover:scale-105",
                          project.darkLogo
                            ? "border-white/30 bg-white/95 group-hover:border-white/40 group-hover:bg-white"
                            : "border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-white/20 group-hover:bg-white/10",
                        )}
                      >
                        {project.logo ? (
                          <div className="relative h-full w-full">
                            <img
                              src={project.logo}
                              alt={`${project.name} logo`}
                              className="h-full w-full object-contain transition-all duration-500"
                            />
                            {project.darkLogo && (
                              <>
                                {/* Color overlay on hover */}
                                <div
                                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-30"
                                  style={{
                                    background: `radial-gradient(circle at center, ${project.color}50, ${project.color}20)`,
                                  }}
                                />
                                {/* Glow effect behind logo */}
                                <div
                                  className="pointer-events-none absolute inset-0 -z-10 rounded-lg opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60"
                                  style={{
                                    background: project.color,
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ) : (
                          <div
                            className="h-full w-full rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, ${project.color}40, ${project.color}20)`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <h3
                    className="font-bold text-3xl transition-colors duration-300 group-hover:text-white md:text-4xl"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    <span className="relative">
                      {project.name}
                      <span
                        className="absolute -bottom-1 left-0 h-0.75 w-16 rounded-full transition-all duration-500 group-hover:w-32"
                        style={{
                          background: `linear-gradient(90deg, ${project.color}, transparent)`,
                        }}
                      />
                    </span>
                  </h3>
                  <p className="mt-4 text-white/90 transition-colors duration-300 group-hover:text-white md:text-lg">
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-5">
                      <TagsPopover
                        tags={project.tags}
                        visibleCount={4}
                        projectColor={project.color}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardInner>
          </div>
        </div>
      </article>
    );
  },
);
