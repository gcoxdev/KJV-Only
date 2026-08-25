import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import {
  createId,
  createLeaf,
  findLeafNode,
  updateLeafNode,
} from "@/lib/reader-layout";
import {
  isDedicatedLeafViewTab,
  nextSearchTabTitle,
  panelNodeContainsView,
} from "@/lib/workspace-navigation";
import { getStaticPage } from "@/lib/static-pages";
import type { NotesContext, NotesTabState, ReaderNote } from "@/types/notes";
import type {
  LeafNode,
  PanelNode,
  ReaderTab,
  StaticPageId,
  StudyWorkspaceTool,
  TabsOrientation,
  WordVerseSelectionTarget,
} from "@/types/reader";

type ChapterRef = {
  bookIndex: number;
  chapterIndex: number;
};

type UseWorkspaceNavigationParams = {
  tabs: ReaderTab[];
  setTabs: Dispatch<SetStateAction<ReaderTab[]>>;
  activeTabId: string | null;
  setActiveTabId: Dispatch<SetStateAction<string | null>>;
  activeRoot: PanelNode | null;
  chapterRefs: ChapterRef[];
  chapterRefIndex: ReadonlyMap<string, number>;
  tabsOrientation: TabsOrientation;
  tabEndRef: RefObject<HTMLDivElement | null>;
  initializeSearchPageState: (leafId: string) => void;
  readerNotes: ReaderNote[];
  notesContext: NotesContext | null;
  initializeNotesTabState: (leafId: string, state: NotesTabState) => void;
  targetedPanelLeafIdRef: RefObject<string | null>;
  setTargetedPanelLeafId: Dispatch<SetStateAction<string | null>>;
  wordVerseSelectionTargetRef: RefObject<WordVerseSelectionTarget>;
  setIsRightSidebarOpen: (isOpen: boolean) => void;
  setSidebarOpenRequestKey: Dispatch<SetStateAction<number>>;
  showStudyTool: (tool: StudyWorkspaceTool) => void;
  updateLeafLocation: (
    leafId: string,
    patch: Partial<
      Pick<
        LeafNode,
        | "bookIndex"
        | "chapterIndex"
        | "view"
        | "pickerTestament"
        | "pickerBookIndex"
      >
    >,
  ) => void;
};

export function useWorkspaceNavigation({
  tabs,
  setTabs,
  activeTabId,
  setActiveTabId,
  activeRoot,
  chapterRefs,
  chapterRefIndex,
  tabsOrientation,
  tabEndRef,
  initializeSearchPageState,
  readerNotes,
  notesContext,
  initializeNotesTabState,
  targetedPanelLeafIdRef,
  setTargetedPanelLeafId,
  wordVerseSelectionTargetRef,
  setIsRightSidebarOpen,
  setSidebarOpenRequestKey,
  showStudyTool,
  updateLeafLocation,
}: UseWorkspaceNavigationParams) {
  const tabsRef = useRef<ReaderTab[]>([]);
  const pendingActiveTabIdRef = useRef<string | null>(null);
  const pendingToolsTabScrollRef = useRef(false);
  const pendingToolsTabIdRef = useRef<string | null>(null);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    const pendingTabId = pendingActiveTabIdRef.current;
    if (!pendingTabId || !tabs.some((tab) => tab.id === pendingTabId)) {
      return;
    }

    if (pendingToolsTabScrollRef.current) {
      pendingToolsTabScrollRef.current = false;
      requestAnimationFrame(() => {
        tabEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: tabsOrientation === "vertical" ? "end" : "nearest",
          inline: tabsOrientation === "vertical" ? "nearest" : "end",
        });
      });
    }

    if (activeTabId === pendingTabId) {
      if (pendingToolsTabIdRef.current === pendingTabId) {
        pendingToolsTabIdRef.current = null;
      }
      pendingActiveTabIdRef.current = null;
      return;
    }

    setActiveTabId(pendingTabId);
  }, [activeTabId, setActiveTabId, tabEndRef, tabs, tabsOrientation]);

  const scrollTabsEndIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }, [tabEndRef, tabsOrientation]);

  const showTabById = useCallback(
    (tabId: string) => {
      pendingActiveTabIdRef.current = null;
      if (typeof document !== "undefined") {
        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLElement &&
          activeElement !== document.body
        ) {
          activeElement.blur();
        }
      }
      setActiveTabId(tabId);
    },
    [setActiveTabId],
  );

  const moveLeafChapter = useCallback(
    (leafId: string, direction: -1 | 1) => {
      if (!activeRoot) {
        return;
      }

      const leaf = findLeafNode(activeRoot, leafId);
      if (!leaf) {
        return;
      }

      const currentIndex = chapterRefIndex.get(
        `${leaf.bookIndex}-${leaf.chapterIndex}`,
      );
      if (currentIndex === undefined) {
        return;
      }

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= chapterRefs.length) {
        return;
      }

      const nextRef = chapterRefs[nextIndex];
      updateLeafLocation(leafId, {
        bookIndex: nextRef.bookIndex,
        chapterIndex: nextRef.chapterIndex,
      });
    },
    [activeRoot, chapterRefIndex, chapterRefs, updateLeafLocation],
  );

  const openChapterInNewTab = useCallback(
    (bookIndex: number, chapterIndex: number) => {
      const nextTabId = createId();
      const nextLeaf = createLeaf(bookIndex, chapterIndex, "reader");
      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id: nextTabId,
          title: `Tab ${currentTabs.length + 1}`,
          root: {
            ...nextLeaf,
            pickerTestament: null,
            pickerBookIndex: null,
          },
        },
      ]);
      setActiveTabId(nextTabId);
      scrollTabsEndIntoView();
    },
    [scrollTabsEndIntoView, setActiveTabId, setTabs],
  );

  const openSearchTab = useCallback(() => {
    const nextTabId = createId();
    const nextLeaf = createLeaf(0, 0, "search");
    const nextTitle = nextSearchTabTitle(tabs);
    setTabs((currentTabs) => [
      ...currentTabs,
      {
        id: nextTabId,
        title: nextTitle,
        root: nextLeaf,
      },
    ]);
    initializeSearchPageState(nextLeaf.id);
    setActiveTabId(nextTabId);
    scrollTabsEndIntoView();
  }, [initializeSearchPageState, scrollTabsEndIntoView, setActiveTabId, setTabs, tabs]);

  const openStaticPageTab = useCallback(
    (pageId: StaticPageId) => {
      const page = getStaticPage(pageId);
      if (!page) {
        return;
      }

      const nextTabId = createId();
      const nextLeaf = {
        ...createLeaf(0, 0, "page"),
        pageId,
      };

      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id: nextTabId,
          title: page.title,
          root: nextLeaf,
        },
      ]);
      setActiveTabId(nextTabId);
      scrollTabsEndIntoView();
    },
    [scrollTabsEndIntoView, setActiveTabId, setTabs],
  );

  const openNotesTab = useCallback(
    (selectedNoteId?: string | null) => {
      const nextTabId = createId();
      const nextLeaf = createLeaf(0, 0, "notes");
      const selectedNote = selectedNoteId
        ? readerNotes.find((note) => note.id === selectedNoteId) ?? null
        : null;
      const nextTitle = selectedNote
        ? selectedNote.title.trim() || "Untitled note"
        : "Notes";
      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id: nextTabId,
          title: nextTitle,
          root: nextLeaf,
        },
      ]);
      initializeNotesTabState(nextLeaf.id, {
        selectedNoteId: selectedNoteId ?? null,
        filter: "all",
        context: notesContext,
      });
      setActiveTabId(nextTabId);
      scrollTabsEndIntoView();
    },
    [
      initializeNotesTabState,
      notesContext,
      readerNotes,
      scrollTabsEndIntoView,
      setActiveTabId,
      setTabs,
    ],
  );

  const findTabContainingLeafId = useCallback(
    (leafId: string, sourceTabs: ReaderTab[] = tabsRef.current) =>
      sourceTabs.find((tab) => Boolean(findLeafNode(tab.root, leafId))) ?? null,
    [],
  );

  const ensureToolsPanelInActiveTab = useCallback(() => {
    if (!activeTabId) {
      return;
    }

    setTabs((currentTabs) => {
      const activeIndex = currentTabs.findIndex(
        (tab) => tab.id === activeTabId,
      );
      if (activeIndex < 0) {
        return currentTabs;
      }

      const active = currentTabs[activeIndex];
      if (panelNodeContainsView(active.root, "tools")) {
        return currentTabs;
      }

      const nextLeaf = createLeaf(0, 0, "tools");
      const nextRoot: PanelNode = {
        id: createId(),
        type: "split",
        orientation: "horizontal",
        ratio: 68,
        first: active.root,
        second: nextLeaf,
      };

      const nextTabs = [...currentTabs];
      nextTabs[activeIndex] = { ...active, root: nextRoot };
      return nextTabs;
    });
  }, [activeTabId, setTabs]);

  const createTargetedToolsPanelInActiveTab = useCallback(() => {
    if (!activeTabId) {
      return false;
    }

    const currentTabs = tabsRef.current;
    const activeIndex = currentTabs.findIndex(
      (tab) => tab.id === activeTabId,
    );
    if (activeIndex < 0) {
      return false;
    }

    const active = currentTabs[activeIndex];
    const nextLeaf = createLeaf(0, 0, "tools");
    const nextRoot: PanelNode = {
      id: createId(),
      type: "split",
      orientation: "horizontal",
      ratio: 68,
      first: active.root,
      second: nextLeaf,
    };

    const nextTabs = [...currentTabs];
    nextTabs[activeIndex] = { ...active, root: nextRoot };
    tabsRef.current = nextTabs;
    setTabs(nextTabs);

    setTargetedPanelLeafId(nextLeaf.id);
    showTabById(activeTabId);
    return true;
  }, [activeTabId, setTabs, setTargetedPanelLeafId, showTabById]);

  const openToolsInTargetedPanel = useCallback(() => {
    const currentTargetedPanelLeafId = targetedPanelLeafIdRef.current;
    if (!currentTargetedPanelLeafId) {
      return false;
    }

    const targetTab = findTabContainingLeafId(currentTargetedPanelLeafId);
    if (!targetTab) {
      return true;
    }

    setTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === targetTab.id
          ? {
              ...tab,
              root: updateLeafNode(tab.root, currentTargetedPanelLeafId, {
                view: "tools",
                pickerTestament: null,
                pickerBookIndex: null,
              }),
            }
          : tab,
      ),
    );
    showTabById(targetTab.id);
    return true;
  }, [
    findTabContainingLeafId,
    setTabs,
    showTabById,
    targetedPanelLeafIdRef,
  ]);

  const openToolsTab = useCallback(() => {
    const pendingToolsTabId = pendingToolsTabIdRef.current;
    if (pendingToolsTabId) {
      pendingActiveTabIdRef.current = pendingToolsTabId;
      setActiveTabId(pendingToolsTabId);
      return;
    }

    const existingToolsTab = tabsRef.current.find((tab) =>
      isDedicatedLeafViewTab(tab, "tools"),
    );
    if (existingToolsTab) {
      pendingActiveTabIdRef.current = null;
      pendingToolsTabScrollRef.current = false;
      pendingToolsTabIdRef.current = null;
      setActiveTabId(existingToolsTab.id);
      return;
    }

    const nextTabId = createId();
    const nextLeaf = createLeaf(0, 0, "tools");
    pendingActiveTabIdRef.current = nextTabId;
    pendingToolsTabScrollRef.current = true;
    pendingToolsTabIdRef.current = nextTabId;

    setTabs((currentTabs) => [
      ...currentTabs,
      {
        id: nextTabId,
        title: "Tools",
        root: nextLeaf,
      },
    ]);
  }, [setActiveTabId, setTabs]);

  const openStudyTool = useCallback(
    (tool: StudyWorkspaceTool, options?: { openSidebar?: boolean }) => {
      const destination =
        options?.openSidebar === false
          ? "new-panel"
          : wordVerseSelectionTargetRef.current;

      if (destination === "sidebar") {
        setIsRightSidebarOpen(true);
        setSidebarOpenRequestKey((current) => current + 1);
      } else if (destination === "targeted-panel") {
        if (!openToolsInTargetedPanel()) {
          createTargetedToolsPanelInActiveTab();
        }
      } else if (destination === "new-panel") {
        ensureToolsPanelInActiveTab();
      } else {
        openToolsTab();
      }
      showStudyTool(tool);
    },
    [
      createTargetedToolsPanelInActiveTab,
      ensureToolsPanelInActiveTab,
      openToolsInTargetedPanel,
      openToolsTab,
      setIsRightSidebarOpen,
      setSidebarOpenRequestKey,
      showStudyTool,
      wordVerseSelectionTargetRef,
    ],
  );

  return {
    tabsRef,
    showTabById,
    moveLeafChapter,
    openChapterInNewTab,
    openSearchTab,
    openStaticPageTab,
    openNotesTab,
    openStudyTool,
  };
}
