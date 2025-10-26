import { projects } from "../constants/projects";
import { ANIMATION_CONFIG, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useReducedMotion } from "../hooks/useReducedMotion";

// 3D Card Tilt Configuration
const CARD_TILT_CONFIG = {
  TILT_INTENSITY: 50, // Higher = less tilt, Lower = more tilt
  HOVER_SCALE: 1.02,
  HOVER_TRANSLATE_Z: 10, // in pixels
} as const;

export function ProjectsSection() {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.PROJECTS_ROOT_MARGIN,
  });

  const prefersReducedMotion = useReducedMotion();

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / CARD_TILT_CONFIG.TILT_INTENSITY;
    const rotateY = (centerX - x) / CARD_TILT_CONFIG.TILT_INTENSITY;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${CARD_TILT_CONFIG.HOVER_TRANSLATE_Z}px) scale(${CARD_TILT_CONFIG.HOVER_SCALE})`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    e.currentTarget.style.transform =
      "rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";
  };

  const handleLiveButtonMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>,
    color: string,
  ) => {
    if (prefersReducedMotion) return;
    e.currentTarget.style.boxShadow = `0 8px 30px ${color}60`;
  };

  const handleLiveButtonMouseLeave = (
    e: React.MouseEvent<HTMLAnchorElement>,
    color: string,
  ) => {
    if (prefersReducedMotion) return;
    e.currentTarget.style.boxShadow = `0 4px 20px ${color}40`;
  };

  const handleCodeButtonMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>,
    color: string,
  ) => {
    if (prefersReducedMotion) return;
    e.currentTarget.style.background = `${color}20`;
    e.currentTarget.style.boxShadow = `0 8px 30px ${color}30`;
  };

  const handleCodeButtonMouseLeave = (
    e: React.MouseEvent<HTMLAnchorElement>,
    color: string,
  ) => {
    if (prefersReducedMotion) return;
    e.currentTarget.style.background = `${color}10`;
    e.currentTarget.style.boxShadow = "none";
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
          const isOdd = index % 2 === 1;
          const translateX =
            ANIMATION_CONFIG.PROJECTS_SLIDE_DISTANCE * (isOdd ? 1 : -1);

          return (
            <div
              key={proj.name}
              className="group perspective-1000 relative overflow-visible"
              style={{
                minHeight: "20rem",
                opacity: isIntersecting ? 1 : 0,
                transform: isIntersecting
                  ? "translateX(0) scale(1)"
                  : `translateX(${translateX}px) scale(0.8)`,
                transition: `all 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * ANIMATION_CONFIG.PROJECTS_STAGGER_DELAY}s`,
              }}
            >
              {/* Main tilting 3D card container */}
              <div
                className="preserve-3d relative h-full w-full overflow-hidden rounded-3xl bg-white/5 shadow-2xl backdrop-blur-lg transition-all duration-500 ease-out"
                style={{
                  boxShadow: `0 8px 32px 0 ${proj.color}33, 0 0 0 1px ${proj.color}20`,
                  transform: "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                {/* Animated colored blob backgrounds with pulsing */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
                  <div
                    className="absolute top-1/3 -right-1/4 h-[300px] w-[300px] animate-pulse rounded-full blur-3xl transition-all duration-1000"
                    style={{
                      background: proj.color,
                      animationDuration: "3s",
                    }}
                  />
                  <div
                    className="absolute bottom-1/4 -left-1/4 h-72 w-72 animate-pulse rounded-full blur-3xl transition-all duration-1000"
                    style={{
                      background: proj.color,
                      animationDuration: "4s",
                      animationDelay: "1s",
                    }}
                  />
                </div>

                {/* Image with parallax overlay effect */}
                <div className="relative h-56 w-full overflow-hidden">
                  {proj.image && (
                    <>
                      <div
                        className="absolute inset-0 transition-transform duration-700 ease-out"
                        style={{
                          transform: "translateZ(30px) scale(1.05)",
                        }}
                      >
                        <img
                          src={proj.image}
                          alt={`${proj.name} preview`}
                          className="h-full w-full object-cover transition-all duration-700 group-hover:brightness-110"
                        />
                      </div>
                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"
                        style={{
                          transform: "translateZ(40px)",
                        }}
                      />
                      {/* Color accent overlay */}
                      <div
                        className="absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-30"
                        style={{
                          background: `linear-gradient(135deg, ${proj.color} 0%, transparent 70%)`,
                          transform: "translateZ(35px)",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Content section with floating effect */}
                <div
                  className="relative z-20 flex flex-col justify-between p-8"
                  style={{
                    transform: "translateZ(50px)",
                    minHeight: "20rem",
                  }}
                >
                  {/* Title with glowing underline */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-2xl font-bold text-white drop-shadow-lg transition-all duration-300 group-hover:translate-y-[-2px]">
                      {proj.name}
                    </h3>
                    <div
                      className="h-1 w-0 rounded-full transition-all duration-500 group-hover:w-20"
                      style={{
                        background: proj.color,
                        boxShadow: `0 0 10px ${proj.color}`,
                      }}
                    />
                  </div>

                  {/* Description */}
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-white/85 transition-all duration-300 group-hover:text-white">
                    {proj.description}
                  </p>

                  {/* Floating action buttons */}
                  <div className="flex gap-3">
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1"
                        style={{
                          background: proj.color,
                          color: "#000",
                          boxShadow: `0 4px 20px ${proj.color}40`,
                        }}
                        onMouseEnter={(e) =>
                          handleLiveButtonMouseEnter(e, proj.color)
                        }
                        onMouseLeave={(e) =>
                          handleLiveButtonMouseLeave(e, proj.color)
                        }
                      >
                        <span className="relative z-10 text-sm">Live</span>
                        <svg
                          className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110 group-hover/btn:rotate-45"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
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
                        className="group/btn relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border-2 px-4 py-3 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1"
                        style={{
                          borderColor: proj.color,
                          color: proj.color,
                          background: `${proj.color}10`,
                        }}
                        onMouseEnter={(e) =>
                          handleCodeButtonMouseEnter(e, proj.color)
                        }
                        onMouseLeave={(e) =>
                          handleCodeButtonMouseLeave(e, proj.color)
                        }
                      >
                        <span className="relative z-10 text-sm">Code</span>
                        <svg
                          className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110 group-hover/btn:rotate-45"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 7h10v10" />
                          <path d="M7 17 17 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Animated corner accents */}
                <div
                  className="pointer-events-none absolute top-0 left-0 h-20 w-20 opacity-0 transition-all duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at top left, ${proj.color}40, transparent 70%)`,
                  }}
                />
                <div
                  className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 opacity-0 transition-all duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at bottom right, ${proj.color}40, transparent 70%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
