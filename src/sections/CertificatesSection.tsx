import { SectionHeading } from "../components/SectionHeading";
import { ANIMATION_CONFIG, INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { certificates } from "../constants/certificates";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { cn } from "../lib/utils";

const logoArray = Array.from({ length: 5 }, (_, i) => `logo-fan-${i}`);
const tunnelArray = Array.from({ length: 8 }, (_, i) => ({
  id: `tunnel-ring-${i}`,
  scale: 1 - i * 0.12,
  opacity: 0.15 - i * 0.015,
  backgroundOpacity: 0.3 + i * 0.08,
  borderOpacity: 0.3 - i * 0.03,
  animationDelay: i * 0.15,
  zIndex: -i, // Stack rings properly, smaller ones on top
  hueRotate: i * 15, // Color shift for each ring
}));

export function CertificatesSection() {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  return (
    <section
      ref={targetRef}
      id="certificates"
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-32"
      aria-labelledby="certificates-heading"
    >
      {/* Animated section title */}
      <div className="relative mb-20">
        <SectionHeading
          id="certificates-heading"
          isIntersecting={isIntersecting}
        >
          Certifications
        </SectionHeading>
      </div>

      {/* Bento-style grid layout */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {certificates.map((cert, index) => {
            // Create varied card sizes for bento effect
            const isFeatured = index % 5 === 0;
            const gridSpan = isFeatured ? "md:col-span-2" : "md:col-span-1";

            return (
              <article
                key={cert.title}
                className={cn("group relative", gridSpan)}
                style={{
                  opacity: isIntersecting ? 1 : 0,
                  transform: isIntersecting
                    ? "translate3d(0, 0, 0)"
                    : `translate3d(0, ${Math.min(30 + index * 5, 80)}px, 0)`,
                  transition: isIntersecting
                    ? `opacity ${
                        ANIMATION_CONFIG.CERTIFICATES_DURATION
                      }s cubic-bezier(0.4, 0, 0.2, 1) ${Math.min(
                        ANIMATION_CONFIG.CERTIFICATES_BASE_DELAY +
                          index * ANIMATION_CONFIG.CERTIFICATES_STAGGER_DELAY,
                        ANIMATION_CONFIG.CERTIFICATES_MAX_DELAY
                      )}s, transform ${
                        ANIMATION_CONFIG.CERTIFICATES_DURATION
                      }s cubic-bezier(0.4, 0, 0.2, 1) ${Math.min(
                        ANIMATION_CONFIG.CERTIFICATES_BASE_DELAY +
                          index * ANIMATION_CONFIG.CERTIFICATES_STAGGER_DELAY,
                        ANIMATION_CONFIG.CERTIFICATES_MAX_DELAY
                      )}s`
                    : "none",
                  willChange: isIntersecting ? "auto" : "opacity, transform",
                }}
              >
                {/* Glow effect */}
                <div
                  className="-inset-2 absolute rounded-3xl opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100 motion-reduce:transition-none"
                  style={{
                    background: `radial-gradient(circle at center, ${cert.color}50, transparent 70%)`,
                  }}
                />

                {/* Main card */}
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-2xl motion-reduce:transition-none"
                >
                  {/* Animated gradient mesh background */}
                  <div className="absolute inset-0 opacity-40">
                    <div
                      className="-translate-y-[20%] absolute top-0 right-0 h-64 w-64 translate-x-[20%] rounded-full blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none"
                      style={{
                        background: `radial-gradient(circle, ${cert.color}70, transparent 70%)`,
                      }}
                    />
                    <div
                      className="-translate-x-[20%] absolute bottom-0 left-0 h-56 w-56 translate-y-[20%] rounded-full blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none"
                      style={{
                        background: `radial-gradient(circle, ${cert.color}50, transparent 70%)`,
                      }}
                    />
                  </div>

                  {/* Animated border */}
                  <div
                    className="absolute inset-0 animate-[borderFlow_3s_ease_infinite] rounded-2xl bg-size-[200%_200%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${cert.color}40, transparent 50%, ${cert.color}40)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
                    {/* Icon with glow */}
                    {cert.icon && (
                      <div className="relative mb-4 h-16 w-16 md:h-20 md:w-20">
                        <div
                          className="absolute inset-0 rounded-2xl opacity-50 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl motion-reduce:transition-none"
                          style={{ background: cert.color }}
                        />
                        <img
                          src={cert.icon}
                          alt={`${cert.title} icon`}
                          loading="lazy"
                          decoding="async"
                          className="relative h-full w-full rounded-2xl object-contain transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="relative mb-2 font-bold text-white text-xl md:text-2xl">
                      {cert.title}
                      <div
                        className="-bottom-1 absolute left-0 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-14 motion-reduce:transition-none"
                        style={{
                          background: `linear-gradient(90deg, ${cert.color}, transparent)`,
                          boxShadow: `0 0 15px ${cert.color}80`,
                        }}
                      />
                    </h3>

                    {/* Issuer */}
                    <p className="mb-auto text-sm text-white/70 transition-colors duration-300 group-hover:text-white/90 motion-reduce:transition-none md:text-base">
                      {cert.issuer}
                    </p>

                    {/* Year badge */}
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="rounded-full border px-4 py-2 font-bold text-xs backdrop-blur-md transition-all duration-300 group-hover:scale-110 motion-reduce:transition-none md:text-sm"
                        style={{
                          background: `${cert.color}20`,
                          borderColor: `${cert.color}60`,
                          color: cert.color,
                          boxShadow: `0 0 20px ${cert.color}30`,
                        }}
                      >
                        {cert.year}
                      </span>

                      {/* Arrow icon */}
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-hover:rotate-45 motion-reduce:transition-none"
                        style={{
                          background: `${cert.color}30`,
                          color: cert.color,
                        }}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M7 7h10v10M7 17L17 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Shimmer effect */}
                  <div
                    className="pointer-events-none absolute inset-0 animate-[shimmer_2s_infinite] bg-size-[200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none"
                    style={{
                      backgroundImage: `linear-gradient(110deg, transparent 25%, ${cert.color}15 50%, transparent 75%)`,
                    }}
                  />

                  {/* Corner accents */}
                  <div
                    className="pointer-events-none absolute top-0 left-0 h-20 w-20 opacity-0 transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at top left, ${cert.color}60, transparent 70%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 opacity-0 transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at bottom right, ${cert.color}60, transparent 70%)`,
                    }}
                  />
                </a>
              </article>
            );
          })}

          {/* Logo card at the end */}
          <article
            className="group relative md:col-span-1"
            style={{
              opacity: isIntersecting ? 1 : 0,
              transform: isIntersecting
                ? "translate3d(0, 0, 0)"
                : `translate3d(0, ${Math.min(
                    30 + certificates.length * 5,
                    80
                  )}px, 0)`,
              transition: isIntersecting
                ? `opacity ${
                    ANIMATION_CONFIG.CERTIFICATES_DURATION
                  }s cubic-bezier(0.4, 0, 0.2, 1) ${Math.min(
                    ANIMATION_CONFIG.CERTIFICATES_BASE_DELAY +
                      certificates.length *
                        ANIMATION_CONFIG.CERTIFICATES_STAGGER_DELAY,
                    ANIMATION_CONFIG.CERTIFICATES_MAX_DELAY
                  )}s, transform ${
                    ANIMATION_CONFIG.CERTIFICATES_DURATION
                  }s cubic-bezier(0.4, 0, 0.2, 1) ${Math.min(
                    ANIMATION_CONFIG.CERTIFICATES_BASE_DELAY +
                      certificates.length *
                        ANIMATION_CONFIG.CERTIFICATES_STAGGER_DELAY,
                    ANIMATION_CONFIG.CERTIFICATES_MAX_DELAY
                  )}s`
                : "none",
              willChange: isIntersecting ? "auto" : "opacity, transform",
            }}
          >
            {/* Glow effect */}
            <div className="-inset-2 absolute rounded-3xl bg-linear-to-r from-cyan-400/50 via-blue-500/50 to-purple-600/50 opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100 motion-reduce:transition-none" />

            {/* Main card */}
            <div className="relative flex h-full min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-2xl motion-reduce:transition-none">
              {/* Animated gradient mesh background */}
              <div className="absolute inset-0 opacity-40">
                <div className="-translate-y-[20%] absolute top-0 right-0 h-64 w-64 translate-x-[20%] rounded-full bg-linear-to-br from-cyan-400/70 via-blue-500/70 to-purple-600/70 blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none" />
                <div className="-translate-x-[20%] absolute bottom-0 left-0 h-56 w-56 translate-y-[20%] rounded-full bg-linear-to-tl from-purple-600/50 via-blue-500/50 to-cyan-400/50 blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none" />
              </div>

              {/* Animated border */}
              <div
                className="absolute inset-0 rounded-2xl bg-size-[200%_200%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(0, 211, 242, 0.4), transparent 50%, rgba(168, 85, 247, 0.4))",
                  animation: "borderFlow 3s ease infinite",
                }}
              />

              {/* Tunnel effect - rings getting smaller */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none">
                {tunnelArray.map(
                  ({
                    id,
                    scale,
                    opacity,
                    backgroundOpacity,
                    borderOpacity,
                    hueRotate,
                    animationDelay,
                    zIndex,
                  }) => (
                    <div
                      key={id}
                      className="absolute rounded-2xl"
                      style={{
                        width: `${scale * 100}%`,
                        height: `${scale * 100}%`,
                        opacity: opacity,
                        background: `rgba(0, 0, 0, ${backgroundOpacity})`,
                        border: `1px solid rgba(0, 211, 242, ${borderOpacity})`,
                        boxShadow: `0 0 ${
                          10 + scale * 20
                        }px rgba(0, 211, 242, ${
                          borderOpacity * 0.5
                        }), inset 0 0 ${5 + scale * 10}px rgba(168, 85, 247, ${
                          borderOpacity * 0.3
                        })`,
                        animation: `tunnel-pulse 3s ease-in-out ${animationDelay}s infinite`,
                        filter: `hue-rotate(${hueRotate}deg)`,
                        zIndex,
                      }}
                    />
                  )
                )}
              </div>

              {/* Logo SVG with glitch effect */}
              <div className="relative z-10 p-8">
                {/* Fan-out copies (background layers) - glitch effect */}
                {logoArray.map((fanId, i) => (
                  <svg
                    key={fanId}
                    width="120"
                    height="120"
                    viewBox="0 0 478 478"
                    fill="none"
                    className="absolute top-8 left-8 opacity-0 motion-reduce:transition-none"
                    data-fan-index={i}
                  >
                    <rect width="478" height="478" rx="32" fill="transparent" />
                    <path
                      d="M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z"
                      fill={`url(#logo-gradient-${i})`}
                    />
                    <defs>
                      <linearGradient
                        id={`logo-gradient-${i}`}
                        x1="39"
                        y1="39"
                        x2="439"
                        y2="439"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#22D3EE" />
                        <stop offset="0.5" stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                ))}

                {/* Main logo (front layer) */}
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 478 478"
                  fill="none"
                  className="relative transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                  style={{
                    animation: "logo-gradient-shift 4s ease-in-out infinite",
                  }}
                >
                  <rect width="478" height="478" rx="32" fill="transparent" />
                  <path
                    d="M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z"
                    fill="url(#logo-gradient-main)"
                  />
                  <defs>
                    <linearGradient
                      id="logo-gradient-main"
                      x1="39"
                      y1="39"
                      x2="439"
                      y2="439"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#22D3EE" />
                      <stop offset="0.5" stopColor="#3B82F6" />
                      <stop offset="1" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Shimmer effect */}
              <div
                className="pointer-events-none absolute inset-0 bg-size-[200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, transparent 25%, rgba(34, 211, 238, 0.15) 50%, transparent 75%)",
                  animation: "shimmer 2s infinite",
                }}
              />

              {/* Corner accents */}
              <div className="pointer-events-none absolute top-0 left-0 h-20 w-20 rounded-full bg-linear-to-br from-cyan-400/60 to-transparent opacity-0 blur-lg transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 rounded-full bg-linear-to-tl from-purple-600/60 to-transparent opacity-0 blur-lg transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
