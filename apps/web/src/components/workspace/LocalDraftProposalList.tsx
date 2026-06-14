"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  localDraftsServerSnapshot,
  localDraftsSnapshot,
  parseLocalDraftsSnapshot,
  subscribeToLocalDrafts,
} from "@/lib/reach-consensus/local-drafts";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function LocalDraftProposalList() {
  const snapshot = useSyncExternalStore(
    subscribeToLocalDrafts,
    localDraftsSnapshot,
    localDraftsServerSnapshot,
  );
  const drafts = useMemo(() => parseLocalDraftsSnapshot(snapshot), [snapshot]);

  return (
    <section className="mt-6 rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#0b66c3]">
            Browser-local
          </p>
          <h2 className="mt-1 text-xl font-bold">Local draft proposals</h2>
        </div>
        <Link
          href="/proposals/new"
          className="rounded-md bg-[#0b66c3] px-3 py-2 text-sm font-extrabold text-white"
        >
          New proposal
        </Link>
      </div>
      {drafts.length ? (
        <div className="mt-4 grid gap-3">
          {drafts.map((draft) => (
            <article key={draft.id} className="rounded-lg border border-[#d9e0e8] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">
                    {draft.customerName}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{draft.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657180]">
                    {draft.problem}
                  </p>
                </div>
                <span className="rounded-full border border-[#c8d9ee] bg-[#f7f9fc] px-3 py-2 text-xs font-bold text-[#0b66c3]">
                  Drafted {formattedDate(draft.updatedAt)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#657180]">
                <span>{draft.sections.length} sections</span>
                <span>{draft.documents.length} documents</span>
                <span>{draft.members.length} people</span>
                <Link
                  href={`/proposals/local/${draft.id}`}
                  className="rounded-md border border-[#d9e0e8] px-3 py-2 font-bold text-[#0b66c3]"
                >
                  Open workspace
                </Link>
                <Link
                  href={`/draft/${draft.id}`}
                  className="rounded-md border border-[#c8d9ee] bg-[#f7f9fc] px-3 py-2 font-bold text-[#0b66c3]"
                >
                  Preview microsite
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-[#f7f9fc] p-4 text-sm leading-6 text-[#657180]">
          New proposal drafts created from this browser will appear here.
        </p>
      )}
    </section>
  );
}
