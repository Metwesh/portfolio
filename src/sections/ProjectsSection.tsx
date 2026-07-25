import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { Odometer, type OdometerHandle } from "../components/Odometer";
import { SectionHeading } from "../components/SectionHeading";
import { TagsPopover } from "../components/TagsPopover";
import { PROJECTS } from "../constants/projects";
import { useIsMobile } from "../hooks/useIsMobile";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { lenisInstance } from "../lib/lenisInstance";
import { cn } from "../lib/utils";
import { scrollStore } from "../stores/scrollStore";
import { damp } from "../utils/damp";

// Row heights for the stacked overlay — content is absolutely positioned
// inside each, so these govern spacing between title/description/actions
// regardless of which project is currently showing (no layout reflow as
// content changes length).
const TITLE_ROW_PX = 48;
const DESC_ROW_EM = 4.5;
const ACTIONS_ROW_PX = 28;
const ACTIONS_ROW_PX_MOBILE = 64;

// Per-row slide distance (px) for the continuous reveal below. Large enough
// that a neighbor is mostly clear of the active item's text footprint by
// the time it's still meaningfully opaque — unlike the 3D cards (where a
// soft image/opacity blend between neighbors reads fine), two blocks of
// *text* overlapping at the same position is illegible even at moderate
// opacity, so the position needs to have moved well clear, not just faded.
// Title shares the same horizontal treatment (slide + opacity fade) as the
// description/actions rows below it, and the same direction as the actions
// row specifically (opposite sign from description) — one consistent motion
// language across all three rows instead of title doing its own thing.
const TITLE_SLIDE_PX = 200;
const DESC_SLIDE_PX = 240;
const ACTIONS_SLIDE_PX = 200;

// Opacity is a plateau-then-fade curve of distance-from-active (`ad`), not
// a straight linear ramp: it stays fully opaque out to OPACITY_PLATEAU (a
// genuine "hold" while scroll sits near a card, so stopping between two
// cards doesn't leave both halfway-visible and unreadable), then eases out
// to 0 by OPACITY_FADE_END. Position keeps moving perfectly linearly with
// scroll throughout — only visibility gets this shape, so it still reads as
// continuous, not a snap.
const OPACITY_PLATEAU = 0.18;
const OPACITY_FADE_END = 0.75;
// How far (in fractional card indices) a neighbor stays part-visible before
// fully fading — keeps a couple items rendered/animating around the active
// one instead of a hard cut, with a small margin past OPACITY_FADE_END.
const REVEAL_RANGE = 1.0;

// Smoothstep — 0 below edge0, 1 above edge1, eased S-curve between. Used to
// shape the opacity plateau-then-fade above: gentle near both ends (the
// "stays, then transitions" feel), not a linear ramp.
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Scroll distance per card, as a multiple of viewport width. Lower = faster
// card sweep per unit of scroll input — at typical slow-scroll speeds, the
// resulting per-frame movement is large enough to stay clear of the
// sub-pixel-per-frame range where card motion reads as steppy (a big,
// sharp-edged object sliding by is the worst case for that perceptual
// effect; masking it needs more distance covered per frame, not tighter
// timing — frame pacing here already measured clean).
const SCROLL_WIDTH_PER_CARD = 0.5;

// Extra scroll, in card-widths, reserved at each end of the pin as a "stick"
// — progress holds at index 0 / index N-1 for this much scroll before/after
// the card sweep, instead of starting or ending to move the instant the pin
// engages. Applied symmetrically (front and back) so the first and last
// projects both get the same hold.
const EDGE_STICK_CARDS = 0.5;

let _touchStartX = 0;
let _touchStartY = 0;
let _touchLastX = 0;
let _touchLock: "x" | "y" | null = null;
let _wheelLock: "x" | "y" | null = null;
let _wheelLockTimer: ReturnType<typeof setTimeout> | null = null;

export function ProjectsSection() {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  // Read from the ticker (updateOverlay), which lives inside the mount-only
  // effect below — a ref keeps it reading the latest value without forcing
  // that whole effect (ScrollTrigger + listener setup) to re-run every time
  // the OS-level reduced-motion preference changes.
  const reducedMotionRef = useRef(reducedMotion);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);
  const sectionRef = useRef<HTMLElement>(null);
  const odometerRef = useRef<OdometerHandle>(null);
  // Wrapper rows — one per row type, fade as a group on pin enter/leave.
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const descWrapRef = useRef<HTMLDivElement>(null);
  const actionsWrapRef = useRef<HTMLDivElement>(null);
  // All N projects' content is pre-rendered and stacked inside each wrapper
  // above — one ref per project per row — and continuously
  // positioned/faded by index distance from scroll progress in
  // updateOverlay below, instead of swapping DOM content per card crossing.
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const actionsRefs = useRef<(HTMLDivElement | null)[]>([]);
  // The colored underline is intentionally NOT part of the sliding stack
  // above — it sits in one fixed place (no translate/slide) and its own
  // color/width simply cross to the active project via a CSS transition.
  const underlineRef = useRef<HTMLSpanElement>(null);
  const lastUnderlineIdxRef = useRef(-1);
  const prevIndexRef = useRef(-1);
  // Independently lagged continuous index per row — different lambda per
  // row (title fastest, actions slowest) so the three rows arrive slightly
  // out of phase with each other instead of all snapping together.
  const titleFRef = useRef(0);
  const descFRef = useRef(0);
  const actionsFRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Set the static underline's initial color/width (index 0) before
    // anything scrolls — without this it sits blank until the first scroll
    // tick runs.
    const initialGroup = titleRefs.current[0]?.firstElementChild;
    if (underlineRef.current) {
      underlineRef.current.style.background = `linear-gradient(90deg, ${PROJECTS[0].color}, transparent)`;
      if (initialGroup) {
        underlineRef.current.style.width = `${initialGroup.getBoundingClientRect().width}px`;
      }
      lastUnderlineIdxRef.current = 0;
    }

    // Total scroll, in card-widths: N-1 to actually sweep through the cards,
    // plus one stick's worth reserved on each end (front + back).
    const totalCardUnits = PROJECTS.length - 1 + 2 * EDGE_STICK_CARDS;
    // Fraction of raw scrollTrigger progress spent stuck at each edge —
    // used below to hold overlay/index progress at 0 or 1 while the pin
    // still has scroll room left before/after the sweep.
    const edgeStickFraction = EDGE_STICK_CARDS / totalCardUnits;

    const scrollDist =
      totalCardUnits * window.innerWidth * SCROLL_WIDTH_PER_CARD;

    const setHeight = () => {
      section.style.height = `${totalCardUnits * window.innerWidth * SCROLL_WIDTH_PER_CARD + window.innerHeight}px`;
    };
    setHeight();

    const tween = gsap.to(
      {},
      {
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${scrollDist}`,
          // Lenis already smooths the underlying scroll position — a numeric
          // scrub value adds a second, independent lag on top of that,
          // chasing an already-eased curve. That's what was still causing
          // choppiness near project-index boundaries after the ticker sync
          // fix. `scrub: true` tracks progress immediately (matches
          // HeroSection's ScrollTrigger, which never had this issue).
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: setHeight,
          onEnter: () => {
            attachActiveListeners();
            scrollStore.projectSectionActive = true;
            gsap.to(
              [
                titleWrapRef.current,
                descWrapRef.current,
                actionsWrapRef.current,
              ],
              {
                opacity: 1,
                y: 0,
                duration: 0.2,
                ease: "power2.out",
                stagger: 0.025,
              },
            );
          },
          onLeave: () => {
            detachActiveListeners();
            scrollStore.projectSectionActive = false;
            const els = [
              titleWrapRef.current,
              descWrapRef.current,
              actionsWrapRef.current,
            ];
            gsap.killTweensOf(els);
            gsap.to(els, {
              opacity: 0,
              y: -8,
              duration: 0.15,
              ease: "power2.in",
              stagger: 0.02,
            });
          },
          onEnterBack: () => {
            attachActiveListeners();
            scrollStore.projectSectionActive = true;
            gsap.to(
              [
                titleWrapRef.current,
                descWrapRef.current,
                actionsWrapRef.current,
              ],
              {
                opacity: 1,
                y: 0,
                duration: 0.2,
                ease: "power2.out",
                stagger: 0.025,
              },
            );
          },
          onLeaveBack: () => {
            detachActiveListeners();
            scrollStore.projectSectionActive = false;
            const els = [
              titleWrapRef.current,
              descWrapRef.current,
              actionsWrapRef.current,
            ];
            gsap.killTweensOf(els);
            gsap.to(els, {
              opacity: 0,
              y: -8,
              duration: 0.15,
              ease: "power2.in",
              stagger: 0.02,
            });
          },
          onUpdate: (self) => {
            const progress = Math.min(
              1,
              Math.max(
                0,
                (self.progress - edgeStickFraction) /
                  (1 - 2 * edgeStickFraction),
              ),
            );
            scrollStore.projectProgress = progress;

            const idx = Math.round(progress * (PROJECTS.length - 1));
            if (idx !== prevIndexRef.current) {
              prevIndexRef.current = idx;
              odometerRef.current?.setValue(idx + 1);
            }
          },
        },
      },
    );

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    // Earlier versions of this handler read deltaX itself and drove
    // lenis.scrollTo(..., { immediate: true }) manually to convert
    // horizontal wheel input into forward progress through the pin. That
    // path bypasses Lenis's own inertia entirely, so it had to reimplement
    // momentum from scratch — accumulate deltas, release them gradually —
    // which turned out to alias against the render tick: however many
    // wheel events land in the window before any given tick varies (the
    // wheel-event clock and the rAF/tick clock are independent), so "release
    // a fraction of whatever's queued this tick" is inherently lumpy frame
    // to frame. That showed up as measurable stutter (confirmed via traced
    // frame data, not just guesswork) that persisted no matter how the
    // release curve was tuned, because the lumpiness was in the input to
    // that curve, not its shape.
    //
    // Lenis's own native wheel listener (always live, via VirtualScroll) is
    // already the proven, battle-tested engine behind every other smooth
    // scroll on this site — it just defaults to reading deltaY. Rather than
    // fighting or reimplementing it, this handler now only decides *which*
    // axis Lenis should read for the live gesture (sticky per gesture, same
    // hysteresis as before) and lets Lenis's own scrollTo/easing do the
    // actual motion — inheriting its already-smooth behavior instead of a
    // second, competing implementation.
    function handleWheel(e: WheelEvent) {
      if (!scrollStore.projectSectionActive) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const lenis = lenisInstance.current;

      if (_wheelLock === null && (absX > 3 || absY > 3)) {
        _wheelLock = absX > absY ? "x" : "y";
        if (lenis) {
          lenis.options.gestureOrientation =
            _wheelLock === "x" ? "horizontal" : "vertical";
        }
      }
      if (_wheelLockTimer) clearTimeout(_wheelLockTimer);
      _wheelLockTimer = setTimeout(() => {
        _wheelLock = null;
        if (lenis) lenis.options.gestureOrientation = "vertical";
      }, 150);
    }

    function handleTouchStart(e: TouchEvent) {
      if (!scrollStore.projectSectionActive) return;
      _touchStartX = _touchLastX = e.touches[0].clientX;
      _touchStartY = e.touches[0].clientY;
      _touchLock = null;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!scrollStore.projectSectionActive) return;
      const touch = e.touches[0];
      const dx = touch.clientX - _touchStartX;
      const dy = touch.clientY - _touchStartY;
      if (_touchLock === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        _touchLock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (_touchLock === "x") {
        e.preventDefault();
        const lenis = lenisInstance.current;
        if (!lenis) return;
        const delta = _touchLastX - touch.clientX;
        lenis.scrollTo(
          Math.max(0, Math.min(lenis.limit, lenis.scroll + delta)),
          { immediate: true },
        );
        _touchLastX = touch.clientX;
      }
    }

    function handleTouchEnd() {
      _touchLock = null;
    }

    // Drives the continuous stacked-overlay reveal — one call per tick,
    // reading the same live scroll progress the 3D cards use. Each row gets
    // its own lagged copy of the continuous card index (different damp
    // factor per row) so title/description/actions arrive slightly out of
    // phase with each other rather than snapping together, and each row's
    // slide direction differs (title vertical, description/actions
    // horizontal in opposite directions) so the whole block doesn't read as
    // one rigid unit sliding as-is. Runs on gsap.ticker — same clock as
    // Lenis/ScrollTrigger/R3F's advance() — to stay in lockstep with the
    // gallery instead of a competing rAF loop.
    function updateOverlay() {
      const activeF = scrollStore.projectProgress * (PROJECTS.length - 1);
      const dt = gsap.ticker.deltaRatio() / 60;
      // Under reduced motion, rows cross-fade in place instead of sliding —
      // zeroing the slide distance keeps the same damp/opacity timing (so
      // it doesn't feel broken), it just drops the large parallax sweep.
      const slideMult = reducedMotionRef.current ? 0 : 1;
      // Damp toward the nearest whole card, not the raw fractional scroll
      // position — this scroll model doesn't snap (the 3D cards themselves
      // can rest anywhere), so without rounding, stopping between two cards
      // leaves both neighbors permanently at ~40% opacity, unreadable. The
      // rounded target only changes in discrete integer steps as scroll
      // crosses a card's midpoint, so each row holds firm on the current
      // card for the first half of the scroll to the next one, then eases
      // over — the "stays, then transitions" feel, and always settles on
      // exactly one clean, fully-opaque item at rest. Same pattern as the
      // Odometer digit counter, which never shows "2.5" either.
      const target = Math.round(activeF);

      // Slower than the card gallery's own damp — big text needs more
      // weight/inertia than a fast-snapping element, or the transition
      // reads as nervous/twitchy rather than deliberate.
      titleFRef.current = damp(titleFRef.current, target, 0.075, dt);
      descFRef.current = damp(descFRef.current, target, 0.06, dt);
      actionsFRef.current = damp(actionsFRef.current, target, 0.05, dt);

      // Update the static underline's color/width only when the nearest
      // title actually changes (not every frame) — the element's own CSS
      // transition (see className below) animates both smoothly, it just
      // doesn't slide/translate position like the rest of the overlay.
      const activeTitleIdx = Math.min(
        PROJECTS.length - 1,
        Math.max(0, Math.round(titleFRef.current)),
      );
      if (activeTitleIdx !== lastUnderlineIdxRef.current) {
        lastUnderlineIdxRef.current = activeTitleIdx;
        const activeProject = PROJECTS[activeTitleIdx];
        const activeGroup =
          titleRefs.current[activeTitleIdx]?.firstElementChild;
        if (underlineRef.current) {
          underlineRef.current.style.background = `linear-gradient(90deg, ${activeProject.color}, transparent)`;
          if (activeGroup) {
            underlineRef.current.style.width = `${activeGroup.getBoundingClientRect().width}px`;
          }
        }
      }

      for (let i = 0; i < PROJECTS.length; i++) {
        // Title (icon + name, moving as one block): same slide + opacity
        // fade treatment as the description/actions rows below — just
        // horizontal instead of vertical, same direction as actions (the
        // two rows slide in from the same side; description is reversed
        // from both, same as it already was).
        const tEl = titleRefs.current[i];
        if (tEl) {
          const d = i - titleFRef.current;
          const ad = Math.abs(d);
          if (ad < REVEAL_RANGE) {
            tEl.style.opacity = String(
              1 - smoothstep(OPACITY_PLATEAU, OPACITY_FADE_END, ad),
            );
            tEl.style.transform = `translateX(${-d * TITLE_SLIDE_PX * slideMult}px)`;
          } else if (tEl.style.opacity !== "0") {
            tEl.style.opacity = "0";
          }
        }

        const dEl = descRefs.current[i];
        if (dEl) {
          const d = i - descFRef.current;
          const ad = Math.abs(d);
          if (ad < REVEAL_RANGE) {
            dEl.style.opacity = String(
              1 - smoothstep(OPACITY_PLATEAU, OPACITY_FADE_END, ad),
            );
            dEl.style.transform = `translateX(${d * DESC_SLIDE_PX * slideMult}px)`;
          } else if (dEl.style.opacity !== "0") {
            dEl.style.opacity = "0";
          }
        }

        const aEl = actionsRefs.current[i];
        if (aEl) {
          const d = i - actionsFRef.current;
          const ad = Math.abs(d);
          const isNear = ad < 0.5;
          if (ad < REVEAL_RANGE) {
            aEl.style.opacity = String(
              1 - smoothstep(OPACITY_PLATEAU, OPACITY_FADE_END, ad),
            );
            // Opposite sign from the description row above — the two
            // horizontal rows slide in from different sides instead of
            // moving as one matched block.
            aEl.style.transform = `translateX(${-d * ACTIONS_SLIDE_PX * slideMult}px)`;
            aEl.style.pointerEvents = isNear ? "auto" : "none";
          } else {
            if (aEl.style.opacity !== "0") aEl.style.opacity = "0";
            if (aEl.style.pointerEvents !== "none") {
              aEl.style.pointerEvents = "none";
            }
          }
        }
      }
    }

    // wheel/touchmove are non-passive (they call preventDefault) — keeping
    // them attached at the window level for the component's whole lifetime
    // would block the browser's scroll fast-path site-wide, not just while
    // this section is pinned. Only attach them for the window the section is
    // actually active, driven by the ScrollTrigger enter/leave callbacks
    // above. touchstart/touchend are passive and cheap (early-return only),
    // so they stay attached for the session.
    let activeListenersAttached = false;
    function attachActiveListeners() {
      if (activeListenersAttached) return;
      activeListenersAttached = true;
      // handleWheel no longer calls preventDefault itself (Lenis's own
      // listener does that once it processes the event), but touchmove
      // still needs to stay non-passive for its own manual scrollTo below.
      window.addEventListener("wheel", handleWheel, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      gsap.ticker.add(updateOverlay);
    }
    function detachActiveListeners() {
      if (!activeListenersAttached) return;
      activeListenersAttached = false;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      gsap.ticker.remove(updateOverlay);
      // updateOverlay is what drives pointer-events on each project's
      // actions row (tags/visit link) — with the ticker stopped, whichever
      // one was "near" the moment the section went inactive stays
      // pointer-events:auto forever, hoverable/clickable even though the
      // whole overlay is now invisible and the section unpinned. Force
      // every row back to none here so nothing is left interactive.
      for (const el of actionsRefs.current) {
        if (el) el.style.pointerEvents = "none";
      }
      // Safety net: if the section is left mid-gesture, make sure Lenis
      // isn't left reading deltaX for normal vertical scroll elsewhere.
      const lenis = lenisInstance.current;
      if (lenis) lenis.options.gestureOrientation = "vertical";
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      gsap.ticker.remove(updateOverlay);
      if (lenisInstance.current) {
        lenisInstance.current.options.gestureOrientation = "vertical";
      }
      if (_wheelLockTimer) clearTimeout(_wheelLockTimer);
      _wheelLock = null;
      _touchLock = null;
      _touchStartX = 0;
      _touchStartY = 0;
      _touchLastX = 0;
      section.style.height = "";
      scrollStore.projectProgress = 0;
      scrollStore.projectSectionActive = false;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-heading"
      className="relative z-10"
    >
      {/* Screen-reader fallback — the 15 cards are pure Three.js meshes in
          UniverseCanvas's <canvas>, no DOM/ARIA representation of their
          own. Same pattern as TechStacksSection's sr-only tech list. */}
      <ul className="sr-only">
        {PROJECTS.map((project) => (
          <li key={project.name}>
            {project.link ? (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                {project.name}
              </a>
            ) : (
              project.name
            )}
          </li>
        ))}
      </ul>

      {/* Sticky viewport */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Section label + counter */}
        <div className="pointer-events-none absolute top-30 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 md:top-20">
          <SectionHeading
            id="projects-heading"
            className="pe-1 pb-1"
            isIntersecting
          >
            Projects
          </SectionHeading>
          <span className="flex items-center whitespace-pre font-mono text-sm text-white/60 tabular-nums">
            <Odometer ref={odometerRef} digits={2} initialValue={1} />
            <span>&nbsp;/&nbsp;{String(PROJECTS.length).padStart(2, "0")}</span>
          </span>
        </div>

        {/* Active project detail overlay — every project's title/description/
            actions is pre-rendered and stacked here; updateOverlay above
            continuously positions/fades each one by its distance from the
            live scroll-driven card index instead of swapping DOM content
            per card crossing (that swap — React re-render + GSAP tweens +
            a fresh <img> decode, repeated on every one of 15 cards — was
            the confirmed source of dropped frames while scrolling). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-10 md:pb-14">
          {/* Title row — icon + name move together as one block, sliding
              horizontally with the same slide+fade treatment as the
              description/actions rows below (same direction as actions,
              opposite of description). The colored underline is NOT part
              of that moving stack — it stays in a fixed position (no
              translate/slide) while its own color+width cross to the
              active project via a plain CSS transition. */}
          <div
            ref={titleWrapRef}
            className="relative w-full overflow-x-hidden overflow-y-visible opacity-0"
            style={{ height: TITLE_ROW_PX }}
          >
            {PROJECTS.map((project, i) => (
              <div
                key={project.name}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className="absolute inset-x-0 top-0 flex justify-center"
              >
                {/* Inner group is content-sized (icon + gap + name), unlike
                    its `inset-x-0` parent above — that's what lets the
                    underline measure the icon+name group's real combined
                    width instead of the parent's full stretched width. */}
                <div className="flex items-end gap-2">
                  {project.logo && (
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border p-1",
                        project.darkLogo
                          ? "border-white/30 bg-white/90"
                          : "border-white/20 bg-white/15",
                      )}
                    >
                      <img
                        src={project.logo}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <h3 className="relative inline-block whitespace-nowrap font-bold text-2xl text-white tracking-tight sm:text-3xl">
                    {project.name}
                  </h3>
                </div>
              </div>
            ))}
            <span
              ref={underlineRef}
              className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-300 ease-out"
            />
          </div>

          {/* Description row */}
          <div
            ref={descWrapRef}
            className="relative mt-3 mb-4 w-full max-w-sm overflow-x-hidden overflow-y-visible opacity-0 sm:max-w-lg"
            style={{ height: `${DESC_ROW_EM}em` }}
          >
            {PROJECTS.map((project, i) => (
              <p
                key={project.name}
                ref={(el) => {
                  descRefs.current[i] = el;
                }}
                className="absolute inset-x-0 top-0 line-clamp-3 px-6 text-center text-white/60 text-xs leading-relaxed opacity-0 sm:line-clamp-none sm:px-0 sm:text-sm"
              >
                {project.description}
              </p>
            ))}
          </div>

          {/* Tags + visit button row — overflow-y stays visible (not just
              unset) because TagsPopover's hover panel escapes upward via
              `bottom-full`; only overflow-x is clipped so sliding neighbor
              rows don't bleed out sideways. Explicitly setting both axes
              matters here: leaving overflow-y unset while overflow-x is
              hidden lets the browser silently compute overflow-y as `auto`
              instead of `visible`, which clips the popover anyway. */}
          <div
            ref={actionsWrapRef}
            className="relative w-full overflow-x-clip overflow-y-visible opacity-0"
            style={{
              height: isMobile ? ACTIONS_ROW_PX_MOBILE : ACTIONS_ROW_PX,
            }}
          >
            {PROJECTS.map((project, i) => (
              <div
                key={project.name}
                ref={(el) => {
                  actionsRefs.current[i] = el;
                }}
                className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-3 opacity-0"
              >
                {project.tags && project.tags.length > 0 && (
                  <TagsPopover
                    tags={project.tags}
                    visibleCount={3}
                    projectColor={project.color}
                  />
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3 py-1 font-semibold text-white text-xs transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/15"
                    style={{ boxShadow: `0 0 16px ${project.color}40` }}
                  >
                    Visit
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
