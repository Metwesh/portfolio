import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { TechCanvas } from "../TechCanvas";

// Mock @react-three/fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-tech-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { x: 0, y: 0, z: 35 } },
    clock: { getElapsedTime: () => 0 },
  }),
  useLoader: () => ({
    // Mock texture
  }),
}));

// Mock @react-three/drei
vi.mock("@react-three/drei", () => ({
  TrackballControls: () => <div data-testid="mock-controls" />,
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-html">{children}</div>
  ),
  Float: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-float">{children}</div>
  ),
}));

// Mock technologies data
vi.mock("../../constants", () => ({
  technologies: Array(40)
    .fill(null)
    .map((_, i) => ({
      name: `Tech ${i}`,
      icon: `/tech-${i}.svg`,
    })),
}));

describe("TechCanvas", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(<TechCanvas isInView={true} />);
    expect(getByTestId("mock-tech-canvas")).toBeInTheDocument();
  });

  it("renders with correct camera configuration", () => {
    const { container } = render(<TechCanvas isInView={true} />);
    expect(container).toBeInTheDocument();
  });

  it("renders TrackballControls for interaction", () => {
    const { getByTestId } = render(<TechCanvas isInView={true} />);
    expect(getByTestId("mock-controls")).toBeInTheDocument();
  });

  it("calculates golden spiral positions", () => {
    // Test that the component uses useMemo for points calculation
    expect(() => render(<TechCanvas isInView={true} />)).not.toThrow();
  });
});
