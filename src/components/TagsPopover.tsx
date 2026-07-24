import gsap from "gsap";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectTag } from "../constants/projects";
import { cn } from "../lib/utils";

interface TagsPopoverProps {
  tags: ProjectTag[];
  visibleCount?: number;
  projectColor: string;
}

// Gap (px) between the trigger's top edge and the popover's bottom edge.
const POPOVER_GAP = 10;

export function TagsPopover({
  tags,
  visibleCount = 4,
  projectColor,
}: TagsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const tagClass = cn(
    "rounded-full border border-white/10 bg-black/60 px-3 py-1 font-semibold text-white/90 text-xs transition-all duration-300 hover:scale-110 hover:border-white/20 hover:bg-white/10",
  );
  const visibleTags = tags.slice(0, visibleCount);
  const hiddenTags = tags.slice(visibleCount);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    gsap.killTweensOf(el);

    if (isOpen) {
      // Positioned via a portal to document.body rather than as a CSS
      // `absolute` child of the trigger: this popover's row (the stacked
      // tags/actions overlay) clips overflow-x for its own sliding-
      // neighbor animation, and per the CSS overflow spec, setting
      // `overflow-x: hidden` forces `overflow-y` to compute as `auto`
      // instead of `visible` no matter what it's explicitly set to — so a
      // CSS-positioned popover gets silently clipped by that row
      // regardless. Escaping to body via a portal, positioned in JS from
      // the trigger's live viewport rect, sidesteps the clipping entirely.
      //
      // Position is resolved to a final left/top here rather than via
      // Tailwind's translate-x/-y utility classes + GSAP's own `y` tween:
      // GSAP's CSS plugin manages the `transform` property, but Tailwind's
      // translate utilities compute through the separate `translate`
      // property in this version — two independent transform sources that
      // don't reliably combine, which was landing the popover on top of
      // the trigger instead of above it.
      const trigger = triggerWrapRef.current;
      if (trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const popRect = el.getBoundingClientRect();
        el.style.left = `${triggerRect.left + triggerRect.width / 2 - popRect.width / 2}px`;
        el.style.top = `${triggerRect.top - POPOVER_GAP - popRect.height}px`;
      }

      // Clamp to viewport: the popover is centered on its trigger by
      // default, which can push it off-screen near the left/right edges
      // on narrow viewports. Shift the content box back into view via
      // margin (not transform, which GSAP owns below).
      const content = contentRef.current;
      if (content) {
        content.style.marginLeft = "0px";
        const crect = content.getBoundingClientRect();
        const edgeMargin = 8;
        let shift = 0;
        if (crect.left < edgeMargin) {
          shift = edgeMargin - crect.left;
        } else if (crect.right > window.innerWidth - edgeMargin) {
          shift = window.innerWidth - edgeMargin - crect.right;
        }
        if (shift !== 0) content.style.marginLeft = `${shift}px`;
      }

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
          ref={triggerWrapRef}
          className="relative z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Badge trigger */}
          <button
            type="button"
            className="cursor-pointer rounded-full border border-white/10 bg-black/60 px-3 py-1 font-semibold text-white/70 text-xs transition-all duration-300 hover:scale-110 hover:text-white"
            style={{
              borderColor: isOpen
                ? `${projectColor}60`
                : "rgba(255,255,255,0.1)",
              backgroundColor: isOpen ? `${projectColor}20` : "rgba(0,0,0,0.6)",
            }}
            onClick={() => setIsOpen((prev) => !prev)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            aria-expanded={isOpen}
            aria-label={`Show ${hiddenTags.length} more technologies`}
            aria-describedby={popoverId}
          >
            {`+${hiddenTags.length} more`}
          </button>

          {/* Popover — portaled to body, positioned via inline left/top set
              in the effect above (see comment there for why). */}
          {createPortal(
            <div
              ref={popoverRef}
              id={popoverId}
              role="tooltip"
              className="fixed z-100 rounded-xl opacity-0"
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
          )}
        </div>
      )}
    </div>
  );
}
