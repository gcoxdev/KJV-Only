import { useEffect } from "react";

import { panelNodeContainsView } from "@/lib/workspace-navigation";
import type { ReaderTab, StudyWorkspaceTab } from "@/types/reader";

type UseTopicsPreloadParams = {
  tabs: ReaderTab[];
  studyWorkspaceTab: StudyWorkspaceTab;
  ensureTopicsLoaded: () => Promise<unknown>;
};

export function useTopicsPreload({
  tabs,
  studyWorkspaceTab,
  ensureTopicsLoaded,
}: UseTopicsPreloadParams) {
  useEffect(() => {
    const hasTopicsLeaf = tabs.some((tab) =>
      panelNodeContainsView(tab.root, "topics"),
    );
    if (studyWorkspaceTab !== "topics" && !hasTopicsLeaf) {
      return;
    }

    void ensureTopicsLoaded().catch(() => {
      // Error state is set by ensureTopicsLoaded.
    });
  }, [ensureTopicsLoaded, studyWorkspaceTab, tabs]);
}
