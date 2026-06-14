import { describe, expect, it } from "vitest";
import { starterProposal } from "./fixtures";
import { publishableSections, sectionCanPublish } from "./publish-service";

describe("publish-service", () => {
  it("allows only approved or already published sections to publish", () => {
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "approved" })).toBe(true);
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "published" })).toBe(true);
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "needs_review" })).toBe(false);
    expect(sectionCanPublish({ ...starterProposal.sections[0], status: "draft" })).toBe(false);
  });

  it("returns only publishable sections", () => {
    expect(publishableSections(starterProposal.sections).map((section) => section.slug)).toEqual([
      "executive-summary",
      "platform-story",
    ]);
  });
});
