import { describe, expect, it } from "vitest";

import { augmentConcordanceWithNormalizedWordForms } from "@/lib/reader-data";
import type { Book } from "@/types/bible";
import type { ConcordancePayload } from "@/types/reader";

describe("augmentConcordanceWithNormalizedWordForms", () => {
  it("adds normalized hyphenated word entries from Bible tokens", () => {
    const concordance: ConcordancePayload = {
      verses: ["2SA.11.3", "2SA.12.24"],
      words: {
        David: [0],
      },
    };

    const books: Book[] = Array.from({ length: 10 }, (_, index) => ({
      name: index === 9 ? "2 Samuel" : `Book ${index + 1}`,
      chapters:
        index === 9
          ? Array.from({ length: 12 }, (_, chapterIndex) => ({
              chapter: chapterIndex + 1,
              verses:
                chapterIndex === 10
                  ? [{ verse: 3, tokens: [{ text: "Bath–sheba" }] }]
                  : chapterIndex === 11
                    ? [{ verse: 24, tokens: [{ text: "Bath–sheba" }] }]
                    : [],
            }))
          : [],
    }));

    const augmented = augmentConcordanceWithNormalizedWordForms(concordance, books);

    expect(augmented.words["Bath-sheba"]).toEqual([0, 1]);
  });
});
