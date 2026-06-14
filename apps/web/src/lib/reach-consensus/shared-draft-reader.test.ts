import { afterEach, describe, expect, it, vi } from "vitest";
import { readConfiguredSharedDraft } from "./shared-draft-reader";

describe("shared draft reader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("reads a shared proposal draft through the Supabase Edge Function bridge with a scoped access token", async () => {
    vi.stubEnv("SUPABASE_URL", "https://reach-consensus.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          draft: {
            id: "shared-123",
            slug: "northwind-ai-ready-network",
            customerName: "Northwind Clinics",
            title: "AI-ready network",
            problem: "Fragmented architecture.",
            solution: "One Cisco platform.",
            solutionAreas: ["security"],
            oneCiscoStory: "Northwind Clinics can turn security into a platform architecture.",
            sections: [],
            members: [],
            documents: [],
            createdAt: "2026-06-13T18:00:00.000Z",
            updatedAt: "2026-06-13T18:00:00.000Z",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const draft = await readConfiguredSharedDraft(
      "shared-123",
      "owner-token",
      "workspace:read",
    );

    expect(draft?.customerName).toBe("Northwind Clinics");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://reach-consensus.supabase.co/functions/v1/proposal-drafts?draftId=shared-123&access=owner-token&capability=workspace%3Aread",
      expect.objectContaining({ cache: "no-store" }),
    );
    const headers = new Headers(fetchSpy.mock.calls[0]?.[1]?.headers);
    expect(headers.get("authorization")).toBe("Bearer anon-key");
    expect(headers.get("apikey")).toBe("anon-key");
  });

  it("does not return a draft when the Edge Function rejects the access token", async () => {
    vi.stubEnv("SUPABASE_URL", "https://reach-consensus.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Access denied." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const draft = await readConfiguredSharedDraft(
      "shared-123",
      "wrong-token",
      "preview:read",
    );

    expect(draft).toBeUndefined();
  });
});
