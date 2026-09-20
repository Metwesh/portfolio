import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import { cn } from "../lib/utils";

const GLASS_CARD_BASE =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl";

type GlassCardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<T>, "as" | "className" | "children">;

export function GlassCard<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: GlassCardProps<T>) {
  // biome-ignore lint/suspicious/noExplicitAny: polymorphic "as" tag — TS collapses JSX children typing to `never` for a generic ElementType, this is the standard escape hatch
  const Component = (as ?? "div") as any;
  return (
    <Component className={cn(GLASS_CARD_BASE, className)} {...rest}>
      {children}
    </Component>
  );
}
