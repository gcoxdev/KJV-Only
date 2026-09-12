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

/** The two saved Jesus profiles are aliases; co-mentioned people are not. */
export function canonicalTimelinePersonId(id: string) {
  return id === "jesus_christ_2684" ? "jesus_christ_2683" : id;
}
