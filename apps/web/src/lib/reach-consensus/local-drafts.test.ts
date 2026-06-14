import { beforeEach, describe, expect, it } from "vitest";
import {
  buildLocalDraft,
  documentMetadataFromFiles,
  readLocalDrafts,
  saveLocalDraft,
} from "./local-drafts";

describe("local proposal drafts", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("builds a One Cisco draft from guided setup inputs", () => {
    const documents = documentMetadataFromFiles("architecture", [
      new File(["future"], "future-state-architecture.pdf", {
        type: "application/pdf",
      }),
    ]);

    const draft = buildLocalDraft(
      {
        customerName: "Northwind Clinics",
        title: "AI Secure Access Platform",
        problem:
          "Clinical teams need secure AI access without fragmenting network operations.",
        solution:
          "Cisco Secure Access, campus networking, observability, and services become one operating platform.",
        solutionAreas: ["security", "networking", "observability"],
        selectedSectionIds: [
          "executive-summary",
          "platform-story",
          "reference-architecture",
          "services",
        ],
        members: "Avery Stone - Cisco AE\nMorgan Patel - Customer CIO",
        documents,
      },
      new Date("2026-06-13T15:04:05.000Z"),
    );

    expect(draft.id).toBe("draft_northwind-clinics-ai-secure-access-platform_20260613T150405");
    expect(draft.slug).toBe("northwind-clinics-ai-secure-access-platform");
    expect(draft.oneCiscoStory).toContain("Northwind Clinics");
    expect(draft.oneCiscoStory).toContain("security, networking, and observability");
    expect(draft.sections.map((section) => section.title)).toEqual([
      "Executive Summary",
      "Platform Story",
      "Reference Architecture",
      "Services",
    ]);
    expect(draft.documents).toMatchObject([
      {
        category: "architecture",
        name: "future-state-architecture.pdf",
        fileType: "application/pdf",
      },
    ]);
    expect(draft.members).toEqual([
      { id: "member_avery-stone-cisco-ae", name: "Avery Stone", organization: "Cisco AE" },
      {
        id: "member_morgan-patel-customer-cio",
        name: "Morgan Patel",
        organization: "Customer CIO",
      },
    ]);
  });

  it("stores newest local drafts first", () => {
    const firstDraft = buildLocalDraft(
      {
        customerName: "Acme Health",
        title: "Network Refresh",
        problem: "Legacy network operations slow new clinical programs.",
        solution: "Modernize network and security with Cisco.",
        solutionAreas: ["networking"],
        selectedSectionIds: ["executive-summary"],
        members: "",
        documents: [],
      },
      new Date("2026-06-13T12:00:00.000Z"),
    );
    const secondDraft = buildLocalDraft(
      {
        customerName: "Globex",
        title: "Platform Transformation",
        problem: "Multiple architectures are being sold as disconnected projects.",
        solution: "Connect security, networking, and services into one platform story.",
        solutionAreas: ["security", "services"],
        selectedSectionIds: ["platform-story", "services"],
        members: "",
        documents: [],
      },
      new Date("2026-06-13T12:05:00.000Z"),
    );

    saveLocalDraft(firstDraft);
    saveLocalDraft(secondDraft);

    expect(readLocalDrafts().map((draft) => draft.id)).toEqual([
      secondDraft.id,
      firstDraft.id,
    ]);
  });
});
