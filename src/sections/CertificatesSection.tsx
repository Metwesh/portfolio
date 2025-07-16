import { certificates } from "../constants";

export function CertificatesSection() {
  return (
    <section
      id="certificates"
      className="flex min-h-[60vh] flex-col items-center justify-center py-24"
    >
      <h2 className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg">
        Certificates
      </h2>
      <div className="mx-auto w-full max-w-2xl">
        <ul className="space-y-6">
          {certificates.map((cert) => (
            <li
              key={cert.title}
              className="group relative transform-gpu cursor-pointer p-2 overflow-hidden rounded-3xl bg-white/5 shadow-2xl backdrop-blur-lg hover:scale-[1.03] hover:shadow-2xl"
              style={{
                boxShadow: `0 8px 32px 0 ${cert.color}33`,
                perspective: 1200,
                zIndex: 1,
                transition: "all 0.5s cubic-bezier(.23,1.12,.32,1)",
              }}
            >
              {/* Colored glow */}
              <div
                className="absolute -top-8 -right-8 h-20 w-20 rounded-full opacity-30 blur-2xl transition-all duration-700"
                style={{ background: cert.color }}
              />
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-2xl p-6"
              >
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-xl font-bold text-white drop-shadow-lg"
                    style={{ color: cert.color }}
                    title={cert.title}
                  >
                    {cert.title}
                  </div>
                  <div
                    className="mt-1 truncate text-base text-white/80"
                    title={cert.issuer}
                  >
                    {cert.issuer}
                  </div>
                </div>
                <div className="ml-4 font-mono text-xs whitespace-nowrap text-cyan-100 opacity-80">
                  {cert.year}
                </div>
              </a>
              {/* Shine effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-60"
                style={{
                  background: `linear-gradient(120deg, ${cert.color}33 0%, transparent 100%)`,
                  mixBlendMode: "screen",
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
