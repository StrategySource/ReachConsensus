"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  localDraftsServerSnapshot,
  localDraftsSnapshot,
  parseLocalDraftsSnapshot,
  subscribeToLocalDrafts,
} from "@/lib/reach-consensus/local-drafts";

export function DraftMicrositePreview({ draftId }: { draftId: string }) {
  const snapshot = useSyncExternalStore(
    subscribeToLocalDrafts,
    localDraftsSnapshot,
    localDraftsServerSnapshot,
  );
  const draft = useMemo(
    () => parseLocalDraftsSnapshot(snapshot).find((item) => item.id === draftId),
    [draftId, snapshot],
  );

  if (!draft) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] p-6 text-[#17202a]">
        <section className="mx-auto max-w-3xl rounded-lg border border-[#d9e0e8] bg-white p-6">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#b46b00]">
            Preview unavailable
          </p>
          <h1 className="mt-2 text-2xl font-bold">This local draft is not available here.</h1>
          <p className="mt-3 text-sm leading-6 text-[#657180]">
            Draft previews are available in the browser where the proposal draft was created.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex min-h-10 items-center rounded-md bg-[#0b66c3] px-4 text-sm font-extrabold text-white"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
              Reach Consensus draft preview
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {draft.customerName}: {draft.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-[#657180]">
              {draft.oneCiscoStory}
            </p>
          </div>
          <Link
            href={`/proposals/local/${draft.id}`}
            className="inline-flex min-h-10 items-center rounded-md border border-[#c8d9ee] bg-[#f7f9fc] px-4 text-sm font-extrabold text-[#0b66c3]"
          >
            Back to workspace
          </Link>
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
                Draft customer content
              </p>
              <h2 className="mt-2 text-2xl font-bold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{section.summary}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-lg bg-[#f7f9fc] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#657180]">
                    Narrative seed
                  </p>
                  <h3 className="mt-1 font-bold">Draft starting point</h3>
                  <p className="mt-2 text-sm leading-6 text-[#657180]">
                    {section.id === "platform-story"
                      ? draft.oneCiscoStory
                      : `${draft.problem} The recommended approach is to use ${draft.solution}`}
                  </p>
                </div>
              </div>
            </article>
          ))}
          <article className="rounded-lg border border-[#d9e0e8] bg-white p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">
              Document appendix
            </p>
            <h2 className="mt-2 text-2xl font-bold">Supporting material</h2>
            {draft.documents.length ? (
              <ul className="mt-4 grid gap-3">
                {draft.documents.map((document) => (
                  <li key={document.id} className="rounded-lg bg-[#f7f9fc] p-4">
                    <strong className="block">{document.name}</strong>
                    <span className="text-sm text-[#657180]">
                      {document.category} - queued for upload and digestion
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#657180]">
                No supporting documents were attached to this draft.
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
