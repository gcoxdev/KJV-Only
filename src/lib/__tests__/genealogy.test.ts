import { describe, expect, it } from "vitest";

import { decodeGenealogyPayload, enrichGenealogyPayload } from "@/lib/genealogy";
import type { Book } from "@/types/bible";
import type { GenealogyCompactPayload } from "@/types/reader";

describe("decodeGenealogyPayload", () => {
  it("decodes names, relationships, and delta-encoded references", () => {
    const compact: GenealogyCompactPayload = {
      v: ["GEN.1.1", "GEN.1.2", "GEN.1.3"],
      w: ["Adam", "Eve", "Cain"],
      p: [
        [
          "adam",
          [0],
          "male",
          [[[0, [0, 1], 2, 2]], 2, 2, 0],
          "",
          "",
          [["eve", 1]],
          [],
          [["cain", 2]],
        ],
        ["eve", [1], "female", undefined, "", "", [["adam", 1]], [], [["cain", 2]]],
        ["cain", [2], "male", undefined, "adam", "eve", [], [], []],
      ],
    };

    const decoded = decodeGenealogyPayload(compact);

    expect(decoded[0]).toMatchObject({
      id: "adam",
      names: ["Adam"],
      verses: {
        byName: [
          {
            name: "Adam",
            verses: ["GEN.1.1", "GEN.1.2"],
            numOccurrences: 2,
            numVerses: 2,
          },
        ],
        totalOccurrences: 2,
        totalVerses: 2,
        first: "GEN.1.1",
      },
      spouses: [{ id: "eve", name: "Eve", verse: "GEN.1.2" }],
      children: [{ id: "cain", name: "Cain", verse: "GEN.1.3" }],
    });

    expect(decoded[2]).toMatchObject({
      id: "cain",
      father: { id: "adam", name: "Adam" },
      mother: { id: "eve", name: "Eve" },
    });
  });

  it("fills primary-name references and adds Christ labels for Jesus Christ", () => {
    const compact: GenealogyCompactPayload = {
      v: ["MAT.1.1", "MAT.1.2"],
      w: ["Jesus Christ", "Immanuel", "Jesus", "Emmanuel"],
      p: [
        [
          "jesus_christ",
          [0, 1, 3],
          "male",
          [
            [
              [1, [0], 1, 1],
              [2, [1], 1, 1],
              [0, [], 0, 0],
            ],
            2,
            2,
            0,
          ],
        ],
      ],
    };

    const [decoded] = decodeGenealogyPayload(compact);
    expect(decoded.verses?.byName).toEqual(
      expect.arrayContaining([
        {
          name: "Jesus Christ",
          verses: ["MAT.1.1", "MAT.1.2"],
          numOccurrences: 2,
          numVerses: 2,
        },
        {
          name: "Christ",
          verses: ["MAT.1.1", "MAT.1.2"],
          numOccurrences: 2,
          numVerses: 2,
        },
      ]),
    );
  });

  it("drops by-name aliases that decode to no usable references", () => {
    const compact: GenealogyCompactPayload = {
      v: ["2SA.11.3", "1CH.3.5"],
      w: ["Bathsheba", "Bath-sheba", "Bathshua"],
      p: [
        [
          "bathsheba",
          [0, 1, 2],
          "female",
          [
            [
              [0, [0], 10, 1],
              [1, [], 1, 0],
              [2, [1], 1, 1],
            ],
            12,
            2,
            0,
          ],
        ],
      ],
    };

    const [decoded] = decodeGenealogyPayload(compact);

    expect(decoded.verses?.byName).toEqual([
      {
        name: "Bathsheba",
        verses: ["2SA.11.3"],
        numOccurrences: 10,
        numVerses: 1,
      },
      {
        name: "Bathshua",
        verses: ["1CH.3.5"],
        numOccurrences: 1,
        numVerses: 1,
      },
    ]);
  });

  it("adds Christ-only token references to Jesus Christ labels", () => {
    const compact: GenealogyCompactPayload = {
      v: ["MAT.1.1"],
      w: ["Jesus Christ", "Jesus"],
      p: [
        [
          "jesus_christ",
          [0],
          "male",
          [
            [[1, [0], 1, 1]],
            1,
            1,
            0,
          ],
        ],
      ],
    };
    const books: Book[] = [
      {
        name: "Romans",
        chapters: [
          {
            chapter: 5,
            verses: [
              {
                verse: 8,
                tokens: [{ text: "Christ" }],
              },
            ],
          },
        ],
      },
    ];

    const [decoded] = enrichGenealogyPayload(decodeGenealogyPayload(compact), books);

    expect(decoded.verses?.byName).toEqual(
      expect.arrayContaining([
        {
          name: "Christ",
          verses: ["GEN.1.8"],
          numOccurrences: 1,
          numVerses: 1,
        },
      ]),
    );
    expect(decoded.verses?.byName?.find((entry) => entry.name === "Jesus Christ")).toBeUndefined();
    expect(decoded.verses?.first).toBe("MAT.1.1");
  });

  it("canonicalizes Bath-sheba and Bath-shua from the Bible text", () => {
    const compact: GenealogyCompactPayload = {
      v: ["2SA.11.3", "2SA.12.24", "1CH.3.5"],
      w: ["Bathsheba", "Bathshua", "Bath-sheba"],
      p: [
        [
          "bathsheba",
          [0, 1, 2],
          "female",
          [
            [
              [0, [0, 1, 1], 11, 3],
              [1, [2], 1, 1],
            ],
            12,
            4,
            0,
          ],
        ],
      ],
    };

    const books: Book[] = Array.from({ length: 13 }, (_, index) => ({
      name:
        index === 9 ? "2 Samuel" : index === 10 ? "1 Kings" : index === 12 ? "1 Chronicles" : `Book ${index + 1}`,
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
          : index === 10
            ? Array.from({ length: 2 }, (_, chapterIndex) => ({
                chapter: chapterIndex + 1,
                verses:
                  chapterIndex === 0
                    ? [11, 15, 16, 28, 31].map((verse) => ({
                        verse,
                        tokens: [{ text: "Bath–sheba" }],
                      }))
                    : chapterIndex === 1
                      ? [13, 18, 19].map((verse) => ({
                          verse,
                          tokens: [{ text: "Bath–sheba" }],
                        }))
                      : [],
              }))
            : index === 12
              ? Array.from({ length: 3 }, (_, chapterIndex) => ({
                  chapter: chapterIndex + 1,
                  verses:
                    chapterIndex === 2 ? [{ verse: 5, tokens: [{ text: "Bath–shua" }] }] : [],
                }))
              : [],
    }));

    const [decoded] = enrichGenealogyPayload(decodeGenealogyPayload(compact), books);

    expect(decoded.names).toEqual(["Bath-sheba", "Bath-shua"]);
    expect(decoded.verses?.byName).toEqual([
      {
        name: "Bath-sheba",
        verses: [
          "2SA.11.3",
          "2SA.12.24",
          "1KI.1.11",
          "1KI.1.15",
          "1KI.1.16",
          "1KI.1.28",
          "1KI.1.31",
          "1KI.2.13",
          "1KI.2.18",
          "1KI.2.19",
        ],
        numOccurrences: 10,
        numVerses: 10,
      },
      {
        name: "Bath-shua",
        verses: ["1CH.3.5"],
        numOccurrences: 1,
        numVerses: 1,
      },
    ]);
  });

  it("keeps Jesus, Christ, and Jesus Christ references in separate buckets", () => {
    const compact: GenealogyCompactPayload = {
      v: ["MAT.1.1"],
      w: ["Jesus Christ", "Jesus"],
      p: [
        [
          "jesus_christ",
          [0],
          "male",
          [
            [[1, [0], 1, 1]],
            1,
            1,
            0,
          ],
        ],
      ],
    };
    const books: Book[] = [
      {
        name: "Romans",
        chapters: [
          {
            chapter: 5,
            verses: [
              {
                verse: 8,
                tokens: [{ text: "Christ" }],
              },
              {
                verse: 9,
                tokens: [{ text: "Jesus" }, { text: "Christ" }],
              },
              {
                verse: 10,
                tokens: [{ text: "Jesus" }],
              },
            ],
          },
        ],
      },
    ];

    const [decoded] = enrichGenealogyPayload(decodeGenealogyPayload(compact), books);

    expect(decoded.verses?.byName).toEqual(
      expect.arrayContaining([
        {
          name: "Jesus",
          verses: ["GEN.1.10"],
          numOccurrences: 1,
          numVerses: 1,
        },
        {
          name: "Christ",
          verses: ["GEN.1.8"],
          numOccurrences: 1,
          numVerses: 1,
        },
        {
          name: "Jesus Christ",
          verses: ["GEN.1.9"],
          numOccurrences: 1,
          numVerses: 1,
        },
      ]),
    );
  });
});
