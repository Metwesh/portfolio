import { useState, useEffect } from "react";
import { breakpoints, technologies } from "../constants";
import { WIP } from "../assets";
import { cn } from "../lib/utils";

interface TechListProps {
  isInView: boolean;
}

const getColumnCount = (width: number): number => {
  if (width >= breakpoints.tablet)
    return 5; // lg
  else if (width >= breakpoints.mobile)
    return 4; // md
  else if (width >= breakpoints.smallMobile)
    return 3; // sm
  else return 2; // default
};

export function TechList({ isInView }: TechListProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState(getColumnCount(window.innerWidth));

  useEffect(() => {
    const controller = new AbortController();

    const handleResize = () => setColumns(getColumnCount(window.innerWidth));

    window.addEventListener("resize", handleResize, {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, []);

  const handleCardClick = (index: number): void => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);

      return newSet;
    });
  };
  return (
    <div className="relative mx-auto w-full max-w-4xl md:p-6">
      <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {technologies.map((tech, index) => {
          const isFlipped = flippedCards.has(index);
          const row = Math.floor(index / columns);
          const col = index % columns;
          const staggerDelay = (row + col) * 0.08; // Diagonal stagger

          return (
            <div
              key={`tech-${index}`}
              className="group perspective-1000 relative h-32 cursor-pointer"
              onClick={() => handleCardClick(index)}
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView
                  ? "translate3d(0, 0, 0) scale(1)"
                  : "translate3d(0, 50px, 0) scale(0.8)",
                transition: `opacity 0.6s ease-out ${staggerDelay}s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}s`,
              }}
            >
              {/* Card container with flip transform */}
              <div
                className={cn(
                  "preserve-3d relative h-full w-full transform-gpu rounded-xl transition-transform duration-700 motion-reduce:transition-none",
                  isFlipped && "rotate-y-180",
                )}
              >
                {/* Front side */}
                <div className="absolute inset-0 rounded-xl border border-white/30 bg-gradient-to-br from-white/10 to-white/5 p-4 shadow-lg backdrop-blur-md transition-all duration-500 ease-out backface-hidden hover:scale-105 hover:border-cyan-400 hover:from-cyan-500/30 hover:to-blue-600/30 hover:shadow-xl hover:shadow-cyan-400/20 motion-reduce:transition-none">
                  {tech.wip && (
                    <div
                      className="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-300 group-hover:opacity-40 motion-reduce:transition-none"
                      style={{
                        backgroundImage: `url(${WIP})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  )}
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/0 to-blue-600/0 opacity-0 transition-opacity duration-500 group-hover:from-cyan-400/10 group-hover:to-blue-600/5 group-hover:opacity-100 motion-reduce:transition-none" />

                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-30 motion-reduce:transition-none" />

                  <div className="relative z-10 flex h-full items-center justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      {/* Icon glow */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />

                      <img
                        src={tech.icon}
                        alt={tech.name}
                        className="relative z-10 h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Back side */}
                <div className="absolute inset-0 rotate-y-180 rounded-xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-4 shadow-lg backdrop-blur-md backface-hidden">
                  <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-2 text-center">
                    <div className="text-lg font-bold text-cyan-100">
                      {tech.name}
                    </div>
                    <div className="text-xs text-cyan-200/80">
                      Click to flip back
                    </div>
                    {tech.wip && (
                      <div className="rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-200">
                        Work in Progress
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
