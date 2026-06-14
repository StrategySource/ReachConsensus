import {
  readSharedDraftWithAccess,
  type SharedDraftCapability,
  type SharedDraftProposal,
} from "./shared-drafts";
import {
  getSupabaseServiceClient,
  readSupabaseDraftFunctionConfig,
  type SupabaseDraftFunctionConfig,
} from "./supabase-server";
import { SupabaseSharedDraftStore } from "./supabase-shared-draft-store";

async function readSharedDraftFromFunction(
  draftId: string,
  accessToken: string,
  capability: SharedDraftCapability,
  config: SupabaseDraftFunctionConfig,
) {
  const params = new URLSearchParams({
    draftId,
    access: accessToken,
    capability,
  });
  const response = await fetch(`${config.url}?${params.toString()}`, {
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      apikey: config.apiKey,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return undefined;
  }

  if (response.status === 403) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Unable to read shared proposal draft.");
  }

  return ((await response.json()) as { draft: SharedDraftProposal }).draft;
}

export async function readConfiguredSharedDraft(
  draftId: string,
  accessToken: string | undefined,
  capability: SharedDraftCapability,
) {
  if (!accessToken) {
    return undefined;
  }

  const supabase = getSupabaseServiceClient();

  if (supabase) {
    return readSharedDraftWithAccess(
      draftId,
      accessToken,
      capability,
      new SupabaseSharedDraftStore(supabase),
    );
  }

  const draftFunction = readSupabaseDraftFunctionConfig();

  if (!draftFunction) {
    return undefined;
  }

  return readSharedDraftFromFunction(draftId, accessToken, capability, draftFunction);
}
