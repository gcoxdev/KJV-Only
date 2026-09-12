import { canonicalTimelineId } from "./timeline-identities";
/** Versioned, bounded presentation state. No calendar evidence is stored here. */
export type TimelineWindow = { start: number; end: number; key: string };
export type TimelineViewState = {
  pinned: { bookIndex: number; chapterIndex: number } | null;
  scope: string;
  phase: string;
  filter: "all" | "biblical" | "historical";
  era: string;
  content: "all" | "people" | "events";
  branch: "mary" | "joseph";
  display: "chart" | "list";
  view: "tree" | "timeline";
  query: string;
  showPeople: boolean;
  includeContext: boolean;
  selectedId?: string;
  window?: TimelineWindow;
};
export type TimelineViewKind = "historical" | "genealogy";
export const TIMELINE_MODEL_KEY = "kjv-timeline-model-v1";
export const timelineViewStorageKey = (kind: TimelineViewKind) => `kjv-timeline-view-${kind}-v1`;

export function parseTimelineWindow(value: unknown): TimelineWindow | undefined {
  if (!value || typeof value !== "object") return;
  const { start, end, key } = value as Record<string, unknown>;
  if (typeof start !== "number" || typeof end !== "number" || !Number.isFinite(start) || !Number.isFinite(end) ||
    Math.abs(start) > 8e15 || Math.abs(end) > 8e15 || end <= start || end - start > 1e15 ||
    typeof key !== "string" || key.length > 40) return;
  return { start, end, key };
}
export function parseTimelineViewState(value: unknown, kind: TimelineViewKind): TimelineViewState {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const pick = <T extends string>(key: string, values: readonly T[], fallback: T): T =>
    values.includes(input[key] as T) ? input[key] as T : fallback;
  const text = (key: string, limit: number) => typeof input[key] === "string" ? input[key].slice(0, limit) : "";
  const context = input.pinned && typeof input.pinned === "object" ? input.pinned as Record<string, unknown> : {};
  const pinned = typeof context.bookIndex === "number" && Number.isInteger(context.bookIndex) && context.bookIndex >= 0 && context.bookIndex < 66 &&
    typeof context.chapterIndex === "number" && Number.isInteger(context.chapterIndex) && context.chapterIndex >= 0 && context.chapterIndex < 150
    ? { bookIndex: context.bookIndex, chapterIndex: context.chapterIndex } : null;
  return {
    pinned,
    scope: kind === "historical" ? pick("scope", ["chapter", "book", "world", "gospels", "paul"], "chapter") : pick("scope", ["overview", "family", "lineage"], "overview"),
    phase: text("phase", 100) || "all",
    filter: pick("filter", ["all", "biblical", "historical"], "all"),
    era: pick("era", ["all", "beginnings", "patriarchs", "exodus", "kingdom", "exile", "gospels", "history"], "all"),
    content: pick("content", ["all", "people", "events"], "all"),
    branch: pick("branch", ["mary", "joseph"], "joseph"),
    display: pick("display", ["chart", "list"], "chart"),
    view: pick("view", ["tree", "timeline"], "tree"),
    query: text("query", 200),
    showPeople: input.showPeople === true,
    includeContext: input.includeContext === true,
    selectedId: text("selectedId", 200) ? canonicalTimelineId(text("selectedId", 200)) : undefined,
    window: parseTimelineWindow(input.window),
  };
}

/** Changing the plotted records or chronology invalidates a remembered viewport. */
export function timelineWindowKey(records: Array<{ id: string; start?: number; end?: number; placement?: { year: number } }>) {
  let hash = 2166136261;
  for (const record of records) {
    const value = `${record.id}:${record.start}:${record.end}:${record.placement?.year};`;
    for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0).toString(36);
}
