import { type Dispatch, type RefObject, type SetStateAction, useCallback, useState } from "react";

import {
  createId,
  createInitialTab,
  createLeaf,
  extractLeafNode,
} from "@/lib/reader-layout";
import type { ReaderTab, TabsOrientation } from "@/types/reader";

type UseTabActionsArgs = {
  tabs: ReaderTab[];
  setTabs: Dispatch<SetStateAction<ReaderTab[]>>;
  activeTabId: string | null;
  setActiveTabId: Dispatch<SetStateAction<string | null>>;
  tabsOrientation: TabsOrientation;
  tabEndRef: RefObject<HTMLDivElement | null>;
  clearAllPanelPreviews: () => void;
};

export function useTabActions({
  tabs,
  setTabs,
  activeTabId,
  setActiveTabId,
  tabsOrientation,
  tabEndRef,
  clearAllPanelPreviews,
}: UseTabActionsArgs) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  const scrollTabsEndIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }, [tabEndRef, tabsOrientation]);

  const moveLeafToNewTab = useCallback(
    (leafId: string) => {
      if (!activeTabId) {
        return;
      }

      const nextTabId = createId();
      let shouldActivate = false;

      setTabs((currentTabs) => {
        const activeIndex = currentTabs.findIndex(
          (tab) => tab.id === activeTabId,
        );
        if (activeIndex < 0) {
          return currentTabs;
        }

        const active = currentTabs[activeIndex];
        const result = extractLeafNode(active.root, leafId);
        if (!result.extracted) {
          return currentTabs;
        }

        const sourceRoot = result.next ?? createLeaf();
        const newTab: ReaderTab = {
          id: nextTabId,
          title: `Tab ${currentTabs.length + 1}`,
          root: result.extracted,
        };

        const nextTabs = [...currentTabs];
        nextTabs[activeIndex] = { ...active, root: sourceRoot };
        nextTabs.push(newTab);
        shouldActivate = true;
        return nextTabs;
      });

      if (shouldActivate) {
        setActiveTabId(nextTabId);
        clearAllPanelPreviews();
        scrollTabsEndIntoView();
      }
    },
    [
      activeTabId,
      clearAllPanelPreviews,
      scrollTabsEndIntoView,
      setActiveTabId,
      setTabs,
    ],
  );

  const addTab = useCallback(() => {
    let nextTabId: string | null = null;
    setTabs((currentTabs) => {
      const nextTab = createInitialTab(currentTabs.length + 1, "picker");
      nextTabId = nextTab.id;
      return [...currentTabs, nextTab];
    });

    if (nextTabId) {
      setActiveTabId(nextTabId);
      scrollTabsEndIntoView();
    }
  }, [scrollTabsEndIntoView, setActiveTabId, setTabs]);

  const closeTab = useCallback(
    (tabId: string) => {
      let nextActiveTabId: string | null | undefined;
      setTabs((currentTabs) => {
        if (currentTabs.length <= 1) {
          return currentTabs;
        }

        const closingIndex = currentTabs.findIndex((tab) => tab.id === tabId);
        if (closingIndex < 0) {
          return currentTabs;
        }

        const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);
        if (tabId === activeTabId) {
          const fallbackTab =
            nextTabs[Math.max(0, closingIndex - 1)] ?? nextTabs[0] ?? null;
          nextActiveTabId = fallbackTab?.id ?? null;
        }
        return nextTabs;
      });

      if (nextActiveTabId !== undefined) {
        setActiveTabId(nextActiveTabId);
      }
    },
    [activeTabId, setActiveTabId, setTabs],
  );

  const moveTab = useCallback(
    (tabId: string, direction: -1 | 1) => {
      if (!tabId) {
        return;
      }

      setTabs((currentTabs) => {
        const index = currentTabs.findIndex((tab) => tab.id === tabId);
        if (index < 0) {
          return currentTabs;
        }

        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= currentTabs.length) {
          return currentTabs;
        }

        const nextTabs = [...currentTabs];
        const [tab] = nextTabs.splice(index, 1);
        nextTabs.splice(nextIndex, 0, tab);
        return nextTabs;
      });
    },
    [setTabs],
  );

  const reorderTab = useCallback(
    (tabId: string, targetTabId: string) => {
      if (!tabId || !targetTabId || tabId === targetTabId) {
        return;
      }

      setTabs((currentTabs) => {
        const sourceIndex = currentTabs.findIndex((tab) => tab.id === tabId);
        const targetIndex = currentTabs.findIndex((tab) => tab.id === targetTabId);
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
          return currentTabs;
        }

        const nextTabs = [...currentTabs];
        const [tab] = nextTabs.splice(sourceIndex, 1);
        nextTabs.splice(targetIndex, 0, tab);
        return nextTabs;
      });
    },
    [setTabs],
  );

  const openRenameDialog = useCallback(
    (tabId: string) => {
      const tab = tabs.find((item) => item.id === tabId);
      if (!tab) {
        return;
      }

      setRenameTabId(tabId);
      setRenameValue(tab.title);
      setRenameError(null);
      setIsRenameDialogOpen(true);
    },
    [tabs],
  );

  const confirmRenameTab = useCallback(() => {
    if (!renameTabId) {
      return;
    }

    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setRenameError("Tab label must be at least 1 character.");
      return;
    }

    setTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === renameTabId ? { ...tab, title: nextTitle } : tab,
      ),
    );
    setIsRenameDialogOpen(false);
    setRenameTabId(null);
    setRenameError(null);
  }, [renameTabId, renameValue, setTabs]);

  const moveLeafToExistingTab = useCallback(
    (leafId: string, targetTabId: string) => {
      if (!activeTabId || targetTabId === activeTabId) {
        return;
      }

      setTabs((currentTabs) => {
        const sourceIndex = currentTabs.findIndex(
          (tab) => tab.id === activeTabId,
        );
        const targetIndex = currentTabs.findIndex(
          (tab) => tab.id === targetTabId,
        );
        if (sourceIndex < 0 || targetIndex < 0) {
          return currentTabs;
        }

        const sourceTab = currentTabs[sourceIndex];
        const extraction = extractLeafNode(sourceTab.root, leafId);
        if (!extraction.extracted) {
          return currentTabs;
        }

        const nextTabs = [...currentTabs];
        nextTabs[sourceIndex] = {
          ...sourceTab,
          root: extraction.next ?? createLeaf(),
        };

        const nextTargetIndex = nextTabs.findIndex(
          (tab) => tab.id === targetTabId,
        );
        if (nextTargetIndex < 0) {
          return currentTabs;
        }

        const targetTab = nextTabs[nextTargetIndex];
        nextTabs[nextTargetIndex] = {
          ...targetTab,
          root: {
            id: createId(),
            type: "split",
            orientation: "horizontal",
            ratio: 50,
            first: targetTab.root,
            second: extraction.extracted,
          },
        };

        return nextTabs;
      });

      setActiveTabId(targetTabId);
      clearAllPanelPreviews();
    },
    [activeTabId, clearAllPanelPreviews, setActiveTabId, setTabs],
  );

  const onRenameValueChange = useCallback((value: string) => {
    setRenameValue(value);
    setRenameError(
      value.trim().length > 0 ? null : "Tab label must be at least 1 character.",
    );
  }, []);

  const onRenameCancel = useCallback(() => {
    setIsRenameDialogOpen(false);
    setRenameTabId(null);
    setRenameError(null);
  }, []);

  return {
    isRenameDialogOpen,
    renameValue,
    renameError,
    setIsRenameDialogOpen,
    moveLeafToNewTab,
    addTab,
    closeTab,
    moveTab,
    reorderTab,
    openRenameDialog,
    confirmRenameTab,
    moveLeafToExistingTab,
    onRenameValueChange,
    onRenameCancel,
  };
}
