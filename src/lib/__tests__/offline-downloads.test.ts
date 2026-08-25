import { describe, expect, it } from "vitest";

import { buildAudioUrls } from "@/lib/offline-downloads";
import type { Book } from "@/types/bible";

function book(name: string, chapterCount: number): Book {
  return {
    name,
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      chapter: index + 1,
      verses: [],
    })),
  };
}

describe("buildAudioUrls", () => {
  it("builds available Old Testament URLs from a partial bootstrap corpus", () => {
    expect(buildAudioUrls([book("Genesis", 2)], "old")).toEqual([
      "/audio/GEN.1.mp3",
      "/audio/GEN.2.mp3",
    ]);
  });

  it("does not treat a partial Old Testament corpus as New Testament data", () => {
    expect(buildAudioUrls([book("Genesis", 1)], "new")).toEqual([]);
  });

  it("keeps the canonical testament boundary for a full corpus", () => {
    const books = Array.from({ length: 40 }, (_, index) =>
      book(`Book ${index + 1}`, 1),
    );

    expect(buildAudioUrls(books, "old")).toHaveLength(39);
    expect(buildAudioUrls(books, "new")).toEqual(["/audio/MAT.1.mp3"]);
  });
});
