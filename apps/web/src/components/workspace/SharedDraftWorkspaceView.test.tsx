import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SharedDraftWorkspaceView } from "./SharedDraftWorkspaceView";
import type { SharedDraftProposal } from "@/lib/reach-consensus/shared-drafts";

const sharedDraft: SharedDraftProposal = {
  id: "5d4d6d1b-5f66-4e9d-8ffc-a25592f54a8e",
  slug: "northwind-clinics-ai-secure-access-platform",
  customerName: "Northwind Clinics",
  title: "AI Secure Access Platform",
  problem: "Clinical teams need secure AI access.",
  solution: "Cisco Secure Access and networking become one operating platform.",
  solutionAreas: ["security", "networking"],
  oneCiscoStory:
    "Northwind Clinics can turn security and networking into a connected platform architecture.",
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      summary: "CIO-level narrative.",
      status: "draft",
    },
  ],
  members: [],
  documents: [
    {
      id: "doc_architecture_future",
      category: "architecture",
      name: "future-state.pdf",
      fileType: "application/pdf",
      size: 12,
      addedAt: "2026-06-13T16:00:00.000Z",
      storagePath:
        "5d4d6d1b-5f66-4e9d-8ffc-a25592f54a8e/architecture/doc_architecture_future-future-state.pdf",
      digestStatus: "queued",
      customerDownloadEnabled: false,
      uploadStatus: "uploaded",
    },
  ],
  currentAccess: {
    token: "owner-token",
    role: "owner",
    label: "Cisco workspace",
    capabilities: ["workspace:read", "workspace:write", "preview:read"],
    workspaceUrl:
      "/proposals/shared/5d4d6d1b-5f66-4e9d-8ffc-a25592f54a8e?access=owner-token",
    previewUrl:
      "/draft/shared/5d4d6d1b-5f66-4e9d-8ffc-a25592f54a8e?access=owner-token",
  },
  createdAt: "2026-06-13T16:00:00.000Z",
  updatedAt: "2026-06-13T16:00:00.000Z",
};

describe("SharedDraftWorkspaceView", () => {
  it("shows a persisted proposal draft workspace", () => {
    render(<SharedDraftWorkspaceView draft={sharedDraft} />);

    expect(
      screen.getByRole("heading", { name: "AI Secure Access Platform" }),
    ).toBeInTheDocument();
    expect(screen.getByText("future-state.pdf")).toBeInTheDocument();
    expect(screen.getByText("Cisco workspace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customer preview" })).toHaveAttribute(
      "href",
      `/draft/shared/${sharedDraft.id}?access=owner-token`,
    );
  });
});
