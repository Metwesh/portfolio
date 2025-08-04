import { useState } from "react";
import { technologies } from "../constants";
import { WIP } from "../assets";

export default function TechList() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="relative mx-auto w-full max-w-4xl p-6">
      <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {technologies.map((tech, index) => (
          <div
            key={`tech-${index}`}
            className={`group relative cursor-pointer rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-500 ease-out ${
              selectedIndex === index
                ? "z-50 scale-105 border-cyan-400 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 shadow-cyan-400/20"
                : "border-white/30 bg-gradient-to-br from-white/10 to-white/5 hover:border-cyan-400/50 hover:from-cyan-500/10 hover:to-blue-600/10 hover:shadow-cyan-400/10"
            } transform-gpu hover:scale-102 hover:shadow-xl`}
            style={{
              boxShadow:
                selectedIndex === index
                  ? "0 20px 40px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2)"
                  : "0 8px 25px rgba(0, 0, 0, 0.3)",
              zIndex: selectedIndex === index ? 50 : index,
            }}
            onClick={() =>
              setSelectedIndex(selectedIndex === index ? null : index)
            }
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/0 to-blue-600/0 opacity-0 transition-opacity duration-500 group-hover:from-cyan-400/10 group-hover:to-blue-600/5 group-hover:opacity-100" />

            {/* Glow effect */}
            <div
              className={`absolute inset-0 rounded-xl transition-opacity duration-500 ${
                selectedIndex === index
                  ? "bg-gradient-to-br from-cyan-400/20 to-transparent opacity-100"
                  : "bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-30"
              }`}
            />

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="relative flex h-12 w-12 items-center justify-center">
                {/* Icon glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />

                <img
                  src={tech.icon}
                  alt={tech.name}
                  className="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter:
                      selectedIndex === index
                        ? "drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))"
                        : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />

                {tech.wip && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-60 transition-opacity duration-300 group-hover:opacity-40"
                    style={{
                      backgroundImage: `url(${WIP})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}
              </div>
              <span className="text-center text-sm leading-tight font-medium text-white drop-shadow-sm transition-all duration-300 group-hover:text-cyan-100">
                {tech.name}
              </span>
            </div>

            <div
              className={`absolute top-full right-0 left-0 mt-2 rounded-xl border border-cyan-400/50 bg-black/95 p-4 shadow-2xl backdrop-blur-lg transition-all duration-300 ${
                selectedIndex === index
                  ? "opacity-100 z-[100]"
                  : "pointer-events-none opacity-0 z-[-1]"
              }`}
              style={{
                transformOrigin: "top center",
                transform: selectedIndex === index 
                  ? "translateY(0) scale(1)" 
                  : "translateY(-100%) scale(0.95)",
              }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/10 to-blue-600/5" />
              <div className="relative text-center">
                <h3 className="mb-2 text-lg font-bold text-cyan-400 drop-shadow-sm">
                  {tech.name}
                </h3>
                {tech.wip && (
                  <div className="mb-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-400">
                    🚧 Work in Progress
                  </div>
                )}
                <div className="text-xs text-white/70 italic">
                  Click to close
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
