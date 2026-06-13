import Link from "next/link";
import { AppFrame } from "@/components/workspace/AppFrame";
import { LocalDraftProposalList } from "@/components/workspace/LocalDraftProposalList";
import { ProposalList } from "@/components/workspace/ProposalList";
import { proposalRepository } from "@/lib/reach-consensus/repository";

export default async function DashboardPage() {
  const proposals = await proposalRepository.listProposals();

  return (
    <AppFrame>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
            Internal workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold">Proposal spaces</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657180]">
            Start a new guided proposal draft, or open the published Acme demo workspace.
          </p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex min-h-11 items-center rounded-md bg-[#0b66c3] px-4 text-sm font-extrabold text-white"
        >
          New proposal
        </Link>
      </div>
      <ProposalList proposals={proposals} />
      <LocalDraftProposalList />
    </AppFrame>
  );
}
