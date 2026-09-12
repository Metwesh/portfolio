import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PROJECTS } from "../../constants/projects";
import { ProjectCardsFallback } from "../ProjectCardsFallback";

describe("ProjectCardsFallback", () => {
  it("renders every project's name and description", () => {
    render(<ProjectCardsFallback />);

    for (const project of PROJECTS) {
      expect(screen.getByText(project.name)).toBeInTheDocument();
      expect(screen.getByText(project.description)).toBeInTheDocument();
    }
  });

  it("links the Visit button to each project's link", () => {
    render(<ProjectCardsFallback />);

    for (const project of PROJECTS.filter((p) => p.link)) {
      const heading = screen.getByText(project.name);
      const card = heading.closest("article");
      const visitLink = card?.querySelector("a[href]");
      expect(visitLink).toHaveAttribute("href", project.link);
    }
  });
});
