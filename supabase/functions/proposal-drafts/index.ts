import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type SolutionArea =
  | "security"
  | "networking"
  | "observability"
  | "collaboration"
  | "data-center"
  | "services";

type DraftDocumentCategory =
  | "architecture"
  | "quote"
  | "services"
  | "licensing"
  | "supporting";

type DraftSectionId =
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

type DraftInput = {
  customerName: string;
  title: string;
  problem: string;
  solution: string;
  solutionAreas: SolutionArea[];
  selectedSectionIds: DraftSectionId[];
  members: string;
};

type DraftSection = {
  id: DraftSectionId;
  title: string;
  summary: string;
  status: "draft";
};

const draftSectionOptions: DraftSection[] = [
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

const solutionAreaLabels: Record<SolutionArea, string> = {
  security: "security",
  networking: "networking",
  observability: "observability",
  collaboration: "collaboration",
  "data-center": "data center",
  services: "services",
};

const corsHeaders = {
  "access-control-allow-origin": "https://reach-consensus.vercel.app",
  "access-control-allow-headers": "authorization, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
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

function parseMembers(value: string) {
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

function readSecretKey() {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey) {
    return serviceRoleKey;
  }

  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    const parsed = JSON.parse(secretKeys) as Record<string, string>;
    if (parsed.default) {
      return parsed.default;
    }
  }

  return undefined;
}

function storagePathFor(draftId: string, category: DraftDocumentCategory, documentId: string, name: string) {
  return `${draftId}/${category}/${documentId}-${name}`;
}

function mapStoredDraft(draft: Record<string, unknown>, documents: Record<string, unknown>[]) {
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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = readSecretKey();

  if (!supabaseUrl || !secretKey) {
    return jsonResponse({ error: "Supabase function is not configured." }, 500);
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (request.method === "GET") {
    const draftId = new URL(request.url).searchParams.get("draftId");

    if (!draftId) {
      return jsonResponse({ error: "Draft ID is required." }, 400);
    }

    const { data: draft, error: draftError } = await supabase
      .from("proposal_intake_drafts")
      .select("*")
      .eq("id", draftId)
      .maybeSingle();

    if (draftError) {
      return jsonResponse({ error: draftError.message }, 500);
    }

    if (!draft) {
      return jsonResponse({ error: "Draft not found." }, 404);
    }

    const { data: documents, error: documentsError } = await supabase
      .from("proposal_intake_documents")
      .select("*")
      .eq("draft_id", draftId)
      .order("created_at", { ascending: true });

    if (documentsError) {
      return jsonResponse({ error: documentsError.message }, 500);
    }

    return jsonResponse({ draft: mapStoredDraft(draft, documents ?? []) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const formData = await request.formData();
  const payload = formData.get("payload");
  const fileCategories = formData.get("fileCategories");

  if (typeof payload !== "string" || typeof fileCategories !== "string") {
    return jsonResponse({ error: "Invalid proposal draft payload." }, 400);
  }

  const input = JSON.parse(payload) as DraftInput;
  const categories = JSON.parse(fileCategories) as DraftDocumentCategory[];
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  const now = new Date();
  const slug = slugify(`${input.customerName} ${input.title}`);
  const draftId = crypto.randomUUID();
  const capabilityPhrase = listPhrase(input.solutionAreas.map((area) => solutionAreaLabels[area] ?? area));
  const oneCiscoStory = `${input.customerName} can turn ${capabilityPhrase} into a connected platform architecture where each Cisco capability reinforces the others, making the proposed solution more valuable than separate product decisions.`;
  const sections = draftSectionOptions.filter((section) => input.selectedSectionIds.includes(section.id));
  const draftRow = {
    id: draftId,
    slug,
    customer_name: input.customerName.trim(),
    title: input.title.trim(),
    problem: input.problem.trim(),
    solution: input.solution.trim(),
    one_cisco_story: oneCiscoStory,
    solution_areas: input.solutionAreas,
    selected_section_ids: input.selectedSectionIds,
    members: parseMembers(input.members),
    sections,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const { error: draftError } = await supabase.from("proposal_intake_drafts").insert(draftRow);

  if (draftError) {
    return jsonResponse({ error: draftError.message }, 500);
  }

  const documentRows = [];
  for (const [index, file] of files.entries()) {
    const category = categories[index];
    if (!category) {
      return jsonResponse({ error: "Document category is missing." }, 400);
    }

    const documentId = `doc_${category}_${slugify(file.name.replace(/\.[^.]+$/, ""))}`;
    const storagePath = storagePathFor(draftId, category, documentId, file.name);
    const { error: uploadError } = await supabase.storage
      .from("proposal-source-materials")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return jsonResponse({ error: uploadError.message }, 500);
    }

    documentRows.push({
      id: documentId,
      draft_id: draftId,
      category,
      name: file.name,
      file_type: file.type || "unknown",
      size: file.size,
      storage_path: storagePath,
      digest_status: "queued",
      customer_download_enabled: false,
      created_at: now.toISOString(),
    });
  }

  if (documentRows.length > 0) {
    const { error: documentsError } = await supabase
      .from("proposal_intake_documents")
      .insert(documentRows);

    if (documentsError) {
      return jsonResponse({ error: documentsError.message }, 500);
    }
  }

  return jsonResponse(
    {
      kind: "shared",
      draft: {
        id: draftRow.id,
        slug: draftRow.slug,
        customerName: draftRow.customer_name,
        title: draftRow.title,
        problem: draftRow.problem,
        solution: draftRow.solution,
        solutionAreas: draftRow.solution_areas,
        oneCiscoStory: draftRow.one_cisco_story,
        sections: draftRow.sections,
        members: draftRow.members,
        documents: documentRows.map((document) => ({
          id: document.id,
          category: document.category,
          name: document.name,
          fileType: document.file_type,
          size: document.size,
          addedAt: document.created_at,
          storagePath: document.storage_path,
          digestStatus: document.digest_status,
          customerDownloadEnabled: document.customer_download_enabled,
          uploadStatus: "uploaded",
        })),
        createdAt: draftRow.created_at,
        updatedAt: draftRow.updated_at,
      },
      workspaceUrl: `/proposals/shared/${draftRow.id}`,
      previewUrl: `/draft/shared/${draftRow.id}`,
    },
    201,
  );
});
