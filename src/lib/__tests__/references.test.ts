import { describe, expect, it } from "vitest";

import {
  decodeConcordanceReferences,
  resolveAIDictionaryKey,
  resolveAIDictionaryPhraseKey,
  resolveAIDictionaryPhraseKeyForToken,
  resolveConcordanceKey,
  resolvePhraseKey,
  resolvePhraseKeyForToken,
  resolveUnitsKey,
} from "@/lib/references";
import type {
  AIDictionaryPayload,
  ConcordancePayload,
  PhrasesPayload,
  UnitsPayload,
} from "@/types/reader";

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

  it("resolves phrases by exact text and aliases", () => {
    const phrases: PhrasesPayload = {
      "by and by": {
        meaning: "Immediately",
        aliases: ["anon"],
      },
      "god forbid": {
        meaning: "Certainly not",
      },
    };

    expect(resolvePhraseKey(phrases, "By and by")).toBe("by and by");
    expect(resolvePhraseKey(phrases, "anon")).toBe("by and by");
    expect(resolvePhraseKey(phrases, "God forbid")).toBe("god forbid");
  });

  it("resolves AI dictionary entries by case, singular, and aliases", () => {
    const aiDictionary: AIDictionaryPayload = {
      prevent: {
        definitions: ["To go before."],
        aliases: ["prevented", "preventeth"],
      },
      quick: {
        definitions: ["Living; alive."],
      },
    };

    expect(resolveAIDictionaryKey(aiDictionary, "Prevent")).toBe("prevent");
    expect(resolveAIDictionaryKey(aiDictionary, "preventeth")).toBe("prevent");
    expect(resolveAIDictionaryKey(aiDictionary, "quick")).toBe("quick");
  });

  it("resolves AI dictionary phrases by exact text and aliases", () => {
    const aiDictionary: AIDictionaryPayload = {
      "take no thought": {
        partOfSpeech: "phrase",
        definitions: ["Do not be anxious."],
        aliases: ["be not anxious"],
      },
      "god forbid": {
        partOfSpeech: "phrase",
        definitions: ["May it never be."],
      },
    };

    expect(resolveAIDictionaryPhraseKey(aiDictionary, "Take no thought")).toBe(
      "take no thought",
    );
    expect(resolveAIDictionaryPhraseKey(aiDictionary, "be not anxious")).toBe(
      "take no thought",
    );
    expect(resolveAIDictionaryPhraseKey(aiDictionary, "God forbid")).toBe(
      "god forbid",
    );
  });

  it("resolves AI dictionary phrase matches from a clicked token context", () => {
    const aiDictionary: AIDictionaryPayload = {
      "quit you like men": {
        partOfSpeech: "phrase",
        definitions: ["Conduct yourselves bravely."],
      },
    };
    const verseTokens = [
      { text: "Watch" },
      { text: "ye," },
      { text: "stand" },
      { text: "fast" },
      { text: "in" },
      { text: "the" },
      { text: "faith," },
      { text: "quit" },
      { text: "you" },
      { text: "like" },
      { text: "men," },
      { text: "be" },
      { text: "strong." },
    ];

    expect(resolveAIDictionaryPhraseKeyForToken(aiDictionary, verseTokens, 9)).toBe(
      "quit you like men",
    );
  });

  it("resolves phrase matches from a clicked token context", () => {
    const phrases: PhrasesPayload = {
      "quit you like men": {
        meaning: "Behave bravely",
      },
    };
    const verseTokens = [
      { text: "Watch" },
      { text: "ye," },
      { text: "stand" },
      { text: "fast" },
      { text: "in" },
      { text: "the" },
      { text: "faith," },
      { text: "quit" },
      { text: "you" },
      { text: "like" },
      { text: "men," },
      { text: "be" },
      { text: "strong." },
    ];

    expect(resolvePhraseKeyForToken(phrases, verseTokens, 8)).toBe(
      "quit you like men",
    );
  });
});
