import { describe, expect, it, vi } from "vitest";
import {
  createSharedDraft,
  mapSharedDraftRows,
  proposalDraftFormDataFromIntake,
  type SharedDraftStore,
} from "./shared-drafts";

describe("shared proposal drafts", () => {
  it("persists guided intake with uploaded document records", async () => {
    const store: SharedDraftStore = {
      insertDraft: vi.fn().mockResolvedValue(undefined),
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
    expect(result.workspaceUrl).toBe("/proposals/shared/shared-123");
    expect(result.previewUrl).toBe("/draft/shared/shared-123");
    expect(result.draft.documents[0]).toMatchObject({
      name: "architecture.pdf",
      uploadStatus: "uploaded",
      digestStatus: "queued",
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
