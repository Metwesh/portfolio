import { experiences } from "../constants/experiences";
import { ANIMATION_CONFIG, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function ExperienceSection() {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  const prefersReducedMotion = useReducedMotion();

  // Calculate when all cards finish animating
  const lastCardDelay =
    ANIMATION_CONFIG.EXPERIENCE_BASE_DELAY +
    (experiences.length - 1) * ANIMATION_CONFIG.EXPERIENCE_STAGGER_DELAY;
  const cardAnimationDuration = 0.9; // From the card transition duration
  const timelineDelay = lastCardDelay + cardAnimationDuration;

  return (
    <section
      ref={targetRef}
      id="experience"
      aria-labelledby="experience-heading"
      className="flex min-h-screen flex-col items-center justify-center py-24 sm:px-8 md:py-32"
    >
      {/* Animated section title */}
      <div className="relative mb-20">
        <h2
          id="experience-heading"
          className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl"
          style={{
            opacity: isIntersecting ? 1 : 0,
            transform: `translateY(${isIntersecting ? 0 : 50}px) scale(${isIntersecting ? 1 : 0.9})`,
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            willChange: isIntersecting ? "auto" : "opacity, transform",
          }}
        >
          Experience
          <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-3xl" />
        </h2>
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Timeline line */}
        <div
          className="absolute top-0 left-1/2 z-0 h-full w-4 -translate-x-1/2 rounded-full max-sm:left-8"
          style={{
            filter: "blur(24px)",
            backgroundImage: `linear-gradient(to bottom, ${experiences
              .map((exp) => exp.color)
              .join(", ")})`,
            transform: `scaleY(${isIntersecting ? 1 : 0})`,
            transformOrigin: "top",
            transition: isIntersecting
              ? `transform 3s cubic-bezier(0.34, 1.56, 0.64, 1) ${timelineDelay}s`
              : "transform 0.3s ease-out",
            willChange: isIntersecting ? "auto" : "transform",
          }}
        />
        <div
          className="absolute top-0 left-1/2 z-0 h-full w-1 -translate-x-1/2 rounded-full max-sm:left-8"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${experiences
              .map((exp) => exp.color)
              .join(", ")})`,
            transform: `scaleY(${isIntersecting ? 1 : 0})`,
            transformOrigin: "top",
            transition: isIntersecting
              ? `transform 3s cubic-bezier(0.34, 1.56, 0.64, 1) ${timelineDelay}s`
              : "transform 0.3s ease-out",
            willChange: isIntersecting ? "auto" : "transform",
          }}
        />

        <ul className="relative z-10 space-y-16 py-12">
          {experiences.map((experience, index) => {
            const isEven = index % 2 === 0;

            return (
              <li
                key={`experience-${experience.company}-${index}`}
                className="group flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-8"
                style={{
                  opacity: isIntersecting ? 1 : 0,
                  transform: isIntersecting
                    ? "translateY(0) scale(1) rotate(0deg)"
                    : `translateY(100px) scale(0.85) rotate(${isEven ? -ANIMATION_CONFIG.EXPERIENCE_ROTATION_ANGLE : ANIMATION_CONFIG.EXPERIENCE_ROTATION_ANGLE}deg)`,
                  transition: `all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${ANIMATION_CONFIG.EXPERIENCE_BASE_DELAY + index * ANIMATION_CONFIG.EXPERIENCE_STAGGER_DELAY}s`,
                  willChange: isIntersecting ? "auto" : "opacity, transform",
                }}
              >
                {/* Logo with enhanced hover */}
                <div className="relative mx-auto max-sm:mb-4 sm:min-h-16 sm:min-w-16">
                  {/* Glow effect */}
                  <div
                    className="absolute -inset-3 rounded-full opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                    style={{
                      background: `radial-gradient(circle, ${experience.color}80, transparent 70%)`,
                    }}
                  />

                  <div
                    className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 group-hover:scale-110 motion-reduce:transition-none sm:h-16 sm:w-16"
                    style={{
                      boxShadow: `0 0 24px 4px ${experience.color}88`,
                    }}
                  >
                    <img
                      src={experience.icon}
                      alt={`${experience.company} logo`}
                      loading="lazy"
                      className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                    />
                  </div>
                </div>

                {/* Card */}
                <div className="flex flex-1 flex-col items-center gap-6 rounded-2xl">
                  <div
                    className="relative w-full overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-500 not-motion-reduce:group-hover:-translate-y-1 motion-reduce:transition-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                      boxShadow: `0 8px 32px -10px ${experience.color}30`,
                    }}
                  >
                    {/* Gradient mesh background */}
                    <div className="pointer-events-none absolute inset-0 opacity-20">
                      <div
                        className="absolute top-0 right-0 h-64 w-64 translate-x-[30%] -translate-y-[30%] rounded-full blur-3xl transition-all duration-700 group-hover:translate-x-[10%] group-hover:-translate-y-[10%] group-hover:scale-120 motion-reduce:transition-none"
                        style={{
                          background: `radial-gradient(circle, ${experience.color}70, transparent 70%)`,
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="relative p-6 sm:p-8">
                      {/* Title with underline */}
                      <h3 className="relative mb-2 inline-block text-xl font-bold text-white sm:text-2xl">
                        {experience.company}
                        <div
                          className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-16 motion-reduce:transition-none"
                          style={{
                            background: experience.color,
                          }}
                        />
                      </h3>

                      <p
                        className="mb-4 font-semibold transition-all duration-300 motion-reduce:transition-none"
                        style={{
                          color: experience.color,
                        }}
                      >
                        {experience.title}
                        <span className="text-white/60">
                          &nbsp;&mdash;&nbsp;{experience.date}
                        </span>
                      </p>

                      {/* Points */}
                      <ul className="space-y-2 text-sm text-white/80 group-hover:text-white/95 sm:text-base">
                        {experience.points.map((point, pointIndex) => (
                          <li
                            key={`experience-point-${point.title}`}
                            className="flex gap-2 transition-all duration-300 not-motion-reduce:group-hover:translate-x-1 motion-reduce:transition-none"
                            style={{
                              transitionDelay: `${pointIndex * 30}ms`,
                            }}
                          >
                            <span
                              className="mt-2 h-1 w-1 flex-shrink-0 rounded-full transition-all duration-300 motion-reduce:transition-none"
                              style={{
                                background: experience.color,
                              }}
                            />
                            <div>
                              <strong>{point.title}</strong>
                              <span>{`: ${point.subtitle}`}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shimmer effect */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                      style={{
                        backgroundImage: `linear-gradient(110deg, transparent 25%, ${experience.color}15 50%, transparent 75%)`,
                        animation: !prefersReducedMotion
                          ? "shimmer 1.5s ease-in-out"
                          : "none",
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
