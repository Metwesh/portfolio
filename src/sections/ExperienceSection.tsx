import { experiences } from "../constants";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="flex min-h-screen flex-col items-center justify-center py-24 sm:px-8 md:py-32"
    >
      <h2 className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-center text-3xl font-extrabold tracking-tight text-transparent drop-shadow-lg sm:text-4xl">
        Experience
      </h2>

      <div className="relative w-full max-w-5xl">
        {/* Timeline */}
        <div
          className="absolute top-0 left-1/2 z-0 h-full w-4 -translate-x-1/2 rounded-full"
          style={{
            filter: "blur(24px)",
            backgroundImage: `linear-gradient(to bottom, ${experiences
              .map((exp) => exp.color)
              .join(", ")})`,
          }}
        />
        <div
          className="absolute top-0 left-1/2 z-0 h-full w-1 -translate-x-1/2 rounded-full"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${experiences
              .map((exp) => exp.color)
              .join(", ")})`,
          }}
        />

        <ul className="relative z-10 space-y-16 py-12">
          {experiences.map((experience, index) => (
            <li
              key={`experience-${experience.company}-${index}`}
              className={`flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-8 ${
                index % 2 === 0 ? "animate-float" : "animate-float-2"
              }`}
              style={{
                animationDelay: `${index * 2}s`,
              }}
            >
              <div
                className="mx-auto h-14 w-14 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/2 max-sm:mb-4 sm:min-h-16 sm:min-w-16"
                style={{
                  boxShadow: `0 0 24px 4px ${experience.color}88`,
                }}
              >
                <img
                  src={experience.icon}
                  alt={`${experience.company}-logo`}
                  className="h-full w-full rounded-full object-contain"
                />
              </div>

              <div
                className="group flex flex-col items-center gap-6 rounded-2xl backdrop-blur-md"
                style={{
                  filter: `drop-shadow(0 0 16px ${experience.color}88)`,
                }}
              >
                {/* Card with blur */}
                <div className="w-full rounded-2xl bg-white/5 p-4 shadow-xl backdrop-blur-md transition-all group-hover:bg-white/2 sm:p-8">
                  <h3 className="mb-1 text-lg font-bold text-white drop-shadow-lg sm:text-xl">
                    {experience.company}
                  </h3>
                  <p
                    className="mb-4 font-semibold"
                    style={{ color: experience.color }}
                  >
                    {experience.title}
                    <span className="text-white/60">
                      &nbsp;&mdash;&nbsp;{experience.date}
                    </span>
                  </p>
                  <ul className="space-y-2 text-sm text-white/80 sm:text-base">
                    {experience.points.map((point) => (
                      <li
                        key={`experience-point-${point.title}`}
                        className="list-inside list-disc"
                      >
                        <strong>{point.title}</strong>
                        <span>&#58;&nbsp;{point.subtitle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
