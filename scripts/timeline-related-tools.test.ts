import { readFileSync, existsSync } from "node:fs";
import { expect, it } from "vitest";
import { TIMELINE_RELATED_TOOLS, timelineRelatedTools } from "../src/data/timeline-related-tools";
import { buildContextTimeline } from "../src/data/contextual-timeline";
import { buildBibleTimeline } from "../src/data/bible-timeline";
import { decodeGenealogyPayload } from "../src/lib/genealogy";
import { resolvePersonPlaceContext } from "../src/lib/person-place-context";
import { BOOK_ICON_CODES, resolveTokenStrongsCodes } from "../src/lib/references";
import type { Book } from "../src/types/bible";
import { buildPassageConnections } from "./lib/timeline-connections";

it("reproduces all generated connections from the shipped KJV and identity indexes", async () => {
  const { TIMELINE_PASSAGE_CONNECTIONS } = await import("../src/data/timeline-passage-connections");
  const { books } = JSON.parse(readFileSync("public/data/kjv.json", "utf8")) as { books: Book[] };
  const people = decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8")));
  const maps = JSON.parse(readFileSync("public/maps/data/map.json", "utf8"));
  const genealogy = buildBibleTimeline();
  const records = [...new Map([...genealogy, ...buildContextTimeline()].map(record => [record.id, record])).values()];
  const aliases = new Map(genealogy.flatMap(record => (record.personIds ?? []).map(id => [id, record.personIds![0]] as const)));
  expect(buildPassageConnections(records, books, people, maps, aliases).connections).toEqual(TIMELINE_PASSAGE_CONNECTIONS);
}, 30000);

it("resolves every reviewed event, person, place and KJV association in shipped data", () => {
  const people = new Map(decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"))).map(person => [person.id, person]));
  const maps = JSON.parse(readFileSync("public/maps/data/map.json", "utf8")) as { geojson_file: string; verses: string[] }[];
  const { books } = JSON.parse(readFileSync("public/data/kjv.json", "utf8")) as { books: Book[] };
  for (const model of ["egypt430", "promise430"] as const) {
    const records = [...buildContextTimeline(model), ...buildBibleTimeline(model)];
    for (const id of Object.keys(TIMELINE_RELATED_TOOLS)) expect(records.some(record => record.id === id), id).toBe(true);
    for (const record of records) for (const { request, reference } of timelineRelatedTools(record)) {
      if (request.kind === "genealogy") expect(people.has(request.personId), `${record.id}: ${request.personId}`).toBe(true);
      if (request.kind === "maps") {
        const map = maps.find(map => map.geojson_file === request.geojsonFile);
        expect(map, request.geojsonFile).toBeDefined();
        expect(existsSync(`public/maps/geometry/${request.geojsonFile}`), request.geojsonFile).toBe(true);
        const [code, chapter, verse] = reference.split(".");
        const tokens = books[BOOK_ICON_CODES.indexOf(code)].chapters[Number(chapter) - 1].verses[Number(verse) - 1].tokens;
        const reviewedOverride = tokens.some((token, index) => resolvePersonPlaceContext(token.text, reference, resolveTokenStrongsCodes(token), tokens, index).mapIds?.includes(request.geojsonFile));
        expect(map!.verses.includes(reference) || reviewedOverride, `${record.id}: ${reference}`).toBe(true);
      }
      const [code, chapter, verse] = reference.split(".");
      expect(books[BOOK_ICON_CODES.indexOf(code)]?.chapters[Number(chapter) - 1]?.verses[Number(verse) - 1], `${record.id}: ${reference}`).toBeDefined();
    }
  }
});
it("keeps namesake locations separate and leaves unreviewed historical people unlinked", () => {
  const records = buildContextTimeline();
  const links = (id: string) => timelineRelatedTools(records.find(record => record.id === id)!);
  expect(links("jesus-birth").some(link => link.request.kind === "maps" && link.request.geojsonFile === "a112427.geojson")).toBe(true);
  expect(links("paul-antioch").find(link => link.request.kind === "maps")?.request).not.toEqual(links("paul-pisidia").find(link => link.request.kind === "maps")?.request);
  for (const record of records.filter(record => record.track === "historical" && !record.references.length && !record.personIds?.length && !TIMELINE_RELATED_TOOLS[record.id])) expect(timelineRelatedTools(record)).toEqual([]);
});

it("covers every base entry and protects known ambiguous names and generic words", async () => {
  const { TIMELINE_PASSAGE_CONNECTIONS } = await import("../src/data/timeline-passage-connections");
  const records = [...new Map([...buildContextTimeline(), ...buildBibleTimeline()].map(record => [record.id, record])).values()];
  expect(Object.keys(TIMELINE_PASSAGE_CONNECTIONS).sort()).toEqual(records.map(record => record.id).sort());
  expect(TIMELINE_PASSAGE_CONNECTIONS["passage-pro-2"]).not.toContainEqual(expect.arrayContaining(["son_of_geber_814"]));
  expect(TIMELINE_PASSAGE_CONNECTIONS["passage-ecc-3"]).not.toContainEqual(expect.arrayContaining(["the_giant_in_gath_742"]));
  expect(TIMELINE_PASSAGE_CONNECTIONS["passage-jon-2"]).toContainEqual(["genealogy", "jonah_922", "Jonah", "JON.2.1"]);
  const eden = timelineRelatedTools(records.find(r => r.id === "ot-eden")!);
  expect(eden.some(link => link.request.kind === "maps" && link.request.geojsonFile === "af3daeb.geojson")).toBe(true);
  expect(eden.some(link => link.request.kind === "genealogy" && link.label === "Eden")).toBe(false);
  expect(TIMELINE_PASSAGE_CONNECTIONS["passage-isa-20"]?.filter(link => link[3] === "ISA.20.1").some(link => link[1] === "sennacherib_951")).toBe(false);
});

it("preserves canonical Psalm headings as separate evidence", async () => {
  const { TIMELINE_HEADING_CONNECTIONS } = await import("../src/data/timeline-heading-connections");
  expect(TIMELINE_HEADING_CONNECTIONS["passage-psa-23"]).toMatchObject({ label: "Psalm 23 heading", text: "A Psalm of David.", people: [["david_593", "David"]] });
  expect(TIMELINE_HEADING_CONNECTIONS["passage-psa-72"].text).toBe("A Psalm for Solomon.");
  expect(TIMELINE_HEADING_CONNECTIONS["passage-psa-1"]).toBeUndefined();
  const records = buildContextTimeline();
  const link = timelineRelatedTools(records.find(r => r.id === "passage-psa-23")!).find(link => link.request.kind === "genealogy" && link.request.personId === "david_593");
  expect(link).toMatchObject({ association: "context", referenceLabel: "Psalm 23 heading", evidence: "A Psalm of David." });
});

it("keeps every external timeline source and usage note on Credits", async () => {
  const { CONTEXT_TIMELINE_SOURCES } = await import("../src/data/contextual-timeline");
  const { TIMELINE_SOURCE_CREDITS } = await import("../src/data/timeline-source-credits");
  const sources = Object.entries(CONTEXT_TIMELINE_SOURCES).map(([id,source]) => ({ id, ...source }));
  expect(TIMELINE_SOURCE_CREDITS).toEqual(sources);
  expect(sources.some(source => source.id === "cambyses")).toBe(true);
  expect(sources.some(source => source.id === "crucifixionStudy")).toBe(true);
});
