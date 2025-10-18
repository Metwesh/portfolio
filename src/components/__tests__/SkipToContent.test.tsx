import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipToContent } from "../SkipToContent";

describe("SkipToContent", () => {
  it("renders skip to content link", () => {
    render(<SkipToContent />);

    const link = screen.getByText(/skip to main content/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("has proper accessibility classes", () => {
    render(<SkipToContent />);

    const link = screen.getByText(/skip to main content/i);
    expect(link).toHaveClass("sr-only");
  });
});
