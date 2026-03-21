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
  loadAIDictionary,
  loadBibleWordBook,
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
  resolveAIDictionaryKey,
  resolveAIDictionaryPhraseKeyForToken,
  resolveConcordanceKey,
  resolveBibleWordBookKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolvePhraseKeyForToken,
  resolveUnitsKey,
  resolveWebstersKey,
} from "@/lib/references";
import {
  defaultHighlightColor,
  normalizeHighlightColor,
  readableHighlightTextColor,
} from "@/lib/highlight-color";
import { chapterProgressKey, panelViewportElement } from "@/lib/reader-view";
import {
  createBookmarksExportPayload,
  createNotesExportPayload,
  downloadJsonFile,
  parseImportedBookmarksPayload,
  parseImportedNotesPayload,
} from "@/lib/reader-transfer";
import {
  clearSingleLeafReferenceIfMissing,
  filterRecordEntries,
  swapRecordEntries,
  swapSingleLeafReference,
} from "@/lib/leaf-state";
import {
  collectLeafIds,
  countLeaves,
  createId,
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
  AIDictionaryEntry,
  AIDictionaryPayload,
  ConcordancePayload,
  CrossRefsPayload,
  BibleWordBookEntry,
  BibleWordBookPayload,
  GenealogyPayload,
  GenealogyPerson,
  HitchcocksPayload,
  LeafNode,
  OldEnglishPayload,
  PhraseEntry,
  PhrasesPayload,
  PanelDirection,
  PanelNode,
  ReaderColorTheme,
  ReaderTab,
  SearchPageState,
  SearchResultOpenTarget,
  SplitOrientation,
  StrongsPayload,
  StudyWorkspaceTool,
  TabsOrientation,
  TokenPopupState,
  UnitsEntry,
  UnitsPayload,
  WebstersEntry,
  WebstersPayload,
  WordVerseSelectionTarget,
  NotesLinkOpenTarget,
  BookmarkOpenTarget,
  ReferenceLinkOpenTarget,
} from "@/types/reader";
import type { BookmarkScope, ReaderBookmark } from "@/types/bookmarks";
import type { NoteLinkTarget } from "@/types/notes";
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
import {
  usePanelRouting,
  type PendingReaderScrollTarget,
} from "@/hooks/use-panel-routing";
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
import {
  GuidedTour,
  type GuidedTourStep,
} from "@/components/reader/guided-tour";
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

function isDedicatedLeafViewTab(
  tab: ReaderTab,
  view: LeafNode["view"],
): boolean {
  return tab.root.type === "leaf" && tab.root.view === view;
}

function buildLeafHistoryEntry(leaf: LeafNode) {
  return {
    view: leaf.view,
    bookIndex: leaf.bookIndex,
    chapterIndex: leaf.chapterIndex,
    pickerTestament: leaf.pickerTestament,
    pickerBookIndex: leaf.pickerBookIndex,
    pageId: leaf.pageId,
  };
}

function leafHistoryEntryEquals(
  left: ReturnType<typeof buildLeafHistoryEntry>,
  right: ReturnType<typeof buildLeafHistoryEntry>,
) {
  return (
    left.view === right.view &&
    left.bookIndex === right.bookIndex &&
    left.chapterIndex === right.chapterIndex &&
    left.pickerTestament === right.pickerTestament &&
    left.pickerBookIndex === right.pickerBookIndex &&
    left.pageId === right.pageId
  );
}

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
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [readerColorTheme, setReaderColorTheme] =
    useState<ReaderColorTheme>("brown");
  const [fontSize, setFontSize] = useState(16);
  const [lightHighlightColor, setLightHighlightColor] =
    useState(defaultHighlightColor);
  const [darkHighlightColor, setDarkHighlightColor] =
    useState(defaultHighlightColor);
  const [verseSpacing, setVerseSpacing] = useState(0);
  const [hideReadModeVerseNumbers, setHideReadModeVerseNumbers] =
    useState(false);
  const [readModeParagraphIndent, setReadModeParagraphIndent] = useState(false);
  const [flowVersesByParagraph, setFlowVersesByParagraph] = useState(false);
  const [wordVerseSelectionTarget, setWordVerseSelectionTarget] =
    useState<WordVerseSelectionTarget>("sidebar");
  const wordVerseSelectionTargetRef =
    useRef<WordVerseSelectionTarget>("sidebar");
  const [notesLinkOpenTarget, setNotesLinkOpenTarget] =
    useState<NotesLinkOpenTarget>("new-panel");
  const [searchResultOpenTarget, setSearchResultOpenTarget] =
    useState<SearchResultOpenTarget>("new-panel");
  const [bookmarkOpenTarget, setBookmarkOpenTarget] =
    useState<BookmarkOpenTarget>("new-panel");
  const [referenceLinkOpenTarget, setReferenceLinkOpenTarget] =
    useState<ReferenceLinkOpenTarget>("new-tab");
  const [targetedPanelLeafId, setTargetedPanelLeafId] = useState<string | null>(
    null,
  );
  const [activeReaderWordHighlight, setActiveReaderWordHighlight] = useState<{
    leafId: string;
    verseNumber: number;
    word: string;
  } | null>(null);
  const [pendingReaderScrollTarget, setPendingReaderScrollTarget] =
    useState<PendingReaderScrollTarget | null>(null);
  const [leafHistoryByLeafId, setLeafHistoryByLeafId] = useState<
    Record<
      string,
      {
        entries: Array<{
          view: LeafNode["view"];
          bookIndex: number;
          chapterIndex: number;
          pickerTestament: LeafNode["pickerTestament"];
          pickerBookIndex: number | null;
          pageId: LeafNode["pageId"];
        }>;
        index: number;
      }
    >
  >({});
  const targetedPanelLeafIdRef = useRef<string | null>(null);
  const pendingLeafHistoryNavigationRef = useRef<Set<string>>(new Set());
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
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const previousBibleCompletionRef = useRef(false);
  const pendingActiveTabIdRef = useRef<string | null>(null);
  const pendingToolsTabScrollRef = useRef(false);
  const pendingToolsTabIdRef = useRef<string | null>(null);
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
  const [tabs, setTabs] = useState<ReaderTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [tokenPopup, setTokenPopup] = useState<TokenPopupState | null>(null);
  const [fullscreenLeafId, setFullscreenLeafId] = useState<string | null>(null);
  const [panelMenuOpenLeafId, setPanelMenuOpenLeafId] = useState<string | null>(
    null,
  );
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [concordanceWordAccordionValue, setConcordanceWordAccordionValue] =
    useState<string[]>([]);
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
  const tabsRef = useRef<ReaderTab[]>([]);
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
    const shouldCaptureInstallPrompt =
      activeTab !== null &&
      collectLeafIds(activeTab.root).some((leafId) => {
        const leaf = findLeafNode(activeTab.root, leafId);
        return leaf?.view === "page" && leaf.pageId === "download";
      });

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
      if (!shouldCaptureInstallPrompt) {
        return;
      }
      event.preventDefault();
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
  }, [activeTabId, tabs]);

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

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, [queueVerseHighlights, setTabsOrientation, setVerseHighlights]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.readerTheme = readerColorTheme;
  }, [readerColorTheme]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("kjv-display-settings-v1");
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as {
        readerColorTheme?: ReaderColorTheme;
        fontSize?: number;
        highlightColor?: string;
        lightHighlightColor?: string;
        darkHighlightColor?: string;
        verseSpacing?: number;
        hideReadModeVerseNumbers?: boolean;
        readModeParagraphIndent?: boolean;
        flowVersesByParagraph?: boolean;
        tabsOrientation?: TabsOrientation;
        studyToolOpenTarget?: "sidebar" | "panel" | "tab";
        wordVerseSelectionTarget?: WordVerseSelectionTarget;
        notesLinkOpenTarget?: NotesLinkOpenTarget;
        searchResultOpenTarget?: SearchResultOpenTarget;
        bookmarkOpenTarget?: BookmarkOpenTarget;
        referenceLinkOpenTarget?: ReferenceLinkOpenTarget;
      };
      if (typeof parsed.fontSize === "number") {
        setFontSize(Math.max(8, Math.round(parsed.fontSize)));
      }
      if (typeof parsed.lightHighlightColor === "string") {
        setLightHighlightColor(normalizeHighlightColor(parsed.lightHighlightColor));
      } else if (typeof parsed.highlightColor === "string") {
        setLightHighlightColor(normalizeHighlightColor(parsed.highlightColor));
      }
      if (typeof parsed.darkHighlightColor === "string") {
        setDarkHighlightColor(normalizeHighlightColor(parsed.darkHighlightColor));
      } else if (typeof parsed.highlightColor === "string") {
        setDarkHighlightColor(normalizeHighlightColor(parsed.highlightColor));
      }
      if (
        parsed.readerColorTheme === "brown" ||
        parsed.readerColorTheme === "contrast" ||
        parsed.readerColorTheme === "slate" ||
        parsed.readerColorTheme === "crimson" ||
        parsed.readerColorTheme === "amber" ||
        parsed.readerColorTheme === "forest" ||
        parsed.readerColorTheme === "navy" ||
        parsed.readerColorTheme === "indigo" ||
        parsed.readerColorTheme === "violet"
      ) {
        setReaderColorTheme(parsed.readerColorTheme);
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
        parsed.wordVerseSelectionTarget === "sidebar" ||
        parsed.wordVerseSelectionTarget === "new-tab" ||
        parsed.wordVerseSelectionTarget === "new-panel" ||
        parsed.wordVerseSelectionTarget === "targeted-panel"
      ) {
        setWordVerseSelectionTarget(parsed.wordVerseSelectionTarget);
      } else if (
        parsed.studyToolOpenTarget === "sidebar" ||
        parsed.studyToolOpenTarget === "panel" ||
        parsed.studyToolOpenTarget === "tab"
      ) {
        setWordVerseSelectionTarget(
          parsed.studyToolOpenTarget === "sidebar"
            ? "sidebar"
            : parsed.studyToolOpenTarget === "panel"
              ? "new-panel"
              : "new-tab",
        );
      }
      if (
        parsed.notesLinkOpenTarget === "new-tab" ||
        parsed.notesLinkOpenTarget === "new-panel" ||
        parsed.notesLinkOpenTarget === "targeted-panel"
      ) {
        setNotesLinkOpenTarget(parsed.notesLinkOpenTarget);
      }
      if (
        parsed.searchResultOpenTarget === "new-tab" ||
        parsed.searchResultOpenTarget === "new-panel" ||
        parsed.searchResultOpenTarget === "targeted-panel"
      ) {
        setSearchResultOpenTarget(parsed.searchResultOpenTarget);
      }
      if (
        parsed.bookmarkOpenTarget === "new-tab" ||
        parsed.bookmarkOpenTarget === "new-panel" ||
        parsed.bookmarkOpenTarget === "targeted-panel"
      ) {
        setBookmarkOpenTarget(parsed.bookmarkOpenTarget);
      }
      if (
        parsed.referenceLinkOpenTarget === "new-tab" ||
        parsed.referenceLinkOpenTarget === "new-panel" ||
        parsed.referenceLinkOpenTarget === "targeted-panel"
      ) {
        setReferenceLinkOpenTarget(parsed.referenceLinkOpenTarget);
      }
    } catch {
      // Ignore malformed persisted display settings.
    }
  }, [setTabsOrientation]);

  useEffect(() => {
    window.localStorage.setItem(
      "kjv-display-settings-v1",
      JSON.stringify({
        readerColorTheme,
        fontSize,
        lightHighlightColor,
        darkHighlightColor,
        verseSpacing,
        hideReadModeVerseNumbers,
        readModeParagraphIndent,
        flowVersesByParagraph,
        tabsOrientation,
        wordVerseSelectionTarget,
        notesLinkOpenTarget,
        searchResultOpenTarget,
        bookmarkOpenTarget,
        referenceLinkOpenTarget,
      }),
    );
  }, [
    readerColorTheme,
    fontSize,
    lightHighlightColor,
    darkHighlightColor,
    verseSpacing,
    hideReadModeVerseNumbers,
    readModeParagraphIndent,
    flowVersesByParagraph,
    tabsOrientation,
    wordVerseSelectionTarget,
    notesLinkOpenTarget,
    searchResultOpenTarget,
    bookmarkOpenTarget,
    referenceLinkOpenTarget,
  ]);

  useEffect(() => {
    wordVerseSelectionTargetRef.current = wordVerseSelectionTarget;
  }, [wordVerseSelectionTarget]);

  useEffect(() => {
    targetedPanelLeafIdRef.current = targetedPanelLeafId;
  }, [targetedPanelLeafId]);

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
          targetedPanelLeafIdRef.current = parsedLayout.targetedPanelLeafId;
          setTargetedPanelLeafId(parsedLayout.targetedPanelLeafId);
          setTabsOrientation(parsedLayout.tabsOrientation);
          setVerseHighlights(parsedLayout.highlightedVerseRangesByLeafId);
          for (const [leafId, ranges] of Object.entries(
            parsedLayout.highlightedVerseRangesByLeafId,
          )) {
            queueVerseHighlights(leafId, ranges);
          }
        } else {
          const welcomeTab = createWelcomeHomeTab();
          const readerTab = createGenesisReaderTab();
          setTabs([welcomeTab, readerTab]);
          setActiveTabId(welcomeTab.id);
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
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    const leafEntries = new Map<
      string,
      ReturnType<typeof buildLeafHistoryEntry>
    >();

    for (const tab of tabs) {
      for (const leafId of collectLeafIds(tab.root)) {
        const leaf = findLeafNode(tab.root, leafId);
        if (!leaf) {
          continue;
        }
        leafEntries.set(leafId, buildLeafHistoryEntry(leaf));
      }
    }

    setLeafHistoryByLeafId((current) => {
      let changed = false;
      const next: typeof current = {};

      for (const [leafId, entry] of leafEntries) {
        const existing = current[leafId];
        if (!existing) {
          next[leafId] = { entries: [entry], index: 0 };
          changed = true;
          continue;
        }

        if (pendingLeafHistoryNavigationRef.current.has(leafId)) {
          pendingLeafHistoryNavigationRef.current.delete(leafId);
          next[leafId] = { ...existing };
          continue;
        }

        const currentEntry = existing.entries[existing.index];
        if (currentEntry && leafHistoryEntryEquals(currentEntry, entry)) {
          next[leafId] = existing;
          continue;
        }

        next[leafId] = {
          entries: [...existing.entries.slice(0, existing.index + 1), entry],
          index: existing.index + 1,
        };
        changed = true;
      }

      for (const leafId of Object.keys(current)) {
        if (!leafEntries.has(leafId)) {
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [tabs]);

  useEffect(() => {
    if (!targetedPanelLeafId) {
      return;
    }
    const targetStillExists = tabs.some((tab) =>
      Boolean(findLeafNode(tab.root, targetedPanelLeafId)),
    );
    if (!targetStillExists) {
      targetedPanelLeafIdRef.current = null;
      setTargetedPanelLeafId(null);
    }
  }, [tabs, targetedPanelLeafId]);

  const showTargetedPanelToggle = useMemo(
    () =>
      wordVerseSelectionTarget === "targeted-panel" ||
      notesLinkOpenTarget === "targeted-panel" ||
      searchResultOpenTarget === "targeted-panel" ||
      bookmarkOpenTarget === "targeted-panel" ||
      referenceLinkOpenTarget === "targeted-panel",
    [
      bookmarkOpenTarget,
      notesLinkOpenTarget,
      referenceLinkOpenTarget,
      searchResultOpenTarget,
      wordVerseSelectionTarget,
    ],
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
    const pendingTabId = pendingActiveTabIdRef.current;
    if (!pendingTabId) {
      return;
    }

    if (!tabs.some((tab) => tab.id === pendingTabId)) {
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
  }, [activeTabId, tabs, tabsOrientation]);

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
        targetedPanelLeafId: parsed.targetedPanelLeafId,
      });
      syncedLayoutHashRef.current = nextHash;
      setTabs(parsed.tabs);
      setActiveTabId(
        parsed.tabs[parsed.activeTabIndex]?.id ?? parsed.tabs[0]?.id ?? null,
      );
      targetedPanelLeafIdRef.current = parsed.targetedPanelLeafId;
      setTargetedPanelLeafId(parsed.targetedPanelLeafId);
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
  const [searchPageStateByLeafId, setSearchPageStateByLeafId] = useState<
    Record<string, SearchPageState>
  >({});
  const notesImportInputRef = useRef<HTMLInputElement | null>(null);
  const bookmarksImportInputRef = useRef<HTMLInputElement | null>(null);
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

  const createDefaultSearchPageState = useCallback(
    (): SearchPageState => ({
      searchMode: "smart",
      caseSensitive: false,
      chipInput: "",
      phraseInput: "",
      lastSearchMode: null,
      lastSearchCaseSensitive: false,
      lastSearchPhraseInput: "",
      lastSearchSelectedWords: [],
      isControlsCollapsed: false,
      selectedWords: [],
      expandedBookTree: ["entire", "old", "new"],
      selectedBookIndexes: books.map((_, index) => index),
      currentPage: 1,
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
    setSearchPageStateByLeafId((current) =>
      filterRecordEntries(current, activeLeafIds),
    );
    setLeafHistoryByLeafId((current) =>
      filterRecordEntries(current, activeLeafIds),
    );
    pruneHighlightModeForLeaves(activeLeafIds);
    pruneLeafHighlights(activeLeafIds);
    setActiveReaderWordHighlight((current) =>
      clearSingleLeafReferenceIfMissing(current, activeLeafIds),
    );
    setPendingReaderScrollTarget((current) =>
      clearSingleLeafReferenceIfMissing(current, activeLeafIds),
    );
  }, [
    activeLeafIds,
    pruneHighlightModeForLeaves,
    pruneLeafHighlights,
    pruneNotesTabState,
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
  const verseSearchIndex = useMemo(() => buildVerseSearchIndex(books), [books]);

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

  useEffect(() => {
    domNeighborCacheRef.current = { root: null, neighbors: new Map() };
  }, [activeTab]);
  const updateActiveTab = useCallback((updater: (tab: ReaderTab) => ReaderTab) => {
    if (!activeTabId) {
      return;
    }

    setTabs((currentTabs) =>
      currentTabs.map((tab) => (tab.id === activeTabId ? updater(tab) : tab)),
    );
  }, [activeTabId, setTabs]);

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

    swapNotesTabState(leafId, targetLeafId);
    setSearchPageStateByLeafId((current) =>
      swapRecordEntries(current, leafId, targetLeafId),
    );
    setLeafHistoryByLeafId((current) =>
      swapRecordEntries(current, leafId, targetLeafId),
    );
    swapHighlightModeForLeaves(leafId, targetLeafId);
    swapLeafHighlights(leafId, targetLeafId);
    setActiveReaderWordHighlight((current) =>
      swapSingleLeafReference(current, leafId, targetLeafId),
    );
    setPendingReaderScrollTarget((current) =>
      swapSingleLeafReference(current, leafId, targetLeafId),
    );
    setTargetedPanelLeafId((current) => {
      if (current === leafId) {
        targetedPanelLeafIdRef.current = targetLeafId;
        return targetLeafId;
      }
      if (current === targetLeafId) {
        targetedPanelLeafIdRef.current = leafId;
        return leafId;
      }
      return current;
    });

    updateActiveTab((tab) => ({
      ...tab,
      root: swapLeafContent(tab.root, leafId, targetLeafId),
    }));
    clearAllPanelPreviews();
  }

  function closeLeaf(leafId: string) {
    updateActiveTab((tab) => {
      if (countLeaves(tab.root) <= 1) {
        return {
          ...tab,
          root: updateLeafNode(tab.root, leafId, {
            view: "picker",
            pickerTestament: null,
            pickerBookIndex: null,
          }),
        };
      }
      const result = removeLeafNode(tab.root, leafId);
      return result.next ? { ...tab, root: result.next } : tab;
    });
    if (fullscreenLeafId === leafId && document.fullscreenElement) {
      void document.exitFullscreen();
    }
  }

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

  const navigateLeafHistory = useCallback(
    (leafId: string, direction: -1 | 1) => {
      const history = leafHistoryByLeafId[leafId];
      if (!history) {
        return;
      }

      const nextIndex = history.index + direction;
      if (nextIndex < 0 || nextIndex >= history.entries.length) {
        return;
      }

      const entry = history.entries[nextIndex];
      pendingLeafHistoryNavigationRef.current.add(leafId);
      setLeafHistoryByLeafId((current) => ({
        ...current,
        [leafId]: {
          ...history,
          index: nextIndex,
        },
      }));
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
    [leafHistoryByLeafId, updateActiveTab, updateLeafLocation],
  );

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

  const findTabContainingLeafId = useCallback(
    (leafId: string, sourceTabs: ReaderTab[] = tabsRef.current) =>
      sourceTabs.find((tab) => Boolean(findLeafNode(tab.root, leafId))) ?? null,
    [],
  );

  const showTabById = useCallback((tabId: string) => {
    pendingActiveTabIdRef.current = null;
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && activeElement !== document.body) {
        activeElement.blur();
      }
    }
    setActiveTabId(tabId);
  }, []);

  const scrollVerseIntoView = useCallback(
    (
      leafId: string,
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd = verseStart,
    ) => {
      let attempts = 0;

      const elementOffsetWithin = (
        element: HTMLElement,
        ancestor: HTMLElement,
      ) => {
        let offset = 0;
        let current: HTMLElement | null = element;

        while (current && current !== ancestor) {
          offset += current.offsetTop;
          current = current.offsetParent as HTMLElement | null;
        }

        return offset;
      };

      const attemptScroll = () => {
        const panelElement = panelElementRefs.current[leafId];
        const viewport = panelViewportElement(panelElement);
        const chapterRoot = panelElement?.querySelector<HTMLElement>(
          "[data-reader-chapter-root]",
        );
        const chapterMatches =
          chapterRoot?.dataset.bookIndex === `${bookIndex}` &&
          chapterRoot?.dataset.chapterIndex === `${chapterIndex}`;
        const startVerseElement =
          chapterMatches
            ? panelElement?.querySelector<HTMLElement>(
                `[data-verse-number="${verseStart}"]`,
              )
            : null;
        const endVerseElement =
          chapterMatches
            ? panelElement?.querySelector<HTMLElement>(
                `[data-verse-number="${verseEnd}"]`,
              )
            : null;
        const panelIsVisible = Boolean(panelElement && panelElement.offsetParent);

        if (startVerseElement && endVerseElement && viewport && panelIsVisible) {
          const startTop = elementOffsetWithin(startVerseElement, viewport);
          const endTop = elementOffsetWithin(endVerseElement, viewport);
          const blockTop = Math.min(startTop, endTop);
          const blockBottom = Math.max(
            startTop + startVerseElement.offsetHeight,
            endTop + endVerseElement.offsetHeight,
          );
          const blockHeight = Math.max(
            startVerseElement.offsetHeight,
            blockBottom - blockTop,
          );
          const nextTop =
            blockTop -
            viewport.clientHeight / 2 +
            blockHeight / 2;
          const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);

          viewport.scrollTo({
            top: Math.min(Math.max(0, nextTop), maxTop),
            behavior: "smooth",
          });
          return;
        }

        if (attempts < 60) {
          attempts += 1;
          requestAnimationFrame(attemptScroll);
          return;
        }
      };

      requestAnimationFrame(attemptScroll);
    },
    [panelElementRefs],
  );

  const scrollChapterToTop = useCallback(
    (leafId: string, bookIndex: number, chapterIndex: number) => {
      let attempts = 0;

      const attemptScroll = () => {
        const panelElement = panelElementRefs.current[leafId];
        const viewport = panelViewportElement(panelElement);
        const chapterRoot = panelElement?.querySelector<HTMLElement>(
          "[data-reader-chapter-root]",
        );
        const chapterMatches =
          chapterRoot?.dataset.bookIndex === `${bookIndex}` &&
          chapterRoot?.dataset.chapterIndex === `${chapterIndex}`;
        const panelIsVisible = Boolean(panelElement && panelElement.offsetParent);

        if (chapterMatches && viewport && panelIsVisible) {
          viewport.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        if (attempts < 60) {
          attempts += 1;
          requestAnimationFrame(attemptScroll);
        }
      };

      requestAnimationFrame(attemptScroll);
    },
    [panelElementRefs],
  );

  useEffect(() => {
    if (!pendingReaderScrollTarget) {
      return;
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) {
        return;
      }
      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        requestAnimationFrame(() => {
          if (cancelled) {
            return;
          }
          if (pendingReaderScrollTarget.mode === "chapter-top") {
            scrollChapterToTop(
              pendingReaderScrollTarget.leafId,
              pendingReaderScrollTarget.bookIndex,
              pendingReaderScrollTarget.chapterIndex,
            );
          } else {
            scrollVerseIntoView(
              pendingReaderScrollTarget.leafId,
              pendingReaderScrollTarget.bookIndex,
              pendingReaderScrollTarget.chapterIndex,
              pendingReaderScrollTarget.verseStart,
              pendingReaderScrollTarget.verseEnd,
            );
          }
          setPendingReaderScrollTarget((current) =>
            current?.leafId === pendingReaderScrollTarget.leafId &&
            current.mode === pendingReaderScrollTarget.mode &&
            current.bookIndex === pendingReaderScrollTarget.bookIndex &&
            current.chapterIndex === pendingReaderScrollTarget.chapterIndex &&
            current.verseStart === pendingReaderScrollTarget.verseStart &&
            current.verseEnd === pendingReaderScrollTarget.verseEnd
              ? null
              : current,
          );
        });
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    activeTabId,
    highlightedVerseRangesByLeafId,
    pendingReaderScrollTarget,
    scrollChapterToTop,
    scrollVerseIntoView,
    tabs,
  ]);

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

  const createTargetedToolsPanelInActiveTab = useCallback(() => {
    if (!activeTabId) {
      return false;
    }

    const currentTabs = tabsRef.current;
    const activeIndex = currentTabs.findIndex((tab) => tab.id === activeTabId);
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

    const nextLeafId = nextLeaf.id;
    targetedPanelLeafIdRef.current = nextLeafId;
    setTargetedPanelLeafId(nextLeafId);
    showTabById(activeTabId);
    return true;
  }, [activeTabId, setTabs, showTabById]);

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
  }, [findTabContainingLeafId, setTabs, showTabById]);

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

    setTabs((currentTabs) => {
      return [
        ...currentTabs,
        {
          id: nextTabId,
          title: "Tools",
          root: nextLeaf,
        },
      ];
    });
  }, [setActiveTabId, setTabs]);

  const {
    openReaderTarget,
    openBookmarkTarget: openBookmarkTargetRaw,
    openSearchResultTarget: openSearchResultTargetRaw,
    openChapterReference: openChapterReferenceRaw,
  } = usePanelRouting({
    activeTabId,
    books,
    tabsRef,
    targetedPanelLeafIdRef,
    setTabs,
    setTargetedPanelLeafId,
    showTabById,
    findTabContainingLeafId,
    clearLeafHighlights,
    setLeafHighlights,
    setSelectedHighlightScope,
    setPendingReaderScrollTarget,
    setActiveReaderWordHighlight,
  });

  const openBookmarkTarget = useCallback(
    (bookmark: ReaderBookmark) => {
      openBookmarkTargetRaw(bookmark, bookmarkOpenTarget);
    },
    [bookmarkOpenTarget, openBookmarkTargetRaw],
  );

  const openSearchResultTarget = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd?: number,
    ) => {
      openSearchResultTargetRaw(
        bookIndex,
        chapterIndex,
        verseStart,
        verseEnd,
        searchResultOpenTarget,
      );
    },
    [openSearchResultTargetRaw, searchResultOpenTarget],
  );

  const openChapterReference = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd = verseStart,
    ) => {
      openChapterReferenceRaw(
        bookIndex,
        chapterIndex,
        verseStart,
        verseEnd,
        referenceLinkOpenTarget,
      );
    },
    [openChapterReferenceRaw, referenceLinkOpenTarget],
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
      showStudyTool,
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

  const resolveAIDictionarySelectionAtLocation = useCallback(
    (
      aiDictionaryData: AIDictionaryPayload | null,
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
      tokenIndex: number,
    ) => {
      if (!aiDictionaryData) {
        return null;
      }
      const verse = books[bookIndex]?.chapters[chapterIndex]?.verses.find(
        (item) => item.verse === verseNumber,
      );
      if (!verse) {
        return null;
      }
      const matchedKey = resolveAIDictionaryPhraseKeyForToken(
        aiDictionaryData,
        verse.tokens,
        tokenIndex,
      );
      return matchedKey
        ? { key: matchedKey, entry: aiDictionaryData[matchedKey] }
        : null;
    },
    [books],
  );

  const resolveWordTokenAtLocation = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
      rawWord: string,
    ) => {
      const verse = books[bookIndex]?.chapters[chapterIndex]?.verses.find(
        (item) => item.verse === verseNumber,
      );
      if (!verse) {
        return null;
      }

      const normalizedWord = normalizeConcordanceWord(rawWord).toLowerCase();
      if (!normalizedWord) {
        return null;
      }

      let fallbackMatch: { token: VerseToken; tokenIndex: number } | null = null;

      for (const [tokenIndex, token] of verse.tokens.entries()) {
        const normalizedToken = normalizeConcordanceWord(token.text).toLowerCase();
        if (normalizedToken !== normalizedWord) {
          continue;
        }

        const nextMatch = { token, tokenIndex };
        if (token.strong) {
          return nextMatch;
        }
        if (!fallbackMatch) {
          fallbackMatch = nextMatch;
        }
      }

      return fallbackMatch;
    },
    [books],
  );

  const findGenealogyMatches = useCallback(
    (
      people: GenealogyPayload | null | undefined,
      rawWord: string,
      referenceKey?: string | null,
    ) => {
      if (!people) {
        return [] as GenealogyPerson[];
      }

      const normalizedWord = normalizeConcordanceWord(rawWord).toLowerCase();
      if (!normalizedWord) {
        return [] as GenealogyPerson[];
      }

      const matches = people
        .map((person) => {
          const exactNameMatch = person.names.some(
            (name) =>
              normalizeConcordanceWord(name).toLowerCase() === normalizedWord,
          );
          const byNameMatches = (person.verses?.byName ?? []).filter(
            (entry) =>
              normalizeConcordanceWord(entry.name).toLowerCase() === normalizedWord,
          );
          const currentReferenceMatch =
            Boolean(referenceKey) &&
            byNameMatches.some((entry) => entry.verses.includes(referenceKey ?? ""));

          let rank = 0;
          if (currentReferenceMatch) {
            rank = 4;
          } else if (byNameMatches.length > 0) {
            rank = 3;
          } else if (exactNameMatch) {
            rank = 2;
          }

          return {
            person,
            rank,
            totalVerses:
              person.verses?.totalVerses ??
              byNameMatches.reduce(
                (count, entry) => count + (entry.numVerses ?? entry.verses.length),
                0,
              ),
          };
        })
        .filter((entry) => entry.rank > 0)
        .sort(
          (left, right) =>
            right.rank - left.rank ||
            right.totalVerses - left.totalVerses ||
            (left.person.names[0] ?? left.person.id).localeCompare(
              right.person.names[0] ?? right.person.id,
            ),
        )
        .map((entry) => entry.person);

      const seen = new Set<string>();
      return matches.filter((person) => {
        if (seen.has(person.id)) {
          return false;
        }
        seen.add(person.id);
        return true;
      });
    },
    [],
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
        aiDictionaryData?: AIDictionaryPayload | null;
        aiDictionarySelection?: { key: string; entry: AIDictionaryEntry } | null;
        bibleWordBookData?: BibleWordBookPayload | null;
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

      const aiDictionaryData = options?.aiDictionaryData ?? aiDictionary;
      if (
        aiDictionaryData &&
        (options?.aiDictionarySelection ||
          resolveAIDictionaryKey(aiDictionaryData, rawWord))
      ) {
        nextAccordion.push("ai-dictionary");
      }

      const bibleWordBookData = options?.bibleWordBookData ?? bibleWordBook;
      if (
        bibleWordBookData &&
        resolveBibleWordBookKey(bibleWordBookData, rawWord)
      ) {
        nextAccordion.push("bible-word-book");
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
      const unitsData = options?.unitsData ?? units;
      if (
        (oldEnglishData && resolveOldEnglishKey(oldEnglishData, rawWord)) ||
        options?.phraseSelection ||
        (unitsData && resolveUnitsKey(unitsData, rawWord))
      ) {
        nextAccordion.push("kjv-words-phrases");
      }

      const genealogyData = options?.genealogyData ?? genealogy;
      const referenceKey =
        (options?.verseNumber ?? null) !== null
          ? chapterVerseKey(
              options?.bookIndex ?? 0,
              options?.chapterIndex ?? 0,
              options?.verseNumber ?? 1,
            )
          : null;
      if (findGenealogyMatches(genealogyData, rawWord, referenceKey).length > 0) {
        nextAccordion.push("genealogy");
      }

      setConcordanceAccordionValue(nextAccordion);
    },
    [
      ancientMaps,
      aiDictionary,
      bibleWordBook,
      concordance,
      findGenealogyMatches,
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
        aiDictionary?: AIDictionaryPayload | null;
        aiDictionarySelection?: { key: string; entry: AIDictionaryEntry } | null;
        bibleWordBook?: BibleWordBookPayload | null;
        hitchcocks?: HitchcocksPayload | null;
        oldEnglish?: OldEnglishPayload | null;
        phrasesSelection?: { key: string; entry: PhraseEntry } | null;
        units?: UnitsPayload | null;
        genealogy?: GenealogyPayload | null;
        ancientMaps?: AncientMapPayload | null;
        strongsGreek?: StrongsPayload | null;
        strongsHebrew?: StrongsPayload | null;
        referenceKey?: string | null;
      },
    ) => {
      setConcordanceSearchTerm("");
      setWebstersSearchTerm("");
      setAIDictionarySearchTerm("");
      setHitchcocksSearchTerm("");
      setOldEnglishSearchTerm("");
      setBibleWordBookSearchTerm("");
      setPhrasesSearchTerm("");
      setUnitsSearchTerm("");
      setStrongsSearchTerm("");
      setGenealogySearchTerm("");
      setMapsSearchTerm("");

      const nextWebsters = overrides?.websters ?? websters;
      const nextAIDictionary = overrides?.aiDictionary ?? aiDictionary;
      const nextBibleWordBook = overrides?.bibleWordBook ?? bibleWordBook;
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

      if (nextAIDictionary) {
        const matchedKey = resolveAIDictionaryKey(nextAIDictionary, rawWord);
        setAIDictionaryWordAccordionValue([]);
        setSelectedAIDictionaryEntry(
          overrides?.aiDictionarySelection ??
            (matchedKey
              ? { key: matchedKey, entry: nextAIDictionary[matchedKey] }
              : null),
        );
      } else {
        setSelectedAIDictionaryEntry(null);
      }

      if (nextBibleWordBook) {
        const matchedKey = resolveBibleWordBookKey(nextBibleWordBook, rawWord);
        setBibleWordBookWordAccordionValue([]);
        setSelectedBibleWordBookEntry(
          matchedKey
            ? { key: matchedKey, entry: nextBibleWordBook[matchedKey] }
            : null,
        );
      } else {
        setSelectedBibleWordBookEntry(null);
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
        const matches = findGenealogyMatches(
          nextGenealogy,
          rawWord,
          overrides?.referenceKey,
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
      aiDictionary,
      bibleWordBook,
      findGenealogyMatches,
      genealogy,
      hitchcocks,
      oldEnglish,
      units,
      setAIDictionarySearchTerm,
      setBibleWordBookSearchTerm,
      setConcordanceSearchTerm,
      setGenealogySearchTerm,
      setHitchcocksSearchTerm,
      setMapsSearchTerm,
      setOldEnglishSearchTerm,
      setPhrasesSearchTerm,
      setBibleWordBookWordAccordionValue,
      setSelectedBibleWordBookEntry,
      setSelectedGenealogyIds,
      setSelectedHitchcocksEntry,
      setSelectedMapsEntries,
      setSelectedOldEnglishEntry,
      setSelectedPhrasesEntry,
      setSelectedUnitsEntry,
      setSelectedAIDictionaryEntry,
      setSelectedStrongsEntry,
      setSelectedWebstersEntry,
      setStrongsSearchTerm,
      setUnitsSearchTerm,
      setWebstersSearchTerm,
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

  function openNoteLinkTarget(target: NoteLinkTarget) {
      setNotesContext(
        target.type === "chapter"
          ? {
              bookIndex: target.bookIndex,
              chapterIndex: target.chapterIndex,
            }
          : target.type === "verse"
            ? {
                bookIndex: target.bookIndex,
                chapterIndex: target.chapterIndex,
                verseNumber: target.verseNumber,
              }
            : target.type === "range"
              ? {
                  bookIndex: target.start.bookIndex,
                  chapterIndex: target.start.chapterIndex,
                  verseNumber: target.start.verseNumber,
                }
            : target.type === "selection"
              ? {
                  bookIndex: target.bookIndex,
                  chapterIndex: target.chapterIndex,
                }
            : {
                bookIndex: target.bookIndex,
                chapterIndex: target.chapterIndex,
                verseNumber: target.verseNumber,
                word: target.word,
              },
      );

      const syncWordTarget = () => {
        if (target.type !== "word") {
          return;
        }
        const rawWord = normalizeConcordanceWord(target.word) || target.word;
        const matchedToken = resolveWordTokenAtLocation(
          target.bookIndex,
          target.chapterIndex,
          target.verseNumber,
          rawWord,
        );
        openWordInStudyTools({
          rawWord,
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          verseNumber: target.verseNumber,
          tokenIndex: matchedToken?.tokenIndex ?? null,
          strongCode: matchedToken?.token.strong
            ? normalizeStrongsCode(matchedToken.token.strong)
            : null,
        });
        syncTokenAccordionState(rawWord, {
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          verseNumber: target.verseNumber,
          strongCode: matchedToken?.token.strong
            ? normalizeStrongsCode(matchedToken.token.strong)
            : null,
        });
      };
      if (target.type === "word") {
        const rawWord = normalizeConcordanceWord(target.word) || target.word;
        const leafId = openReaderTarget(
          {
            type: "verse",
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            verseNumber: target.verseNumber,
          },
          notesLinkOpenTarget,
        );
        if (leafId) {
          setActiveReaderWordHighlight({
            leafId,
            verseNumber: target.verseNumber,
            word: rawWord,
          });
        }
        syncWordTarget();
        return;
      }

      openReaderTarget(target, notesLinkOpenTarget);
  }

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

  function openWordInStudyTools({
    rawWord,
    bookIndex,
    chapterIndex,
    verseNumber,
    tokenIndex,
    strongCode,
  }: {
    rawWord: string;
    bookIndex: number;
    chapterIndex: number;
    verseNumber: number | null;
    tokenIndex: number | null;
    strongCode: string | null;
  }) {
      if (verseNumber !== null) {
        openCrossReferencesForVerse(bookIndex, chapterIndex, verseNumber);
      }

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
      if (!strongCode) {
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

      if (strongCode) {
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
        aiDictionary
          ? Promise.resolve(aiDictionary)
          : ensureAIDictionaryLoaded().catch(() => null),
        bibleWordBook
          ? Promise.resolve(bibleWordBook)
          : ensureBibleWordBookLoaded().catch(() => null),
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
          nextAIDictionary,
          nextBibleWordBook,
          nextHitchcocks,
          nextOldEnglish,
          nextPhrases,
          nextUnits,
          nextGenealogy,
          nextAncientMaps,
          nextStrongs,
        ]) => {
          const aiDictionarySelection =
            tokenIndex !== null && verseNumber !== null
              ? resolveAIDictionarySelectionAtLocation(
                  nextAIDictionary,
                  bookIndex,
                  chapterIndex,
                  verseNumber,
                  tokenIndex,
                )
              : null;
          const phraseSelection =
            tokenIndex !== null && verseNumber !== null
              ? resolvePhraseSelectionAtLocation(
                  nextPhrases,
                  bookIndex,
                  chapterIndex,
                  verseNumber,
                  tokenIndex,
                )
              : null;
          syncWordStudySelections(rawWord, strongCode, {
            websters: nextWebsters,
            aiDictionary: nextAIDictionary,
            aiDictionarySelection,
            bibleWordBook: nextBibleWordBook,
            hitchcocks: nextHitchcocks,
            oldEnglish: nextOldEnglish,
            phrasesSelection: phraseSelection,
            units: nextUnits,
            genealogy: nextGenealogy,
            ancientMaps: nextAncientMaps,
            strongsGreek: nextStrongs?.greek ?? null,
            strongsHebrew: nextStrongs?.hebrew ?? null,
            referenceKey:
              verseNumber !== null
                ? chapterVerseKey(bookIndex, chapterIndex, verseNumber)
                : null,
          });
          syncTokenAccordionState(rawWord, {
            bookIndex,
            chapterIndex,
            verseNumber,
            strongCode,
            concordanceData: nextConcordance,
            webstersData: nextWebsters,
            aiDictionaryData: nextAIDictionary,
            aiDictionarySelection,
            bibleWordBookData: nextBibleWordBook,
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
        if (strongCode) {
          setIsStrongsLoading(false);
        }
      });
  }

  function openTokenDetailsFromElement(
    element: HTMLElement,
    leafId: string,
    token: VerseToken,
    bookIndex: number,
    chapterIndex: number,
    verseNumber: number,
    tokenIndex: number,
  ) {
      if (!token.strong && !token.added) {
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
          setActiveReaderWordHighlight({
            leafId,
            verseNumber,
            word: rawWord,
          });
          setNotesContext({
            bookIndex,
            chapterIndex,
            verseNumber,
            word: rawWord,
          });
        } else {
          setActiveReaderWordHighlight(null);
        }
      } else if (rawWord) {
        setActiveReaderWordHighlight(null);
        setNotesContext({
          bookIndex,
          chapterIndex,
          word: rawWord,
        });
      } else {
        setActiveReaderWordHighlight(null);
      }

      if (!rawWord) {
        return;
      }

      const normalizedCode = token.strong
        ? normalizeStrongsCode(token.strong)
        : null;
      openWordInStudyTools({
        rawWord,
        bookIndex,
        chapterIndex,
        verseNumber:
          Number.isFinite(verseNumber) && verseNumber > 0 ? verseNumber : null,
        tokenIndex,
        strongCode: normalizedCode,
      });
  }

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
        id: "search-button",
        title: "Search",
        description:
          "Open the search workspace from here to run phrase, word, and regex searches across the Bible.",
        selector: "[data-tour='search-button']",
      },
      {
        id: "share-button",
        title: "Share Layout",
        description:
          "Use this button to copy a link to the current layout so it can be shared with others and reopened with the same tabs, panels, and positions.",
        selector: "[data-tour='share-button']",
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

  const sharedBookmarksProps = {
    books,
    bookmarks: readerBookmarks,
    onOpenBookmark: openBookmarkTarget,
    onUpdateBookmark: updateBookmark,
    onDeleteBookmark: deleteBookmark,
  };
  const exportNotes = () => {
    downloadJsonFile(
      `kjv-reader-notes-${new Date().toISOString().slice(0, 10)}.json`,
      createNotesExportPayload(readerNotes),
    );
  };

  const exportBookmarks = () => {
    downloadJsonFile(
      `kjv-reader-bookmarks-${new Date().toISOString().slice(0, 10)}.json`,
      createBookmarksExportPayload(readerBookmarks),
    );
  };

  const handleImportNotesFile = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const importedNotes = parseImportedNotesPayload(await file.text());
      importNotes(importedNotes);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to import notes.",
      );
    }
  };

  const handleImportBookmarksFile = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const importedBookmarks = parseImportedBookmarksPayload(await file.text());
      importBookmarks(importedBookmarks);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to import bookmarks.",
      );
    }
  };
  const settingsPanelProps = {
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
          modelLeafNeighbors={isActive ? modelLeafNeighbors : new Map()}
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
          onToggleTargetedPanel={(leafId) =>
            setTargetedPanelLeafId((current) => {
              const nextValue = current === leafId ? null : leafId;
              targetedPanelLeafIdRef.current = nextValue;
              return nextValue;
            })
          }
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
        style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
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
            isShareCopied={isShareCopied}
            showSidebarToggle={sidebarAvailable}
            onStudyModeChange={setIsStudyMode}
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
