import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SharedDraftMicrositePreview } from "./SharedDraftMicrositePreview";
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
  documents: [],
  currentAccess: {
    token: "customer-token",
    role: "customer",
    label: "Customer preview",
    capabilities: ["preview:read", "comment:create"],
    previewUrl:
      "/draft/shared/5d4d6d1b-5f66-4e9d-8ffc-a25592f54a8e?access=customer-token",
  },
  createdAt: "2026-06-13T16:00:00.000Z",
  updatedAt: "2026-06-13T16:00:00.000Z",
};

describe("SharedDraftMicrositePreview", () => {
  it("renders a shared draft customer preview", () => {
    render(<SharedDraftMicrositePreview draft={sharedDraft} />);

    expect(
      screen.getByRole("heading", {
        name: "Northwind Clinics: AI Secure Access Platform",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Customer preview")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Back to workspace" })).not.toBeInTheDocument();
  });
});
