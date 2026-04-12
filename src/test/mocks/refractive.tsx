/**
 * Lightweight test double for @hashintel/refractive.
 * Replaces each `refractive.<tag>` with a plain HTML element component
 * that passes through all props except `refraction` (visual-only).
 */
import React from "react";

type RefractiveProps = React.HTMLAttributes<HTMLElement> & {
  refraction?: unknown;
};

function makeTag(tag: string) {
  const Component = React.forwardRef<HTMLElement, RefractiveProps>(
    ({ children, refraction: _r, ...props }, ref) =>
      React.createElement(tag, { ...props, ref }, children),
  );
  Component.displayName = `refractive.${tag}`;
  return Component;
}

export const refractive = new Proxy(
  {} as Record<string, ReturnType<typeof makeTag>>,
  {
    get(cache, tag: string) {
      if (!cache[tag]) cache[tag] = makeTag(tag);
      return cache[tag];
    },
  },
);
