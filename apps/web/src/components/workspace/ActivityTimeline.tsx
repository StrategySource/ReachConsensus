import type { AnalyticsEvent } from "@/lib/reach-consensus/types";

export function ActivityTimeline({ events }: { events: AnalyticsEvent[] }) {
  return (
    <section className="rounded-lg border border-[#d9e0e8] bg-white p-5">
      <h2 className="text-xl font-bold">Engagement timeline</h2>
      <div className="mt-4 grid gap-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg bg-[#f7f9fc] p-4">
            <strong>{event.actorName}</strong>
            <p className="mt-1 text-sm text-[#657180]">{event.label}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#0b66c3]">
              {event.type.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
