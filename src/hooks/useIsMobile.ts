import { useEffect, useState } from "react";
import { breakpoints } from "../constants";

/** Returns true when the viewport width is below the mobile breakpoint, and updates on resize. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoints.mobile,
  );

  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      "resize",
      () => setIsMobile(window.innerWidth < breakpoints.mobile),
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  return isMobile;
}
