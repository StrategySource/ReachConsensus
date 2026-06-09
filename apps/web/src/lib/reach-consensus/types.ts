export type ProposalRole =
  | "workspace_owner"
  | "cisco_contributor"
  | "partner_contributor"
  | "customer_commenter"
  | "admin";

export type SectionStatus = "draft" | "needs_review" | "approved" | "published";

export type ContentBlockType =
  | "narrative"
  | "embedded_document"
  | "download"
  | "quote_table"
  | "licensing_table"
  | "architecture_visual"
  | "infographic"
  | "services_map"
  | "value_timeline"
  | "risk_callout";

export type AssetVisibility = "source_material" | "published_asset";

export type ChangeRequestStatus = "open" | "in_review" | "resolved";

export type AnalyticsEventType =
  | "proposal_viewed"
  | "section_viewed"
  | "file_downloaded"
  | "comment_created"
  | "change_request_created"
  | "section_approved"
  | "proposal_published";

export type ProposalSection = {
  id: string;
  title: string;
  slug: string;
  status: SectionStatus;
  ownerName: string;
  summary: string;
  blocks: ContentBlock[];
};

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  title: string;
  body: string;
  sourceAssetIds: string[];
};

export type ProposalAsset = {
  id: string;
  name: string;
  fileType: string;
  visibility: AssetVisibility;
  digestStatus: "queued" | "digested" | "manual_review";
  customerDownloadEnabled: boolean;
};

export type ProposalMember = {
  id: string;
  name: string;
  organization: string;
  role: ProposalRole;
};

export type ProposalComment = {
  id: string;
  sectionId: string;
  blockId?: string;
  authorName: string;
  authorRole: ProposalRole;
  body: string;
  createdAt: string;
};

export type ChangeRequest = {
  id: string;
  sectionId: string;
  title: string;
  body: string;
  ownerName: string;
  status: ChangeRequestStatus;
  dueDate: string;
};

export type AnalyticsEvent = {
  id: string;
  proposalId: string;
  actorName: string;
  type: AnalyticsEventType;
  label: string;
  occurredAt: string;
};

export type PublishedProposalSnapshot = {
  id: string;
  slug: string;
  customerName: string;
  title: string;
  oneCiscoStory: string;
  sections: ProposalSection[];
};

export type PublishedProposalVersion = {
  id: string;
  proposalId: string;
  versionNumber: number;
  publishedAt: string;
  publishedBy: string;
  snapshot: PublishedProposalSnapshot;
};

export type Proposal = {
  id: string;
  slug: string;
  customerName: string;
  title: string;
  opportunitySummary: string;
  oneCiscoStory: string;
  members: ProposalMember[];
  assets: ProposalAsset[];
  sections: ProposalSection[];
  comments: ProposalComment[];
  changeRequests: ChangeRequest[];
  analyticsEvents: AnalyticsEvent[];
  publishedVersions: PublishedProposalVersion[];
};

export type SectionLike = Pick<ProposalSection, "id" | "title" | "status">;

export function isPublishedSection(section: SectionLike) {
  return section.status === "published";
}

export function visibleSectionsForCustomer<T extends SectionLike>(sections: T[]) {
  return sections.filter(isPublishedSection);
}
