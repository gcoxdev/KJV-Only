import type { GenealogyPerson } from "../types/reader";

export type TimelineEra = "beginnings" | "patriarchs" | "exodus" | "kingdom" | "exile" | "gospels";
export type JesusLineageBranch = "mary" | "joseph";
export type TimelineContent = "all" | "people" | "events";
export type EndpointStatus = "derived" | "approximate" | "unknown";
export type TimelineRecord = {
  id: string;
  label: string;
  era: TimelineEra;
  kind: "life" | "activity" | "event" | "period" | "date-window";
  personIds?: string[];
  /** Astronomical years: 0 = 1 BC. Activity dates are not lifespan endpoints. */
  start?: number;
  end?: number;
  startStatus?: EndpointStatus;
  endStatus?: EndpointStatus;
  startLabel?: string;
  endLabel?: string;
  age?: number;
  references: string[];
  sources: string[];
  note: string;
  /** Relative position calculated from Genesis, before a BC anchor is applied. */
  adamYear?: number;
  /** A conjectural chart position, kept separate from birth/death evidence. */
  placement?: {
    year: number;
    method: "context" | "interpolated" | "generation";
    explanation: string;
    anchorIds: string[];
  };
};

export const TIMELINE_ERAS: Record<TimelineEra, string> = {
  beginnings: "Adam to the patriarchs", patriarchs: "Abraham to Egypt",
  exodus: "Exodus and Judges", kingdom: "Kings and prophets",
  exile: "Exile and return", gospels: "Toward Jesus",
};

export function timelineEntryCategory(record: TimelineRecord): Exclude<TimelineContent, "all"> {
  return record.kind === "life" || record.kind === "activity" ||
    (record.kind === "period" && !!record.personIds?.length) ? "people" : "events";
}

/** Follow the selected saved branch; do not infer parents from matching names. */
export function jesusLineage(people: ReadonlyMap<string, GenealogyPerson>, branch: JesusLineageBranch, preferredId?: string) {
  const jesusIds = ["jesus_christ_2683", "jesus_christ_2684"];
  const root = preferredId && jesusIds.includes(preferredId) ? people.get(preferredId) :
    jesusIds.map(id => people.get(id)).find(Boolean);
  const members: GenealogyPerson[] = [];
  const seen = new Set<string>();
  let current = root;
  let complete = false;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    members.push(current);
    // This is a people timeline; Luke's final reference to God is not a lifespan.
    if (current.id === "adam_2") { complete = true; break; }
    const parent = current === root ? (branch === "mary" ? current.mother : current.father) : current.father;
    current = parent?.id ? people.get(parent.id) : undefined;
  }
  return { members, complete };
}

/** One row per ancestor, oldest first. Estimates never become lifespan endpoints. */
export function buildLineageTimeline(members: GenealogyPerson[], records: TimelineRecord[]): TimelineRecord[] {
  const byPerson = new Map<string, TimelineRecord>();
  for (const record of records) for (const id of record.personIds ?? []) {
    if (!byPerson.has(id) || (!timelinePlotBounds(byPerson.get(id)!) && timelinePlotBounds(record))) byPerson.set(id, record);
  }
  const rows: TimelineRecord[] = [...members].reverse().map(person => byPerson.get(person.id) ?? {
    id: `undated-${person.id}`, label: person.names[0], personIds: [person.id], kind: "life", era: "beginnings",
    references: person.verses?.first ? [person.verses.first] : [], sources: [],
    note: "The cited passage identifies this ancestor but does not supply a birth or death year.",
  } satisfies TimelineRecord);
  // Only original dated/context records anchor interpolation. Never chain newly
  // interpolated guesses or recalculate them from the current text filter.
  const anchors = rows.flatMap((record, index) => {
    const year = record.start ?? record.end ?? record.placement?.year;
    return year === undefined ? [] : [{ record, index, year }];
  });
  const describe = (anchor: typeof anchors[number]) => `${anchor.record.label} (${formatTimelineYear(anchor.year)}; ${anchor.record.placement ? "context estimate" : anchor.record.kind === "activity" ? "recorded activity" : anchor.record.start === undefined ? "known endpoint" : "birth anchor"})`;
  const reversedAnchors = [...anchors].reverse();
  return rows.map((record, index) => {
    if (timelinePlotBounds(record)) return record;
    const left = reversedAnchors.find(anchor => anchor.index < index);
    const right = anchors.find(anchor => anchor.index > index);
    if (!left && !right) return record;
    let year: number;
    let explanation: string;
    let method: "interpolated" | "generation";
    if (left && right) {
      const steps = right.index - left.index;
      const years = right.year - left.year;
      // Keep contradictory anchors visible instead of reversing the pedigree.
      if (years < 0) return { ...record, note: `${record.note} The neighboring dated anchors run against lineage order; no estimate is assigned.` };
      year = left.year + years * (index - left.index) / steps;
      method = "interpolated";
      explanation = `Even spacing between ${describe(left)} and ${describe(right)}: ${years} years across ${steps} listed links, approximately ${(years / steps).toFixed(1)} years per link; position ${index - left.index} of ${steps} after the earlier anchor. These are chart positions, not measured parenthood ages. Birth and activity anchors describe different moments in a life; compressed pedigrees and chronological tensions limit this estimate.`;
      if (years / steps > 40) explanation += " A fixed 20-year generation would not span these anchors; the larger spacing is a schematic allocation of the gap, not evidence for unusually late parenthood.";
    } else {
      const anchor = (left ?? right)!;
      year = anchor.year + (index - anchor.index) * 20;
      method = "generation";
      explanation = `Only one dated anchor is available: ${describe(anchor)}. Assumes 20 years per listed link, ${Math.abs(index - anchor.index)} links ${left ? "after" : "before"} that anchor. This is a fallback assumption, not a biblical or historical parenthood age.`;
    }
    // Round conjectures to five calendar years, without moving past an anchor.
    const rounded = year <= 0 ? 1 - Math.round((1 - year) / 5) * 5 : Math.round(year / 5) * 5;
    year = Math.min(right?.year ?? Infinity, Math.max(left?.year ?? -Infinity, rounded));
    const used = [left, right].filter(anchor => anchor !== undefined);
    if (record.personIds?.includes("cainan_2923")) explanation += " Luke 3:35–36 names Cainan, while Genesis 11:12–13 gives Arphaxad's 35-year interval to Salah without naming him. This midpoint only displays Luke's ancestor; it does not resolve that textual question or add years to Genesis.";
    return {
      ...record, era: left?.record.era ?? right!.record.era,
      placement: { year, method, explanation, anchorIds: used.map(anchor => anchor.record.id) },
      references: [...new Set([...record.references, ...used.flatMap(anchor => anchor.record.references)])],
      sources: [...new Set([...record.sources, ...used.flatMap(anchor => anchor.record.sources)])],
    };
  });
}

export function formatTimelineYear(year: number) {
  return year <= 0 ? `${1 - year} BC` : `AD ${year}`;
}

/** Avoid Date's 1900 offset for 0–99 and browser-dependent parsing of BC years. */
export function timelineDate(year: number) {
  const date = new Date(0);
  date.setUTCFullYear(year, 0, 1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function timelineDateSummary(record: TimelineRecord) {
  const start = record.start === undefined ? "Unknown" : `c. ${formatTimelineYear(record.start)}`;
  const end = record.end === undefined ? "Unknown" : `c. ${formatTimelineYear(record.end)}`;
  if (record.kind === "life" || record.startLabel === "Birth") {
    return `${record.placement ? `Estimated placement: c. ${formatTimelineYear(record.placement.year)} · ` : ""}Birth: ${start} · ${record.endLabel ?? "Death"}: ${end}${record.age === undefined ? "" : ` · ${record.age} years (KJV)`}`;
  }
  if (record.start === undefined) return "Dates unknown";
  return `${record.kind === "date-window" ? "Possible event date: " : record.kind === "activity" ? "Recorded activity: " : ""}${start}${record.end === undefined || record.end === record.start ? "" : ` – ${end}`}`;
}

/** Use reviewed person identities and explicit life endpoints, never activity dates. */
export function indexTimelinePersonDates(records: TimelineRecord[]) {
  const dates = new Map<string, TimelineRecord>();
  for (const record of records) {
    if (record.kind !== "life" && record.startLabel !== "Birth") continue;
    if (record.start === undefined && record.end === undefined) continue;
    for (const id of record.personIds ?? []) dates.set(id, record);
  }
  return dates;
}

export function timelineKindLabel(record: TimelineRecord) {
  if (record.placement) return "Estimated placement";
  return { life: "Lifespan evidence", activity: "Recorded activity", event: "Single-date event", period: "Span of time", "date-window": "Uncertain event date" }[record.kind];
}

export function hasUnknownStart(record: TimelineRecord) {
  return record.kind === "activity" || (record.kind === "life" && record.start === undefined);
}
export function hasUnknownEnd(record: TimelineRecord) {
  return record.kind === "activity" || (record.kind === "life" && record.end === undefined);
}

/** Chart extents only; never write a decorative extension back into date evidence. */
export function timelinePlotBounds(record: TimelineRecord): [number, number] | null {
  const start = record.start ?? record.end ?? record.placement?.year;
  const end = record.end ?? record.start ?? record.placement?.year;
  return start === undefined || end === undefined ? null : [start, end];
}
