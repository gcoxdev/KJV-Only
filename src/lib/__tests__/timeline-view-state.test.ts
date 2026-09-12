import { describe, expect, it } from "vitest";
import { parseTimelineViewState, parseTimelineWindow, timelineWindowKey } from "../timeline-view-state";
import { parseLayoutHash, serializeLayoutHash } from "../layout-hash";
import { routeVisualTool } from "../visual-tool-routing";
import { buildLeafHistoryEntry, reconcileLeafHistoryState } from "@/hooks/use-leaf-history";

describe("remembered timeline views", () => {
  it("bounds untrusted saved values and rejects invalid chart ranges", () => {
    expect(parseTimelineViewState({ scope: "wrong", filter: true, pinned: { bookIndex: 66, chapterIndex: 1 }, query: "x".repeat(300) }, "historical"))
      .toMatchObject({ scope: "chapter", filter: "all", pinned: null, query: "x".repeat(200) });
    expect(parseTimelineViewState(null, "genealogy")).toMatchObject({ scope: "overview", branch: "joseph", view: "tree" });
    for (const value of [null, { start: NaN, end: 3, key: "a" }, { start: 4, end: 3, key: "a" }, { start: 0, end: 9e15, key: "a" }]) expect(parseTimelineWindow(value)).toBeUndefined();
  });
  it("round trips independent panel preferences, including layout delimiters", () => {
    const viewState = parseTimelineViewState({ scope: "gospels", phase: "Birth and childhood", pinned: { bookIndex: 39, chapterIndex: 1 }, filter: "biblical", query: "a);b*|c&d", selectedId: "jesus-birth", window: { start: -60000000000000, end: -59900000000000, key: "test" } }, "historical");
    const first = routeVisualTool([], null, null, { kind: "timeline", context: null, viewState }, "new-tab")!;
    const second = routeVisualTool(first.tabs, first.tabId, null, { kind: "timeline", context: null }, "new-tab")!;
    const hash = serializeLayoutHash({ tabs: second.tabs, activeTabId: second.tabId, tabsOrientation: "horizontal", targetedPanelLeafId: null, highlightedVerseRangesByLeafId: {} });
    const restored = parseLayoutHash(hash)!;
    expect(restored.tabs[0].root).toMatchObject({ visualTool: { viewState } });
    expect(restored.tabs[1].root).toMatchObject({ visualTool: { kind: "timeline", context: null } });
    expect(hash).not.toContain("requestId");
  });
  it("updates the current history snapshot without adding a navigation step", () => {
    const routed = routeVisualTool([], null, null, { kind: "timeline", context: null }, "new-tab")!;
    const root = routed.tabs[0].root;
    if (root.type !== "leaf") throw Error("Expected leaf");
    const first = buildLeafHistoryEntry(root);
    const next = buildLeafHistoryEntry({ ...root, visualTool: { ...root.visualTool!, viewState: parseTimelineViewState({ query: "Jesus" }, "historical") } });
    expect(reconcileLeafHistoryState({ [root.id]: { entries: [first], index: 0 } }, new Map([[root.id, next]]), new Set())[root.id]).toEqual({ entries: [next], index: 0 });
  });
  it("invalidates the window for changed chronology or filtered records", () => {
    const a = [{ id: "a", start: -100, end: -50 }, { id: "b", placement: { year: 0 } }];
    expect(timelineWindowKey(a)).toBe(timelineWindowKey(structuredClone(a)));
    expect(timelineWindowKey(a)).not.toBe(timelineWindowKey(a.slice(1)));
    expect(timelineWindowKey(a)).not.toBe(timelineWindowKey([{ ...a[0], start: -120 }, a[1]]));
  });
});
