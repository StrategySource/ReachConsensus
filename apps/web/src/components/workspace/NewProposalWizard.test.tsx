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

  it("creates a shared proposal draft when the persistence API is configured", async () => {
    const user = userEvent.setup();
    const onDraftCreated = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          kind: "shared",
          draft: { id: "shared-123", customerName: "Northwind Clinics" },
          workspaceUrl: "/proposals/shared/shared-123",
          previewUrl: "/draft/shared/shared-123",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<NewProposalWizard onDraftCreated={onDraftCreated} />);

    await user.type(screen.getByLabelText("Customer name"), "Northwind Clinics");
    await user.type(
      screen.getByLabelText("Opportunity title"),
      "AI Secure Access Platform",
    );
    await user.type(
      screen.getByLabelText("Customer problem"),
      "Clinical teams need secure AI access.",
    );
    await user.type(
      screen.getByLabelText("Proposed solution"),
      "Cisco Secure Access and networking become one platform.",
    );
    await user.click(screen.getByLabelText("Security"));
    await user.upload(
      screen.getByLabelText("Architecture drawings"),
      new File(["future"], "future-state-architecture.pdf", {
        type: "application/pdf",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Create proposal draft" }));

    await waitFor(() =>
      expect(onDraftCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "shared",
          workspaceUrl: "/proposals/shared/shared-123",
        }),
      ),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/proposal-drafts",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
    expect(readLocalDrafts()).toHaveLength(0);

    fetchSpy.mockRestore();
  });
});
