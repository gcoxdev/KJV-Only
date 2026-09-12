import { describe, expect, it } from "vitest";
import { buildContextTimeline, CHAPTER_TIMELINE_MAP, CONTEXT_TIMELINE_COVERAGE, CONTEXT_TIMELINE_REFINEMENT, CONTEXT_TIMELINE_SOURCES, selectContextTimeline } from "@/data/contextual-timeline";
import { NT_NARRATIVE_DETAILS, TIMELINE_PHASES } from "@/data/contextual-timeline-nt";
import { buildAnchoredContext } from "@/data/contextual-timeline-anchors";
import { buildChroniclesContext, withChroniclesParallels } from "@/data/contextual-timeline-chronicles";
import { buildRefinedContext, REFINED_CHAPTER_TIMELINE_MAP } from "@/data/contextual-timeline-refinements";
import { BROAD_CHAPTER_TIMELINE_MAP, buildBroadContext } from "@/data/contextual-timeline-coverage";
import { EXPANDED_CHAPTER_TIMELINE_MAP } from "@/data/contextual-timeline-expansion";
import { buildKingsContext } from "@/data/contextual-timeline-kings";
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
      expect(selectContextTimeline(records, book, Number(chapter), "chapter", "biblical").records.length, `${book} ${chapter} biblical context`).toBeGreaterThan(0);
    }
    for (const record of records) {
      expect(record.sources.length, record.id).toBeGreaterThan(0);
      record.sources.forEach(id => expect(CONTEXT_TIMELINE_SOURCES[id]?.url, id).toMatch(/^https:\/\//));
      if (record.track === "biblical") expect(record.references.length, record.id).toBeGreaterThan(0);
    }
  });
  it("extends the initial chapters without replacing their mappings", () => {
    expect(CONTEXT_TIMELINE_COVERAGE.chapters).toBe(1189);
    expect(CONTEXT_TIMELINE_COVERAGE.books).toHaveLength(66);
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
    expect(chapter.map(record => record.id)).toEqual(["jerusalem-597", "zedekiah-appointed", "jehoiakim-babylon"]);
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
    const unknown = selectContextTimeline(records, "Job", 43, "chapter", "all");
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

  it("separates distinct Gospel episodes while retaining clear parallels", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("gospel-centurion-servant").narrative!.passages.map(p => p.book)).toEqual(["Matthew", "Luke"]);
    expect(get("gospel-nain").narrative!.passages.map(p => p.reference)).toEqual(["LUK.7.11"]);
    expect(get("gospel-walking-water").narrative!.passages).toHaveLength(3);
    expect(get("gospel-bread-life").narrative!.passages.map(p => p.reference)).toEqual(["JHN.6.22"]);
    expect(get("gospel-widow-offering").narrative!.passages.map(p => p.book)).toEqual(["Mark", "Luke"]);
    expect(get("gospel-thomas").note).toContain("after eight days");
    expect(get("gospel-first-evening").note).toContain("Thomas was absent");
    expect(get("gospel-emmaus").narrative!.passages.map(p => p.reference)).toEqual(["MRK.16.12", "LUK.24.13"]);
    expect(get("gospel-galilee-commission").narrative!.passages).toHaveLength(1);
    expect(get("gospel-lakeside-appearance").narrative!.passages.map(p => p.reference)).toEqual(["JHN.21.1"]);
    for (const id of ["gospel-john-purpose", "gospel-john-witness"]) expect(timelinePlotBounds(get(id))).toBeNull();
  });
  it("gives each letter chapter its own cited context without redating its subject matter", () => {
    const romans = selectContextTimeline(records, "Romans", 5, "chapter", "biblical");
    expect(romans.records.map(record => record.id)).toEqual(["writing-rom"]);
    expect(romans.note).toContain("Adam and Christ");
    expect(romans.records[0].references[0]).toBe("ROM.5.1");
    expect(romans.records[0].relevance).toContain("Earlier examples");
    expect(timelinePlotBounds(romans.records[0])).toEqual([57, 58]);
    expect(selectContextTimeline(records, "Romans", 5, "chapter", "biblical", "Adam").records).toHaveLength(1);
    expect(selectContextTimeline(records, "Romans", 5, "chapter", "biblical", "ROM.5.1").records).toHaveLength(1);
    const eight = selectContextTimeline(records, "Romans", 8, "chapter", "biblical").records[0];
    expect(eight.references).toContain("ROM.8.1");
    expect(eight.references).not.toContain("ROM.5.1");
    expect(records.find(record => record.id === "writing-rom")!.references).not.toContain("ROM.5.1");
    const letter = selectContextTimeline(records, "Philippians", 2, "chapter", "biblical").records[0];
    expect(letter.kind).toBe("date-window");
    expect(timelinePlotBounds(letter)).toEqual([61, 63]);
    expect(letter.note).toContain("hopes, not completed journeys");
    const book = selectContextTimeline(records, "Romans", 1, "book", "biblical").records;
    expect(book).toHaveLength(1);
    expect(book[0].references).toEqual(expect.arrayContaining(["ROM.5.1", "ROM.8.1", "ROM.16.1"]));
    expect(selectContextTimeline(records, "1 John", 3, "chapter", "historical").records.map(record => record.id)).toEqual(["domitian-reign"]);
  });
  it("preserves undated correspondence and does not turn Revelation into a dated fulfillment scheme", () => {
    for (const book of ["Galatians", "1 Timothy", "2 Timothy", "Titus", "Hebrews", "James", "Jude", "Revelation"]) {
      const selection = selectContextTimeline(records, book, 1, "chapter", "biblical");
      expect(selection.mapped).toBe(true);
      expect(selection.records).toHaveLength(1);
      expect(timelinePlotBounds(selection.records[0]), book).toBeNull();
      expect(selectContextTimeline(records, book, 1, "chapter", "historical").records, book).toEqual([]);
    }
    const vision = selectContextTimeline(records, "Revelation", 20, "chapter", "biblical");
    expect(vision.note).toContain("thousand years");
    expect(vision.records[0].references).toContain("REV.20.1");
    expect(vision.records[0].note).toContain("no single date or interval joining them");
    expect(selectContextTimeline(records, "Revelation", 1, "book", "biblical").records).toHaveLength(1);
    expect(selectContextTimeline(records, "Hebrews", 11, "chapter", "biblical").note).toContain("earlier generations");
  });

  it("covers every chapter from Genesis through Ruth with chapter-specific evidence", () => {
    for (const [book, count] of Object.entries({ Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34, Joshua: 24, Judges: 21, Ruth: 4 })) {
      expect(Object.keys(CHAPTER_TIMELINE_MAP[book]), book).toHaveLength(count);
      for (let chapter = 1; chapter <= count; chapter++) {
        const selection = selectContextTimeline(records, book, chapter, "chapter", "biblical");
        expect(selection.mapped).toBe(true);
        expect(selection.records.some(record => record.emphasized), `${book} ${chapter}`).toBe(true);
        expect(CHAPTER_TIMELINE_MAP[book][chapter].references?.length).toBeGreaterThan(0);
      }
    }
  });
  it("uses KJV ages over narrative chapter order and keeps the sojourn choice consistent", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    const alternate = new Map(buildContextTimeline("promise430").map(record => [record.id, record]));
    expect(get("ot-isaac-death").start! - get("joseph-sold").start!).toBe(12);
    expect(get("ot-ishmael-death").start!).toBeGreaterThan(get("ot-twins-birth").start!);
    expect(get("ot-jacob-marriages").start! - get("ot-jacob-haran").start!).toBe(7);
    expect(get("ot-laban-service").end! - get("ot-laban-service").start!).toBe(20);
    expect(get("ot-joseph-revealed").start).toBe(get("egypt-entry").start);
    expect(get("ot-plenty").end! - get("ot-plenty").start!).toBe(7);
    expect(get("ot-famine").end! - get("ot-famine").start!).toBe(7);
    expect(get("ot-prison-dreams").start! + 2).toBe(get("joseph-appointed").start);
    for (const record of records.filter(record => record.id.startsWith("ot-") && record.start !== undefined)) {
      const shift = ["beginnings", "patriarchs"].includes(record.era) ? 215 : 0;
      expect(alternate.get(record.id)?.start, record.id).toBe(record.start! + shift);
      if (record.end !== undefined) expect(alternate.get(record.id)?.end, record.id).toBe(record.end + shift);
    }
    for (const id of ["ot-isaac-offering", "ot-babel", "ot-bethel-rachel"]) expect(timelinePlotBounds(get(id)), id).toBeNull();
  });
  it("preserves the wilderness year markers and distinguishes commands from observances", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    const exodus = get("exodus").start!;
    expect(get("ot-moses-birth").start).toBe(exodus - 80);
    expect(get("ot-moses-midian").start).toBe(exodus - 40);
    for (const id of ["ot-tabernacle-raised", "ot-dedication", "ot-first-census", "ot-second-passover", "ot-sinai-departure", "ot-spies"]) expect(get(id).start, id).toBe(exodus + 1);
    expect(get("ot-dedication").note).toContain("earlier than the second-month census");
    expect(get("ot-second-passover").note).toContain("first-month Passover precedes");
    expect(get("ot-final-wilderness").kind).toBe("date-window");
    expect(timelinePlotBounds(get("ot-final-wilderness"))).toEqual([exodus + 39, exodus + 40]);
    expect(get("ot-moses-death").start).toBe(get("jordan").start);
    expect(get("ot-conquest").end).toBe(get("caleb-hebron").start);
    const atonement = selectContextTimeline(records, "Leviticus", 16, "chapter", "biblical");
    expect(atonement.note).toContain("does not narrate an immediate observance");
    expect(atonement.records.find(record => record.id === "ot-nadab-abihu")?.emphasized).toBe(false);
    expect(CHAPTER_TIMELINE_MAP.Leviticus[25].note).toContain("no first jubilee observance");
    expect(CHAPTER_TIMELINE_MAP.Numbers[33].ids).toContain("wilderness");
  });
  it("retains Judges durations and Ruth's seasons without invented absolute dates", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    for (const book of ["Judges", "Ruth"]) {
      const selection = selectContextTimeline(records, book, 1, "book", "biblical");
      expect(selection.records.length).toBeGreaterThan(0);
      for (const record of selection.records) expect(timelinePlotBounds(record), record.id).toBeNull();
      expect(selectContextTimeline(records, book, 1, "book", "historical").records).toEqual([]);
    }
    expect(get("ot-samson").note).toContain("within Philistine domination");
    expect(get("ot-jephthah").references).toContain("JDG.11.26");
    expect(get("ot-jephthah").note).toContain("three hundred years");
    expect(get("ot-benjamin-war").note).toContain("earlier generation");
    expect(get("ot-ruth-gleaning").note).toContain("barley and wheat harvest");
  });
  it("adds recalled Old Testament episodes without redating the New Testament writing context", () => {
    const corinth = selectContextTimeline(records, "1 Corinthians", 10, "chapter", "all");
    const writing = corinth.records.find(record => record.emphasized)!;
    expect(writing.id).toBe("writing-1co");
    expect(timelinePlotBounds(writing)).toEqual(timelinePlotBounds(records.find(record => record.id === writing.id)!));
    for (const id of ["ot-sea", "wilderness", "ot-calf", "ot-peor"]) expect(corinth.records.find(record => record.id === id)?.emphasized, id).toBe(false);
    const hebrews = selectContextTimeline(records, "Hebrews", 11, "chapter", "all");
    expect(timelinePlotBounds(hebrews.records.find(record => record.emphasized)!)).toBeNull();
    expect(hebrews.records.find(record => record.id === "ot-jericho")?.emphasized).toBe(false);
    expect(hebrews.records.find(record => record.id === "ot-isaac-offering")?.start).toBeUndefined();
    expect(selectContextTimeline(records, "Hebrews", 11, "chapter", "historical").records).toEqual([]);
  });

  it("maps every Samuel and Kings chapter without replacing existing conquest anchors", () => {
    for (const [book, count] of Object.entries({ "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25 })) {
      expect(Object.keys(CHAPTER_TIMELINE_MAP[book]), book).toHaveLength(count);
      for (let chapter = 1; chapter <= count; chapter++) {
        const selected = selectContextTimeline(records, book, chapter, "chapter", "biblical");
        expect(selected.mapped).toBe(true);
        expect(selected.records.some(record => record.emphasized), `${book} ${chapter}`).toBe(true);
        expect(CHAPTER_TIMELINE_MAP[book][chapter].references?.length).toBeGreaterThan(0);
      }
    }
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][19].ids).toContain("sennacherib-death");
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][25].ids).toContain("jehoiachin-released");
    const source = buildBibleTimeline();
    const original = structuredClone(source);
    expect(buildKingsContext(source)).toEqual(buildKingsContext(buildBibleTimeline("promise430")));
    expect(source).toEqual(original);
    expect(buildKingsContext(source).every(record => !record.personIds && !record.placement)).toBe(true);
  });
  it("preserves Samuel's intervals and the unresolved forty years in Absalom's revolt", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("royal-saul").end! - get("royal-saul").start!).toBe(40);
    expect(get("royal-saul").note).toContain("one-year/two-year wording");
    expect(get("royal-david-hebron").start).toBe(get("saul-final").start);
    expect(get("royal-david-hebron").note).toContain("seven years and six months");
    expect(get("ishbosheth").note).toContain("reigns two years");
    expect(timelinePlotBounds(get("ishbosheth"))).toBeNull();
    expect(timelinePlotBounds(get("absalom-revolt"))).toBeNull();
    expect(get("absalom-revolt").note).toContain("not silently changed to four years");
    expect(get("amnon-absalom").note).toContain("Two full years");
    expect(get("absalom-return").note).toContain("two full years in Jerusalem");
    expect(get("david-census").note).toContain("nine months and twenty days");
    expect(timelinePlotBounds(get("david-census"))).toBeNull();
    expect(get("ark-philistines").note).toContain("Seven months");
    expect(get("david-ziklag").kind).toBe("date-window");
    expect(get("david-ziklag").note).toContain("full year and four months");
    expect(get("david-keilah").id).not.toBe(get("david-spares-camp").id);
  });
  it("distinguishes Solomon's projects, dedication, and future Josiah prophecy", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("temple-complete").start! - get("temple").start!).toBe(7);
    expect(get("solomon-palace").kind).toBe("period");
    expect(get("solomon-palace").note).toContain("thirteen years");
    expect(timelinePlotBounds(get("solomon-palace"))).toBeNull();
    expect(get("solomon-two-houses").start).toBe(get("temple").start! + 20);
    expect(get("temple-dedication").note).toContain("seventh month");
    expect(timelinePlotBounds(get("temple-dedication"))).toBeNull();
    expect(get("solomon-established").note).toContain("after three years");
    const warning = selectContextTimeline(records, "1 Kings", 13, "chapter", "biblical").records;
    expect(warning.some(record => record.id === "josiah-bethel")).toBe(false);
    const reform = selectContextTimeline(records, "2 Kings", 23, "chapter", "biblical").records;
    expect(reform.find(record => record.id === "jeroboam-altars")?.emphasized).toBe(false);
    expect(reform.find(record => record.id === "josiah-bethel")?.emphasized).toBe(true);
    expect(get("josiah-death").start!).toBeGreaterThan(get("josiah-law").end!);
  });
  it("keeps the two kingdoms' namesakes and undated Elisha episodes distinct", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("royal-joram-israel").label).toContain("son of Ahab");
    expect(get("judah-jehoram-ahaziah").label).toContain("son of Jehoshaphat");
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][3].contextIds).toContain("royal-joram-israel");
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][12].ids).toContain("joash-repairs");
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][13].ids).not.toContain("joash-repairs");
    expect(CHAPTER_TIMELINE_MAP["2 Kings"][13].ids).toContain("northern-joash");
    for (const id of ["elijah-taken", "naaman", "samaria-siege-elisha", "shunammite-famine", "elisha-death"]) expect(timelinePlotBounds(get(id)), id).toBeNull();
    expect(get("shunammite-famine").note).toContain("seven years");
    expect(get("elijah-drought").note).toContain("three years and six months");
    expect(get("elijah-drought").kind).toBe("date-window");
    expect(get("elisha-death").note).toContain("later incident");
    expect(selectContextTimeline(records, "2 Kings", 7, "chapter", "biblical").records.map(record => record.id)).toEqual(["samaria-siege-elisha"]);
  });
  it("keeps later royal anchors, recollections, and Assyrian evidence in their proper roles", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("joash-judah-crowned").start! - get("jehu-coup").start!).toBe(6);
    expect(get("hezekiah-recovery").start).toBe(get("sennacherib").start);
    expect(get("hezekiah-recovery").start!).toBeLessThan(get("sennacherib-death").start!);
    expect(get("zedekiah-appointed").start).toBe(get("jerusalem-597").start);
    expect(get("jerusalem-final-siege").end).toBe(get("temple-destroyed").start);
    expect(get("jehoiachin-released").start!).toBeGreaterThan(get("temple-destroyed").start! + 20);
    expect(timelinePlotBounds(get("gedaliah"))).toBeNull();
    expect(timelinePlotBounds(get("manasseh-amon"))).toBeNull();
    const historical = selectContextTimeline(records, "2 Kings", 9, "chapter", "historical").records;
    expect(historical.map(record => record.id)).toContain("jehu-tribute");
    expect(historical.every(record => !record.emphasized)).toBe(true);
    expect(selectContextTimeline(records, "2 Kings", 9, "chapter", "biblical").records.some(record => record.id === "jehu-tribute")).toBe(false);
    expect(get("jehu-tribute").note).toContain("not proof that Jehu was Omri's biological son");
    expect(selectContextTimeline(records, "2 Kings", 16, "chapter", "historical").records.map(record => record.id)).toContain("tiglath-reign");
  });
  it("covers Chronicles and reuses parallel events without mutating source data", () => {
    for (const [book, count] of Object.entries({ "1 Chronicles": 29, "2 Chronicles": 36 })) {
      expect(Object.keys(CHAPTER_TIMELINE_MAP[book])).toHaveLength(count);
      for (let chapter = 1; chapter <= count; chapter++) {
        const selected = selectContextTimeline(records, book, chapter, "chapter", "biblical");
        expect(selected.mapped).toBe(true);
        expect(selected.records.some(record => record.emphasized), `${book} ${chapter}`).toBe(true);
      }
    }
    for (const [book, chapter, parallelBook, parallelChapter, id] of [
      ["1 Chronicles", 10, "1 Samuel", 31, "saul-final"],
      ["1 Chronicles", 17, "2 Samuel", 7, "david-covenant"],
      ["2 Chronicles", 18, "1 Kings", 22, "ahab-death"],
      ["2 Chronicles", 23, "2 Kings", 11, "joash-judah-crowned"],
      ["2 Chronicles", 35, "2 Kings", 23, "josiah-death"],
    ] as const) {
      expect(CHAPTER_TIMELINE_MAP[book][chapter].ids).toContain(id);
      expect(CHAPTER_TIMELINE_MAP[parallelBook][parallelChapter].ids).toContain(id);
      expect(records.filter(record => record.id === id)).toHaveLength(1);
    }
    const source = buildBibleTimeline();
    const original = structuredClone(source);
    const kings = buildKingsContext(source);
    const beforeKings = structuredClone(kings);
    const added = buildChroniclesContext([...source, ...kings]);
    const alternative = buildBibleTimeline("promise430");
    expect(added).toEqual(buildChroniclesContext([...alternative, ...buildKingsContext(alternative)]));
    const census = kings.find(record => record.id === "david-census")!;
    expect(withChroniclesParallels(census).references).toContain("1CH.21.12");
    expect(kings).toEqual(beforeKings);
    expect(source).toEqual(original);
    const saved = structuredClone(records);
    selectContextTimeline(records, "1 Chronicles", 21, "chapter", "biblical");
    expect(records).toEqual(saved);
  });
  it("keeps retrospective genealogies and mixed-era collections off a fabricated common date", () => {
    for (const chapter of [1, 2, 3, 6, 7, 8, 9]) {
      const selected = selectContextTimeline(records, "1 Chronicles", chapter, "chapter", "biblical");
      for (const record of selected.records) expect(timelinePlotBounds(record), record.id).toBeNull();
      expect(selectContextTimeline(records, "1 Chronicles", chapter, "chapter", "historical").records).toEqual([]);
    }
    const transjordan = selectContextTimeline(records, "1 Chronicles", 5, "chapter", "biblical").records;
    expect(transjordan.find(record => record.id === "tiglath-north")?.emphasized).toBe(false);
    const saul = records.find(record => record.id === "royal-saul")!;
    expect(timelinePlotBounds(transjordan.find(record => record.id === "hagarites-saul")!)).toEqual(timelinePlotBounds(saul));
    expect(transjordan.find(record => record.id === "hagarites-saul")?.kind).toBe("date-window");
    expect(timelinePlotBounds(transjordan.find(record => record.id === "chron-transjordan")!)).toBeNull();
  });
  it("derives explicit Chronicles regnal windows while retaining their limits", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    const lastDavidYear = get("royal-david-jerusalem").end!;
    expect(timelinePlotBounds(get("david-fortieth-officers"))).toEqual([lastDavidYear - 1, lastDavidYear]);
    const accession = get("royal-josiah").start!;
    expect(timelinePlotBounds(get("josiah-seeks"))).toEqual([accession + 7, accession + 8]);
    expect(timelinePlotBounds(get("josiah-purge"))).toEqual([accession + 11, accession + 12]);
    expect(timelinePlotBounds(get("josiah-law"))).toEqual([accession + 17, accession + 18]);
    expect(get("josiah-law").end!).toBeLessThan(get("josiah-death").start!);
    const hezekiah = get("royal-hezekiah").start!;
    expect(timelinePlotBounds(get("hezekiah-temple-cleansed"))).toEqual([hezekiah, hezekiah + 1]);
    expect(get("hezekiah-temple-cleansed").note).toContain("day sixteen");
    expect(get("hezekiah-temple-cleansed").note).toContain("shared-reign reckoning");
    expect(timelinePlotBounds(get("hezekiah-passover"))).toBeNull();
    expect(get("hezekiah-passover").note).toContain("second month");
    expect(timelinePlotBounds(get("hezekiah-provisions"))).toBeNull();
  });
  it("preserves KJV parallel readings and separates royal and prophetic namesakes", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    for (const [id, words] of [
      ["asa-ramah", ["thirty-sixth", "twenty-sixth", "not silently changed"]],
      ["judah-jehoram-ahaziah", ["forty-two", "twenty-two"]],
      ["jerusalem-597", ["eight at accession", "eighteen"]],
      ["david-census", ["three years in Chronicles", "seven in Samuel", "fifty shekels of silver", "six hundred shekels of gold"]],
      ["abijah-judah-war", ["Abijam", "not Jeroboam's son"]],
      ["jehoiada-zechariah", ["130", "son of Jehoiada", "not the later prophet"]],
      ["jehoram-judah-warning", ["Jehoshaphat's son", "Ahab's son", "Elijah's writing"]],
      ["solomon-accession", ["second time", "no extra intervening years"]],
    ] as const) for (const word of words) expect(get(id).note, id).toContain(word);
    for (const id of ["asa-ramah", "asa-final-years", "abijah-judah-war", "jehoiada-zechariah", "jehoram-judah-warning", "david-census"]) expect(timelinePlotBounds(get(id)), id).toBeNull();
    expect(get("asa-ramah").references).toEqual(expect.arrayContaining(["2CH.16.1", "1KI.16.8"]));
    expect(get("jerusalem-597").references).toEqual(expect.arrayContaining(["2CH.36.9", "2KI.24.8"]));
  });
  it("does not confuse Manasseh's Assyrian captivity with Judah's exile or shorten seventy years", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    const manasseh = selectContextTimeline(records, "2 Chronicles", 33, "chapter", "biblical");
    expect(manasseh.records.map(record => record.id)).toEqual(expect.arrayContaining(["manasseh-captivity", "manasseh-amon"]));
    expect(manasseh.records.some(record => ["jerusalem-597", "temple-destroyed", "return-decree"].includes(record.id))).toBe(false);
    expect(timelinePlotBounds(get("manasseh-captivity"))).toBeNull();
    expect(get("manasseh-captivity").note).toContain("king of Assyria");
    expect(get("jehoiakim-bound").note).toContain("does not itself narrate a completed journey");
    const ending = selectContextTimeline(records, "2 Chronicles", 36, "chapter", "biblical").records;
    expect(ending.filter(record => record.emphasized).map(record => record.id)).toEqual(expect.arrayContaining(["jerusalem-597", "temple-destroyed", "return-decree", "chron-seventy-years"]));
    expect(timelinePlotBounds(get("chron-seventy-years"))).toBeNull();
    expect(get("chron-seventy-years").note).toContain("not seventy years apart");
    expect(get("return-decree").start! - get("temple-destroyed").start!).toBe(48);
  });
  it("fills every remaining book without diluting existing episode mappings", () => {
    expect(Object.keys(CHAPTER_TIMELINE_MAP.Psalms)).toHaveLength(150);
    expect(Object.keys(CHAPTER_TIMELINE_MAP.Isaiah)).toHaveLength(66);
    expect(Object.keys(CHAPTER_TIMELINE_MAP.Ezekiel)).toHaveLength(48);
    expect(CHAPTER_TIMELINE_MAP.Isaiah[36]).toEqual(EXPANDED_CHAPTER_TIMELINE_MAP.Isaiah[36]);
    expect(CHAPTER_TIMELINE_MAP.Daniel[9]).toEqual(EXPANDED_CHAPTER_TIMELINE_MAP.Daniel[9]);
    expect(CHAPTER_TIMELINE_MAP.Nehemiah[8]).toEqual(EXPANDED_CHAPTER_TIMELINE_MAP.Nehemiah[8]);
    expect(CHAPTER_TIMELINE_MAP.Psalms[23]).toEqual(BROAD_CHAPTER_TIMELINE_MAP.Psalms[23]);
    expect(CHAPTER_TIMELINE_MAP.Psalms[23].note).toContain("shepherd");
    expect(selectContextTimeline(records, "Psalms", 23, "chapter", "biblical", "shepherd").records.map(r => r.id)).toContain("context-psa");
    const job = selectContextTimeline(records, "Job", 1, "chapter", "all");
    expect(job.mapped).toBe(true);
    expect(job.records.map(record => record.id)).toEqual(["context-job"]);
    expect(job.records[0].emphasized).toBe(true);
    expect(timelinePlotBounds(job.records[0])).toBeNull();
    expect(job.records[0].note).toContain("not his total age");
  });
  it("keeps undated wisdom, poetry, and prophetic settings unplaced", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    for (const id of ["context-job", "context-psa", "context-pro", "context-ecc", "context-sng", "context-jol", "context-oba", "context-jon", "context-nam", "context-hab", "context-mal", "context-lam"]) expect(timelinePlotBounds(get(id)), id).toBeNull();
    expect(selectContextTimeline(records, "Psalms", 137, "chapter", "biblical").records.find(r => r.id === "temple-destroyed")?.emphasized).toBe(false);
    expect(selectContextTimeline(records, "Obadiah", 1, "chapter", "historical").records).toEqual([]);
    expect(get("context-amo").note).toContain("priest of Bethel");
    expect(get("context-jon").note).toContain("does not supply the year");
    expect(get("context-mal").note).toContain("contextual inference");
    const proverbs = selectContextTimeline(records, "Proverbs", 25, "chapter", "biblical").records;
    expect(proverbs.find(r => r.id === "royal-solomon")?.emphasized).toBe(false);
    expect(proverbs.find(r => r.id === "proverbs-hezekiah-copy")?.kind).toBe("date-window");
    expect(get("proverbs-hezekiah-copy").note).toContain("not the date Solomon first spoke");
    expect(CHAPTER_TIMELINE_MAP.Proverbs[30].ids).toEqual(["proverbs-agur"]);
    expect(CHAPTER_TIMELINE_MAP.Proverbs[31].ids).toEqual(["proverbs-lemuel"]);
  });
  it("keeps prophetic reception, literary order, and future fulfillment separate", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("context-ezk").start).toBe(get("jerusalem-597").start! + 4);
    expect(get("context-ezk").end).toBe(get("jerusalem-597").start! + 26);
    expect(get("context-ezk").note).toContain("not assumed to be his age");
    for (let chapter = 40; chapter <= 48; chapter++) expect(CHAPTER_TIMELINE_MAP.Ezekiel[chapter].ids).toEqual(["ezekiel-temple-vision"]);
    expect(get("ezekiel-temple-vision").note).toContain("do not assert that the temple was built then");
    expect(timelinePlotBounds(get("ezekiel-temple-vision"))).toEqual([get("jerusalem-597").start! + 24, get("jerusalem-597").start! + 25]);
    expect(CHAPTER_TIMELINE_MAP.Ezekiel[29].note).toContain("separate occasions");
    expect(get("jer-yokes").references).toContain("JER.27.1");
    expect(get("jer-yokes").note).toContain("not silently changed to Zedekiah");
    expect(timelinePlotBounds(get("jer-yokes"))).toBeNull();
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[45].ids).toEqual(["jer-jehoiakim-fourth"]);
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[43].ids).toEqual(["jer-egypt-decision"]);
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[52].ids).toContain("jehoiachin-released");
    expect(CHAPTER_TIMELINE_MAP.Daniel[7].ids).toEqual(["daniel-belshazzar-first"]);
    expect(CHAPTER_TIMELINE_MAP.Daniel[8].ids).toEqual(["daniel-belshazzar-third"]);
    expect(CHAPTER_TIMELINE_MAP.Daniel[11].ids).toEqual(["daniel-cyrus-third"]);
    expect(CHAPTER_TIMELINE_MAP.Daniel[12].note).toContain("does not reset the reception date");
    for (let chapter = 9; chapter <= 14; chapter++) expect(CHAPTER_TIMELINE_MAP.Zechariah[chapter].ids).toEqual([`passage-zec-${chapter}`]);
    expect(get("zechariah-fasting").start).toBe(get("haggai-messages").start! + 2);
    expect(timelinePlotBounds(get("context-zec"))).toBeNull();
    expect(timelinePlotBounds(get("context-zep"))).toEqual(timelinePlotBounds(get("royal-josiah")));
  });
  it("retains Esther's regnal sequence and Nehemiah's undated later return", () => {
    const get = (id: string) => records.find(record => record.id === id)!;
    expect(get("esther-seventh-year").start! - get("esther-third-year").start!).toBe(4);
    expect(get("esther-deliverance").start! - get("esther-seventh-year").start!).toBe(5);
    expect(get("esther-deliverance").end! - get("esther-deliverance").start!).toBe(1);
    expect(CHAPTER_TIMELINE_MAP.Esther[10].ids).toEqual(["context-est"]);
    expect(timelinePlotBounds(get("context-est"))).toBeNull();
    expect(selectContextTimeline(records, "Esther", 3, "chapter", "historical").records.map(r => r.id)).toContain("xerxes-reign");
    expect(selectContextTimeline(records, "Esther", 3, "chapter", "biblical").records.some(r => r.id === "xerxes-reign")).toBe(false);
    expect(get("esther-third-year").note).toContain("assumes Ahasuerus is Xerxes");
    expect(get("neh-covenant-assembly").start).toBe(get("law-read-return").start);
    expect(timelinePlotBounds(get("neh-later-return"))).toBeNull();
    expect(CHAPTER_TIMELINE_MAP.Nehemiah[13].contextIds).toEqual(["nehemiah-governor"]);
  });
  it("builds later broad settings consistently without changing the shared chronology", () => {
    // Broad anchors are all after the Exodus; the sojourn choice cannot move them.
    // Select only the actual input anchors rather than the resulting broad records.
    const needed = new Set(["royal-solomon", "royal-hezekiah", "royal-josiah", "law-read-return", "nebuchadnezzar-reign", "haggai-messages"]);
    const later = records.filter(record => needed.has(record.id));
    const anchors = [...buildBibleTimeline(), ...later];
    const original = structuredClone(anchors);
    const normal = buildBroadContext(anchors);
    const alternative = buildBroadContext([...buildBibleTimeline("promise430"), ...later]);
    expect(normal).toEqual(alternative);
    expect(anchors).toEqual(original);
    expect(normal.every(record => !record.personIds && !record.placement)).toBe(true);
  });
  it("tracks the broad-pass refinement queue independently from complete chapter coverage", () => {
    expect(CONTEXT_TIMELINE_COVERAGE.chapters).toBe(1189);
    expect(CONTEXT_TIMELINE_REFINEMENT).toMatchObject({ baseline: 500, refined: 252, remaining: 248 });
    for (const [book, count] of Object.entries({ Jeremiah: 52, Ezekiel: 48, Esther: 10, Nehemiah: 6, Daniel: 7, Isaiah: 64, Hosea: 14, Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3, Zechariah: 14, Malachi: 4 })) {
      expect(CONTEXT_TIMELINE_REFINEMENT.byBook[book]).toEqual({ baseline: count, refined: count, remaining: 0 });
      expect(Object.keys(REFINED_CHAPTER_TIMELINE_MAP[book])).toHaveLength(count);
      for (const [chapter, mapping] of Object.entries(REFINED_CHAPTER_TIMELINE_MAP[book])) {
        expect(CHAPTER_TIMELINE_MAP[book][Number(chapter)]).toEqual(mapping);
        expect(mapping.references!.length).toBeGreaterThanOrEqual(3);
        expect(mapping.note).not.toContain("Broad chapter context");
        expect(selectContextTimeline(records, book, Number(chapter), "chapter", "biblical").records.some(r => r.emphasized)).toBe(true);
      }
    }
    expect(CONTEXT_TIMELINE_REFINEMENT.byBook.Psalms).toEqual({ baseline: 150, refined: 0, remaining: 150 });
    expect(CHAPTER_TIMELINE_MAP.Daniel[9]).toEqual(EXPANDED_CHAPTER_TIMELINE_MAP.Daniel[9]);
    expect(CHAPTER_TIMELINE_MAP.Nehemiah[8]).toEqual(EXPANDED_CHAPTER_TIMELINE_MAP.Nehemiah[8]);
    expect(Object.values(CONTEXT_TIMELINE_REFINEMENT.byBook).reduce((total, book) => total + book.remaining, 0)).toBe(248);
  });
  it("separates Ezekiel's dated messages and retains explicit KJV quantities", () => {
    const get = (id: string) => records.find(r => r.id === id)!;
    const early = get("ezekiel-egypt-tenth");
    const late = get("ezekiel-egypt-twenty-seventh");
    expect(late.start! - early.start!).toBe(17);
    expect(late.end! - early.end!).toBe(17);
    expect(CHAPTER_TIMELINE_MAP.Ezekiel[29].ids).toEqual([early.id, late.id]);
    expect(CHAPTER_TIMELINE_MAP.Ezekiel[30].ids).toEqual(["ezekiel-egypt-lament", "ezekiel-pharaoh-arms"]);
    expect(timelinePlotBounds(get("ezekiel-egypt-lament"))).toBeNull();
    expect(get("ezekiel-pharaoh-arms").start).toBe(early.start! + 1);
    expect(get("ezekiel-fugitive").start).toBe(get("jerusalem-597").start! + 11);
    expect(get("ezekiel-fugitive").note).toContain("rather than changed to an eleventh-year reading");
    expect(get("ezekiel-pharaoh-laments").note).toContain("without repeating a month number");
    expect(get("ezekiel-siege-signs").note).toContain("390 days for Israel and 40 for Judah");
    expect(get("ezekiel-siege-signs").note).toContain("day for a year");
    expect(timelinePlotBounds(get("ezekiel-siege-signs"))).toBeNull();
    expect(get("ezekiel-gog").note).toContain("seven years burning weapons");
    expect(get("ezekiel-gog").note).toContain("seven months burying");
    expect(timelinePlotBounds(get("ezekiel-gog"))).toBeNull();
    expect(CHAPTER_TIMELINE_MAP.Ezekiel[48].ids).toEqual(["ezekiel-temple-vision"]);
  });
  it("distinguishes Jeremiah's reign notices, recollections, and scroll stages", () => {
    const get = (id: string) => records.find(r => r.id === id)!;
    expect(timelinePlotBounds(get("jer-call"))).toEqual([get("royal-josiah").start! + 12, get("royal-josiah").start! + 13]);
    expect(get("jer-scroll-reading").start).toBe(get("jer-jehoiakim-fourth").start! + 1);
    expect(get("jer-scroll-reading").end).toBe(get("jer-jehoiakim-fourth").end! + 1);
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[36].ids).toEqual(["jer-jehoiakim-fourth", "jer-scroll-reading"]);
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[45].ids).toEqual(["jer-jehoiakim-fourth"]);
    expect(get("jer-seraiah").start).toBe(get("jer-hananiah").start);
    expect(get("jer-field").start).toBe(get("jer-hananiah").start! + 6);
    expect(get("jer-hananiah").note).toContain("false prediction");
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[27].ids).toEqual(["jer-yokes"]);
    expect(get("jer-girdle").note).toContain("Euphrates");
    expect(get("jer-potter").note).toContain("not automatically the Pashur son of Melchiah");
    expect(get("jer-egypt-decision").note).toContain("After ten days");
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[49].ids).toContain("jer-elam");
    expect(CHAPTER_TIMELINE_MAP.Jeremiah[52].ids).toContain("jehoiachin-released");
    for (const id of ["jer-warnings", "jer-restoration", "jer-egypt-decision", "jer-babylon-oracles"]) expect(timelinePlotBounds(get(id)), id).toBeNull();
  });
  it("distinguishes Esther's decrees and deliverance without inflating day intervals", () => {
    const get = (id: string) => records.find(r => r.id === id)!;
    expect(get("esther-decree").start).toBe(get("esther-counterdecree").start);
    expect(get("esther-adar").start).toBe(get("esther-decree").start! + 1);
    expect(get("esther-intercedes").kind).toBe("date-window");
    expect(get("esther-intercedes").note).toContain("three-day fast");
    expect(CHAPTER_TIMELINE_MAP.Esther[9].ids).toEqual(["esther-adar", "esther-purim-letters"]);
    expect(get("esther-adar").note).toContain("Shushan's additional Adar 14");
    expect(timelinePlotBounds(get("esther-purim-letters"))).toBeNull();
    expect(timelinePlotBounds(get("esther-gate-plot"))).toBeNull();
    for (const id of ["esther-decree", "esther-counterdecree", "esther-adar", "esther-intercedes"]) {
      expect(get(id).sources).toContain("estherContext");
      expect(get(id).note).toContain("assumes Ahasuerus is Xerxes");
    }
    expect(get("neh-priest-register").note).toContain("Darius the Persian without a number");
    expect(timelinePlotBounds(get("neh-wall-dedication"))).toBeNull();
    expect(get("daniel-tree").note).toContain("Twelve months");
    expect(get("daniel-furnace").note).toContain("Son of God");
    expect(timelinePlotBounds(get("daniel-tree"))).toBeNull();
    expect(CHAPTER_TIMELINE_MAP.Daniel[8].note).toContain("2,300 days");
    expect(CHAPTER_TIMELINE_MAP.Daniel[12].note).toContain("1,290 and 1,335 days");
  });
  it("keeps the refinement's real anchor dates stable across sojourn choices", () => {
    const ids = new Set(["royal-josiah", "zedekiah-appointed", "jerusalem-597", "temple-destroyed", "esther-deliverance", "jer-jehoiakim-fourth", "context-isa", "haggai-messages"]);
    const anchors = records.filter(r => ids.has(r.id));
    const original = structuredClone(anchors);
    const refined = buildRefinedContext(anchors);
    const alternate = buildContextTimeline("promise430");
    expect(refined).toEqual(buildRefinedContext(alternate.filter(r => ids.has(r.id))));
    expect(anchors).toEqual(original);
    expect(refined.every(r => !r.personIds && !r.placement)).toBe(true);
  });
  it("separates Isaiah's dated encounters from undated oracles and relative intervals", () => {
    const get = (id: string) => records.find(r => r.id === id)!;
    expect(timelinePlotBounds(get("passage-isa-6"))).toEqual([-739, -738]);
    expect(get("passage-isa-6").sources).toContain("isaiahContext");
    expect(get("passage-isa-20").start).toBe(-710);
    expect(get("passage-isa-20").kind).toBe("event");
    expect(get("passage-isa-20").end).toBeUndefined();
    expect(get("passage-isa-20").sources).toContain("ashdod");
    expect(get("passage-isa-20").note).toContain("three-year");
    for (const chapter of [7, 8, 14, 16, 21, 23, 44, 45, 53, 61, 64, 65, 66]) {
      expect(timelinePlotBounds(get(`passage-isa-${chapter}`))).toBeNull();
    }
    expect(CHAPTER_TIMELINE_MAP.Isaiah[38].ids).toEqual(["hezekiah-recovery"]);
    expect(CHAPTER_TIMELINE_MAP.Isaiah[39].ids).toEqual(["hezekiah-envoys"]);
    expect(get("passage-isa-53").references).toContain("ACT.8.35");
    expect(get("passage-isa-61").references).toContain("LUK.4.21");
    const selected = selectContextTimeline(records, "Isaiah", 53, "chapter", "biblical");
    expect(selected.records.find(r => r.id === "context-isa")?.emphasized).toBe(false);
    expect(selected.records.find(r => r.id === "passage-isa-53")?.emphasized).toBe(true);
  });
  it("separates Zechariah's calendar headings and leaves later burdens undated", () => {
    const get = (id: string) => records.find(r => r.id === id)!;
    expect(CHAPTER_TIMELINE_MAP.Zechariah[1].ids).toEqual(["zechariah-eighth-month", "zechariah-opening-visions"]);
    expect(get("zechariah-eighth-month").start).toBe(-519);
    expect(get("zechariah-opening-visions").start).toBe(-518);
    for (const chapter of [2, 3, 4, 5]) {
      expect(get(`passage-zec-${chapter}`).start).toBe(-518);
      expect(get(`passage-zec-${chapter}`).sources).toContain("zechariahCalendar");
    }
    expect(CHAPTER_TIMELINE_MAP.Zechariah[6].ids).toEqual(["zechariah-chariots", "zechariah-crowns"]);
    expect(get("zechariah-chariots").start).toBe(-518);
    expect(timelinePlotBounds(get("zechariah-crowns"))).toBeNull();
    expect(get("passage-zec-8").start).toBe(get("zechariah-fasting").start);
    for (let chapter = 9; chapter <= 14; chapter++) expect(timelinePlotBounds(get(`passage-zec-${chapter}`))).toBeNull();
    expect(get("passage-zec-11").note).toContain("three shepherds cut off in one month");
  });
  it("retains minor prophets' identities, relative durations, and later citations", () => {
    const get = (id: string) => records.find(r => r.id === id)!;
    expect(get("passage-amo-7").note).toContain("priest of Bethel, not Judah's king");
    expect(get("passage-amo-1").note).toContain("two years before the earthquake");
    expect(get("passage-jon-1").note).toContain("Three days and three nights");
    expect(get("passage-jon-3").note).toContain("forty-day warning");
    expect(get("passage-jon-3").note).toContain("does not occur");
    expect(get("passage-nam-3").note).toContain("past defeat and Nineveh's announced fate");
    expect(get("passage-mic-3").references).toContain("JER.26.18");
    expect(get("passage-jol-2").references).toContain("ACT.2.16");
    expect(get("passage-amo-9").references).toContain("ACT.15.16");
    for (const id of ["passage-hos-3", "passage-jol-2", "passage-amo-1", "passage-oba-1", "passage-jon-3", "passage-mic-3", "passage-nam-3", "passage-hab-2", "passage-mal-4"]) expect(timelinePlotBounds(get(id))).toBeNull();
    for (let chapter = 1; chapter <= 3; chapter++) expect(timelinePlotBounds(get(`passage-zep-${chapter}`))).toEqual(timelinePlotBounds(get("royal-josiah")));
  });
  it("rejects missing, schematic, duplicate, and reversed chronology anchors", () => {
    const episode = { id: "check", label: "Check", era: "kingdom" as const, references: ["2SA.5.4"], note: "Check", at: ["missing"] as [string] };
    expect(() => buildAnchoredContext([episode], buildBibleTimeline())).toThrow("Missing chronology anchor");
    expect(() => buildAnchoredContext([{ ...episode, at: ["nathan_676"] }], buildBibleTimeline())).toThrow("Missing chronology anchor");
    expect(() => buildAnchoredContext([{ ...episode, id: "david_593" }], buildBibleTimeline())).toThrow("Duplicate chronology ID");
    expect(() => buildAnchoredContext([{ ...episode, at: -900, until: -950 }], [])).toThrow("Reversed chronology interval");
  });

});
