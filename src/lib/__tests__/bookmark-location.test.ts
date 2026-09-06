import { describe, expect, it } from "vitest";
import corpusJson from "../../../public/data/kjv.json?raw";
import { parseBookmarkLocation, parseReferenceCommandInput } from "@/lib/reference-command";
import { bookmarkScopeLabel } from "@/lib/bookmarks";
import { createBookmarksExportPayload, parseImportedBookmarksPayloadDetailed } from "@/lib/reader-transfer";
import type { Book } from "@/types/bible";
import type { BookmarkScope } from "@/types/bookmarks";

const { books } = JSON.parse(corpusJson) as { books: Book[] };

describe("bookmark location editing", () => {
  it.each([
    ["John 3", { type: "chapter", bookIndex: 42, chapterIndex: 2 }],
    ["John 3:16", { type: "verse", bookIndex: 42, chapterIndex: 2, verseNumber: 16 }],
    ["Psalms 23:1-3", { type: "selection", bookIndex: 18, chapterIndex: 22, ranges: [{ start: 1, end: 3 }] }],
    ["Genesis 1:1,4-6", { type: "selection", bookIndex: 0, chapterIndex: 0, ranges: [{ start: 1, end: 1 }, { start: 4, end: 6 }] }],
    ["Genesis 1:31-Genesis 2:3", { type: "range", start: { bookIndex: 0, chapterIndex: 0, verseNumber: 31 }, end: { bookIndex: 0, chapterIndex: 1, verseNumber: 3 } }],
  ])("parses %s without changing its destination", (input, expected) => {
    expect(parseBookmarkLocation(input as string, books)).toEqual(expected);
  });

  it.each(["", "John 3:99", "John 3:16-999", "John 999", "John 3:16 garbage", "garbage John 3:16", "John 999; John 3:16", "4 John 3:16", "John 3:16; Romans 8:1", "Genesis 1:0", "John 3:20-16"])("rejects invalid or multiple destinations: %s", (input) => {
    expect(parseBookmarkLocation(input, books)).toBeNull();
  });

  it("preserves cross-chapter endpoint verses in the reference command too", () => {
    expect(parseReferenceCommandInput("Genesis 1:31-2:3", books).targets[0].target).toEqual({
      type: "range", start: { bookIndex: 0, chapterIndex: 0, verseNumber: 31 }, end: { bookIndex: 0, chapterIndex: 1, verseNumber: 3 },
    });
  });

  it("round-trips edited destinations independently of their label and organization", () => {
    const scope = parseBookmarkLocation("John 3:16", books)!;
    const bookmark = { id: "saved", label: "Love", scope, type: scope.type, note: "My note", folder: "Study", tags: ["Faith"], createdAt: 1, updatedAt: 2 };
    const imported = parseImportedBookmarksPayloadDetailed(JSON.stringify(createBookmarksExportPayload([bookmark]))).entries[0];
    expect(imported).toEqual(bookmark);
    expect(bookmarkScopeLabel(imported.scope, books)).toBe("John 3:16");
  });

  it("can edit the formatted location for each existing bookmark shape", () => {
    const scopes: BookmarkScope[] = [
      { type: "chapter", bookIndex: 0, chapterIndex: 0 },
      { type: "verse", bookIndex: 0, chapterIndex: 0, verseNumber: 3 },
      { type: "selection", bookIndex: 0, chapterIndex: 0, ranges: [{ start: 1, end: 2 }, { start: 4, end: 4 }] },
      { type: "range", start: { bookIndex: 0, chapterIndex: 49, verseNumber: 26 }, end: { bookIndex: 1, chapterIndex: 0, verseNumber: 3 } },
    ];
    for (const scope of scopes) expect(parseBookmarkLocation(bookmarkScopeLabel(scope, books), books)).toEqual(scope);
  });
});
