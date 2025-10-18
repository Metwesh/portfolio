import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders footer with links", () => {
    render(<Footer />);

    expect(screen.getByText(/Resume/i)).toBeInTheDocument();
    expect(screen.getByText(/Linkedin/i)).toBeInTheDocument();
    expect(screen.getByText(/Github/i)).toBeInTheDocument();
  });

  it("renders current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(currentYear.toString())),
    ).toBeInTheDocument();
  });

  it("has correct link hrefs", () => {
    render(<Footer />);

    const linkedinLink = screen.getByText(/Linkedin/i).closest("a");
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/mohamed-h-aly/",
    );

    const githubLink = screen.getByText(/Github/i).closest("a");
    expect(githubLink).toHaveAttribute("href", "https://github.com/metwesh");
  });
});
