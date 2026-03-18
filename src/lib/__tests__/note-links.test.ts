import { describe, expect, it } from "vitest";

import {
  buildNoteLinkHref,
  formatNoteLinkLabel,
  isInternalNoteLink,
  migrateNoteBodyInternalLinks,
  parseNoteLinkHref,
  parseTypedBibleReference,
} from "@/lib/note-links";
import type { Book } from "@/types/bible";

const books: Book[] = [
  { name: "Genesis", chapters: [] },
  { name: "John", chapters: [] },
  { name: "1 Corinthians", chapters: [] },
  { name: "Colossians", chapters: [] },
];

describe("note links", () => {
  it("builds and parses chapter hrefs", () => {
    const href = buildNoteLinkHref({
      type: "chapter",
      bookIndex: 1,
      chapterIndex: 2,
    });

    expect(href).toBe("kjv://chapter/1/2");
    expect(parseNoteLinkHref(href)).toEqual({
      type: "chapter",
      bookIndex: 1,
      chapterIndex: 2,
    });
  });

  it("builds and parses verse hrefs", () => {
    const href = buildNoteLinkHref({
      type: "verse",
      bookIndex: 1,
      chapterIndex: 2,
      verseNumber: 16,
    });

    expect(parseNoteLinkHref(href)).toEqual({
      type: "verse",
      bookIndex: 1,
      chapterIndex: 2,
      verseNumber: 16,
    });
  });

  it("builds and parses word hrefs", () => {
    const href = buildNoteLinkHref({
      type: "word",
      bookIndex: 3,
      chapterIndex: 3,
      verseNumber: 10,
      word: "touching",
    });

    expect(parseNoteLinkHref(href)).toEqual({
      type: "word",
      bookIndex: 3,
      chapterIndex: 3,
      verseNumber: 10,
      word: "touching",
    });
  });

  it("builds and parses selection hrefs", () => {
    const href = buildNoteLinkHref({
      type: "selection",
      bookIndex: 1,
      chapterIndex: 2,
      ranges: [
        { start: 16, end: 18 },
        { start: 20, end: 20 },
      ],
    });

    expect(parseNoteLinkHref(href)).toEqual({
      type: "selection",
      bookIndex: 1,
      chapterIndex: 2,
      ranges: [
        { start: 16, end: 18 },
        { start: 20, end: 20 },
      ],
    });
  });

  it("rejects malformed hrefs", () => {
    expect(parseNoteLinkHref("kjv://verse/1/2")).toBeNull();
    expect(parseNoteLinkHref("https://kjv.local/verse/1/2")).toBeNull();
    expect(parseNoteLinkHref("kjv://word/1/2/0/faith")).toBeNull();
    expect(parseNoteLinkHref("https://example.com")).toBeNull();
    expect(isInternalNoteLink("kjv://verse/1/2/16")).toBe(true);
    expect(isInternalNoteLink("https://kjv.local/verse/1/2/16")).toBe(true);
    expect(isInternalNoteLink("mailto:test@example.com")).toBe(false);
  });

  it("formats labels correctly", () => {
    expect(
      formatNoteLinkLabel(
        { type: "chapter", bookIndex: 1, chapterIndex: 2 },
        books,
      ),
    ).toBe("John 3");
    expect(
      formatNoteLinkLabel(
        { type: "verse", bookIndex: 1, chapterIndex: 2, verseNumber: 16 },
        books,
      ),
    ).toBe("John 3:16");
    expect(
      formatNoteLinkLabel(
        {
          type: "selection",
          bookIndex: 1,
          chapterIndex: 2,
          ranges: [
            { start: 16, end: 18 },
            { start: 20, end: 20 },
          ],
        },
        books,
      ),
    ).toBe("John 3:16-18, 20");
    expect(
      formatNoteLinkLabel(
        {
          type: "word",
          bookIndex: 3,
          chapterIndex: 3,
          verseNumber: 10,
          word: "touching",
        },
        books,
      ),
    ).toBe('Colossians 4:10 • "touching"');
  });

  it("parses typed chapter and verse references", () => {
    expect(parseTypedBibleReference("John 3", books)).toEqual({
      type: "chapter",
      bookIndex: 1,
      chapterIndex: 2,
    });
    expect(parseTypedBibleReference("John 3:16", books)).toEqual({
      type: "verse",
      bookIndex: 1,
      chapterIndex: 2,
      verseNumber: 16,
    });
    expect(parseTypedBibleReference("1 Corinthians 15:29", books)).toEqual({
      type: "verse",
      bookIndex: 2,
      chapterIndex: 14,
      verseNumber: 29,
    });
  });

  it("rejects invalid typed references", () => {
    expect(parseTypedBibleReference("Jn 3:16", books)).toBeNull();
    expect(parseTypedBibleReference("John", books)).toBeNull();
    expect(parseTypedBibleReference("John 0:16", books)).toBeNull();
    expect(parseTypedBibleReference("John 3:0", books)).toBeNull();
  });

  it("rewrites autolink nodes into supported note link node types", () => {
    const migrated = migrateNoteBodyInternalLinks(
      JSON.stringify({
        root: {
          type: "root",
          version: 1,
          children: [
            {
              type: "paragraph",
              version: 1,
              children: [
                {
                  type: "autolink",
                  version: 1,
                  url: "https://example.com",
                  children: [],
                },
                {
                  type: "autolink",
                  version: 1,
                  url: "kjv://verse/1/2/16",
                  children: [],
                },
              ],
            },
          ],
        },
      }),
    );

    expect(migrated).toContain('"type":"link"');
    expect(migrated).toContain('"type":"kjv-link"');
    expect(migrated).not.toContain('"type":"autolink"');
  });
});
