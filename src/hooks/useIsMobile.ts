import { useEffect, useState } from "react";
import { BREAKPOINTS } from "../constants/misc";
import { debounce } from "../utils/performance";

/** Returns true when the viewport width is below the mobile breakpoint, and updates on resize. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < BREAKPOINTS.mobile,
  );

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "resize",
      debounce(() => setIsMobile(window.innerWidth < BREAKPOINTS.mobile), 150),
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  return isMobile;
}
