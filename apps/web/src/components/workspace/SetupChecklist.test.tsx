import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { SetupChecklist } from "./SetupChecklist";

describe("SetupChecklist", () => {
  it("shows configurable sections and invited parties", () => {
    render(<SetupChecklist proposal={starterProposal} />);

    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Platform Story")).toBeInTheDocument();
    expect(screen.getByText("Cisco")).toBeInTheDocument();
    expect(screen.getByText("PartnerCo")).toBeInTheDocument();
    expect(screen.getByText("Acme Health")).toBeInTheDocument();
  });
});
