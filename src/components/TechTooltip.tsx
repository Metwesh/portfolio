import type { PointerEvent as ReactPointerEvent } from "react";
import { WIP } from "../assets";
import { cn } from "../lib/utils";

interface TechTooltipProps {
  technologyName: string;
  isWip: boolean;
  onClose: () => void;
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => void;
}

export function TechTooltip({
  technologyName,
  isWip,
  onClose,
  onPointerDown,
  onPointerUp,
}: TechTooltipProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className={cn(
          "relative block animate-fade-in-up cursor-pointer overflow-hidden whitespace-pre",
          "rounded-3xl border border-white/20 px-10 py-6",
          "text-center font-bold text-4xl text-white tracking-wide",
          "bg-[linear-gradient(135deg,rgba(20,24,32,0.95)_0%,rgba(30,35,45,0.95)_100%)]",
          "shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)]",
          "backdrop-blur-md transition-all duration-300 ease-in-out",
          "hover:-translate-y-0.5 hover:scale-[1.02]",
          "hover:shadow-[0_12px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.2)]",
        )}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={onClose}
      >
        {technologyName}
        <div className="mt-2 flex items-center justify-center gap-2 font-normal text-base opacity-80">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
          Click to close
        </div>
        {isWip && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${WIP})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute top-0 right-0 rounded-es-lg bg-yellow-400/90 px-2 py-1 font-semibold text-black text-xs uppercase tracking-wider">
              Work in Progress
            </div>
          </>
        )}
      </button>
    </div>
  );
}
