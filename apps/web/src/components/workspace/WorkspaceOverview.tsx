import type { Proposal } from "@/lib/reach-consensus/types";

export function WorkspaceOverview({ proposal }: { proposal: Proposal }) {
  const needsReview = proposal.sections.filter((section) => section.status === "needs_review").length;

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">One Cisco story</p>
        <h1 className="mt-2 text-3xl font-bold">{proposal.title}</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-[#657180]">{proposal.oneCiscoStory}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
          <span className="rounded-full border border-[#d9e0e8] px-3 py-2">
            {proposal.sections.length} sections
          </span>
          <span className="rounded-full border border-[#d9e0e8] px-3 py-2">
            {proposal.assets.length} assets
          </span>
          <span className="rounded-full border border-[#d9e0e8] px-3 py-2">
            {needsReview} needs review
          </span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {proposal.sections.map((section) => (
          <article key={section.id} className="rounded-lg border border-[#d9e0e8] bg-white p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">
              {section.status.replace("_", " ")}
            </p>
            <h2 className="mt-2 text-lg font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
