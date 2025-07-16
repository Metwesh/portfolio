import { useEffect, useRef, useState } from "react";
import { ScrollHelper } from "../components";
import { navLinks } from "../constants";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const initialHeight = useRef(window.innerHeight);
  useEffect(() => {
    const controller = new AbortController();
    let ticking = false;
    // Cache initial height on mount
    const updateScroll = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, {
      signal: controller.signal,
    });
    updateScroll();
    return () => controller.abort();
  }, []);

  return (
    <section
      id="scroll-section"
      className="relative z-10 flex h-screen items-center justify-center"
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
        style={{
          transform: `translateY(-${scrollY * 0.6}px)`,
          opacity: 1 - Math.min(scrollY / (initialHeight.current * 0.7), 1),
          pointerEvents: "auto",
        }}
      >
        <div className="animate-fade-in-up text-center">
          <h1 className="relative z-10 mb-4 text-5xl font-extrabold tracking-tight md:text-7xl">
            <span className="animate-header-gradient-move bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-500 [background-size:200%_200%] bg-clip-text text-transparent drop-shadow-md drop-shadow-black">
              Mohamed H. Aly
            </span>
            <span className="animate-header-gradient-move-pulse pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text text-5xl text-transparent blur-2xl select-none md:text-7xl md:whitespace-pre">
              Mohamed H. Aly
            </span>
          </h1>
          <p className="animate-header-gradient-move mx-auto mb-10 max-w-2xl bg-gradient-to-r from-cyan-200 via-fuchsia-300 to-yellow-200 bg-clip-text text-xl font-bold text-transparent drop-shadow-md drop-shadow-black md:text-3xl">
            Creative Developer, 3D Enthusiast &mdash;&nbsp;
            <span className="bg-none text-white/95">
              Crafting mind-bending digital experiences.
            </span>
          </p>
          <a
            href={navLinks[0].href}
            aria-label="Scroll to projects"
            className="mx-auto mt-2 flex w-fit justify-center"
          >
            <ScrollHelper />
          </a>
        </div>
      </div>
    </section>
  );
}
