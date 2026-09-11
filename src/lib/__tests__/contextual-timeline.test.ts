import { describe, expect, it } from "vitest";
import { buildContextTimeline, CHAPTER_TIMELINE_MAP, CONTEXT_TIMELINE_COVERAGE, CONTEXT_TIMELINE_SOURCES, selectContextTimeline } from "@/data/contextual-timeline";
import { NT_NARRATIVE_DETAILS, TIMELINE_PHASES } from "@/data/contextual-timeline-nt";
import { buildBibleTimeline } from "@/data/bible-timeline";
import { formatTimelineYear, timelinePlotBounds } from "@/lib/bible-timeline";

const records = buildContextTimeline();
describe("contextual history", () => {
  it("keeps every reviewed chapter linked to real, cited entries", () => {
    const ids = new Set(records.map(record => record.id));
    expect(ids.size).toBe(records.length);
    for (const chapters of Object.values(CHAPTER_TIMELINE_MAP)) for (const mapping of Object.values(chapters)) {
      for (const id of [...mapping.ids, ...(mapping.contextIds ?? [])]) expect(ids.has(id), id).toBe(true);
    }
    for (const [book, chapters] of Object.entries(CHAPTER_TIMELINE_MAP)) for (const chapter of Object.keys(chapters)) {
      expect(selectContextTimeline(records, book, Number(chapter), "chapter", "historical").records.length, `${book} ${chapter} historical context`).toBeGreaterThan(0);
    }
    for (const record of records) {
      expect(record.sources.length, record.id).toBeGreaterThan(0);
      record.sources.forEach(id => expect(CONTEXT_TIMELINE_SOURCES[id]?.url, id).toMatch(/^https:\/\//));
      if (record.track === "biblical") expect(record.references.length, record.id).toBeGreaterThan(0);
    }
  });
  it("extends the initial chapters without replacing their mappings", () => {
    expect(CONTEXT_TIMELINE_COVERAGE.chapters).toBe(148);
    expect(CONTEXT_TIMELINE_COVERAGE.books).toHaveLength(11);
    expect(Object.keys(CHAPTER_TIMELINE_MAP.Ezra)).toHaveLength(10);
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][24].ids).toContain("jerusalem-597");
    expect(CHAPTER_TIMELINE_MAP.Acts[18].ids).toContain("paul-gallio");
    const nehemiah = selectContextTimeline(records, "Nehemiah", 5, "chapter", "all").records;
    expect(nehemiah.map(record => record.id)).toEqual(expect.arrayContaining(["wall", "nehemiah-governor", "socrates"]));
    expect(nehemiah.find(record => record.id === "socrates")?.emphasized).toBe(false);
  });
  it("keeps Daniel's unknown rescue and prophetic fulfillment separate from historical settings", () => {
    const rescue = selectContextTimeline(records, "Daniel", 6, "chapter", "all").records;
    expect(timelinePlotBounds(rescue.find(record => record.id === "daniel-lions")!)).toBeNull();
    expect(rescue.find(record => record.id === "babylon-falls")?.emphasized).toBe(false);
    const prophecy = selectContextTimeline(records, "Daniel", 9, "chapter", "biblical").records;
    expect(timelinePlotBounds(prophecy.find(record => record.id === "daniel-seventy-weeks")!)).toBeNull();
    expect(timelinePlotBounds(prophecy.find(record => record.id === "daniel-prayer")!)).toEqual([-538, -537]);
  });
  it("preserves Acts durations and separates uncertain dates from intervals", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    for (const id of ["paul-caesarea", "paul-rome"]) {
      const record = get(id);
      expect(record.kind).toBe("period");
      expect(record.end! - record.start!).toBe(2);
      expect(record.sources).toContain("festus");
    }
    expect(get("paul-gallio").kind).toBe("date-window");
    expect(get("claudian-famine").note).toContain("not a claim of a thirteen-year famine");
    expect(selectContextTimeline(records, "Acts", 26, "chapter", "biblical").records.map(record => record.id)).toEqual(["paul-appeal"]);
    expect(get("paul-rome").note).toContain("does not state his release");
  });
  it("includes major figures in wider history without stretching chapter context to the Middle Ages", () => {
    const all = selectContextTimeline(records, "Luke", 3, "world", "historical").records;
    expect(all.map(record => record.id)).toEqual(expect.arrayContaining(["socrates", "plato", "aristotle"]));
    expect(records.some(record => /genghis/i.test(`${record.id} ${record.label}`))).toBe(false);
    expect(all.every(record => (record.start ?? Infinity) <= 100)).toBe(true);
    const chapter = selectContextTimeline(records, "Luke", 3, "chapter", "all");
    expect(chapter.records.map(record => record.id)).toEqual(expect.arrayContaining(["john-ministry", "jesus-baptism", "tiberius-reign"]));
    expect(chapter.records.some(record => record.id === "genghis-khan")).toBe(false);
    expect(chapter.note).toContain("recall earlier ancestors");
  });
  it("filters by narrative category, not whether a record has historical date evidence", () => {
    const chapter = selectContextTimeline(records, "2 Kings", 24, "chapter", "biblical").records;
    expect(chapter.map(record => record.id)).toEqual(["jerusalem-597"]);
    expect(chapter[0].sources).toContain("jerusalem");
    const history = selectContextTimeline(records, "2 Kings", 24, "chapter", "historical").records;
    expect(history.map(record => record.id)).toEqual(["nebuchadnezzar-reign"]);
  });
  it("keeps recalled and undated episodes separate from a chapter's main date", () => {
    const ezra = selectContextTimeline(records, "Ezra", 4, "chapter", "all").records;
    expect(timelinePlotBounds(ezra.find(record => record.id === "ezra-later-letters")!)).toBeNull();
    const completion = selectContextTimeline(records, "Ezra", 6, "chapter", "all").records;
    expect(completion.find(record => record.id === "return-decree")?.emphasized).toBe(false);
    expect(completion.find(record => record.id === "second-temple")?.emphasized).toBe(true);
  });
  it("discloses fallback coverage and does not silently date an unsupported passage", () => {
    const unknown = selectContextTimeline(records, "Job", 1, "chapter", "all");
    expect(unknown.mapped).toBe(false);
    expect(unknown.note).toContain("not a date assigned");
    expect(unknown.records.some(record => record.emphasized)).toBe(false);
    expect(selectContextTimeline(records, "Ezra", 10, "book", "biblical").mapped).toBe(true);
  });
  it("uses the shared biblical model and handles BC/AD dates without a year zero label", () => {
    for (const model of ["egypt430", "promise430"] as const) {
      const shared = buildBibleTimeline(model);
      const context = buildContextTimeline(model);
      for (const record of context.filter(record => shared.some(original => original.id === record.id))) {
        expect(timelinePlotBounds(record)).toEqual(timelinePlotBounds(shared.find(original => original.id === record.id)!));
      }
    }
    expect(formatTimelineYear(records.find(record => record.id === "socrates")!.start!)).toBe("469 BC");
    expect(timelinePlotBounds(records.find(record => record.id === "jesus-age-twelve")!)).toEqual([7, 9]);
  });
  it("provides explicit narrative context for every Gospel and Acts chapter", () => {
    for (const [book, count] of Object.entries({ Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28 })) {
      expect(Object.keys(CHAPTER_TIMELINE_MAP[book])).toHaveLength(count);
      for (let chapter = 1; chapter <= count; chapter++) {
        const selection = selectContextTimeline(records, book, chapter, "chapter", "biblical");
        expect(selection.mapped, `${book} ${chapter}`).toBe(true);
        expect(selection.records.some(record => record.emphasized && record.narrative?.passages.some(p => p.book === book && p.startChapter <= chapter && p.endChapter >= chapter))).toBe(true);
      }
    }
  });
  it("links clear Gospel parallels without merging disputed accounts", () => {
    const harmony = selectContextTimeline(records, "Job", 1, "gospels", "biblical").records;
    expect(harmony.every(record => record.narrative?.collection === "gospels")).toBe(true);
    const feeding = harmony.find(record => record.id === "gospel-feeding-5000")!;
    expect(feeding.narrative!.passages.map(p => p.book)).toEqual(["Matthew", "Mark", "Luke", "John"]);
    for (const id of ["gospel-feeding-4000", "gospel-early-temple", "gospel-final-temple", "gospel-sermon-mount", "gospel-sermon-plain", "gospel-anointing-galilee", "gospel-bethany-anointing"]) {
      expect(harmony.some(record => record.id === id), id).toBe(true);
    }
    expect(timelinePlotBounds(harmony.find(record => record.id === "gospel-genealogies")!)).toBeNull();
    expect(harmony.find(record => record.id === "gospel-olivet")!.note).toContain("not assigned AD 30 fulfillment");
    expect(harmony.find(record => record.id === "gospel-last-supper")!.note).toContain("debated");
  });
  it("filters collections by stage independently of the reader chapter and text search", () => {
    for (const collection of ["gospels", "paul"] as const) for (const phase of TIMELINE_PHASES[collection]) {
      const stage = selectContextTimeline(records, "Ezra", 6, collection, "biblical", "", phase);
      expect(stage.mapped).toBe(true);
      expect(stage.records.length, phase).toBeGreaterThan(0);
      expect(stage.records.every(record => record.narrative?.collection === collection && record.narrative.phase === phase)).toBe(true);
    }
    const found = selectContextTimeline(records, "Ezra", 6, "gospels", "biblical", "John 6:1", "Galilean ministry").records;
    expect(found.some(record => record.id === "gospel-feeding-5000")).toBe(true);
    const before = selectContextTimeline(records, "Acts", 17, "paul", "biblical", "", "Second mission").records;
    const after = selectContextTimeline(records, "Acts", 17, "paul", "biblical", "Corinth", "Second mission").records;
    for (const record of after) expect(timelinePlotBounds(record)).toEqual(timelinePlotBounds(before.find(item => item.id === record.id)!));
  });
  it("preserves Paul's route sequence, later plans, and the hearing's recollections", () => {
    const missions = selectContextTimeline(records, "Acts", 1, "paul", "biblical").records;
    const ids = missions.map(record => record.id);
    expect(ids.indexOf("paul-cyprus")).toBeLessThan(ids.indexOf("paul-first-return"));
    expect(ids.indexOf("paul-first-return")).toBeLessThan(ids.indexOf("paul-council"));
    expect(ids.indexOf("paul-gallio")).toBeLessThan(ids.indexOf("paul-second-return"));
    expect(ids.indexOf("paul-second-return")).toBeLessThan(ids.indexOf("paul-third-departure"));
    expect(ids.indexOf("paul-miletus")).toBeLessThan(ids.indexOf("paul-arrest"));
    expect(ids.indexOf("paul-appeal")).toBeLessThan(ids.indexOf("paul-voyage"));
    for (const record of missions.filter(record => record.narrative?.phase === "Later letters and plans")) expect(timelinePlotBounds(record), record.id).toBeNull();
    expect(missions.find(record => record.id === "paul-spain-plan")!.note).toContain("not a completed fourth mission");
    expect(missions.find(record => record.id === "paul-voyage")!.note).toContain("Phenice is an intended");
    const hearing = selectContextTimeline(records, "Acts", 26, "chapter", "biblical").records;
    expect(hearing.map(record => record.id)).toEqual(["paul-appeal"]);
    expect(NT_NARRATIVE_DETAILS["paul-conversion"].passages.map(p => p.startChapter)).toEqual([9]);
  });
  it("includes only overlapping historical contemporaries unless explicitly cited as background", () => {
    const athens = selectContextTimeline(records, "Acts", 17, "chapter", "all").records;
    expect(athens.some(record => ["socrates", "plato", "aristotle"].includes(record.id))).toBe(false);
    expect(athens.some(record => record.id === "claudius-reign")).toBe(true);
    const plans = selectContextTimeline(records, "Acts", 17, "paul", "historical", "", "Later letters and plans");
    expect(plans.records).toEqual([]);
  });

});
