import { cn } from "../lib/utils";

export function ScrollHelper({
  href,
  ariaLabel,
  className,
}: {
  href: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={cn(
        className,
        "group flex h-[64px] w-[35px] items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white/10 shadow-lg backdrop-blur-md transition-all hover:border-fuchsia-400"
      )}
    >
      <div className="relative h-full w-full animate-scroll-chevrons">
        {[...Array(3)].map((_, index) => (
          <svg
            key={`scroll-helper-${
              /** biome-ignore lint/suspicious/noArrayIndexKey: ignore array index key */
              index
            }`}
            className={cn(
              "-translate-x-1/2 absolute left-1/2 h-4 w-4 text-white shadow-cyan-400/60 drop-shadow-md",
              index === 0 ? "top-0" : index === 1 ? "top-1/2" : "top-full"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        ))}
      </div>
    </a>
  );
}
