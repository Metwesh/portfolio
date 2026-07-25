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
    const handleResize = debounce(
      () => setIsMobile(window.innerWidth < BREAKPOINTS.mobile),
      150,
    );
    window.addEventListener("resize", handleResize, {
      signal: controller.signal,
    });
    return () => {
      controller.abort();
      // AbortController only removes the listener — a resize fired just
      // before unmount can still have a pending debounce timeout in
      // flight, which would call setIsMobile after unmount.
      handleResize.cancel();
    };
  }, []);

  return isMobile;
}
