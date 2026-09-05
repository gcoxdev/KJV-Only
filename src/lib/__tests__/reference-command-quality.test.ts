import { describe, expect, it } from "vitest";

import { parseReferenceCommandInput } from "@/lib/reference-command";
import { BOOK_ICON_CODES } from "@/lib/references";
import type { Book } from "@/types/bible";

// Small command fixture: verse references use the parser's canonical limits.
// Full chapter data is unnecessary for these typo and rejection cases.
const names: Record<number, string> = {
  0: "Genesis", 18: "Psalms", 39: "Matthew", 42: "John",
  45: "1 Corinthians", 49: "Philippians", 51: "1 Thessalonians",
  52: "2 Thessalonians", 61: "1 John", 62: "2 John", 63: "3 John",
};
const books: Book[] = BOOK_ICON_CODES.map((code, index) => ({
  name: names[index] ?? code,
  chapters: [],
}));

describe("reviewed Bible reference typo corpus", () => {
  it.each([
    ["Philipians 4:13", 49, 3, 13],
    ["Genesus 1:1", 0, 0, 1],
    ["Genisis 1:1", 0, 0, 1],
    ["Mathew 5:9", 39, 4, 9],
    ["Pslams 23:1", 18, 22, 1],
    ["  pHiLiPiAnS 4:13  ", 49, 3, 13],
    ["1 Corintians 13:4", 45, 12, 4],
    ["1 Thessalonians 5:16", 51, 4, 16],
    ["II Thessalonians 3:3", 52, 2, 3],
    ["1 Jn 4:8", 61, 3, 8],
    ["2 Jn 1:6", 62, 0, 6],
    ["3 Jn 1:4", 63, 0, 4],
  ])("resolves %s to the intended verse", (input, bookIndex, chapterIndex, verseNumber) => {
    expect(parseReferenceCommandInput(input, books).targets.map(({ target }) => target))
      .toEqual([{ type: "verse", bookIndex, chapterIndex, verseNumber }]);
  });

  it.each([
    ["Philipians", 49], ["Genesus", 0], ["Genisis", 0],
    ["Mathew", 39], ["Pslams", 18],
  ])("opens the first chapter for the bare book typo %s", (input, bookIndex) => {
    expect(parseReferenceCommandInput(input, books).targets.map(({ target }) => target))
      .toEqual([{ type: "chapter", bookIndex, chapterIndex: 0 }]);
  });

  it.each([
    "", "   ", ";;;", "12345", "Bananas 3:16", "NotABook 1:1",
    "Genesus 99:1", "Pslams 151:1", "John 3:999", "4 John 1:1", "Tobit 1:1",
    "IV John 1:1", "2 Genesis 1:1", "John 3:16; 4 John 1:1",
    "4 John 1:1-3", "4John1:1", "4. John 1:1",
  ])("does not invent a navigation target for %j", (input) => {
    expect(parseReferenceCommandInput(input, books).targets).toEqual([]);
  });

  it("preserves separate targets in a mixed misspelled reference list", () => {
    expect(parseReferenceCommandInput("Mathew 5:9; Philipians 4:13", books).targets)
      .toEqual([
        { label: "Matthew 5:9", target: { type: "verse", bookIndex: 39, chapterIndex: 4, verseNumber: 9 } },
        { label: "Philippians 4:13", target: { type: "verse", bookIndex: 49, chapterIndex: 3, verseNumber: 13 } },
      ]);
  });

  it("retains a valid verse list before a new book", () => {
    expect(parseReferenceCommandInput("John 3:16, 4; Mathew 5:9", books).targets)
      .toHaveLength(2);
  });
});
