import { describe, expect, it } from "vitest";
import { mapProposalRow } from "./supabase-adapter";

describe("supabase-adapter", () => {
  it("maps proposal rows into proposal summary fields", () => {
    const summary = mapProposalRow({
      id: "proposal_acme",
      slug: "acme-health-ai-ready-network",
      customer_name: "Acme Health",
      title: "Secure AI-Ready Network Transformation",
      opportunity_summary: "Modernization opportunity",
      one_cisco_story: "Integrated platform story",
    });

    expect(summary).toEqual({
      id: "proposal_acme",
      slug: "acme-health-ai-ready-network",
      customerName: "Acme Health",
      title: "Secure AI-Ready Network Transformation",
      opportunitySummary: "Modernization opportunity",
      oneCiscoStory: "Integrated platform story",
    });
  });
});
