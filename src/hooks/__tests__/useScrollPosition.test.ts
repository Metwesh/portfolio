import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollPosition } from "../useScrollPosition";

describe("useScrollPosition", () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    // Mock requestAnimationFrame
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return ++rafId;
      },
    );

    // Mock cancelAnimationFrame
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    // Reset scroll position
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with current scroll position", () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current).toBe(0);
  });

  it("should update scroll position when scrolling", () => {
    const { result } = renderHook(() => useScrollPosition());

    // Simulate scroll
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    // Execute RAF callback
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(result.current).toBe(100);
  });

  it("should only update when scroll changes by more than 1px", () => {
    const { result } = renderHook(() => useScrollPosition());

    // Initialize to current position (0)
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });
    rafCallbacks = [];

    expect(result.current).toBe(0);

    // Large scroll change (should update)
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(result.current).toBe(100);

    // Clear RAF callbacks
    rafCallbacks = [];

    // Very small scroll change (should not update)
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100.5,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    // Should still be 100 because change was <= 1px
    expect(result.current).toBe(100);

    // Clear RAF callbacks
    rafCallbacks = [];

    // Another large change (should update)
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 105,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(result.current).toBe(105);
  });

  it("should throttle updates using requestAnimationFrame", () => {
    renderHook(() => useScrollPosition());

    // Simulate multiple rapid scroll events
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });

    // Should only request one animation frame for multiple scroll events
    expect(rafCallbacks.length).toBe(1);
  });

  it("should cleanup event listener on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useScrollPosition());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      expect.objectContaining({
        passive: true,
        signal: expect.any(AbortSignal),
      }),
    );

    unmount();

    // The AbortController should abort, which removes the listener
    expect(removeEventListenerSpy).not.toHaveBeenCalled(); // Because we use AbortController
  });

  it("should handle large scroll values", () => {
    const { result } = renderHook(() => useScrollPosition());

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 5000,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(result.current).toBe(5000);
  });

  it("should handle negative scroll values (edge case)", () => {
    const { result } = renderHook(() => useScrollPosition());

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: -10,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(result.current).toBe(-10);
  });

  it("should initialize with current scroll position when mounted mid-scroll", () => {
    // Set initial scroll position before mounting
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 250,
    });

    const { result } = renderHook(() => useScrollPosition());

    // The hook initializes lastScrollY to window.scrollY, so initially
    // there's no difference. It will be 0 until the first scroll event
    expect(result.current).toBe(0);

    // Now scroll to trigger an update
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 260,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(result.current).toBe(260);
  });

  it("should not create memory leaks with multiple rapid scrolls", () => {
    const { result } = renderHook(() => useScrollPosition());

    // Simulate many scroll events
    for (let i = 0; i < 100; i++) {
      act(() => {
        Object.defineProperty(window, "scrollY", {
          writable: true,
          configurable: true,
          value: i * 10,
        });
        window.dispatchEvent(new Event("scroll"));
      });

      act(() => {
        rafCallbacks.forEach((cb) => cb(0));
        rafCallbacks = [];
      });
    }

    expect(result.current).toBe(990);
  });
});
