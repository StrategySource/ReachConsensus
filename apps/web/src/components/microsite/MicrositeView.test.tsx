import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { MicrositeView } from "./MicrositeView";

describe("MicrositeView", () => {
  it("renders only customer-visible published sections", () => {
    const publishedProposal = {
      ...starterProposal,
      sections: starterProposal.sections.map((section) =>
        section.slug === "services" ? section : { ...section, status: "published" as const },
      ),
    };

    render(<MicrositeView proposal={publishedProposal} />);

    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Platform Story")).toBeInTheDocument();
    expect(screen.queryByText("Services")).not.toBeInTheDocument();
    expect(screen.getByText(/compounding platform value/i)).toBeInTheDocument();
  });
});
