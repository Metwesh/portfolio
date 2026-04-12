import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Header } from "../Header";

describe("Header", () => {
  beforeEach(() => {
    // Reset body overflow style before each test
    document.body.style.overflow = "";
  });

  it("renders logo and name", () => {
    render(<Header scrollY={0} />);

    expect(screen.getAllByText(/mohamed h. aly/i).length).toBeGreaterThan(0);
  });

  it("renders navigation links on desktop", () => {
    render(<Header scrollY={0} />);

    // Desktop nav should have all links (multiple instances exist for mobile/desktop)
    expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Experience").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tech Stacks").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Certificates").length).toBeGreaterThan(0);
  });

  it("shows background when scrolled", () => {
    const { container, rerender } = render(<Header scrollY={0} />);

    // Initial: no background
    const header = container.querySelector("header");
    expect(header?.className).toContain("bg-black/10");

    // After scroll threshold
    rerender(<Header scrollY={100} />);
    expect(header?.className).toContain("bg-black/30");
  });

  it("opens mobile menu when hamburger is clicked", async () => {
    const user = userEvent.setup();
    render(<Header scrollY={0} />);

    const hamburger = screen.getByLabelText(/open menu/i);
    await user.click(hamburger);

    // Check if menu button label changed
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();

    // Check if body overflow is hidden
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("has proper aria attributes on menu button", () => {
    render(<Header scrollY={0} />);

    const menuButton = screen.getByLabelText(/open menu/i);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
