import Link from "next/link";
import { sectionCanPublish } from "@/lib/reach-consensus/publish-service";
import type { Proposal } from "@/lib/reach-consensus/types";

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function PublishStatusPanel({ proposal }: { proposal: Proposal }) {
  const latestPublishedVersion = proposal.publishedVersions.at(-1);
  const readySections = proposal.sections.filter(sectionCanPublish);
  const sectionsNeedingAttention = proposal.sections.filter(
    (section) => !sectionCanPublish(section),
  );
  const visibleSections = latestPublishedVersion?.snapshot.sections ?? [];

  return (
    <article className="rounded-lg border border-[#d9e0e8] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#087f8c]">Publishing</p>
          <h2 className="mt-2 text-2xl font-bold">Customer visibility</h2>
          <p className="mt-2 text-base font-extrabold">
            {latestPublishedVersion ? "Published customer view" : "Not customer-visible yet"}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657180]">
            {latestPublishedVersion
              ? "Customers see the latest published snapshot. Approved edits stay internal until the next publish."
              : "This proposal is still internal. Approve the right sections, then publish a customer snapshot when the team is ready."}
          </p>
        </div>
        {latestPublishedVersion ? (
          <Link
            href={`/p/${latestPublishedVersion.snapshot.slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0b66c3] px-4 text-sm font-extrabold text-white"
          >
            Open customer microsite
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d9e0e8] bg-[#f7f9fc] px-4 text-sm font-extrabold text-[#657180]">
            Publish before customer view
          </span>
        )}
      </div>

      <dl className="mt-5 grid gap-4 border-y border-[#d9e0e8] py-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">Visible now</dt>
          <dd className="mt-1 text-lg font-bold">{visibleSections.length} visible sections</dd>
        </div>
        <div className="border-t border-[#d9e0e8] pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <dt className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">Ready</dt>
          <dd className="mt-1 text-lg font-bold">{readySections.length} ready to publish</dd>
        </div>
        <div className="border-t border-[#d9e0e8] pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <dt className="text-xs font-extrabold uppercase tracking-wide text-[#657180]">Needs work</dt>
          <dd className="mt-1 text-lg font-bold">{sectionsNeedingAttention.length} needs attention</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
        {latestPublishedVersion ? (
          <>
            <span className="rounded-full border border-[#c8d9ee] bg-[#f7f9fc] px-3 py-2 text-[#0b66c3]">
              Version {latestPublishedVersion.versionNumber}
            </span>
            <span className="rounded-full border border-[#d9e0e8] px-3 py-2 text-[#657180]">
              Published {formatPublishedDate(latestPublishedVersion.publishedAt)}
            </span>
            <span className="rounded-full border border-[#d9e0e8] px-3 py-2 text-[#657180]">
              Published by {latestPublishedVersion.publishedBy}
            </span>
            {visibleSections.map((section) => (
              <span
                key={section.id}
                className="rounded-full border border-[#d7eadf] bg-[#f6fbf7] px-3 py-2 text-[#2f8f46]"
              >
                {section.title}
              </span>
            ))}
          </>
        ) : (
          <span className="rounded-full border border-[#f0d3a9] bg-[#fffaf2] px-3 py-2 text-[#b46b00]">
            No customer snapshot has been published
          </span>
        )}
      </div>
    </article>
  );
}
