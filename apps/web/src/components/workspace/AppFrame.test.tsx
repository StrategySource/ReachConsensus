import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppFrame } from "./AppFrame";

describe("AppFrame", () => {
  it("lets the workspace header wrap on narrow screens", () => {
    render(<AppFrame>Workspace content</AppFrame>);

    expect(screen.getByTestId("workspace-header-row")).toHaveClass("flex-wrap");
    expect(screen.getByRole("navigation", { name: "Workspace navigation" })).toHaveClass(
      "flex-wrap",
    );
    expect(screen.getByRole("link", { name: /reach consensus/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
