import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface OdometerHandle {
  setValue: (value: number) => void;
}

interface OdometerProps {
  digits: number;
  initialValue?: number;
  className?: string;
}

// Row height in em — must match the line-height applied to each digit cell.
const ROW_EM = 1.2;
// Strip = [dup "9", "0"..."9", dup "0"] so the wrap edges (9→0 and 0→9)
// can animate straight through instead of spinning the wrong way.
const STRIP = ["9", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const REST_INDEX = (d: number) => d + 1;

export const Odometer = forwardRef<OdometerHandle, OdometerProps>(
  function Odometer({ digits, initialValue = 0, className }, ref) {
    const prefersReducedMotion = useReducedMotion();
    const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
    const currentDigits = useRef<number[]>([]);

    const initialStr = useMemo(
      () => String(Math.max(0, initialValue)).padStart(digits, "0"),
      [initialValue, digits],
    );

    if (currentDigits.current.length !== digits) {
      currentDigits.current = initialStr.split("").map(Number);
    }

    useImperativeHandle(ref, () => ({
      setValue(value: number) {
        const str = String(Math.max(0, value)).padStart(digits, "0");
        for (let i = 0; i < digits; i++) {
          const nextDigit = Number(str[i]);
          const prevDigit = currentDigits.current[i];
          if (nextDigit === prevDigit) continue;
          currentDigits.current[i] = nextDigit;

          const col = columnRefs.current[i];
          if (!col) continue;

          if (prefersReducedMotion) {
            col.style.transition = "none";
            col.style.transform = `translateY(-${REST_INDEX(nextDigit) * ROW_EM}em)`;
            continue;
          }

          const isForwardWrap = prevDigit === 9 && nextDigit === 0;
          const isBackwardWrap = prevDigit === 0 && nextDigit === 9;

          if (isForwardWrap || isBackwardWrap) {
            const dupIndex = isForwardWrap ? STRIP.length - 1 : 0;
            col.style.transition =
              "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            col.style.transform = `translateY(-${dupIndex * ROW_EM}em)`;

            const handleTransitionEnd = () => {
              col.style.transition = "none";
              col.style.transform = `translateY(-${REST_INDEX(nextDigit) * ROW_EM}em)`;
              // Force reflow so the transition is re-armed before it's restored.
              void col.offsetHeight;
              col.style.transition =
                "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            };
            col.addEventListener("transitionend", handleTransitionEnd, {
              once: true,
            });
          } else {
            col.style.transition =
              "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            col.style.transform = `translateY(-${REST_INDEX(nextDigit) * ROW_EM}em)`;
          }
        }
      },
    }));

    return (
      <span className={className} style={{ display: "inline-flex" }}>
        {Array.from({ length: digits }).map((_, index) => (
          <span
            key={`digit-${index}`}
            style={{
              display: "inline-block",
              height: `${ROW_EM}em`,
              lineHeight: `${ROW_EM}em`,
              overflow: "hidden",
            }}
          >
            <div
              ref={(el) => {
                columnRefs.current[index] = el;
              }}
              style={{
                transform: `translateY(-${REST_INDEX(currentDigits.current[index]) * ROW_EM}em)`,
              }}
            >
              {STRIP.map((d, rowIndex) => (
                <div key={`row-${rowIndex}`} style={{ height: `${ROW_EM}em` }}>
                  {d}
                </div>
              ))}
            </div>
          </span>
        ))}
      </span>
    );
  },
);
