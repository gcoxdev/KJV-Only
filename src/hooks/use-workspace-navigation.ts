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
} from "@/lib/workspace-navigation";
import { getStaticPage } from "@/lib/static-pages";
import type { NotesContext, NotesTabState, ReaderNote } from "@/types/notes";
import type {
  LeafNode,
  PanelNode,
  ReaderTab,
  StaticPageId,
  StudyToolsDestination,
  StudyWorkspaceTool,
  TabsOrientation,
  WordVerseSelectionTarget,
} from "@/types/reader";

function findFirstLeafWithView(
  node: PanelNode,
  view: LeafNode["view"],
): LeafNode | null {
  if (node.type === "leaf") {
    return node.view === view ? node : null;
  }
  return (
    findFirstLeafWithView(node.first, view) ??
    findFirstLeafWithView(node.second, view)
  );
}

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
        | "pageId"
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

  const ensureToolsPanelInActiveTab = useCallback(
    (sourceLeafId?: string | null) => {
      const sourceTabId = sourceLeafId
        ? findTabContainingLeafId(sourceLeafId)?.id ?? activeTabId
        : activeTabId;
      if (!sourceTabId) {
        return null;
      }

      const currentTabs = tabsRef.current;
      const activeIndex = currentTabs.findIndex(
        (tab) => tab.id === sourceTabId,
      );
      if (activeIndex < 0) {
        return null;
      }

      const active = currentTabs[activeIndex];
      const existingToolsLeaf = findFirstLeafWithView(active.root, "tools");
      if (existingToolsLeaf) {
        showTabById(sourceTabId);
        return existingToolsLeaf.id;
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
      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      showTabById(sourceTabId);
      return nextLeaf.id;
    },
    [activeTabId, findTabContainingLeafId, setTabs, showTabById],
  );

  const createTargetedToolsPanelInActiveTab = useCallback(
    (sourceLeafId?: string | null) => {
      const sourceTabId = sourceLeafId
        ? findTabContainingLeafId(sourceLeafId)?.id ?? activeTabId
        : activeTabId;
      if (!sourceTabId) {
        return null;
      }

      const currentTabs = tabsRef.current;
      const activeIndex = currentTabs.findIndex(
        (tab) => tab.id === sourceTabId,
      );
      if (activeIndex < 0) {
        return null;
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

      targetedPanelLeafIdRef.current = nextLeaf.id;
      setTargetedPanelLeafId(nextLeaf.id);
      showTabById(sourceTabId);
      return nextLeaf.id;
    },
    [
      activeTabId,
      findTabContainingLeafId,
      setTabs,
      setTargetedPanelLeafId,
      showTabById,
      targetedPanelLeafIdRef,
    ],
  );

  const openToolsInTargetedPanel = useCallback(() => {
    const currentTargetedPanelLeafId = targetedPanelLeafIdRef.current;
    if (!currentTargetedPanelLeafId) {
      return null;
    }

    const targetTab = findTabContainingLeafId(currentTargetedPanelLeafId);
    if (!targetTab) {
      return null;
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
    return currentTargetedPanelLeafId;
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
      const pendingTab = tabsRef.current.find(
        (tab) => tab.id === pendingToolsTabId,
      );
      return pendingTab
        ? findFirstLeafWithView(pendingTab.root, "tools")?.id ?? null
        : null;
    }

    const existingToolsTab = tabsRef.current.find((tab) =>
      isDedicatedLeafViewTab(tab, "tools"),
    );
    if (existingToolsTab) {
      pendingActiveTabIdRef.current = null;
      pendingToolsTabScrollRef.current = false;
      pendingToolsTabIdRef.current = null;
      setActiveTabId(existingToolsTab.id);
      return findFirstLeafWithView(existingToolsTab.root, "tools")?.id ?? null;
    }

    const nextTabId = createId();
    const nextLeaf = createLeaf(0, 0, "tools");
    pendingActiveTabIdRef.current = nextTabId;
    pendingToolsTabScrollRef.current = true;
    pendingToolsTabIdRef.current = nextTabId;

    const nextTabs = [
      ...tabsRef.current,
      {
        id: nextTabId,
        title: "Tools",
        root: nextLeaf,
      },
    ];
    tabsRef.current = nextTabs;
    setTabs(nextTabs);
    return nextLeaf.id;
  }, [setActiveTabId, setTabs]);

  const openStudyTool = useCallback(
    (
      tool: StudyWorkspaceTool,
      options?: {
        openSidebar?: boolean;
        sourceLeafId?: string | null;
      },
    ): StudyToolsDestination | null => {
      const destination =
        options?.openSidebar === false
          ? "new-panel"
          : wordVerseSelectionTargetRef.current;

      if (destination === "sidebar") {
        setIsRightSidebarOpen(true);
        setSidebarOpenRequestKey((current) => current + 1);
        showStudyTool(tool);
        return { type: "sidebar" };
      }

      let leafId: string | null;
      if (destination === "targeted-panel") {
        leafId =
          openToolsInTargetedPanel() ??
          createTargetedToolsPanelInActiveTab(options?.sourceLeafId);
      } else if (destination === "new-panel") {
        leafId = ensureToolsPanelInActiveTab(options?.sourceLeafId);
      } else {
        leafId = openToolsTab();
      }
      return leafId ? { type: "panel", leafId } : null;
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
