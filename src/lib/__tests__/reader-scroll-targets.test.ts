import { describe, expect, it } from "vitest";

import {
  calculateReaderScrollTop,
  dequeuePendingReaderScrollTarget,
  prunePendingReaderScrollTargets,
  queuePendingReaderScrollTarget,
  swapPendingReaderScrollTargets,
} from "@/lib/reader-scroll-targets";

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
});
