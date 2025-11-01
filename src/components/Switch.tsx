import { cn } from "../lib/utils";

interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  target?: string;
  className?: string;
  labels?: [string, string];
}

export function Switch({
  value,
  onChange,
  className,
  labels,
  target,
}: SwitchProps) {
  return (
    <div
      className={cn(
        "items-center gap-3",
        labels ? "grid grid-cols-3" : "flex",
        className,
      )}
    >
      {labels && (
        <span className="text-sm font-medium text-white/80 drop-shadow-sm">
          {labels[0]}
        </span>
      )}
      <a
        href={`#${target}`}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!value);
          }
        }}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full border backdrop-blur-md transition-all duration-300 ease-in-out",
          value
            ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 shadow-[0_8px_25px_rgba(6,182,212,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
            : "border-white/20 bg-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
        )}
      >
        <span className="sr-only">Toggle switch</span>
        <span
          className={cn(
            "inline-block h-6 w-6 transform rounded-full border border-white/20 bg-white/95 shadow-[0_4px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all duration-300 ease-in-out",
            value ? "translate-x-7" : "translate-x-1",
          )}
        />
      </a>
      {labels && (
        <span className="text-sm font-medium text-white/80 drop-shadow-sm">
          {labels[1]}
        </span>
      )}
    </div>
  );
}
