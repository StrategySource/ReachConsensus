import Link from "next/link";
import type { Proposal } from "@/lib/reach-consensus/types";

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  return (
    <div className="grid gap-4">
      {proposals.map((proposal) => (
        <article key={proposal.id} className="rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
            {proposal.customerName}
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            <Link href={`/proposals/${proposal.id}`}>{proposal.title}</Link>
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657180]">
            {proposal.opportunitySummary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#657180]">
            <span>{proposal.sections.length} sections</span>
            <span>{proposal.assets.length} assets</span>
            <span>{proposal.members.length} invited users</span>
            <Link
              href={`/proposals/${proposal.id}/setup`}
              className="rounded-md border border-[#d9e0e8] px-3 py-2 font-bold text-[#0b66c3]"
            >
              Guided setup
            </Link>
            <Link
              href={`/p/${proposal.slug}`}
              className="rounded-md border border-[#c8d9ee] bg-[#f7f9fc] px-3 py-2 font-bold text-[#0b66c3]"
            >
              Customer microsite
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
