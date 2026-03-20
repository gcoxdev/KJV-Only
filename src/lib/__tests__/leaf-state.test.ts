import { describe, expect, it } from "vitest";

import { swapRecordEntries, swapSingleLeafReference } from "@/lib/leaf-state";

describe("leaf state helpers", () => {
  it("swaps record entries between leaf ids", () => {
    expect(
      swapRecordEntries(
        {
          a: { value: "source" },
          b: { value: "target" },
        },
        "a",
        "b",
      ),
    ).toEqual({
      a: { value: "target" },
      b: { value: "source" },
    });
  });

  it("moves sparse record entries between leaf ids", () => {
    expect(
      swapRecordEntries(
        {
          a: { value: "source" },
        },
        "a",
        "b",
      ),
    ).toEqual({
      b: { value: "source" },
    });
  });

  it("swaps a single leaf reference", () => {
    expect(
      swapSingleLeafReference(
        { leafId: "a", mode: "chapter-top" },
        "a",
        "b",
      ),
    ).toEqual({ leafId: "b", mode: "chapter-top" });
    expect(
      swapSingleLeafReference(
        { leafId: "b", mode: "chapter-top" },
        "a",
        "b",
      ),
    ).toEqual({ leafId: "a", mode: "chapter-top" });
    expect(
      swapSingleLeafReference(
        { leafId: "c", mode: "chapter-top" },
        "a",
        "b",
      ),
    ).toEqual({ leafId: "c", mode: "chapter-top" });
  });
});
