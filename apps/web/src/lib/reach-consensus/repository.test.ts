import { describe, expect, it } from "vitest";
import { starterProposal } from "./fixtures";
import { createFixtureRepository } from "./repository";

describe("fixture repository", () => {
  it("loads the starter proposal by slug", async () => {
    const repo = createFixtureRepository();
    const proposal = await repo.getProposalBySlug("acme-health-ai-ready-network");

    expect(proposal?.customerName).toBe("Acme Health");
    expect(proposal?.sections.map((section) => section.slug)).toContain("platform-story");
  });

  it("returns no published snapshot before a proposal is published", async () => {
    const repo = createFixtureRepository();

    await expect(repo.getPublishedProposalBySlug(starterProposal.slug)).resolves.toBeUndefined();
  });

  it("publishes a full customer-facing snapshot with only customer-visible sections", async () => {
    const repo = createFixtureRepository();
    const published = await repo.publishProposal("proposal_acme", "Dana Roberts");

    expect(published.versionNumber).toBe(1);
    expect(published.snapshot).toMatchObject({
      id: "proposal_acme",
      slug: "acme-health-ai-ready-network",
      customerName: "Acme Health",
      title: "Secure AI-Ready Network Transformation",
      oneCiscoStory:
        "Cisco Secure Access, modern networking, observability, services, licensing, and operational readiness combine into a platform architecture that lowers delivery risk and accelerates value.",
    });
    expect(published.snapshot.sections.every((section) => section.status === "published")).toBe(true);
    expect(published.snapshot.sections.map((section) => section.id)).toEqual([
      "section_exec",
      "section_platform",
    ]);
    expect(published.snapshot.sections.map((section) => section.id)).not.toContain("section_services");

    await expect(repo.getPublishedProposalBySlug(starterProposal.slug)).resolves.toEqual(
      published.snapshot,
    );

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

  it("returns the latest published snapshot for a slug", async () => {
    const repo = createFixtureRepository();
    await repo.publishProposal("proposal_acme", "Dana Roberts");

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal).toBeDefined();

    proposal!.title = "Second published title";
    proposal!.oneCiscoStory = "Second published One Cisco story.";
    proposal!.sections[0].summary = "Second published summary.";
    await repo.saveProposal(proposal!);

    const secondVersion = await repo.publishProposal("proposal_acme", "Dana Roberts");

    expect(secondVersion.versionNumber).toBe(2);
    await expect(repo.getPublishedProposalBySlug(starterProposal.slug)).resolves.toEqual(
      secondVersion.snapshot,
    );
  });

  it("keeps published microsite snapshot content unchanged after workspace edits", async () => {
    const repo = createFixtureRepository();
    const published = await repo.publishProposal("proposal_acme", "Dana Roberts");
    const originalSnapshot = published.snapshot;

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal).toBeDefined();

    proposal!.title = "Updated live workspace title";
    proposal!.oneCiscoStory = "Updated live workspace story.";
    proposal!.sections[0].title = "Updated live workspace section";
    proposal!.sections[0].blocks[0].body = "Updated live workspace copy.";
    await repo.saveProposal(proposal!);

    const updatedProposal = await repo.getProposal("proposal_acme");
    const publishedSnapshot = await repo.getPublishedProposalBySlug(starterProposal.slug);

    expect(updatedProposal?.title).toBe("Updated live workspace title");
    expect(updatedProposal?.oneCiscoStory).toBe("Updated live workspace story.");
    expect(updatedProposal?.sections[0].blocks[0].body).toBe("Updated live workspace copy.");
    expect(publishedSnapshot).toEqual(originalSnapshot);
  });

  it("keeps published snapshots attached to their published slug after live slug edits", async () => {
    const repo = createFixtureRepository();
    const published = await repo.publishProposal("proposal_acme", "Dana Roberts");

    const proposal = await repo.getProposal("proposal_acme");
    expect(proposal).toBeDefined();

    proposal!.slug = "updated-live-workspace-slug";
    await repo.saveProposal(proposal!);

    await expect(repo.getPublishedProposalBySlug(starterProposal.slug)).resolves.toEqual(
      published.snapshot,
    );
    await expect(repo.getPublishedProposalBySlug("updated-live-workspace-slug")).resolves.toBeUndefined();
  });
});
