import type { ContentBlock, Proposal } from "./types";

export function draftOneCiscoNarrative(proposal: Proposal): ContentBlock {
  const digestedAssetIds = proposal.assets
    .filter((asset) => asset.digestStatus === "digested")
    .map((asset) => asset.id);

  return {
    id: `draft_${proposal.id}_one_cisco`,
    type: "narrative",
    title: "One Cisco platform narrative",
    body:
      `${proposal.customerName} can use ${proposal.title} to move from disconnected initiatives to an integrated Cisco platform. ` +
      `${proposal.oneCiscoStory} This draft is based on digested proposal assets and should be reviewed by the Cisco section owner before publishing.`,
    sourceAssetIds: digestedAssetIds,
  };
}
