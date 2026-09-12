import { ROMAN_CONTEXT_RECORDS, ROMAN_CONTEXT_SOURCES } from "./contextual-timeline-roman";
import { POETRY_REFINEMENT_SOURCES } from "./contextual-timeline-poetry";
import { PROPHET_REFINEMENT_SOURCES } from "./contextual-timeline-prophets";
import { buildRefinedContext, REFINED_CHAPTER_TIMELINE_MAP } from "./contextual-timeline-refinements";
import { BROAD_CHAPTER_TIMELINE_MAP, BROAD_HISTORICAL_RECORDS, BROAD_TIMELINE_SOURCES, buildBroadContext } from "./contextual-timeline-coverage";
import { buildChroniclesContext, CHRONICLES_CHAPTER_TIMELINE_MAP, withChroniclesParallels } from "./contextual-timeline-chronicles";
import { buildKingsContext, KINGS_CHAPTER_TIMELINE_MAP, KINGS_HISTORICAL_RECORDS, KINGS_TIMELINE_SOURCES } from "./contextual-timeline-kings";
import { buildOldTestamentContext, OT_CHAPTER_TIMELINE_MAP } from "./contextual-timeline-ot";
import { WRITING_CHAPTER_TIMELINE_MAP, WRITING_TIMELINE_RECORDS, WRITING_TIMELINE_SOURCES } from "./contextual-timeline-writings";
import { NT_CHAPTER_TIMELINE_MAP, NT_NARRATIVE_DETAILS, NT_TIMELINE_RECORDS, type NarrativeDetails } from "./contextual-timeline-nt";
import { EXPANDED_CHAPTER_TIMELINE_MAP, EXPANDED_TIMELINE_RECORDS, EXPANDED_TIMELINE_SOURCES } from "./contextual-timeline-expansion";
import { buildBibleTimeline, TIMELINE_SOURCES, type SojournModel } from "./bible-timeline";
import { timelinePlotBounds, type TimelineRecord } from "../lib/bible-timeline";

export type ContextTimelineRecord = TimelineRecord & { track: "biblical" | "historical"; emphasized?: boolean; relevance?: string; narrative?: NarrativeDetails };
export type TimelineScope = "chapter" | "book" | "world" | "gospels" | "paul";
export type TimelineFilter = "all" | "biblical" | "historical";

export const CONTEXT_TIMELINE_SOURCES: Record<string, { title: string; url: string; use: string }> = {
  ...TIMELINE_SOURCES,
  ...EXPANDED_TIMELINE_SOURCES,
  ...WRITING_TIMELINE_SOURCES,
  ...KINGS_TIMELINE_SOURCES,
  ...BROAD_TIMELINE_SOURCES,
  ...PROPHET_REFINEMENT_SOURCES,
  ...POETRY_REFINEMENT_SOURCES,
  ...ROMAN_CONTEXT_SOURCES,
  nt: { ...TIMELINE_SOURCES.nt, use: "Calendar proposals for Jesus, Paul, and the apostolic period. KJV passage details and relative order control the reconstruction." },
  cyrus: { ...TIMELINE_SOURCES.cyrus, use: "Reign from accession in Anshan, c. 559–530 BC; conquest of Babylon in 539 BC. Ezra supplies the return decree; the external chronology does not override that account." },
  nebuchadnezzar: { title: "Livius: Nebuchadnezzar II", url: "https://www.livius.org/articles/person/nebuchadnezzar-ii/", use: "Conventional reign, 605–562 BC; not birth and death dates." },
  darius: { title: "Livius: Darius the Great", url: "https://www.livius.org/articles/person/darius-the-great/", use: "Reign of Darius I, 522–486 BC; distinct from Darius the Mede." },
  augustus: { title: "Livius: Augustus", url: "https://www.livius.org/articles/person/augustus/", use: "Imperial reign, 27 BC–AD 14." },
  tiberius: { title: "Livius: Tiberius", url: "https://www.livius.org/articles/person/tiberius/", use: "Reign, AD 14–37. Luke's fifteenth-year reckoning is discussed separately." },
  socrates: { title: "Stanford Encyclopedia of Philosophy: Socrates", url: "https://plato.stanford.edu/entries/socrates/", use: "Life and historical evidence, c. 469–399 BC." },
  plato: { title: "Stanford Encyclopedia of Philosophy: Plato", url: "https://plato.stanford.edu/entries/plato/", use: "Life, c. 429–347 BC; the birth year is uncertain." },
  aristotle: { title: "Stanford Encyclopedia of Philosophy: Aristotle", url: "https://plato.stanford.edu/entries/aristotle/", use: "Life, 384–322 BC, and association with Plato's Academy." },
};

const historical = (id: string, label: string, start: number, end: number, kind: "life" | "period", source: string, note: string): ContextTimelineRecord => ({
  id, label, start, end, kind, track: "historical", era: "history", references: [], sources: [source], note,
  startStatus: "approximate", endStatus: "approximate",
});

const HISTORICAL_RECORDS = [
  historical("nebuchadnezzar-reign", "Nebuchadnezzar II · reign", -604, -561, "period", "nebuchadnezzar", "Babylonian king during Judah's deportations. This bar shows his reign, not his lifespan."),
  historical("cyrus-reign", "Cyrus the Great · reign", -558, -529, "period", "cyrus", "Reign begins with his accession in Anshan, before his conquest of Babylon in 539 BC. Ezra's first-year setting concerns his rule over Babylon, not the beginning of this entire reign."),
  historical("darius-reign", "Darius I · reign", -521, -485, "period", "darius", "Persian king conventionally identified with the Darius of Ezra 5–6. He is not identified here with Darius the Mede in Daniel."),
  historical("augustus-reign", "Augustus · reign", -26, 14, "period", "augustus", "The emperor named in Luke 2:1. His reign provides political context but does not resolve the debated Cyrenius census chronology."),
  historical("tiberius-reign", "Tiberius · reign", 14, 37, "period", "tiberius", "The emperor named in Luke 3:1. Counting his fifteenth year depends on the calendar and accession assumptions; see John's ministry entry."),
  historical("socrates", "Socrates", -468, -398, "life", "socrates", "Athenian philosopher known through accounts including Plato and Xenophon. A familiar contemporary of the later Persian period; overlap does not imply contact with biblical people."),
  historical("plato", "Plato", -428, -346, "life", "plato", "Greek philosopher associated with Socrates and the Academy. Uses the source's uncertain c. 429 BC birth; other reconstructions differ by a few years."),
  historical("aristotle", "Aristotle", -383, -321, "life", "aristotle", "Greek philosopher who studied in Plato's Academy. His life helps locate the Greek intellectual world before and during Alexander's conquests."),
];

function biblical(id: string, label: string, start: number | undefined, end: number | undefined, kind: TimelineRecord["kind"], references: string[], note: string, sources = ["ot"]): ContextTimelineRecord {
  return { id, label, start, end, kind, references, note, sources, era: "exile", track: "biblical", startStatus: "approximate", endStatus: "approximate" };
}

const PILOT_RECORDS = [
  biblical("temple-foundation", "Foundation of the second temple", -536, -535, "date-window", ["EZR.3.8", "EZR.3.10"], "Second year after arrival. A provisional c. 537–536 BC window follows the return chronology; the text does not provide a BC date."),
  biblical("temple-work-resumed", "Temple work resumes", -519, undefined, "event", ["EZR.4.24", "EZR.5.1", "EZR.5.2", "HAG.1.1", "HAG.1.14", "HAG.1.15"], "Darius's second year, conventionally c. 520 BC. Haggai supplies the regnal-year and month sequence.", ["ot", "darius"]),
  biblical("ezra-later-letters", "Opposition under later Persian kings", undefined, undefined, "period", ["EZR.4.6", "EZR.4.7", "EZR.4.23"], "Ezra 4 inserts opposition under Ahasuerus and Artaxerxes before returning to Darius in verse 24. These later letters are not dated to the temple-foundation episode. No precise placement assigned in this initial dataset."),
  biblical("jehoiachin-released", "Jehoiachin released from prison", -561, -560, "date-window", ["2KI.25.27", "2KI.25.28", "JER.52.31"], "Thirty-seventh year of his captivity, in Evilmerodach's accession year. Conventional c. 562–561 BC window allows regnal/calendar boundaries; calculated relative to the 597 BC deportation.", ["ot", "jerusalem"]),
  { ...biblical("jesus-age-twelve", "Jesus at the temple, aged twelve", 7, 9, "date-window", ["LUK.2.42", "LUK.2.46", "LUK.2.49"], "Adds the KJV age of twelve to the provisional 6–4 BC birth window, allowing for no year zero in BC/AD notation. This is an approximate event date, not a three-year visit.", ["nt"]), era: "gospels" as const },
  { ...biblical("jesus-baptism", "Baptism of Jesus", 27, 29, "date-window", ["LUK.3.21", "LUK.3.22", "LUK.3.23"], "Placed with John's ministry and Jesus being about thirty. c. AD 27–29 follows the shared provisional Gospel chronology, not an exact date supplied by Luke.", ["nt"]), era: "gospels" as const },
];

export type ChapterMapping = { ids: string[]; contextIds?: string[]; references?: string[]; note: string };
const INITIAL_CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = {
  "2 Kings": {
    24: { ids: ["jerusalem-597"], contextIds: ["nebuchadnezzar-reign"], note: "Jehoiakim's service and revolt precede the 597 BC capture under Jehoiachin. Zedekiah's installation follows that capture." },
    25: { ids: ["temple-destroyed", "jehoiachin-released"], contextIds: ["nebuchadnezzar-reign"], note: "The destruction and Jehoiachin's later release are separate episodes, decades apart." },
  },
  Ezra: {
    1: { ids: ["return-decree"], contextIds: ["babylon-falls", "cyrus-reign"], note: "Cyrus's first year over Babylon is the conventional setting. The earlier Persian conquest is background; it does not independently establish the decree's content." },
    2: { ids: ["return-decree"], note: "The returnee list belongs to the opening return narrative. The decree is a contextual anchor, not a date for every named person's arrival or birth." },
    3: { ids: ["temple-foundation"], contextIds: ["return-decree"], note: "The seventh-month worship and second-year foundation are successive events. The window shown dates the foundation, not the whole chapter." },
    4: { ids: ["temple-foundation", "ezra-later-letters", "temple-work-resumed"], note: "This chapter surveys opposition across several reigns, then resumes the temple narrative. Its later letters remain listed without a fabricated calendar position." },
    5: { ids: ["temple-work-resumed"], contextIds: ["darius-reign"], note: "Work resumes under Haggai and Zechariah. The correspondence is part of this episode, without a separately asserted date." },
    6: { ids: ["second-temple"], contextIds: ["darius-reign", "return-decree"], note: "Completion in Darius's sixth year is the main dated event. The chapter also quotes the earlier decree of Cyrus; these are not simultaneous." },
  },
  Luke: {
    2: { ids: ["jesus-birth", "jesus-age-twelve"], contextIds: ["augustus-reign"], note: "The chapter spans Jesus's birth through age twelve. Herod/Cyrenius dating questions remain unresolved; the two windows are approximate." },
    3: { ids: ["john-ministry", "jesus-baptism"], contextIds: ["tiberius-reign"], note: "The dated focus is John's ministry and Jesus's baptism. Verses 23–38 recall earlier ancestors; their lives are not dated to this ministry window. Use Genealogy for the full lineage." },
  },
};

export const CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = {};
for (const source of [INITIAL_CHAPTER_TIMELINE_MAP, EXPANDED_CHAPTER_TIMELINE_MAP, NT_CHAPTER_TIMELINE_MAP, WRITING_CHAPTER_TIMELINE_MAP, OT_CHAPTER_TIMELINE_MAP, KINGS_CHAPTER_TIMELINE_MAP, CHRONICLES_CHAPTER_TIMELINE_MAP]) {
  for (const [book, chapters] of Object.entries(source)) {
    const target = CHAPTER_TIMELINE_MAP[book] ??= {};
    for (const [chapter, mapping] of Object.entries(chapters)) {
      const previous = target[Number(chapter)];
      target[Number(chapter)] = previous ? {
        ids: [...new Set([...previous.ids, ...mapping.ids])],
        contextIds: [...new Set([...(previous.contextIds ?? []), ...(mapping.contextIds ?? [])])],
        references: [...new Set([...(previous.references ?? []), ...(mapping.references ?? [])])],
        note: previous.note === mapping.note ? mapping.note : `${previous.note} ${mapping.note}`,
      } : mapping;
    }
  }
}
// Track refinement of the original broad pass separately from chapter coverage.
// A refined chapter has reviewed passage evidence and episode/setting distinctions;
// this does not claim exhaustive dating or completion of every interpretive issue.
export const CONTEXT_TIMELINE_REFINEMENT = {
  baseline: 0, refined: 0, remaining: 0,
  byBook: {} as Record<string, { baseline: number; refined: number; remaining: number }>,
};
// Broad coverage fills gaps; existing episode-level mappings retain precedence.
for (const [book, chapters] of Object.entries(BROAD_CHAPTER_TIMELINE_MAP)) {
  const target = CHAPTER_TIMELINE_MAP[book] ??= {};
  for (const [chapter, mapping] of Object.entries(chapters)) {
    if (target[Number(chapter)]) continue;
    const refinement = REFINED_CHAPTER_TIMELINE_MAP[book]?.[Number(chapter)];
    target[Number(chapter)] = refinement ?? mapping;
    const progress = CONTEXT_TIMELINE_REFINEMENT.byBook[book] ??= { baseline: 0, refined: 0, remaining: 0 };
    progress.baseline++;
    CONTEXT_TIMELINE_REFINEMENT.baseline++;
    if (refinement) { progress.refined++; CONTEXT_TIMELINE_REFINEMENT.refined++; }
    else { progress.remaining++; CONTEXT_TIMELINE_REFINEMENT.remaining++; }
  }
}

export const CONTEXT_TIMELINE_COVERAGE = {
  chapters: Object.values(CHAPTER_TIMELINE_MAP).reduce((sum, chapters) => sum + Object.keys(chapters).length, 0),
  books: Object.keys(CHAPTER_TIMELINE_MAP),
};

export function buildContextTimeline(model: SojournModel = "egypt430"): ContextTimelineRecord[] {
  // Reuse the reviewed event chronology, not schematic genealogy placements.
  const chronology = buildBibleTimeline(model);
  const kings = buildKingsContext(chronology);
  const chronicles = buildChroniclesContext([...chronology, ...kings]);
  const broad = buildBroadContext([...chronology, ...kings, ...EXPANDED_TIMELINE_RECORDS, ...HISTORICAL_RECORDS]);
  const refined = buildRefinedContext([...chronology, ...kings, ...EXPANDED_TIMELINE_RECORDS, ...HISTORICAL_RECORDS, ...broad]);
  const shared = chronology.filter(record => !record.placement && record.kind !== "life" && record.kind !== "activity")
    .map(record => ({ ...record, sources: [...record.sources, ...(["samaria", "sennacherib"].includes(record.id) ? ["assyria"] : record.id === "wall" ? ["artaxerxes"] : [])], track: ["alexander", "antiochus", "herod"].includes(record.id) ? "historical" : "biblical" } as ContextTimelineRecord));
  return [...shared, ...PILOT_RECORDS, ...HISTORICAL_RECORDS, ...ROMAN_CONTEXT_RECORDS, ...EXPANDED_TIMELINE_RECORDS, ...NT_TIMELINE_RECORDS, ...WRITING_TIMELINE_RECORDS, ...buildOldTestamentContext(chronology), ...kings, ...chronicles, ...KINGS_HISTORICAL_RECORDS, ...broad, ...BROAD_HISTORICAL_RECORDS, ...refined].map(withChroniclesParallels).map(record => {
    const narrative = NT_NARRATIVE_DETAILS[record.id];
    return narrative ? { ...record, narrative, references: [...new Set([...record.references, ...narrative.passages.map(passage => passage.reference)])] } : record;
  });
}

export function selectContextTimeline(records: ContextTimelineRecord[], book: string, chapter: number, scope: TimelineScope, filter: TimelineFilter, query = "", phase = "all") {
  const mapping = CHAPTER_TIMELINE_MAP[book]?.[chapter];
  const mappings = scope === "book" ? Object.values(CHAPTER_TIMELINE_MAP[book] ?? {}) : mapping ? [mapping] : [];
  const collection = scope === "gospels" || scope === "paul" ? scope : undefined;
  const collectionRecords = collection ? records.filter(record => record.narrative?.collection === collection && (phase === "all" || record.narrative.phase === phase)) : [];
  const focusIds = new Set(collection ? collectionRecords.map(record => record.id) : mappings.flatMap(item => item.ids));
  const contextIds = new Set(collection ? [] : mappings.flatMap(item => item.contextIds ?? []));
  const windows = records.filter(record => focusIds.has(record.id)).flatMap(record => {
    const bounds = timelinePlotBounds(record);
    return bounds ? [bounds] : [];
  });
  const overview = scope === "world" || (!collection && !mappings.length);
  const text = query.trim().toLowerCase();
  const passageReferences = !collection && !overview ? mappings.flatMap(item => item.references ?? []) : [];
  const passageNotes = !collection && !overview ? mappings.map(item => item.note).join(" ") : "";
  const visible = records.filter(record => {
    if (filter !== "all" && record.track !== filter) return false;
    if (text && !`${record.label} ${record.note} ${record.references.join(" ")} ${focusIds.has(record.id) ? passageNotes : ""} ${focusIds.has(record.id) ? passageReferences.join(" ") : ""} ${record.narrative?.phase ?? ""} ${record.narrative?.passages.map(passage => passage.label).join(" ") ?? ""}`.toLowerCase().includes(text)) return false;
    if (overview || focusIds.has(record.id) || contextIds.has(record.id)) return true;
    const bounds = timelinePlotBounds(record);
    // Familiar contemporaries are context, never evidence of a meeting or influence.
    return record.track === "historical" && bounds && windows.some(([start, end]) => bounds[0] <= end && bounds[1] >= start);
  }).map(record => ({ ...record, references: focusIds.has(record.id) && passageReferences.length ? [...new Set([...passageReferences, ...record.references])] : record.references, emphasized: !overview && focusIds.has(record.id), relevance: overview ? "Broader historical overview; no chapter-specific association implied." :
    focusIds.has(record.id) ? (collection ? "Part of this collection’s reading sequence. Consult the passage links and date explanation; the order is not a claim of exact calendar placement." : scope === "book" ? "Part of this book's reviewed context. Consult the entry to distinguish a narrative event from a letter or vision setting." : mapping!.note) :
    contextIds.has(record.id) ? "Background or an earlier event mentioned in this passage. See the entry's sources and date explanation." : "A historical contemporary whose dates overlap a reviewed episode’s window. This does not establish personal contact or influence." }))
    .sort((a, b) => collection
      ? Number(b.emphasized) - Number(a.emphasized) || (a.narrative?.order ?? Infinity) - (b.narrative?.order ?? Infinity) || (timelinePlotBounds(a)?.[0] ?? Infinity) - (timelinePlotBounds(b)?.[0] ?? Infinity)
      : (timelinePlotBounds(a)?.[0] ?? Infinity) - (timelinePlotBounds(b)?.[0] ?? Infinity));
  return { records: visible, mapped: !!collection || mappings.length > 0, note: collection === "gospels" ? "Gospel harmony · a provisional reading sequence with parallel passages and distinct accounts. Broad windows indicate uncertain dates, not long events. Undated introductions and genealogies remain in the list." :
    collection === "paul" ? "Paul’s missions · recorded routes in narrative order, with uncertain calendar windows. Later letters and travel plans remain separate and unplaced; Spain is an intention, not a confirmed journey." :
    scope === "world" ? "Selected biblical events and historical figures within the ancient biblical and authorship eras." :
    !mappings.length ? "Chapter-specific context is not yet available here. Showing the broader overview; this is not a date assigned to the passage." :
    scope === "book" ? "Reviewed context in this book. Entries distinguish narrated events from proposed letter or vision settings; this is not an exhaustive chronology of every verse." : mapping!.note };
}
