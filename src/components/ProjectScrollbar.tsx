import { cn } from "../lib/utils";

interface ProjectScrollbarProps {
  projectCount: number;
  currentIndex: number;
  onNavigate: (index: number, smooth?: boolean) => void;
}

export function ProjectScrollbar({
  projectCount,
  currentIndex,
  onNavigate,
}: ProjectScrollbarProps) {
  const totalItems = projectCount + 1; // +1 for title

  return (
    <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-2">
      {[...Array(totalItems)].map((_, index) => {
        const isActive = currentIndex === index;
        // Calculate distance from current position for "approaching" effect
        const distance = Math.abs(currentIndex - index);
        const isNear = distance < 0.5 && !isActive;

        return (
          <button
            key={`project-scrollbar-${index}`}
            onClick={() => onNavigate(index)}
            className={cn(
              "h-2 cursor-pointer rounded transition-all duration-300 hover:scale-110",
              isActive
                ? "w-8 bg-white/90"
                : isNear
                  ? "w-4 bg-white/50"
                  : "w-2 bg-white/30",
            )}
            aria-label={index === 0 ? "Go to title" : `Go to project ${index}`}
            aria-current={isActive ? "true" : "false"}
            type="button"
          />
        );
      })}
    </div>
  );
}
