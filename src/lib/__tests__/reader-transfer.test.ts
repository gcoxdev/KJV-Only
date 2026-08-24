import { describe, expect, it } from "vitest";

import {
  READER_TRANSFER_LIMITS,
  assertReaderEntryMergeLimit,
  assertReaderImportFileSize,
  createBookmarksExportPayload,
  createNotesExportPayload,
  isSupportedSerializedEditorState,
  parseImportedBookmarksPayloadDetailed,
  parseImportedNotesPayloadDetailed,
  parseStoredNotesPayload,
  parseStoredNotesPayloadDetailed,
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

  it("rejects unsafe serialized links while preserving allowed links", () => {
    const noteWithLink = (url: string): ReaderNote => ({
      ...sampleNotes[0],
      body: JSON.stringify({
        root: {
          type: "root",
          children: [
            {
              type: "link",
              url,
              children: [{ type: "text", text: "link" }],
            },
          ],
        },
      }),
    });

    expect(
      parseImportedNotesPayloadDetailed(
        JSON.stringify([noteWithLink("https://example.com")]),
      ).entries,
    ).toHaveLength(1);
    expect(() =>
      parseImportedNotesPayloadDetailed(
        JSON.stringify([noteWithLink("javascript:alert(1)")]),
      ),
    ).toThrow("The notes file does not contain any valid entries.");

    expect(() =>
      parseImportedNotesPayloadDetailed(
        JSON.stringify([
          {
            ...noteWithLink("https://example.com"),
            body: JSON.stringify({
              root: {
                type: "root",
                children: [
                  {
                    type: "link",
                    url: "https://example.com",
                    target: "_blank",
                    rel: "opener",
                    children: [{ type: "text", text: "link" }],
                  },
                ],
              },
            }),
          },
        ]),
      ),
    ).toThrow("The notes file does not contain any valid entries.");
  });

  it("requires the supported serialized editor grammar", () => {
    expect(
      parseImportedNotesPayloadDetailed(
        JSON.stringify([
          {
            ...sampleNotes[0],
            body: JSON.stringify({
              root: { type: "root", version: 1, children: [] },
            }),
          },
        ]),
      ).entries,
    ).toHaveLength(1);

    expect(
      parseImportedNotesPayloadDetailed(
        JSON.stringify([{ ...sampleNotes[0], body: "{}" }]),
      ).entries,
    ).toHaveLength(1);
    expect(isSupportedSerializedEditorState({})).toBe(false);

    for (const body of [
      JSON.stringify({
        root: {
          type: "root",
          children: [{ type: "unknown", children: [] }],
        },
      }),
      JSON.stringify({
        root: {
          type: "root",
          children: Array.from({ length: READER_TRANSFER_LIMITS.maxEditorNodes }, () => 1),
        },
      }),
    ]) {
      expect(() =>
        parseImportedNotesPayloadDetailed(
          JSON.stringify([{ ...sampleNotes[0], body }]),
        ),
      ).toThrow("The notes file does not contain any valid entries.");
    }
  });

  it("rejects non-finite Date values created by JSON numeric overflow", () => {
    const payload = JSON.stringify([sampleNotes[0]]).replace(
      '"createdAt":1',
      '"createdAt":1e400',
    );

    expect(() => parseImportedNotesPayloadDetailed(payload)).toThrow(
      "The notes file does not contain any valid entries.",
    );
    expect(parseStoredNotesPayload(payload)).toEqual([]);
  });

  it("enforces file and entry budgets before import", () => {
    expect(() =>
      assertReaderImportFileSize(READER_TRANSFER_LIMITS.maxFileBytes + 1),
    ).toThrow("8 MB or smaller");
    expect(() =>
      parseImportedNotesPayloadDetailed(
        JSON.stringify(
          Array.from({ length: READER_TRANSFER_LIMITS.maxEntries + 1 }, () => null),
        ),
      ),
    ).toThrow(`more than ${READER_TRANSFER_LIMITS.maxEntries.toLocaleString()} entries`);
  });

  it("filters corrupt stored notes without discarding valid entries", () => {
    expect(
      parseStoredNotesPayload(
        JSON.stringify([
          sampleNotes[0],
          { ...sampleNotes[1], updatedAt: Number.MAX_VALUE },
        ]),
      ),
    ).toEqual([sampleNotes[0]]);
    expect(
      parseStoredNotesPayloadDetailed(
        JSON.stringify([
          sampleNotes[0],
          { ...sampleNotes[1], updatedAt: Number.MAX_VALUE },
        ]),
      ).skippedInvalidCount,
    ).toBe(1);
  });

  it("rejects aggregate imports before mutating existing entries", () => {
    expect(
      assertReaderEntryMergeLimit(
        "notes",
        [{ id: "existing" }],
        [{ id: "existing" }, { id: "new" }],
      ),
    ).toBe(2);
    expect(() =>
      assertReaderEntryMergeLimit(
        "bookmarks",
        [{ id: "existing" }],
        Array.from({ length: READER_TRANSFER_LIMITS.maxEntries }, (_, index) => ({
          id: `bookmark-${index}`,
        })),
      ),
    ).toThrow("No bookmarks were changed");
  });

  it("fails closed without converting oversized stored state to empty", () => {
    expect(() =>
      parseStoredNotesPayload(
        JSON.stringify(
          Array.from({ length: READER_TRANSFER_LIMITS.maxEntries + 1 }, () => null),
        ),
      ),
    ).toThrow("Stored notes exceed the entry limit");
  });
});
