import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce, throttle } from "../performance";

describe("Performance utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("debounce", () => {
    it("delays function execution", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("cancels previous calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("passes arguments correctly", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("test", 123);
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith("test", 123);
    });
  });

  describe("throttle", () => {
    it("limits function execution rate", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("passes arguments correctly", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn("arg1", "arg2");
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });
});
