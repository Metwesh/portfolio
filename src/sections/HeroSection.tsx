import gsap from "gsap";
import { useEffect, useRef } from "react";
import { ScrollHelper } from "../components";
import { INTERSECTION_OBSERVER_CONFIG } from "../constants/animations";
import { NAV_LINKS } from "../constants/misc";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  // Gates the eyebrow typewriter loop below — paused while Hero is scrolled
  // out of view instead of ticking forever in the background.
  const { targetRef: sectionRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });
  const eyebrowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const eyebrowLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTypewriterRef = useRef<(() => void) | null>(null);

  // Entrance: wait for loader to finish sliding out, then reveal
  useEffect(() => {
    if (prefersReducedMotion) return;

    const lines = [line1Ref.current, line2Ref.current, line3Ref.current].filter(
      Boolean,
    );

    const PHRASES = [
      "Creative Developer & 3D Enthusiast",
      "WebGL & Three.js Craftsman",
      "Frontend Engineer",
      "Motion & Interaction Designer",
      "Fullstack Developer",
    ];
    const eyebrow = eyebrowRef.current;

    // Hide immediately so nothing is visible while loader is still up
    gsap.set(lines, { y: "110%", opacity: 0 });
    gsap.set([subtitleRef.current, scrollCueRef.current], {
      opacity: 0,
      y: 24,
    });
    if (eyebrow) eyebrow.textContent = "";

    const typePhrase = (phraseIndex: number) => {
      if (!eyebrow) return;
      const phrase = PHRASES[phraseIndex % PHRASES.length];
      let i = 0;
      eyebrowIntervalRef.current = setInterval(() => {
        eyebrow.textContent = phrase.slice(0, ++i);
        if (i >= phrase.length) {
          if (eyebrowIntervalRef.current)
            clearInterval(eyebrowIntervalRef.current);
          // Pause then backspace
          eyebrowLoopRef.current = setTimeout(
            () => erasePhrase(phrase, phraseIndex),
            2200,
          );
        }
      }, 38);
    };

    const erasePhrase = (phrase: string, phraseIndex: number) => {
      if (!eyebrow) return;
      let i = phrase.length;
      eyebrowIntervalRef.current = setInterval(() => {
        eyebrow.textContent = phrase.slice(0, --i);
        if (i <= 0) {
          if (eyebrowIntervalRef.current)
            clearInterval(eyebrowIntervalRef.current);
          // Brief pause then type next
          eyebrowLoopRef.current = setTimeout(
            () => typePhrase(phraseIndex + 1),
            400,
          );
        }
      }, 22);
    };

    const start = () => {
      restartTypewriterRef.current = () => typePhrase(0);
      typePhrase(0);

      gsap.fromTo(
        lines,
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.1,
        },
      );

      gsap.fromTo(
        [subtitleRef.current, scrollCueRef.current],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.15,
          delay: 0.7,
        },
      );
    };

    document.addEventListener("app:ready", start, { once: true });
    return () => {
      document.removeEventListener("app:ready", start);
      if (eyebrowIntervalRef.current) clearInterval(eyebrowIntervalRef.current);
      if (eyebrowLoopRef.current) clearTimeout(eyebrowLoopRef.current);
    };
  }, [prefersReducedMotion]);

  // Pause the eyebrow typewriter while Hero is scrolled out of view; resume
  // from the top of the phrase cycle when it re-enters. No-ops until the
  // initial app:ready boot has started the loop at least once. The one-shot
  // headline/subtitle entrance reveal above is untouched — only the eyebrow
  // interval/timeout chain is gated here.
  useEffect(() => {
    if (!restartTypewriterRef.current) return;
    if (isIntersecting) {
      restartTypewriterRef.current();
    } else {
      if (eyebrowIntervalRef.current) clearInterval(eyebrowIntervalRef.current);
      if (eyebrowLoopRef.current) clearTimeout(eyebrowLoopRef.current);
    }
  }, [isIntersecting]);

  // Scroll-driven fade-out via GSAP ScrollTrigger
  // biome-ignore lint/correctness/useExhaustiveDependencies: sectionRef is a stable ref object, only prefersReducedMotion should retrigger this effect
  useEffect(() => {
    if (prefersReducedMotion) return;

    let tween: ReturnType<typeof gsap.to> | null = null;

    import("gsap/ScrollTrigger").then(({ ScrollTrigger: ST }) => {
      gsap.registerPlugin(ST);

      tween = gsap.to(sectionRef.current, {
        opacity: 0,
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="scroll-section"
      aria-labelledby="hero-heading"
      className="relative z-10 flex min-h-svh flex-col justify-center px-gutter pt-32 pb-24 sm:px-12 md:px-20 lg:px-32"
    >
      <div className="max-w-6xl">
        {/* Eyebrow — typewriter reveal */}
        <p
          ref={eyebrowRef}
          className="mb-6 min-h-5 font-mono text-cyan-400 text-sm uppercase tracking-widest after:ml-0.5 after:inline-block after:h-3.5 after:w-0.5 after:animate-caret-blink after:bg-cyan-400 after:align-middle motion-reduce:after:hidden"
        />

        {/* Giant headline — each line in overflow:hidden clip container */}
        <h1
          id="hero-heading"
          className="mb-10 font-extrabold text-[clamp(3rem,10vw,9rem)] leading-none tracking-tight"
        >
          <span className="block overflow-hidden">
            <span
              ref={line1Ref}
              className="block animate-header-gradient-move bg-linear-to-r bg-size-[200%_200%] from-cyan-300 via-blue-400 to-fuchsia-500 bg-clip-text text-transparent opacity-0 motion-reduce:animate-none motion-reduce:opacity-100"
            >
              Mohamed
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              ref={line2Ref}
              className="block text-white opacity-0 motion-reduce:opacity-100"
            >
              H. Aly
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              ref={line3Ref}
              className="block animate-header-gradient-move bg-linear-to-r bg-size-[200%_200%] from-fuchsia-400 via-blue-400 to-cyan-300 bg-clip-text pb-2 text-transparent opacity-0 motion-reduce:animate-none motion-reduce:opacity-100"
            >
              builds things.
            </span>
          </span>
        </h1>

        {/* Tagline */}
        <p
          ref={subtitleRef}
          className="mb-12 max-w-lg text-pretty text-white/60 text-xl leading-relaxed opacity-0 motion-reduce:opacity-100"
        >
          Crafting mind-bending digital experiences at the intersection of code,
          design, and the third dimension.
        </p>

        {/* Scroll cue */}
        <div ref={scrollCueRef} className="opacity-0 motion-reduce:opacity-100">
          <ScrollHelper
            href={NAV_LINKS[0].href}
            ariaLabel="Scroll to projects"
            className="flex w-fit"
          />
        </div>
      </div>
    </section>
  );
}
