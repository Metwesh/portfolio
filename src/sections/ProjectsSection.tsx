import React, { useEffect, useState } from "react";
import { projects } from "../constants";

export function ProjectsSection() {
  const [cardTilt, setCardTilt] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [cardTiltTarget, setCardTiltTarget] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  const handleCardMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    title: string,
  ) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setCardTiltTarget((prev) => ({ ...prev, [title]: { x, y } }));
  };
  const handleCardMouseLeave = (title: string) => {
    setCardTiltTarget((prev) => ({ ...prev, [title]: { x: 0, y: 0 } }));
  };

  useEffect(() => {
    let running = true;
    function animate() {
      setCardTilt((prev) => {
        const next: typeof prev = { ...prev };
        for (const key in cardTiltTarget) {
          const t = cardTiltTarget[key] || { x: 0, y: 0 };
          const c = prev[key] || { x: 0, y: 0 };
          next[key] = {
            x: c.x + (t.x - c.x) * 0.15,
            y: c.y + (t.y - c.y) * 0.15,
          };
        }
        return next;
      });
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, [cardTiltTarget]);

  return (
    <section
      id="projects"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center py-32"
    >
      <h2 className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg">
        Projects
      </h2>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-2">
        {projects.map((proj) => {
          const tilt = cardTilt[proj.name] || { x: 0, y: 0 };
          return (
            <div
              key={proj.name}
              className="group relative transform-gpu overflow-hidden rounded-3xl bg-white/10 p-10 shadow-2xl backdrop-blur-lg transition-transform duration-500 hover:shadow-2xl"
              style={{
                boxShadow: `0 8px 32px 0 ${proj.color}33`,
                perspective: 1200,
                zIndex: 1,
                transform: `rotateY(${tilt.x * 12}deg) rotateX(${-tilt.y * 12}deg) scale(${1 + Math.abs(tilt.x) * 0.05 + Math.abs(tilt.y) * 0.05})`,
                transition: "transform 0.5s cubic-bezier(.23,1.12,.32,1)",
              }}
              onMouseMove={(e) => handleCardMouseMove(e, proj.name)}
              onMouseLeave={() => handleCardMouseLeave(proj.name)}
            >
              {/* Decorative blurred image background */}
              {proj.image && (
                <img
                  src={proj.image}
                  alt="project background"
                  className="pointer-events-none absolute inset-0 h-full w-full -rotate-45 object-contain opacity-20 blur-xs transition-all duration-700 select-none group-hover:rotate-0 group-hover:opacity-80 group-hover:blur-none"
                  style={{ zIndex: 0 }}
                />
              )}
              <div
                className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition-all duration-700 group-hover:blur-lg"
                style={{ background: proj.color, zIndex: 1 }}
              />
              <div className="relative z-10 flex h-full flex-col">
                <h3 className="mb-3 text-2xl font-bold text-white drop-shadow-lg transition-opacity group-hover:opacity-0">
                  {proj.name}
                </h3>
                <p className="mb-4 font-medium text-white/80 transition-opacity group-hover:opacity-0">
                  {proj.description}
                </p>
                {/* <div className="mt-auto flex items-center justify-between">
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-semibold hover:underline"
                      style={{ color: proj.color }}
                    >
                      View Project
                      <svg
                        width="24"
                        height="24"
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
                      className="ml-auto flex items-center gap-2 font-semibold hover:underline"
                      style={{ color: proj.color }}
                    >
                      View Source
                      <svg
                        width="24"
                        height="24"
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
                </div> */}
              </div>
              {/* 3D shine effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-60"
                style={{
                  background: `linear-gradient(120deg, ${proj.color}33 0%, transparent 100%)`,
                  mixBlendMode: "screen",
                  zIndex: 2,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
