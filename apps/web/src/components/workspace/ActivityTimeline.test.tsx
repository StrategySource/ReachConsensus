import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
