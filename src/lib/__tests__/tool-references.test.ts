import { describe, expect, it } from "vitest";

import { orderToolReferences } from "@/lib/tool-references";

describe("tool reference ordering", () => {
  it("sorts references in canonical book, chapter, and verse order", () => {
    const ordered = orderToolReferences([
      "REV.1.1",
      "GEN.2.1",
      "MAT.1.1",
      "GEN.1.10",
      "GEN.1.2-4",
      "GEN.1.2",
      "not-a-reference",
      "also-invalid",
    ]);

    expect(ordered.map((entry) => entry.reference)).toEqual([
      "GEN.1.2",
      "GEN.1.2-4",
      "GEN.1.10",
      "GEN.2.1",
      "MAT.1.1",
      "REV.1.1",
      "not-a-reference",
      "also-invalid",
    ]);
  });

  it("preserves duplicate and invalid-reference order", () => {
    const ordered = orderToolReferences([
      "HEB.11.3",
      "invalid-b",
      "HEB.11.3",
      "invalid-a",
    ]);

    expect(ordered.map((entry) => entry.originalIndex)).toEqual([0, 2, 1, 3]);
  });
});
