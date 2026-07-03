import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import type { ProjectTag } from "../constants/projects";
import { cn } from "../lib/utils";

interface TagsPopoverProps {
  tags: ProjectTag[];
  visibleCount?: number;
  projectColor: string;
}

export function TagsPopover({
  tags,
  visibleCount = 4,
  projectColor,
}: TagsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const tagClass = cn(
    "rounded-full border border-white/10 bg-black/40 px-3 py-1 font-semibold text-white/90 text-xs backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/20 hover:bg-white/10",
  );
  const visibleTags = tags.slice(0, visibleCount);
  const hiddenTags = tags.slice(visibleCount);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    gsap.killTweensOf(el);

    if (isOpen) {
      gsap.set(el, { pointerEvents: "auto" });
      gsap.fromTo(
        el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: -4, duration: 0.2, ease: "power2.out" },
      );
    } else {
      gsap.to(el, {
        opacity: 0,
        y: 10,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(el, { pointerEvents: "none" });
        },
      });
    }
  }, [isOpen]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Visible tags */}
      {visibleTags.map((tag) => (
        <span key={tag.name} className={tagClass}>
          {tag.name}
        </span>
      ))}

      {/* +N badge with popover */}
      {hiddenTags.length > 0 && (
        // biome-ignore lint/a11y/noStaticElementInteractions: Popover is triggered on hover
        <div
          className="relative z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Badge trigger */}
          <button
            type="button"
            className="cursor-pointer rounded-full border border-white/10 bg-black/40 px-3 py-1 font-semibold text-white/70 text-xs backdrop-blur-md transition-all duration-300 hover:scale-110 hover:text-white"
            style={{
              borderColor: isOpen
                ? `${projectColor}60`
                : "rgba(255,255,255,0.1)",
              backgroundColor: isOpen ? `${projectColor}20` : "rgba(0,0,0,0.4)",
            }}
            onClick={() => setIsOpen((prev) => !prev)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            aria-expanded={isOpen}
            aria-label={`Show ${hiddenTags.length} more technologies`}
          >
            {`+${hiddenTags.length} more`}
          </button>

          {/* Popover */}
          <div
            ref={popoverRef}
            role="tooltip"
            className="absolute bottom-full left-1/2 z-100 -translate-x-1/2 rounded-xl opacity-0"
            style={{ pointerEvents: "none" }}
          >
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-white/10 border-r border-b bg-black/60" />

            {/* Content */}
            <div
              className="relative min-w-60 rounded-xl border border-white/10 bg-black/96 p-3"
              style={{
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <div className="relative flex flex-wrap gap-2">
                {hiddenTags.map((tag) => (
                  <span key={tag.name} className={tagClass}>
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
