import { readSharedDraft, type SharedDraftProposal } from "./shared-drafts";
import {
  getSupabaseServiceClient,
  readSupabaseDraftFunctionConfig,
  type SupabaseDraftFunctionConfig,
} from "./supabase-server";
import { SupabaseSharedDraftStore } from "./supabase-shared-draft-store";

async function readSharedDraftFromFunction(
  draftId: string,
  config: SupabaseDraftFunctionConfig,
) {
  const response = await fetch(`${config.url}?draftId=${encodeURIComponent(draftId)}`, {
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      apikey: config.apiKey,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Unable to read shared proposal draft.");
  }

  return ((await response.json()) as { draft: SharedDraftProposal }).draft;
}

export async function readConfiguredSharedDraft(draftId: string) {
  const supabase = getSupabaseServiceClient();

  if (supabase) {
    return readSharedDraft(draftId, new SupabaseSharedDraftStore(supabase));
  }

  const draftFunction = readSupabaseDraftFunctionConfig();

  if (!draftFunction) {
    return undefined;
  }

  return readSharedDraftFromFunction(draftId, draftFunction);
}
