import { AppFrame } from "@/components/workspace/AppFrame";
import { ProposalList } from "@/components/workspace/ProposalList";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function DashboardPage() {
  const proposals = await proposalRepository.listProposals();

  return (
    <AppFrame>
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Internal workspace</p>
        <h1 className="mt-2 text-3xl font-bold">Proposal spaces</h1>
      </div>
      <ProposalList proposals={proposals} />
    </AppFrame>
  );
}
