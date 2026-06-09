import { describe, expect, it } from "vitest";
import { createFixtureRepository } from "./repository";

describe("fixture repository", () => {
  it("loads the starter proposal by slug", async () => {
    const repo = createFixtureRepository();
    const proposal = await repo.getProposalBySlug("acme-health-ai-ready-network");

    expect(proposal?.customerName).toBe("Acme Health");
    expect(proposal?.sections.map((section) => section.slug)).toContain("platform-story");
  });

  it("publishes immutable customer-visible sections", async () => {
    const repo = createFixtureRepository();
    const published = await repo.publishProposal("proposal_acme", "Dana Roberts");

    expect(published.versionNumber).toBe(1);
    expect(published.sections.every((section) => section.status === "published")).toBe(true);

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal?.publishedVersions).toHaveLength(1);
  });
});
