import { describe, expect, it } from "vitest";

import { formatReferenceCitation } from "@/hooks/use-reference-preview";

describe("formatReferenceCitation", () => {
  it("formats single-verse citations with chapter and verse", () => {
    expect(formatReferenceCitation("Luke", 2, 38, 2, 38)).toBe("Luke 3:38");
  });

  it("formats same-chapter ranges compactly", () => {
    expect(formatReferenceCitation("Genesis", 4, 3, 4, 8)).toBe("Genesis 5:3-8");
  });

  it("formats cross-chapter ranges with both chapter markers", () => {
    expect(formatReferenceCitation("Genesis", 3, 24, 4, 2)).toBe("Genesis 4:24-5:2");
  });
});
