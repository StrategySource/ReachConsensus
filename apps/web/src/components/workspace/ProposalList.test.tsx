import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { ProposalList } from "./ProposalList";

describe("ProposalList", () => {
  it("links each proposal to workspace, guided setup, and customer microsite routes", () => {
    render(<ProposalList proposals={[starterProposal]} />);

    expect(
      screen.getByRole("link", {
        name: /secure ai-ready network transformation/i,
      }),
    ).toHaveAttribute("href", "/proposals/proposal_acme");
    expect(screen.getByRole("link", { name: "Guided setup" })).toHaveAttribute(
      "href",
      "/proposals/proposal_acme/setup",
    );
    expect(screen.getByRole("link", { name: "Customer microsite" })).toHaveAttribute(
      "href",
      "/p/acme-health-ai-ready-network",
    );
  });
});
