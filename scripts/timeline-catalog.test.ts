import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildBibleTimeline } from "../src/data/bible-timeline";
import { buildContextTimeline, CHAPTER_TIMELINE_MAP, CONTEXT_TIMELINE_SOURCES, selectContextTimeline } from "../src/data/contextual-timeline";
import { buildTimelineCatalog, matchingTimelinePeople, relatedTimelineEntries, selectCatalogHistory } from "../src/data/timeline-catalog";
import { timelineRelatedTools } from "../src/data/timeline-related-tools";
import { buildLineageTimeline, indexTimelinePersonDates, jesusLineage, timelineDateSummary, timelineEntryCategory, timelinePlotBounds } from "../src/lib/bible-timeline";
import { TIMELINE_ID_ALIASES, canonicalTimelineId } from "../src/lib/timeline-identities";
import { decodeGenealogyPayload } from "../src/lib/genealogy";

const people = new Map(decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"))).map(person => [person.id, person]));
const ids = (rows: { id: string }[]) => rows.map(row => row.id);

for (const model of ["egypt430", "promise430"] as const) describe(`shared chronology catalog: ${model}`, () => {
  const catalog = buildTimelineCatalog(model);
  const core = buildBibleTimeline(model);
  const history = buildContextTimeline(model);
  it("consolidates five reigns with alias lookup, evidence and navigation intact", () => {
    expect(catalog.records).toHaveLength(1138);
    expect(new Set(ids(catalog.records)).size).toBe(catalog.records.length);
    expect(catalog.genealogyRecords).toHaveLength(89);
    expect(catalog.historicalRecords).toHaveLength(1084);
    for (const [alias, id] of Object.entries(TIMELINE_ID_ALIASES)) {
      const row = catalog.byId.get(id)!;
      expect(catalog.byId.get(alias)).toBe(row);
      expect(catalog.genealogyRecords.find(record => record.id === id)).toBe(row);
      expect(catalog.historicalRecords.find(record => record.id === id)).toBe(row);
      expect(catalog.records.some(record => record.id === alias)).toBe(false);
      expect(row).toMatchObject({ kind: "period", activityType: "reign" });
      expect(timelineDateSummary(row)).toMatch(/^Reign:/);
      for (const source of [core.find(record => record.id === id)!, history.find(record => record.id === alias)!]) {
        expect(timelinePlotBounds(row)).toEqual(timelinePlotBounds(source));
        expect(row.references).toEqual(expect.arrayContaining(source.references));
        expect(row.note).toContain(source.note);
        for (const link of timelineRelatedTools(source)) expect(timelineRelatedTools(row).some(candidate => JSON.stringify(candidate.request) === JSON.stringify(link.request))).toBe(true);
      }
    }
    for (const row of catalog.records) {
      for (const source of row.sources) expect(CONTEXT_TIMELINE_SOURCES[source], `${row.id}: ${source}`).toBeDefined();
      for (const link of row.personAssociations ?? []) {
        expect(people.has(link.personId), `${row.id}: ${link.personId}`).toBe(true);
        expect(link.reference, row.id).toBeTruthy();
      }
    }
  });
  it("retains every chapter's focus and all 1,189 chapter mappings", () => {
    let count = 0;
    for (const [book, chapters] of Object.entries(CHAPTER_TIMELINE_MAP)) for (const chapter of Object.keys(chapters)) {
      const old = selectContextTimeline(history, book, Number(chapter), "chapter", "all");
      const current = selectCatalogHistory(catalog, book, Number(chapter), "chapter", "all");
      expect(ids(current.records.filter(row => row.emphasized)).sort(), `${book} ${chapter}`).toEqual(ids(old.records.filter(row => row.emphasized)).map(canonicalTimelineId).sort());
      expect(current.mapped).toBe(true);
      count++;
    }
    expect(count).toBe(1189);
  });
  it("preserves life evidence and both complete lineages without deriving births from events or reigns", () => {
    const before = indexTimelinePersonDates(core);
    const after = indexTimelinePersonDates(catalog.genealogyRecords);
    expect([...after.keys()]).toEqual([...before.keys()]);
    for (const [id, row] of before) expect(timelineDateSummary(after.get(id)!)).toBe(timelineDateSummary(row));
    expect(after.has("solomon_677")).toBe(false);
    for (const branch of ["joseph", "mary"] as const) {
      const members = jesusLineage(people, branch).members;
      const original = buildLineageTimeline(members, core);
      const rows = relatedTimelineEntries(catalog, members, true).filter(row => timelineEntryCategory(row) === "people");
      expect(rows).toHaveLength(branch === "joseph" ? 65 : 76);
      expect(rows.map(row => [row.personIds, row.start, row.end, row.placement?.year])).toEqual(original.map(row => [row.personIds, row.start, row.end, row.placement?.year]));
    }
    const david = core.find(row => row.id === "david_593")!;
    const reign = { ...david, id: "reign", kind: "period" as const, activityType: "reign" as const, start: -1000 };
    for (const sources of [[reign, david], [david, reign]]) expect(buildLineageTimeline([people.get("david_593")!], sources)[0]).toBe(david);
  });
  it("adds reviewed family events and keeps supporting mentions opt-in, including Jesus aliases", () => {
    const related = (id: string, context = false) => relatedTimelineEntries(catalog, [people.get(id)!], false, context);
    expect(ids(related("noah_25"))).toContain("flood");
    expect(ids(related("solomon_677"))).toEqual(expect.arrayContaining(["solomon_677", "temple", "temple-complete"]));
    expect(ids(related("solomon_677"))).not.toContain("context-sng");
    expect(ids(related("solomon_677", true))).toContain("context-sng");
    for (const id of ["jesus_christ_2683", "jesus_christ_2684"]) {
      expect(ids(related(id))).toContain("jesus-birth");
      expect(ids(related(id))).not.toContain("gospel-guard-report");
      expect(ids(related(id, true))).toContain("gospel-guard-report");
      expect(matchingTimelinePeople(catalog.byId.get("gospel-guard-report")!, new Set([id]), true)[0].role).toBe("context");
    }
    const paul = related("saul_2959");
    expect(ids(paul)).toContain("paul-spain-plan");
    expect(timelinePlotBounds(paul.find(row => row.id === "paul-spain-plan")!)).toBeNull();
    for (const row of paul.filter(row => row.id.startsWith("paul-"))) expect(row.personIds ?? []).not.toContain("saul_2959");
  });
  it("adds optional biblical people without duplicate reigns or changing narrative reading order", () => {
    const select = (showPeople: boolean) => selectCatalogHistory(catalog, "Genesis", 5, "world", "all", "", "all", showPeople).records;
    expect(ids(select(false))).not.toContain("adam_2");
    expect(ids(select(true))).toContain("adam_2");
    expect(ids(select(true)).filter(id => id === "solomon_677")).toHaveLength(1);
    expect(selectCatalogHistory(catalog, "Genesis", 5, "world", "all", "Adam", "all", true).records.some(row => row.id === "adam_2")).toBe(true);
    for (const scope of ["gospels", "paul"] as const) {
      const before = selectCatalogHistory(catalog, "Matthew", 1, scope, "all");
      const after = selectCatalogHistory(catalog, "Matthew", 1, scope, "all", "", "all", true);
      const existing = new Set(ids(before.records));
      expect(ids(after.records.filter(row => existing.has(row.id)))).toEqual(ids(before.records));
    }
    expect(buildBibleTimeline(model)).toEqual(core);
    expect(buildContextTimeline(model)).toEqual(history);
  });
});
