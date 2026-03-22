import { describe, expect, it } from "vitest";

import {
  buildReferenceCommandActions,
  buildReaderTabFromTargets,
  parseReferenceCommandInput,
} from "@/lib/reference-command";
import type { Book } from "@/types/bible";

function makeChapter(verseCount: number, chapter: number) {
  return {
    chapter,
    verses: Array.from({ length: verseCount }, (_, index) => ({
      verse: index + 1,
      tokens: [],
    })),
  };
}

const books: Book[] = Array.from({ length: 66 }, (_, index) => ({
  name: `Book ${index + 1}`,
  chapters: [makeChapter(20, 1)],
}));

books[0] = {
  name: "Genesis",
  chapters: [makeChapter(31, 1), makeChapter(25, 2), makeChapter(24, 3)],
};

books[42] = {
  name: "John",
  chapters: [
    makeChapter(51, 1),
    makeChapter(25, 2),
    makeChapter(36, 3),
    makeChapter(54, 4),
  ],
};

books[44] = {
  name: "Romans",
  chapters: [
    makeChapter(32, 1),
    makeChapter(29, 2),
    makeChapter(31, 3),
    makeChapter(25, 4),
    makeChapter(21, 5),
    makeChapter(23, 6),
    makeChapter(25, 7),
    makeChapter(39, 8),
  ],
};

describe("reference command parsing", () => {
  it("keeps consecutive chapter references as separate panel targets", () => {
    const result = parseReferenceCommandInput("Genesis 1, 2; John 3", books);

    expect(result.targets).toHaveLength(3);
    expect(result.targets.map((target) => target.label)).toEqual([
      "Genesis 1",
      "Genesis 2",
      "John 3",
    ]);
    expect(result.targets.map((target) => target.target)).toEqual([
      {
        type: "chapter",
        bookIndex: 0,
        chapterIndex: 0,
      },
      {
        type: "chapter",
        bookIndex: 0,
        chapterIndex: 1,
      },
      {
        type: "chapter",
        bookIndex: 42,
        chapterIndex: 2,
      },
    ]);
  });

  it("combines same-chapter contiguous verse references into one highlighted range target", () => {
    const result = parseReferenceCommandInput("John 3:16, 17", books);

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0]).toEqual({
      label: "John 3:16-17",
      target: {
        type: "selection",
        bookIndex: 42,
        chapterIndex: 2,
        ranges: [{ start: 16, end: 17 }],
      },
    });
  });

  it("combines same-chapter ranges and verses into one selection target", () => {
    const result = parseReferenceCommandInput("John 3:16-18, 20; Romans 8:1-2", books);

    expect(result.targets).toHaveLength(2);
    expect(result.targets[0]).toEqual({
      label: "John 3:16-18, 20",
      target: {
        type: "selection",
        bookIndex: 42,
        chapterIndex: 2,
        ranges: [
          { start: 16, end: 18 },
          { start: 20, end: 20 },
        ],
      },
    });
    expect(result.targets[1]).toEqual({
      label: "Romans 8:1-2",
      target: {
        type: "selection",
        bookIndex: 44,
        chapterIndex: 7,
        ranges: [{ start: 1, end: 2 }],
      },
    });
  });

  it("treats book-only input as the first chapter in this app", () => {
    const result = parseReferenceCommandInput("John", books);

    expect(result.targets).toEqual([
      {
        label: "John 1",
        target: {
          type: "chapter",
          bookIndex: 42,
          chapterIndex: 0,
        },
      },
    ]);
  });

  it("parses abbreviated chapter references like Gen 3", () => {
    const result = parseReferenceCommandInput("Gen 3", books);

    expect(result.targets).toEqual([
      {
        label: "Genesis 3",
        target: {
          type: "chapter",
          bookIndex: 0,
          chapterIndex: 2,
        },
      },
    ]);
  });

  it("parses compact mixed references like the upstream parser demo", () => {
    const result = parseReferenceCommandInput(
      "gen1:1-3,6,29; exo 6:23; mat 12:34",
      books,
    );

    expect(result.targets[0]).toEqual({
      label: "Genesis 1:1-3, 6, 29",
      target: {
        type: "selection",
        bookIndex: 0,
        chapterIndex: 0,
        ranges: [
          { start: 1, end: 3 },
          { start: 6, end: 6 },
          { start: 29, end: 29 },
        ],
      },
    });
    expect(result.targets[1]).toEqual({
      label: "Book 2 6:23",
      target: {
        type: "verse",
        bookIndex: 1,
        chapterIndex: 5,
        verseNumber: 23,
      },
    });
    expect(result.targets[2]).toEqual({
      label: "Book 40 12:34",
      target: {
        type: "verse",
        bookIndex: 39,
        chapterIndex: 11,
        verseNumber: 34,
      },
    });
  });

  it("includes book-alone references when mixed with other references", () => {
    const result = parseReferenceCommandInput("John; Romans 8:1-2", books);

    expect(result.targets).toEqual([
      {
        label: "John 1",
        target: {
          type: "chapter",
          bookIndex: 42,
          chapterIndex: 0,
        },
      },
      {
        label: "Romans 8:1-2",
        target: {
          type: "selection",
          bookIndex: 44,
          chapterIndex: 7,
          ranges: [{ start: 1, end: 2 }],
        },
      },
    ]);
  });
});

describe("reference command actions", () => {
  it("builds single-reference actions when there is only one target", () => {
    const actions = buildReferenceCommandActions([
      {
        label: "John 3:16",
        target: {
          type: "verse",
          bookIndex: 42,
          chapterIndex: 2,
          verseNumber: 16,
        },
      },
    ]);

    expect(actions.map((action) => action.id)).toEqual([
      "single-new-tab",
      "single-new-panel",
    ]);
  });

  it("builds multi-reference actions when there are multiple targets", () => {
    const actions = buildReferenceCommandActions([
      {
        label: "Genesis 1",
        target: {
          type: "chapter",
          bookIndex: 0,
          chapterIndex: 0,
        },
      },
      {
        label: "John 3:16-17",
        target: {
          type: "selection",
          bookIndex: 42,
          chapterIndex: 2,
          ranges: [{ start: 16, end: 17 }],
        },
      },
    ]);

    expect(actions.map((action) => action.id)).toEqual([
      "multiple-new-tabs",
      "multiple-single-tab",
      "multiple-current-tab-panels",
    ]);
  });
});

describe("reference command tab layout", () => {
  it("splits two targets evenly in a single new tab", () => {
    const state = buildReaderTabFromTargets([
      {
        type: "chapter",
        bookIndex: 0,
        chapterIndex: 0,
      },
      {
        type: "selection",
        bookIndex: 42,
        chapterIndex: 2,
        ranges: [{ start: 16, end: 17 }],
      },
    ]);

    expect(state.root).toMatchObject({
      type: "split",
      orientation: "horizontal",
      ratio: 50,
    });
  });

  it("builds a single new tab with one panel per normalized target", () => {
    const state = buildReaderTabFromTargets([
      {
        type: "chapter",
        bookIndex: 0,
        chapterIndex: 0,
      },
      {
        type: "selection",
        bookIndex: 42,
        chapterIndex: 2,
        ranges: [{ start: 16, end: 17 }],
      },
      {
        type: "selection",
        bookIndex: 44,
        chapterIndex: 7,
        ranges: [{ start: 1, end: 2 }],
      },
    ]);

    expect(state.leafIds).toHaveLength(3);
    expect(state.root).toMatchObject({
      type: "split",
      orientation: "horizontal",
    });
  });
});
