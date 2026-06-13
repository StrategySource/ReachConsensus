import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { buildLocalDraft, saveLocalDraft } from "@/lib/reach-consensus/local-drafts";
import { LocalDraftProposalList } from "./LocalDraftProposalList";

describe("LocalDraftProposalList", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows locally created draft proposals with workspace and preview links", async () => {
    const draft = buildLocalDraft(
      {
        customerName: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem: "Clinical teams need secure AI access.",
        solution: "Cisco connects secure access, networking, and services.",
        solutionAreas: ["security", "networking"],
        selectedSectionIds: ["executive-summary", "platform-story"],
        members: "",
        documents: [],
      },
      new Date("2026-06-13T15:04:05.000Z"),
    );
    saveLocalDraft(draft);

    render(<LocalDraftProposalList />);

    expect(
      await screen.findByRole("heading", { name: "Local draft proposals" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open workspace" })).toHaveAttribute(
      "href",
      `/proposals/local/${draft.id}`,
    );
    expect(screen.getByRole("link", { name: "Preview microsite" })).toHaveAttribute(
      "href",
      `/draft/${draft.id}`,
    );
  });
});
