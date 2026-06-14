import type { AnalyticsEvent } from "./types";

export function summarizeEngagement(events: AnalyticsEvent[]) {
  const uniqueActors = Array.from(new Set(events.map((event) => event.actorName))).sort();
  const downloadCount = events.filter((event) => event.type === "file_downloaded").length;
  const commentCount = events.filter((event) => event.type === "comment_created").length;
  const changeRequestCount = events.filter((event) => event.type === "change_request_created").length;

  return {
    totalEvents: events.length,
    uniqueActors,
    downloadCount,
    commentCount,
    changeRequestCount,
  };
}
