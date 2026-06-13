import {
  buildLocalDraft,
  documentMetadataFromFiles,
  type BuildLocalDraftInput,
  type DraftDocumentCategory,
  type DraftSectionId,
  type LocalDraftDocument,
  type LocalDraftMember,
  type LocalDraftProposal,
  type LocalDraftSection,
  type SolutionArea,
} from "./local-drafts";

export type SharedDraftDocument = LocalDraftDocument & {
  storagePath: string | null;
  digestStatus: "queued" | "digested" | "manual_review";
  customerDownloadEnabled: boolean;
  uploadStatus: "uploaded" | "metadata_only";
};

export type SharedDraftProposal = Omit<LocalDraftProposal, "documents"> & {
  documents: SharedDraftDocument[];
};

export type SharedDraftIntakeInput = Omit<BuildLocalDraftInput, "documents">;

export type DraftFileUpload = {
  category: DraftDocumentCategory;
  file: File;
};

export type SharedDraftRow = {
  id: string;
  slug: string;
  customer_name: string;
  title: string;
  problem: string;
  solution: string;
  one_cisco_story: string;
  solution_areas: SolutionArea[];
  selected_section_ids: DraftSectionId[];
  members: LocalDraftMember[];
  sections: LocalDraftSection[];
  created_at: string;
  updated_at: string;
};

export type SharedDraftDocumentRow = {
  id: string;
  draft_id: string;
  category: DraftDocumentCategory;
  name: string;
  file_type: string;
  size: number;
  storage_path: string | null;
  digest_status: SharedDraftDocument["digestStatus"];
  customer_download_enabled: boolean;
  created_at: string;
};

export type SharedDraftCreateResult = {
  kind: "shared";
  draft: SharedDraftProposal;
  workspaceUrl: string;
  previewUrl: string;
};

export type SharedDraftStore = {
  insertDraft(row: SharedDraftRow): Promise<void>;
  uploadDocument(
    draft: SharedDraftRow,
    document: LocalDraftDocument,
    file: File,
  ): Promise<{ storagePath: string | null }>;
  insertDocuments(rows: SharedDraftDocumentRow[]): Promise<void>;
};

export type SharedDraftReadStore = {
  getDraftRows(
    draftId: string,
  ): Promise<{ draft: SharedDraftRow; documents: SharedDraftDocumentRow[] } | undefined>;
};

export function proposalDraftFormDataFromIntake(
  input: SharedDraftIntakeInput,
  files: DraftFileUpload[],
) {
  const formData = new FormData();
  formData.set("payload", JSON.stringify(input));
  formData.set("fileCategories", JSON.stringify(files.map((file) => file.category)));
  files.forEach((file) => formData.append("files", file.file, file.file.name));
  return formData;
}

function randomDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `shared-${Date.now()}`;
}

function documentRowFromDraftDocument(
  draftId: string,
  document: LocalDraftDocument,
  storagePath: string | null,
): SharedDraftDocumentRow {
  return {
    id: document.id,
    draft_id: draftId,
    category: document.category,
    name: document.name,
    file_type: document.fileType,
    size: document.size,
    storage_path: storagePath,
    digest_status: "queued",
    customer_download_enabled: false,
    created_at: document.addedAt,
  };
}

export async function createSharedDraft(
  input: SharedDraftIntakeInput,
  files: DraftFileUpload[],
  store: SharedDraftStore,
  options: { id?: string; now?: Date } = {},
): Promise<SharedDraftCreateResult> {
  const now = options.now ?? new Date();
  const documents = files.flatMap((file) =>
    documentMetadataFromFiles(file.category, [file.file], now),
  );
  const localDraft = buildLocalDraft(
    {
      ...input,
      documents,
    },
    now,
  );
  const draft: SharedDraftRow = {
    id: options.id ?? randomDraftId(),
    slug: localDraft.slug,
    customer_name: localDraft.customerName,
    title: localDraft.title,
    problem: localDraft.problem,
    solution: localDraft.solution,
    one_cisco_story: localDraft.oneCiscoStory,
    solution_areas: localDraft.solutionAreas,
    selected_section_ids: input.selectedSectionIds,
    members: localDraft.members,
    sections: localDraft.sections,
    created_at: localDraft.createdAt,
    updated_at: localDraft.updatedAt,
  };

  await store.insertDraft(draft);

  const documentRows: SharedDraftDocumentRow[] = [];
  for (const [index, document] of documents.entries()) {
    const upload = await store.uploadDocument(draft, document, files[index].file);
    documentRows.push(documentRowFromDraftDocument(draft.id, document, upload.storagePath));
  }

  if (documentRows.length > 0) {
    await store.insertDocuments(documentRows);
  }

  return {
    kind: "shared",
    draft: mapSharedDraftRows(draft, documentRows),
    workspaceUrl: `/proposals/shared/${draft.id}`,
    previewUrl: `/draft/shared/${draft.id}`,
  };
}

export function mapSharedDraftRows(
  draft: SharedDraftRow,
  documents: SharedDraftDocumentRow[],
): SharedDraftProposal {
  return {
    id: draft.id,
    slug: draft.slug,
    customerName: draft.customer_name,
    title: draft.title,
    problem: draft.problem,
    solution: draft.solution,
    solutionAreas: draft.solution_areas,
    oneCiscoStory: draft.one_cisco_story,
    sections: draft.sections,
    members: draft.members,
    documents: documents.map((document) => ({
      id: document.id,
      category: document.category,
      name: document.name,
      fileType: document.file_type,
      size: document.size,
      addedAt: document.created_at,
      storagePath: document.storage_path,
      digestStatus: document.digest_status,
      customerDownloadEnabled: document.customer_download_enabled,
      uploadStatus: document.storage_path ? "uploaded" : "metadata_only",
    })),
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
  };
}

export async function readSharedDraft(
  draftId: string,
  store: SharedDraftReadStore,
) {
  const rows = await store.getDraftRows(draftId);
  return rows ? mapSharedDraftRows(rows.draft, rows.documents) : undefined;
}
