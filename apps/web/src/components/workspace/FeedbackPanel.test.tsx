import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { starterProposal } from "@/lib/reach-consensus/fixtures";
import { FeedbackPanel } from "./FeedbackPanel";

describe("FeedbackPanel", () => {
  it("shows comments and change requests", () => {
    const proposal = {
      ...starterProposal,
      comments: [
        {
          id: "comment_1",
          sectionId: "section_services",
          authorName: "Riley Chen",
          authorRole: "customer_commenter" as const,
          body: "Please clarify services ownership.",
          createdAt: "2026-06-09T12:00:00.000Z",
        },
      ],
      changeRequests: [
        {
          id: "cr_1",
          sectionId: "section_services",
          title: "Clarify customer feedback",
          body: "Please clarify services ownership.",
          ownerName: "Jordan Lee",
          status: "open" as const,
          dueDate: "2026-06-15",
        },
      ],
    };

    render(<FeedbackPanel proposal={proposal} />);

    expect(screen.getAllByText("Please clarify services ownership.")).toHaveLength(2);
    expect(screen.getByText("Clarify customer feedback")).toBeInTheDocument();
  });
});
