import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildBibleTimeline, TIMELINE_METHOD, TIMELINE_SOURCES } from "../src/data/bible-timeline";
import { buildLineageTimeline, formatTimelineYear, hasUnknownEnd, hasUnknownStart, indexTimelinePersonDates, jesusLineage, timelineEntryCategory, timelineDate, timelineDateSummary, timelinePlotBounds } from "../src/lib/bible-timeline";
import { decodeGenealogyPayload } from "../src/lib/genealogy";
import type { Book } from "../src/types/bible";

const records = buildBibleTimeline();
const record = (id: string) => records.find(item => item.id === id)!;

describe("KJV timeline evidence", () => {
  it("plots every ancestor in both lineages without changing any reviewed dates or inventing lifespans", () => {
    const people = new Map(decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"))).map(person => [person.id, person]));
    const original = structuredClone(records);
    for (const branch of ["mary", "joseph"] as const) for (const model of ["egypt430", "promise430"] as const) {
      const source = buildBibleTimeline(model);
      const members = jesusLineage(people, branch).members;
      const plotted = buildLineageTimeline(members, source);
      expect(plotted).toHaveLength(members.length);
      expect(plotted.every(row => timelinePlotBounds(row))).toBe(true);
      expect(plotted.map(row => members.find(p => row.personIds?.includes(p.id))!.id)).toEqual([...members].reverse().map(p => p.id));
      const lookup = (id: string) => plotted.find(row => row.personIds?.includes(id))!;
      for (const row of plotted.filter(row => !row.placement)) expect(row).toBe(source.find(r => r.id === row.id));
      for (const row of plotted.filter(row => row.placement)) {
        expect(row.start).toBeUndefined(); expect(row.end).toBeUndefined();
        expect(timelineDateSummary(row)).toContain("Estimated placement:");
        expect(timelineDateSummary(row)).toContain("Birth: Unknown · Death: Unknown");
        expect(row.placement!.anchorIds.length).toBeGreaterThan(0);
        expect(row.references.length).toBeGreaterThan(0);
        expect(indexTimelinePersonDates(plotted).has(row.personIds![0])).toBe(false);
      }
      expect(lookup("boaz_590").placement!.year).toBeGreaterThan(lookup("nahshon_379").start!);
      expect(lookup("boaz_590").placement!.year).toBeLessThan(lookup("david_593").start!);
      expect(lookup("ram_594").placement!.explanation).toContain("20-year generation would not span");
      expect(lookup("cainan_2923").placement!.explanation).toContain("does not resolve");
      expect(lookup("judah_197").start).toBe(source.find(r => r.id === "egypt-entry")!.start);
      expect(lookup("nahshon_379").start).toBe(source.find(r => r.id === "exodus")!.start! + 1);
      if (branch === "mary") expect(lookup("nathan_676").placement!.method).toBe("context");
    }
    expect(records).toEqual(original);
    const members = jesusLineage(people, "mary").members;
    const before = buildLineageTimeline(members, records);
    const shifted = buildLineageTimeline(members, buildBibleTimeline("promise430"));
    const estimate = (rows: typeof before, id: string) => rows.find(r => r.personIds?.includes(id))!.placement!.year;
    expect(estimate(shifted, "ram_594")).toBeGreaterThan(estimate(before, "ram_594"));
    expect(estimate(shifted, "heli_2883")).toBe(estimate(before, "heli_2883"));
  });

  it("uses twenty years only with one anchor and preserves unanchored or contradictory gaps", () => {
    const member = (id: string) => ({ id, names: [id] });
    const chain = [member("child"), member("middle"), member("parent")];
    const parent = { ...record("david_593"), id: "parent", personIds: ["parent"], start: -100, end: undefined };
    const child = { ...parent, id: "child", personIds: ["child"], start: 0 };
    const rows = buildLineageTimeline(chain, [parent]);
    expect(rows[1].placement!.year).toBe(-79); // nearest five calendar years: 80 BC
    expect(rows[1].placement!.method).toBe("generation");
    expect(rows[1].placement!.explanation).toContain("Assumes 20 years");
    expect(buildLineageTimeline(chain, [child])[1].placement!.method).toBe("generation");
    expect(buildLineageTimeline(chain, []).every(row => !timelinePlotBounds(row))).toBe(true);
    expect(buildLineageTimeline(chain, [parent, { ...child, start: -200 }])[1].placement).toBeUndefined();
  });

  it("separates people's lives and activity from events and historical periods", () => {
    for (const id of ["adam_2", "miriam_390", "daniel_2774", "jesus-earthly", "mary_2828"]) expect(timelineEntryCategory(record(id))).toBe("people");
    for (const id of ["exodus", "egypt-sojourn", "jesus-birth", "john-ministry", "resurrection"]) expect(timelineEntryCategory(record(id))).toBe("events");
    expect(timelineEntryCategory({ ...record("resurrection"), personIds: ["jesus_christ_2683"] })).toBe("events");
  });

  it("keeps the two saved Jesus lineages separate and includes their undated ancestors", () => {
    const people = new Map(decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"))).map(person => [person.id, person]));
    for (const root of ["jesus_christ_2683", "jesus_christ_2684"]) {
      const joseph = jesusLineage(people, "joseph", root);
      const mary = jesusLineage(people, "mary", root);
      expect(joseph.complete).toBe(true);
      expect(mary.complete).toBe(true);
      expect(joseph.members[0].id).toBe(root);
      expect(mary.members[0].id).toBe(root);
      expect(joseph.members[1].id).toBe(people.get(root)!.father!.id);
      expect(mary.members[1].id).toBe(people.get(root)!.mother!.id);
      expect(joseph.members.some(p => p.id === "solomon_677")).toBe(true);
      expect(joseph.members.some(p => p.id === "nathan_676")).toBe(false);
      expect(mary.members.some(p => p.id === "nathan_676")).toBe(true);
      expect(mary.members.some(p => p.id === "solomon_677")).toBe(false);
      for (const branch of [joseph, mary]) {
        expect(branch.members.at(-1)!.id).toBe("adam_2");
        expect(branch.members.some(p => p.id === "god_1")).toBe(false);
        expect(new Set(branch.members.map(p => p.id)).size).toBe(branch.members.length);
      }
    }
    const root = people.get("jesus_christ_2683")!;
    const parent = people.get(root.father!.id)!;
    const cyclic = new Map([[root.id, root], [parent.id, { ...parent, father: { id: root.id, name: "Jesus" } }]]);
    expect(jesusLineage(cyclic, "joseph").members).toHaveLength(2);
    expect(jesusLineage(cyclic, "joseph").complete).toBe(false);
    expect(jesusLineage(new Map(), "mary")).toEqual({ members: [], complete: false });
  });

  it("shares reviewed life dates by person identity without treating activity as birth or death", () => {
    const dates = indexTimelinePersonDates(records);
    expect(dates.get("seth_17")).toBe(record("seth_17"));
    expect(dates.has("seth-namesake")).toBe(false);
    expect(dates.has("eve_3")).toBe(false);
    expect(dates.has("joshua_391")).toBe(false);
    expect(dates.has("daniel_2774")).toBe(false);
    expect(dates.has("mary_2828")).toBe(false);
    expect(timelineDateSummary(dates.get("miriam_390")!)).toBe("Birth: Unknown · Death: c. 1406 BC");
    expect(timelineDateSummary(dates.get("caleb_435")!)).toBe("Birth: c. 1485 BC · Death: Unknown");
    expect(timelineDateSummary(dates.get("enoch_22")!)).toContain("Taken by God:");
    for (const id of ["jesus_christ_2683", "jesus_christ_2684"]) {
      expect(timelineDateSummary(dates.get(id)!)).toBe("Birth: c. 5 BC · Resurrection: c. AD 30");
    }
    const alternate = indexTimelinePersonDates(buildBibleTimeline("promise430"));
    expect(alternate.get("seth_17")!.start! - dates.get("seth_17")!.start!).toBe(215);
  });

  it("preserves the Genesis fatherhood intervals and stated lifespans", () => {
    const relative = (id: string) => record(id).start! - record("adam_2").start!;
    expect(relative("seth_17")).toBe(130);
    expect(relative("enos_18")).toBe(235);
    expect(relative("noah_25")).toBe(1056);
    expect(relative("flood")).toBe(1656);
    expect(relative("shem_26")).toBe(1558);
    expect(relative("terah_102")).toBe(1878);
    expect(relative("abram_103")).toBe(2008);
    expect(relative("isaac_128")).toBe(2108);
    expect(relative("jacob_183")).toBe(2168);
    expect(relative("joseph_205")).toBe(2259);
    expect(relative("egypt-entry")).toBe(2298);
    expect(record("seth_17").end! - record("seth_17").start!).toBe(912);
    expect(record("enoch_22").endLabel).toBe("Taken by God");
    expect(record("enoch_22").references).toContain("HEB.11.5");
    expect(record("jesus-earthly").kind).toBe("period");
    expect(record("jesus-earthly").endLabel).toBe("Resurrection");
    for (const item of records.filter(item => item.kind === "life" && item.start !== undefined && item.end !== undefined)) {
      expect(item.end! - item.start!, item.id).toBe(item.age);
    }
  });

  it("changes sojourn assumptions without changing a KJV lifespan or post-Exodus anchor", () => {
    const alternate = new Map(buildBibleTimeline("promise430").map(item => [item.id, item]));
    expect(record("exodus").start! - record("egypt-entry").start!).toBe(430);
    expect(alternate.get("exodus")!.start! - alternate.get("egypt-entry")!.start!).toBe(215);
    for (const item of records.filter(item => item.adamYear !== undefined)) {
      expect(alternate.get(item.id)!.start! - item.start!).toBe(215);
      expect(alternate.get(item.id)!.age).toBe(item.age);
    }
    expect(alternate.get("exodus")!.start).toBe(record("exodus").start);
    expect(alternate.get("jerusalem-597")!.start).toBe(-596);
    expect(TIMELINE_METHOD.some(method => method.references.includes("ACT.13.20") && /unresolved/i.test(method.text))).toBe(true);
  });

  it("does not turn unknown endpoints, activity or known ages into invented lifespans", () => {
    expect(record("miriam_390").start).toBeUndefined();
    expect(hasUnknownStart(record("miriam_390"))).toBe(true);
    expect(timelinePlotBounds(record("miriam_390"))).toEqual([record("miriam_390").end, record("miriam_390").end]);
    expect(record("caleb_435").end).toBeUndefined();
    expect(hasUnknownEnd(record("caleb_435"))).toBe(true);
    expect(timelinePlotBounds(record("joshua_391"))).toBeNull();
    expect(record("joshua_391").age).toBe(110);
    expect(record("job_2665").age).toBeUndefined();
    expect(hasUnknownStart(record("daniel_2774"))).toBe(true);
    expect(hasUnknownEnd(record("daniel_2774"))).toBe(true);
    expect(timelineDateSummary(record("daniel_2774"))).toContain("Recorded activity");
    expect(record("jesus-birth").kind).toBe("date-window");
    expect(record("john-ministry").kind).toBe("date-window");
    expect(timelineDateSummary(record("jesus-birth"))).toContain("Possible event date");
    expect(record("resurrection").kind).toBe("event");
    expect(record("jesus-ministry").kind).toBe("period");
  });

  it("uses valid KJV citations, source IDs and existing genealogy identities throughout", () => {
    const books = JSON.parse(readFileSync("public/data/kjv.json", "utf8")).books as Book[];
    const codes = ["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"];
    const refs = new Set(books.flatMap((book, index) => book.chapters.flatMap(chapter => chapter.verses.map(verse => `${codes[index]}.${chapter.chapter}.${verse.verse}`))));
    const people = new Set(decodeGenealogyPayload(JSON.parse(readFileSync("public/references/genealogy.compact.min.json", "utf8"))).map(person => person.id));
    expect(new Set(records.map(item => item.id)).size).toBe(records.length);
    expect(records.length).toBeGreaterThan(70);
    for (const item of [...records, ...TIMELINE_METHOD]) {
      for (const ref of item.references) expect(refs.has(ref), ref).toBe(true);
    }
    for (const item of records) {
      expect(item.references.length + item.sources.length, item.id).toBeGreaterThan(0);
      expect(item.note.length, item.id).toBeGreaterThan(20);
      for (const source of item.sources) expect(TIMELINE_SOURCES[source], source).toBeDefined();
      for (const id of item.personIds ?? []) expect(people.has(id), id).toBe(true);
      if (item.start !== undefined && item.end !== undefined) expect(item.end, item.id).toBeGreaterThanOrEqual(item.start);
    }
  });

  it("round trips ancient and early AD dates without a 1900 shift or visible year zero", () => {
    for (const year of [-4173, -1445, -1, 0, 1, 30, 99]) {
      expect(timelineDate(year).getUTCFullYear()).toBe(year);
      expect(timelineDate(year).getUTCMonth()).toBe(0);
    }
    expect(formatTimelineYear(-1)).toBe("2 BC");
    expect(formatTimelineYear(0)).toBe("1 BC");
    expect(formatTimelineYear(1)).toBe("AD 1");
    expect(timelineDate(1).getTime() - timelineDate(0).getTime()).toBeGreaterThan(0);
  });
});
