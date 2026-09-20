import { TECHNOLOGIES } from "../constants/technologies";
import { GlassCard } from "./GlassCard";

// Reduced-motion fallback for the 3D tech-icon sphere — a plain, static
// Tailwind grid, no drag/rotate, no shader, no scroll-driven visibility.
export function TechIconsFallback() {
  return (
    <div className="grid w-full max-w-5xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
      {TECHNOLOGIES.map((tech) => (
        <GlassCard
          key={tech.name}
          className="group relative flex flex-col items-center gap-2 overflow-hidden p-3 text-center transition-[border-color,box-shadow] duration-500 hover:border-white/20 hover:shadow-xl"
        >
          {tech.wip && (
            <span className="absolute top-0 right-0 z-10 rounded-tr-2xl rounded-bl-lg bg-yellow-400/90 px-1.5 py-0.5 font-semibold text-[9px] text-black uppercase tracking-wider">
              WIP
            </span>
          )}

          {/* Border glow on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative size-15">
            <div className="absolute inset-0 rounded-lg bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60" />
            <img
              src={tech.icon}
              alt={`Tech icon for ${tech.name}`}
              width={60}
              height={60}
              loading="lazy"
              decoding="async"
              className="relative size-15 object-contain"
            />
          </div>
          <span className="text-white/80 text-xs transition-colors duration-300 group-hover:text-white">
            {tech.name}
          </span>
        </GlassCard>
      ))}
    </div>
  );
}
