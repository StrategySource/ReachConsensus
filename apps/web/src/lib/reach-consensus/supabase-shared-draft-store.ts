import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapSharedDraftRows,
  type SharedDraftAccessTokenRow,
  type SharedDraftDocumentRow,
  type SharedDraftReadStore,
  type SharedDraftRow,
  type SharedDraftStore,
} from "./shared-drafts";
import type { LocalDraftDocument } from "./local-drafts";

export const PROPOSAL_SOURCE_BUCKET = "proposal-source-materials";

type SharedDraftDatabaseRow = Omit<
  SharedDraftRow,
  "solution_areas" | "selected_section_ids" | "members" | "sections"
> & {
  solution_areas: string[];
  selected_section_ids: string[];
  members: unknown;
  sections: unknown;
};

function storagePathFor(draft: SharedDraftRow, document: LocalDraftDocument) {
  return `${draft.id}/${document.category}/${document.id}-${document.name}`;
}

function asSharedDraftRow(row: SharedDraftDatabaseRow): SharedDraftRow {
  return {
    ...row,
    solution_areas: row.solution_areas as SharedDraftRow["solution_areas"],
    selected_section_ids: row.selected_section_ids as SharedDraftRow["selected_section_ids"],
    members: row.members as SharedDraftRow["members"],
    sections: row.sections as SharedDraftRow["sections"],
  };
}

export class SupabaseSharedDraftStore implements SharedDraftStore, SharedDraftReadStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async insertDraft(row: SharedDraftRow) {
    const { error } = await this.supabase.from("proposal_intake_drafts").insert(row);

    if (error) {
      throw new Error(error.message);
    }
  }

  async insertAccessTokens(rows: SharedDraftAccessTokenRow[]) {
    const { error } = await this.supabase.from("proposal_intake_access_tokens").insert(rows);

    if (error) {
      throw new Error(error.message);
    }
  }

  async uploadDocument(draft: SharedDraftRow, document: LocalDraftDocument, file: File) {
    const storagePath = storagePathFor(draft, document);
    const { error } = await this.supabase.storage
      .from(PROPOSAL_SOURCE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return { storagePath };
  }

  async insertDocuments(rows: SharedDraftDocumentRow[]) {
    const { error } = await this.supabase.from("proposal_intake_documents").insert(rows);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getDraftRows(draftId: string) {
    const { data: draft, error: draftError } = await this.supabase
      .from("proposal_intake_drafts")
      .select("*")
      .eq("id", draftId)
      .maybeSingle<SharedDraftDatabaseRow>();

    if (draftError) {
      throw new Error(draftError.message);
    }

    if (!draft) {
      return undefined;
    }

    const { data: documents, error: documentsError } = await this.supabase
      .from("proposal_intake_documents")
      .select("*")
      .eq("draft_id", draftId)
      .order("created_at", { ascending: true })
      .returns<SharedDraftDocumentRow[]>();

    if (documentsError) {
      throw new Error(documentsError.message);
    }

    return {
      draft: asSharedDraftRow(draft),
      documents: documents ?? [],
    };
  }

  async getAccessToken(draftId: string, tokenHash: string) {
    const { data, error } = await this.supabase
      .from("proposal_intake_access_tokens")
      .select("*")
      .eq("draft_id", draftId)
      .eq("token_hash", tokenHash)
      .maybeSingle<SharedDraftAccessTokenRow>();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? undefined;
  }

  async markAccessTokenUsed(tokenId: string, usedAt: string) {
    const { error } = await this.supabase
      .from("proposal_intake_access_tokens")
      .update({ last_used_at: usedAt })
      .eq("id", tokenId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getDraft(draftId: string) {
    const rows = await this.getDraftRows(draftId);
    return rows ? mapSharedDraftRows(rows.draft, rows.documents) : undefined;
  }
}
