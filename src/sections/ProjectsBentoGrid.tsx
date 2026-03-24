import { useRef, useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { INTERSECTION_OBSERVER_CONFIG } from "../constants";
import type { Project } from "../constants/projects";
import { projects } from "../constants/projects";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

interface ProjectCardProps {
  project: Project;
  index: number;
  onHover: (index: number | null) => void;
  hoveredIndex: number | null;
}

function MagneticProjectCard({
  project,
  index,
  onHover,
  hoveredIndex,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if this card should be repelled
  const isRepelled = hoveredIndex !== null && hoveredIndex !== index;
  const isOtherHovered = hoveredIndex !== null && !isHovered;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(index);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(null);
  };

  // Get grid size based on index for varied, organic layout
  const getGridSize = (idx: number) => {
    // More varied pattern that doesn't repeat as obviously
    const patterns = [
      "md:col-span-2 md:row-span-2", // Large square - 0
      "md:col-span-1 md:row-span-1", // Small - 1
      "md:col-span-1 md:row-span-2", // Tall - 2
      "md:col-span-2 md:row-span-1", // Wide - 3
      "md:col-span-1 md:row-span-1", // Small - 4
      "md:col-span-2 md:row-span-2", // Large square - 5
      "md:col-span-1 md:row-span-2", // Tall - 6
      "md:col-span-1 md:row-span-1", // Small - 7
      "md:col-span-2 md:row-span-1", // Wide - 8
      "md:col-span-1 md:row-span-1", // Small - 9
      "md:col-span-1 md:row-span-2", // Tall - 10
      "md:col-span-2 md:row-span-1", // Wide - 11
    ];
    return patterns[idx % patterns.length];
  };

  const isClickable = !!project.link;

  return (
    <article
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${getGridSize(index)} ${isClickable ? "cursor-pointer" : ""}`}
      style={{
        transform: isHovered
          ? "scale(1.02)"
          : isRepelled
            ? "scale(0.98)"
            : "scale(1)",
        opacity: isOtherHovered ? 0.5 : 1,
        filter: isOtherHovered ? "blur(2px)" : "blur(0px)",
        zIndex: isHovered ? 50 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isClickable ? (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`View ${project.name} project`}
        >
          <span className="sr-only">View {project.name}</span>
        </a>
      ) : null}
      {/* Animated gradient background */}
      {/* <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${project.color}40, transparent 60%)`,
        }}
      /> */}

      {/* Image with liquid distortion effect */}
      <div className="relative h-full min-h-[300px] overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover transition-all duration-500"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            filter: isHovered
              ? "contrast(1.05) saturate(1.1)"
              : "contrast(1) saturate(1)",
          }}
        />

        {/* Liquid morphing overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `linear-gradient(135deg, ${project.color}20, transparent)`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-black/90 to-transparent p-6 transition-all duration-300">
        {/* Logo if available */}
        {project.logo && (
          <img
            src={project.logo}
            alt={`${project.name} logo`}
            className="mb-4 h-12 w-auto object-contain"
          />
        )}

        {/* Title */}
        <h3 className="relative mb-2 font-bold text-2xl md:text-3xl">
          {project.name}
          <div
            className="mt-2 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: project.color,
              width: isHovered ? "100%" : "40%",
            }}
          />
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm text-white/80 md:text-base">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag.name}
                className="rounded-full bg-white/10 px-3 py-1 font-medium text-xs backdrop-blur-sm transition-colors duration-200"
                style={{
                  borderColor: project.color,
                  borderWidth: 1,
                }}
              >
                {tag.name}
              </span>
            ))}
            {project.tags.length > 5 && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-xs backdrop-blur-sm">
                +{project.tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
            animation: "shine 0.8s ease-in-out",
          }}
        />
      )}
    </article>
  );
}

export function ProjectsBentoGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: INTERSECTION_OBSERVER_CONFIG.DEFAULT_THRESHOLD,
    rootMargin: INTERSECTION_OBSERVER_CONFIG.DEFAULT_ROOT_MARGIN,
  });

  return (
    <section
      className="relative min-h-screen py-20"
      ref={targetRef as React.RefObject<HTMLElement>}
    >
      <div className="container relative z-10 mx-auto px-4">
        <SectionHeading id="projects-bento" isIntersecting={isIntersecting}>
          Projects - Magnetic Bento Grid
        </SectionHeading>

        {/* Bento Grid */}
        <div className="mt-12 grid auto-rows-[280px] grid-cols-1 gap-4 md:auto-rows-[320px] md:grid-cols-3 md:gap-6">
          {projects.map((project, index) => (
            <MagneticProjectCard
              key={project.name}
              project={project}
              index={index}
              onHover={setHoveredIndex}
              hoveredIndex={hoveredIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
