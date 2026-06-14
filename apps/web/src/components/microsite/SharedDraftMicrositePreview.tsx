import Link from "next/link";
import type { SharedDraftProposal } from "@/lib/reach-consensus/shared-drafts";

export function SharedDraftMicrositePreview({ draft }: { draft: SharedDraftProposal }) {
  const workspaceUrl = draft.currentAccess?.workspaceUrl;

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
              Reach Consensus shared draft
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {draft.customerName}: {draft.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-[#657180]">
              {draft.oneCiscoStory}
            </p>
            {draft.currentAccess ? (
              <p className="mt-3 inline-flex rounded-md border border-[#c8d9ee] bg-[#f7f9fc] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
                {draft.currentAccess.label}
              </p>
            ) : null}
          </div>
          {workspaceUrl ? (
            <Link
              href={workspaceUrl}
              className="inline-flex min-h-10 items-center rounded-md border border-[#c8d9ee] bg-[#f7f9fc] px-4 text-sm font-extrabold text-[#0b66c3]"
            >
              Back to workspace
            </Link>
          ) : null}
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-lg border border-[#d9e0e8] bg-white p-4">
          {draft.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-md px-3 py-2 text-sm font-bold text-[#657180]"
            >
              {section.title}
            </a>
          ))}
        </nav>
        <section className="grid gap-5">
          <article className="rounded-lg border border-[#c8d9ee] bg-white p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
              Platform spine
            </p>
            <h2 className="mt-2 text-2xl font-bold">Compounding platform value</h2>
            <p className="mt-3 text-sm leading-6 text-[#657180]">{draft.oneCiscoStory}</p>
          </article>
          {draft.sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="rounded-lg border border-[#d9e0e8] bg-white p-6"
            >
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#2f8f46]">
                Shared draft customer content
              </p>
              <h2 className="mt-2 text-2xl font-bold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
            </article>
          ))}
          <article className="rounded-lg border border-[#d9e0e8] bg-white p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">
              Source documents
            </p>
            <h2 className="mt-2 text-2xl font-bold">Uploaded material</h2>
            {draft.documents.length ? (
              <ul className="mt-4 grid gap-3">
                {draft.documents.map((document) => (
                  <li key={document.id} className="rounded-lg bg-[#f7f9fc] p-4">
                    <strong className="block">{document.name}</strong>
                    <span className="text-sm text-[#657180]">
                      {document.category} - {document.digestStatus.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#657180]">
                No source documents were uploaded with this draft.
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
