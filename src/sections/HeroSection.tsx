import { ScrollHelper } from "../components";
import { ANIMATION_CONFIG, navLinks } from "../constants";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function HeroSection({ scrollY }: { scrollY: number }) {
  const prefersReducedMotion = useReducedMotion();
  // React Compiler will optimize this - no need for useMemo
  const initialHeight = window.innerHeight;

  return (
    <section
      id="scroll-section"
      className="relative z-10 flex h-screen items-center justify-center"
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
        style={{
          pointerEvents: "auto",
          ...(!prefersReducedMotion && {
            transform: `translateY(-${Math.min(
              scrollY * ANIMATION_CONFIG.HERO_PARALLAX_SPEED,
              ANIMATION_CONFIG.HERO_MAX_OFFSET
            )}px)`,
            opacity:
              1 -
              Math.min(
                scrollY / (initialHeight * ANIMATION_CONFIG.HERO_FADE_FACTOR),
                1
              ),
            willChange:
              scrollY > 0 && scrollY < initialHeight
                ? "transform, opacity"
                : "auto",
          }),
        }}
      >
        <div className="animate-fade-in-up text-center">
          <h1 className="relative z-10 mb-4 font-extrabold text-5xl tracking-tight md:text-7xl">
            <span className="animate-header-gradient-move bg-linear-to-r bg-size-[200%_200%] from-cyan-300 via-blue-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-black drop-shadow-md">
              Mohamed H. Aly
            </span>
            <span className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 animate-header-gradient-move-pulse select-none bg-linear-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text text-5xl text-transparent blur-2xl md:whitespace-pre md:text-7xl">
              Mohamed H. Aly
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl animate-header-gradient-move bg-linear-to-r from-cyan-200 via-fuchsia-300 to-yellow-200 bg-clip-text font-bold text-transparent text-xl drop-shadow-black drop-shadow-md md:text-3xl">
            Creative Developer, 3D Enthusiast &mdash;&nbsp;
            <span className="bg-none text-white/95">
              Crafting mind-bending digital experiences.
            </span>
          </p>
          <ScrollHelper
            href={navLinks[0].href}
            ariaLabel="Scroll to projects"
            className="mx-auto mt-2 flex w-fit justify-center"
          />
        </div>
      </div>
    </section>
  );
}
