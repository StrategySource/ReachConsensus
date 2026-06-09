import { describe, expect, it } from "vitest";
import { starterProposal } from "./fixtures";
import { draftOneCiscoNarrative } from "./ai-draft-service";

describe("draftOneCiscoNarrative", () => {
  it("generates sourced draft language from proposal context and assets", () => {
    const draft = draftOneCiscoNarrative(starterProposal);

    expect(draft.title).toBe("One Cisco platform narrative");
    expect(draft.body).toContain("Acme Health");
    expect(draft.body).toContain("Secure AI-Ready Network Transformation");
    expect(draft.sourceAssetIds).toEqual(["asset_arch", "asset_bom"]);
  });
});
