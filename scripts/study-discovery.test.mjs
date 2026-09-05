import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { TOPIC_ALIAS_GROUPS, topicsForAlias } from "../src/lib/topic-aliases.ts";
import { genealogyFamilyKey, genealogyPersonContext } from "../src/lib/genealogy-result-context.ts";
import { decodeGenealogyPayload } from "../src/lib/genealogy.ts";
import { findMapsInArea, mapBoundsOverlap } from "../src/lib/map-area.ts";

describe("topic discovery", () => {
  it("links every reviewed alias to real topics with passages", async () => {
    const payload = JSON.parse(await readFile("public/topics/topics-index.json", "utf8"));
    const topics = new Map(payload.topics.map(entry => [entry.topic, entry.references]));
    const aliases = new Set();
    for (const group of TOPIC_ALIAS_GROUPS) {
      for (const alias of group.aliases) {
        expect(aliases.has(alias)).toBe(false);
        aliases.add(alias);
        expect(topicsForAlias(alias)).toEqual(group.topics);
      }
      for (const topic of group.topics) expect(topics.get(topic)?.length, topic).toBeGreaterThan(0);
    }
  });
  it("normalizes everyday punctuation without guessing at other phrases", () => {
    expect(topicsForAlias("  I’M   AFRAID! ")).toEqual(["Fear", "Courage", "Trust In God"]);
    expect(topicsForAlias("I am not afraid")).toEqual([]);
    expect(topicsForAlias("something else")).toEqual([]);
  });
});

describe("genealogy result context", () => {
  it("distinguishes Joseph's parents using the shipped genealogy", async () => {
    const compact = JSON.parse(await readFile("public/references/genealogy.compact.min.json", "utf8"));
    const people = decodeGenealogyPayload(compact).filter(person => person.names.includes("Joseph"));
    const contexts = people.map(genealogyPersonContext);
    expect(contexts.some(context => context.includes("Father: Jacob") && context.includes("Mother: Rachel"))).toBe(true);
    expect(new Set(contexts).size).toBeGreaterThan(1);
  });
  it("preserves people with the same names and references but different families", () => {
    const person = { id: "one", names: ["Joseph"], father: { id: "jacob", name: "Jacob" } };
    expect(genealogyFamilyKey(person)).not.toBe(genealogyFamilyKey({ ...person, father: { id: "heli", name: "Heli" } }));
    expect(genealogyFamilyKey({ ...person, id: "duplicate" })).toBe(genealogyFamilyKey(person));
    expect(genealogyFamilyKey({ ...person, father: { id: "jacob-copy", name: "Jacob" } })).toBe(genealogyFamilyKey(person));
  });
  it("falls back to spouse, children or missing-details text", () => {
    const person = { id: "one", names: ["Person"] };
    expect(genealogyPersonContext({ ...person, spouses: [{ id: "two", name: "Spouse" }] })).toBe("Spouse: Spouse");
    expect(genealogyPersonContext({ ...person, children: [{ id: "two", name: "Child" }] })).toBe("Children: Child");
    expect(genealogyPersonContext(person)).toBe("No family or reference details recorded");
    expect(genealogyPersonContext({ ...person, verses: { first: "GEN.1.2" } })).toBe("Name reference: GEN 1:2");
  });
});

describe("map area discovery", () => {
  it("matches points, overlapping areas and boundaries, excluding disjoint bounds", () => {
    const view = [34, 31, 36, 33];
    expect(mapBoundsOverlap([35, 32, 35, 32], view)).toBe(true);
    expect(mapBoundsOverlap([30, 30, 35, 32], view)).toBe(true);
    expect(mapBoundsOverlap([36, 33, 38, 35], view)).toBe(true);
    expect(mapBoundsOverlap([0, 0, 1, 1], view)).toBe(false);
    expect(mapBoundsOverlap([34, 34, 36, 35], view)).toBe(false);
    expect(mapBoundsOverlap([NaN, 0, 1, 1], view)).toBe(false);
  });
  it("handles wrapped and antimeridian viewports", () => {
    expect(mapBoundsOverlap([-175, 0, -175, 0], [170, -10, -170, 10])).toBe(true);
    expect(mapBoundsOverlap([175, 0, 175, 0], [170, -10, 190, 10])).toBe(true);
    expect(mapBoundsOverlap([0, 0, 0, 0], [170, -10, -170, 10])).toBe(false);
    expect(mapBoundsOverlap([35, 32, 35, 32], [394, 31, 396, 33])).toBe(true);
    expect(mapBoundsOverlap([0, 0, 0, 0], [-360, -85, 360, 85])).toBe(true);
  });
  it("uses each candidate area and skips entries without geometry bounds", () => {
    const near = { geojson_file: "near", bounds: [[0, 0, 0, 0], [35, 32, 35, 32]] };
    const far = { geojson_file: "far", bounds: [[0, 0, 0, 0], [70, 60, 70, 60]] };
    expect(findMapsInArea([near, far, { geojson_file: "missing" }], [34, 31, 36, 33])).toEqual([near]);
  });
  it("finds Jerusalem in the shipped bounds index", async () => {
    const entries = JSON.parse(await readFile("public/maps/data/map.json", "utf8"));
    const results = findMapsInArea(entries, [35.20, 31.76, 35.26, 31.81]);
    expect(results.some(entry => entry.translations.includes("Jerusalem"))).toBe(true);
    expect(results.length).toBeLessThan(entries.length);
  });
});
