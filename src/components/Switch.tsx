interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  labels?: [string, string];
}

export default function Switch({
  value,
  onChange,
  className,
  labels,
}: SwitchProps) {
  return (
    <div
      className={`items-center gap-3 ${className ?? ""} ${
        labels ? "grid grid-cols-3" : "flex"
      }`}
    >
      {labels && (
        <span className="text-sm font-medium text-white/80 drop-shadow-sm">
          {labels[0]}
        </span>
      )}
      <a
        href="#tech-stacks-container"
        role="switch"
        aria-checked={value}
        onClick={(e) => {
          e.preventDefault();
          onChange(!value);
        }}
        className={`relative inline-flex h-8 w-14 items-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none ${
          value
            ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 shadow-cyan-400/20"
            : "border-white/20 bg-white/10 shadow-black/20"
        }`}
        style={{
          boxShadow: value
            ? "0 8px 25px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <span className="sr-only">Toggle switch</span>
        <span
          className={`inline-block h-6 w-6 transform rounded-full border border-white/20 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${
            value ? "translate-x-7" : "translate-x-1"
          }`}
          style={{
            boxShadow:
              "0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
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
