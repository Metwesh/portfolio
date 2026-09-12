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
      className="fixed z-100 max-w-100 rounded-xl opacity-0"
      style={{ pointerEvents: "none", left: 0, top: 0 }}
    >
      {/* Arrow */}
      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-white/10 border-r border-b bg-black/60" />

      {/* Content */}
      <div
        ref={contentRef}
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
    </div>,
    document.body,
  );
}
