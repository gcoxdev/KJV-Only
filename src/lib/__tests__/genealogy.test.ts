import { describe, expect, it } from "vitest";

import { decodeGenealogyPayload } from "@/lib/genealogy";
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
          "first man",
          [[[0, [0, 1], 2, 2]], 2, 2, 0],
          "",
          "",
          [["eve", 1]],
          [],
          [["cain", 2]],
        ],
        ["eve", [1], "female", "", undefined, "", "", [["adam", 1]], [], [["cain", 2]]],
        ["cain", [2], "male", "", undefined, "adam", "eve", [], [], []],
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
});
