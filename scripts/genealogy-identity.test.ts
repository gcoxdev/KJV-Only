import { PERSON_REFERENCE_REVIEWS } from "../src/lib/person-place-corrections.ts";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decodeGenealogyPayload, enrichGenealogyPayload, GENEALOGY_ENRICHMENT_VERSION } from "../src/lib/genealogy.ts";
import { encodeGenealogyPayload } from "../src/lib/genealogy-compact.ts";
import { genealogyPersonContext } from "../src/lib/genealogy-result-context.ts";
import { findGenealogyMatches } from "../src/lib/word-study-selection.ts";
import type { GenealogyCompactPayload, GenealogyPayload, GenealogyPerson } from "../src/types/reader.ts";
import type { Book } from "../src/types/bible.ts";

const source: GenealogyPayload = [
  ...JSON.parse(readFileSync("data-sources/genealogy.json", "utf8")),
  ...JSON.parse(readFileSync("data-sources/genealogy-additions.json", "utf8")),
];
const compact: GenealogyCompactPayload = JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"));
const shipped = decodeGenealogyPayload(compact);
const references = (person: GenealogyPerson) => [...new Set((person.verses?.byName ?? []).flatMap(entry => entry.verses))];

describe("genealogy identity boundaries", () => {
  it("restores Kore's two verse-backed sons and preserves other family assignments", () => {
    const kore = shipped.find(person => person.id === "kore_1619")!;
    expect(kore.children).toEqual([
      { id: "meshelemiah_1621", name: "Meshelemiah", verse: "1CH.26.1" },
      { id: "shallum_1615", name: "Shallum", verse: "1CH.9.19" },
    ]);
    for (const [name, id, ref] of [
      ["Meshelemiah", "meshelemiah_1621", "1CH.26.1"],
      ["Shallum", "shallum_1615", "1CH.9.19"],
    ]) {
      const matches = findGenealogyMatches(shipped, name, ref);
      expect(matches.map(person => person.id)).toEqual([id]);
      expect(matches[0].father).toEqual({ id: "kore_1619", name: "Kore" });
    }
    // Apply the existing decoder's legacy ID repairs to the baseline too.
    const baseline = decodeGenealogyPayload(encodeGenealogyPayload(source));
    const sourceById = new Map(baseline.map(person => [person.id, person]));
    for (const person of shipped) {
      const original = sourceById.get(person.id)!;
      if (!["meshelemiah_1621", "shallum_1615"].includes(person.id)) {
        expect(person.father?.id ?? "", person.id).toBe(original.father?.id ?? "");
      }
      if (person.id !== "kore_1619") {
        expect(person.children?.map(child => child.id) ?? [], person.id)
          .toEqual(original.children?.map(child => child.id) ?? []);
      }
      expect(person.siblings?.map(sibling => sibling.id) ?? [], person.id)
        .toEqual(original.siblings?.map(sibling => sibling.id) ?? []);
    }
  });

  it("resolves every shipped family link to a complete person record", () => {
    const ids = new Set(shipped.map(person => person.id));
    expect(ids.size).toBe(shipped.length);
    const missing = shipped.flatMap(person => [
      person.father, person.mother, ...(person.spouses ?? []),
      ...(person.siblings ?? []), ...(person.children ?? []),
    ].filter(relation => relation && !ids.has(relation.id))
      .map(relation => `${person.id} -> ${relation!.id}`));
    expect(missing).toEqual([]);
  });

  it.each([
    ["Enan", "enan_422", ["NUM.1.15", "NUM.2.29", "NUM.7.78", "NUM.7.83", "NUM.10.27"]],
    ["Peulthai", "peulthai_1826", ["1CH.26.5"]],
    ["Baladan", "baladan_968", ["2KI.20.12", "ISA.39.1"]],
    ["Malchiah", "malchiah_2752", ["JER.38.6"]],
    ["Hanan", "hanan_2720", ["JER.35.4"]],
    ["Cyrenius", "cyrenius_luk_2_2", ["LUK.2.2"]],
  ] as const)("finds the reviewed %s record in its own passages", (name, id, refs) => {
    const person = shipped.find(person => person.id === id)!;
    expect(person).toBeDefined();
    expect(references(person)).toEqual([...refs]);
    expect(person.verses?.totalOccurrences).toBe(refs.length);
    for (const ref of refs) {
      expect(findGenealogyMatches(shipped, name, ref).map(match => match.id)).toEqual([id]);
    }
  });

  it("restores reciprocal family navigation without absorbing namesakes", () => {
    const person = (id: string) => shipped.find(entry => entry.id === id)!;
    for (const [parentId, childId] of [
      ["enan_422", "ahira_421"], ["baladan_968", "berodachbaladan_967"],
      ["obededom_687", "peulthai_1826"], ["hammelech_2736", "malchiah_2752"],
      ["igdaliah_2721", "hanan_2720"],
    ]) {
      expect(person(parentId).children?.some(child => child.id === childId)).toBe(true);
      expect(person(childId).father?.id).toBe(parentId);
    }
    expect(person("peulthai_1826").siblings).toHaveLength(7);
    for (const sibling of person("peulthai_1826").siblings ?? []) {
      expect(person(sibling.id).siblings?.some(entry => entry.id === "peulthai_1826")).toBe(true);
    }
    expect(findGenealogyMatches(shipped, "Hanan", "1CH.8.23").map(p => p.id)).toEqual(["hanan_1519"]);
    expect(findGenealogyMatches(shipped, "Malchiah", "JER.38.1").map(p => p.id)).toEqual(["melchiah_2693"]);
    expect(person("cyrenius_luk_2_2").father).toBeUndefined();
  });

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
