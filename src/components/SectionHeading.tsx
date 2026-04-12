import { cn } from "../lib/utils";

interface SectionHeadingProps {
  id: string;
  isIntersecting: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  id,
  isIntersecting,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn(
        "relative bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-center font-black text-5xl text-transparent tracking-tight md:text-6xl",
        className,
      )}
      style={{
        opacity: isIntersecting ? 1 : 0,
        transform: `translateY(${isIntersecting ? 0 : 50}px) scale(${
          isIntersecting ? 1 : 0.9
        })`,
        transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        willChange: isIntersecting ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </h2>
  );
}
