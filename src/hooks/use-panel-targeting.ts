import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react";

import { findLeafNode } from "@/lib/reader-layout";
import type {
  VisualToolOpenTarget,
  BookmarkOpenTarget,
  NotesLinkOpenTarget,
  ReaderTab,
  ReferenceLinkOpenTarget,
  SearchResultOpenTarget,
  WordVerseSelectionTarget,
} from "@/types/reader";

type UsePanelTargetingParams = {
  tabs: ReaderTab[];
  wordVerseSelectionTarget: WordVerseSelectionTarget;
  notesLinkOpenTarget: NotesLinkOpenTarget;
  searchResultOpenTarget: SearchResultOpenTarget;
  bookmarkOpenTarget: BookmarkOpenTarget;
  genealogyOpenTarget: VisualToolOpenTarget;
  mapsOpenTarget: VisualToolOpenTarget;
  timelineOpenTarget: VisualToolOpenTarget;
  referenceLinkOpenTarget: ReferenceLinkOpenTarget;
};

export function usePanelTargeting({
  tabs,
  wordVerseSelectionTarget,
  notesLinkOpenTarget,
  searchResultOpenTarget,
  bookmarkOpenTarget,
  genealogyOpenTarget,
  mapsOpenTarget,
  timelineOpenTarget,
  referenceLinkOpenTarget,
}: UsePanelTargetingParams) {
  const [targetedPanelLeafId, setTargetedPanelLeafIdState] = useState<string | null>(
    null,
  );
  const targetedPanelLeafIdRef = useRef<string | null>(null);

  const setTargetedPanelLeafId = useCallback(
    (value: SetStateAction<string | null>) => {
      setTargetedPanelLeafIdState((current) => {
        const nextValue =
          typeof value === "function"
            ? (value as (previousState: string | null) => string | null)(current)
            : value;
        targetedPanelLeafIdRef.current = nextValue;
        return nextValue;
      });
    },
    [],
  );

  useEffect(() => {
    if (!targetedPanelLeafId) {
      return;
    }
    const targetStillExists = tabs.some((tab) =>
      Boolean(findLeafNode(tab.root, targetedPanelLeafId)),
    );
    if (!targetStillExists) {
      targetedPanelLeafIdRef.current = null;
      setTargetedPanelLeafIdState(null);
    }
  }, [tabs, targetedPanelLeafId]);

  const showTargetedPanelToggle = useMemo(
    () =>
      wordVerseSelectionTarget === "targeted-panel" ||
      notesLinkOpenTarget === "targeted-panel" ||
      searchResultOpenTarget === "targeted-panel" ||
      bookmarkOpenTarget === "targeted-panel" ||
      genealogyOpenTarget === "targeted-panel" ||
      mapsOpenTarget === "targeted-panel" ||
      timelineOpenTarget === "targeted-panel" ||
      referenceLinkOpenTarget === "targeted-panel",
    [
      bookmarkOpenTarget,
      notesLinkOpenTarget,
      genealogyOpenTarget,
      mapsOpenTarget,
      timelineOpenTarget,
      referenceLinkOpenTarget,
      searchResultOpenTarget,
      wordVerseSelectionTarget,
    ],
  );

  const toggleTargetedPanel = useCallback(
    (leafId: string) => {
      setTargetedPanelLeafId((current) => (current === leafId ? null : leafId));
    },
    [setTargetedPanelLeafId],
  );

  return {
    targetedPanelLeafId,
    targetedPanelLeafIdRef,
    setTargetedPanelLeafId,
    showTargetedPanelToggle,
    toggleTargetedPanel,
  };
}
