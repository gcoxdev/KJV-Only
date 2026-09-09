import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decodeGenealogyPayload } from "../src/lib/genealogy";
import { GENEALOGY_COMPOUND_NAMES, genealogyNamesAtToken } from "../src/lib/genealogy-names";
import { chapterVerseKey, normalizeConcordanceWord } from "../src/lib/references";
import { deriveTokenAccordionState, findGenealogyMatches } from "../src/lib/word-study-selection";
import { isGenealogyCandidateWord } from "../src/lib/reader-data";
import type { Book } from "../src/types/bible";
import type { GenealogyCompactPayload } from "../src/types/reader";

const compact: GenealogyCompactPayload = JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"));
const people = decodeGenealogyPayload(compact);
const books: Book[] = JSON.parse(readFileSync("public/data/kjv.json", "utf8")).books;
const verses = books.flatMap((book, bi) => book.chapters.flatMap((chapter, ci) => chapter.verses.map(verse => ({
  ...verse, bi, ci, ref: chapterVerseKey(bi, ci, verse.verse),
}))));
const normalized = (word: string) => normalizeConcordanceWord(word).toLowerCase();
const jesusIds = ["jesus_christ_2683", "jesus_christ_2684"];
const falseClaims = new Set(["MAT.24.5", "MAT.24.23", "MRK.13.6", "MRK.13.21", "LUK.21.8"]);

describe("genealogy word-click coverage", () => {
  it("resolves every Jesus and Christ occurrence to its reviewed identity", () => {
    const failures: unknown[] = [];
    let checked = 0;
    for (const verse of verses) for (const [tokenIndex, token] of verse.tokens.entries()) {
      const word = normalized(token.text);
      if (word !== "jesus" && word !== "christ") continue;
      checked++;
      const expected = word === "christ" && falseClaims.has(verse.ref) ? [] :
        word === "jesus" && ["ACT.7.45", "HEB.4.8"].includes(verse.ref) ? ["joshua_391"] :
          word === "jesus" && verse.ref === "COL.4.11" ? ["jesus_3061"] : jesusIds;
      const actual = findGenealogyMatches(people, token.text, verse.ref, undefined, { verseTokens: verse.tokens, tokenIndex }).map(p => p.id).sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push({ ref: verse.ref, word, expected, actual });
    }
    expect(checked).toBe(1538);
    expect(failures).toEqual([]);
  });

  it("recognizes either word of all reviewed compound names across the KJV", () => {
    let checked = 0;
    for (const name of GENEALOGY_COMPOUND_NAMES) {
      const parts = name.toLowerCase().split(" ");
      const expected = people.filter(p => p.names.includes(name)).map(p => p.id).sort();
      for (const verse of verses) for (let i = 0; i < verse.tokens.length - 1; i++) {
        if (normalized(verse.tokens[i].text) !== parts[0] || normalized(verse.tokens[i + 1].text) !== parts[1]) continue;
        for (const tokenIndex of [i, i + 1]) {
          const word = verse.tokens[tokenIndex].text;
          expect(isGenealogyCandidateWord(compact, word), `${word} loading gate`).toBe(true);
          expect(findGenealogyMatches(people, word, verse.ref, undefined, { verseTokens: verse.tokens, tokenIndex }).map(p => p.id).sort(), `${verse.ref} ${word}`).toEqual(expected);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(400);
  });

  it("opens Genealogy for both words in Matthew 1:1 and 1:18 and standalone Christ in 1:17", () => {
    for (const ref of ["MAT.1.1", "MAT.1.17", "MAT.1.18"]) {
      const verse = verses.find(v => v.ref === ref)!;
      for (const [tokenIndex, token] of verse.tokens.entries()) {
        if (!["jesus", "christ"].includes(normalized(token.text))) continue;
        expect(deriveTokenAccordionState(token.text, { genealogyData: people, verseNumber: verse.verse, bookIndex: verse.bi, chapterIndex: verse.ci, verseTokens: verse.tokens, tokenIndex })).toContain("genealogy");
      }
    }
  });

  it("requires the clicked full name and keeps unrelated references and relatives separate", () => {
    const tokens = ["Jesus", "Christ", "and", "Jesus"].map(text => ({ text }));
    expect([...genealogyNamesAtToken("Christ", tokens, 1)]).toEqual(["jesus christ"]);
    expect([...genealogyNamesAtToken("Jesus", tokens, 3)]).toEqual([]);
    expect([...genealogyNamesAtToken("Jesus", [{ text: "Jesus." }, { text: "Christ" }], 0)]).toEqual([]);
    expect([...genealogyNamesAtToken("Herodias", ["Daughter", "of", "Herodias"].map(text => ({ text })), 2)]).toEqual([]);
    expect(findGenealogyMatches(people, "Jesus", "GEN.1.1", undefined, { verseTokens: tokens, tokenIndex: 0 })).toEqual([]);
    expect(findGenealogyMatches(people, "Eden", "GEN.2.8")).toEqual([]);
    const mary = verses.find(v => v.ref === "MAT.27.56")!;
    const tokenIndex = mary.tokens.findIndex(t => t.text === "Mary");
    expect(findGenealogyMatches(people, "Mary", mary.ref, undefined, { verseTokens: mary.tokens, tokenIndex }).map(p => p.id).sort()).toEqual(["mary_magdalene_2862", "mary_magdalene_2863"]);
  });
});
