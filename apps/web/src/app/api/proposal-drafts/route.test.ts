import { afterEach, describe, expect, it, vi } from "vitest";

function formDataForDraft() {
  const formData = new FormData();
  formData.set(
    "payload",
    JSON.stringify({
      customerName: "Northwind Clinics",
      title: "AI-ready network",
      problem: "Fragmented architecture.",
      solution: "One Cisco platform.",
      solutionAreas: ["security"],
      selectedSectionIds: ["executive-summary"],
      members: "",
    }),
  );
  formData.set("fileCategories", JSON.stringify([]));
  return formData;
}

describe("proposal draft API route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("forwards proposal draft creation to a Supabase Edge Function when no service key is configured", async () => {
    vi.stubEnv("SUPABASE_URL", "https://reach-consensus.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          kind: "shared",
          draft: { id: "shared-123", customerName: "Northwind Clinics" },
          workspaceUrl: "/proposals/shared/shared-123",
          previewUrl: "/draft/shared/shared-123",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );
    const { POST } = await import("./route");

    const response = await POST(
      new Request("https://reach-consensus.test/api/proposal-drafts", {
        method: "POST",
        body: formDataForDraft(),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      kind: "shared",
      workspaceUrl: "/proposals/shared/shared-123",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://reach-consensus.supabase.co/functions/v1/proposal-drafts",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const requestInit = fetchSpy.mock.calls[0]?.[1];
    expect(requestInit?.body).toBeTruthy();
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("authorization")).toBe("Bearer anon-key");
    expect(headers.get("apikey")).toBe("anon-key");
  });
});
