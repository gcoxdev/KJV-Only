import { buildBibleTimeline, type SojournModel } from "./bible-timeline";
import { buildContextTimeline, selectContextTimeline, type ContextTimelineRecord, type TimelineFilter, type TimelineScope } from "./contextual-timeline";
import { timelineRelatedTools } from "./timeline-related-tools";
import { canonicalTimelineId, canonicalTimelinePersonId, TIMELINE_ID_ALIASES } from "../lib/timeline-identities";
import { buildLineageTimeline, timelineEntryCategory, timelinePlotBounds, type TimelinePersonAssociation, type TimelineRecord } from "../lib/bible-timeline";
import type { GenealogyPerson } from "../types/reader";

// Reviewed direct links identify actors/speakers, not people inside a parable.
// Every other navigation link remains contextual unless explicitly reviewed here.
const PARTICIPANT_ENTRIES = new Set(`flood abram-canaan joseph-sold joseph-appointed egypt-entry exodus jordan caleb-hebron temple temple-complete jerusalem-597 return-decree temple-foundation temple-work-resumed jesus-birth jesus-age-twelve gospel-presentation jesus-baptism resurrection paul-conversion paul-antioch paul-pisidia paul-philippi paul-athens paul-corinth paul-gallio paul-voyage paul-rome gospel-storm gospel-lost-found gospel-offences gospel-matthew-lost-sheep gospel-brother-trespass gospel-vineyard-labourers gospel-watchfulness gospel-rich-fool gospel-ready-servants gospel-division-discernment gospel-luke-mustard-leaven gospel-lowest-room gospel-great-supper gospel-cost-discipleship gospel-lost-coin gospel-lost-son gospel-forgiveness-faith gospel-persistent-widow gospel-pharisee-publican gospel-supper-greatness ot-eden jer-restoration`.split(" "));
const SUBJECT_ENTRIES = new Set(`nebuchadnezzar-reign cyrus-reign darius-reign augustus-reign tiberius-reign shalmaneser-reign sennacherib-reign tiglath-reign artaxerxes-reign claudius-reign agrippa-i-reign pilate-prefecture esarhaddon-reign`.split(" "));

export type TimelineCatalog = {
  records: ContextTimelineRecord[];
  byId: ReadonlyMap<string, ContextTimelineRecord>;
  genealogyRecords: ContextTimelineRecord[];
  historicalRecords: ContextTimelineRecord[];
};

/** Resolve both projections into one record per identity, without modifying source modules. */
export function buildTimelineCatalog(model: SojournModel = "egypt430"): TimelineCatalog {
  const core = buildBibleTimeline(model);
  const history = buildContextTimeline(model);
  const rows = new Map<string, ContextTimelineRecord>(core.map(record => [record.id, { ...record, track: "biblical" }]));
  for (const record of history) {
    const id = canonicalTimelineId(record.id);
    const previous = rows.get(id);
    rows.set(id, { ...previous, ...record, id,
      ...(id !== record.id ? { aliases: [record.id], kind: "period", activityType: "reign", personIds: previous?.personIds,
        note: [...new Set([record.note, previous?.note].filter(Boolean))].join("\n\n") } : {}),
      references: [...new Set([...(previous?.references ?? []), ...record.references])],
      sources: [...new Set([...(previous?.sources ?? []), ...record.sources])],
    });
  }
  for (const record of rows.values()) {
    const links = timelineRelatedTools(record).filter(link => link.request.kind === "genealogy");
    const associations: TimelinePersonAssociation[] = (record.personIds ?? []).map(personId => ({ personId, role: "subject", reference: record.references[0] ?? "" }));
    for (const link of links) {
      if (link.request.kind !== "genealogy") continue;
      const personId = link.request.personId;
      const role = !link.association && SUBJECT_ENTRIES.has(record.id) ? "subject" :
        !link.association && PARTICIPANT_ENTRIES.has(record.id) ? "participant" : "context";
      if (!associations.some(association => association.personId === personId)) associations.push({ personId, role, reference: link.reference, evidence: link.evidence });
    }
    // This curated collection describes Paul's travel, testimony, letters and plans.
    // Promote Paul only; people recalled in his speeches remain contextual.
    if (record.narrative?.collection === "paul") {
      const existing = associations.find(link => link.personId === "saul_2959");
      const participant: TimelinePersonAssociation = { personId: "saul_2959", role: "participant", reference: existing?.reference ?? record.narrative.passages[0].reference,
        evidence: "Paul is the traveller, speaker, or author in this mission episode. The entry distinguishes completed events from recollections and unfulfilled plans." };
      if (existing) Object.assign(existing, participant); else associations.push(participant);
    }
    record.personAssociations = associations;
    const subjects = associations.filter(link => link.role === "subject").map(link => link.personId);
    if (subjects.length) record.personIds = subjects;
    if (SUBJECT_ENTRIES.has(record.id) && record.id.endsWith("-reign") && record.kind === "period") record.activityType = "reign";
  }
  const records = [...rows.values()];
  // Alias lookup preserves incoming selections; the record list contains no duplicates.
  const byId = new Map(rows);
  for (const [alias, id] of Object.entries(TIMELINE_ID_ALIASES)) byId.set(alias, rows.get(id)!);
  return { records, byId,
    genealogyRecords: core.map(record => rows.get(record.id)!),
    historicalRecords: history.map(record => rows.get(canonicalTimelineId(record.id))!),
  };
}

const catalogs = new Map<SojournModel, TimelineCatalog>();
export function getTimelineCatalog(model: SojournModel = "egypt430") {
  let catalog = catalogs.get(model);
  if (!catalog) { catalog = buildTimelineCatalog(model); catalogs.set(model, catalog); }
  return catalog;
}

export function matchingTimelinePeople(record: TimelineRecord, ids: ReadonlySet<string>, includeContext = false) {
  const links: TimelinePersonAssociation[] = record.personAssociations ?? (record.personIds ?? []).map(personId => ({ personId, role: "subject", reference: record.references[0] ?? "" }));
  const canonicalIds = new Set([...ids].map(canonicalTimelinePersonId));
  return links.filter(link => canonicalIds.has(canonicalTimelinePersonId(link.personId)) && (includeContext || link.role !== "context"));
}

export function relatedTimelineEntries(catalog: TimelineCatalog, people: GenealogyPerson[], lineage = false, includeContext = false): TimelineRecord[] {
  const ids = new Set(people.map(person => person.id));
  const subjects = catalog.records.filter(record => record.personIds?.some(id => ids.has(id)));
  const personRows = lineage ? buildLineageTimeline(people, subjects) : [...subjects];
  if (!lineage) for (const person of people) {
    if (!personRows.some(record => record.personIds?.includes(person.id))) personRows.push({
      id: `undated-${person.id}`, label: person.names[0], personIds: [person.id], kind: "life", era: "beginnings",
      references: person.verses?.first ? [person.verses.first] : [], sources: [],
      personAssociations: [{ personId: person.id, role: "subject", reference: person.verses?.first ?? "" }],
      note: "This person has no reviewed timeline dates. The reference identifies the person; it does not supply a lifespan or calendar position.",
    });
  }
  const represented = new Set(personRows.map(record => record.id));
  const events = catalog.records.filter(record => !represented.has(record.id) && timelineEntryCategory(record) === "events" && matchingTimelinePeople(record, ids, includeContext).length);
  return [...personRows, ...events];
}

/** Add people relevant to the unfiltered view, then apply the user's search. */
export function selectCatalogHistory(catalog: TimelineCatalog, book: string, chapter: number, scope: TimelineScope, filter: TimelineFilter, query = "", phase = "all", showPeople = false) {
  const selection = selectContextTimeline(catalog.historicalRecords, book, chapter, scope, filter, query, phase);
  if (!showPeople || filter === "historical") return selection;
  const context = selectContextTimeline(catalog.historicalRecords, book, chapter, scope, "all", "", phase);
  const ids = new Set(context.records.flatMap(record => (record.personAssociations ?? []).filter(link => link.role !== "context").map(link => link.personId)));
  const bounds = context.records.filter(record => record.emphasized).flatMap(record => { const bounds = timelinePlotBounds(record); return bounds ? [bounds] : []; });
  const historicalIds = new Set(catalog.historicalRecords.map(record => record.id));
  const text = query.trim().toLowerCase();
  const added = catalog.genealogyRecords.filter(record => {
    if (historicalIds.has(record.id)) return false;
    if (text && !`${record.label} ${record.note} ${record.references.join(" ")}`.toLowerCase().includes(text)) return false;
    const span = timelinePlotBounds(record);
    return scope === "world" || record.personIds?.some(id => ids.has(id)) ||
      (span && bounds.some(([start, end]) => span[0] <= end && span[1] >= start));
  }).map(record => ({ ...record, emphasized: false,
    relevance: "Person linked to this view or whose lifespan/activity overlaps its calendar window. Overlap does not establish personal contact or participation in every event.",
  }));
  const records = [...selection.records, ...added];
  // Keep a harmony or mission's curated reading order, including undated entries.
  if (scope !== "gospels" && scope !== "paul") records.sort((a, b) => (timelinePlotBounds(a)?.[0] ?? Infinity) - (timelinePlotBounds(b)?.[0] ?? Infinity));
  return { ...selection, records };
}
