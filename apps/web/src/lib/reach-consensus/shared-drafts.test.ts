import { describe, expect, it, vi } from "vitest";
import {
  createSharedDraft,
  mapSharedDraftRows,
  proposalDraftFormDataFromIntake,
  readSharedDraftWithAccess,
  type SharedDraftReadStore,
  type SharedDraftStore,
} from "./shared-drafts";

describe("shared proposal drafts", () => {
  it("persists guided intake with uploaded document records", async () => {
    const store: SharedDraftStore = {
      insertDraft: vi.fn().mockResolvedValue(undefined),
      insertAccessTokens: vi.fn().mockResolvedValue(undefined),
      uploadDocument: vi
        .fn()
        .mockResolvedValueOnce({ storagePath: "proposal-drafts/shared-123/architecture.pdf" }),
      insertDocuments: vi.fn().mockResolvedValue(undefined),
    };

    const result = await createSharedDraft(
      {
        customerName: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem: "Clinical teams need secure AI access.",
        solution: "Cisco Secure Access and networking become one operating platform.",
        solutionAreas: ["security", "networking"],
        selectedSectionIds: ["executive-summary", "platform-story"],
        members: "Avery Stone - Cisco AE",
      },
      [
        {
          category: "architecture",
          file: new File(["future"], "architecture.pdf", { type: "application/pdf" }),
        },
      ],
      store,
      {
        id: "shared-123",
        now: new Date("2026-06-13T16:00:00.000Z"),
        accessTokenFactory: vi
          .fn()
          .mockReturnValueOnce("owner-token")
          .mockReturnValueOnce("customer-token"),
      },
    );

    expect(store.insertDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "shared-123",
        customer_name: "Northwind Clinics",
        title: "AI Secure Access Platform",
        solution_areas: ["security", "networking"],
        selected_section_ids: ["executive-summary", "platform-story"],
      }),
    );
    expect(store.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "shared-123" }),
      expect.objectContaining({ name: "architecture.pdf" }),
      expect.any(File),
    );
    expect(store.insertDocuments).toHaveBeenCalledWith([
      expect.objectContaining({
        draft_id: "shared-123",
        name: "architecture.pdf",
        storage_path: "proposal-drafts/shared-123/architecture.pdf",
        digest_status: "queued",
      }),
    ]);
    expect(store.insertAccessTokens).toHaveBeenCalledWith([
      expect.objectContaining({
        draft_id: "shared-123",
        role: "owner",
        token_hash: expect.not.stringContaining("owner-token"),
        capabilities: ["workspace:read", "workspace:write", "preview:read"],
      }),
      expect.objectContaining({
        draft_id: "shared-123",
        role: "customer",
        token_hash: expect.not.stringContaining("customer-token"),
        capabilities: ["preview:read", "comment:create"],
      }),
    ]);
    expect(result.workspaceUrl).toBe("/proposals/shared/shared-123?access=owner-token");
    expect(result.previewUrl).toBe("/draft/shared/shared-123?access=customer-token");
    expect(result.accessLinks).toEqual([
      expect.objectContaining({
        label: "Cisco workspace",
        role: "owner",
        url: "/proposals/shared/shared-123?access=owner-token",
      }),
      expect.objectContaining({
        label: "Customer preview",
        role: "customer",
        url: "/draft/shared/shared-123?access=customer-token",
      }),
    ]);
    expect(result.draft.documents[0]).toMatchObject({
      name: "architecture.pdf",
      uploadStatus: "uploaded",
      digestStatus: "queued",
    });
    expect(result.draft.currentAccess).toMatchObject({
      role: "owner",
      label: "Cisco workspace",
      capabilities: ["workspace:read", "workspace:write", "preview:read"],
      previewUrl: "/draft/shared/shared-123?access=owner-token",
    });
  });

  it("maps stored rows back into a shared proposal draft", () => {
    const draft = mapSharedDraftRows(
      {
        id: "shared-123",
        slug: "northwind-clinics-ai-secure-access-platform",
        customer_name: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem: "Clinical teams need secure AI access.",
        solution: "Cisco Secure Access and networking become one operating platform.",
        one_cisco_story:
          "Northwind Clinics can turn security and networking into a connected platform architecture.",
        solution_areas: ["security", "networking"],
        selected_section_ids: ["executive-summary", "platform-story"],
        members: [{ id: "member_avery", name: "Avery Stone", organization: "Cisco AE" }],
        sections: [
          {
            id: "executive-summary",
            title: "Executive Summary",
            summary: "CIO-level narrative.",
            status: "draft",
          },
        ],
        created_at: "2026-06-13T16:00:00.000Z",
        updated_at: "2026-06-13T16:00:00.000Z",
      },
      [
        {
          id: "doc-1",
          draft_id: "shared-123",
          category: "architecture",
          name: "architecture.pdf",
          file_type: "application/pdf",
          size: 6,
          storage_path: "proposal-drafts/shared-123/architecture.pdf",
          digest_status: "queued",
          customer_download_enabled: false,
          created_at: "2026-06-13T16:00:00.000Z",
        },
      ],
    );

    expect(draft).toMatchObject({
      id: "shared-123",
      customerName: "Northwind Clinics",
      documents: [
        {
          id: "doc-1",
          storagePath: "proposal-drafts/shared-123/architecture.pdf",
          digestStatus: "queued",
          uploadStatus: "uploaded",
        },
      ],
    });
  });

  it("reads a shared draft only when the scoped access token includes the requested capability", async () => {
    const store = {
      getAccessToken: vi.fn().mockResolvedValue({
        id: "access_customer_shared-123",
        draft_id: "shared-123",
        token_hash: "hashed-token",
        role: "customer",
        label: "Customer preview",
        capabilities: ["preview:read", "comment:create"],
        created_at: "2026-06-13T16:00:00.000Z",
        last_used_at: null,
      }),
      markAccessTokenUsed: vi.fn().mockResolvedValue(undefined),
      getDraftRows: vi.fn().mockResolvedValue({
        draft: {
          id: "shared-123",
          slug: "northwind-clinics-ai-secure-access-platform",
          customer_name: "Northwind Clinics",
          title: "AI Secure Access Platform",
          problem: "Clinical teams need secure AI access.",
          solution: "Cisco Secure Access and networking become one operating platform.",
          one_cisco_story:
            "Northwind Clinics can turn security and networking into a connected platform architecture.",
          solution_areas: ["security", "networking"],
          selected_section_ids: ["executive-summary", "platform-story"],
          members: [{ id: "member_avery", name: "Avery Stone", organization: "Cisco AE" }],
          sections: [],
          created_at: "2026-06-13T16:00:00.000Z",
          updated_at: "2026-06-13T16:00:00.000Z",
        },
        documents: [],
      }),
    } satisfies SharedDraftReadStore;

    const draft = await readSharedDraftWithAccess(
      "shared-123",
      "customer-token",
      "preview:read",
      store,
    );

    expect(store.getAccessToken).toHaveBeenCalledWith(
      "shared-123",
      expect.not.stringContaining("customer-token"),
    );
    expect(store.markAccessTokenUsed).toHaveBeenCalledWith(
      "access_customer_shared-123",
      expect.any(String),
    );
    expect(draft?.currentAccess).toMatchObject({
      role: "customer",
      label: "Customer preview",
      previewUrl: "/draft/shared/shared-123?access=customer-token",
    });
    expect(draft?.currentAccess?.workspaceUrl).toBeUndefined();
  });

  it("does not read a shared draft when the scoped access token lacks the capability", async () => {
    const store = {
      getAccessToken: vi.fn().mockResolvedValue({
        id: "access_customer_shared-123",
        draft_id: "shared-123",
        token_hash: "hashed-token",
        role: "customer",
        label: "Customer preview",
        capabilities: ["preview:read", "comment:create"],
        created_at: "2026-06-13T16:00:00.000Z",
        last_used_at: null,
      }),
      markAccessTokenUsed: vi.fn().mockResolvedValue(undefined),
      getDraftRows: vi.fn().mockResolvedValue(undefined),
    } satisfies SharedDraftReadStore;

    const draft = await readSharedDraftWithAccess(
      "shared-123",
      "customer-token",
      "workspace:read",
      store,
    );

    expect(draft).toBeUndefined();
    expect(store.getDraftRows).not.toHaveBeenCalled();
    expect(store.markAccessTokenUsed).not.toHaveBeenCalled();
  });

  it("serializes wizard intake and files into multipart form data", async () => {
    const formData = proposalDraftFormDataFromIntake(
      {
        customerName: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem: "Clinical teams need secure AI access.",
        solution: "Cisco Secure Access and networking become one operating platform.",
        solutionAreas: ["security"],
        selectedSectionIds: ["executive-summary"],
        members: "",
      },
      [
        {
          category: "quote",
          file: new File(["bom"], "approved-bom.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        },
      ],
    );

    expect(JSON.parse(String(formData.get("payload")))).toMatchObject({
      customerName: "Northwind Clinics",
      solutionAreas: ["security"],
    });
    expect(JSON.parse(String(formData.get("fileCategories")))).toEqual(["quote"]);
    expect((formData.getAll("files")[0] as File).name).toBe("approved-bom.xlsx");
  });
});
