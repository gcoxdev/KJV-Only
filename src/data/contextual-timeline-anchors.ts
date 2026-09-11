import type { TimelineEra, TimelineRecord } from "../lib/bible-timeline";
import type { ContextTimelineRecord } from "./contextual-timeline";

export type TimelineAnchor = [id: string, offset?: number, endpoint?: "start" | "end"];
export type AnchoredEpisode = {
  id: string; label: string; era: TimelineEra; references: string[]; note: string;
  at?: TimelineAnchor | number; until?: TimelineAnchor | number;
  kind?: TimelineRecord["kind"]; sources?: string[];
};

/** Only real endpoints anchor events; schematic family-tree positions never do. */
export function buildAnchoredContext(episodes: AnchoredEpisode[], chronology: TimelineRecord[]): ContextTimelineRecord[] {
  const anchors = new Map(chronology.map(record => [record.id, record]));
  return episodes.map(episode => {
    if (anchors.has(episode.id)) throw new Error(`Duplicate chronology ID ${episode.id}`);
    const used: TimelineRecord[] = [];
    const resolve = (anchor?: TimelineAnchor | number) => {
      if (anchor === undefined || typeof anchor === "number") return anchor;
      const [id, offset = 0, endpoint = "start"] = anchor;
      const record = anchors.get(id);
      const year = record?.[endpoint];
      if (!record || year === undefined) throw new Error(`Missing chronology anchor ${id}.${endpoint} for ${episode.id}`);
      used.push(record);
      return year + offset;
    };
    const start = resolve(episode.at);
    const end = resolve(episode.until);
    if (start !== undefined && end !== undefined && end < start) throw new Error(`Reversed chronology interval for ${episode.id}`);
    const record: ContextTimelineRecord = {
      id: episode.id, label: episode.label, era: episode.era, track: "biblical",
      kind: episode.kind ?? "event", start, end,
      startStatus: start === undefined ? "unknown" : "approximate",
      endStatus: end === undefined ? "unknown" : "approximate",
      references: [...new Set([...episode.references, ...used.flatMap(anchor => anchor.references)])],
      sources: [...new Set(["ot", ...(episode.sources ?? []), ...used.flatMap(anchor => anchor.sources)])],
      note: episode.note + (start !== undefined ? " BC labels use the shared provisional KJV chronology and selected sojourn model; relative ages and intervals take priority over the calendar projection." : ""),
    };
    anchors.set(record.id, record);
    return record;
  });
}
