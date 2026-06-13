import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { buildLocalDraft, saveLocalDraft } from "@/lib/reach-consensus/local-drafts";
import { DraftWorkspaceView } from "./DraftWorkspaceView";

describe("DraftWorkspaceView", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens a saved draft workspace with documents and microsite preview", async () => {
    const draft = buildLocalDraft(
      {
        customerName: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem: "Clinical teams need secure AI access.",
        solution: "Cisco connects secure access, networking, and services.",
        solutionAreas: ["security", "networking"],
        selectedSectionIds: ["executive-summary", "platform-story", "services"],
        members: "Avery Stone - Cisco AE",
        documents: [
          {
            id: "doc_architecture_future-state",
            category: "architecture",
            name: "future-state-architecture.pdf",
            fileType: "application/pdf",
            size: 12,
            addedAt: "2026-06-13T15:04:05.000Z",
          },
        ],
      },
      new Date("2026-06-13T15:04:05.000Z"),
    );
    saveLocalDraft(draft);

    render(<DraftWorkspaceView draftId={draft.id} />);

    expect(
      await screen.findByRole("heading", { name: "AI Secure Access Platform" }),
    ).toBeInTheDocument();
    expect(screen.getByText("future-state-architecture.pdf")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customer preview" })).toHaveAttribute(
      "href",
      `/draft/${draft.id}`,
    );
  });
});
