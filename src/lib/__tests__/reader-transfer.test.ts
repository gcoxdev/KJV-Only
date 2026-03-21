import { describe, expect, it } from "vitest";

import {
  createBookmarksExportPayload,
  createNotesExportPayload,
  parseImportedBookmarksPayloadDetailed,
  parseImportedNotesPayloadDetailed,
} from "@/lib/reader-transfer";
import type { ReaderBookmark } from "@/types/bookmarks";
import type { ReaderNote } from "@/types/notes";

const sampleNotes: ReaderNote[] = [
  {
    id: "note-1",
    title: "General note",
    body: "Body",
    scope: { type: "general" },
    createdAt: 1,
    updatedAt: 2,
  },
  {
    id: "note-2",
    title: "Word note",
    body: "Word body",
    scope: {
      type: "word",
      bookIndex: 0,
      chapterIndex: 0,
      verseNumber: 4,
      word: "divided",
    },
    createdAt: 3,
    updatedAt: 4,
  },
];

const sampleBookmarks: ReaderBookmark[] = [
  {
    id: "bookmark-1",
    type: "chapter",
    scope: { type: "chapter", bookIndex: 0, chapterIndex: 0 },
    label: "Genesis 1",
    note: "",
    createdAt: 1,
    updatedAt: 2,
  },
  {
    id: "bookmark-2",
    type: "selection",
    scope: {
      type: "selection",
      bookIndex: 0,
      chapterIndex: 0,
      ranges: [
        { start: 1, end: 2 },
        { start: 4, end: 4 },
      ],
    },
    label: "Genesis 1:1-2,4",
    note: "",
    createdAt: 3,
    updatedAt: 4,
  },
];

describe("reader transfer", () => {
  it("parses wrapped notes exports and preserves valid entries", () => {
    const result = parseImportedNotesPayloadDetailed(
      JSON.stringify(createNotesExportPayload(sampleNotes)),
    );

    expect(result.entries).toEqual(sampleNotes);
    expect(result.totalEntries).toBe(2);
    expect(result.skippedInvalidCount).toBe(0);
    expect(result.source).toBe("wrapped");
  });

  it("normalizes legacy one-based imported notes and skips invalid entries", () => {
    const result = parseImportedNotesPayloadDetailed(
      JSON.stringify([
        {
          ...sampleNotes[1],
          scope: {
            type: "word",
            bookIndex: 1,
            chapterIndex: 1,
            verseNumber: 4,
            word: "divided",
          },
        },
        {
          id: "bad-note",
          title: "Broken note",
        },
      ]),
    );

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]?.scope).toEqual({
      type: "word",
      bookIndex: 0,
      chapterIndex: 0,
      verseNumber: 4,
      word: "divided",
    });
    expect(result.totalEntries).toBe(2);
    expect(result.skippedInvalidCount).toBe(1);
    expect(result.source).toBe("array");
  });

  it("parses wrapped bookmark exports and skips invalid entries", () => {
    const payload = createBookmarksExportPayload(sampleBookmarks);
    const result = parseImportedBookmarksPayloadDetailed(
      JSON.stringify({
        ...payload,
        bookmarks: [
          ...payload.bookmarks,
          {
            id: "bad-bookmark",
            type: "verse",
          },
        ],
      }),
    );

    expect(result.entries).toEqual(sampleBookmarks);
    expect(result.totalEntries).toBe(3);
    expect(result.skippedInvalidCount).toBe(1);
    expect(result.source).toBe("wrapped");
  });

  it("rejects files with no valid note entries", () => {
    expect(() =>
      parseImportedNotesPayloadDetailed(
        JSON.stringify([
          {
            id: "bad-note",
          },
        ]),
      ),
    ).toThrow("The notes file does not contain any valid entries.");
  });
});
