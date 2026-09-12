import { describe, expect, it } from "vitest";
import { createInitialTab, findLeafNode, collectLeafIds, swapLeafContent, updateLeafNode } from "@/lib/reader-layout";
import { parseLayoutHash, serializeLayoutHash } from "@/lib/layout-hash";
import { parseReaderDisplaySettings } from "@/lib/reader-persistence";
import { parseVisualToolRequest, routeVisualTool } from "@/lib/visual-tool-routing";
import type { VisualToolRequest } from "@/types/reader";

const requests: VisualToolRequest[] = [
  { kind: "genealogy", personId: "JesusChrist" },
  { kind: "maps", geojsonFile: "dan.geojson" },
  { kind: "timeline", context: { bookIndex: 14, chapterIndex: 5 } },
];

describe("visual tool targeting", () => {
  it("keeps legacy settings in dialogs and validates each preference independently", () => {
    for (const value of [null, {}, { genealogyOpenTarget: "sidebar", mapsOpenTarget: true, timelineOpenTarget: "tab" }]) {
      expect(parseReaderDisplaySettings(value)).toMatchObject({ genealogyOpenTarget: "dialog", mapsOpenTarget: "dialog", timelineOpenTarget: "dialog" });
    }
    expect(parseReaderDisplaySettings({ genealogyOpenTarget: "new-panel", mapsOpenTarget: "targeted-panel", timelineOpenTarget: "new-tab" }))
      .toMatchObject({ genealogyOpenTarget: "new-panel", mapsOpenTarget: "targeted-panel", timelineOpenTarget: "new-tab" });
  });

  for (const request of requests) it(`routes and restores ${request.kind} without losing its source reader`, () => {
    const source = createInitialTab(1);
    expect(routeVisualTool([source], source.id, null, request, "dialog")).toBeNull();
    const panel = routeVisualTool([source], source.id, null, request, "new-panel")!;
    expect(panel.tabs).toHaveLength(1);
    expect(collectLeafIds(panel.tabs[0].root)).toHaveLength(2);
    expect(findLeafNode(panel.tabs[0].root, source.root.id)).toEqual(source.root);
    expect(findLeafNode(panel.tabs[0].root, panel.leafId)).toMatchObject({ view: "visual-tool", visualTool: request });
    const newTab = routeVisualTool(panel.tabs, source.id, panel.leafId, request, "new-tab")!;
    expect(newTab.tabs).toHaveLength(2);
    expect(newTab.tabId).not.toBe(source.id);
    expect(newTab.targetedLeafId).toBe(panel.leafId);

    const targeted = routeVisualTool(newTab.tabs, newTab.tabId, panel.leafId, request, "targeted-panel")!;
    expect(targeted.tabId).toBe(source.id);
    expect(targeted.leafId).toBe(panel.leafId);
    expect(targeted.tabs).toHaveLength(2);
    expect(collectLeafIds(targeted.tabs[0].root)).toHaveLength(2);
    const hash = serializeLayoutHash({ tabs: targeted.tabs, activeTabId: targeted.tabId, tabsOrientation: "horizontal", targetedPanelLeafId: targeted.leafId, highlightedVerseRangesByLeafId: {} });
    const restored = parseLayoutHash(hash)!;
    expect(restored.tabs).toHaveLength(2);
    expect(findLeafNode(restored.tabs[0].root, restored.targetedPanelLeafId!)?.visualTool).toEqual(request);
    expect(hash).not.toContain("requestId");
  });

  it("creates and marks a missing target, including without an active tab", () => {
    const source = createInitialTab(1);
    const result = routeVisualTool([source], source.id, "removed", requests[0], "targeted-panel")!;
    expect(result.targetedLeafId).toBe(result.leafId);
    expect(collectLeafIds(result.tabs[0].root)).toHaveLength(2);
    const fallback = routeVisualTool([], "missing", null, requests[1], "targeted-panel")!;
    expect(fallback.tabs).toHaveLength(1);
    expect(fallback.targetedLeafId).toBe(fallback.leafId);
    expect(routeVisualTool([], null, null, requests[2], "new-panel")!.tabs).toHaveLength(1);
  });

  it("moves the visual content with panel swaps and clears it on Home", () => {
    const source = createInitialTab(1);
    const result = routeVisualTool([source], source.id, null, requests[0], "new-panel")!;
    const swapped = swapLeafContent(result.tabs[0].root, source.root.id, result.leafId);
    expect(findLeafNode(swapped, source.root.id)?.visualTool).toMatchObject(requests[0]);
    expect(findLeafNode(swapped, result.leafId)?.visualTool).toBeUndefined();
    expect(findLeafNode(updateLeafNode(swapped, source.root.id, { view: "picker" }), source.root.id)?.visualTool).toBeUndefined();
  });

  it("rejects malformed tool state and safely encodes layout delimiters", () => {
    for (const value of [null, { kind: "other" }, { kind: "genealogy", personId: "" }, { kind: "maps", geojsonFile: "../a.geojson" }, { kind: "timeline", context: { bookIndex: 66, chapterIndex: -1 } }]) {
      expect(parseVisualToolRequest(value)).toBeNull();
    }
    const request: VisualToolRequest = { kind: "genealogy", personId: "a);b*|c&d" };
    const result = routeVisualTool([], null, null, request, "new-tab")!;
    const restored = parseLayoutHash(serializeLayoutHash({ tabs: result.tabs, activeTabId: result.tabId, tabsOrientation: "horizontal", targetedPanelLeafId: null, highlightedVerseRangesByLeafId: {} }))!;
    expect(restored.tabs[0].root).toMatchObject({ visualTool: request });
  });
});
