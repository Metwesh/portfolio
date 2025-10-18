import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "../LoadingScreen";

describe("LoadingScreen", () => {
  it("renders loading text", () => {
    render(<LoadingScreen />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("has proper fixed positioning", () => {
    const { container } = render(<LoadingScreen />);

    const loadingDiv = container.firstChild as HTMLElement;
    expect(loadingDiv).toHaveClass("fixed");
    expect(loadingDiv).toHaveClass("inset-0");
  });
});
