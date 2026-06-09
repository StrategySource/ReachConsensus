import { describe, expect, it } from "vitest";
import { summarizeEngagement } from "./analytics-service";

describe("analytics-service", () => {
  it("summarizes named engagement events", () => {
    const summary = summarizeEngagement([
      {
        id: "event_1",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "section_viewed",
        label: "Viewed Executive Summary",
        occurredAt: "2026-06-09T12:00:00.000Z",
      },
      {
        id: "event_2",
        proposalId: "proposal_acme",
        actorName: "Riley Chen",
        type: "file_downloaded",
        label: "Downloaded Approved bill of materials.xlsx",
        occurredAt: "2026-06-09T12:05:00.000Z",
      },
    ]);

    expect(summary.totalEvents).toBe(2);
    expect(summary.uniqueActors).toEqual(["Riley Chen"]);
    expect(summary.downloadCount).toBe(1);
  });
});
