export const LOCAL_DRAFTS_STORAGE_KEY = "reach-consensus:local-proposal-drafts";
export const LOCAL_DRAFTS_CHANGED_EVENT = "reach-consensus:local-proposal-drafts-changed";

export type SolutionArea =
  | "security"
  | "networking"
  | "observability"
  | "collaboration"
  | "data-center"
  | "services";

export type DraftDocumentCategory =
  | "architecture"
  | "quote"
  | "services"
  | "licensing"
  | "supporting";

export type DraftSectionId =
  | "executive-summary"
  | "platform-story"
  | "reference-architecture"
  | "quote-bom"
  | "services"
  | "licensing"
  | "business-value"
  | "operations-management"
  | "discussion"
  | "decision-next-steps"
  | "assumptions-risks";

export type LocalDraftDocument = {
  id: string;
  category: DraftDocumentCategory;
  name: string;
  fileType: string;
  size: number;
  addedAt: string;
};

export type LocalDraftSection = {
  id: DraftSectionId;
  title: string;
  summary: string;
  status: "draft";
};

export type LocalDraftMember = {
  id: string;
  name: string;
  organization: string;
};

export type LocalDraftProposal = {
  id: string;
  slug: string;
  customerName: string;
  title: string;
  problem: string;
  solution: string;
  solutionAreas: SolutionArea[];
  oneCiscoStory: string;
  sections: LocalDraftSection[];
  members: LocalDraftMember[];
  documents: LocalDraftDocument[];
  createdAt: string;
  updatedAt: string;
};

export type BuildLocalDraftInput = {
  customerName: string;
  title: string;
  problem: string;
  solution: string;
  solutionAreas: SolutionArea[];
  selectedSectionIds: DraftSectionId[];
  members: string;
  documents: LocalDraftDocument[];
};

export const solutionAreaOptions: { id: SolutionArea; label: string }[] = [
  { id: "security", label: "Security" },
  { id: "networking", label: "Networking" },
  { id: "observability", label: "Observability" },
  { id: "collaboration", label: "Collaboration" },
  { id: "data-center", label: "Data center" },
  { id: "services", label: "Services" },
];

export const draftSectionOptions: LocalDraftSection[] = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    summary: "CIO-level narrative for outcomes, risk, urgency, and platform fit.",
    status: "draft",
  },
  {
    id: "platform-story",
    title: "Platform Story",
    summary: "The One Cisco spine that explains how multiple architectures compound.",
    status: "draft",
  },
  {
    id: "reference-architecture",
    title: "Reference Architecture",
    summary: "Current-state and recommended future-state architecture views.",
    status: "draft",
  },
  {
    id: "quote-bom",
    title: "Quote / BOM",
    summary: "Customer-readable quote, bill of materials, and supporting detail.",
    status: "draft",
  },
  {
    id: "services",
    title: "Services",
    summary: "Recommended value delivery path and delivery responsibility model.",
    status: "draft",
  },
  {
    id: "licensing",
    title: "Licensing",
    summary: "Terms, enterprise agreement context, entitlements, and renewals.",
    status: "draft",
  },
  {
    id: "business-value",
    title: "Business Value",
    summary: "Value drivers, expected outcomes, risk avoided, and rationale.",
    status: "draft",
  },
  {
    id: "operations-management",
    title: "Operations & Management",
    summary: "Training, managed services, day-2 operations, and change management.",
    status: "draft",
  },
  {
    id: "discussion",
    title: "Discussion",
    summary: "Customer questions, clarifications, and requested changes.",
    status: "draft",
  },
  {
    id: "decision-next-steps",
    title: "Decision & Next Steps",
    summary: "Decision path, dependencies, milestones, and implementation kickoff.",
    status: "draft",
  },
  {
    id: "assumptions-risks",
    title: "Assumptions & Risks",
    summary: "Design assumptions, delivery dependencies, and scope tradeoffs.",
    status: "draft",
  },
];

type DraftStorage = Pick<Storage, "getItem" | "setItem">;
type FileLike = Pick<File, "name" | "size" | "type">;

function browserStorage(): DraftStorage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

function formatDraftTimestamp(date: Date) {
  return date.toISOString().replaceAll("-", "").replaceAll(":", "").slice(0, 15);
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "proposal";
}

function listPhrase(values: string[]) {
  if (values.length === 0) {
    return "the selected Cisco capabilities";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function parseMembers(value: string): LocalDraftMember[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName, ...organizationParts] = line.split(/\s+-\s+/);
      const name = rawName.trim();
      const organization = organizationParts.join(" - ").trim() || "Unassigned";

      return {
        id: `member_${slugify(`${name}-${organization}`)}`,
        name,
        organization,
      };
    });
}

export function documentMetadataFromFiles(
  category: DraftDocumentCategory,
  files: FileLike[],
  now: Date = new Date(),
): LocalDraftDocument[] {
  const addedAt = now.toISOString();

  return files.map((file) => ({
    id: `doc_${category}_${slugify(file.name.replace(/\.[^.]+$/, ""))}`,
    category,
    name: file.name,
    fileType: file.type || "unknown",
    size: file.size,
    addedAt,
  }));
}

export function buildLocalDraft(
  input: BuildLocalDraftInput,
  now: Date = new Date(),
): LocalDraftProposal {
  const timestamp = formatDraftTimestamp(now);
  const slug = slugify(`${input.customerName} ${input.title}`);
  const selectedSections = draftSectionOptions.filter((section) =>
    input.selectedSectionIds.includes(section.id),
  );
  const areaLabels = input.solutionAreas.map(
    (area) => solutionAreaOptions.find((option) => option.id === area)?.label.toLowerCase() ?? area,
  );
  const capabilityPhrase = listPhrase(areaLabels);
  const oneCiscoStory = `${input.customerName} can turn ${capabilityPhrase} into a connected platform architecture where each Cisco capability reinforces the others, making the proposed solution more valuable than separate product decisions.`;

  return {
    id: `draft_${slug}_${timestamp}`,
    slug,
    customerName: input.customerName.trim(),
    title: input.title.trim(),
    problem: input.problem.trim(),
    solution: input.solution.trim(),
    solutionAreas: [...input.solutionAreas],
    oneCiscoStory,
    sections: selectedSections.map((section) => ({ ...section })),
    members: parseMembers(input.members),
    documents: input.documents.map((document) => ({ ...document })),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function readLocalDrafts(storage: DraftStorage | undefined = browserStorage()) {
  if (!storage) {
    return [];
  }

  const rawValue = storage.getItem(LOCAL_DRAFTS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as LocalDraftProposal[];
  } catch {
    return [];
  }
}

export function parseLocalDraftsSnapshot(snapshot: string): LocalDraftProposal[] {
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? (parsed as LocalDraftProposal[]) : [];
  } catch {
    return [];
  }
}

export function localDraftsSnapshot() {
  return JSON.stringify(readLocalDrafts());
}

export function localDraftsServerSnapshot() {
  return "[]";
}

export function subscribeToLocalDrafts(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onStoreChange();
  window.addEventListener("storage", listener);
  window.addEventListener(LOCAL_DRAFTS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(LOCAL_DRAFTS_CHANGED_EVENT, listener);
  };
}

export function saveLocalDraft(
  draft: LocalDraftProposal,
  storage: DraftStorage | undefined = browserStorage(),
) {
  if (!storage) {
    return draft;
  }

  const existingDrafts = readLocalDrafts(storage).filter((item) => item.id !== draft.id);
  const drafts = [draft, ...existingDrafts].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

  storage.setItem(LOCAL_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOCAL_DRAFTS_CHANGED_EVENT));
  }
  return draft;
}

export function getLocalDraft(
  draftId: string,
  storage: DraftStorage | undefined = browserStorage(),
) {
  return readLocalDrafts(storage).find((draft) => draft.id === draftId);
}
