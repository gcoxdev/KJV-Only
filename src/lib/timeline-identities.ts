/** Saved selections and chapter/anchor IDs from before catalog consolidation. */
export const TIMELINE_ID_ALIASES: Readonly<Record<string, string>> = {
  "royal-saul": "saul_618",
  "royal-solomon": "solomon_677",
  "royal-rehoboam": "rehoboam_847",
  "royal-hezekiah": "hezekiah_944",
  "royal-josiah": "josiah_849",
};

export function canonicalTimelineId(id: string) {
  return TIMELINE_ID_ALIASES[id] ?? id;
}

/** Reviewed alternate profiles already sharing chronology evidence, not namesakes. */
const TIMELINE_PERSON_ALIASES: ReadonlyMap<string, string> = new Map([
  ["jesus_christ_2684", "jesus_christ_2683"],
  ["mary_2829", "mary_2828"],
  ["joseph_2828", "joseph_2827"],
  ["zerubbabel_1119", "zerubbabel_1118"],
]);

// Normalize connection matching only; preserve each profile's family-tree branch.
export function canonicalTimelinePersonId(id: string) {
  return TIMELINE_PERSON_ALIASES.get(id) ?? id;
}
