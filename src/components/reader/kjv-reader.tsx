import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type Book,
  type VerseToken,
} from "@/types/bible";
import {
  type AncientMapPayload,
  matchesMapWord,
} from "@/lib/maps";
import {
  loadHitchcocks,
  loadKjvBooks,
  loadMapGeoJson,
  loadOldEnglish,
  loadWebsters,
} from "@/lib/reader-data";
import {
  decodeConcordanceReferences,
  chapterVerseKey,
  normalizeConcordanceWord,
  normalizeStrongsCode,
  resolveConcordanceKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolveWebstersKey,
} from "@/lib/references";
import { normalizeRangePoints } from "@/lib/bookmarks";
import {
  defaultHighlightColor,
  normalizeHighlightColor,
  readableHighlightTextColor,
} from "@/lib/highlight-color";
import {
  chapterProgressKey,
  panelViewportElement,
} from "@/lib/reader-view";
import {
  collectLeafIds,
  countLeaves,
  createId,
  createInitialTab,
  createLeaf,
  findGroupTargetNodeId,
  findLeafNode,
  findNodeById,
  findParentSplitForLeaf,
  removeLeafNode,
  splitNodeById,
  splitPanelNode,
  swapLeafContent,
  updateLeafNode,
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
  PanelDirection,
  PanelNode,
  ReaderTab,
  SearchPageState,
  SplitOrientation,
  StrongsPayload,
  TabsOrientation,
  TokenPopupState,
  WebstersEntry,
  WebstersPayload,
} from "@/types/reader";
import type { ReaderBookmark } from "@/types/bookmarks";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarOpenRequestSync } from "@/components/reader/sidebar-open-request-sync";
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
import { TabsStrip } from "@/components/reader/tabs-strip";
import { TokenPopupCard } from "@/components/reader/token-popup-card";
import { ReaderTopBar } from "@/components/reader/reader-top-bar";
import { TabsWorkspace } from "@/components/reader/tabs-workspace";
import { ReaderStatusScreen } from "@/components/reader/reader-status-screen";
import { ReaderPanelTree } from "@/components/reader/reader-panel-tree";
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

const LazySettingsDialog = lazy(async () => {
  const module = await import("@/components/reader/settings-dialog");
  return { default: module.SettingsDialog };
});

const LazyProgressDialog = lazy(async () => {
  const module = await import("@/components/reader/progress-dialog");
  return { default: module.ProgressDialog };
});

export function KJVReader() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState(16);
  const [highlightColor, setHighlightColor] = useState(defaultHighlightColor);
  const [verseSpacing, setVerseSpacing] = useState(0);
  const [hideReadModeVerseNumbers, setHideReadModeVerseNumbers] =
    useState(false);
  const [readModeParagraphIndent, setReadModeParagraphIndent] = useState(false);
  const [flowVersesByParagraph, setFlowVersesByParagraph] = useState(false);
  const [tabsOrientation, setTabsOrientation] =
    useState<TabsOrientation>("horizontal");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [sidebarOpenRequestKey, setSidebarOpenRequestKey] = useState(0);
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
  const [concordanceAccordionValue, setConcordanceAccordionValue] = useState<
    string[]
  >([]);
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
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

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
  }, [isStudyMode, resetMapDialogState]);

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
    } catch {
      // Ignore malformed persisted display settings.
    }
  }, []);

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
  }, []);

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
          setActiveTabId(parsedLayout.tabs[parsedLayout.activeTabIndex]?.id ?? parsedLayout.tabs[0]?.id ?? null);
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
  }, []);

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
    if (syncedLayoutHashRef.current === nextHash && window.location.hash === nextHash) {
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
        activeTabId: parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null,
        tabsOrientation: parsed.tabsOrientation,
        highlightedVerseRangesByLeafId: parsed.highlightedVerseRangesByLeafId,
      });
      syncedLayoutHashRef.current = nextHash;
      setTabs(parsed.tabs);
      setActiveTabId(parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null);
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
  }, [queueVerseHighlights, setVerseHighlights]);

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
  } = useDictionarySearchTool<WebstersPayload, WebstersEntry, { key: string; entry: WebstersEntry }>({
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
    domNeighborCacheRef.current = { root: null, neighbors: new Map() };
  }, [activeTab]);
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
  }, []);

  useEffect(() => {
    if (!panelMenuOpenLeafId || !activeTab) {
      return;
    }

    if (!findLeafNode(activeTab.root, panelMenuOpenLeafId)) {
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
    }
  }, [activeTab, panelMenuOpenLeafId]);

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
        neighbors: buildLeafNeighborMapFromDom(activeTab.root, panelElementRefs.current),
      };
    }
    return domNeighborCacheRef.current.neighbors.get(leafId)?.[direction] ?? null;
  }

  function panelCardElement(leafId: string) {
    const panelElement = panelElementRefs.current[leafId];
    return (
      panelElement?.querySelector<HTMLElement>(':scope > [data-slot="card"]') ??
      null
    );
  }

  function clearMovePreview() {
    const previewId = previewLeafIdRef.current;
    if (!previewId) {
      return;
    }

    const previewSurface = panelCardElement(previewId);
    previewSurface?.classList.remove("panel-move-preview-surface");
    previewLeafIdRef.current = null;
  }

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

  function clearAddPreview() {
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
  }

  function clearOrientationPreview() {
    const leafIds = orientationPreviewLeafIdsRef.current;
    if (leafIds.length === 0) {
      return;
    }

    for (const leafId of leafIds) {
      const previewSurface = panelCardElement(leafId);
      previewSurface?.classList.remove("panel-orientation-preview");
    }

    orientationPreviewLeafIdsRef.current = [];
  }

  function clearAllPanelPreviews() {
    clearMovePreview();
    clearAddPreview();
    clearOrientationPreview();
  }

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

  function setGroupAddPreviewTarget(leafId: string, direction: PanelDirection) {
    clearMovePreview();
    clearOrientationPreview();
    if (!activeTab) {
      return;
    }

    const targetNodeId = findGroupTargetNodeId(
      activeTab.root,
      leafId,
      direction,
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

  function splitPanelGroup(leafId: string, direction: PanelDirection) {
    if (!activeTab) {
      return;
    }

    const targetNodeId = findGroupTargetNodeId(
      activeTab.root,
      leafId,
      direction,
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
    const nextSearchNumber = tabs.filter((tab) =>
      tab.title.toLowerCase().startsWith("search"),
    ).length + 1;
    const nextSearchTitle = nextSearchNumber === 1 ? "Search" : `Search ${nextSearchNumber}`;
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
      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id: nextTabId,
          title: "Notes",
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
    [initializeNotesTabState, notesContext, tabsOrientation],
  );

  function openBookmarkInNewTab(bookmark: ReaderBookmark) {
    if (bookmark.scope.type === "chapter") {
      openChapterInNewTab(bookmark.scope.bookIndex, bookmark.scope.chapterIndex);
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

    const normalized = normalizeRangePoints(bookmark.scope.start, bookmark.scope.end);
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

  const openChapterReferenceInNewTab = useCallback((
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
  }, [
    clearAllVerseHighlights,
    queueVerseHighlight,
    setSelectedHighlightScope,
    tabsOrientation,
  ]);

  const openChapterHighlightsInNewTab = useCallback((
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
  }, [
    clearAllVerseHighlights,
    queueVerseHighlights,
    setSelectedHighlightScope,
    tabsOrientation,
  ]);

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

  function updateSplitSize(splitId: string, ratio: number) {
    updateActiveTab((tab) => ({
      ...tab,
      root: updateSplitRatio(tab.root, splitId, ratio),
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

  const openCrossReferencesForVerse = useCallback(
    (bookIndex: number, chapterIndex: number, verseNumber: number) => {
      setNotesContext({
        bookIndex,
        chapterIndex,
        verseNumber,
      });
      const key = chapterVerseKey(bookIndex, chapterIndex, verseNumber);

      setIsRightSidebarOpen(true);
      setSidebarOpenRequestKey((current) => current + 1);
      setCrossRefsError(null);
      setIsCrossRefsLoading(true);
      setConcordanceAccordionValue((current) => {
        const without = current.filter((value) => value !== "cross-refs");
        return ["cross-refs", ...without];
      });

      const applyCrossRefsSelection = (data: CrossRefsPayload) => {
        setSelectedCrossReferences({
          key,
          references: data[key] ?? [],
        });
        setIsCrossRefsLoading(false);
      };

      if (crossRefs) {
        applyCrossRefsSelection(crossRefs);
        return;
      }

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
    },
    [crossRefs, ensureCrossRefsLoaded],
  );

  const handleVerseSelection = useCallback(
    (
      leafId: string,
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
    ) => {
      const highlightModeEnabled = Boolean(highlightModeEnabledByLeafId[leafId]);
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
    [createChapterBookmark, highlightedVerseRangesByLeafId, tabs, upsertBookmark],
  );

  const closeRightSidebarForMobile = useCallback(() => {
    setIsRightSidebarOpen(false);
  }, []);

  const openTokenDetailsFromElement = useCallback(
    (
      element: HTMLElement,
      token: VerseToken,
      bookIndex: number,
      chapterIndex: number,
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
      const verseContainer = element.closest<HTMLElement>("[data-verse-number]");
      const rawVerseNumber = verseContainer?.dataset.verseNumber;
      const verseNumber =
        rawVerseNumber === undefined
          ? Number.NaN
          : Number.parseInt(rawVerseNumber, 10);
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

      setIsRightSidebarOpen(true);
      setSidebarOpenRequestKey((current) => current + 1);
      setConcordanceAccordionValue((current) => {
        const withoutConcordance = current.filter(
          (value) => value !== "concordance",
        );
        if (!withoutConcordance.includes("cross-refs")) {
          return ["concordance", ...withoutConcordance];
        }
        return [
          "cross-refs",
          "concordance",
          ...withoutConcordance.filter((value) => value !== "cross-refs"),
        ];
      });
      setConcordanceError(null);
      setIsConcordanceLoading(true);
      if (token.strong) {
        setStrongsSearchTerm("");
        setIsStrongsSearching(false);
        if (strongsSearchInputRef.current) {
          strongsSearchInputRef.current.value = "";
        }
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
      };

      const applyWebstersSelection = (data: WebstersPayload) => {
        const matchedKey = resolveWebstersKey(data, rawWord);
        setWebstersWordAccordionValue([]);
        setSelectedWebstersEntry(
          matchedKey ? { key: matchedKey, entry: data[matchedKey] } : null,
        );
        setConcordanceAccordionValue((current) => {
          const withoutWebsters = current.filter(
            (value) => value !== "websters",
          );
          if (!matchedKey) {
            return withoutWebsters;
          }
          return withoutWebsters.includes("concordance")
            ? [...withoutWebsters, "websters"]
            : ["concordance", ...withoutWebsters, "websters"];
        });
        setIsWebstersLoading(false);
      };

      const applyHitchcocksSelection = (data: HitchcocksPayload) => {
        const matchedKey = resolveHitchcocksKey(data, rawWord);
        setSelectedHitchcocksEntry(
          matchedKey ? { key: matchedKey, definition: data[matchedKey] } : null,
        );
        setConcordanceAccordionValue((current) => {
          const withoutHitchcocks = current.filter(
            (value) => value !== "hitchcocks",
          );
          if (!matchedKey) {
            return withoutHitchcocks;
          }
          return withoutHitchcocks.includes("concordance")
            ? [...withoutHitchcocks, "hitchcocks"]
            : ["concordance", ...withoutHitchcocks, "hitchcocks"];
        });
        setIsHitchcocksLoading(false);
      };

      const applyOldEnglishSelection = (data: OldEnglishPayload) => {
        const matchedKey = resolveOldEnglishKey(data, rawWord);
        setSelectedOldEnglishEntry(
          matchedKey
            ? { key: matchedKey, definitions: data[matchedKey] ?? [] }
            : null,
        );
        setConcordanceAccordionValue((current) => {
          const withoutOldEnglish = current.filter(
            (value) => value !== "old-english",
          );
          if (!matchedKey) {
            return withoutOldEnglish;
          }
          return withoutOldEnglish.includes("concordance")
            ? [...withoutOldEnglish, "old-english"]
            : ["concordance", ...withoutOldEnglish, "old-english"];
        });
        setIsOldEnglishLoading(false);
      };

      const applyGenealogySelection = (data: GenealogyPayload) => {
        const matches = data.filter((person) =>
          person.names.some(
            (name) =>
              normalizeConcordanceWord(name).toLowerCase() ===
              rawWord.toLowerCase(),
          ),
        );
        const matchIds = [...new Set(matches.map((person) => person.id))];
        setSelectedGenealogyIds(matchIds);
        setConcordanceAccordionValue((current) => {
          const withoutGenealogy = current.filter(
            (value) => value !== "genealogy",
          );
          if (matchIds.length === 0) {
            return withoutGenealogy;
          }
          return withoutGenealogy.includes("concordance")
            ? [...withoutGenealogy, "genealogy"]
            : ["concordance", ...withoutGenealogy, "genealogy"];
        });
        setIsGenealogyLoading(false);
      };

      const applyMapsSelection = (data: AncientMapPayload) => {
        const matches = data.filter((entry) =>
          matchesMapWord(entry, rawWord, normalizeConcordanceWord),
        );
        setSelectedMapsEntries(matches);
        setConcordanceAccordionValue((current) => {
          const withoutMaps = current.filter((value) => value !== "maps");
          if (matches.length === 0) {
            return withoutMaps;
          }
          return withoutMaps.includes("concordance")
            ? [...withoutMaps, "maps"]
            : ["concordance", ...withoutMaps, "maps"];
        });
        setIsMapsLoading(false);
      };

      const applyStrongsSelection = (
        greek: StrongsPayload,
        hebrew: StrongsPayload,
      ) => {
        const normalizedCode = token.strong
          ? normalizeStrongsCode(token.strong)
          : null;
        setStrongsWordAccordionValue([]);
        if (!normalizedCode) {
          setSelectedStrongsEntry(null);
          setConcordanceAccordionValue((current) =>
            current.filter((value) => value !== "strongs"),
          );
          setIsStrongsLoading(false);
          return;
        }

        const source = normalizedCode.startsWith("G") ? greek : hebrew;
        const entry = source[normalizedCode];
        if (!entry) {
          setSelectedStrongsEntry(null);
          setConcordanceAccordionValue((current) =>
            current.filter((value) => value !== "strongs"),
          );
          setIsStrongsLoading(false);
          return;
        }

        setSelectedStrongsEntry({
          code: normalizedCode,
          testament: normalizedCode.startsWith("G") ? "greek" : "hebrew",
          entry,
        });
        setConcordanceAccordionValue((current) => {
          const without = current.filter((value) => value !== "strongs");
          return without.includes("concordance")
            ? [...without, "strongs"]
            : ["concordance", ...without, "strongs"];
        });
        setIsStrongsLoading(false);
      };

      if (concordance) {
        applyConcordanceSelection(concordance);
      } else {
        void ensureConcordanceLoaded()
          .then((data) => {
            applyConcordanceSelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load concordance data";
            setConcordanceError(message);
            setIsConcordanceLoading(false);
          });
      }

      setWebstersError(null);
      setIsWebstersLoading(true);
      if (websters) {
        applyWebstersSelection(websters);
      } else {
        void ensureWebstersLoaded()
          .then((data) => {
            applyWebstersSelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load Webster's data";
            setWebstersError(message);
            setIsWebstersLoading(false);
          });
      }

      setStrongsError(null);
      setIsStrongsLoading(true);
      if (strongsGreek && strongsHebrew) {
        applyStrongsSelection(strongsGreek, strongsHebrew);
      } else {
        void ensureStrongsLoaded()
          .then(({ greek, hebrew }) => {
            applyStrongsSelection(greek, hebrew);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load Strong's data";
            setStrongsError(message);
            setIsStrongsLoading(false);
          });
      }

      setHitchcocksError(null);
      setIsHitchcocksLoading(true);
      if (hitchcocks) {
        applyHitchcocksSelection(hitchcocks);
      } else {
        void ensureHitchcocksLoaded()
          .then((data) => {
            applyHitchcocksSelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load Hitchcock's data";
            setHitchcocksError(message);
            setIsHitchcocksLoading(false);
          });
      }

      setOldEnglishError(null);
      setIsOldEnglishLoading(true);
      if (oldEnglish) {
        applyOldEnglishSelection(oldEnglish);
      } else {
        void ensureOldEnglishLoaded()
          .then((data) => {
            applyOldEnglishSelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load Old English data";
            setOldEnglishError(message);
            setIsOldEnglishLoading(false);
          });
      }

      setGenealogyError(null);
      setIsGenealogyLoading(true);
      if (genealogy) {
        applyGenealogySelection(genealogy);
      } else {
        void ensureGenealogyLoaded()
          .then((data) => {
            applyGenealogySelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load genealogy data";
            setGenealogyError(message);
            setIsGenealogyLoading(false);
          });
      }

      setMapsError(null);
      setIsMapsLoading(true);
      if (ancientMaps) {
        applyMapsSelection(ancientMaps);
      } else {
        void ensureAncientMapsLoaded()
          .then((data) => {
            applyMapsSelection(data);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load ancient map data";
            setMapsError(message);
            setIsMapsLoading(false);
          });
      }
    },
    [
      ancientMaps,
      concordance,
      ensureConcordanceLoaded,
      ensureAncientMapsLoaded,
      ensureHitchcocksLoaded,
      ensureGenealogyLoaded,
      ensureOldEnglishLoaded,
      openCrossReferencesForVerse,
      ensureStrongsLoaded,
      ensureWebstersLoaded,
      genealogy,
      hitchcocks,
      oldEnglish,
      strongsGreek,
      strongsHebrew,
      websters,
    ],
  );

  const { openReference: openConcordanceReference, renderPreview: referencePreviewContent } =
    useReferencePreview({
      books,
      openChapterReferenceInNewTab,
    });

  const selectGenealogyPerson = useCallback((personId: string) => {
    if (!personId) {
      return;
    }
    setGenealogySearchTerm("");
    setSelectedGenealogyIds([personId]);
    setConcordanceAccordionValue((current) => {
      const without = current.filter((value) => value !== "genealogy");
      return without.includes("concordance")
        ? [...without, "genealogy"]
        : ["concordance", ...without, "genealogy"];
    });
  }, []);

  const renderGenealogyPersonDetails = useCallback(
    (person: GenealogyPerson) => (
      <GenealogyPersonDetails
        person={person}
        genealogyById={genealogyById}
        onSelectPerson={selectGenealogyPerson}
        renderReferencePreview={referencePreviewContent}
        onOpenReference={openConcordanceReference}
        onCloseSidebar={closeRightSidebarForMobile}
      />
    ),
    [
      closeRightSidebarForMobile,
      genealogyById,
      openConcordanceReference,
      referencePreviewContent,
      selectGenealogyPerson,
    ],
  );

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
        setFullscreenLeafId(leafId);
        setPanelMenuOpenLeafId(null);
        clearAllPanelPreviews();
        return;
      }

      fullscreenRequestedLeafIdRef.current = leafId;
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
        message={loadError ?? "No Bible data available. Run npm run build:data."}
      />
    );
  }

  const tokenPopupCard = tokenPopup ? (
    <TokenPopupCard token={tokenPopup.token} x={tokenPopup.x} y={tokenPopup.y} />
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
    isMapsSectionOpen,
    isGenealogySectionOpen,
    isHitchcocksSectionOpen,
    isOldEnglishSectionOpen,
    hasCrossRefsInfo,
    hasConcordanceInfo,
    hasWebstersInfo,
    hasStrongsInfo,
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
    mapsCount: mapsSearchResults.length,
    hitchcocksCount: hitchcocksSearchResults.length,
    oldEnglishCount: oldEnglishSearchResults.length,
    genealogyCount: genealogySearchResults.length,
  });

  const bookPickerDialogLeaf =
    bookPickerDialogLeafId && activeTab
      ? findLeafNode(activeTab.root, bookPickerDialogLeafId)
      : null;
  const isBookPickerDialogOpen = Boolean(
    bookPickerDialogLeafId && bookPickerDialogLeaf,
  );
  return (
    <main
      className="h-screen w-full overflow-hidden bg-background"
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
                splitPanelGroup={splitPanelGroup}
                setGroupAddPreviewTarget={setGroupAddPreviewTarget}
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
                highlightModeEnabledByLeafId={highlightModeEnabledByLeafId}
                highlightedVerseRangesByLeafId={highlightedVerseRangesByLeafId}
                onClearLeafHighlights={handleClearLeafHighlights}
                onToggleHighlightMode={toggleHighlightModeForLeaf}
                onBookmarkLeafSelection={bookmarkLeafSelection}
              />
            }
          />
        </SidebarInset>

        {isStudyMode ? (
          <Suspense fallback={null}>
            <LazyReaderStudySidebar
            visible={isStudyMode}
            accordionValue={concordanceAccordionValue}
            onAccordionValueChange={setConcordanceAccordionValue}
            onExpandAll={() =>
              setConcordanceAccordionValue([...STUDY_ACCORDION_ITEMS])
            }
            onCollapseAll={() => setConcordanceAccordionValue([])}
            canExpand={!allStudyAccordionsOpen}
            canCollapse={concordanceAccordionValue.length > 0}
            crossRefsProps={{
              hasInfo: hasCrossRefsInfo,
              isOpen: isCrossRefsSectionOpen,
              isLoading: isCrossRefsLoading,
              error: crossRefsError,
              selected: selectedCrossReferences,
              books,
              renderPreview: referencePreviewContent,
              onOpenReference: openConcordanceReference,
              onCloseSidebar: closeRightSidebarForMobile,
            }}
            concordanceProps={{
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
            }}
            webstersProps={{
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
            }}
            strongsProps={{
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
              inputRef: strongsSearchInputRef,
              renderPreview: referencePreviewContent,
              onOpenReference: openConcordanceReference,
              onCloseSidebar: closeRightSidebarForMobile,
            }}
            oldEnglishProps={{
              hasInfo: hasOldEnglishInfo,
              isOpen: isOldEnglishSectionOpen,
              isLoading: isOldEnglishLoading,
              isSearching: isOldEnglishSearching,
              error: oldEnglishError,
              searchTerm: oldEnglishSearchTerm,
              results: oldEnglishSearchResults,
              onSearch: applyOldEnglishSearch,
            }}
            mapsProps={{
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
            }}
            notesProps={{
              books,
              generalNotes,
              contextNotes,
              context: notesContext,
              onOpenNotesTab: (noteId) => openNotesTab(noteId),
              onCreateGeneralNote: () => {
                const noteId = createGeneralNote();
                openNotesTab(noteId);
              },
              onCreateContextNote: () => {
                const noteId = createContextNote(notesContext);
                if (noteId) {
                  openNotesTab(noteId);
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
            bookmarksProps={{
              books,
              bookmarks: readerBookmarks,
              onOpenBookmark: openBookmarkInNewTab,
              onUpdateBookmark: updateBookmark,
              onDeleteBookmark: deleteBookmark,
            }}
            genealogyProps={{
              hasInfo: hasGenealogyInfo,
              isOpen: isGenealogySectionOpen,
              isLoading: isGenealogyLoading,
              isSearching: isGenealogySearching,
              error: genealogyError,
              searchTerm: genealogySearchTerm,
              results: genealogySearchResults,
              onSearch: applyGenealogySearch,
              renderPersonDetails: renderGenealogyPersonDetails,
            }}
            hitchcocksProps={{
              hasInfo: hasHitchcocksInfo,
              isOpen: isHitchcocksSectionOpen,
              isLoading: isHitchcocksLoading,
              isSearching: isHitchcocksSearching,
              error: hitchcocksError,
              searchTerm: hitchcocksSearchTerm,
              results: hitchcocksSearchResults,
              onSearch: applyHitchcocksSearch,
            }}
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
            onBackToBooks={() => {
              if (!bookPickerDialogLeaf) {
                return;
              }
              updateLeafLocation(bookPickerDialogLeaf.id, {
                pickerBookIndex: null,
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
            onIncreaseFontSize={() =>
              setFontSize((current) => current + 4)
            }
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
            onSetAllBookChaptersRead={setAllBookChaptersRead}
            onOpenChapterInNewTab={openChapterInNewTab}
            onToggleChapterRead={toggleChapterRead}
            onResetAllProgress={resetAllProgress}
          />
        </Suspense>
      ) : null}
    </main>
  );
}
