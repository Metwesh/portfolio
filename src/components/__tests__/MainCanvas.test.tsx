import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainCanvas } from "../MainCanvas";

// Mock @react-three/fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ onCreated }: { onCreated?: (state: object) => void }) => {
    if (onCreated) {
      setTimeout(() => onCreated({}), 0);
    }
    return <div data-testid="mock-canvas" />;
  },
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { x: 0, y: 0, z: 10 } },
    clock: { getElapsedTime: () => 0 },
  }),
}));

// Mock @react-three/drei
vi.mock("@react-three/drei", () => ({
  PerspectiveCamera: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-camera">{children}</div>
  ),
  Float: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-float">{children}</div>
  ),
  Stars: () => <div data-testid="mock-stars" />,
  Environment: () => <div data-testid="mock-environment" />,
  useGLTF: () => ({
    scene: {
      rotation: { set: vi.fn() },
      traverse: vi.fn(),
    },
  }),
}));

describe("MainCanvas", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(<MainCanvas scrollY={0} />);
    expect(getByTestId("mock-canvas")).toBeInTheDocument();
  });

  it("calls onReady callback when canvas is created", async () => {
    const onReady = vi.fn();
    render(<MainCanvas scrollY={0} onReady={onReady} />);

    // Wait for setTimeout in onCreated
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(onReady).toHaveBeenCalled();
  });

  it("accepts scrollY prop", () => {
    const { rerender } = render(<MainCanvas scrollY={0} />);
    expect(() => rerender(<MainCanvas scrollY={100} />)).not.toThrow();
  });

  it("renders with Suspense fallback", () => {
    const { container } = render(<MainCanvas scrollY={0} />);
    expect(container).toBeInTheDocument();
  });
});
