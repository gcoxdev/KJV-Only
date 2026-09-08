import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildBibleTimeline, TIMELINE_METHOD, TIMELINE_SOURCES } from "../src/data/bible-timeline";
import { formatTimelineYear, hasUnknownEnd, hasUnknownStart, timelineDate, timelineDateSummary, timelinePlotBounds } from "../src/lib/bible-timeline";
import { decodeGenealogyPayload } from "../src/lib/genealogy";
import type { Book } from "../src/types/bible";

const records = buildBibleTimeline();
const record = (id: string) => records.find(item => item.id === id)!;

describe("KJV timeline evidence", () => {
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
