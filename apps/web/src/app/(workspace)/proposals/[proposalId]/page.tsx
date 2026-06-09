import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/workspace/ActivityTimeline";
import { AppFrame } from "@/components/workspace/AppFrame";
import { FeedbackPanel } from "@/components/workspace/FeedbackPanel";
import { WorkspaceOverview } from "@/components/workspace/WorkspaceOverview";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function ProposalWorkspacePage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const proposal = await proposalRepository.getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  return (
    <AppFrame>
      <div className="grid gap-6">
        <WorkspaceOverview proposal={proposal} />
        <FeedbackPanel proposal={proposal} />
        <ActivityTimeline events={proposal.analyticsEvents} />
      </div>
    </AppFrame>
  );
}
