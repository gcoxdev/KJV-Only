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
