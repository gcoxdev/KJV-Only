import { createId, createLeaf, findLeafNode, updateLeafNode } from "@/lib/reader-layout";
import type { ReaderTab, VisualToolOpenTarget, VisualToolRequest } from "@/types/reader";

export const VISUAL_TOOL_TITLES = { genealogy: "Genealogy", maps: "Maps", timeline: "Timeline" } as const;

/** Only identifiers and chapter coordinates belong in layouts, never loaded datasets. */
export function parseVisualToolRequest(value: unknown): VisualToolRequest | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (item.kind === "genealogy" && typeof item.personId === "string" && item.personId.length > 0 && item.personId.length <= 200) {
    return { kind: "genealogy", personId: item.personId };
  }
  if (item.kind === "maps" && typeof item.geojsonFile === "string" && /^[\w.-]+\.geojson$/.test(item.geojsonFile) && item.geojsonFile.length <= 200) {
    return { kind: "maps", geojsonFile: item.geojsonFile };
  }
  if (item.kind === "timeline") {
    if (item.context === null) return { kind: "timeline", context: null };
    if (item.context && typeof item.context === "object") {
      const { bookIndex, chapterIndex } = item.context as Record<string, unknown>;
      if (typeof bookIndex === "number" && Number.isInteger(bookIndex) && bookIndex >= 0 && bookIndex < 66 &&
        typeof chapterIndex === "number" && Number.isInteger(chapterIndex) && chapterIndex >= 0 && chapterIndex < 150) {
        return { kind: "timeline", context: { bookIndex, chapterIndex } };
      }
    }
  }
  return null;
}

export function routeVisualTool(
  tabs: ReaderTab[], activeTabId: string | null, targetedLeafId: string | null,
  request: VisualToolRequest, destination: VisualToolOpenTarget,
) {
  if (destination === "dialog") return null;
  const visualTool = { ...request, requestId: createId() };
  if (destination === "targeted-panel" && targetedLeafId) {
    const owner = tabs.find(tab => findLeafNode(tab.root, targetedLeafId));
    if (owner) return {
      tabs: tabs.map(tab => tab.id === owner.id ? { ...tab, root: updateLeafNode(tab.root, targetedLeafId, {
        view: "visual-tool", visualTool, pageId: null, pickerTestament: null, pickerBookIndex: null,
      }) } : tab),
      tabId: owner.id, leafId: targetedLeafId, targetedLeafId,
    };
  }
  const context = request.kind === "timeline" ? request.context : null;
  const leaf = { ...createLeaf(context?.bookIndex ?? 0, context?.chapterIndex ?? 0, "visual-tool"), visualTool };
  const active = tabs.find(tab => tab.id === activeTabId);
  const nextTarget = destination === "targeted-panel" ? leaf.id : targetedLeafId;
  if (destination !== "new-tab" && active) return {
    tabs: tabs.map(tab => tab.id === active.id ? { ...tab, root: {
      id: createId(), type: "split" as const, orientation: "horizontal" as const, ratio: 42, first: tab.root, second: leaf,
    } } : tab), tabId: active.id, leafId: leaf.id, targetedLeafId: nextTarget,
  };
  const tab: ReaderTab = { id: createId(), title: VISUAL_TOOL_TITLES[request.kind], root: leaf };
  return { tabs: [...tabs, tab], tabId: tab.id, leafId: leaf.id, targetedLeafId: nextTarget };
}
