import gsap from "gsap";
import { useEffect, useRef } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { INTERSECTION_OBSERVER_CONFIG } from "../constants/animations";
import { EXPERIENCES } from "../constants/experiences";
import { GLASS_CARD_CLASS } from "../constants/misc";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { cn } from "../lib/utils";

export function ExperienceSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const glowDotRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Small observer only for the heading gradient reveal
  const { targetRef: headingRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  useEffect(() => {
    const section = sectionRef.current;
    const line = timelineRef.current;
    const dot = glowDotRef.current;
    if (!section || !line) return;

    const cards = cardRefs.current.filter(Boolean);

    if (prefersReducedMotion) {
      line.style.clipPath = "inset(0 0 0% 0)";
      for (const card of cards) {
        if (card) card.style.opacity = "1";
      }
      return;
    }

    let lineTween: ReturnType<typeof gsap.fromTo> | null = null;
    let cardTweens: ReturnType<typeof gsap.fromTo>[] = [];

    import("gsap/ScrollTrigger").then(({ ScrollTrigger: ST }) => {
      gsap.registerPlugin(ST);

      lineTween = gsap.fromTo(
        line,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%",
            // See ProjectsSection — Lenis already smooths the scroll
            // position, so a numeric scrub double-lags on top of that.
            // scrub: true tracks progress immediately instead.
            scrub: true,
            onUpdate: (self) => {
              if (!dot) return;
              const p = self.progress;
              const idx = Math.min(
                Math.floor(p * EXPERIENCES.length),
                EXPERIENCES.length - 1,
              );
              const color = EXPERIENCES[idx].color;
              dot.style.top = `${p * 100}%`;
              dot.style.background = color;
              dot.style.boxShadow = `0 0 16px 6px ${color}90`;
            },
          },
        },
      );

      cardTweens = cards.map((card) =>
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.96, immediateRender: true },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            backdropFilter: "blur(24px)",
            clearProps: "backdropFilter",
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              once: true,
            },
          },
        ),
      );
    });

    return () => {
      lineTween?.scrollTrigger?.kill();
      lineTween?.kill();
      for (const t of cardTweens) {
        t.scrollTrigger?.kill();
        t.kill();
      }
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-labelledby="experience-heading"
      className="relative z-10 flex flex-col items-center px-gutter py-24 sm:px-12 md:px-20 md:py-32 lg:px-32"
    >
      <div
        ref={headingRef as React.RefObject<HTMLDivElement>}
        className="mb-20"
      >
        <SectionHeading id="experience-heading" isIntersecting={isIntersecting}>
          Experience
        </SectionHeading>
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Vertical timeline track — full height, dimmed */}
        <div
          className="absolute top-0 left-4 z-0 h-full w-px rounded-full opacity-20 sm:left-8"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${EXPERIENCES.map((e) => e.color).join(", ")})`,
          }}
        />

        {/* Filled line — clip-path revealed from top as you scroll.
            Gradient spans full height so the tip color matches the current
            experience section dynamically. */}
        <div
          ref={timelineRef}
          className="absolute top-0 left-4 z-0 h-full w-px rounded-full [clip-path:inset(0_0_100%_0)] sm:left-8"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${EXPERIENCES.map((e) => e.color).join(", ")})`,
          }}
        />

        {/* Glow dot — rides the tip of the line, color follows current entry */}
        <div
          ref={glowDotRef}
          aria-hidden="true"
          className="absolute top-0 left-4 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full sm:left-8"
          style={{
            background: EXPERIENCES[0].color,
            boxShadow: `0 0 16px 6px ${EXPERIENCES[0].color}90`,
          }}
        />

        <ul className="relative z-10 space-y-16 py-12">
          {EXPERIENCES.map((experience, index) => (
            <li
              key={`experience-${experience.company}-${index}`}
              className="group relative pl-8 sm:pl-20"
            >
              {/* Timeline dot */}
              <div
                className="absolute top-7 left-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-black transition-transform duration-300 group-hover:scale-150 sm:left-8"
                style={{
                  background: experience.color,
                  boxShadow: `0 0 12px 2px ${experience.color}80`,
                }}
              />

              {/* Card */}
              <div
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={cn(
                  GLASS_CARD_CLASS,
                  "relative overflow-hidden transition-transform duration-500 group-hover:-translate-y-1",
                )}
                style={{ opacity: 0 }}
              >
                {/* Giant watermark — clipped to card bounds by overflow-hidden */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-3 select-none font-black text-[clamp(3rem,8vw,6rem)] text-white/[0.035] leading-none tracking-tighter"
                >
                  {experience.abbreviation}
                </span>

                {/* Gradient mesh */}
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <div
                    className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle, ${experience.color}70, transparent 70%)`,
                    }}
                  />
                </div>

                <div className="relative p-6 sm:p-8">
                  {/* Header row */}
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-white/10"
                      style={{
                        boxShadow: `0 0 20px ${experience.color}50`,
                      }}
                    >
                      <img
                        src={experience.icon}
                        alt={`${experience.company} logo`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain p-1.5"
                      />
                    </div>
                    <div>
                      <h3 className="relative inline-block font-bold text-white text-xl sm:text-2xl">
                        {experience.company}
                        <div
                          className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-full"
                          style={{ background: experience.color }}
                        />
                      </h3>
                      <p
                        className="mt-1.5 text-sm"
                        style={{ color: experience.color }}
                      >
                        {experience.title}
                        <span className="text-white/50">
                          <span className="max-sm:hidden">
                            &nbsp;&mdash;&nbsp;
                          </span>
                          <span className="sm:hidden">
                            <br />
                          </span>
                          {experience.date}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <ul className="space-y-2 text-sm text-white/80 transition-colors duration-300 group-hover:text-white/90 sm:text-base">
                    {experience.points.map((point, pointIndex) => (
                      <li
                        key={`point-${point.title}`}
                        className="flex gap-2 transition-transform duration-300 group-hover:translate-x-1"
                        style={{ transitionDelay: `${pointIndex * 25}ms` }}
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: experience.color }}
                        />
                        <div>
                          <strong>{point.title}</strong>
                          <span>{`: ${point.subtitle}`}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shimmer on hover */}
                <div
                  className="pointer-events-none absolute inset-0 bg-size-[200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    backgroundImage: `linear-gradient(110deg, transparent 25%, ${experience.color}10 50%, transparent 75%)`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
