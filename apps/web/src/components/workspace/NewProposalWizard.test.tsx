import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readLocalDrafts } from "@/lib/reach-consensus/local-drafts";
import { NewProposalWizard } from "./NewProposalWizard";

describe("NewProposalWizard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a local proposal draft from guided setup", async () => {
    const user = userEvent.setup();
    const onDraftCreated = vi.fn();

    render(<NewProposalWizard onDraftCreated={onDraftCreated} />);

    await user.type(screen.getByLabelText("Customer name"), "Northwind Clinics");
    await user.type(
      screen.getByLabelText("Opportunity title"),
      "AI Secure Access Platform",
    );
    await user.type(
      screen.getByLabelText("Customer problem"),
      "Clinical teams need secure AI access without fragmenting operations.",
    );
    await user.type(
      screen.getByLabelText("Proposed solution"),
      "Cisco Secure Access, networking, observability, and services become one platform.",
    );
    await user.click(screen.getByLabelText("Security"));
    await user.click(screen.getByLabelText("Networking"));
    await user.upload(
      screen.getByLabelText("Architecture drawings"),
      new File(["future"], "future-state-architecture.pdf", {
        type: "application/pdf",
      }),
    );
    await user.upload(
      screen.getByLabelText("Quote or bill of materials"),
      new File(["bom"], "approved-bom.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Create proposal draft" }));

    await waitFor(() => expect(onDraftCreated).toHaveBeenCalledTimes(1));
    const drafts = readLocalDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({
      customerName: "Northwind Clinics",
      title: "AI Secure Access Platform",
      solutionAreas: ["security", "networking"],
    });
    expect(drafts[0].documents.map((document) => document.name)).toEqual([
      "future-state-architecture.pdf",
      "approved-bom.xlsx",
    ]);
  });
});
