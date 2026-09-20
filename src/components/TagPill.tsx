import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import { cn } from "../lib/utils";

// Only the base truly shared across every current pill usage (tags, the
// "+N more" popover trigger, gallery "Visit" links) — colors, hover states,
// and transition property are left to each call site's own className so
// existing per-site behavior (e.g. the reduced-motion fallback intentionally
// having no hover:scale) isn't flattened into one look.
const TAG_PILL_BASE = "rounded-full border px-3 py-1 font-semibold text-xs";

type TagPillProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<T>, "as" | "className" | "children">;

export function TagPill<T extends ElementType = "span">({
  as,
  className,
  children,
  ...rest
}: TagPillProps<T>) {
  // biome-ignore lint/suspicious/noExplicitAny: polymorphic "as" tag — TS collapses JSX children typing to `never` for a generic ElementType, this is the standard escape hatch
  const Component = (as ?? "span") as any;
  return (
    <Component className={cn(TAG_PILL_BASE, className)} {...rest}>
      {children}
    </Component>
  );
}
