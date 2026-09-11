import { useState } from "react";
import { collectLeafIds, findLeafNode } from "@/lib/reader-layout";
import type { ReaderTab } from "@/types/reader";

export type TimelineReaderContext = { bookIndex: number; chapterIndex: number };

export function useTimelineReaderContext(tab: ReaderTab | null | undefined, activeId: string | null) {
  const [last, setLast] = useState<{ tabId: string; leafId: string; context: TimelineReaderContext } | null>(null);
  const active = tab && activeId ? findLeafNode(tab.root, activeId) : null;
  const remembered = tab && last?.tabId === tab.id ? findLeafNode(tab.root, last.leafId) : null;
  const leaf = active?.view === "reader" ? active : remembered?.view === "reader" ? remembered :
    tab ? collectLeafIds(tab.root).map(id => findLeafNode(tab.root, id)).find(node => node?.view === "reader") : null;
  if (leaf && tab && (last?.tabId !== tab.id || last.leafId !== leaf.id || last.context.bookIndex !== leaf.bookIndex || last.context.chapterIndex !== leaf.chapterIndex)) {
    const next = { tabId: tab.id, leafId: leaf.id, context: { bookIndex: leaf.bookIndex, chapterIndex: leaf.chapterIndex } };
    setLast(next);
    return next.context;
  }
  return last?.context ?? null;
}
