import { describe, expect, it } from "vitest";

import {
  bookmarkCanonicalKey,
  bookmarkScopeLabel,
  bookmarkScopeSummary,
  normalizeBookmarkRanges,
  normalizeRangePoints,
  sortBookmarksCanonical,
} from "@/lib/bookmarks";
import type { Book } from "@/types/bible";
import type { ReaderBookmark } from "@/types/bookmarks";

const books = [
  { name: "Genesis", chapters: [] },
  { name: "Exodus", chapters: [] },
] as Book[];

describe("bookmark helpers", () => {
  it("normalizes and merges bookmark ranges", () => {
    expect(
      normalizeBookmarkRanges([
        { start: 5, end: 3 },
        { start: 6, end: 8 },
        { start: 12, end: 12 },
      ]),
    ).toEqual([
      { start: 3, end: 8 },
      { start: 12, end: 12 },
    ]);
  });

  it("normalizes reversed range points", () => {
    expect(
      normalizeRangePoints(
        { bookIndex: 1, chapterIndex: 2, verseNumber: 4 },
        { bookIndex: 0, chapterIndex: 9, verseNumber: 1 },
      ),
    ).toEqual({
      start: { bookIndex: 0, chapterIndex: 9, verseNumber: 1 },
      end: { bookIndex: 1, chapterIndex: 2, verseNumber: 4 },
    });
  });

  it("formats selection labels and summaries compactly", () => {
    const scope = {
      type: "selection" as const,
      bookIndex: 0,
      chapterIndex: 0,
      ranges: [
        { start: 2, end: 5 },
        { start: 10, end: 14 },
        { start: 23, end: 23 },
      ],
    };

    expect(bookmarkScopeLabel(scope, books)).toBe("Genesis 1:2-5,10-14,23");
    expect(bookmarkScopeSummary(scope, books)).toBe(
      "Selection • Genesis 1:2-5,10-14,23",
    );
    expect(bookmarkCanonicalKey(scope)).toBe("selection:0:0:2-5,10-14,23-23");
  });

  it("sorts bookmarks in canonical order", () => {
    const bookmarks: ReaderBookmark[] = [
      {
        id: "3",
        type: "range",
        scope: {
          type: "range",
          start: { bookIndex: 0, chapterIndex: 0, verseNumber: 5 },
          end: { bookIndex: 0, chapterIndex: 0, verseNumber: 8 },
        },
        label: "",
        note: "",
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: "1",
        type: "chapter",
        scope: { type: "chapter", bookIndex: 0, chapterIndex: 0 },
        label: "",
        note: "",
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: "2",
        type: "verse",
        scope: { type: "verse", bookIndex: 0, chapterIndex: 0, verseNumber: 3 },
        label: "",
        note: "",
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    expect(sortBookmarksCanonical(bookmarks).map((bookmark) => bookmark.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});
