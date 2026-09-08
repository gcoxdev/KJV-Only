export type TimelineEra = "beginnings" | "patriarchs" | "exodus" | "kingdom" | "exile" | "gospels";
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
  endLabel?: string;
  age?: number;
  references: string[];
  sources: string[];
  note: string;
  /** Relative position calculated from Genesis, before a BC anchor is applied. */
  adamYear?: number;
};

export const TIMELINE_ERAS: Record<TimelineEra, string> = {
  beginnings: "Adam to the patriarchs", patriarchs: "Abraham to Egypt",
  exodus: "Exodus and Judges", kingdom: "Kings and prophets",
  exile: "Exile and return", gospels: "Toward Jesus",
};

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
  if (record.kind === "life") {
    return `Birth: ${start} · ${record.endLabel ?? "Death"}: ${end}${record.age === undefined ? "" : ` · ${record.age} years (KJV)`}`;
  }
  if (record.start === undefined) return "Dates unknown";
  return `${record.kind === "date-window" ? "Possible event date: " : record.kind === "activity" ? "Recorded activity: " : ""}${start}${record.end === undefined || record.end === record.start ? "" : ` – ${end}`}`;
}

export function timelineKindLabel(record: TimelineRecord) {
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
  const start = record.start ?? record.end;
  const end = record.end ?? record.start;
  return start === undefined || end === undefined ? null : [start, end];
}
