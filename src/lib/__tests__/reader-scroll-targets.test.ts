import { describe, expect, it } from "vitest";

import {
  calculateReaderScrollTop,
  dequeuePendingReaderScrollTarget,
  prunePendingReaderScrollTargets,
  queuePendingReaderScrollTarget,
  selectPendingReaderScrollTargetForActiveTab,
  swapPendingReaderScrollTargets,
} from "@/lib/reader-scroll-targets";
import type { ReaderTab } from "@/types/reader";

describe("reader scroll targets", () => {
  it("queues multiple panel scroll targets instead of overwriting them", () => {
    const queue = queuePendingReaderScrollTarget(
      [
        {
          leafId: "leaf-1",
          bookIndex: 0,
          chapterIndex: 0,
          mode: "verse-range",
          verseStart: 1,
          verseEnd: 3,
        },
      ],
      {
        leafId: "leaf-2",
        bookIndex: 1,
        chapterIndex: 7,
        mode: "verse-range",
        verseStart: 8,
        verseEnd: 23,
      },
    );

    expect(queue.map((entry) => entry.leafId)).toEqual(["leaf-1", "leaf-2"]);
  });

  it("replaces older pending targets for the same leaf", () => {
    const queue = queuePendingReaderScrollTarget(
      [
        {
          leafId: "leaf-1",
          bookIndex: 0,
          chapterIndex: 0,
          mode: "verse-range",
          verseStart: 1,
          verseEnd: 3,
        },
      ],
      {
        leafId: "leaf-1",
        bookIndex: 0,
        chapterIndex: 2,
        mode: "verse-range",
        verseStart: 16,
        verseEnd: 17,
      },
    );

    expect(queue).toEqual([
      {
        leafId: "leaf-1",
        bookIndex: 0,
        chapterIndex: 2,
        mode: "verse-range",
        verseStart: 16,
        verseEnd: 17,
      },
    ]);
  });

  it("prunes and swaps queue entries by leaf id", () => {
    const queue = [
      {
        leafId: "leaf-1",
        bookIndex: 0,
        chapterIndex: 0,
        mode: "chapter-top" as const,
        verseStart: 1,
        verseEnd: 1,
      },
      {
        leafId: "leaf-2",
        bookIndex: 1,
        chapterIndex: 7,
        mode: "verse-range" as const,
        verseStart: 8,
        verseEnd: 23,
      },
    ];

    expect(prunePendingReaderScrollTargets(queue, ["leaf-2"])).toEqual([
      queue[1],
    ]);
    expect(swapPendingReaderScrollTargets(queue, "leaf-1", "leaf-2")).toEqual([
      { ...queue[0], leafId: "leaf-2" },
      { ...queue[1], leafId: "leaf-1" },
    ]);
    expect(dequeuePendingReaderScrollTarget(queue, queue[0])).toEqual([queue[1]]);
  });

  it("pins tall highlighted blocks to the top of the viewport", () => {
    expect(calculateReaderScrollTop(240, 620, 400, 2000)).toBe(240);
  });

  it("centers shorter highlighted blocks when there is room", () => {
    expect(calculateReaderScrollTop(240, 80, 400, 2000)).toBe(80);
  });

  it("selects the pending target for the active tab without consuming hidden-tab targets first", () => {
    const queue = [
      {
        leafId: "gen-leaf",
        bookIndex: 0,
        chapterIndex: 0,
        mode: "verse-range" as const,
        verseStart: 2,
        verseEnd: 2,
      },
      {
        leafId: "john-leaf",
        bookIndex: 42,
        chapterIndex: 2,
        mode: "verse-range" as const,
        verseStart: 16,
        verseEnd: 16,
      },
      {
        leafId: "rev-leaf",
        bookIndex: 65,
        chapterIndex: 21,
        mode: "verse-range" as const,
        verseStart: 12,
        verseEnd: 12,
      },
    ];

    const tabs: ReaderTab[] = [
      {
        id: "tab-gen",
        title: "Genesis 1:2",
        root: {
          id: "gen-leaf",
          type: "leaf",
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
          pickerTestament: null,
          pickerBookIndex: null,
          pageId: null,
        },
      },
      {
        id: "tab-john",
        title: "John 3:16",
        root: {
          id: "john-leaf",
          type: "leaf",
          view: "reader",
          bookIndex: 42,
          chapterIndex: 2,
          pickerTestament: null,
          pickerBookIndex: null,
          pageId: null,
        },
      },
      {
        id: "tab-rev",
        title: "Revelation 22:12",
        root: {
          id: "rev-leaf",
          type: "leaf",
          view: "reader",
          bookIndex: 65,
          chapterIndex: 21,
          pickerTestament: null,
          pickerBookIndex: null,
          pageId: null,
        },
      },
    ];

    expect(selectPendingReaderScrollTargetForActiveTab(queue, tabs, "tab-rev")).toEqual(
      queue[2],
    );
    expect(selectPendingReaderScrollTargetForActiveTab(queue, tabs, "tab-john")).toEqual(
      queue[1],
    );
  });
});
