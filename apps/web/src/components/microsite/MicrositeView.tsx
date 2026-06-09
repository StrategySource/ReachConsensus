import type { PublishedProposalSnapshot } from "@/lib/reach-consensus/types";
import { visibleSectionsForCustomer } from "@/lib/reach-consensus/types";

export function MicrositeView({ proposal }: { proposal: PublishedProposalSnapshot }) {
  const sections = visibleSectionsForCustomer(proposal.sections);

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Reach Consensus proposal</p>
          <h1 className="mt-2 text-3xl font-bold">
            {proposal.customerName}: {proposal.title}
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[#657180]">{proposal.oneCiscoStory}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-lg border border-[#d9e0e8] bg-white p-4">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.slug}`}
              className="block rounded-md px-3 py-2 text-sm font-bold text-[#657180]"
            >
              {section.title}
            </a>
          ))}
        </nav>
        <section className="grid gap-5">
          <article className="rounded-lg border border-[#c8d9ee] bg-white p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">Platform spine</p>
            <h2 className="mt-2 text-2xl font-bold">Compounding platform value</h2>
            <p className="mt-3 text-sm leading-6 text-[#657180]">{proposal.oneCiscoStory}</p>
          </article>
          {sections.map((section) => (
            <article key={section.id} id={section.slug} className="rounded-lg border border-[#d9e0e8] bg-white p-6">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#2f8f46]">
                Approved customer content
              </p>
              <h2 className="mt-2 text-2xl font-bold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
              <div className="mt-5 grid gap-3">
                {section.blocks.map((block) => (
                  <div key={block.id} className="rounded-lg bg-[#f7f9fc] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#657180]">
                      {block.type.replace("_", " ")}
                    </p>
                    <h3 className="mt-1 font-bold">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#657180]">{block.body}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
