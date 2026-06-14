import { describe, expect, it } from "vitest";
import { isPublishedSection, type SectionLike, visibleSectionsForCustomer } from "./types";

describe("proposal section visibility", () => {
  it("shows only published sections to customers", () => {
    const sections: SectionLike[] = [
      { id: "exec", title: "Executive Summary", status: "published" },
      { id: "services", title: "Services", status: "approved" },
      { id: "licensing", title: "Licensing", status: "draft" },
    ];

    expect(visibleSectionsForCustomer(sections)).toEqual([
      { id: "exec", title: "Executive Summary", status: "published" },
    ]);
  });

  it("identifies published sections", () => {
    expect(isPublishedSection({ id: "a", title: "A", status: "published" })).toBe(true);
    expect(isPublishedSection({ id: "b", title: "B", status: "approved" })).toBe(false);
  });
});
