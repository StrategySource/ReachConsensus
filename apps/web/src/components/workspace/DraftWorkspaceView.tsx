"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  localDraftsServerSnapshot,
  localDraftsSnapshot,
  parseLocalDraftsSnapshot,
  subscribeToLocalDrafts,
} from "@/lib/reach-consensus/local-drafts";

function documentCategoryLabel(category: string) {
  return category.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DraftWorkspaceView({ draftId }: { draftId: string }) {
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
      <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#b46b00]">
          Draft not found
        </p>
        <h1 className="mt-2 text-2xl font-bold">This browser does not have that draft.</h1>
        <p className="mt-3 text-sm leading-6 text-[#657180]">
          Local drafts live in the browser where they were created until persistent proposal
          storage is connected.
        </p>
        <Link
          href="/proposals/new"
          className="mt-5 inline-flex min-h-10 items-center rounded-md bg-[#0b66c3] px-4 text-sm font-extrabold text-white"
        >
          Create proposal
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
              Local draft workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold">{draft.title}</h1>
            <p className="mt-2 text-sm font-bold text-[#657180]">{draft.customerName}</p>
          </div>
          <Link
            href={`/draft/${draft.id}`}
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
        <div className="grid gap-5">
          <article className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#2f8f46]">
              Intake narrative
            </p>
            <h2 className="mt-2 text-xl font-bold">Problem and proposed solution</h2>
            <dl className="mt-4 grid gap-4">
              <div>
                <dt className="text-sm font-extrabold text-[#657180]">Customer problem</dt>
                <dd className="mt-1 text-sm leading-6">{draft.problem}</dd>
              </div>
              <div>
                <dt className="text-sm font-extrabold text-[#657180]">Proposed solution</dt>
                <dd className="mt-1 text-sm leading-6">{draft.solution}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
              Selected sections
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
        </div>

        <aside className="grid gap-5 self-start">
          <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Documents for digestion</h2>
            {draft.documents.length ? (
              <ul className="mt-4 grid gap-3">
                {draft.documents.map((document) => (
                  <li key={document.id} className="rounded-lg bg-[#f7f9fc] p-3">
                    <strong className="block text-sm">{document.name}</strong>
                    <span className="text-xs text-[#657180]">
                      {documentCategoryLabel(document.category)} - {document.fileType}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#657180]">
                No documents have been attached yet.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Invited parties</h2>
            {draft.members.length ? (
              <ul className="mt-4 grid gap-3">
                {draft.members.map((member) => (
                  <li key={member.id} className="rounded-lg bg-[#f7f9fc] p-3">
                    <strong className="block text-sm">{member.name}</strong>
                    <span className="text-xs text-[#657180]">{member.organization}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[#657180]">
                No invite list has been added yet.
              </p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
