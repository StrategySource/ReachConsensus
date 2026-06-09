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
    expect(published.sections.map((section) => section.id)).toEqual(["section_exec", "section_platform"]);
    expect(published.sections.map((section) => section.id)).not.toContain("section_services");

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal?.publishedVersions).toHaveLength(1);
    expect(proposal?.sections.find((section) => section.id === "section_exec")?.status).toBe("published");
    expect(proposal?.sections.find((section) => section.id === "section_platform")?.status).toBe("published");
    expect(proposal?.sections.find((section) => section.id === "section_services")?.status).toBe("needs_review");
  });

  it("rejects publishing a missing proposal", async () => {
    const repo = createFixtureRepository();

    await expect(repo.publishProposal("missing", "Dana Roberts")).rejects.toThrow(
      "Proposal not found: missing",
    );
  });

  it("keeps published version content unchanged after workspace edits", async () => {
    const repo = createFixtureRepository();
    const published = await repo.publishProposal("proposal_acme", "Dana Roberts");
    const originalBody = published.sections[0].blocks[0].body;

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal).toBeDefined();

    proposal!.sections[0].blocks[0].body = "Updated live workspace copy.";
    await repo.saveProposal(proposal!);

    const updatedProposal = await repo.getProposal("proposal_acme");
    expect(updatedProposal?.sections[0].blocks[0].body).toBe("Updated live workspace copy.");
    expect(updatedProposal?.publishedVersions[0].sections[0].blocks[0].body).toBe(originalBody);
  });
});
