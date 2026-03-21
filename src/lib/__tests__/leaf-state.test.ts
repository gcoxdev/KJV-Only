import { describe, expect, it } from "vitest";

import {
  clearSingleLeafReferenceIfMissing,
  filterRecordEntries,
  swapRecordEntries,
  swapSingleLeafReference,
} from "@/lib/leaf-state";

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

  it("preserves note-word-link highlight details when a panel moves", () => {
    expect(
      swapSingleLeafReference(
        {
          leafId: "left",
          verseNumber: 6,
          word: "firmament",
        },
        "left",
        "right",
      ),
    ).toEqual({
      leafId: "right",
      verseNumber: 6,
      word: "firmament",
    });
  });

  it("preserves pending reader scroll details when a panel moves", () => {
    expect(
      swapSingleLeafReference(
        {
          leafId: "left",
          bookIndex: 0,
          chapterIndex: 0,
          mode: "verse-range",
          verseStart: 5,
          verseEnd: 7,
        },
        "left",
        "right",
      ),
    ).toEqual({
      leafId: "right",
      bookIndex: 0,
      chapterIndex: 0,
      mode: "verse-range",
      verseStart: 5,
      verseEnd: 7,
    });
  });

  it("filters record entries to the current leaf set", () => {
    expect(
      filterRecordEntries(
        {
          a: { value: "keep" },
          b: { value: "drop" },
        },
        new Set(["a"]),
      ),
    ).toEqual({
      a: { value: "keep" },
    });
  });

  it("clears single-leaf references when their leaf disappears", () => {
    expect(
      clearSingleLeafReferenceIfMissing(
        { leafId: "a", mode: "chapter-top" },
        new Set(["b"]),
      ),
    ).toBeNull();
    expect(
      clearSingleLeafReferenceIfMissing(
        { leafId: "a", mode: "chapter-top" },
        new Set(["a", "b"]),
      ),
    ).toEqual({ leafId: "a", mode: "chapter-top" });
  });

  it("clears note-word-link highlight refs when their panel is removed", () => {
    expect(
      clearSingleLeafReferenceIfMissing(
        {
          leafId: "a",
          verseNumber: 6,
          word: "firmament",
        },
        new Set(["b"]),
      ),
    ).toBeNull();
  });

  it("clears pending reader scroll refs when their panel is removed", () => {
    expect(
      clearSingleLeafReferenceIfMissing(
        {
          leafId: "a",
          bookIndex: 0,
          chapterIndex: 0,
          mode: "verse-range",
          verseStart: 5,
          verseEnd: 7,
        },
        new Set(["b"]),
      ),
    ).toBeNull();
  });
});
