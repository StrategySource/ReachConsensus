import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { SetupChecklist } from "./SetupChecklist";

describe("SetupChecklist", () => {
  it("shows configurable sections and invited parties", () => {
    render(<SetupChecklist proposal={starterProposal} />);

    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Platform Story")).toBeInTheDocument();
    expect(screen.getByText("Dana Roberts")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("Casey Morgan")).toBeInTheDocument();
    expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    expect(screen.getAllByText("Cisco")).toHaveLength(2);
    expect(screen.getByText("PartnerCo")).toBeInTheDocument();
    expect(screen.getByText("Acme Health")).toBeInTheDocument();
  });
});
