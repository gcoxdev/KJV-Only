import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { type Book, type VerseToken } from "@/types/bible";
import { matchesMapWord, type AncientMapPayload } from "@/lib/maps";
import {
  loadHitchcocks,
  loadKjvBooks,
  loadMapGeoJson,
  loadOldEnglish,
  loadPhrases,
  loadUnits,
  loadWebsters,
} from "@/lib/reader-data";
import { buildVerseSearchIndex } from "@/lib/search";
import {
  decodeConcordanceReferences,
  chapterVerseKey,
  normalizeConcordanceWord,
  normalizeStrongsCode,
  resolveConcordanceKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolvePhraseKeyForToken,
  resolveUnitsKey,
  resolveWebstersKey,
} from "@/lib/references";
import { normalizeRangePoints } from "@/lib/bookmarks";
import {
  defaultHighlightColor,
  normalizeHighlightColor,
  readableHighlightTextColor,
} from "@/lib/highlight-color";
import { chapterProgressKey, panelViewportElement } from "@/lib/reader-view";
import {
  collectLeafIds,
  countLeaves,
  createId,
  createInitialTab,
  createLeaf,
  directionOrientation,
  findContiguousGroupRootId,
  findLeafNode,
  findNodeById,
  findParentSplitForLeaf,
  insertLeafIntoParentGroup,
  removeLeafNode,
  splitNodeById,
  splitPanelNode,
  swapLeafContent,
  updateLeafNode,
  updateSameOrientationGroupLayout,
  updateSplitOrientation,
  updateSplitRatio,
} from "@/lib/reader-layout";
import {
  buildLeafNeighborMapFromDom,
  type LeafNeighbors,
} from "@/lib/reader-neighbors";
import { parseLayoutHash, serializeLayoutHash } from "@/lib/layout-hash";
import type {
  ConcordancePayload,
  CrossRefsPayload,
  GenealogyPayload,
  GenealogyPerson,
  HitchcocksPayload,
  LeafNode,
  OldEnglishPayload,
  PhraseEntry,
  PhrasesPayload,
  PanelDirection,
  PanelNode,
  ReaderTab,
  SearchPageState,
  SplitOrientation,
  StrongsPayload,
  StudyToolOpenTarget,
  StudyWorkspaceTool,
  TabsOrientation,
  TokenPopupState,
  UnitsEntry,
  UnitsPayload,
  WebstersEntry,
  WebstersPayload,
} from "@/types/reader";
import type { ReaderBookmark } from "@/types/bookmarks";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarOpenRequestSync } from "@/components/reader/sidebar-open-request-sync";
import { SidebarCloseRequestSync } from "@/components/reader/sidebar-close-request-sync";
import { GenealogyPersonDetails } from "@/components/reader/genealogy-person-details";
import { useReferencePreview } from "@/hooks/use-reference-preview";
import { useTabActions } from "@/hooks/use-tab-actions";
import { useMapDialogState } from "@/hooks/use-map-dialog-state";
import { useReaderDerivedState } from "@/hooks/use-reader-derived-state";
import { useDictionarySearchTool } from "@/hooks/use-dictionary-search-tool";
import { useStrongsSearchTool } from "@/hooks/use-strongs-search-tool";
import { useGenealogySearchTool } from "@/hooks/use-genealogy-search-tool";
import { useMapsSearchTool } from "@/hooks/use-maps-search-tool";
import { useConcordanceCrossRefsTool } from "@/hooks/use-concordance-crossrefs-tool";
import { useReaderBookmarks } from "@/hooks/use-reader-bookmarks";
import { useReaderNotes } from "@/hooks/use-reader-notes";
import { useVerseHighlights } from "@/hooks/use-verse-highlights";
import {
  STUDY_ACCORDION_ITEMS,
  deriveStudySidebarState,
} from "@/hooks/use-study-sidebar-state";
import { useReaderShellState } from "@/hooks/use-reader-shell-state";
import { useStudyWorkspaceState } from "@/hooks/use-study-workspace-state";
import { TabsStrip } from "@/components/reader/tabs-strip";
import { TokenPopupCard } from "@/components/reader/token-popup-card";
import { ReaderTopBar } from "@/components/reader/reader-top-bar";
import { TabsWorkspace } from "@/components/reader/tabs-workspace";
import { ReaderStatusScreen } from "@/components/reader/reader-status-screen";
import { ReaderPanelTree } from "@/components/reader/reader-panel-tree";
import { CompletionCelebration } from "@/components/reader/completion-celebration";
import { getStaticPage } from "@/lib/static-pages";
import type { StaticPageId } from "@/types/reader";

const LazyReaderStudySidebar = lazy(async () => {
  const module = await import("@/components/reader/reader-study-sidebar");
  return { default: module.ReaderStudySidebar };
});

const LazyMapAndPhotoDialogs = lazy(async () => {
  const module = await import("@/components/reader/map-and-photo-dialogs");
  return { default: module.MapAndPhotoDialogs };
});

const LazyBookPickerDialog = lazy(async () => {
  const module = await import("@/components/reader/book-picker-dialog");
  return { default: module.BookPickerDialog };
});

const LazyRenameTabDialog = lazy(async () => {
  const module = await import("@/components/reader/rename-tab-dialog");
  return { default: module.RenameTabDialog };
});

const COMPLETION_CELEBRATION_VERSES = [
  {
    reference: "2 Chronicles 15:7",
    text: "Be ye strong therefore, and let not your hands be weak: for your work shall be rewarded.",
  },
  {
    reference: "Psalm 55:22",
    text: "Cast thy burden upon the Lord, and he shall sustain thee: he shall never suffer the righteous to be moved.",
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
  },
  {
    reference: "Proverbs 3:6",
    text: "In all thy ways acknowledge him, and he shall direct thy paths.",
  },
  {
    reference: "Proverbs 16:3",
    text: "Commit thy works unto the Lord, and thy thoughts shall be established.",
  },
  {
    reference: "Ecclesiastes 9:10",
    text: "Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
  },
  {
    reference: "Isaiah 41:10",
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  },
  {
    reference: "Matthew 19:26",
    text: "But Jesus beheld them, and said unto them, With men this is impossible; but with God all things are possible.",
  },
  {
    reference: "Luke 1:37",
    text: "For with God nothing shall be impossible.",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
  },
  {
    reference: "Romans 12:11",
    text: "Not slothful in business; fervent in spirit; serving the Lord;",
  },
  {
    reference: "1 Corinthians 9:24",
    text: "Know ye not that they which run in a race run all, but one receiveth the prize? So run, that ye may obtain.",
  },
  {
    reference: "1 Corinthians 15:58",
    text: "Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.",
  },
  {
    reference: "2 Timothy 4:7",
    text: "I have fought a good fight, I have finished my course, I have kept the faith:",
  },
  {
    reference: "Ephesians 6:10",
    text: "Finally, my brethren, be strong in the Lord, and in the power of his might.",
  },
  {
    reference: "Philippians 3:14",
    text: "I press toward the mark for the prize of the high calling of God in Christ Jesus.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ which strengtheneth me.",
  },
  {
    reference: "Colossians 3:23",
    text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;",
  },
  {
    reference: "2 Thessalonians 3:13",
    text: "But ye, brethren, be not weary in well doing.",
  },
  {
    reference: "Hebrews 10:23",
    text: "Let us hold fast the profession of our faith without wavering; ( for he is faithful that promised;)",
  },
  {
    reference: "Hebrews 12:1",
    text: "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us,",
  },
  {
    reference: "Galatians 6:9",
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
  },
] satisfies ReadonlyArray<{ reference: string; text: string }>;

const LazySettingsDialog = lazy(async () => {
  const module = await import("@/components/reader/settings-dialog");
  return { default: module.SettingsDialog };
});

const LazyProgressDialog = lazy(async () => {
  const module = await import("@/components/reader/progress-dialog");
  return { default: module.ProgressDialog };
});

const LazyGenealogyTreeDialog = lazy(async () => {
  const module = await import("@/components/reader/genealogy-tree-dialog");
  return { default: module.GenealogyTreeDialog };
});

function panelNodeContainsView(
  node: PanelNode,
  view: LeafNode["view"],
): boolean {
  if (node.type === "leaf") {
    return node.view === view;
  }

  return (
    panelNodeContainsView(node.first, view) ||
    panelNodeContainsView(node.second, view)
  );
}

export function KJVReader() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState(16);
  const [highlightColor, setHighlightColor] = useState(defaultHighlightColor);
  const [verseSpacing, setVerseSpacing] = useState(0);
  const [hideReadModeVerseNumbers, setHideReadModeVerseNumbers] =
    useState(false);
  const [readModeParagraphIndent, setReadModeParagraphIndent] = useState(false);
  const [flowVersesByParagraph, setFlowVersesByParagraph] = useState(false);
  const [studyToolOpenTarget, setStudyToolOpenTarget] =
    useState<StudyToolOpenTarget>("sidebar");
  const [sidebarOpenRequestKey, setSidebarOpenRequestKey] = useState(0);
  const [sidebarCloseRequestKey, setSidebarCloseRequestKey] = useState(0);
  const [isCompletionCelebrationOpen, setIsCompletionCelebrationOpen] =
    useState(false);
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const [completionCelebrationVerse, setCompletionCelebrationVerse] = useState(
    COMPLETION_CELEBRATION_VERSES[0],
  );
  const previousBibleCompletionRef = useRef(false);
  const {
    isStudyMode,
    tabsOrientation,
    isRightSidebarOpen,
    isSettingsOpen,
    isProgressOpen,
    isGenealogyTreeOpen,
    genealogyTreePersonId,
    setIsStudyMode,
    setTabsOrientation,
    setIsRightSidebarOpen,
    setIsSettingsOpen,
    setIsProgressOpen,
    setIsGenealogyTreeOpen,
    setGenealogyTreePersonId,
  } = useReaderShellState();
  const [tabs, setTabs] = useState<ReaderTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [tokenPopup, setTokenPopup] = useState<TokenPopupState | null>(null);
  const [fullscreenLeafId, setFullscreenLeafId] = useState<string | null>(null);
  const [panelMenuOpenLeafId, setPanelMenuOpenLeafId] = useState<string | null>(
    null,
  );
  const [bookPickerDialogLeafId, setBookPickerDialogLeafId] = useState<
    string | null
  >(null);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [concordanceWordAccordionValue, setConcordanceWordAccordionValue] =
    useState<string[]>([]);
  const [webstersWordAccordionValue, setWebstersWordAccordionValue] = useState<
    string[]
  >([]);
  const [strongsWordAccordionValue, setStrongsWordAccordionValue] = useState<
    string[]
  >([]);
  const {
    isMapDialogOpen,
    activeMapDialogEntry,
    isMapDialogLoading,
    mapDialogError,
    mapDialogGeoJson,
    onMapDialogOpenChange,
    onCloseMapDialog,
    openMapDialog,
    resetMapDialogState,
  } = useMapDialogState({
    loadMapGeoJsonByFile: loadMapGeoJson,
  });
  const tabEndRef = useRef<HTMLDivElement>(null);
  const strongsSearchInputRef = useRef<HTMLInputElement | null>(null);
  const panelElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previewLeafIdRef = useRef<string | null>(null);
  const addPreviewLeafIdsRef = useRef<string[]>([]);
  const addPreviewDirectionRef = useRef<PanelDirection | null>(null);
  const addPreviewIsGroupRef = useRef(false);
  const orientationPreviewLeafIdsRef = useRef<string[]>([]);
  const fullscreenRequestedLeafIdRef = useRef<string | null>(null);
  const syncedLayoutHashRef = useRef("");
  const domNeighborCacheRef = useRef<{
    root: PanelNode | null;
    neighbors: Map<string, LeafNeighbors>;
  }>({
    root: null,
    neighbors: new Map(),
  });
  const {
    activeTab: studyWorkspaceTab,
    accordionValue: concordanceAccordionValue,
    setActiveTab: setStudyWorkspaceTab,
    showTool: showStudyTool,
    setAccordionValue: setConcordanceAccordionValue,
  } = useStudyWorkspaceState({
    initialAccordionValue: [],
  });

  const {
    highlightedVerseRangesByLeafId,
    clearAllVerseHighlights,
    clearLeafHighlights,
    setLeafHighlights,
    queueVerseHighlight,
    queueVerseHighlights,
    setVerseHighlights,
  } = useVerseHighlights({
    panelElementRefs,
    activeTabId,
    tabsVersion: tabs,
  });

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, [queueVerseHighlights, setTabsOrientation, setVerseHighlights]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("kjv-display-settings-v1");
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as {
        fontSize?: number;
        highlightColor?: string;
        verseSpacing?: number;
        hideReadModeVerseNumbers?: boolean;
        readModeParagraphIndent?: boolean;
        flowVersesByParagraph?: boolean;
        tabsOrientation?: TabsOrientation;
        studyToolOpenTarget?: StudyToolOpenTarget;
      };
      if (typeof parsed.fontSize === "number") {
        setFontSize(Math.max(8, Math.round(parsed.fontSize)));
      }
      if (typeof parsed.highlightColor === "string") {
        setHighlightColor(normalizeHighlightColor(parsed.highlightColor));
      }
      if (typeof parsed.verseSpacing === "number") {
        setVerseSpacing(
          Math.max(0, Math.min(24, Math.round(parsed.verseSpacing))),
        );
      }
      if (typeof parsed.hideReadModeVerseNumbers === "boolean") {
        setHideReadModeVerseNumbers(parsed.hideReadModeVerseNumbers);
      }
      if (typeof parsed.readModeParagraphIndent === "boolean") {
        setReadModeParagraphIndent(parsed.readModeParagraphIndent);
      }
      if (typeof parsed.flowVersesByParagraph === "boolean") {
        setFlowVersesByParagraph(parsed.flowVersesByParagraph);
      }
      if (
        parsed.tabsOrientation === "horizontal" ||
        parsed.tabsOrientation === "vertical"
      ) {
        setTabsOrientation(parsed.tabsOrientation);
      }
      if (
        parsed.studyToolOpenTarget === "sidebar" ||
        parsed.studyToolOpenTarget === "panel" ||
        parsed.studyToolOpenTarget === "tab"
      ) {
        setStudyToolOpenTarget(parsed.studyToolOpenTarget);
      }
    } catch {
      // Ignore malformed persisted display settings.
    }
  }, [setTabsOrientation]);

  useEffect(() => {
    window.localStorage.setItem(
      "kjv-display-settings-v1",
      JSON.stringify({
        fontSize,
        highlightColor,
        verseSpacing,
        hideReadModeVerseNumbers,
        readModeParagraphIndent,
        flowVersesByParagraph,
        tabsOrientation,
        studyToolOpenTarget,
      }),
    );
  }, [
    fontSize,
    highlightColor,
    verseSpacing,
    hideReadModeVerseNumbers,
    readModeParagraphIndent,
    flowVersesByParagraph,
    tabsOrientation,
    studyToolOpenTarget,
  ]);

  useEffect(() => {
    if (!tokenPopup) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-token-popup]")) {
        return;
      }
      setTokenPopup(null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTokenPopup(null);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [tokenPopup]);

  useEffect(() => {
    try {
      const storedProgress = window.localStorage.getItem(
        "kjv-read-chapters-v1",
      );
      if (!storedProgress) {
        return;
      }
      const parsed = JSON.parse(storedProgress) as string[];
      if (Array.isArray(parsed)) {
        setReadChapters(new Set(parsed));
      }
    } catch {
      // Ignore malformed local progress.
    }
  }, [queueVerseHighlights, setTabsOrientation, setVerseHighlights]);

  useEffect(() => {
    window.localStorage.setItem(
      "kjv-read-chapters-v1",
      JSON.stringify(Array.from(readChapters)),
    );
  }, [readChapters]);

  useEffect(() => {
    let cancelled = false;

    async function loadGeneratedData() {
      try {
        const parsedBooks = await loadKjvBooks();
        if (cancelled) {
          return;
        }
        setBooks(parsedBooks);
        const parsedLayout = parseLayoutHash(window.location.hash);
        if (parsedLayout && parsedLayout.tabs.length > 0) {
          setTabs(parsedLayout.tabs);
          setActiveTabId(
            parsedLayout.tabs[parsedLayout.activeTabIndex]?.id ??
              parsedLayout.tabs[0]?.id ??
              null,
          );
          setTabsOrientation(parsedLayout.tabsOrientation);
          setVerseHighlights(parsedLayout.highlightedVerseRangesByLeafId);
          for (const [leafId, ranges] of Object.entries(
            parsedLayout.highlightedVerseRangesByLeafId,
          )) {
            queueVerseHighlights(leafId, ranges);
          }
        } else {
          const initialTab = createInitialTab(1);
          setTabs([initialTab]);
          setActiveTabId(initialTab.id);
        }
        setLoadError(null);
        setIsLoaded(true);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load generated reader data";
          setLoadError(message);
          setIsLoaded(true);
        }
      }
    }

    void loadGeneratedData();

    return () => {
      cancelled = true;
    };
  }, [queueVerseHighlights, setTabsOrientation, setVerseHighlights]);

  useEffect(() => {
    if (!isLoaded || tabs.length === 0) {
      return;
    }
    const nextHash = serializeLayoutHash({
      tabs,
      activeTabId,
      tabsOrientation,
      highlightedVerseRangesByLeafId,
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
    tabs,
    tabsOrientation,
  ]);

  useEffect(() => {
    function onHashChange() {
      const parsed = parseLayoutHash(window.location.hash);
      if (!parsed) {
        return;
      }
      const nextHash = serializeLayoutHash({
        tabs: parsed.tabs,
        activeTabId:
          parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null,
        tabsOrientation: parsed.tabsOrientation,
        highlightedVerseRangesByLeafId: parsed.highlightedVerseRangesByLeafId,
      });
      syncedLayoutHashRef.current = nextHash;
      setTabs(parsed.tabs);
      setActiveTabId(
        parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null,
      );
      setTabsOrientation(parsed.tabsOrientation);
      setVerseHighlights(parsed.highlightedVerseRangesByLeafId);
      for (const [leafId, ranges] of Object.entries(
        parsed.highlightedVerseRangesByLeafId,
      )) {
        queueVerseHighlights(leafId, ranges);
      }
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [queueVerseHighlights, setTabsOrientation, setVerseHighlights]);

  const {
    chapterRefs,
    chapterRefIndex,
    activeTab,
    modelLeafNeighbors,
    existingTabTargets,
    progressByTestament,
    readChapterCountByBook,
    totalProgressPercent,
  } = useReaderDerivedState({
    books,
    tabs,
    activeTabId,
    readChapters,
  });

  useEffect(() => {
    const isComplete =
      progressByTestament.total.total > 0 &&
      progressByTestament.total.read === progressByTestament.total.total;
    const wasComplete = previousBibleCompletionRef.current;
    previousBibleCompletionRef.current = isComplete;

    if (!isComplete || wasComplete) {
      return;
    }

    setCompletionCelebrationVerse(
      COMPLETION_CELEBRATION_VERSES[
        Math.floor(Math.random() * COMPLETION_CELEBRATION_VERSES.length)
      ],
    );
    setIsCompletionCelebrationOpen(true);
    setShowCompletionConfetti(true);

    const timeoutId = window.setTimeout(() => {
      setShowCompletionConfetti(false);
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [progressByTestament.total.total, progressByTestament.total.read]);

  const {
    readerNotes,
    notesContext,
    setNotesContext,
    notesTabStateByLeafId,
    createGeneralNote,
    createContextNote,
    updateNote,
    deleteNote,
    changeNotesTabState,
    initializeNotesTabState,
    generalNotes,
    contextNotes,
  } = useReaderNotes({
    activeTab,
  });

  const {
    readerBookmarks,
    highlightModeEnabledByLeafId,
    setSelectedHighlightScope,
    upsertBookmark,
    updateBookmark,
    deleteBookmark,
    toggleHighlightModeForLeaf,
    disableHighlightModeForLeaf,
    createChapterBookmark,
  } = useReaderBookmarks({
    books,
  });
  const [searchPageStateByLeafId, setSearchPageStateByLeafId] = useState<
    Record<string, SearchPageState>
  >({});

  const createDefaultSearchPageState = useCallback(
    (): SearchPageState => ({
      searchMode: "contains-any",
      caseSensitive: false,
      chipInput: "",
      phraseInput: "",
      isControlsCollapsed: false,
      selectedWords: [],
      expandedBookTree: ["entire", "old", "new"],
      selectedBookIndexes: books.map((_, index) => index),
      results: [],
      error: null,
    }),
    [books],
  );

  const changeSearchPageState = useCallback(
    (leafId: string, patch: Partial<SearchPageState>) => {
      setSearchPageStateByLeafId((current) => ({
        ...current,
        [leafId]: {
          ...(current[leafId] ?? createDefaultSearchPageState()),
          ...patch,
        },
      }));
    },
    [createDefaultSearchPageState],
  );

  const mapWebstersResult = useCallback(
    (key: string, entry: WebstersEntry) => ({ key, entry }),
    [],
  );
  const mapHitchcocksResult = useCallback(
    (key: string, definition: string) => ({ key, definition }),
    [],
  );

  useEffect(() => {
    const activeLeafIds = new Set(
      tabs.flatMap((tab) => collectLeafIds(tab.root)),
    );
    setSearchPageStateByLeafId((current) => {
      const nextEntries = Object.entries(current).filter(([leafId]) =>
        activeLeafIds.has(leafId),
      );
      if (nextEntries.length === Object.keys(current).length) {
        return current;
      }
      return Object.fromEntries(nextEntries);
    });
  }, [tabs]);
  const mapOldEnglishResult = useCallback(
    (key: string, definitions: string[]) => ({ key, definitions }),
    [],
  );
  const mapPhraseResult = useCallback(
    (key: string, entry: PhraseEntry) => ({ key, entry }),
    [],
  );
  const mapUnitsResult = useCallback(
    (key: string, entry: UnitsEntry) => ({ key, entry }),
    [],
  );

  const {
    concordance,
    crossRefs,
    selectedCrossReferences,
    isCrossRefsLoading,
    crossRefsError,
    concordanceSearchTerm,
    isConcordanceSearching,
    isConcordanceLoading,
    concordanceError,
    concordanceSearchResults,
    setSelectedCrossReferences,
    setIsCrossRefsLoading,
    setCrossRefsError,
    setSelectedConcordanceWord,
    setIsConcordanceLoading,
    setConcordanceError,
    ensureConcordanceLoaded,
    ensureCrossRefsLoaded,
    applyConcordanceSearch: applyConcordanceSearchRaw,
  } = useConcordanceCrossRefsTool();

  const applyConcordanceSearch = useCallback(
    (rawValue?: string) => {
      setConcordanceWordAccordionValue([]);
      applyConcordanceSearchRaw(rawValue);
    },
    [applyConcordanceSearchRaw],
  );

  const concordanceWords = useMemo(
    () =>
      concordance
        ? Object.keys(concordance.words).sort((a, b) => a.localeCompare(b))
        : [],
    [concordance],
  );
  const verseSearchIndex = useMemo(() => buildVerseSearchIndex(books), [books]);

  const {
    payload: websters,
    searchTerm: webstersSearchTerm,
    isSearching: isWebstersSearching,
    isLoading: isWebstersLoading,
    error: webstersError,
    results: webstersSearchResults,
    setIsSearching: setIsWebstersSearching,
    setIsLoading: setIsWebstersLoading,
    setError: setWebstersError,
    setSelectedResult: setSelectedWebstersEntry,
    ensureLoaded: ensureWebstersLoaded,
    applySearch: applyWebstersSearchRaw,
  } = useDictionarySearchTool<
    WebstersPayload,
    WebstersEntry,
    { key: string; entry: WebstersEntry }
  >({
    load: loadWebsters,
    errorMessage: "Failed to load Webster's data",
    mapResult: mapWebstersResult,
  });

  const applyWebstersSearch = useCallback(
    (rawValue?: string) => {
      setWebstersWordAccordionValue([]);
      applyWebstersSearchRaw(rawValue);
    },
    [applyWebstersSearchRaw],
  );

  const {
    payload: hitchcocks,
    searchTerm: hitchcocksSearchTerm,
    isSearching: isHitchcocksSearching,
    isLoading: isHitchcocksLoading,
    error: hitchcocksError,
    results: hitchcocksSearchResults,
    setIsSearching: setIsHitchcocksSearching,
    setIsLoading: setIsHitchcocksLoading,
    setError: setHitchcocksError,
    setSelectedResult: setSelectedHitchcocksEntry,
    ensureLoaded: ensureHitchcocksLoaded,
    applySearch: applyHitchcocksSearch,
  } = useDictionarySearchTool<
    HitchcocksPayload,
    string,
    { key: string; definition: string }
  >({
    load: loadHitchcocks,
    errorMessage: "Failed to load Hitchcock's data",
    mapResult: mapHitchcocksResult,
  });

  const {
    payload: oldEnglish,
    searchTerm: oldEnglishSearchTerm,
    isSearching: isOldEnglishSearching,
    isLoading: isOldEnglishLoading,
    error: oldEnglishError,
    results: oldEnglishSearchResults,
    setIsSearching: setIsOldEnglishSearching,
    setIsLoading: setIsOldEnglishLoading,
    setError: setOldEnglishError,
    setSelectedResult: setSelectedOldEnglishEntry,
    ensureLoaded: ensureOldEnglishLoaded,
    applySearch: applyOldEnglishSearch,
  } = useDictionarySearchTool<
    OldEnglishPayload,
    string[],
    { key: string; definitions: string[] }
  >({
    load: loadOldEnglish,
    errorMessage: "Failed to load Old English data",
    mapResult: mapOldEnglishResult,
  });

  const {
    payload: phrases,
    searchTerm: phrasesSearchTerm,
    isSearching: isPhrasesSearching,
    isLoading: isPhrasesLoading,
    error: phrasesError,
    results: phrasesSearchResults,
    setSelectedResult: setSelectedPhrasesEntry,
    ensureLoaded: ensurePhrasesLoaded,
    applySearch: applyPhrasesSearch,
  } = useDictionarySearchTool<
    PhrasesPayload,
    PhraseEntry,
    { key: string; entry: PhraseEntry }
  >({
    load: loadPhrases,
    errorMessage: "Failed to load phrases data",
    mapResult: mapPhraseResult,
    getSearchStrings: (key, entry) => [key, ...(entry.aliases ?? [])],
  });

  const {
    payload: units,
    searchTerm: unitsSearchTerm,
    isSearching: isUnitsSearching,
    isLoading: isUnitsLoading,
    error: unitsError,
    results: unitsSearchResults,
    setSelectedResult: setSelectedUnitsEntry,
    ensureLoaded: ensureUnitsLoaded,
    applySearch: applyUnitsSearch,
  } = useDictionarySearchTool<
    UnitsPayload,
    UnitsEntry,
    { key: string; entry: UnitsEntry }
  >({
    load: loadUnits,
    errorMessage: "Failed to load units data",
    mapResult: mapUnitsResult,
    getSearchStrings: (key, entry) => [key, ...(entry.aliases ?? [])],
  });

  const {
    strongsGreek,
    strongsHebrew,
    strongsSearchTerm,
    isStrongsSearching,
    isStrongsLoading,
    strongsError,
    strongsSearchResults,
    setStrongsSearchTerm,
    setIsStrongsSearching,
    setIsStrongsLoading,
    setStrongsError,
    setSelectedStrongsEntry,
    ensureStrongsLoaded,
    applyStrongsSearch: applyStrongsSearchRaw,
  } = useStrongsSearchTool();

  const applyStrongsSearch = useCallback(
    (rawValue?: string) => {
      setStrongsWordAccordionValue([]);
      applyStrongsSearchRaw(rawValue);
    },
    [applyStrongsSearchRaw],
  );

  const {
    genealogy,
    genealogySearchTerm,
    isGenealogySearching,
    isGenealogyLoading,
    genealogyError,
    genealogyById,
    genealogySearchResults,
    setGenealogySearchTerm,
    setIsGenealogySearching,
    setIsGenealogyLoading,
    setGenealogyError,
    setSelectedGenealogyIds,
    ensureGenealogyLoaded,
    applyGenealogySearch,
  } = useGenealogySearchTool();

  const {
    ancientMaps,
    mapsSearchTerm,
    isMapsSearching,
    isMapsLoading,
    mapsError,
    mapsSearchResults,
    mapsDisplayEntries,
    setIsMapsSearching,
    setIsMapsLoading,
    setMapsError,
    setSelectedMapsEntries,
    ensureAncientMapsLoaded,
    applyMapsSearch: applyMapsSearchRaw,
  } = useMapsSearchTool();

  const applyMapsSearch = useCallback(
    (rawValue?: string) => {
      applyMapsSearchRaw(rawValue);
    },
    [applyMapsSearchRaw],
  );

  useEffect(() => {
    if (isStudyMode) {
      return;
    }
    setIsRightSidebarOpen(false);
    setConcordanceAccordionValue([]);
    setSelectedCrossReferences(null);
    setCrossRefsError(null);
    setIsCrossRefsLoading(false);
    setSelectedConcordanceWord(null);
    setConcordanceError(null);
    setIsConcordanceLoading(false);
    setWebstersError(null);
    setIsWebstersLoading(false);
    setIsWebstersSearching(false);
    setWebstersWordAccordionValue([]);
    setSelectedWebstersEntry(null);
    setHitchcocksError(null);
    setIsHitchcocksLoading(false);
    setIsHitchcocksSearching(false);
    setSelectedHitchcocksEntry(null);
    setOldEnglishError(null);
    setIsOldEnglishLoading(false);
    setIsOldEnglishSearching(false);
    setSelectedOldEnglishEntry(null);
    setGenealogyError(null);
    setIsGenealogyLoading(false);
    setIsGenealogySearching(false);
    setSelectedGenealogyIds([]);
    setStrongsError(null);
    setIsStrongsLoading(false);
    setIsStrongsSearching(false);
    setStrongsWordAccordionValue([]);
    setSelectedStrongsEntry(null);
    setMapsError(null);
    setIsMapsLoading(false);
    setIsMapsSearching(false);
    setSelectedMapsEntries([]);
    resetMapDialogState();
  }, [
    isStudyMode,
    resetMapDialogState,
    setConcordanceAccordionValue,
    setConcordanceError,
    setCrossRefsError,
    setGenealogyError,
    setHitchcocksError,
    setIsConcordanceLoading,
    setIsCrossRefsLoading,
    setIsGenealogyLoading,
    setIsGenealogySearching,
    setIsHitchcocksLoading,
    setIsHitchcocksSearching,
    setIsMapsLoading,
    setIsMapsSearching,
    setIsOldEnglishLoading,
    setIsOldEnglishSearching,
    setIsRightSidebarOpen,
    setIsStrongsLoading,
    setIsStrongsSearching,
    setIsWebstersLoading,
    setIsWebstersSearching,
    setMapsError,
    setOldEnglishError,
    setSelectedConcordanceWord,
    setSelectedCrossReferences,
    setSelectedGenealogyIds,
    setSelectedHitchcocksEntry,
    setSelectedMapsEntries,
    setSelectedOldEnglishEntry,
    setSelectedStrongsEntry,
    setSelectedWebstersEntry,
    setStrongsError,
    setWebstersError,
  ]);

  useEffect(() => {
    domNeighborCacheRef.current = { root: null, neighbors: new Map() };
  }, [activeTab]);
  function updateActiveTab(updater: (tab: ReaderTab) => ReaderTab) {
    if (!activeTabId) {
      return;
    }

    setTabs((currentTabs) =>
      currentTabs.map((tab) => (tab.id === activeTabId ? updater(tab) : tab)),
    );
  }

  function splitLeaf(leafId: string, direction: PanelDirection) {
    updateActiveTab((tab) => {
      const result = splitPanelNode(tab.root, leafId, direction);
      return { ...tab, root: result.next };
    });
  }

  function neighborsForLeaf(leafId: string): LeafNeighbors {
    return modelLeafNeighbors.get(leafId) ?? {};
  }

  function neighborForDirection(leafId: string, direction: PanelDirection) {
    const modelNeighbor = modelLeafNeighbors.get(leafId)?.[direction];
    if (modelNeighbor) {
      return modelNeighbor;
    }

    if (!activeTab) {
      return null;
    }

    if (domNeighborCacheRef.current.root !== activeTab.root) {
      domNeighborCacheRef.current = {
        root: activeTab.root,
        neighbors: buildLeafNeighborMapFromDom(
          activeTab.root,
          panelElementRefs.current,
        ),
      };
    }
    return (
      domNeighborCacheRef.current.neighbors.get(leafId)?.[direction] ?? null
    );
  }

  const panelCardElement = useCallback((leafId: string) => {
    const panelElement = panelElementRefs.current[leafId];
    return (
      panelElement?.querySelector<HTMLElement>(':scope > [data-slot="card"]') ??
      null
    );
  }, []);

  const clearMovePreview = useCallback(() => {
    const previewId = previewLeafIdRef.current;
    if (!previewId) {
      return;
    }

    const previewSurface = panelCardElement(previewId);
    previewSurface?.classList.remove("panel-move-preview-surface");
    previewLeafIdRef.current = null;
  }, [panelCardElement]);

  function applyMovePreview(targetLeafId: string | null) {
    clearMovePreview();
    if (!targetLeafId) {
      return;
    }

    const previewSurface = panelCardElement(targetLeafId);
    if (!previewSurface) {
      return;
    }

    previewSurface.classList.add("panel-move-preview-surface");
    previewLeafIdRef.current = targetLeafId;
  }

  const clearAddPreview = useCallback(() => {
    const leafIds = addPreviewLeafIdsRef.current;
    const direction = addPreviewDirectionRef.current;
    const isGroup = addPreviewIsGroupRef.current;

    if (leafIds.length === 0 || !direction) {
      return;
    }

    for (const leafId of leafIds) {
      const previewSurface = panelCardElement(leafId);
      if (!previewSurface) {
        continue;
      }
      previewSurface.classList.remove("panel-add-preview-target");
      previewSurface.classList.remove(`panel-add-preview-${direction}`);
      if (isGroup) {
        previewSurface.classList.remove("panel-add-preview-group");
      }
    }

    addPreviewLeafIdsRef.current = [];
    addPreviewDirectionRef.current = null;
    addPreviewIsGroupRef.current = false;
  }, [panelCardElement]);

  const clearOrientationPreview = useCallback(() => {
    const leafIds = orientationPreviewLeafIdsRef.current;
    if (leafIds.length === 0) {
      return;
    }

    for (const leafId of leafIds) {
      const previewSurface = panelCardElement(leafId);
      previewSurface?.classList.remove("panel-orientation-preview");
    }

    orientationPreviewLeafIdsRef.current = [];
  }, [panelCardElement]);

  const clearAllPanelPreviews = useCallback(() => {
    clearMovePreview();
    clearAddPreview();
    clearOrientationPreview();
  }, [clearAddPreview, clearMovePreview, clearOrientationPreview]);

  useEffect(() => {
    function onFullscreenChange() {
      const element = document.fullscreenElement as HTMLElement | null;
      const leafId = element
        ? (fullscreenRequestedLeafIdRef.current ?? null)
        : null;
      setFullscreenLeafId(leafId);
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
      if (!element) {
        fullscreenRequestedLeafIdRef.current = null;
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [clearAllPanelPreviews]);

  useEffect(() => {
    if (!panelMenuOpenLeafId || !activeTab) {
      return;
    }

    if (!findLeafNode(activeTab.root, panelMenuOpenLeafId)) {
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
    }
  }, [activeTab, clearAllPanelPreviews, panelMenuOpenLeafId]);

  function applyAddPreview(
    leafIds: string[],
    direction: PanelDirection,
    isGroup: boolean,
  ) {
    clearAddPreview();
    if (leafIds.length === 0) {
      return;
    }

    const appliedLeafIds: string[] = [];
    for (const leafId of leafIds) {
      const previewSurface = panelCardElement(leafId);
      if (!previewSurface) {
        continue;
      }
      previewSurface.classList.add("panel-add-preview-target");
      previewSurface.classList.add(`panel-add-preview-${direction}`);
      if (isGroup) {
        previewSurface.classList.add("panel-add-preview-group");
      }
      appliedLeafIds.push(leafId);
    }

    addPreviewLeafIdsRef.current = appliedLeafIds;
    addPreviewDirectionRef.current = direction;
    addPreviewIsGroupRef.current = isGroup;
  }

  function setMovePreviewTarget(leafId: string, direction: PanelDirection) {
    clearAddPreview();
    clearOrientationPreview();
    const targetLeafId = neighborForDirection(leafId, direction);
    applyMovePreview(targetLeafId);
  }

  function setAddPreviewTarget(leafId: string, direction: PanelDirection) {
    clearMovePreview();
    clearOrientationPreview();
    applyAddPreview([leafId], direction, false);
  }

  function setGroupInsertPreviewTarget(
    leafId: string,
    direction: PanelDirection,
  ) {
    clearMovePreview();
    clearOrientationPreview();
    if (!activeTab) {
      return;
    }

    const parentSplit = findParentSplitForLeaf(activeTab.root, leafId);
    if (
      !parentSplit ||
      parentSplit.orientation !== directionOrientation(direction)
    ) {
      return;
    }

    applyAddPreview([leafId], direction, true);
  }

  function setAroundGroupPreviewTarget(
    leafId: string,
    direction: PanelDirection,
  ) {
    clearMovePreview();
    clearOrientationPreview();
    if (!activeTab) {
      return;
    }

    const parentSplit = findParentSplitForLeaf(activeTab.root, leafId);
    if (!parentSplit) {
      return;
    }

    const targetOrientation = parentSplit.orientation;
    if (targetOrientation === directionOrientation(direction)) {
      return;
    }

    const targetNodeId = findContiguousGroupRootId(
      activeTab.root,
      leafId,
      targetOrientation,
    );
    if (!targetNodeId) {
      return;
    }

    const targetNode = findNodeById(activeTab.root, targetNodeId);
    if (!targetNode) {
      return;
    }

    const targetLeafIds = collectLeafIds(targetNode);
    const allRects = targetLeafIds
      .map((id) => panelElementRefs.current[id]?.getBoundingClientRect())
      .filter((item): item is DOMRect => Boolean(item));
    if (allRects.length === 0) {
      return;
    }

    const epsilon = 0.5;
    const minLeft = Math.min(...allRects.map((item) => item.left));
    const maxRight = Math.max(...allRects.map((item) => item.right));
    const minTop = Math.min(...allRects.map((item) => item.top));
    const maxBottom = Math.max(...allRects.map((item) => item.bottom));

    const edgeLeafIds = targetLeafIds.filter((targetLeafId) => {
      const panelElement = panelElementRefs.current[targetLeafId];
      const rect = panelElement?.getBoundingClientRect();
      if (!rect) {
        return false;
      }
      if (direction === "left") {
        return Math.abs(rect.left - minLeft) <= epsilon;
      }
      if (direction === "right") {
        return Math.abs(rect.right - maxRight) <= epsilon;
      }
      if (direction === "up") {
        return Math.abs(rect.top - minTop) <= epsilon;
      }
      return Math.abs(rect.bottom - maxBottom) <= epsilon;
    });

    applyAddPreview(edgeLeafIds, direction, true);
  }

  function setOrientationPreviewTarget(leafId: string) {
    clearMovePreview();
    clearAddPreview();
    clearOrientationPreview();
    if (!activeTab) {
      return;
    }

    const parentSplit = findParentSplitForLeaf(activeTab.root, leafId);
    if (!parentSplit) {
      return;
    }

    const leafIds = collectLeafIds(parentSplit);
    for (const id of leafIds) {
      const previewSurface = panelCardElement(id);
      previewSurface?.classList.add("panel-orientation-preview");
    }
    orientationPreviewLeafIdsRef.current = leafIds;
  }

  function insertPanelInGroup(leafId: string, direction: PanelDirection) {
    if (!activeTab) {
      return;
    }

    const parentSplit = findParentSplitForLeaf(activeTab.root, leafId);
    if (
      !parentSplit ||
      parentSplit.orientation !== directionOrientation(direction)
    ) {
      return;
    }

    updateActiveTab((tab) => {
      const result = insertLeafIntoParentGroup(tab.root, leafId, direction);
      return result.changed ? { ...tab, root: result.next } : tab;
    });
  }

  function addAroundGroup(leafId: string, direction: PanelDirection) {
    if (!activeTab) {
      return;
    }

    const parentSplit = findParentSplitForLeaf(activeTab.root, leafId);
    if (!parentSplit) {
      return;
    }

    const targetOrientation = parentSplit.orientation;
    if (targetOrientation === directionOrientation(direction)) {
      return;
    }

    const targetNodeId = findContiguousGroupRootId(
      activeTab.root,
      leafId,
      targetOrientation,
    );
    if (!targetNodeId) {
      return;
    }

    updateActiveTab((tab) => {
      const result = splitNodeById(tab.root, targetNodeId, direction);
      return result.changed ? { ...tab, root: result.next } : tab;
    });
  }

  function toggleParentGroupOrientation(leafId: string) {
    if (!activeTab) {
      return;
    }

    const parentSplit = findParentSplitForLeaf(activeTab.root, leafId);
    if (!parentSplit) {
      return;
    }

    const nextOrientation: SplitOrientation =
      parentSplit.orientation === "horizontal" ? "vertical" : "horizontal";

    updateActiveTab((tab) => ({
      ...tab,
      root: updateSplitOrientation(tab.root, parentSplit.id, nextOrientation),
    }));
  }

  function moveLeaf(leafId: string, direction: PanelDirection) {
    if (!activeTab) {
      return;
    }
    const targetLeafId = neighborForDirection(leafId, direction);
    if (!targetLeafId) {
      return;
    }

    updateActiveTab((tab) => ({
      ...tab,
      root: swapLeafContent(tab.root, leafId, targetLeafId),
    }));
    clearAllPanelPreviews();
  }

  function closeLeaf(leafId: string) {
    updateActiveTab((tab) => {
      if (countLeaves(tab.root) <= 1) {
        return tab;
      }
      const result = removeLeafNode(tab.root, leafId);
      return result.next ? { ...tab, root: result.next } : tab;
    });
    if (fullscreenLeafId === leafId && document.fullscreenElement) {
      void document.exitFullscreen();
    }
  }

  function updateLeafLocation(
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
  ) {
    const shouldResetScroll =
      patch.bookIndex !== undefined || patch.chapterIndex !== undefined;

    if (shouldResetScroll) {
      clearLeafHighlights(leafId);
      setSelectedHighlightScope(null);
    }

    updateActiveTab((tab) => ({
      ...tab,
      root: updateLeafNode(tab.root, leafId, patch),
    }));

    if (!shouldResetScroll) {
      return;
    }

    // Wait for React to commit the chapter/book change before forcing scroll top.
    requestAnimationFrame(() => {
      const panelElement = panelElementRefs.current[leafId];
      const viewport = panelViewportElement(panelElement);
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }

  function moveLeafChapter(leafId: string, direction: -1 | 1) {
    if (!activeTab) {
      return;
    }

    const leaf = findLeafNode(activeTab.root, leafId);
    if (!leaf) {
      return;
    }

    const key = `${leaf.bookIndex}-${leaf.chapterIndex}`;
    const currentIndex = chapterRefIndex.get(key);
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
  }

  function openChapterInNewTab(bookIndex: number, chapterIndex: number) {
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
    setIsProgressOpen(false);
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }

  const openSearchTab = useCallback(() => {
    const nextTabId = createId();
    const nextLeaf = createLeaf(0, 0, "search");
    const nextSearchNumber =
      tabs.filter((tab) => tab.title.toLowerCase().startsWith("search"))
        .length + 1;
    const nextSearchTitle =
      nextSearchNumber === 1 ? "Search" : `Search ${nextSearchNumber}`;
    setTabs((currentTabs) => [
      ...currentTabs,
      {
        id: nextTabId,
        title: nextSearchTitle,
        root: nextLeaf,
      },
    ]);
    setSearchPageStateByLeafId((current) => ({
      ...current,
      [nextLeaf.id]: createDefaultSearchPageState(),
    }));
    setActiveTabId(nextTabId);
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }, [createDefaultSearchPageState, tabs, tabsOrientation]);

  const shareLayout = useCallback(async () => {
    const href = window.location.href;
    try {
      await navigator.clipboard.writeText(href);
      setIsShareCopied(true);
      window.setTimeout(() => {
        setIsShareCopied(false);
      }, 1500);
    } catch {
      setIsShareCopied(false);
    }
  }, []);

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
      requestAnimationFrame(() => {
        tabEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: tabsOrientation === "vertical" ? "end" : "nearest",
          inline: tabsOrientation === "vertical" ? "nearest" : "end",
        });
      });
    },
    [tabsOrientation],
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
        filter: selectedNoteId ? "all" : "context",
        context: notesContext,
      });
      setActiveTabId(nextTabId);
      requestAnimationFrame(() => {
        tabEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: tabsOrientation === "vertical" ? "end" : "nearest",
          inline: tabsOrientation === "vertical" ? "nearest" : "end",
        });
      });
    },
    [initializeNotesTabState, notesContext, readerNotes, tabsOrientation],
  );

  const ensureToolsPanelInActiveTab = useCallback(() => {
    if (!activeTabId) {
      return;
    }

    setTabs((currentTabs) => {
      const activeIndex = currentTabs.findIndex((tab) => tab.id === activeTabId);
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

  const openToolsTab = useCallback(() => {
    let targetTabId: string | null = null;
    let created = false;

    setTabs((currentTabs) => {
      const existingToolsTab = currentTabs.find((tab) =>
        panelNodeContainsView(tab.root, "tools"),
      );
      if (existingToolsTab) {
        targetTabId = existingToolsTab.id;
        return currentTabs;
      }

      const nextTabId = createId();
      const nextLeaf = createLeaf(0, 0, "tools");
      targetTabId = nextTabId;
      created = true;
      return [
        ...currentTabs,
        {
          id: nextTabId,
          title: "Tools",
          root: nextLeaf,
        },
      ];
    });

    if (!targetTabId) {
      return;
    }

    setActiveTabId(targetTabId);
    if (!created) {
      return;
    }

    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }, [setActiveTabId, setTabs, tabsOrientation]);

  function openBookmarkInNewTab(bookmark: ReaderBookmark) {
    if (bookmark.scope.type === "chapter") {
      openChapterInNewTab(
        bookmark.scope.bookIndex,
        bookmark.scope.chapterIndex,
      );
      return;
    }

    if (bookmark.scope.type === "verse") {
      openChapterReferenceInNewTab(
        bookmark.scope.bookIndex,
        bookmark.scope.chapterIndex,
        bookmark.scope.verseNumber,
        bookmark.scope.verseNumber,
      );
      return;
    }

    if (bookmark.scope.type === "selection") {
      openChapterHighlightsInNewTab(
        bookmark.scope.bookIndex,
        bookmark.scope.chapterIndex,
        bookmark.scope.ranges,
      );
      return;
    }

    const normalized = normalizeRangePoints(
      bookmark.scope.start,
      bookmark.scope.end,
    );
    const isSameChapter =
      normalized.start.bookIndex === normalized.end.bookIndex &&
      normalized.start.chapterIndex === normalized.end.chapterIndex;
    openChapterReferenceInNewTab(
      normalized.start.bookIndex,
      normalized.start.chapterIndex,
      normalized.start.verseNumber,
      isSameChapter ? normalized.end.verseNumber : normalized.start.verseNumber,
    );
  }

  const openChapterReferenceInNewTab = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd = verseStart,
    ) => {
      clearAllVerseHighlights();
      setSelectedHighlightScope(null);
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
      queueVerseHighlight(nextLeaf.id, { start: verseStart, end: verseEnd });
      setActiveTabId(nextTabId);
      setIsProgressOpen(false);
      requestAnimationFrame(() => {
        tabEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: tabsOrientation === "vertical" ? "end" : "nearest",
          inline: tabsOrientation === "vertical" ? "nearest" : "end",
        });
      });
    },
    [
      clearAllVerseHighlights,
      queueVerseHighlight,
      setIsProgressOpen,
      setSelectedHighlightScope,
      tabsOrientation,
    ],
  );

  const openChapterHighlightsInNewTab = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      ranges: Array<{ start: number; end: number }>,
    ) => {
      clearAllVerseHighlights();
      setSelectedHighlightScope(null);
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
      queueVerseHighlights(nextLeaf.id, ranges);
      setActiveTabId(nextTabId);
      setIsProgressOpen(false);
      requestAnimationFrame(() => {
        tabEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: tabsOrientation === "vertical" ? "end" : "nearest",
          inline: tabsOrientation === "vertical" ? "nearest" : "end",
        });
      });
    },
    [
      clearAllVerseHighlights,
      queueVerseHighlights,
      setIsProgressOpen,
      setSelectedHighlightScope,
      tabsOrientation,
    ],
  );

  const handleClearLeafHighlights = useCallback(
    (leafId: string) => {
      clearLeafHighlights(leafId);
      setSelectedHighlightScope(null);
    },
    [clearLeafHighlights, setSelectedHighlightScope],
  );

  function setAllBookChaptersRead(bookIndex: number, isRead: boolean) {
    const book = books[bookIndex];
    if (!book) {
      return;
    }
    setReadChapters((current) => {
      const next = new Set(current);
      for (
        let chapterIndex = 0;
        chapterIndex < book.chapters.length;
        chapterIndex += 1
      ) {
        const key = chapterProgressKey(bookIndex, chapterIndex);
        if (isRead) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
  }

  function setAllTestamentChaptersRead(
    testament: "old" | "new",
    isRead: boolean,
  ) {
    const startIndex = testament === "old" ? 0 : 39;
    const endIndex =
      testament === "old" ? Math.min(39, books.length) : books.length;

    setReadChapters((current) => {
      const next = new Set(current);
      for (let bookIndex = startIndex; bookIndex < endIndex; bookIndex += 1) {
        const book = books[bookIndex];
        if (!book) {
          continue;
        }
        for (
          let chapterIndex = 0;
          chapterIndex < book.chapters.length;
          chapterIndex += 1
        ) {
          const key = chapterProgressKey(bookIndex, chapterIndex);
          if (isRead) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }
      }
      return next;
    });
  }

  function updateSplitSize(splitId: string, ratio: number) {
    updateActiveTab((tab) => ({
      ...tab,
      root: updateSplitRatio(tab.root, splitId, ratio),
    }));
  }

  function updateSplitGroupLayout(
    groupRootId: string,
    orientation: SplitOrientation,
    sizes: number[],
  ) {
    updateActiveTab((tab) => ({
      ...tab,
      root: updateSameOrientationGroupLayout(
        tab.root,
        groupRootId,
        orientation,
        sizes,
      ),
    }));
  }

  function toggleChapterRead(bookIndex: number, chapterIndex: number) {
    const key = chapterProgressKey(bookIndex, chapterIndex);
    setReadChapters((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function resetAllProgress() {
    setReadChapters(new Set());
    setIsCompletionCelebrationOpen(false);
    setShowCompletionConfetti(false);
  }

  const {
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
  } = useTabActions({
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    tabsOrientation,
    tabEndRef,
    clearAllPanelPreviews,
  });

  const openStudyTool = useCallback(
    (tool: StudyWorkspaceTool, options?: { openSidebar?: boolean }) => {
      const destination =
        options?.openSidebar === false ? "panel" : studyToolOpenTarget;

      if (destination === "sidebar") {
        setIsRightSidebarOpen(true);
        setSidebarOpenRequestKey((current) => current + 1);
      } else if (destination === "panel") {
        ensureToolsPanelInActiveTab();
      } else {
        openToolsTab();
      }
      showStudyTool(tool);
    },
    [
      ensureToolsPanelInActiveTab,
      openToolsTab,
      setIsRightSidebarOpen,
      showStudyTool,
      studyToolOpenTarget,
    ],
  );

  const resolvePhraseSelectionAtLocation = useCallback(
    (
      phraseData: PhrasesPayload | null,
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
      tokenIndex: number,
    ) => {
      if (!phraseData) {
        return null;
      }
      const verse = books[bookIndex]?.chapters[chapterIndex]?.verses.find(
        (item) => item.verse === verseNumber,
      );
      if (!verse) {
        return null;
      }
      const matchedKey = resolvePhraseKeyForToken(
        phraseData,
        verse.tokens,
        tokenIndex,
      );
      return matchedKey
        ? { key: matchedKey, entry: phraseData[matchedKey] }
        : null;
    },
    [books],
  );

  const syncTokenAccordionState = useCallback(
    (
      rawWord: string,
      options?: {
        verseNumber?: number | null;
        bookIndex?: number;
        chapterIndex?: number;
        strongCode?: string | null;
        concordanceData?: ConcordancePayload | null;
        webstersData?: WebstersPayload | null;
        hitchcocksData?: HitchcocksPayload | null;
        oldEnglishData?: OldEnglishPayload | null;
        phraseSelection?: { key: string; entry: PhraseEntry } | null;
        unitsData?: UnitsPayload | null;
        genealogyData?: GenealogyPayload | null;
        ancientMapsData?: AncientMapPayload | null;
        strongsGreekData?: StrongsPayload | null;
        strongsHebrewData?: StrongsPayload | null;
      },
    ) => {
      const nextAccordion: string[] = [];

      if ((options?.verseNumber ?? null) !== null) {
        nextAccordion.push("cross-refs");
      }

      const concordanceData = options?.concordanceData ?? concordance;
      if (concordanceData) {
        const matchedKey = resolveConcordanceKey(concordanceData, rawWord);
        const references = matchedKey
          ? decodeConcordanceReferences(concordanceData, matchedKey)
          : [];
        if (references.length > 0) {
          nextAccordion.push("concordance");
        }
      }

      const webstersData = options?.webstersData ?? websters;
      if (webstersData && resolveWebstersKey(webstersData, rawWord)) {
        nextAccordion.push("websters");
      }

      const strongCode = options?.strongCode ?? null;
      const strongsGreekData = options?.strongsGreekData ?? strongsGreek;
      const strongsHebrewData = options?.strongsHebrewData ?? strongsHebrew;
      if (strongCode && strongsGreekData && strongsHebrewData) {
        const source = strongCode.startsWith("G")
          ? strongsGreekData
          : strongsHebrewData;
        if (source[strongCode]) {
          nextAccordion.push("strongs");
        }
      }

      const ancientMapsData = options?.ancientMapsData ?? ancientMaps;
      if (
        ancientMapsData &&
        ancientMapsData.some((entry) =>
          matchesMapWord(entry, rawWord, normalizeConcordanceWord),
        )
      ) {
        nextAccordion.push("maps");
      }

      const hitchcocksData = options?.hitchcocksData ?? hitchcocks;
      if (hitchcocksData && resolveHitchcocksKey(hitchcocksData, rawWord)) {
        nextAccordion.push("hitchcocks");
      }

      const oldEnglishData = options?.oldEnglishData ?? oldEnglish;
      if (oldEnglishData && resolveOldEnglishKey(oldEnglishData, rawWord)) {
        nextAccordion.push("old-english");
      }

      if (options?.phraseSelection) {
        nextAccordion.push("phrases");
      }

      const unitsData = options?.unitsData ?? units;
      if (unitsData && resolveUnitsKey(unitsData, rawWord)) {
        nextAccordion.push("units");
      }

      const genealogyData = options?.genealogyData ?? genealogy;
      if (
        genealogyData &&
        genealogyData.some((person) =>
          person.names.some(
            (name) =>
              normalizeConcordanceWord(name).toLowerCase() ===
              rawWord.toLowerCase(),
          ),
        )
      ) {
        nextAccordion.push("genealogy");
      }

      setConcordanceAccordionValue(nextAccordion);
    },
    [
      ancientMaps,
      concordance,
      genealogy,
      hitchcocks,
      oldEnglish,
      units,
      setConcordanceAccordionValue,
      strongsGreek,
      strongsHebrew,
      websters,
    ],
  );

  const syncWordStudySelections = useCallback(
    (
      rawWord: string,
      strongCode: string | null,
      overrides?: {
        websters?: WebstersPayload | null;
        hitchcocks?: HitchcocksPayload | null;
        oldEnglish?: OldEnglishPayload | null;
        phrasesSelection?: { key: string; entry: PhraseEntry } | null;
        units?: UnitsPayload | null;
        genealogy?: GenealogyPayload | null;
        ancientMaps?: AncientMapPayload | null;
        strongsGreek?: StrongsPayload | null;
        strongsHebrew?: StrongsPayload | null;
      },
    ) => {
      const nextWebsters = overrides?.websters ?? websters;
      const nextHitchcocks = overrides?.hitchcocks ?? hitchcocks;
      const nextOldEnglish = overrides?.oldEnglish ?? oldEnglish;
      const nextUnits = overrides?.units ?? units;
      const nextGenealogy = overrides?.genealogy ?? genealogy;
      const nextAncientMaps = overrides?.ancientMaps ?? ancientMaps;
      const nextStrongsGreek = overrides?.strongsGreek ?? strongsGreek;
      const nextStrongsHebrew = overrides?.strongsHebrew ?? strongsHebrew;

      if (nextWebsters) {
        const matchedKey = resolveWebstersKey(nextWebsters, rawWord);
        setWebstersWordAccordionValue([]);
        setSelectedWebstersEntry(
          matchedKey
            ? { key: matchedKey, entry: nextWebsters[matchedKey] }
            : null,
        );
      } else {
        setSelectedWebstersEntry(null);
      }

      if (nextHitchcocks) {
        const matchedKey = resolveHitchcocksKey(nextHitchcocks, rawWord);
        setSelectedHitchcocksEntry(
          matchedKey
            ? { key: matchedKey, definition: nextHitchcocks[matchedKey] }
            : null,
        );
      } else {
        setSelectedHitchcocksEntry(null);
      }

      if (nextOldEnglish) {
        const matchedKey = resolveOldEnglishKey(nextOldEnglish, rawWord);
        setSelectedOldEnglishEntry(
          matchedKey
            ? {
                key: matchedKey,
                definitions: nextOldEnglish[matchedKey] ?? [],
              }
            : null,
        );
      } else {
        setSelectedOldEnglishEntry(null);
      }

      setSelectedPhrasesEntry(overrides?.phrasesSelection ?? null);

      if (nextUnits) {
        const matchedKey = resolveUnitsKey(nextUnits, rawWord);
        setSelectedUnitsEntry(
          matchedKey ? { key: matchedKey, entry: nextUnits[matchedKey] } : null,
        );
      } else {
        setSelectedUnitsEntry(null);
      }

      if (nextGenealogy) {
        const matches = nextGenealogy.filter((person) =>
          person.names.some(
            (name) =>
              normalizeConcordanceWord(name).toLowerCase() ===
              rawWord.toLowerCase(),
          ),
        );
        setSelectedGenealogyIds([...new Set(matches.map((person) => person.id))]);
      } else {
        setSelectedGenealogyIds([]);
      }

      if (nextAncientMaps) {
        setSelectedMapsEntries(
          nextAncientMaps.filter((entry) =>
            matchesMapWord(entry, rawWord, normalizeConcordanceWord),
          ),
        );
      } else {
        setSelectedMapsEntries([]);
      }

      if (!strongCode) {
        setStrongsWordAccordionValue([]);
        setSelectedStrongsEntry(null);
        return;
      }

      if (!nextStrongsGreek || !nextStrongsHebrew) {
        return;
      }

      const source = strongCode.startsWith("G")
        ? nextStrongsGreek
        : nextStrongsHebrew;
      const entry = source[strongCode];
      setStrongsWordAccordionValue([]);
      setSelectedStrongsEntry(
        entry
          ? {
              code: strongCode,
              testament: strongCode.startsWith("G") ? "greek" : "hebrew",
              entry,
            }
          : null,
      );
    },
    [
      ancientMaps,
      genealogy,
      hitchcocks,
      oldEnglish,
      units,
      setSelectedGenealogyIds,
      setSelectedHitchcocksEntry,
      setSelectedMapsEntries,
      setSelectedOldEnglishEntry,
      setSelectedPhrasesEntry,
      setSelectedUnitsEntry,
      setSelectedStrongsEntry,
      setSelectedWebstersEntry,
      strongsGreek,
      strongsHebrew,
      websters,
    ],
  );

  const openLinkedStrongsEntry = useCallback(
    (code: string) => {
      setStrongsError(null);
      setIsStrongsSearching(false);
      setStrongsSearchTerm("");
      setStrongsWordAccordionValue([code]);
      if (strongsSearchInputRef.current) {
        strongsSearchInputRef.current.value = "";
      }

      const applySelection = (
        greek: StrongsPayload,
        hebrew: StrongsPayload,
      ) => {
        const source = code.startsWith("G") ? greek : hebrew;
        const entry = source[code];
        if (!entry) {
          setSelectedStrongsEntry(null);
          return;
        }

        setSelectedStrongsEntry({
          code,
          testament: code.startsWith("G") ? "greek" : "hebrew",
          entry,
        });
        openStudyTool("strongs");
      };

      if (strongsGreek && strongsHebrew) {
        applySelection(strongsGreek, strongsHebrew);
        return;
      }

      setIsStrongsLoading(true);
      void ensureStrongsLoaded()
        .then(({ greek, hebrew }) => {
          applySelection(greek, hebrew);
        })
        .catch((error) => {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load Strong's data";
          setStrongsError(message);
          setSelectedStrongsEntry(null);
        })
        .finally(() => {
          setIsStrongsLoading(false);
        });
    },
    [
      ensureStrongsLoaded,
      openStudyTool,
      setIsStrongsLoading,
      setIsStrongsSearching,
      setSelectedStrongsEntry,
      setStrongsError,
      setStrongsSearchTerm,
      strongsGreek,
      strongsHebrew,
    ],
  );

  const openCrossReferencesForVerse = useCallback(
    (bookIndex: number, chapterIndex: number, verseNumber: number) => {
      setNotesContext({
        bookIndex,
        chapterIndex,
        verseNumber,
      });
      const key = chapterVerseKey(bookIndex, chapterIndex, verseNumber);

      openStudyTool("cross-refs");
      setCrossRefsError(null);
      setIsCrossRefsLoading(true);

      const applyCrossRefsSelection = (data: CrossRefsPayload) => {
        setSelectedCrossReferences({
          key,
          references: data[key] ?? [],
        });
        setIsCrossRefsLoading(false);
      };

      if (crossRefs) {
        applyCrossRefsSelection(crossRefs);
      } else {
        void ensureCrossRefsLoaded()
          .then((data) => {
            applyCrossRefsSelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load cross-reference data";
            setCrossRefsError(message);
            setIsCrossRefsLoading(false);
          });
      }
    },
    [
      crossRefs,
      ensureCrossRefsLoaded,
      openStudyTool,
      setCrossRefsError,
      setIsCrossRefsLoading,
      setNotesContext,
      setSelectedCrossReferences,
    ],
  );

  const handleVerseSelection = useCallback(
    (
      leafId: string,
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
    ) => {
      const highlightModeEnabled = Boolean(
        highlightModeEnabledByLeafId[leafId],
      );
      if (!highlightModeEnabled) {
        openCrossReferencesForVerse(bookIndex, chapterIndex, verseNumber);
        return;
      }

      setNotesContext({ bookIndex, chapterIndex, verseNumber });
      const existingRanges = highlightedVerseRangesByLeafId[leafId] ?? [];
      const selectedVerses = new Set<number>();
      for (const range of existingRanges) {
        for (let current = range.start; current <= range.end; current += 1) {
          selectedVerses.add(current);
        }
      }

      const nextSelectedVerses = new Set(selectedVerses);
      if (nextSelectedVerses.has(verseNumber)) {
        nextSelectedVerses.delete(verseNumber);
      } else {
        nextSelectedVerses.add(verseNumber);
      }

      const nextRanges = Array.from(nextSelectedVerses)
        .sort((left, right) => left - right)
        .reduce<Array<{ start: number; end: number }>>((ranges, current) => {
          const previous = ranges[ranges.length - 1];
          if (!previous || current > previous.end + 1) {
            ranges.push({ start: current, end: current });
          } else {
            previous.end = current;
          }
          return ranges;
        }, []);

      setLeafHighlights(leafId, nextRanges);

      if (nextRanges.length === 1) {
        const onlyRange = nextRanges[0];
        if (onlyRange.start === onlyRange.end) {
          setSelectedHighlightScope({
            type: "verse",
            bookIndex,
            chapterIndex,
            verseNumber: onlyRange.start,
          });
        } else {
          setSelectedHighlightScope({
            type: "range",
            start: {
              bookIndex,
              chapterIndex,
              verseNumber: onlyRange.start,
            },
            end: {
              bookIndex,
              chapterIndex,
              verseNumber: onlyRange.end,
            },
          });
        }
      } else {
        setSelectedHighlightScope(null);
      }
    },
    [
      highlightedVerseRangesByLeafId,
      highlightModeEnabledByLeafId,
      openCrossReferencesForVerse,
      setLeafHighlights,
      setNotesContext,
      setSelectedHighlightScope,
    ],
  );

  const bookmarkLeafSelection = useCallback(
    (leafId: string) => {
      let matchedLeaf: LeafNode | null = null;
      for (const tab of tabs) {
        const leaf = findLeafNode(tab.root, leafId);
        if (leaf?.view === "reader") {
          matchedLeaf = leaf;
          break;
        }
      }

      if (!matchedLeaf) {
        return;
      }

      const ranges = highlightedVerseRangesByLeafId[leafId] ?? [];
      if (ranges.length === 0) {
        createChapterBookmark(matchedLeaf.bookIndex, matchedLeaf.chapterIndex);
        return;
      }

      if (ranges.length === 1) {
        const [range] = ranges;
        if (range.start === range.end) {
          upsertBookmark({
            type: "verse",
            bookIndex: matchedLeaf.bookIndex,
            chapterIndex: matchedLeaf.chapterIndex,
            verseNumber: range.start,
          });
          return;
        }
        upsertBookmark({
          type: "range",
          start: {
            bookIndex: matchedLeaf.bookIndex,
            chapterIndex: matchedLeaf.chapterIndex,
            verseNumber: range.start,
          },
          end: {
            bookIndex: matchedLeaf.bookIndex,
            chapterIndex: matchedLeaf.chapterIndex,
            verseNumber: range.end,
          },
        });
        return;
      }

      upsertBookmark({
        type: "selection",
        bookIndex: matchedLeaf.bookIndex,
        chapterIndex: matchedLeaf.chapterIndex,
        ranges,
      });
    },
    [
      createChapterBookmark,
      highlightedVerseRangesByLeafId,
      tabs,
      upsertBookmark,
    ],
  );

  const closeRightSidebarForMobile = useCallback(() => {
    setSidebarCloseRequestKey((current) => current + 1);
  }, []);

  const openTokenDetailsFromElement = useCallback(
    (
      element: HTMLElement,
      token: VerseToken,
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
      tokenIndex: number,
    ) => {
      if (!token.strong) {
        const rect = element.getBoundingClientRect();
        const popupWidth = 280;
        const safeX = Math.max(
          8,
          Math.min(window.innerWidth - popupWidth - 8, rect.left),
        );
        const safeY = Math.min(window.innerHeight - 180, rect.bottom + 8);
        setTokenPopup({
          token,
          x: safeX,
          y: safeY,
        });
      } else {
        setTokenPopup(null);
      }

      const rawWord = normalizeConcordanceWord(token.text);
      if (Number.isFinite(verseNumber) && verseNumber > 0) {
        openCrossReferencesForVerse(bookIndex, chapterIndex, verseNumber);
        if (rawWord) {
          setNotesContext({
            bookIndex,
            chapterIndex,
            verseNumber,
            word: rawWord,
          });
        }
      } else if (rawWord) {
        setNotesContext({
          bookIndex,
          chapterIndex,
          word: rawWord,
        });
      }

      if (!rawWord) {
        return;
      }

      const normalizedCode = token.strong
        ? normalizeStrongsCode(token.strong)
        : null;

      openStudyTool("concordance");
      setConcordanceError(null);
      setIsConcordanceLoading(true);

      setWebstersWordAccordionValue([]);
      setSelectedWebstersEntry(null);
      setSelectedHitchcocksEntry(null);
      setSelectedOldEnglishEntry(null);
      setSelectedPhrasesEntry(null);
      setSelectedUnitsEntry(null);
      setSelectedGenealogyIds([]);
      setSelectedMapsEntries([]);
      setStrongsWordAccordionValue([]);
      if (!normalizedCode) {
        setSelectedStrongsEntry(null);
      }

      const applyConcordanceSelection = (data: ConcordancePayload) => {
        const matchedKey = resolveConcordanceKey(data, rawWord) ?? rawWord;
        const references = decodeConcordanceReferences(data, matchedKey);
        setConcordanceWordAccordionValue([]);
        setSelectedConcordanceWord({
          key: matchedKey,
          references,
        });
        setIsConcordanceLoading(false);
        return data;
      };

      const concordancePromise = concordance
        ? Promise.resolve(concordance)
        : ensureConcordanceLoaded().catch(() => null);

      if (concordance) {
        applyConcordanceSelection(concordance);
      } else {
        void concordancePromise
          .then((data) => {
            if (!data) {
              return;
            }
            applyConcordanceSelection(data);
          })
          .catch(() => {
            setSelectedConcordanceWord(null);
            setConcordanceWordAccordionValue([]);
            setIsConcordanceLoading(false);
          });
      }

      let strongsPromise:
        | Promise<{ greek: StrongsPayload; hebrew: StrongsPayload } | null>
        | null = null;

      if (normalizedCode) {
        setStrongsError(null);
        setIsStrongsLoading(true);
        setStrongsSearchTerm("");
        setIsStrongsSearching(false);
        if (strongsSearchInputRef.current) {
          strongsSearchInputRef.current.value = "";
        }

        strongsPromise =
          strongsGreek && strongsHebrew
            ? Promise.resolve({ greek: strongsGreek, hebrew: strongsHebrew })
            : ensureStrongsLoaded().catch((error) => {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to load Strong's data";
                setStrongsError(message);
                return null;
              });
      }

      void Promise.all([
        concordancePromise,
        websters ? Promise.resolve(websters) : ensureWebstersLoaded().catch(() => null),
        hitchcocks
          ? Promise.resolve(hitchcocks)
          : ensureHitchcocksLoaded().catch(() => null),
        oldEnglish
          ? Promise.resolve(oldEnglish)
          : ensureOldEnglishLoaded().catch(() => null),
        phrases ? Promise.resolve(phrases) : ensurePhrasesLoaded().catch(() => null),
        units ? Promise.resolve(units) : ensureUnitsLoaded().catch(() => null),
        genealogy
          ? Promise.resolve(genealogy)
          : ensureGenealogyLoaded().catch(() => null),
        ancientMaps
          ? Promise.resolve(ancientMaps)
          : ensureAncientMapsLoaded().catch(() => null),
        strongsPromise ?? Promise.resolve(null),
      ]).then(
        ([
          nextConcordance,
          nextWebsters,
          nextHitchcocks,
          nextOldEnglish,
          nextPhrases,
          nextUnits,
          nextGenealogy,
          nextAncientMaps,
          nextStrongs,
        ]) => {
          const phraseSelection = resolvePhraseSelectionAtLocation(
            nextPhrases,
            bookIndex,
            chapterIndex,
            verseNumber,
            tokenIndex,
          );
          syncWordStudySelections(rawWord, normalizedCode, {
            websters: nextWebsters,
            hitchcocks: nextHitchcocks,
            oldEnglish: nextOldEnglish,
            phrasesSelection: phraseSelection,
            units: nextUnits,
            genealogy: nextGenealogy,
            ancientMaps: nextAncientMaps,
            strongsGreek: nextStrongs?.greek ?? null,
            strongsHebrew: nextStrongs?.hebrew ?? null,
          });
          syncTokenAccordionState(rawWord, {
            bookIndex,
            chapterIndex,
            verseNumber:
              Number.isFinite(verseNumber) && verseNumber > 0 ? verseNumber : null,
            strongCode: normalizedCode,
            concordanceData: nextConcordance,
            webstersData: nextWebsters,
            hitchcocksData: nextHitchcocks,
            oldEnglishData: nextOldEnglish,
            phraseSelection,
            unitsData: nextUnits,
            genealogyData: nextGenealogy,
            ancientMapsData: nextAncientMaps,
            strongsGreekData: nextStrongs?.greek ?? null,
            strongsHebrewData: nextStrongs?.hebrew ?? null,
          });
        },
      ).finally(() => {
        if (normalizedCode) {
          setIsStrongsLoading(false);
        }
      });
    },
    [
      ancientMaps,
      concordance,
      ensureConcordanceLoaded,
      ensureAncientMapsLoaded,
      ensureGenealogyLoaded,
      ensureHitchcocksLoaded,
      ensureOldEnglishLoaded,
      ensurePhrasesLoaded,
      ensureUnitsLoaded,
      openCrossReferencesForVerse,
      openStudyTool,
      ensureStrongsLoaded,
      ensureWebstersLoaded,
      genealogy,
      hitchcocks,
      oldEnglish,
      phrases,
      resolvePhraseSelectionAtLocation,
      setConcordanceError,
      setIsConcordanceLoading,
      setIsStrongsLoading,
      setIsStrongsSearching,
      setNotesContext,
      setSelectedConcordanceWord,
      setSelectedGenealogyIds,
      setSelectedHitchcocksEntry,
      setSelectedMapsEntries,
      setSelectedOldEnglishEntry,
      setSelectedPhrasesEntry,
      setSelectedStrongsEntry,
      setSelectedUnitsEntry,
      setSelectedWebstersEntry,
      setStrongsError,
      setStrongsSearchTerm,
      strongsGreek,
      strongsHebrew,
      syncTokenAccordionState,
      syncWordStudySelections,
      setConcordanceWordAccordionValue,
      units,
      websters,
    ],
  );

  const {
    openReference: openConcordanceReference,
    renderPreview: referencePreviewContent,
  } = useReferencePreview({
    books,
    openChapterReferenceInNewTab,
  });

  const selectGenealogyPerson = useCallback(
    (personId: string) => {
      if (!personId) {
        return;
      }
      setGenealogySearchTerm("");
      setSelectedGenealogyIds([personId]);
      if (isGenealogyTreeOpen) {
        setGenealogyTreePersonId(personId);
      }
      showStudyTool("genealogy");
    },
    [
      isGenealogyTreeOpen,
      setGenealogySearchTerm,
      setGenealogyTreePersonId,
      setSelectedGenealogyIds,
      showStudyTool,
    ],
  );

  const openGenealogyTree = useCallback((personId: string) => {
    if (!personId) {
      return;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setGenealogyTreePersonId(personId);
    setIsGenealogyTreeOpen(true);
  }, [setGenealogyTreePersonId, setIsGenealogyTreeOpen]);

  const renderGenealogyPersonDetails = useCallback(
    (person: GenealogyPerson) => (
      <GenealogyPersonDetails
        person={person}
        genealogyById={genealogyById}
        onSelectPerson={selectGenealogyPerson}
        onOpenTree={openGenealogyTree}
        renderReferencePreview={referencePreviewContent}
        onOpenReference={openConcordanceReference}
        onCloseSidebar={closeRightSidebarForMobile}
      />
    ),
    [
      closeRightSidebarForMobile,
      genealogyById,
      openGenealogyTree,
      openConcordanceReference,
      referencePreviewContent,
      selectGenealogyPerson,
    ],
  );

  const genealogyTreePerson = genealogyTreePersonId
    ? (genealogyById.get(genealogyTreePersonId) ?? null)
    : null;

  async function toggleFullscreenLeaf(leafId: string) {
    try {
      if (document.fullscreenElement) {
        if (fullscreenLeafId === leafId) {
          fullscreenRequestedLeafIdRef.current = null;
          setPanelMenuOpenLeafId(null);
          clearAllPanelPreviews();
          await document.exitFullscreen();
          return;
        }

        // Already in browser fullscreen: just switch the active fullscreen panel.
        fullscreenRequestedLeafIdRef.current = leafId;
        disableHighlightModeForLeaf(leafId);
        setFullscreenLeafId(leafId);
        setPanelMenuOpenLeafId(null);
        clearAllPanelPreviews();
        return;
      }

      fullscreenRequestedLeafIdRef.current = leafId;
      disableHighlightModeForLeaf(leafId);
      setFullscreenLeafId(leafId);
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
      if (!document.documentElement.requestFullscreen) {
        setFullscreenLeafId(null);
        fullscreenRequestedLeafIdRef.current = null;
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      // Ignore fullscreen rejections (browser policy/user gesture edge cases).
      if (!document.fullscreenElement) {
        setFullscreenLeafId(null);
        fullscreenRequestedLeafIdRef.current = null;
      }
    }
  }

  const highlightTextColor = useMemo(
    () => readableHighlightTextColor(highlightColor),
    [highlightColor],
  );

  if (!isLoaded) {
    return <ReaderStatusScreen message="Loading Bible data..." />;
  }

  if (loadError || !activeTab) {
    return (
      <ReaderStatusScreen
        message={
          loadError ?? "No Bible data available. Run npm run build:data."
        }
      />
    );
  }

  const tokenPopupCard = tokenPopup ? (
    <TokenPopupCard
      token={tokenPopup.token}
      x={tokenPopup.x}
      y={tokenPopup.y}
    />
  ) : null;

  const tabsStrip = (
    <TabsStrip
      tabs={tabs}
      activeTabId={activeTabId}
      tabsOrientation={tabsOrientation}
      tabEndRef={tabEndRef}
      onActivateTab={setActiveTabId}
      onOpenRenameDialog={openRenameDialog}
      onMoveTab={moveTab}
      onReorderTab={reorderTab}
      onCloseTab={closeTab}
      onAddTab={addTab}
    />
  );

  const {
    allStudyAccordionsOpen,
    isCrossRefsSectionOpen,
    isConcordanceSectionOpen,
    isWebstersSectionOpen,
    isStrongsSectionOpen,
    isPhrasesSectionOpen,
    isUnitsSectionOpen,
    isMapsSectionOpen,
    isGenealogySectionOpen,
    isHitchcocksSectionOpen,
    isOldEnglishSectionOpen,
    hasCrossRefsInfo,
    hasConcordanceInfo,
    hasWebstersInfo,
    hasStrongsInfo,
    hasPhrasesInfo,
    hasUnitsInfo,
    hasMapsInfo,
    hasHitchcocksInfo,
    hasOldEnglishInfo,
    hasGenealogyInfo,
  } = deriveStudySidebarState({
    accordionValue: concordanceAccordionValue,
    crossRefsCount: selectedCrossReferences?.references.length ?? 0,
    concordanceCount: concordanceSearchResults.length,
    webstersCount: webstersSearchResults.length,
    strongsCount: strongsSearchResults.length,
    phrasesCount: phrasesSearchResults.length,
    unitsCount: unitsSearchResults.length,
    mapsCount: mapsSearchResults.length,
    hitchcocksCount: hitchcocksSearchResults.length,
    oldEnglishCount: oldEnglishSearchResults.length,
    genealogyCount: genealogySearchResults.length,
  });

  const sharedStudyToolsProps = {
    crossRefsProps: {
      hasInfo: hasCrossRefsInfo,
      isOpen: isCrossRefsSectionOpen,
      isLoading: isCrossRefsLoading,
      error: crossRefsError,
      selected: selectedCrossReferences,
      books,
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    concordanceProps: {
      hasInfo: hasConcordanceInfo,
      isOpen: isConcordanceSectionOpen,
      isLoading: isConcordanceLoading,
      isSearching: isConcordanceSearching,
      error: concordanceError,
      searchTerm: concordanceSearchTerm,
      results: concordanceSearchResults,
      wordAccordionValue: concordanceWordAccordionValue,
      onWordAccordionValueChange: setConcordanceWordAccordionValue,
      onSearch: applyConcordanceSearch,
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    webstersProps: {
      hasInfo: hasWebstersInfo,
      isOpen: isWebstersSectionOpen,
      isLoading: isWebstersLoading,
      isSearching: isWebstersSearching,
      error: webstersError,
      searchTerm: webstersSearchTerm,
      results: webstersSearchResults,
      wordAccordionValue: webstersWordAccordionValue,
      onWordAccordionValueChange: setWebstersWordAccordionValue,
      onSearch: applyWebstersSearch,
    },
    strongsProps: {
      hasInfo: hasStrongsInfo,
      isOpen: isStrongsSectionOpen,
      isLoading: isStrongsLoading,
      isSearching: isStrongsSearching,
      error: strongsError,
      searchTerm: strongsSearchTerm,
      results: strongsSearchResults,
      wordAccordionValue: strongsWordAccordionValue,
      onWordAccordionValueChange: setStrongsWordAccordionValue,
      onSearch: applyStrongsSearch,
      onOpenLinkedStrongsEntry: openLinkedStrongsEntry,
      inputRef: strongsSearchInputRef,
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    oldEnglishProps: {
      hasInfo: hasOldEnglishInfo,
      isOpen: isOldEnglishSectionOpen,
      isLoading: isOldEnglishLoading,
      isSearching: isOldEnglishSearching,
      error: oldEnglishError,
      searchTerm: oldEnglishSearchTerm,
      results: oldEnglishSearchResults,
      onSearch: applyOldEnglishSearch,
    },
    phrasesProps: {
      hasInfo: hasPhrasesInfo,
      isOpen: isPhrasesSectionOpen,
      isLoading: isPhrasesLoading,
      isSearching: isPhrasesSearching,
      error: phrasesError,
      searchTerm: phrasesSearchTerm,
      results: phrasesSearchResults,
      onSearch: applyPhrasesSearch,
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    unitsProps: {
      hasInfo: hasUnitsInfo,
      isOpen: isUnitsSectionOpen,
      isLoading: isUnitsLoading,
      isSearching: isUnitsSearching,
      error: unitsError,
      searchTerm: unitsSearchTerm,
      results: unitsSearchResults,
      onSearch: applyUnitsSearch,
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    mapsProps: {
      hasInfo: hasMapsInfo,
      isOpen: isMapsSectionOpen,
      isLoading: isMapsLoading,
      isSearching: isMapsSearching,
      error: mapsError,
      searchTerm: mapsSearchTerm,
      resultsLength: mapsSearchResults.length,
      displayEntries: mapsDisplayEntries,
      onSearch: applyMapsSearch,
      onOpenMapDialog: openMapDialog,
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    genealogyProps: {
      hasInfo: hasGenealogyInfo,
      isOpen: isGenealogySectionOpen,
      isLoading: isGenealogyLoading,
      isSearching: isGenealogySearching,
      error: genealogyError,
      searchTerm: genealogySearchTerm,
      results: genealogySearchResults,
      onSearch: applyGenealogySearch,
      renderPersonDetails: renderGenealogyPersonDetails,
    },
    hitchcocksProps: {
      hasInfo: hasHitchcocksInfo,
      isOpen: isHitchcocksSectionOpen,
      isLoading: isHitchcocksLoading,
      isSearching: isHitchcocksSearching,
      error: hitchcocksError,
      searchTerm: hitchcocksSearchTerm,
      results: hitchcocksSearchResults,
      onSearch: applyHitchcocksSearch,
    },
  };

  const sharedBookmarksProps = {
    books,
    bookmarks: readerBookmarks,
    onOpenBookmark: openBookmarkInNewTab,
    onUpdateBookmark: updateBookmark,
    onDeleteBookmark: deleteBookmark,
  };

  const bookPickerDialogLeaf =
    bookPickerDialogLeafId && activeTab
      ? findLeafNode(activeTab.root, bookPickerDialogLeafId)
      : null;
  const isBookPickerDialogOpen = Boolean(
    bookPickerDialogLeafId && bookPickerDialogLeaf,
  );
  return (
    <main
      className="reader-shell h-screen w-full overflow-hidden bg-background"
      style={
        {
          "--verse-highlight-bg": highlightColor,
          "--verse-highlight-fg": highlightTextColor,
        } as React.CSSProperties
      }
    >
      <SidebarProvider
        open={isStudyMode ? isRightSidebarOpen : false}
        onOpenChange={(open) => {
          if (!isStudyMode) {
            return;
          }
          setIsRightSidebarOpen(open);
        }}
        style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
      >
        <SidebarOpenRequestSync
          requestKey={sidebarOpenRequestKey}
          enabled={isStudyMode}
        />
        <SidebarCloseRequestSync
          requestKey={sidebarCloseRequestKey}
          enabled={isStudyMode}
        />
        <SidebarInset className="flex h-screen min-h-0 flex-col overflow-hidden">
          <ReaderTopBar
            isStudyMode={isStudyMode}
            isShareCopied={isShareCopied}
            onStudyModeChange={setIsStudyMode}
            onOpenSearch={openSearchTab}
            onShareLayout={shareLayout}
            onOpenProgress={() => setIsProgressOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPage={openStaticPageTab}
          />

          <TabsWorkspace
            tabsOrientation={tabsOrientation}
            tabsStrip={tabsStrip}
            readerContent={
              <ReaderPanelTree
                root={activeTab.root}
                books={books}
                activeRoot={activeTab.root}
                chapterRefIndex={chapterRefIndex}
                chapterRefCount={chapterRefs.length}
                readChapters={readChapters}
                readChapterCountByBook={readChapterCountByBook}
                hideReadModeVerseNumbers={hideReadModeVerseNumbers}
                panelMenuOpenLeafId={panelMenuOpenLeafId}
                setPanelMenuOpenLeafId={setPanelMenuOpenLeafId}
                modelLeafNeighbors={modelLeafNeighbors}
                neighborsForLeaf={neighborsForLeaf}
                fullscreenLeafId={fullscreenLeafId}
                panelElementRefs={panelElementRefs}
                clearAllPanelPreviews={clearAllPanelPreviews}
                updateLeafLocation={updateLeafLocation}
                setBookPickerDialogLeafId={setBookPickerDialogLeafId}
                toggleFullscreenLeaf={toggleFullscreenLeaf}
                toggleParentGroupOrientation={toggleParentGroupOrientation}
                setOrientationPreviewTarget={setOrientationPreviewTarget}
                clearOrientationPreview={clearOrientationPreview}
                moveLeaf={moveLeaf}
                setMovePreviewTarget={setMovePreviewTarget}
                clearMovePreview={clearMovePreview}
                splitLeaf={splitLeaf}
                setAddPreviewTarget={setAddPreviewTarget}
                clearAddPreview={clearAddPreview}
                insertPanelInGroup={insertPanelInGroup}
                setGroupInsertPreviewTarget={setGroupInsertPreviewTarget}
                addAroundGroup={addAroundGroup}
                setAroundGroupPreviewTarget={setAroundGroupPreviewTarget}
                existingTabTargets={existingTabTargets}
                moveLeafToExistingTab={moveLeafToExistingTab}
                moveLeafToNewTab={moveLeafToNewTab}
                closeLeaf={closeLeaf}
                flowVersesByParagraph={flowVersesByParagraph}
                readModeParagraphIndent={readModeParagraphIndent}
                isStudyMode={isStudyMode}
                fontSize={fontSize}
                verseSpacing={verseSpacing}
                onOpenTokenDetails={openTokenDetailsFromElement}
                onSelectVerse={handleVerseSelection}
                concordanceWords={concordanceWords}
                verseSearchIndex={verseSearchIndex}
                ensureConcordanceWordsLoaded={ensureConcordanceLoaded}
                onOpenSearchResult={openChapterReferenceInNewTab}
                notes={readerNotes}
                notesContext={notesContext}
                notesTabStateByLeafId={notesTabStateByLeafId}
                onChangeNotesTabState={changeNotesTabState}
                searchPageStateByLeafId={searchPageStateByLeafId}
                onChangeSearchPageState={changeSearchPageState}
                onCreateGeneralNote={createGeneralNote}
                onCreateContextNote={createContextNote}
                onUpdateNote={updateNote}
                onDeleteNote={deleteNote}
                moveLeafChapter={moveLeafChapter}
                toggleChapterRead={toggleChapterRead}
                updateSplitSize={updateSplitSize}
                updateSplitGroupLayout={updateSplitGroupLayout}
                highlightModeEnabledByLeafId={highlightModeEnabledByLeafId}
                highlightedVerseRangesByLeafId={highlightedVerseRangesByLeafId}
                onClearLeafHighlights={handleClearLeafHighlights}
                onToggleHighlightMode={toggleHighlightModeForLeaf}
                onBookmarkLeafSelection={bookmarkLeafSelection}
                studyToolsPanelProps={{
                  accordionValue: concordanceAccordionValue,
                  onAccordionValueChange: setConcordanceAccordionValue,
                  onExpandAll: () =>
                    setConcordanceAccordionValue([...STUDY_ACCORDION_ITEMS]),
                  onCollapseAll: () => setConcordanceAccordionValue([]),
                  canExpand: !allStudyAccordionsOpen,
                  canCollapse: concordanceAccordionValue.length > 0,
                  ...sharedStudyToolsProps,
                }}
                bookmarksPanelProps={sharedBookmarksProps}
              />
            }
          />
        </SidebarInset>

        {isStudyMode ? (
          <Suspense fallback={null}>
            <LazyReaderStudySidebar
              visible={isStudyMode}
              activeTab={studyWorkspaceTab}
              accordionValue={concordanceAccordionValue}
              onAccordionValueChange={setConcordanceAccordionValue}
              onActiveTabChange={setStudyWorkspaceTab}
              onExpandAll={() =>
                setConcordanceAccordionValue([...STUDY_ACCORDION_ITEMS])
              }
              onCollapseAll={() => setConcordanceAccordionValue([])}
              canExpand={!allStudyAccordionsOpen}
              canCollapse={concordanceAccordionValue.length > 0}
              {...sharedStudyToolsProps}
              notesProps={{
                books,
                generalNotes,
                contextNotes,
                context: notesContext,
                onOpenNotesTab: (noteId) => {
                  openNotesTab(noteId);
                  closeRightSidebarForMobile();
                },
                onCreateGeneralNote: () => {
                  const noteId = createGeneralNote();
                  openNotesTab(noteId);
                  closeRightSidebarForMobile();
                },
                onCreateContextNote: () => {
                  const noteId = createContextNote(notesContext);
                  if (noteId) {
                    openNotesTab(noteId);
                    closeRightSidebarForMobile();
                  }
                },
                onSetChapterContext: () => {
                  setNotesContext((current) => {
                    if (!current) return current;
                    return {
                      bookIndex: current.bookIndex,
                      chapterIndex: current.chapterIndex,
                    };
                  });
                },
              }}
              bookmarksProps={sharedBookmarksProps}
            />
          </Suspense>
        ) : null}
      </SidebarProvider>

      {tokenPopupCard}

      {isMapDialogOpen ? (
        <Suspense fallback={null}>
          <LazyMapAndPhotoDialogs
            isMapDialogOpen={isMapDialogOpen}
            activeMapDialogEntry={activeMapDialogEntry}
            isMapDialogLoading={isMapDialogLoading}
            mapDialogError={mapDialogError}
            mapDialogGeoJson={mapDialogGeoJson}
            onMapDialogOpenChange={onMapDialogOpenChange}
            onCloseMapDialog={onCloseMapDialog}
          />
        </Suspense>
      ) : null}

      {isBookPickerDialogOpen ? (
        <Suspense fallback={null}>
          <LazyBookPickerDialog
            open={isBookPickerDialogOpen}
            books={books}
            leaf={bookPickerDialogLeaf}
            onClose={() => {
              setBookPickerDialogLeafId(null);
            }}
            onSelectTestament={(testament) => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                pickerTestament: testament,
                pickerBookIndex: null,
              });
            }}
            onBackToTestaments={() => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                pickerTestament: null,
                pickerBookIndex: null,
              });
            }}
            onSelectBook={(bookIndex) => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                pickerBookIndex: bookIndex,
              });
            }}
            onGoToBookSelection={(testament) => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                pickerTestament: testament,
                pickerBookIndex: null,
              });
            }}
            onGoToChapterSelection={(testament, bookIndex) => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                pickerTestament: testament,
                pickerBookIndex: bookIndex,
              });
            }}
            onSelectChapter={(bookIndex, chapterIndex) => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                bookIndex,
                chapterIndex,
                view: "reader",
              });
              setBookPickerDialogLeafId(null);
            }}
          />
        </Suspense>
      ) : null}

      {isRenameDialogOpen ? (
        <Suspense fallback={null}>
          <LazyRenameTabDialog
            open={isRenameDialogOpen}
            value={renameValue}
            error={renameError}
            onOpenChange={setIsRenameDialogOpen}
            onValueChange={onRenameValueChange}
            onCancel={onRenameCancel}
            onConfirm={confirmRenameTab}
          />
        </Suspense>
      ) : null}

      {isSettingsOpen ? (
        <Suspense fallback={null}>
          <LazySettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            theme={theme}
            onThemeChange={setTheme}
            fontSize={fontSize}
            onIncreaseFontSize={() => setFontSize((current) => current + 4)}
            onDecreaseFontSize={() =>
              setFontSize((current) => Math.max(8, current - 4))
            }
            onResetFontSize={() => setFontSize(16)}
            highlightColor={highlightColor}
            onHighlightColorChange={(value) =>
              setHighlightColor(normalizeHighlightColor(value))
            }
            onResetHighlightColor={() =>
              setHighlightColor(defaultHighlightColor())
            }
            verseSpacing={verseSpacing}
            onVerseSpacingChange={setVerseSpacing}
            hideReadModeVerseNumbers={hideReadModeVerseNumbers}
            onHideReadModeVerseNumbersChange={setHideReadModeVerseNumbers}
            readModeParagraphIndent={readModeParagraphIndent}
            onReadModeParagraphIndentChange={setReadModeParagraphIndent}
            flowVersesByParagraph={flowVersesByParagraph}
            onFlowVersesByParagraphChange={setFlowVersesByParagraph}
            tabsOrientation={tabsOrientation}
            onTabsOrientationChange={setTabsOrientation}
            studyToolOpenTarget={studyToolOpenTarget}
            onStudyToolOpenTargetChange={setStudyToolOpenTarget}
          />
        </Suspense>
      ) : null}

      {isProgressOpen ? (
        <Suspense fallback={null}>
          <LazyProgressDialog
            open={isProgressOpen}
            onOpenChange={setIsProgressOpen}
            totalProgressPercent={totalProgressPercent}
            progressByTestament={progressByTestament}
            onSetAllTestamentChaptersRead={setAllTestamentChaptersRead}
            onSetAllBookChaptersRead={setAllBookChaptersRead}
            onOpenChapterInNewTab={openChapterInNewTab}
            onToggleChapterRead={toggleChapterRead}
            onResetAllProgress={resetAllProgress}
          />
        </Suspense>
      ) : null}

      <CompletionCelebration
        open={isCompletionCelebrationOpen}
        showConfetti={showCompletionConfetti}
        verse={completionCelebrationVerse}
        onOpenChange={(open) => {
          setIsCompletionCelebrationOpen(open);
          if (!open) {
            setShowCompletionConfetti(false);
          }
        }}
      />

      {isGenealogyTreeOpen ? (
        <Suspense fallback={null}>
          <LazyGenealogyTreeDialog
            open={isGenealogyTreeOpen}
            person={genealogyTreePerson}
            genealogyById={genealogyById}
            renderReferencePreview={referencePreviewContent}
            onOpenReference={openConcordanceReference}
            onCloseSidebar={closeRightSidebarForMobile}
            onOpenChange={(open) => {
              setIsGenealogyTreeOpen(open);
              if (!open) {
                setGenealogyTreePersonId(null);
              }
            }}
            onSelectPerson={(personId) => {
              selectGenealogyPerson(personId);
              setGenealogyTreePersonId(personId);
            }}
          />
        </Suspense>
      ) : null}
    </main>
  );
}
