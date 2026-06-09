import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
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
      <WorkspaceOverview proposal={proposal} />
    </AppFrame>
  );
}
