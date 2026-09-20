import gsap from "gsap";
import { useId, useLayoutEffect, useRef, useState } from "react";
import type { ProjectTag } from "../constants/projects";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { TagPill } from "./TagPill";
import TagsPopoverPortal from "./TagsPopoverPortal";

interface TagsPopoverProps {
  tags: ProjectTag[];
  visibleCount?: number;
  projectColor: string;
}

// Gap (px) between the trigger's top edge and the popover's bottom edge.
const POPOVER_GAP = 10;

// Resolves the site's `--spacing-gutter` custom property to actual pixels,
// via a throwaway probe element rather than parsing the raw string
// ourselves — getComputedStyle returns custom properties verbatim as
// authored ("1rem"), not resolved to px, and a hardcoded rem→px conversion
// would get the wrong answer under browser zoom or OS text-size settings
// that change the root font size. Used as the popover's minimum distance
// from the viewport edge, so it never sits closer to the edge than the
// page's own side gutter does.
function getGutterPx(): number {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.width = "var(--spacing-gutter)";
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
}

export function TagsPopover({
  tags,
  visibleCount = 4,
  projectColor,
}: TagsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const visibleTags = tags.slice(0, visibleCount);
  const hiddenTags = tags.slice(visibleCount);

  // useLayoutEffect, not useEffect: this measures and repositions a live
  // DOM element synchronously before the browser paints. useEffect only
  // defers to *after* paint, which on a busy first interaction (page still
  // settling right after load — other lazy sections initializing, images
  // decoding) can leave a real, visible frame with `el` still at its
  // default `left:0, top:0` from the JSX before this runs — the flash at
  // the top-left corner. Subsequent opens don't show it because by then
  // the gap between commit and effect is imperceptibly small.
  useLayoutEffect(() => {
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
      const position = () => {
        const trigger = triggerWrapRef.current;
        if (!trigger) return;

        // Clamp baked directly into `left` — centered on the trigger, then
        // pulled in so it never sits closer than the site's own
        // `--spacing-gutter` to either viewport edge. No separate margin
        // nudge on `content`: that coupled `content`'s own margin to
        // `el`'s width (an unconstrained shrink-to-fit box around it), so
        // writing the margin here changed `el`'s size on the next reflow —
        // the actual cause of the flicker this used to have when a size
        // observer reacted to that same write.
        const edgeMargin = getGutterPx();
        const triggerRect = trigger.getBoundingClientRect();
        const popRect = el.getBoundingClientRect();
        const idealLeft =
          triggerRect.left + triggerRect.width / 2 - popRect.width / 2;
        const maxLeft = window.innerWidth - edgeMargin - popRect.width;
        const clampedLeft = Math.min(Math.max(idealLeft, edgeMargin), maxLeft);

        el.style.left = `${clampedLeft}px`;
        el.style.top = `${triggerRect.top - POPOVER_GAP - popRect.height}px`;
      };

      position();

      // Re-run once, non-reactively, if the layout wasn't fully settled at
      // the instant this opened — e.g. the tag labels' webfont (loaded
      // async, `font-display: optional`) still swapping in, which changes
      // the measured width before `position()` runs but not after. A
      // plain rAF follow-up covers "one frame not enough time to lay out
      // yet"; `document.fonts.ready` covers the font specifically, however
      // long it actually takes to arrive. Both fire at most once — since
      // `position()` now only ever writes `left`/`top` (never anything
      // that changes `el`'s own size), there's nothing here for either
      // callback to retrigger itself with, unlike the margin approach above.
      const rafId = requestAnimationFrame(position);
      let cancelled = false;
      document.fonts?.ready.then(() => {
        if (!cancelled) position();
      });

      gsap.set(el, { pointerEvents: "auto" });
      gsap.fromTo(
        el,
        { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
        {
          opacity: 1,
          y: -4,
          duration: prefersReducedMotion ? 0 : 0.2,
          ease: "power2.out",
        },
      );

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
      };
    } else {
      gsap.to(el, {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 10,
        duration: prefersReducedMotion ? 0 : 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(el, { pointerEvents: "none" });
        },
      });
    }
  }, [isOpen, prefersReducedMotion]);

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
        <TagPill
          key={tag.name}
          className="border-white/10 bg-black/60 text-white/90 transition-all duration-300 hover:scale-110 hover:border-white/20 hover:bg-white/10"
        >
          {tag.name}
        </TagPill>
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
          <TagPill
            as="button"
            type="button"
            className="cursor-pointer border-white/10 bg-black/60 text-white/70 transition-all duration-300 hover:scale-110 hover:text-white"
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
          </TagPill>

          {/* Popover — portaled to body, positioned via inline left/top set
              in the effect above (see comment there for why). */}
          <TagsPopoverPortal
            popoverRef={popoverRef}
            popoverId={popoverId}
            contentRef={contentRef}
            hiddenTags={hiddenTags}
          />
        </div>
      )}
    </div>
  );
}
