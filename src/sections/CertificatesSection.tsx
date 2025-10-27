import { certificates } from "../constants/certificates";
import { INTERSECTION_OBSERVER_CONFIG } from "../constants";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

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
        <h2
          id="certificates-heading"
          className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl"
          style={{
            opacity: isIntersecting ? 1 : 0,
            transform: `translateY(${isIntersecting ? 0 : 50}px) scale(${isIntersecting ? 1 : 0.9})`,
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          Certifications
          <div className="absolute -inset-1 -z-10 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-3xl" />
        </h2>
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
                className={`group relative ${gridSpan}`}
                style={{
                  opacity: isIntersecting ? 1 : 0,
                  transform: isIntersecting
                    ? "translateY(0) rotateX(0deg)"
                    : `translateY(${50 + index * 10}px) rotateX(15deg)`,
                  transition: `all 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`,
                }}
              >
                {/* Glow effect */}
                <div
                  className="absolute -inset-2 rounded-3xl opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100 motion-reduce:transition-none"
                  style={{
                    background: `radial-gradient(circle at center, ${cert.color}50, transparent 70%)`,
                  }}
                />

                {/* Main card */}
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-2xl motion-reduce:transition-none"
                >
                  {/* Animated gradient mesh background */}
                  <div className="absolute inset-0 opacity-40">
                    <div
                      className="absolute top-0 right-0 h-64 w-64 translate-x-[20%] -translate-y-[20%] rounded-full blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none"
                      style={{
                        background: `radial-gradient(circle, ${cert.color}70, transparent 70%)`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 h-56 w-56 -translate-x-[20%] translate-y-[20%] rounded-full blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none"
                      style={{
                        background: `radial-gradient(circle, ${cert.color}50, transparent 70%)`,
                      }}
                    />
                  </div>

                  {/* Animated border */}
                  <div
                    className="absolute inset-0 animate-[borderFlow_3s_ease_infinite] rounded-2xl bg-[length:200%_200%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
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
                          className="relative h-full w-full rounded-2xl object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 motion-reduce:transition-none"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="relative mb-2 text-xl font-bold text-white md:text-2xl">
                      {cert.title}
                      <div
                        className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-14 motion-reduce:transition-none"
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
                        className="rounded-full border px-4 py-2 text-xs font-bold backdrop-blur-md transition-all duration-300 group-hover:scale-110 motion-reduce:transition-none md:text-sm"
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
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-45 motion-reduce:transition-none"
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
                    className="pointer-events-none absolute inset-0 animate-[shimmer_2s_infinite] bg-[length:200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none"
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
                ? "translateY(0) rotateX(0deg)"
                : `translateY(${50 + certificates.length * 10}px) rotateX(15deg)`,
              transition: `all 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${certificates.length * 0.1}s`,
            }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-400/50 via-blue-500/50 to-purple-600/50 opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100 motion-reduce:transition-none" />

            {/* Main card */}
            <div className="relative flex h-full min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 group-hover:shadow-2xl motion-reduce:transition-none">
              {/* Animated gradient mesh background */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 right-0 h-64 w-64 translate-x-[20%] -translate-y-[20%] rounded-full bg-gradient-to-br from-cyan-400/70 via-blue-500/70 to-purple-600/70 blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none" />
                <div className="absolute bottom-0 left-0 h-56 w-56 -translate-x-[20%] translate-y-[20%] rounded-full bg-gradient-to-tl from-purple-600/50 via-blue-500/50 to-cyan-400/50 blur-3xl transition-all duration-1000 group-hover:scale-125 motion-reduce:transition-none" />
              </div>

              {/* Animated border */}
              <div
                className="absolute inset-0 rounded-2xl bg-[length:200%_200%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0, 211, 242, 0.4), transparent 50%, rgba(168, 85, 247, 0.4))`,
                  animation: "borderFlow 3s ease infinite",
                }}
              />

              {/* Logo SVG */}
              <div className="relative z-10 p-8">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 478 478"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 motion-reduce:transition-none"
                >
                  <rect width="478" height="478" rx="32" fill="transparent" />
                  <path
                    d="M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z"
                    fill="url(#logo-gradient)"
                  />
                  <defs>
                    <linearGradient
                      id="logo-gradient"
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
                className="pointer-events-none absolute inset-0 bg-[length:200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none"
                style={{
                  backgroundImage: `linear-gradient(110deg, transparent 25%, rgba(34, 211, 238, 0.15) 50%, transparent 75%)`,
                  animation: "shimmer 2s infinite",
                }}
              />

              {/* Corner accents */}
              <div className="pointer-events-none absolute top-0 left-0 h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400/60 to-transparent opacity-0 blur-lg transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 rounded-full bg-gradient-to-tl from-purple-600/60 to-transparent opacity-0 blur-lg transition-all duration-700 group-hover:opacity-60 motion-reduce:transition-none" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
