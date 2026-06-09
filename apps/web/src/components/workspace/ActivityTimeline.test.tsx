import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import type { AnalyticsEvent } from "@/lib/reach-consensus/types";
import { ActivityTimeline } from "./ActivityTimeline";

describe("ActivityTimeline", () => {
  it("shows activity labels and actors", () => {
    const events: AnalyticsEvent[] = [
      {
        id: "event_1",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "section_viewed",
        label: "Viewed Executive Summary",
        occurredAt: "2026-06-09T12:00:00.000Z",
      },
    ];

    render(<ActivityTimeline events={events} />);

    expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    expect(screen.getByText("Viewed Executive Summary")).toBeInTheDocument();
  });

  it("renders seeded fixture engagement activity", () => {
    render(<ActivityTimeline events={starterProposal.analyticsEvents} />);

    expect(screen.getByText("Viewed Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Downloaded Approved bill of materials.xlsx")).toBeInTheDocument();
    expect(screen.getByText("file downloaded")).toBeInTheDocument();
  });

  it("formats event types with every underscore replaced", () => {
    const events: AnalyticsEvent[] = [
      {
        id: "event_change_request",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "change_request_created",
        label: "Requested pricing clarification",
        occurredAt: "2026-06-09T12:10:00.000Z",
      },
    ];

    render(<ActivityTimeline events={events} />);

    expect(screen.getByText("change request created")).toBeInTheDocument();
  });
});
