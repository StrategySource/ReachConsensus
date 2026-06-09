import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { publishedStarterProposal, starterProposal } from "@/lib/reach-consensus/fixtures";
import { ProposalList } from "./ProposalList";

describe("ProposalList", () => {
  it("links each proposal to workspace, guided setup, and customer microsite routes", () => {
    render(<ProposalList proposals={[publishedStarterProposal]} />);

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

  it("does not link unpublished proposals to a customer route", () => {
    render(<ProposalList proposals={[starterProposal]} />);

    expect(screen.queryByRole("link", { name: "Customer microsite" })).not.toBeInTheDocument();
    expect(screen.getByText("Publish before customer view")).toBeInTheDocument();
  });

  it("uses the latest published slug instead of the mutable workspace slug", () => {
    render(
      <ProposalList
        proposals={[
          {
            ...publishedStarterProposal,
            slug: "updated-live-workspace-slug",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Customer microsite" })).toHaveAttribute(
      "href",
      "/p/acme-health-ai-ready-network",
    );
  });
});
