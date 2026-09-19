import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Page from "./page";
import { siteConfig } from "../config/site.config";

describe("landing page", () => {
  it("renders the site name as h1 (sourced from siteConfig, not hardcoded)", () => {
    render(<Page />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(siteConfig.name);
  });
});
