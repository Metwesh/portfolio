import { Fragment, useEffect, useState } from "react";
import { experiences } from "../constants";

export function ExperienceSection() {
  const [timelineFloat, setTimelineFloat] = useState(0);

  useEffect(() => {
    const animate = () => {
      setTimelineFloat(Math.sin(Date.now() / 800) * 8);
      requestAnimationFrame(animate);
    };
    animate();
    return () => {};
  }, []);

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
          {experiences.map((exp, index) => (
            <Fragment key={`experience-${exp.company}-${index}`}>
              {/* Icon with blur for mobile */}
              <div
                className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md sm:hidden"
                style={{
                  boxShadow: `0 0 24px 4px ${exp.color}88`,
                }}
              >
                <img
                  src={exp.icon}
                  alt={`${exp.company}-logo`}
                  className="h-full w-full rounded-full object-contain"
                />
              </div>

              <li
                className="group flex flex-col items-center gap-6 backdrop-blur-md sm:flex-row sm:items-start sm:gap-8"
                style={{
                  transform: `translateY(${
                    Math.sin(index + timelineFloat / 8) * 8
                  }px)`,
                  filter: `drop-shadow(0 0 16px ${exp.color}88)`,
                  transition: "transform 0.7s cubic-bezier(.23,1.12,.32,1)",
                }}
              >
                {/* Icon with blur */}
                <div
                  className="h-14 w-14 flex-shrink-0 animate-pulse rounded-full bg-white/10 backdrop-blur-md transition-all group-hover:bg-white/5 max-sm:hidden sm:h-16 sm:w-16"
                  style={{
                    boxShadow: `0 0 24px 4px ${exp.color}88`,
                  }}
                >
                  <img
                    src={exp.icon}
                    alt={`${exp.company}-logo`}
                    className="h-full w-full rounded-full object-contain"
                  />
                </div>

                {/* Card with blur */}
                <div className="w-full rounded-2xl bg-white/10 p-4 shadow-xl backdrop-blur-md transition-all group-hover:bg-white/5 sm:p-8">
                  <h3 className="mb-1 text-lg font-bold text-white drop-shadow-lg sm:text-xl">
                    {exp.company}
                  </h3>
                  <p
                    className="mb-4 font-semibold"
                    style={{ color: exp.color }}
                  >
                    {exp.title}
                    <span className="text-white/60">
                      &nbsp;&mdash;&nbsp;{exp.date}
                    </span>
                  </p>
                  <ul className="space-y-2 text-sm text-white/80 sm:text-base">
                    {exp.points.map((point) => (
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
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
