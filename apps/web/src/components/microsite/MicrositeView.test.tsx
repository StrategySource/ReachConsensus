import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import type { PublishedProposalSnapshot } from "@/lib/reach-consensus/types";
import { MicrositeView } from "./MicrositeView";

describe("MicrositeView", () => {
  it("renders the immutable published microsite snapshot", () => {
    const publishedSnapshot: PublishedProposalSnapshot = {
      id: starterProposal.id,
      slug: starterProposal.slug,
      customerName: starterProposal.customerName,
      title: "Published customer title",
      oneCiscoStory: "Published One Cisco story.",
      sections: starterProposal.sections
        .filter((section) => section.slug !== "services")
        .map((section) => ({ ...section, status: "published" as const })),
    };

    render(<MicrositeView proposal={publishedSnapshot} />);

    expect(
      screen.getByRole("heading", {
        name: "Acme Health: Published customer title",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Published One Cisco story.")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Executive Summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platform Story" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Services" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /compounding platform value/i }),
    ).toBeInTheDocument();
  });
});
