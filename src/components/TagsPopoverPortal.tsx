import type React from "react";
import { createPortal } from "react-dom";

export default function TagsPopoverPortal({
  popoverRef,
  popoverId,
  contentRef,
  hiddenTags,
  tagClass,
}: {
  popoverRef: React.RefObject<HTMLDivElement | null>;
  popoverId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  hiddenTags: { name: string }[];
  tagClass: string;
}) {
  return createPortal(
    <div
      ref={popoverRef}
      id={popoverId}
      role="tooltip"
      className="pointer-events-none fixed top-0 left-0 z-100 max-w-100 rounded-xl opacity-0"
    >
      {/* Arrow */}
      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-white/10 border-r border-b bg-black/60" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative min-w-60 rounded-xl border border-white/10 bg-black/96 p-3 shadow-[0_8px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)]"
      >
        <div className="relative flex flex-wrap gap-2">
          {hiddenTags.map((tag) => (
            <span key={tag.name} className={tagClass}>
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
