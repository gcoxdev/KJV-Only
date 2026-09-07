import { PERSON_REFERENCE_REVIEWS } from "../src/lib/person-place-corrections.ts";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decodeGenealogyPayload, enrichGenealogyPayload, GENEALOGY_ENRICHMENT_VERSION } from "../src/lib/genealogy.ts";
import { genealogyPersonContext } from "../src/lib/genealogy-result-context.ts";
import { findGenealogyMatches } from "../src/lib/word-study-selection.ts";
import type { GenealogyCompactPayload, GenealogyPayload, GenealogyPerson } from "../src/types/reader.ts";
import type { Book } from "../src/types/bible.ts";

const source: GenealogyPayload = JSON.parse(readFileSync("data-sources/genealogy.json", "utf8"));
const compact: GenealogyCompactPayload = JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"));
const shipped = decodeGenealogyPayload(compact);
const references = (person: GenealogyPerson) => [...new Set((person.verses?.byName ?? []).flatMap(entry => entry.verses))];

describe("genealogy identity boundaries", () => {
  it("ships the current enrichment without inventing person references anywhere in the dataset", () => {
    expect(compact.x).toBe(GENEALOGY_ENRICHMENT_VERSION);
    expect(shipped.map(person => person.id).sort()).toEqual(source.map(person => person.id).sort());
    const original = new Map(source.map(person => {
      const review = PERSON_REFERENCE_REVIEWS[person.id];
      const refs = (person.verses?.byName ?? []).flatMap(entry => entry.verses.filter(ref =>
        entry.name !== review?.name || (review.personalReferences
          ? review.personalReferences.includes(ref) : !review.excludedReferences?.includes(ref))));
      return [person.id, new Set(refs)];
    }));
    const mismatches = shipped.filter(person => {
      const actual = references(person);
      const expected = original.get(person.id)!;
      return actual.length !== expected.size || actual.some(reference => !expected.has(reference));
    }).map(person => person.id);
    expect(mismatches).toEqual([]);
  });

  it("keeps the two Eden person records separate from the garden and from each other", () => {
    const eden = shipped.filter(person => person.names.includes("Eden"));
    expect(eden).toHaveLength(2);
    expect(eden.map(person => [person.id, references(person)])).toEqual([
      ["eden_1984", ["2CH.29.12"]],
      ["eden_2010", ["2CH.31.15"]],
    ]);
    expect(genealogyPersonContext(eden[0])).toBe("Father: Joah · Name reference: 2CH 29:12");
    expect(genealogyPersonContext(eden[1])).toBe("Family not recorded · Name reference: 2CH 31:15");
    expect(findGenealogyMatches(shipped, "Eden", "GEN.2.8")).toEqual([]);
    expect(findGenealogyMatches(shipped, "Eden", "2CH.29.12").map(person => person.id)).toEqual(["eden_1984"]);
    expect(findGenealogyMatches(shipped, "Eden", "2CH.31.15").map(person => person.id)).toEqual(["eden_2010"]);
    expect(findGenealogyMatches(shipped, "Eden")).toHaveLength(2);
  });

  it.each(["joseph_1792", "joseph_2312", "mary_2929", "mary_2940"])("preserves the original passages for %s", id => {
    expect(references(shipped.find(person => person.id === id)!)).toEqual(references(source.find(person => person.id === id)!));
  });

  it("normalizes spelling without absorbing another namesake or a place occurrence", () => {
    const books: Book[] = [{ name: "Genesis", chapters: [{ chapter: 1, verses: [
      { verse: 1, tokens: [{ text: "Beth–sheba" }] },
      { verse: 2, tokens: [{ text: "Beth–sheba" }] },
      { verse: 3, tokens: [{ text: "Beth–sheba" }] },
    ] }] }];
    const people: GenealogyPayload = [1, 2].map(verse => ({
      id: `person-${verse}`, names: ["Bethsheba"],
      verses: { byName: [{ name: "Bethsheba", verses: [`GEN.1.${verse}`], numOccurrences: 1 }], first: `GEN.1.${verse}` },
    }));
    const enriched = enrichGenealogyPayload(people, books);
    expect(enriched.map(person => person.names)).toEqual([["Beth-sheba"], ["Beth-sheba"]]);
    expect(enriched.map(references)).toEqual([["GEN.1.1"], ["GEN.1.2"]]);
    expect(enriched.map(person => person.verses?.totalOccurrences)).toEqual([1, 1]);
  });

  it("does not treat a different Jesus occurrence as a Jesus Christ reference", () => {
    const person: GenealogyPerson = { id: "jesus", names: ["Jesus Christ"], verses: {
      byName: [{ name: "Jesus", verses: ["GEN.1.1"] }], first: "GEN.1.1",
    } };
    const books: Book[] = [{ name: "Genesis", chapters: [{ chapter: 1, verses: [
      { verse: 1, tokens: [{ text: "Jesus" }, { text: "Christ" }] },
      { verse: 2, tokens: [{ text: "Jesus" }] },
      { verse: 3, tokens: [{ text: "Christ" }] },
    ] }] }];
    expect(references(enrichGenealogyPayload([person], books)[0])).toEqual(["GEN.1.1"]);
  });
});
