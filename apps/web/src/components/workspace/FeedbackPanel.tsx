import type { Proposal } from "@/lib/reach-consensus/types";

export function FeedbackPanel({ proposal }: { proposal: Proposal }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-[#d9e0e8] bg-white p-5">
        <h2 className="text-xl font-bold">Customer comments</h2>
        <div className="mt-4 grid gap-3">
          {proposal.comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-[#f7f9fc] p-4">
              <strong>{comment.authorName}</strong>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{comment.body}</p>
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-lg border border-[#d9e0e8] bg-white p-5">
        <h2 className="text-xl font-bold">Change requests</h2>
        <div className="mt-4 grid gap-3">
          {proposal.changeRequests.map((request) => (
            <div key={request.id} className="rounded-lg bg-[#f7f9fc] p-4">
              <strong>{request.title}</strong>
              <p className="mt-2 text-sm leading-6 text-[#657180]">{request.body}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#0b66c3]">
                {request.status} · Owner: {request.ownerName}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
