import { SectionHeading } from "../components/SectionHeading";
import { INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { certificates } from "../constants/certificates";
import { useCardHolographicTilt } from "../hooks/useCardHolographicTilt";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { cn } from "../lib/utils";

const logoFanIds = Array.from({ length: 5 }, (_, i) => `logo-fan-${i}`);
const tunnelRings = Array.from({ length: 8 }, (_, i) => ({
  id: `tunnel-ring-${i}`,
  scale: 1 - i * 0.12,
  opacity: 0.15 - i * 0.015,
  backgroundOpacity: 0.3 + i * 0.08,
  borderOpacity: 0.3 - i * 0.03,
  animationDelay: i * 0.15,
  zIndex: -i,
  hueRotate: i * 15,
}));

const LOGO_PATH =
  "M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z";

function MLLogoCard() {
  const { cardRef, shimmerRef } = useCardHolographicTilt<HTMLDivElement>();

  return (
    <article className="group relative md:col-span-1">
      {/* Outer glow */}
      <div className="absolute -inset-2 rounded-3xl bg-linear-to-r from-cyan-400/50 via-blue-500/50 to-purple-600/50 opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100" />

      <div
        ref={cardRef}
        className="relative flex h-full min-h-52 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-[border-color,box-shadow] duration-500 will-change-transform group-hover:border-white/20 group-hover:shadow-2xl"
        style={{ opacity: 0 }}
      >
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-[20%] -translate-y-[20%] rounded-full bg-linear-to-br from-cyan-400/70 via-blue-500/70 to-purple-600/70 blur-3xl transition-all duration-1000 group-hover:scale-125" />
          <div className="absolute bottom-0 left-0 h-56 w-56 -translate-x-[20%] translate-y-[20%] rounded-full bg-linear-to-tl from-purple-600/50 via-blue-500/50 to-cyan-400/50 blur-3xl transition-all duration-1000 group-hover:scale-125" />
        </div>

        {/* Animated border flow */}
        <div
          className="absolute inset-0 rounded-2xl bg-size-[200%_200%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(0,211,242,0.4), transparent 50%, rgba(168,85,247,0.4))",
            animation: "borderFlow 3s ease infinite",
          }}
        />

        {/* Tunnel rings — visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          {tunnelRings.map(
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
                  opacity,
                  background: `rgba(0,0,0,${backgroundOpacity})`,
                  border: `1px solid rgba(0,211,242,${borderOpacity})`,
                  boxShadow: `0 0 ${10 + scale * 20}px rgba(0,211,242,${borderOpacity * 0.5}), inset 0 0 ${5 + scale * 10}px rgba(168,85,247,${borderOpacity * 0.3})`,
                  animation: `tunnel-pulse 3s ease-in-out ${animationDelay}s infinite`,
                  filter: `hue-rotate(${hueRotate}deg)`,
                  zIndex,
                }}
              />
            ),
          )}
        </div>

        {/* Logo with glitch fan */}
        <div className="relative z-10 p-8">
          {/* Glitch fan layers — animated on hover via CSS */}
          {logoFanIds.map((fanId, i) => (
            <svg
              key={fanId}
              width="120"
              height="120"
              viewBox="0 0 478 478"
              fill="none"
              className="absolute top-8 left-8 opacity-0"
              data-fan-index={i}
            >
              <path d={LOGO_PATH} fill={`url(#fan-grad-${i})`} />
              <defs>
                <linearGradient
                  id={`fan-grad-${i}`}
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

          {/* Main logo */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 478 478"
            fill="none"
            className="relative transition-transform duration-500 group-hover:scale-110"
            style={{ animation: "logo-gradient-shift 4s ease-in-out infinite" }}
          >
            <path d={LOGO_PATH} fill="url(#logo-grad-main)" />
            <defs>
              <linearGradient
                id="logo-grad-main"
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

        {/* Shimmer */}
        <div
          ref={shimmerRef}
          className="pointer-events-none absolute inset-0 bg-size-[200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(110deg, transparent 25%, rgba(34,211,238,0.15) 50%, transparent 75%)",
            animation: "shimmer 2s infinite",
          }}
        />

        {/* Corner accents */}
        <div className="pointer-events-none absolute top-0 left-0 h-20 w-20 rounded-full bg-linear-to-br from-cyan-400/60 to-transparent opacity-0 blur-lg transition-all duration-700 group-hover:opacity-60" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 rounded-full bg-linear-to-tl from-purple-600/60 to-transparent opacity-0 blur-lg transition-all duration-700 group-hover:opacity-60" />
      </div>
    </article>
  );
}

function CertCard({
  cert,
  isFeatured,
}: {
  cert: (typeof certificates)[number];
  isFeatured: boolean;
}) {
  const { cardRef, shimmerRef } = useCardHolographicTilt<HTMLAnchorElement>();

  return (
    <a
      ref={cardRef}
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      data-magnetic
      className={cn(
        "group relative flex min-h-52 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl will-change-transform md:p-8",
        isFeatured ? "md:col-span-2" : "md:col-span-1",
      )}
      style={{
        opacity: 0,
        boxShadow: `0 8px 32px -10px ${cert.color}30`,
      }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="absolute top-0 right-0 h-48 w-48 translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${cert.color}80, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/4 translate-y-1/4 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${cert.color}50, transparent 70%)`,
          }}
        />
      </div>

      {/* Holographic shimmer — follows mouse */}
      <div
        ref={shimmerRef}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200"
        style={{
          backgroundImage: `linear-gradient(135deg, transparent 30%, ${cert.color}25 50%, transparent 70%)`,
          backgroundSize: "200% 200%",
          backgroundPosition: "50% 50%",
        }}
      />

      {/* Border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${cert.color}60`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {cert.icon && (
          <div className="relative mb-5 h-14 w-14 md:h-16 md:w-16">
            <div
              className="absolute inset-0 rounded-xl opacity-40 blur-lg transition-all duration-500 group-hover:opacity-80"
              style={{ background: cert.color }}
            />
            <img
              src={cert.icon}
              alt={`${cert.title} icon`}
              loading="lazy"
              decoding="async"
              className="relative h-full w-full rounded-xl object-contain"
            />
          </div>
        )}

        <h3 className="relative mb-1 font-bold text-lg text-white md:text-xl">
          {cert.title}
          <div
            className="absolute -bottom-1 left-0 h-px w-6 rounded-full transition-all duration-500 group-hover:w-12"
            style={{
              background: `linear-gradient(90deg, ${cert.color}, transparent)`,
              boxShadow: `0 0 8px ${cert.color}80`,
            }}
          />
        </h3>

        <p className="mb-auto text-sm text-white/60 transition-colors duration-300 group-hover:text-white/80">
          {cert.issuer}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span
            className="rounded-full border px-3 py-1 font-bold font-mono text-xs backdrop-blur-md"
            style={{
              background: `${cert.color}15`,
              borderColor: `${cert.color}50`,
              color: cert.color,
            }}
          >
            {cert.year}
          </span>

          <div
            className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 group-hover:rotate-45"
            style={{ background: `${cert.color}25`, color: cert.color }}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
    </a>
  );
}

export function CertificatesSection() {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  return (
    <section
      ref={targetRef}
      id="certificates"
      className="relative z-10 flex min-h-svh flex-col items-center px-gutter py-32"
      aria-labelledby="certificates-heading"
    >
      <div className="mb-20">
        <SectionHeading
          id="certificates-heading"
          isIntersecting={isIntersecting}
        >
          Certifications
        </SectionHeading>
      </div>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {certificates.map((cert, index) => (
            <CertCard
              key={cert.title}
              cert={cert}
              isFeatured={index % 5 === 0}
            />
          ))}

          {/* M Logo showcase card */}
          <MLLogoCard />
        </div>
      </div>
    </section>
  );
}
