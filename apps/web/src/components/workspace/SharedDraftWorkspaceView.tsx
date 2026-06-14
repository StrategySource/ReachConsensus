import Link from "next/link";
import type { SharedDraftProposal } from "@/lib/reach-consensus/shared-drafts";

export function SharedDraftWorkspaceView({ draft }: { draft: SharedDraftProposal }) {
  const previewUrl = draft.currentAccess?.previewUrl ?? `/draft/shared/${draft.id}`;

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
              Shared draft workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold">{draft.title}</h1>
            <p className="mt-2 text-sm font-bold text-[#657180]">{draft.customerName}</p>
            {draft.currentAccess ? (
              <p className="mt-3 inline-flex rounded-md border border-[#c8d9ee] bg-[#f7f9fc] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
                {draft.currentAccess.label}
              </p>
            ) : null}
          </div>
          <Link
            href={previewUrl}
            className="inline-flex min-h-10 items-center rounded-md bg-[#0b66c3] px-4 text-sm font-extrabold text-white"
          >
            Customer preview
          </Link>
        </div>
        <p className="mt-5 max-w-4xl text-base leading-7 text-[#657180]">
          {draft.oneCiscoStory}
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <article className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#2f8f46]">
            Persisted intake
          </p>
          <h2 className="mt-2 text-xl font-bold">Proposal site structure</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {draft.sections.map((section) => (
              <div key={section.id} className="rounded-lg border border-[#d9e0e8] p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">
                  {section.status}
                </p>
                <h3 className="mt-2 font-bold">{section.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="grid gap-5 self-start">
          <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Uploaded source documents</h2>
            {draft.documents.length ? (
              <ul className="mt-4 grid gap-3">
                {draft.documents.map((document) => (
                  <li key={document.id} className="rounded-lg bg-[#f7f9fc] p-3">
                    <strong className="block text-sm">{document.name}</strong>
                    <span className="text-xs text-[#657180]">
                      {document.category} - {document.digestStatus.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#657180]">
                No documents were uploaded with this draft.
              </p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
