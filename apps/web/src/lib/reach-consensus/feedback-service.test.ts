import { describe, expect, it } from "vitest";
import { createChangeRequestFromComment } from "./feedback-service";

describe("feedback-service", () => {
  it("converts a customer comment into a tracked change request", () => {
    const request = createChangeRequestFromComment({
      commentId: "comment_1",
      sectionId: "section_services",
      body: "Please clarify which team owns advanced configuration.",
      ownerName: "Jordan Lee",
      dueDate: "2026-06-15",
    });

    expect(request.title).toBe("Clarify customer feedback");
    expect(request.status).toBe("open");
    expect(request.sectionId).toBe("section_services");
    expect(request.body).toContain("advanced configuration");
  });
});
