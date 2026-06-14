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

export type SharedDraftAccessRole = "owner" | "cisco" | "partner" | "customer";

export type SharedDraftCapability =
  | "workspace:read"
  | "workspace:write"
  | "preview:read"
  | "comment:create";

export type SharedDraftAccessLink = {
  role: SharedDraftAccessRole;
  label: string;
  url: string;
  capabilities: SharedDraftCapability[];
};

export type SharedDraftCurrentAccess = SharedDraftAccessLink & {
  token: string;
  workspaceUrl?: string;
  previewUrl?: string;
};

export type SharedDraftProposal = Omit<LocalDraftProposal, "documents"> & {
  documents: SharedDraftDocument[];
  accessLinks?: SharedDraftAccessLink[];
  currentAccess?: SharedDraftCurrentAccess;
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

export type SharedDraftAccessTokenRow = {
  id: string;
  draft_id: string;
  token_hash: string;
  role: SharedDraftAccessRole;
  label: string;
  capabilities: SharedDraftCapability[];
  created_at: string;
  last_used_at: string | null;
};

export type SharedDraftCreateResult = {
  kind: "shared";
  draft: SharedDraftProposal;
  accessLinks: SharedDraftAccessLink[];
  workspaceUrl: string;
  previewUrl: string;
};

export type SharedDraftStore = {
  insertDraft(row: SharedDraftRow): Promise<void>;
  insertAccessTokens(rows: SharedDraftAccessTokenRow[]): Promise<void>;
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
  getAccessToken?(
    draftId: string,
    tokenHash: string,
  ): Promise<SharedDraftAccessTokenRow | undefined>;
  markAccessTokenUsed?(tokenId: string, usedAt: string): Promise<void>;
};

type SharedDraftAccessDefinition = {
  role: SharedDraftAccessRole;
  label: string;
  capabilities: SharedDraftCapability[];
  route: "workspace" | "preview";
};

export const defaultAccessDefinitions: SharedDraftAccessDefinition[] = [
  {
    role: "owner",
    label: "Cisco workspace",
    capabilities: ["workspace:read", "workspace:write", "preview:read"],
    route: "workspace",
  },
  {
    role: "customer",
    label: "Customer preview",
    capabilities: ["preview:read", "comment:create"],
    route: "preview",
  },
];

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

function randomAccessToken() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function hashAccessToken(token: string) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function workspaceUrlFor(draftId: string, token: string) {
  return `/proposals/shared/${draftId}?access=${encodeURIComponent(token)}`;
}

function previewUrlFor(draftId: string, token: string) {
  return `/draft/shared/${draftId}?access=${encodeURIComponent(token)}`;
}

export function accessLinkFor(
  draftId: string,
  definition: SharedDraftAccessDefinition,
  token: string,
): SharedDraftAccessLink {
  return {
    role: definition.role,
    label: definition.label,
    capabilities: definition.capabilities,
    url:
      definition.route === "workspace"
        ? workspaceUrlFor(draftId, token)
        : previewUrlFor(draftId, token),
  };
}

export function currentAccessFor(
  draftId: string,
  definition: Pick<SharedDraftAccessDefinition, "role" | "label" | "capabilities">,
  token: string,
): SharedDraftCurrentAccess {
  const workspaceUrl = definition.capabilities.includes("workspace:read")
    ? workspaceUrlFor(draftId, token)
    : undefined;
  const previewUrl = definition.capabilities.includes("preview:read")
    ? previewUrlFor(draftId, token)
    : undefined;

  return {
    role: definition.role,
    label: definition.label,
    capabilities: definition.capabilities,
    url: workspaceUrl ?? previewUrl ?? `/draft/shared/${draftId}`,
    token,
    workspaceUrl,
    previewUrl,
  };
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
  options: { id?: string; now?: Date; accessTokenFactory?: () => string } = {},
): Promise<SharedDraftCreateResult> {
  const now = options.now ?? new Date();
  const accessTokenFactory = options.accessTokenFactory ?? randomAccessToken;
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

  const accessTokens = defaultAccessDefinitions.map((definition) => ({
    definition,
    token: accessTokenFactory(),
  }));
  const accessRows = await Promise.all(
    accessTokens.map(async ({ definition, token }) => ({
      id: `access_${definition.role}_${draft.id}`,
      draft_id: draft.id,
      token_hash: await hashAccessToken(token),
      role: definition.role,
      label: definition.label,
      capabilities: definition.capabilities,
      created_at: localDraft.createdAt,
      last_used_at: null,
    })),
  );

  await store.insertAccessTokens(accessRows);

  const documentRows: SharedDraftDocumentRow[] = [];
  for (const [index, document] of documents.entries()) {
    const upload = await store.uploadDocument(draft, document, files[index].file);
    documentRows.push(documentRowFromDraftDocument(draft.id, document, upload.storagePath));
  }

  if (documentRows.length > 0) {
    await store.insertDocuments(documentRows);
  }

  const accessLinks = accessTokens.map(({ definition, token }) =>
    accessLinkFor(draft.id, definition, token),
  );
  const ownerAccess = accessTokens.find((accessToken) => accessToken.definition.role === "owner");

  return {
    kind: "shared",
    draft: mapSharedDraftRows(draft, documentRows, {
      accessLinks,
      currentAccess: ownerAccess
        ? currentAccessFor(draft.id, ownerAccess.definition, ownerAccess.token)
        : undefined,
    }),
    accessLinks,
    workspaceUrl: accessLinks[0]?.url ?? `/proposals/shared/${draft.id}`,
    previewUrl: accessLinks[1]?.url ?? `/draft/shared/${draft.id}`,
  };
}

export function mapSharedDraftRows(
  draft: SharedDraftRow,
  documents: SharedDraftDocumentRow[],
  options: { accessLinks?: SharedDraftAccessLink[]; currentAccess?: SharedDraftCurrentAccess } = {},
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
    accessLinks: options.accessLinks,
    currentAccess: options.currentAccess,
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

export async function readSharedDraftWithAccess(
  draftId: string,
  accessToken: string,
  capability: SharedDraftCapability,
  store: SharedDraftReadStore,
) {
  if (!store.getAccessToken) {
    return undefined;
  }

  const tokenHash = await hashAccessToken(accessToken);
  const token = await store.getAccessToken(draftId, tokenHash);

  if (!token || !token.capabilities.includes(capability)) {
    return undefined;
  }

  await store.markAccessTokenUsed?.(token.id, new Date().toISOString());

  const rows = await store.getDraftRows(draftId);
  return rows
    ? mapSharedDraftRows(rows.draft, rows.documents, {
        currentAccess: currentAccessFor(draftId, token, accessToken),
      })
    : undefined;
}
