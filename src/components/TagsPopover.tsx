import { useState } from "react";
import type { ProjectTag } from "../constants/projects";

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
  const visibleTags = tags.slice(0, visibleCount);
  const hiddenTags = tags.slice(visibleCount);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Visible tags */}
      {visibleTags.map((tag) => (
        <span
          key={tag.name}
          className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-semibold text-white/90 text-xs backdrop-blur-md transition-all duration-300 hover:scale-110"
        >
          {tag.name}
        </span>
      ))}

      {/* +N badge with popover */}
      {hiddenTags.length > 0 && (
        <div className="relative z-50">
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
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
              }
            }}
            aria-expanded={isOpen}
            aria-label={`Show ${hiddenTags.length} more technologies`}
          >
            {`+${hiddenTags.length} more`}
          </button>

          {/* Popover */}
          <div
            className="absolute bottom-full z-100 mb-2 transition-all duration-300"
            style={{
              left: "50%",
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transform: `translateX(-50%) translateY(${
                isOpen ? "0" : "10px"
              })`,
            }}
          >
            {/* Arrow */}
            <div
              className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${projectColor}20, rgba(0,0,0,0.6))`,
                borderTopColor: `${projectColor}30`,
                borderLeftColor: `${projectColor}30`,
              }}
            />

            {/* Content */}
            <div
              className="relative min-w-60 rounded-xl border p-3 shadow-2xl backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${projectColor}15, rgba(0,0,0,0.8))`,
                borderColor: `${projectColor}30`,
                boxShadow: `0 8px 32px ${projectColor}40, 0 0 0 1px ${projectColor}20`,
              }}
            >
              <div className="flex flex-wrap gap-2">
                {hiddenTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="rounded-full border px-3 py-1.5 font-semibold text-white/90 text-xs backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    style={{
                      background: `${projectColor}20`,
                      borderColor: `${projectColor}40`,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Glow effect */}
              <div
                className="absolute -inset-2 -z-10 rounded-xl opacity-40 blur-xl"
                style={{
                  background: `radial-gradient(circle at center, ${projectColor}60, transparent 70%)`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
