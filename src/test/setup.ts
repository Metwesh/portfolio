import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
// biome-ignore lint/suspicious/noExplicitAny: Testing purposes
(globalThis as any).IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
// biome-ignore lint/suspicious/noExplicitAny: Testing purposes
(globalThis as any).ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};
