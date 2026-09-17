import { useRef } from "react";

/**
 * Like `useRef(expr)`, but `expr` only runs once. A plain `useRef(expr)`
 * re-evaluates `expr` on every render even though only the first render's
 * result is ever kept in `.current` — wasteful when `expr` allocates (`new
 * Vector3()`, `Array.from(...)`, etc.). Mirrors `useState(() => expr)`'s
 * lazy initializer, but keeps ref semantics (mutate `.current`, no
 * re-render on write).
 */
export function useLazyRef<T>(factory: () => T): React.RefObject<T> {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = factory();
  return ref as React.RefObject<T>;
}
