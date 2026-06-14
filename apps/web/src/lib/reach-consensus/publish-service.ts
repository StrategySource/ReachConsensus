import type { ProposalSection } from "./types";

export function sectionCanPublish(section: ProposalSection) {
  return section.status === "approved" || section.status === "published";
}

export function publishableSections(sections: ProposalSection[]) {
  return sections.filter(sectionCanPublish);
}
