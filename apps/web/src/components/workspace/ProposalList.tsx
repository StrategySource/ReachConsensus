import Link from "next/link";
import type { Proposal } from "@/lib/reach-consensus/types";

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  return (
    <div className="grid gap-4">
      {proposals.map((proposal) => (
        <Link
          key={proposal.id}
          href={`/proposals/${proposal.id}`}
          className="rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
            {proposal.customerName}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{proposal.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657180]">
            {proposal.opportunitySummary}
          </p>
          <div className="mt-4 flex gap-3 text-sm font-semibold text-[#657180]">
            <span>{proposal.sections.length} sections</span>
            <span>{proposal.assets.length} assets</span>
            <span>{proposal.members.length} invited users</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
