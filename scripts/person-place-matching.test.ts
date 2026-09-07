import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decodeGenealogyPayload } from "../src/lib/genealogy.ts";
import { resolvePersonPlaceContext } from "../src/lib/person-place-context.ts";
import { PERSON_REFERENCE_REVIEWS, REVIEWED_NAME_VERSES } from "../src/lib/person-place-corrections.ts";
import { findGenealogyMatches, findMapMatches, deriveTokenAccordionState } from "../src/lib/word-study-selection.ts";
import { chapterVerseKey, normalizeConcordanceWord, resolveTokenStrongsCodes } from "../src/lib/references.ts";
import type { Book, VerseToken } from "../src/types/bible.ts";
import type { GenealogyPayload } from "../src/types/reader.ts";
import type { AncientMapPayload } from "../src/lib/maps.ts";

const source: GenealogyPayload = JSON.parse(readFileSync("data-sources/genealogy.json", "utf8"));
const people = decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8")));
const maps: AncientMapPayload = JSON.parse(readFileSync("public/maps/data/map.json", "utf8"));
const books: Book[] = JSON.parse(readFileSync("public/data/kjv.json", "utf8")).books;
const verses = new Map<string, { tokens: VerseToken[]; bookIndex: number; chapterIndex: number; verseNumber: number }>();
books.forEach((book, bookIndex) => book.chapters.forEach((chapter, chapterIndex) => chapter.verses.forEach(verse => {
  verses.set(chapterVerseKey(bookIndex, chapterIndex, verse.verse), { tokens: verse.tokens, bookIndex, chapterIndex, verseNumber: verse.verse });
})));

function select(name: string, reference: string, occurrence = 0) {
  const verse = verses.get(reference)!;
  const index = verse.tokens.flatMap((token, i) => normalizeConcordanceWord(token.text).toLowerCase() === name.toLowerCase() ? [i] : [])[occurrence];
  expect(index).toBeDefined();
  const strongCodes = resolveTokenStrongsCodes(verse.tokens[index]);
  const context = resolvePersonPlaceContext(name, reference, strongCodes, verse.tokens, index);
  const persons = findGenealogyMatches(people, name, reference, context);
  const places = findMapMatches(maps, name, context, persons);
  const accordions = deriveTokenAccordionState(name, { ...verse, verseTokens: verse.tokens, tokenIndex: index,
    strongCodes, genealogyData: people, ancientMapsData: maps });
  expect(accordions.includes("genealogy")).toBe(persons.length > 0);
  expect(accordions.includes("maps")).toBe(places.some(place => !place.selectionNote));
  return { persons, places, context };
}

describe("person/place matching against shipped text and data", () => {
  it.each([
    ["Adam", "GEN.2.19"], ["Adam", "GEN.2.21"], ["Adam", "GEN.5.1"], ["Adam", "1CH.1.1"],
    ["Haran", "1CH.2.46"], ["Lydia", "ACT.16.14"], ["Lydia", "ACT.16.40"], ["Eden", "2CH.29.12"],
    ["Canaan", "GEN.10.6"], ["Moab", "GEN.19.37"], ["Midian", "GEN.25.2"],
  ])("does not suggest a namesake location for %s in %s", (name, reference) => {
    const result = select(name, reference);
    expect(result.persons.length).toBeGreaterThan(0);
    expect(result.places).toEqual([]);
  });

  it.each([
    ["Adam", "JOS.3.16", "adc31c7.geojson"],
    ["Lydia", "EZK.30.5", "a359997.geojson"],
    ["Canaan", "GEN.12.5", "a581f0c.geojson"],
    ["Moab", "NUM.22.1", "aa0b1d6.geojson"],
    ["Dan", "JDG.20.1", "a513646.geojson"],
    ["Judah", "1KI.14.21", "ab86a69.geojson"],
  ])("selects the supported place, not the ancestor, for %s in %s", (name, reference, id) => {
    const result = select(name, reference);
    expect(result.persons).toEqual([]);
    expect(result.places.map(place => place.geojson_file)).toEqual([id]);
    expect(result.places[0].selectionNote).toBeUndefined();
  });

  it.each(REVIEWED_NAME_VERSES.filter(review => new Set(review.senses).size > 1))(
    "distinguishes every $name occurrence in $reference, even with identical Strong's codes", review => {
      review.senses.forEach((sense, occurrence) => {
        const result = select(review.name, review.reference, occurrence);
        expect(result.context.sense).toBe(sense);
        expect(result.persons.length > 0).toBe(sense === "person");
        if (sense === "person") expect(result.places).toEqual([]);
        if (sense === "place") expect(result.places.map(place => place.geojson_file)).toEqual(review.mapIds);
      });
    },
  );

  it("keeps ambiguity explicit when the selected occurrence is unavailable", () => {
    const context = resolvePersonPlaceContext("Dan", "JDG.18.29", ["H1835"]);
    expect(context.sense).toBeUndefined();
    expect(context.ambiguous).toBe(true);
    expect(resolvePersonPlaceContext("Israel", "EXO.1.1").ambiguous).toBe(true);
    expect(resolvePersonPlaceContext("Haran", "GEN.11.31", ["H02771"]).sense).toBe("place");
  });

  it("labels incomplete map evidence and keeps manual searches broad", () => {
    const context = resolvePersonPlaceContext("Ephraim", "JDG.17.1");
    const places = findMapMatches(maps, "Ephraim", context);
    expect(places.length).toBeGreaterThan(0);
    expect(places.every(place => Boolean(place.selectionNote))).toBe(true);
    expect(findMapMatches(maps, "Lydia")).toHaveLength(2);
    expect(findGenealogyMatches(people, "Haran")).toHaveLength(3);
  });

  it("applies only documented corrections to existing source references", () => {
    for (const [id, review] of Object.entries(PERSON_REFERENCE_REVIEWS)) {
      const original = source.find(person => person.id === id)!;
      const originalRefs = original.verses!.byName!.find(entry => entry.name === review.name)!.verses;
      const corrected = people.find(person => person.id === id)!;
      const actual = corrected.verses!.byName!.find(entry => entry.name === review.name)!.verses;
      for (const ref of review.personalReferences ?? review.excludedReferences ?? []) {
        expect(originalRefs, `${id}: ${ref} must exist in original source`).toContain(ref);
        expect(verses.has(ref)).toBe(true);
      }
      if (review.personalReferences) expect(actual).toEqual(review.personalReferences);
      for (const ref of review.excludedReferences ?? []) expect(actual).not.toContain(ref);
      expect(corrected.verses!.totalVerses).toBe(new Set(corrected.verses!.byName!.flatMap(entry => entry.verses)).size);
    }
  });
});
