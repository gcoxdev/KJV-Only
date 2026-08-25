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
  loadAIDictionary,
  loadBibleWordBook,
  loadHitchcocks,
  loadMapGeoJson,
  loadOldEnglish,
  loadPhrases,
  loadUnits,
  loadWebsters,
} from "@/lib/reader-data";
import { beginPerformanceMeasure } from "@/lib/performance";
import {
  consumeLocalStorageIssueKeys,
  LOCAL_STORAGE_ISSUE_EVENT,
} from "@/lib/local-storage";
import { resolveAIDictionaryKey } from "@/lib/references";
import {
  deriveTokenAccordionState,
  type TokenAccordionOptions,
} from "@/lib/word-study-selection";
import {
  defaultHighlightColor,
  normalizeHighlightColor,
  readableHighlightTextColor,
} from "@/lib/highlight-color";
import { chapterProgressKey, panelViewportElement } from "@/lib/reader-view";
import {
  prunePendingReaderScrollTargets,
} from "@/lib/reader-scroll-targets";
import { clearSingleLeafReferenceIfMissing } from "@/lib/leaf-state";
import {
  collectLeafIds,
  createId,
  createLeaf,
  findLeafNode,
  updateLeafNode,
  updateSameOrientationGroupLayout,
  updateSplitRatio,
} from "@/lib/reader-layout";
import type { LeafNeighbors } from "@/lib/reader-neighbors";
import { panelNodeContainsView } from "@/lib/workspace-navigation";
import { useLayoutHashSync } from "@/hooks/use-layout-hash-sync";
import type {
  AIDictionaryEntry,
  AIDictionaryPayload,
  BibleWordBookEntry,
  BibleWordBookPayload,
  GenealogyPerson,
  HitchcocksPayload,
  LeafNode,
  OldEnglishPayload,
  PhraseEntry,
  PhrasesPayload,
  ReaderTab,
  SplitOrientation,
  StrongsPayload,
  TokenPopupState,
  UnitsEntry,
  UnitsPayload,
  WebstersEntry,
  WebstersPayload,
  WordVerseSelectionTarget,
  PendingReaderScrollTarget,
} from "@/types/reader";
import type { BookmarkScope } from "@/types/bookmarks";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
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
import { useTopicsTool } from "@/hooks/use-topics-tool";
import { useReaderBookmarks } from "@/hooks/use-reader-bookmarks";
import { useReaderNotes } from "@/hooks/use-reader-notes";
import { useLeafHistory } from "@/hooks/use-leaf-history";
import { usePanelTransfer } from "@/hooks/use-panel-transfer";
import { usePanelTargeting } from "@/hooks/use-panel-targeting";
import { usePanelRouting } from "@/hooks/use-panel-routing";
import { usePanelInteractionController } from "@/hooks/use-panel-interaction-controller";
import { usePendingReaderScroll } from "@/hooks/use-pending-reader-scroll";
import { useWorkspaceNavigation } from "@/hooks/use-workspace-navigation";
import { useWordStudyNavigation } from "@/hooks/use-word-study-navigation";
import { useWordStudyCoordinator } from "@/hooks/use-word-study-coordinator";
import { useVerseHighlights } from "@/hooks/use-verse-highlights";
import {
  STUDY_ACCORDION_ITEMS,
  deriveStudySidebarState,
} from "@/hooks/use-study-sidebar-state";
import { useReaderShellState } from "@/hooks/use-reader-shell-state";
import { useReaderController } from "@/hooks/use-reader-controller";
import { useStudyWorkspaceState } from "@/hooks/use-study-workspace-state";
import { TabsStrip } from "@/components/reader/tabs-strip";
import { TokenPopupCard } from "@/components/reader/token-popup-card";
import { ReaderTopBar } from "@/components/reader/reader-top-bar";
import { ReferenceCommandDialog } from "@/components/reader/reference-command-dialog";
import { TabsWorkspace } from "@/components/reader/tabs-workspace";
import { ReaderStatusScreen } from "@/components/reader/reader-status-screen";
import { ReaderPanelTree } from "@/components/reader/reader-panel-tree";
import { CompletionCelebration } from "@/components/reader/completion-celebration";
import {
  GuidedTour,
  type GuidedTourStep,
} from "@/components/reader/guided-tour";

const LazyReaderStudySidebar = lazy(async () => {
  const module = await import("@/components/reader/reader-study-sidebar");
  return { default: module.ReaderStudySidebar };
});

const EMPTY_LEAF_NEIGHBORS = new Map<string, LeafNeighbors>();

const LazyMapAndPhotoDialogs = lazy(async () => {
  const module = await import("@/components/reader/map-and-photo-dialogs");
  return { default: module.MapAndPhotoDialogs };
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

const LazyGenealogyTreeDialog = lazy(async () => {
  const module = await import("@/components/reader/genealogy-tree-dialog");
  return { default: module.GenealogyTreeDialog };
});

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function createWelcomeHomeTab(): ReaderTab {
  return {
    id: createId(),
    title: "Welcome Home",
    root: {
      ...createLeaf(0, 0, "page"),
      pageId: "welcome-home",
    },
  };
}

function createGenesisReaderTab(): ReaderTab {
  return {
    id: createId(),
    title: "Genesis 1",
    root: createLeaf(0, 0, "reader"),
  };
}

export function KJVReader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [tabs, setTabs] = useState<ReaderTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeReaderWordHighlight, setActiveReaderWordHighlight] = useState<{
    leafId: string;
    verseNumber: number;
    word: string;
  } | null>(null);
  const [pendingReaderScrollTargets, setPendingReaderScrollTargets] = useState<
    PendingReaderScrollTarget[]
  >([]);
  const [sidebarOpenRequestKey, setSidebarOpenRequestKey] = useState(0);
  const [sidebarCloseRequestKey, setSidebarCloseRequestKey] = useState(0);
  const [isCompletionCelebrationOpen, setIsCompletionCelebrationOpen] =
    useState(false);
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const [completionCelebrationVerse, setCompletionCelebrationVerse] = useState(
    COMPLETION_CELEBRATION_VERSES[0],
  );
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState(false);
  const [guidedTourStepIndex, setGuidedTourStepIndex] = useState(0);
  const [isReferenceCommandOpen, setIsReferenceCommandOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const previousBibleCompletionRef = useRef(false);
  const didApplyStartupWelcomeHomeRef = useRef(false);
  const didInitializeReaderRef = useRef(false);
  const finishFirstReaderReadyMeasureRef = useRef<(() => void) | null>(null);
  const hasOpenSearchView = useMemo(
    () => tabs.some((tab) => panelNodeContainsView(tab.root, "search")),
    [tabs],
  );
  const {
    isStudyMode,
    tabsOrientation,
    isRightSidebarOpen,
    isGenealogyTreeOpen,
    genealogyTreePersonId,
    setIsStudyMode,
    setTabsOrientation,
    setIsRightSidebarOpen,
    setIsGenealogyTreeOpen,
    setGenealogyTreePersonId,
  } = useReaderShellState();
  const {
    preferences: {
      theme,
      setTheme,
      readerColorTheme,
      setReaderColorTheme,
      fontSize,
      setFontSize,
      lightHighlightColor,
      setLightHighlightColor,
      darkHighlightColor,
      setDarkHighlightColor,
      verseSpacing,
      setVerseSpacing,
      hideReadModeVerseNumbers,
      setHideReadModeVerseNumbers,
      readModeParagraphIndent,
      setReadModeParagraphIndent,
      flowVersesByParagraph,
      setFlowVersesByParagraph,
      showWelcomeHomeAtStartup,
      setShowWelcomeHomeAtStartup,
      wordVerseSelectionTarget,
      setWordVerseSelectionTarget,
      notesLinkOpenTarget,
      setNotesLinkOpenTarget,
      searchResultOpenTarget,
      setSearchResultOpenTarget,
      bookmarkOpenTarget,
      setBookmarkOpenTarget,
      referenceLinkOpenTarget,
      setReferenceLinkOpenTarget,
    },
    readingProgress: { readChapters, setReadChapters },
    corpus: { books, isCorpusLoaded, loadError },
    searchPages: {
      stateByLeafId: searchPageStateByLeafId,
      changeState: changeSearchPageState,
      initializeState: initializeSearchPageState,
      pruneState: pruneSearchPageState,
      swapState: swapSearchPageState,
    },
    verseSearch: {
      index: verseSearchIndex,
      isBuilding: isVerseSearchIndexBuilding,
      isReady: isVerseSearchIndexReady,
      error: verseSearchIndexError,
    },
  } = useReaderController({
    tabsOrientation,
    setTabsOrientation,
    searchEnabled: hasOpenSearchView,
  });
  const wordVerseSelectionTargetRef =
    useRef<WordVerseSelectionTarget>(wordVerseSelectionTarget);

  useEffect(() => {
    let lastNotifiedAt = 0;
    const notify = () => {
      const issueKeys = consumeLocalStorageIssueKeys();
      if (issueKeys.length === 0 || Date.now() - lastNotifiedAt < 1_000) {
        return;
      }
      lastNotifiedAt = Date.now();
      toast.warning("Some saved reader data could not be used.", {
        description:
          "The reader recovered safely. Export important notes/bookmarks before clearing site data if the warning continues.",
      });
    };
    notify();
    window.addEventListener(LOCAL_STORAGE_ISSUE_EVENT, notify);
    return () => window.removeEventListener(LOCAL_STORAGE_ISSUE_EVENT, notify);
  }, []);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "visual" | "targeting" | "other"
  >("visual");
  const [tokenPopup, setTokenPopup] = useState<TokenPopupState | null>(null);
  const [fullscreenLeafId, setFullscreenLeafId] = useState<string | null>(null);
  const [panelMenuOpenLeafId, setPanelMenuOpenLeafId] = useState<string | null>(
    null,
  );
  const [concordanceWordAccordionValue, setConcordanceWordAccordionValue] =
    useState<string[]>([]);
  const [topicsAccordionValue, setTopicsAccordionValue] = useState<string[]>([]);
  const [webstersWordAccordionValue, setWebstersWordAccordionValue] = useState<
    string[]
  >([]);
  const [aiDictionaryWordAccordionValue, setAIDictionaryWordAccordionValue] =
    useState<string[]>([]);
  const [bibleWordBookWordAccordionValue, setBibleWordBookWordAccordionValue] =
    useState<string[]>([]);
  const [strongsWordAccordionValue, setStrongsWordAccordionValue] = useState<
    string[]
  >([]);
  const {
    targetedPanelLeafId,
    targetedPanelLeafIdRef,
    setTargetedPanelLeafId,
    showTargetedPanelToggle,
    toggleTargetedPanel,
  } = usePanelTargeting({
    tabs,
    wordVerseSelectionTarget,
    notesLinkOpenTarget,
    searchResultOpenTarget,
    bookmarkOpenTarget,
    referenceLinkOpenTarget,
  });
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
  const fullscreenRequestedLeafIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;

    const computeInstalled = () =>
      mediaQuery?.matches === true ||
      (
        window.navigator as Navigator & {
          standalone?: boolean;
        }
      ).standalone === true;

    const handleInstalledStateChange = () => {
      setIsPwaInstalled(computeInstalled());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsPwaInstalled(true);
    };

    handleInstalledStateChange();
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery?.addEventListener?.("change", handleInstalledStateChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery?.removeEventListener?.("change", handleInstalledStateChange);
    };
  }, []);

  const installPwa = useCallback(async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    const promptEvent = deferredInstallPrompt;
    setDeferredInstallPrompt(null);
    await promptEvent.prompt();
    const userChoice = await promptEvent.userChoice;
    if (userChoice.outcome === "accepted") {
      setIsPwaInstalled(true);
    }
  }, [deferredInstallPrompt]);
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
    clearLeafHighlights,
    setLeafHighlights,
    queueVerseHighlights,
    setVerseHighlights,
    swapLeafHighlights,
    pruneLeafHighlights,
  } = useVerseHighlights({
    panelElementRefs,
    activeTabId,
    tabsVersion: tabs,
  });
  const { parseCurrentLayoutHash, applyParsedLayout } = useLayoutHashSync({
    isLoaded: isLoaded && isCorpusLoaded,
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
  });

  useEffect(() => {
    const finishMeasure = beginPerformanceMeasure("kjv:first-reader-ready");
    finishFirstReaderReadyMeasureRef.current = finishMeasure;
    return () => {
      if (finishFirstReaderReadyMeasureRef.current === finishMeasure) {
        finishMeasure();
        finishFirstReaderReadyMeasureRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    wordVerseSelectionTargetRef.current = wordVerseSelectionTarget;
  }, [wordVerseSelectionTarget]);

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
    if (didInitializeReaderRef.current) {
      return;
    }

    const parsedLayout = parseCurrentLayoutHash();
    if (loadError) {
      didInitializeReaderRef.current = true;
      setIsLoaded(true);
      finishFirstReaderReadyMeasureRef.current?.();
      finishFirstReaderReadyMeasureRef.current = null;
      return;
    }
    if (books.length === 0 || (parsedLayout && !isCorpusLoaded)) {
      return;
    }

    didInitializeReaderRef.current = true;
    if (parsedLayout && parsedLayout.tabs.length > 0) {
      applyParsedLayout(parsedLayout);
    } else {
      const readerTab = createGenesisReaderTab();
      const initialTabs = showWelcomeHomeAtStartup
        ? [readerTab, createWelcomeHomeTab()]
        : [readerTab];
      setTabs(initialTabs);
      setActiveTabId(initialTabs[initialTabs.length - 1]?.id ?? readerTab.id);
    }
    setIsLoaded(true);
    finishFirstReaderReadyMeasureRef.current?.();
    finishFirstReaderReadyMeasureRef.current = null;
  }, [
    applyParsedLayout,
    books,
    isCorpusLoaded,
    loadError,
    parseCurrentLayoutHash,
    showWelcomeHomeAtStartup,
  ]);

  useEffect(() => {
    if (!isLoaded || didApplyStartupWelcomeHomeRef.current) {
      return;
    }
    didApplyStartupWelcomeHomeRef.current = true;
    setTabs((currentTabs) => {
      if (currentTabs.length === 0) {
        return currentTabs;
      }
      const existingWelcomeTab = currentTabs.find(
        (tab) =>
          tab.root.type === "leaf" &&
          tab.root.view === "page" &&
          tab.root.pageId === "welcome-home",
      );
      const otherTabs = currentTabs.filter(
        (tab) =>
          !(
            tab.root.type === "leaf" &&
            tab.root.view === "page" &&
            tab.root.pageId === "welcome-home"
          ),
      );
      const nextTabs =
        showWelcomeHomeAtStartup
          ? [...otherTabs, existingWelcomeTab ?? createWelcomeHomeTab()]
          : currentTabs;
      const welcomeTab = nextTabs.find(
        (tab) =>
          tab.root.type === "leaf" &&
          tab.root.view === "page" &&
          tab.root.pageId === "welcome-home",
      );
      if (welcomeTab) {
        setActiveTabId(welcomeTab.id);
      }
      return nextTabs;
    });
  }, [isLoaded, setTabs, showWelcomeHomeAtStartup, tabs]);

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
    importNotes,
    changeNotesTabState,
    initializeNotesTabState,
    swapNotesTabState,
    pruneNotesTabState,
    generalNotes,
    contextNotes,
  } = useReaderNotes({
    activeTab,
  });

  const {
    readerBookmarks,
    highlightModeEnabledByLeafId,
    selectedHighlightScope,
    setSelectedHighlightScope,
    upsertBookmark,
    updateBookmark,
    deleteBookmark,
    importBookmarks,
    toggleHighlightModeForLeaf,
    disableHighlightModeForLeaf,
    swapHighlightModeForLeaves,
    pruneHighlightModeForLeaves,
    createChapterBookmark,
  } = useReaderBookmarks({
    books,
  });
  const {
    importSummary,
    closeImportSummary,
    notesImportInputRef,
    bookmarksImportInputRef,
    exportNotes,
    exportBookmarks,
    handleImportNotesFile,
    handleImportBookmarksFile,
  } = usePanelTransfer({
    readerNotes,
    readerBookmarks,
    importNotes,
    importBookmarks,
  });
  const activeLeafIds = useMemo(
    () => new Set(tabs.flatMap((tab) => collectLeafIds(tab.root))),
    [tabs],
  );

  const notesHighlightScope = useMemo<BookmarkScope | null>(() => {
    if (selectedHighlightScope) {
      return selectedHighlightScope;
    }
    if (!activeTab) {
      return null;
    }

    for (const leafId of collectLeafIds(activeTab.root)) {
      const leaf = findLeafNode(activeTab.root, leafId);
      if (!leaf || leaf.view !== "reader") {
        continue;
      }
      const ranges = highlightedVerseRangesByLeafId[leafId] ?? [];
      if (ranges.length === 0) {
        continue;
      }
      if (ranges.length === 1) {
        const onlyRange = ranges[0];
        if (onlyRange.start === onlyRange.end) {
          return {
            type: "verse",
            bookIndex: leaf.bookIndex,
            chapterIndex: leaf.chapterIndex,
            verseNumber: onlyRange.start,
          };
        }
        return {
          type: "range",
          start: {
            bookIndex: leaf.bookIndex,
            chapterIndex: leaf.chapterIndex,
            verseNumber: onlyRange.start,
          },
          end: {
            bookIndex: leaf.bookIndex,
            chapterIndex: leaf.chapterIndex,
            verseNumber: onlyRange.end,
          },
        };
      }
      return {
        type: "selection",
        bookIndex: leaf.bookIndex,
        chapterIndex: leaf.chapterIndex,
        ranges,
      };
    }

    return null;
  }, [activeTab, highlightedVerseRangesByLeafId, selectedHighlightScope]);

  const sidebarAvailable = isStudyMode && wordVerseSelectionTarget === "sidebar";

  useEffect(() => {
    if (wordVerseSelectionTarget !== "sidebar" && isRightSidebarOpen) {
      setIsRightSidebarOpen(false);
    }
  }, [isRightSidebarOpen, setIsRightSidebarOpen, wordVerseSelectionTarget]);

  const mapWebstersResult = useCallback(
    (key: string, entry: WebstersEntry) => ({ key, entry }),
    [],
  );
  const mapAIDictionaryResult = useCallback(
    (key: string, entry: AIDictionaryEntry) => ({ key, entry }),
    [],
  );
  const mapHitchcocksResult = useCallback(
    (key: string, definition: string) => ({ key, definition }),
    [],
  );

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
  ]);
  const mapOldEnglishResult = useCallback(
    (key: string, definitions: string[]) => ({ key, definitions }),
    [],
  );
  const mapBibleWordBookResult = useCallback(
    (key: string, entry: BibleWordBookEntry) => ({ key, entry }),
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
    setConcordanceSearchTerm,
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
    searchTerm: topicsSearchTerm,
    selectedLetters: topicsSelectedLetters,
    isLoading: isTopicsLoading,
    isSearching: isTopicsSearching,
    error: topicsError,
    results: topicsResults,
    availableLetters: topicsAvailableLetters,
    ensureTopicsLoaded,
    applySearch: applyTopicsSearch,
    selectLetter: selectTopicsLetter,
  } = useTopicsTool();

  const applyTopicsFilter = useCallback(
    (rawValue?: string) => {
      setTopicsAccordionValue([]);
      applyTopicsSearch(rawValue);
    },
    [applyTopicsSearch],
  );

  const selectTopicsLetterFilter = useCallback(
    (letter: string) => {
      setTopicsAccordionValue([]);
      selectTopicsLetter(letter);
    },
    [selectTopicsLetter],
  );

  const {
    payload: websters,
    searchTerm: webstersSearchTerm,
    isSearching: isWebstersSearching,
    isLoading: isWebstersLoading,
    error: webstersError,
    results: webstersSearchResults,
    setSearchTerm: setWebstersSearchTerm,
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
    payload: aiDictionary,
    searchTerm: aiDictionarySearchTerm,
    isSearching: isAIDictionarySearching,
    isLoading: isAIDictionaryLoading,
    error: aiDictionaryError,
    results: aiDictionarySearchResults,
    setSearchTerm: setAIDictionarySearchTerm,
    setSelectedResult: setSelectedAIDictionaryEntry,
    ensureLoaded: ensureAIDictionaryLoaded,
    applySearch: applyAIDictionarySearchRaw,
  } = useDictionarySearchTool<
    AIDictionaryPayload,
    AIDictionaryEntry,
    { key: string; entry: AIDictionaryEntry }
  >({
    load: loadAIDictionary,
    errorMessage: "Failed to load AI Dictionary data",
    mapResult: mapAIDictionaryResult,
    getSearchStrings: (key, entry) => [
      key,
      ...(entry.aliases ?? []),
      ...entry.definitions,
      entry.note ?? "",
    ],
  });

  const applyAIDictionarySearch = useCallback(
    (rawValue?: string) => {
      setAIDictionaryWordAccordionValue([]);
      applyAIDictionarySearchRaw(rawValue);
    },
    [applyAIDictionarySearchRaw],
  );

  const openAIDictionaryEntry = useCallback(
    async (rawValue: string) => {
      const data = aiDictionary ?? (await ensureAIDictionaryLoaded());
      const matchedKey = resolveAIDictionaryKey(data, rawValue);
      if (!matchedKey) {
        applyAIDictionarySearch(rawValue);
        return;
      }
      setAIDictionaryWordAccordionValue([matchedKey]);
      setAIDictionarySearchTerm("");
      setSelectedAIDictionaryEntry({ key: matchedKey, entry: data[matchedKey] });
    },
    [
      aiDictionary,
      applyAIDictionarySearch,
      ensureAIDictionaryLoaded,
      setAIDictionarySearchTerm,
      setSelectedAIDictionaryEntry,
    ],
  );

  const resolveAIDictionaryEntryTarget = useCallback(
    (rawValue: string) => {
      if (!aiDictionary) {
        return null;
      }
      return resolveAIDictionaryKey(aiDictionary, rawValue);
    },
    [aiDictionary],
  );

  const {
    payload: hitchcocks,
    searchTerm: hitchcocksSearchTerm,
    isSearching: isHitchcocksSearching,
    isLoading: isHitchcocksLoading,
    error: hitchcocksError,
    results: hitchcocksSearchResults,
    setSearchTerm: setHitchcocksSearchTerm,
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
    setSearchTerm: setOldEnglishSearchTerm,
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
    payload: bibleWordBook,
    searchTerm: bibleWordBookSearchTerm,
    isSearching: isBibleWordBookSearching,
    isLoading: isBibleWordBookLoading,
    error: bibleWordBookError,
    results: bibleWordBookSearchResults,
    setSearchTerm: setBibleWordBookSearchTerm,
    setIsSearching: setIsBibleWordBookSearching,
    setIsLoading: setIsBibleWordBookLoading,
    setError: setBibleWordBookError,
    setSelectedResult: setSelectedBibleWordBookEntry,
    ensureLoaded: ensureBibleWordBookLoaded,
    applySearch: applyBibleWordBookSearchRaw,
  } = useDictionarySearchTool<
    BibleWordBookPayload,
    BibleWordBookEntry,
    { key: string; entry: BibleWordBookEntry }
  >({
    load: loadBibleWordBook,
    errorMessage: "Failed to load Bible Word-Book data",
    mapResult: mapBibleWordBookResult,
    getSearchStrings: (key, entry) => [
      key,
      ...(entry.aliases ?? []),
      entry.partOfSpeech ?? "",
      entry.partOfSpeechLabel ?? "",
      entry.meaning,
      entry.body,
      ...(entry.sourceReferences ?? []),
    ],
  });

  const applyBibleWordBookSearch = useCallback(
    (rawValue?: string) => {
      setBibleWordBookWordAccordionValue([]);
      applyBibleWordBookSearchRaw(rawValue);
    },
    [applyBibleWordBookSearchRaw],
  );

  const {
    payload: phrases,
    searchTerm: phrasesSearchTerm,
    isSearching: isPhrasesSearching,
    isLoading: isPhrasesLoading,
    error: phrasesError,
    results: phrasesSearchResults,
    setSearchTerm: setPhrasesSearchTerm,
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
    setSearchTerm: setUnitsSearchTerm,
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
    setMapsSearchTerm,
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
    setBibleWordBookError(null);
    setIsBibleWordBookLoading(false);
    setIsBibleWordBookSearching(false);
    setBibleWordBookWordAccordionValue([]);
    setSelectedBibleWordBookEntry(null);
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
    setBibleWordBookError,
    setGenealogyError,
    setHitchcocksError,
    setIsConcordanceLoading,
    setIsCrossRefsLoading,
    setIsBibleWordBookLoading,
    setIsBibleWordBookSearching,
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
    setSelectedBibleWordBookEntry,
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
    setBibleWordBookWordAccordionValue,
  ]);

  const updateActiveTab = useCallback(
    (updater: (tab: ReaderTab) => ReaderTab) => {
      if (!activeTabId) {
        return;
      }

      setTabs((currentTabs) =>
        currentTabs.map((tab) =>
          tab.id === activeTabId ? updater(tab) : tab,
        ),
      );
    },
    [activeTabId, setTabs],
  );

  const updateLeafLocation = useCallback((
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
  ) => {
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
  }, [clearLeafHighlights, setSelectedHighlightScope, updateActiveTab]);

  const { leafHistoryByLeafId, navigateLeafHistory, swapLeafHistoryState } =
    useLeafHistory({
      tabs,
      applyHistoryEntry: (leafId, entry) => {
        updateLeafLocation(leafId, {
          view: entry.view,
          bookIndex: entry.bookIndex,
          chapterIndex: entry.chapterIndex,
          pickerTestament: entry.pickerTestament,
          pickerBookIndex: entry.pickerBookIndex,
        });
        updateActiveTab((tab) => ({
          ...tab,
          root: updateLeafNode(tab.root, leafId, {
            pageId: entry.pageId,
          }),
        }));
      },
    });

  const {
    neighborsForLeaf,
    clearAllPanelPreviews,
    clearMovePreview,
    clearAddPreview,
    clearOrientationPreview,
    splitLeaf,
    setMovePreviewTarget,
    setAddPreviewTarget,
    setGroupInsertPreviewTarget,
    setAroundGroupPreviewTarget,
    setOrientationPreviewTarget,
    insertPanelInGroup,
    addAroundGroup,
    toggleParentGroupOrientation,
    moveLeaf,
    closeLeaf,
  } = usePanelInteractionController({
    activeRoot: activeTab?.root ?? null,
    modelLeafNeighbors,
    panelElementRefs,
    panelMenuOpenLeafId,
    setPanelMenuOpenLeafId,
    fullscreenLeafId,
    setFullscreenLeafId,
    fullscreenRequestedLeafIdRef,
    updateActiveTab,
    swapNotesTabState,
    swapSearchPageState,
    swapLeafHistoryState,
    swapHighlightModeForLeaves,
    swapLeafHighlights,
    setActiveReaderWordHighlight,
    setPendingReaderScrollTargets,
    setTargetedPanelLeafId,
  });

  usePendingReaderScroll({
    activeTabId,
    tabs,
    highlightedVerseRangesByLeafId,
    pendingReaderScrollTargets,
    setPendingReaderScrollTargets,
    panelElementRefs,
  });

  const {
    tabsRef,
    showTabById,
    moveLeafChapter,
    openChapterInNewTab,
    openSearchTab,
    openStaticPageTab,
    openNotesTab,
    openStudyTool,
  } = useWorkspaceNavigation({
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeRoot: activeTab?.root ?? null,
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
  });

  const shareLayout = useCallback(async () => {
    const href = window.location.href;
    try {
      await navigator.clipboard.writeText(href);
      toast.success("Layout copied to clipboard.");
    } catch {
      toast.error("Unable to copy layout to clipboard.");
    }
  }, []);

  const {
    openReaderTarget,
    openBookmarkTarget,
    openSearchResultTarget,
    openChapterReference,
    runReferenceCommandAction,
  } = usePanelRouting({
    activeTabId,
    books,
    tabsRef,
    targetedPanelLeafIdRef,
    setTabs,
    setTargetedPanelLeafId,
    showTabById,
    clearLeafHighlights,
    setLeafHighlights,
    setSelectedHighlightScope,
    setPendingReaderScrollTargets,
    setActiveReaderWordHighlight,
    bookmarkOpenTarget,
    searchResultOpenTarget,
    referenceLinkOpenTarget,
  });

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

  const syncTokenAccordionState = useCallback(
    (rawWord: string, options: TokenAccordionOptions = {}) => {
      setConcordanceAccordionValue(
        deriveTokenAccordionState(rawWord, {
          ...options,
          concordanceData: options.concordanceData ?? concordance,
          webstersData: options.webstersData ?? websters,
          aiDictionaryData: options.aiDictionaryData ?? aiDictionary,
          bibleWordBookData: options.bibleWordBookData ?? bibleWordBook,
          hitchcocksData: options.hitchcocksData ?? hitchcocks,
          oldEnglishData: options.oldEnglishData ?? oldEnglish,
          unitsData: options.unitsData ?? units,
          genealogyData: options.genealogyData ?? genealogy,
          ancientMapsData: options.ancientMapsData ?? ancientMaps,
          strongsGreekData: options.strongsGreekData ?? strongsGreek,
          strongsHebrewData: options.strongsHebrewData ?? strongsHebrew,
        }),
      );
    },
    [
      ancientMaps,
      aiDictionary,
      bibleWordBook,
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

  const { openWordInStudyTools } = useWordStudyCoordinator({
    books,
    concordance,
    websters,
    aiDictionary,
    bibleWordBook,
    hitchcocks,
    oldEnglish,
    phrases,
    units,
    genealogy,
    ancientMaps,
    strongsGreek,
    strongsHebrew,
    ensureConcordanceLoaded,
    ensureWebstersLoaded,
    ensureAIDictionaryLoaded,
    ensureBibleWordBookLoaded,
    ensureHitchcocksLoaded,
    ensureOldEnglishLoaded,
    ensurePhrasesLoaded,
    ensureUnitsLoaded,
    ensureGenealogyLoaded,
    ensureAncientMapsLoaded,
    ensureStrongsLoaded,
    openStudyTool,
    setNotesContext,
    setConcordanceAccordionValue,
    setConcordanceError,
    setIsConcordanceLoading,
    setConcordanceSearchTerm,
    setConcordanceWordAccordionValue,
    setSelectedConcordanceWord,
    setWebstersSearchTerm,
    setWebstersWordAccordionValue,
    setSelectedWebstersEntry,
    setAIDictionarySearchTerm,
    setAIDictionaryWordAccordionValue,
    setSelectedAIDictionaryEntry,
    setBibleWordBookSearchTerm,
    setBibleWordBookWordAccordionValue,
    setSelectedBibleWordBookEntry,
    setHitchcocksSearchTerm,
    setSelectedHitchcocksEntry,
    setOldEnglishSearchTerm,
    setSelectedOldEnglishEntry,
    setPhrasesSearchTerm,
    setSelectedPhrasesEntry,
    setUnitsSearchTerm,
    setSelectedUnitsEntry,
    setGenealogySearchTerm,
    setSelectedGenealogyIds,
    setMapsSearchTerm,
    setSelectedMapsEntries,
    setStrongsError,
    setIsStrongsLoading,
    setStrongsSearchTerm,
    setIsStrongsSearching,
    setStrongsWordAccordionValue,
    setSelectedStrongsEntry,
    strongsSearchInputRef,
  });

  const {
    openCrossReferencesForVerse,
    openNoteLinkTarget,
    openTokenDetailsFromElement,
  } = useWordStudyNavigation({
    books,
    crossRefs,
    ensureCrossRefsLoaded,
    openStudyTool,
    setCrossRefsError,
    setIsCrossRefsLoading,
    setSelectedCrossReferences,
    setNotesContext,
    openReaderTarget,
    notesLinkOpenTarget,
    setActiveReaderWordHighlight,
    syncTokenAccordionState,
    openWordInStudyTools,
    setTokenPopup,
  });

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
        setActiveReaderWordHighlight(null);
        openCrossReferencesForVerse(bookIndex, chapterIndex, verseNumber);
        return;
      }

      setActiveReaderWordHighlight(null);
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
        setSelectedHighlightScope({
          type: "selection",
          bookIndex,
          chapterIndex,
          ranges: nextRanges,
        });
      }
    },
    [
      highlightedVerseRangesByLeafId,
      highlightModeEnabledByLeafId,
      openCrossReferencesForVerse,
      setActiveReaderWordHighlight,
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


  const {
    openReference: openConcordanceReference,
    renderPreview: referencePreviewContent,
  } = useReferencePreview({
    books,
    openChapterReference,
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

  const activeHighlightColor =
    theme === "dark" ? darkHighlightColor : lightHighlightColor;
  const highlightTextColor = useMemo(
    () => readableHighlightTextColor(activeHighlightColor),
    [activeHighlightColor],
  );
  const highlightCheckboxColor = useMemo(
    () => readableHighlightTextColor(highlightTextColor),
    [highlightTextColor],
  );

  const firstReaderTabId = useMemo(
    () =>
      tabs.find((tab) => panelNodeContainsView(tab.root, "reader"))?.id ?? null,
    [tabs],
  );

  const guidedTourSteps = useMemo<GuidedTourStep[]>(
    () => [
      {
        id: "main-menu",
        title: "Main Menu",
        description:
          "Use the menu to open pages such as Settings, Reading Progress, Download, Help, and more.",
        selector: "[data-tour='main-menu']",
      },
      {
        id: "reference-command-button",
        title: "Quick Open",
        description:
          "Use Quick Open to type Bible references such as John 3:16 or several passages at once, then choose whether to open them in tabs or panels.",
        selector: "[data-tour='reference-command-button']",
      },
      {
        id: "search-button",
        title: "Search",
        description:
          "Open the search workspace from here to run phrase, word, and regex searches across the Bible.",
        selector: "[data-tour='search-button']",
      },
      {
        id: "mode-toggle",
        title: "Read and Study Modes",
        description:
          "Switch between simpler reading and full study mode here. Study mode enables the sidebar and broader tool workflow.",
        selector: "[data-tour='mode-toggle']",
      },
      {
        id: "tabs-strip",
        title: "Tabs",
        description:
          "Your layouts live in tabs, making it easy to organize different reading, study, and page setups.",
        selector: "[data-tour='tabs-strip']",
      },
      {
        id: "add-tab",
        title: "Add Tabs",
        description:
          "Use this button to create another tab for a separate reading layout, page, or study workspace.",
        selector: "[data-tour='add-tab']",
      },
      {
        id: "tab-options",
        title: "Tab Options",
        description:
          "Each tab has its own options menu for relabeling, reordering, and closing that tab.",
        selector: "[data-tour='tab-options']",
      },
      {
        id: "sidebar",
        title: "Study Sidebar",
        description:
          "In study mode, the sidebar gives quick access to tools, notes, and bookmarks alongside the Bible text.",
        selector: "[data-tour='sidebar']",
      },
      {
        id: "reader-panel",
        title: "Reader Panel",
        description:
          "This is the main Bible reading workspace. From here you can read, split panels, highlight verses, and open study tools.",
        selector: "[data-tour='reader-panel']",
      },
      {
        id: "panel-menu",
        title: "Panel Options",
        description:
          "Each panel has its own menu for history, fullscreen, home, splitting, moving, and other panel-specific actions.",
        selector: "[data-tour='panel-menu']",
      },
      {
        id: "panel-bottom-bar",
        title: "Panel Bottom Bar",
        description:
          "The bottom bar gives quick access to chapter audio, chapter progress updates, and chapter navigation.",
        selector: "[data-tour='panel-bottom-bar']",
      },
    ],
    [],
  );

  const goToGuidedTourStep = useCallback(
    (nextIndex: number) => {
      const clampedIndex = Math.max(
        0,
        Math.min(nextIndex, guidedTourSteps.length - 1),
      );
      const step = guidedTourSteps[clampedIndex];
      if (
        (step.id === "reader-panel" || step.id === "panel-menu") &&
        firstReaderTabId
      ) {
        setActiveTabId(firstReaderTabId);
      }
      setGuidedTourStepIndex(clampedIndex);
    },
    [firstReaderTabId, guidedTourSteps],
  );

  const startGuidedTour = useCallback(() => {
    setIsGuidedTourOpen(true);
    goToGuidedTourStep(0);
  }, [goToGuidedTourStep]);

  const closeGuidedTour = useCallback(() => {
    setIsGuidedTourOpen(false);
  }, []);

  useEffect(() => {
    const hasTopicsLeaf = tabs.some((tab) => {
      const stack = [tab.root];
      while (stack.length > 0) {
        const node = stack.pop();
        if (!node) {
          continue;
        }
        if (node.type === "leaf") {
          if (node.view === "topics") {
            return true;
          }
          continue;
        }
        stack.push(node.first, node.second);
      }
      return false;
    });

    if (studyWorkspaceTab !== "topics" && !hasTopicsLeaf) {
      return;
    }
    void ensureTopicsLoaded().catch(() => {
      // Error state is set by ensureTopicsLoaded.
    });
  }, [ensureTopicsLoaded, studyWorkspaceTab, tabs]);

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
    isAIDictionarySectionOpen,
    isStrongsSectionOpen,
    isBibleWordBookSectionOpen,
    isKjvWordsPhrasesSectionOpen,
    isMapsSectionOpen,
    isGenealogySectionOpen,
    isHitchcocksSectionOpen,
    hasCrossRefsInfo,
    hasConcordanceInfo,
    hasWebstersInfo,
    hasAIDictionaryInfo,
    hasStrongsInfo,
    hasBibleWordBookInfo,
    hasKjvWordsPhrasesInfo,
    hasMapsInfo,
    hasHitchcocksInfo,
    hasGenealogyInfo,
  } = deriveStudySidebarState({
    accordionValue: concordanceAccordionValue,
    crossRefsCount: selectedCrossReferences?.references.length ?? 0,
    concordanceCount: concordanceSearchResults.length,
    webstersCount: webstersSearchResults.length,
    aiDictionaryCount: aiDictionarySearchResults.length,
    strongsCount: strongsSearchResults.length,
    bibleWordBookCount: bibleWordBookSearchResults.length,
    kjvWordsPhrasesCount:
      oldEnglishSearchResults.length +
      phrasesSearchResults.length +
      unitsSearchResults.length,
    mapsCount: mapsSearchResults.length,
    hitchcocksCount: hitchcocksSearchResults.length,
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
    aiDictionaryProps: {
      hasInfo: hasAIDictionaryInfo,
      isOpen: isAIDictionarySectionOpen,
      isLoading: isAIDictionaryLoading,
      isSearching: isAIDictionarySearching,
      error: aiDictionaryError,
      searchTerm: aiDictionarySearchTerm,
      results: aiDictionarySearchResults,
      wordAccordionValue: aiDictionaryWordAccordionValue,
      onWordAccordionValueChange: setAIDictionaryWordAccordionValue,
      resolveEntryTarget: resolveAIDictionaryEntryTarget,
      onOpenEntry: openAIDictionaryEntry,
      onSearch: applyAIDictionarySearch,
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
    kjvWordsPhrasesProps: {
      hasInfo: hasKjvWordsPhrasesInfo,
      isOpen: isKjvWordsPhrasesSectionOpen,
      oldEnglish: {
        isLoading: isOldEnglishLoading,
        isSearching: isOldEnglishSearching,
        error: oldEnglishError,
        searchTerm: oldEnglishSearchTerm,
        results: oldEnglishSearchResults,
      },
      phrases: {
        isLoading: isPhrasesLoading,
        isSearching: isPhrasesSearching,
        error: phrasesError,
        searchTerm: phrasesSearchTerm,
        results: phrasesSearchResults,
      },
      units: {
        isLoading: isUnitsLoading,
        isSearching: isUnitsSearching,
        error: unitsError,
        searchTerm: unitsSearchTerm,
        results: unitsSearchResults,
      },
      onSearch: (term: string) => {
        applyOldEnglishSearch(term);
        applyPhrasesSearch(term);
        applyUnitsSearch(term);
      },
      renderPreview: referencePreviewContent,
      onOpenReference: openConcordanceReference,
      onCloseSidebar: closeRightSidebarForMobile,
    },
    bibleWordBookProps: {
      hasInfo: hasBibleWordBookInfo,
      isOpen: isBibleWordBookSectionOpen,
      isLoading: isBibleWordBookLoading,
      isSearching: isBibleWordBookSearching,
      error: bibleWordBookError,
      searchTerm: bibleWordBookSearchTerm,
      results: bibleWordBookSearchResults,
      wordAccordionValue: bibleWordBookWordAccordionValue,
      onWordAccordionValueChange: setBibleWordBookWordAccordionValue,
      onSearch: applyBibleWordBookSearch,
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

  const topicsPanelProps = {
    isLoading: isTopicsLoading,
    isSearching: isTopicsSearching,
    error: topicsError,
    searchTerm: topicsSearchTerm,
    selectedLetters: topicsSelectedLetters,
    availableLetters: topicsAvailableLetters,
    results: topicsResults,
    topicAccordionValue: topicsAccordionValue,
    onTopicAccordionValueChange: setTopicsAccordionValue,
    onSearch: applyTopicsFilter,
    onSelectLetter: selectTopicsLetterFilter,
    renderPreview: referencePreviewContent,
    onOpenReference: openConcordanceReference,
    onCloseSidebar: closeRightSidebarForMobile,
  };

  const sharedBookmarksProps = {
    books,
    bookmarks: readerBookmarks,
    onOpenBookmark: openBookmarkTarget,
    onUpdateBookmark: updateBookmark,
    onDeleteBookmark: deleteBookmark,
  };
  const settingsPanelProps = {
    activeTab: activeSettingsTab,
    onActiveTabChange: setActiveSettingsTab,
    theme,
    onThemeChange: setTheme,
    readerColorTheme,
    onReaderColorThemeChange: setReaderColorTheme,
    fontSize,
    onIncreaseFontSize: () => setFontSize((current) => current + 4),
    onDecreaseFontSize: () => setFontSize((current) => Math.max(8, current - 4)),
    onResetFontSize: () => setFontSize(16),
    lightHighlightColor,
    onLightHighlightColorChange: (value: string) =>
      setLightHighlightColor(normalizeHighlightColor(value)),
    onResetLightHighlightColor: () =>
      setLightHighlightColor(defaultHighlightColor()),
    darkHighlightColor,
    onDarkHighlightColorChange: (value: string) =>
      setDarkHighlightColor(normalizeHighlightColor(value)),
    onResetDarkHighlightColor: () =>
      setDarkHighlightColor(defaultHighlightColor()),
    verseSpacing,
    onVerseSpacingChange: setVerseSpacing,
    hideReadModeVerseNumbers,
    onHideReadModeVerseNumbersChange: setHideReadModeVerseNumbers,
    readModeParagraphIndent,
    onReadModeParagraphIndentChange: setReadModeParagraphIndent,
    flowVersesByParagraph,
    onFlowVersesByParagraphChange: setFlowVersesByParagraph,
    tabsOrientation,
    onTabsOrientationChange: setTabsOrientation,
    wordVerseSelectionTarget,
    onWordVerseSelectionTargetChange: setWordVerseSelectionTarget,
    notesLinkOpenTarget,
    onNotesLinkOpenTargetChange: setNotesLinkOpenTarget,
    searchResultOpenTarget,
    onSearchResultOpenTargetChange: setSearchResultOpenTarget,
    bookmarkOpenTarget,
    onBookmarkOpenTargetChange: setBookmarkOpenTarget,
    referenceLinkOpenTarget,
    onReferenceLinkOpenTargetChange: setReferenceLinkOpenTarget,
    showWelcomeHomeAtStartup,
    onShowWelcomeHomeAtStartupChange: setShowWelcomeHomeAtStartup,
  };
  const progressPanelProps = {
    totalProgressPercent,
    progressByTestament,
    onSetAllTestamentChaptersRead: setAllTestamentChaptersRead,
    onSetAllBookChaptersRead: setAllBookChaptersRead,
    onOpenChapterInNewTab: openChapterInNewTab,
    onToggleChapterRead: toggleChapterRead,
    onResetAllProgress: resetAllProgress,
  };

  const mountedTabPanels = tabs.map((tab) => {
    const isActive = tab.id === activeTabId;
    return (
      <div
        key={tab.id}
        className={isActive ? "absolute inset-0 min-h-0 min-w-0" : "hidden"}
        inert={!isActive}
      >
        <ReaderPanelTree
          root={tab.root}
          books={books}
          activeRoot={tab.root}
          chapterRefIndex={chapterRefIndex}
          chapterRefCount={chapterRefs.length}
          readChapters={readChapters}
          readChapterCountByBook={readChapterCountByBook}
          hideReadModeVerseNumbers={hideReadModeVerseNumbers}
          panelMenuOpenLeafId={panelMenuOpenLeafId}
          setPanelMenuOpenLeafId={setPanelMenuOpenLeafId}
          modelLeafNeighbors={
            isActive ? modelLeafNeighbors : EMPTY_LEAF_NEIGHBORS
          }
          neighborsForLeaf={neighborsForLeaf}
          fullscreenLeafId={fullscreenLeafId}
          panelElementRefs={panelElementRefs}
          clearAllPanelPreviews={clearAllPanelPreviews}
          updateLeafLocation={updateLeafLocation}
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
          isVerseSearchIndexBuilding={isVerseSearchIndexBuilding}
          isVerseSearchIndexReady={isVerseSearchIndexReady}
          verseSearchIndexError={verseSearchIndexError}
          ensureConcordanceWordsLoaded={ensureConcordanceLoaded}
                onOpenSearchResult={openSearchResultTarget}
          notes={readerNotes}
          notesContext={notesContext}
          activeReaderWordHighlight={activeReaderWordHighlight}
          notesTabStateByLeafId={notesTabStateByLeafId}
          onChangeNotesTabState={changeNotesTabState}
          searchPageStateByLeafId={searchPageStateByLeafId}
          onChangeSearchPageState={changeSearchPageState}
          onCreateGeneralNote={createGeneralNote}
          onCreateContextNote={createContextNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          onOpenNoteLink={openNoteLinkTarget}
          selectedHighlightScope={notesHighlightScope}
          showTargetedPanelToggle={showTargetedPanelToggle}
          targetedPanelLeafId={targetedPanelLeafId}
          onToggleTargetedPanel={toggleTargetedPanel}
          canGoLeafHistoryBack={(leafId) =>
            (leafHistoryByLeafId[leafId]?.index ?? 0) > 0
          }
          canGoLeafHistoryForward={(leafId) => {
            const history = leafHistoryByLeafId[leafId];
            if (!history) {
              return false;
            }
            return history.index < history.entries.length - 1;
          }}
          onGoLeafHistoryBack={(leafId) => navigateLeafHistory(leafId, -1)}
          onGoLeafHistoryForward={(leafId) => navigateLeafHistory(leafId, 1)}
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
          topicsPanelProps={topicsPanelProps}
          bookmarksPanelProps={sharedBookmarksProps}
          settingsPanelProps={settingsPanelProps}
          progressPanelProps={progressPanelProps}
          canInstallPwa={deferredInstallPrompt !== null}
          isPwaInstalled={isPwaInstalled}
          onInstallPwa={installPwa}
          renderReferencePreview={referencePreviewContent}
          onOpenReference={openConcordanceReference}
          onCloseSidebar={closeRightSidebarForMobile}
          onStartTour={startGuidedTour}
          onOpenSearchTab={openSearchTab}
          onOpenStaticPageTab={openStaticPageTab}
        />
      </div>
    );
  });
  return (
    <main
      className="reader-shell h-screen w-full overflow-hidden bg-background"
      style={
        {
          "--verse-highlight-bg": activeHighlightColor,
          "--verse-highlight-fg": highlightTextColor,
          "--verse-highlight-checkbox-fg": highlightCheckboxColor,
        } as React.CSSProperties
      }
    >
      <SidebarProvider
        open={sidebarAvailable ? isRightSidebarOpen : false}
        onOpenChange={(open) => {
          if (!sidebarAvailable) {
            return;
          }
          setIsRightSidebarOpen(open);
        }}
        style={
          {
            "--sidebar-width": "24rem",
            "--sidebar-width-mobile": "94vw",
          } as React.CSSProperties
        }
      >
        <SidebarOpenRequestSync
          requestKey={sidebarOpenRequestKey}
          enabled={sidebarAvailable}
        />
        <SidebarCloseRequestSync
          requestKey={sidebarCloseRequestKey}
          enabled={sidebarAvailable}
        />
        <SidebarInset className="flex h-screen min-h-0 flex-col overflow-hidden">
          <ReaderTopBar
            isStudyMode={isStudyMode}
            showSidebarToggle={sidebarAvailable}
            onStudyModeChange={setIsStudyMode}
            onOpenReferenceCommand={() => setIsReferenceCommandOpen(true)}
            onOpenSearch={openSearchTab}
            onShareLayout={shareLayout}
            onOpenProgress={() => openStaticPageTab("progress")}
            onOpenSettings={() => openStaticPageTab("settings")}
            onOpenPage={openStaticPageTab}
            onExportNotes={exportNotes}
            onImportNotes={() => notesImportInputRef.current?.click()}
            onExportBookmarks={exportBookmarks}
            onImportBookmarks={() => bookmarksImportInputRef.current?.click()}
          />
          <ReferenceCommandDialog
            books={books}
            open={isReferenceCommandOpen}
            onOpenChange={setIsReferenceCommandOpen}
            onRunAction={runReferenceCommandAction}
          />
          <input
            ref={notesImportInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.currentTarget.value = "";
              void handleImportNotesFile(file);
            }}
          />
          <input
            ref={bookmarksImportInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.currentTarget.value = "";
              void handleImportBookmarksFile(file);
            }}
          />
          <AlertDialog
            open={importSummary !== null}
            onOpenChange={(open) => {
              if (!open) {
                closeImportSummary();
              }
            }}
          >
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {importSummary?.isError
                    ? `Import ${importSummary?.kind === "bookmarks" ? "Bookmarks" : "Notes"} Failed`
                    : `${importSummary?.kind === "bookmarks" ? "Bookmarks" : "Notes"} Imported`}
                </AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col gap-2">
                  <span className="block">{importSummary?.message}</span>
                  {importSummary && !importSummary.isError ? (
                    <>
                      <span className="block">
                        Imported: {importSummary.importedCount}
                      </span>
                      <span className="block">
                        Replaced existing: {importSummary.replacedCount}
                      </span>
                      <span className="block">
                        Skipped invalid: {importSummary.skippedCount}
                      </span>
                    </>
                  ) : null}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={closeImportSummary}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <TabsWorkspace
            tabsOrientation={tabsOrientation}
            tabsStrip={tabsStrip}
          readerContent={
              <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
                {mountedTabPanels}
              </div>
            }
          />
          <GuidedTour
            open={isGuidedTourOpen}
            stepIndex={guidedTourStepIndex}
            steps={guidedTourSteps}
            onNext={() => {
              if (guidedTourStepIndex >= guidedTourSteps.length - 1) {
                closeGuidedTour();
                return;
              }
              goToGuidedTourStep(guidedTourStepIndex + 1);
            }}
            onPrevious={() => {
              goToGuidedTourStep(guidedTourStepIndex - 1);
            }}
            onClose={closeGuidedTour}
          />
        </SidebarInset>

        {sidebarAvailable ? (
          <Suspense fallback={null}>
            <LazyReaderStudySidebar
              visible={sidebarAvailable}
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
              topicsProps={topicsPanelProps}
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

      <Toaster theme={theme} />

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
