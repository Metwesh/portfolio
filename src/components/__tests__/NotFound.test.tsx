import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotFound } from "../NotFound";

describe("NotFound", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders not found message", () => {
    render(<NotFound />);

    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("has home link", () => {
    render(<NotFound />);

    const homeLink = screen.getByText(/go home/i);
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "#");
  });
});
