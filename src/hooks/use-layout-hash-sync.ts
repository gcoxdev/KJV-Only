import { useCallback, useEffect, useRef } from "react";

import {
  parseLayoutHash,
  serializeLayoutHash,
  type ParsedLayoutHash,
  type SerializedVerseRange,
} from "@/lib/layout-hash";
import type { ReaderTab, TabsOrientation } from "@/types/reader";

type UseLayoutHashSyncParams = {
  isLoaded: boolean;
  tabs: ReaderTab[];
  activeTabId: string | null;
  tabsOrientation: TabsOrientation;
  highlightedVerseRangesByLeafId: Record<string, SerializedVerseRange[]>;
  targetedPanelLeafId: string | null;
  showTargetedPanelToggle: boolean;
  setTabs: (tabs: ReaderTab[]) => void;
  setActiveTabId: (tabId: string | null) => void;
  setTabsOrientation: (orientation: TabsOrientation) => void;
  setVerseHighlights: (
    next: Record<string, SerializedVerseRange[]>,
  ) => void;
  queueVerseHighlights: (
    leafId: string,
    ranges: SerializedVerseRange[],
  ) => void;
  setTargetedPanelLeafId: (leafId: string | null) => void;
};

export function useLayoutHashSync({
  isLoaded,
  tabs,
  activeTabId,
  tabsOrientation,
  highlightedVerseRangesByLeafId,
  targetedPanelLeafId,
  showTargetedPanelToggle,
  setTabs,
  setActiveTabId,
  setTabsOrientation,
  setVerseHighlights,
  queueVerseHighlights,
  setTargetedPanelLeafId,
}: UseLayoutHashSyncParams) {
  const syncedLayoutHashRef = useRef("");

  const applyParsedLayout = useCallback(
    (parsed: ParsedLayoutHash) => {
      const nextHash = serializeLayoutHash({
        tabs: parsed.tabs,
        activeTabId:
          parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null,
        tabsOrientation: parsed.tabsOrientation,
        highlightedVerseRangesByLeafId: parsed.highlightedVerseRangesByLeafId,
        targetedPanelLeafId: parsed.targetedPanelLeafId,
      });
      syncedLayoutHashRef.current = nextHash;
      setTabs(parsed.tabs);
      setActiveTabId(
        parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null,
      );
      setTargetedPanelLeafId(parsed.targetedPanelLeafId);
      setTabsOrientation(parsed.tabsOrientation);
      setVerseHighlights(parsed.highlightedVerseRangesByLeafId);
      for (const [leafId, ranges] of Object.entries(
        parsed.highlightedVerseRangesByLeafId,
      )) {
        queueVerseHighlights(leafId, ranges);
      }
    },
    [
      queueVerseHighlights,
      setActiveTabId,
      setTabs,
      setTabsOrientation,
      setTargetedPanelLeafId,
      setVerseHighlights,
    ],
  );

  const parseCurrentLayoutHash = useCallback(
    () => parseLayoutHash(window.location.hash),
    [],
  );

  useEffect(() => {
    if (!isLoaded || tabs.length === 0) {
      return;
    }
    const nextHash = serializeLayoutHash({
      tabs,
      activeTabId,
      tabsOrientation,
      highlightedVerseRangesByLeafId,
      targetedPanelLeafId: showTargetedPanelToggle ? targetedPanelLeafId : null,
    });
    if (
      syncedLayoutHashRef.current === nextHash &&
      window.location.hash === nextHash
    ) {
      return;
    }
    syncedLayoutHashRef.current = nextHash;
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [
    activeTabId,
    highlightedVerseRangesByLeafId,
    isLoaded,
    showTargetedPanelToggle,
    tabs,
    tabsOrientation,
    targetedPanelLeafId,
  ]);

  useEffect(() => {
    function onHashChange() {
      const parsed = parseCurrentLayoutHash();
      if (!parsed) {
        return;
      }
      applyParsedLayout(parsed);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [applyParsedLayout, parseCurrentLayoutHash]);

  return {
    parseCurrentLayoutHash,
    applyParsedLayout,
  };
}
