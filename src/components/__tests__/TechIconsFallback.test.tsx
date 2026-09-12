import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TECHNOLOGIES } from "../../constants/technologies";
import { TechIconsFallback } from "../TechIconsFallback";

describe("TechIconsFallback", () => {
  it("renders every technology's name", () => {
    render(<TechIconsFallback />);

    for (const tech of TECHNOLOGIES) {
      expect(screen.getByText(tech.name)).toBeInTheDocument();
    }
  });

  it("marks work-in-progress technologies with a WIP badge", () => {
    render(<TechIconsFallback />);

    const wipCount = TECHNOLOGIES.filter((t) => t.wip).length;
    expect(screen.getAllByText("WIP")).toHaveLength(wipCount);
  });
});
