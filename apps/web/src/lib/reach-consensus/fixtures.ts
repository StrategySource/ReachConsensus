import type { Proposal } from "./types";

export const starterProposal: Proposal = {
  id: "proposal_acme",
  slug: "acme-health-ai-ready-network",
  customerName: "Acme Health",
  title: "Secure AI-Ready Network Transformation",
  opportunitySummary:
    "Acme Health wants to modernize network, security, and operations capabilities before expanding AI-enabled clinical workflows.",
  oneCiscoStory:
    "Cisco Secure Access, modern networking, observability, services, licensing, and operational readiness combine into a platform architecture that lowers delivery risk and accelerates value.",
  members: [
    { id: "m_ae", name: "Dana Roberts", organization: "Cisco", role: "workspace_owner" },
    { id: "m_se", name: "Jordan Lee", organization: "Cisco", role: "cisco_contributor" },
    { id: "m_partner", name: "Casey Morgan", organization: "PartnerCo", role: "partner_contributor" },
    { id: "m_customer", name: "Riley Chen", organization: "Acme Health", role: "customer_commenter" },
  ],
  assets: [
    {
      id: "asset_arch",
      name: "Current-state network diagram.pdf",
      fileType: "pdf",
      visibility: "source_material",
      digestStatus: "digested",
      customerDownloadEnabled: false,
    },
    {
      id: "asset_bom",
      name: "Approved bill of materials.xlsx",
      fileType: "spreadsheet",
      visibility: "published_asset",
      digestStatus: "digested",
      customerDownloadEnabled: true,
    },
  ],
  sections: [
    {
      id: "section_exec",
      title: "Executive Summary",
      slug: "executive-summary",
      status: "approved",
      ownerName: "Dana Roberts",
      summary: "CIO-level case for transformation.",
      blocks: [
        {
          id: "block_exec_story",
          type: "narrative",
          title: "Why now",
          body: "Acme Health can reduce operational risk and create an AI-ready foundation by aligning network, security, and operations around one Cisco architecture.",
          sourceAssetIds: ["asset_arch"],
        },
      ],
    },
    {
      id: "section_platform",
      title: "Platform Story",
      slug: "platform-story",
      status: "approved",
      ownerName: "Jordan Lee",
      summary: "One Cisco platform spine.",
      blocks: [
        {
          id: "block_platform_formula",
          type: "infographic",
          title: "1+1=3 platform value",
          body: "Secure access plus modern networking plus operations visibility creates compounding platform value.",
          sourceAssetIds: ["asset_arch", "asset_bom"],
        },
      ],
    },
    {
      id: "section_services",
      title: "Services",
      slug: "services",
      status: "needs_review",
      ownerName: "Casey Morgan",
      summary: "Cisco recommended value delivery path.",
      blocks: [
        {
          id: "block_services_map",
          type: "services_map",
          title: "Delivery responsibility map",
          body: "Cisco Advanced Services owns design validation, PartnerCo owns advanced configuration, the traditional partner owns rack and stack, and Acme Health owns stakeholder readiness.",
          sourceAssetIds: [],
        },
      ],
    },
  ],
  comments: [],
  changeRequests: [],
  analyticsEvents: [],
  publishedVersions: [],
};
