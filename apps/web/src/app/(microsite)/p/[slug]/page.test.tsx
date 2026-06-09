import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { proposalRepository } from "@/lib/reach-consensus/repository";
import type { PublishedProposalSnapshot } from "@/lib/reach-consensus/types";
import CustomerMicrositePage from "./page";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/reach-consensus/repository", () => ({
  proposalRepository: {
    getPublishedProposalBySlug: vi.fn(),
  },
}));

const getPublishedProposalBySlug = vi.mocked(proposalRepository.getPublishedProposalBySlug);

describe("CustomerMicrositePage", () => {
  it("renders the published snapshot for the requested slug", async () => {
    const snapshot: PublishedProposalSnapshot = {
      id: starterProposal.id,
      slug: starterProposal.slug,
      customerName: starterProposal.customerName,
      title: "Published microsite title",
      oneCiscoStory: "Published microsite story.",
      sections: starterProposal.sections
        .filter((section) => section.status === "approved")
        .map((section) => ({ ...section, status: "published" as const })),
    };
    getPublishedProposalBySlug.mockResolvedValue(snapshot);

    const page = await CustomerMicrositePage({
      params: Promise.resolve({ slug: starterProposal.slug }),
    });

    render(page);

    expect(getPublishedProposalBySlug).toHaveBeenCalledWith(starterProposal.slug);
    expect(
      screen.getByRole("heading", {
        name: "Acme Health: Published microsite title",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Services" })).not.toBeInTheDocument();
  });

  it("returns not found when the slug has no published snapshot", async () => {
    getPublishedProposalBySlug.mockResolvedValue(undefined);

    await expect(
      CustomerMicrositePage({
        params: Promise.resolve({ slug: starterProposal.slug }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getPublishedProposalBySlug).toHaveBeenCalledWith(starterProposal.slug);
  });
});
