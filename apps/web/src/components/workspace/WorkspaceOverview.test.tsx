import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { WorkspaceOverview } from "./WorkspaceOverview";

describe("WorkspaceOverview", () => {
  it("shows proposal spine, section statuses, and dynamic asset counts", () => {
    render(<WorkspaceOverview proposal={starterProposal} />);

    expect(
      screen.getByRole("heading", {
        name: /secure ai-ready network transformation/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/one cisco story/i)).toBeInTheDocument();
    expect(screen.getByText(/3 sections/i)).toBeInTheDocument();
    expect(screen.getByText(/2 assets/i)).toBeInTheDocument();
    expect(screen.getByText(/^1 needs review$/i)).toBeInTheDocument();
  });
});
