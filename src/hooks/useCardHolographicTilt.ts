import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useCardHolographicTilt<T extends HTMLElement>() {
  const cardRef = useRef<T>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const card = cardRef.current;
    if (!card || reducedMotion) return;

    gsap.fromTo(
      card,
      { opacity: 0, scale: 0.88, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%" },
      },
    );

    // Cap the tilt update to once per frame instead of once per raw
    // mousemove event — getBoundingClientRect forces a layout read.
    let ticking = false;
    let rafId = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    const applyTilt = () => {
      ticking = false;
      const rect = card.getBoundingClientRect();
      const x = (lastClientX - rect.left) / rect.width - 0.5;
      const y = (lastClientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.03)`;
      if (shimmerRef.current) {
        shimmerRef.current.style.backgroundPosition = `${50 + x * 60}% ${50 + y * 60}%`;
        shimmerRef.current.style.opacity = "1";
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(applyTilt);
      }
    };
    const handleMouseLeave = () => {
      card.style.transform =
        "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
      card.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
      if (shimmerRef.current) shimmerRef.current.style.opacity = "0";
    };
    const handleMouseEnter = () => {
      card.style.transition = "transform 0.1s linear";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mouseenter", handleMouseEnter);
      for (const t of ScrollTrigger.getAll().filter(
        (t) => t.vars.trigger === card,
      ))
        t.kill();
    };
  }, [reducedMotion]);

  return { cardRef, shimmerRef };
}
