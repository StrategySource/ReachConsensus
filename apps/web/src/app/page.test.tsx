import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the Reach Consensus entry page", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Reach Consensus" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
