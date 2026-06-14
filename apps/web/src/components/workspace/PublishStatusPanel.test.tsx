import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { publishedStarterProposal, starterProposal } from "@/lib/reach-consensus/fixtures";
import { PublishStatusPanel } from "./PublishStatusPanel";

describe("PublishStatusPanel", () => {
  it("shows the latest published customer snapshot and microsite link", () => {
    render(<PublishStatusPanel proposal={publishedStarterProposal} />);

    expect(screen.getByRole("heading", { name: /customer visibility/i })).toBeInTheDocument();
    expect(screen.getByText("Published customer view")).toBeInTheDocument();
    expect(screen.getByText(/version 1/i)).toBeInTheDocument();
    expect(screen.getByText(/published by dana roberts/i)).toBeInTheDocument();
    expect(screen.getByText("2 visible sections")).toBeInTheDocument();
    expect(screen.getByText("2 ready to publish")).toBeInTheDocument();
    expect(screen.getByText("1 needs attention")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open customer microsite" })).toHaveAttribute(
      "href",
      "/p/acme-health-ai-ready-network",
    );
  });

  it("keeps unpublished proposals internal until a version is published", () => {
    render(<PublishStatusPanel proposal={starterProposal} />);

    expect(screen.getByText("Not customer-visible yet")).toBeInTheDocument();
    expect(screen.getByText("Publish before customer view")).toBeInTheDocument();
    expect(screen.getByText("2 ready to publish")).toBeInTheDocument();
    expect(screen.getByText("1 needs attention")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open customer microsite" })).not.toBeInTheDocument();
  });
});
