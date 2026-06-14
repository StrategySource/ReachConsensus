import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { buildLocalDraft, saveLocalDraft } from "@/lib/reach-consensus/local-drafts";
import { DraftMicrositePreview } from "./DraftMicrositePreview";

describe("DraftMicrositePreview", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the draft proposal site with a path back to the workspace", async () => {
    const draft = buildLocalDraft(
      {
        customerName: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem: "Clinical teams need secure AI access.",
        solution: "Cisco connects secure access, networking, and services.",
        solutionAreas: ["security", "networking"],
        selectedSectionIds: ["executive-summary", "platform-story"],
        members: "",
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

    render(<DraftMicrositePreview draftId={draft.id} />);

    expect(
      await screen.findByRole("heading", {
        name: "Northwind Clinics: AI Secure Access Platform",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("future-state-architecture.pdf")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to workspace" })).toHaveAttribute(
      "href",
      `/proposals/local/${draft.id}`,
    );
  });
});
