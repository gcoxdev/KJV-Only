import { describe, expect, it } from "vitest";

import { decodeStrongsPayload } from "@/lib/strongs";
import type { StrongsCompactPayload } from "@/types/reader";

describe("decodeStrongsPayload", () => {
  it("decodes shared strings and delta-encoded KJV references", () => {
    const compact: StrongsCompactPayload = {
      v: ["GEN.1.1", "GEN.1.2", "JHN.3.16"],
      w: ["Word"],
      s: ["definition", "strongs def", "lemma", "translit", "pron", "derivation"],
      e: {
        G0001: [0, 1, 2, 3, 4, 5, [[0, [0, 1, 1]]]],
      },
    };

    expect(decodeStrongsPayload(compact)).toEqual({
      G0001: {
        kjv_def: "definition",
        strongs_def: "strongs def",
        lemma: "lemma",
        translit: "translit",
        pron: "pron",
        derivation: "derivation",
        kjv_refs: {
          Word: ["GEN.1.1", "GEN.1.2", "JHN.3.16"],
        },
      },
    });
  });
});
