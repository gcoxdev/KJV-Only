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

    expect(href).toBe("kjv://EXO.3");
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

    expect(href).toBe("kjv://EXO.3.16");
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

    expect(href).toBe("kjv://NUM.4.10/touching");
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

    expect(href).toBe("kjv://EXO.3.16-18,20");
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

  it("builds and parses cross-chapter range hrefs", () => {
    const href = buildNoteLinkHref({
      type: "range",
      start: {
        bookIndex: 0,
        chapterIndex: 0,
        verseNumber: 31,
      },
      end: {
        bookIndex: 0,
        chapterIndex: 1,
        verseNumber: 3,
      },
    });

    expect(href).toBe("kjv://GEN.1.31-2.3");
    expect(parseNoteLinkHref(href)).toEqual({
      type: "range",
      start: {
        bookIndex: 0,
        chapterIndex: 0,
        verseNumber: 31,
      },
      end: {
        bookIndex: 0,
        chapterIndex: 1,
        verseNumber: 3,
      },
    });
  });

  it("rejects malformed hrefs", () => {
    expect(parseNoteLinkHref("kjv://verse/1/2")).toBeNull();
    expect(parseNoteLinkHref("https://kjv.local/verse/1/2")).toBeNull();
    expect(parseNoteLinkHref("kjv://word/1/2/0/faith")).toBeNull();
    expect(parseNoteLinkHref("https://example.com")).toBeNull();
    expect(isInternalNoteLink("kjv://JHN.3.16")).toBe(true);
    expect(isInternalNoteLink("https://kjv.local/JHN.3.16")).toBe(true);
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
    expect(
      formatNoteLinkLabel(
        {
          type: "range",
          start: {
            bookIndex: 0,
            chapterIndex: 0,
            verseNumber: 31,
          },
          end: {
            bookIndex: 0,
            chapterIndex: 1,
            verseNumber: 3,
          },
        },
        books,
      ),
    ).toBe("Genesis 1:31-2:3");
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
    expect(migrated).toContain('"url":"kjv://EXO.3.16"');
    expect(migrated).not.toContain('"type":"autolink"');
  });

  it("parses legacy note link hrefs", () => {
    expect(parseNoteLinkHref("kjv://chapter/0/0")).toEqual({
      type: "chapter",
      bookIndex: 0,
      chapterIndex: 0,
    });
    expect(parseNoteLinkHref("kjv://selection/0/0/1-2,4-4,6-6")).toEqual({
      type: "selection",
      bookIndex: 0,
      chapterIndex: 0,
      ranges: [
        { start: 1, end: 2 },
        { start: 4, end: 4 },
        { start: 6, end: 6 },
      ],
    });
  });
});
