import { notFound } from "next/navigation";
import { AppFrame } from "@/components/workspace/AppFrame";
import { SetupChecklist } from "@/components/workspace/SetupChecklist";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function ProposalSetupPage({
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
      <SetupChecklist proposal={proposal} />
    </AppFrame>
  );
}
