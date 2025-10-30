import { type PointerEvent as ReactPointerEvent } from "react";
import { WIP } from "../assets";

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
    <div className="animate-fade-in-up flex flex-col items-center gap-4">
      <button
        className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 px-10 py-6 text-center text-4xl font-bold tracking-wide whitespace-pre text-white backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02]"
        style={{
          background:
            "linear-gradient(135deg, rgba(20,24,32,0.95) 0%, rgba(30,35,45,0.95) 100%)",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          backgroundImage: isWip ? `url(${WIP})` : undefined,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={onClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 12px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)";
        }}
      >
        {technologyName}
        <div className="mt-2 flex items-center justify-center gap-2 text-base font-normal opacity-80">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
          Click to close
        </div>
        {isWip && (
          <div className="absolute top-2 right-2 rounded-lg bg-yellow-400/90 px-2 py-1 text-xs font-semibold tracking-wider text-black uppercase">
            Work in Progress
          </div>
        )}
      </button>
    </div>
  );
}
