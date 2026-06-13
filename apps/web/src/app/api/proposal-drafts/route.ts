import { NextResponse } from "next/server";
import { createSharedDraft, type DraftFileUpload } from "@/lib/reach-consensus/shared-drafts";
import {
  getSupabaseServiceClient,
  readSupabaseDraftFunctionConfig,
  type SupabaseDraftFunctionConfig,
} from "@/lib/reach-consensus/supabase-server";
import { SupabaseSharedDraftStore } from "@/lib/reach-consensus/supabase-shared-draft-store";

async function forwardToSupabaseDraftFunction(
  formData: FormData,
  config: SupabaseDraftFunctionConfig,
) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      apikey: config.apiKey,
    },
    body: formData,
  });
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

function draftUploadsFromFormData(formData: FormData) {
  const payload = formData.get("payload");
  const fileCategories = formData.get("fileCategories");

  if (typeof payload !== "string" || typeof fileCategories !== "string") {
    return undefined;
  }

  const categories = JSON.parse(fileCategories) as DraftFileUpload["category"][];
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  return {
    input: JSON.parse(payload),
    uploads: files.map((file, index) => ({
      category: categories[index],
      file,
    })),
  };
}

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  const draftFunction = readSupabaseDraftFunctionConfig();
  const formData = await request.formData();

  if (!supabase && draftFunction) {
    return forwardToSupabaseDraftFunction(formData, draftFunction);
  }

  if (!supabase) {
    return NextResponse.json(
      {
        error: "Supabase persistence is not configured yet.",
        code: "supabase_not_configured",
      },
      { status: 503 },
    );
  }

  const draftRequest = draftUploadsFromFormData(formData);

  if (!draftRequest) {
    return NextResponse.json({ error: "Invalid proposal draft payload." }, { status: 400 });
  }

  const result = await createSharedDraft(
    draftRequest.input,
    draftRequest.uploads,
    new SupabaseSharedDraftStore(supabase),
  );

  return NextResponse.json(result, { status: 201 });
}
