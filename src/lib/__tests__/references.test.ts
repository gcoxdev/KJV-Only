import { describe, expect, it } from "vitest";

import {
  decodeConcordanceReferences,
  resolveConcordanceKey,
  resolveUnitsKey,
} from "@/lib/references";
import type { ConcordancePayload, UnitsPayload } from "@/types/reader";

describe("concordance helpers", () => {
  const concordance: ConcordancePayload = {
    verses: ["GEN.1.1", "GEN.1.2", "GEN.1.3"],
    words: {
      The: [0, 1, 1],
      faith: [2],
    },
  };

  it("resolves keys case-insensitively and trims punctuation", () => {
    expect(resolveConcordanceKey(concordance, "\"the,\"")).toBe("The");
    expect(resolveConcordanceKey(concordance, "FAITH")).toBe("faith");
    expect(resolveConcordanceKey(concordance, "...")).toBeNull();
  });

  it("decodes delta-encoded references", () => {
    expect(decodeConcordanceReferences(concordance, "The")).toEqual([
      "GEN.1.1",
      "GEN.1.2",
      "GEN.1.3",
    ]);
  });

  it("resolves units by singular, plural, and aliases", () => {
    const units: UnitsPayload = {
      Cubit: {
        category: "length",
        summary: "Length",
        approximate: "About 18 inches",
        aliases: ["cubits"],
      },
      Penny: {
        category: "currency",
        summary: "Money",
        approximate: "A laborer's wage",
        aliases: ["pennies", "denarius"],
      },
    };

    expect(resolveUnitsKey(units, "Cubit")).toBe("Cubit");
    expect(resolveUnitsKey(units, "cubits")).toBe("Cubit");
    expect(resolveUnitsKey(units, "denarius")).toBe("Penny");
  });
});
