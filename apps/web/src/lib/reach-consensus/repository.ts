import { starterProposal } from "./fixtures";
import type { AnalyticsEvent, ChangeRequest, Proposal, ProposalComment, PublishedProposalVersion } from "./types";

export type ProposalRepository = {
  listProposals(): Promise<Proposal[]>;
  getProposal(proposalId: string): Promise<Proposal | undefined>;
  getProposalBySlug(slug: string): Promise<Proposal | undefined>;
  saveProposal(proposal: Proposal): Promise<Proposal>;
  publishProposal(proposalId: string, publishedBy: string): Promise<PublishedProposalVersion>;
  addComment(proposalId: string, comment: ProposalComment): Promise<ProposalComment>;
  addChangeRequest(proposalId: string, request: ChangeRequest): Promise<ChangeRequest>;
  recordAnalyticsEvent(event: AnalyticsEvent): Promise<AnalyticsEvent>;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createFixtureRepository(initialProposal: Proposal = starterProposal): ProposalRepository {
  const proposals = new Map<string, Proposal>([[initialProposal.id, clone(initialProposal)]]);

  return {
    async listProposals() {
      return Array.from(proposals.values()).map(clone);
    },
    async getProposal(proposalId) {
      const proposal = proposals.get(proposalId);
      return proposal ? clone(proposal) : undefined;
    },
    async getProposalBySlug(slug) {
      const proposal = Array.from(proposals.values()).find((item) => item.slug === slug);
      return proposal ? clone(proposal) : undefined;
    },
    async saveProposal(proposal) {
      proposals.set(proposal.id, clone(proposal));
      return clone(proposal);
    },
    async publishProposal(proposalId, publishedBy) {
      const proposal = proposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }

      const publishableSections = proposal.sections
        .filter((section) => section.status === "approved" || section.status === "published")
        .map((section) => clone({ ...section, status: "published" as const }));

      const version: PublishedProposalVersion = {
        id: `version_${proposal.publishedVersions.length + 1}`,
        proposalId,
        versionNumber: proposal.publishedVersions.length + 1,
        publishedAt: new Date().toISOString(),
        publishedBy,
        sections: publishableSections,
      };

      proposal.sections = proposal.sections.map((section) =>
        publishableSections.some((published) => published.id === section.id)
          ? { ...section, status: "published" }
          : section,
      );
      proposal.publishedVersions.push(version);
      proposals.set(proposalId, clone(proposal));
      return clone(version);
    },
    async addComment(proposalId, comment) {
      const proposal = proposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }
      proposal.comments.push(comment);
      proposals.set(proposalId, clone(proposal));
      return clone(comment);
    },
    async addChangeRequest(proposalId, request) {
      const proposal = proposals.get(proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }
      proposal.changeRequests.push(request);
      proposals.set(proposalId, clone(proposal));
      return clone(request);
    },
    async recordAnalyticsEvent(event) {
      const proposal = proposals.get(event.proposalId);
      if (!proposal) {
        throw new Error(`Proposal not found: ${event.proposalId}`);
      }
      proposal.analyticsEvents.push(event);
      proposals.set(event.proposalId, clone(proposal));
      return clone(event);
    },
  };
}

export const proposalRepository = createFixtureRepository();
