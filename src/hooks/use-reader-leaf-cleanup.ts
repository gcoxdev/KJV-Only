import { useEffect, type Dispatch, type SetStateAction } from "react";

import { clearSingleLeafReferenceIfMissing } from "@/lib/leaf-state";
import { prunePendingReaderScrollTargets } from "@/lib/reader-scroll-targets";
import type { PendingReaderScrollTarget } from "@/types/reader";

type ActiveReaderWordHighlight = {
  leafId: string;
  verseNumber: number;
  word: string;
};

type UseReaderLeafCleanupParams = {
  activeLeafIds: Set<string>;
  pruneNotesTabState: (activeLeafIds: Set<string>) => void;
  pruneSearchPageState: (activeLeafIds: Set<string>) => void;
  pruneHighlightModeForLeaves: (activeLeafIds: Set<string>) => void;
  pruneLeafHighlights: (activeLeafIds: Set<string>) => void;
  setActiveReaderWordHighlight: Dispatch<
    SetStateAction<ActiveReaderWordHighlight | null>
  >;
  setPendingReaderScrollTargets: Dispatch<
    SetStateAction<PendingReaderScrollTarget[]>
  >;
};

export function useReaderLeafCleanup({
  activeLeafIds,
  pruneNotesTabState,
  pruneSearchPageState,
  pruneHighlightModeForLeaves,
  pruneLeafHighlights,
  setActiveReaderWordHighlight,
  setPendingReaderScrollTargets,
}: UseReaderLeafCleanupParams) {
  useEffect(() => {
    pruneNotesTabState(activeLeafIds);
    pruneSearchPageState(activeLeafIds);
    pruneHighlightModeForLeaves(activeLeafIds);
    pruneLeafHighlights(activeLeafIds);
    setActiveReaderWordHighlight((current) =>
      clearSingleLeafReferenceIfMissing(current, activeLeafIds),
    );
    setPendingReaderScrollTargets((current) =>
      prunePendingReaderScrollTargets(current, activeLeafIds),
    );
  }, [
    activeLeafIds,
    pruneHighlightModeForLeaves,
    pruneLeafHighlights,
    pruneNotesTabState,
    pruneSearchPageState,
    setActiveReaderWordHighlight,
    setPendingReaderScrollTargets,
  ]);
}
