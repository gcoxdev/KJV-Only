import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  ExpandIcon,
  MinimizeIcon,
  RotateCwIcon,
  SquareChevronDownIcon,
  SquareChevronLeftIcon,
  SquareChevronRightIcon,
  SquareChevronUpIcon,
  SplitSquareHorizontalIcon,
  SplitSquareVerticalIcon,
  XIcon,
} from "lucide-react";

import {
  type Book,
  type Chapter,
  type VerseToken,
} from "@/types/bible";
import { cn } from "@/lib/utils";
import {
  type AncientMapEntry,
  type AncientMapPayload,
  cleanMapMarkup,
  mapEntryLabel,
  mapEntrySearchableText,
  matchesMapWord,
  modernIdsForMapEntry,
  type MapGeoJsonPayload,
  type MapImageEntry,
  type MapPhotoDialogItem,
} from "@/lib/maps";
import {
  loadAncientMap,
  loadConcordance,
  loadCrossRefs,
  loadGenealogy,
  loadHitchcocks,
  loadKjvBooks,
  loadMapGeoJson,
  loadMapImages,
  loadOldEnglish,
  loadStrongsGreek,
  loadStrongsHebrew,
  loadWebsters,
} from "@/lib/reader-data";
import {
  chapterVerseKey,
  normalizeConcordanceWord,
  normalizeStrongsCode,
  resolveConcordanceKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolveWebstersKey,
} from "@/lib/references";
import {
  bookCodeForIndex,
  chapterProgressKey,
  iconPath,
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
  buildLeafNeighborMap,
  buildLeafNeighborMapFromDom,
  type LeafNeighbors,
} from "@/lib/reader-neighbors";
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
  SplitOrientation,
  StrongsEntry,
  StrongsPayload,
  TabsOrientation,
  TokenPopupState,
  WebstersEntry,
  WebstersPayload,
} from "@/types/reader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookChapterPicker } from "@/components/reader/book-chapter-picker";
import { SidebarOpenRequestSync } from "@/components/reader/sidebar-open-request-sync";
import { MapAndPhotoDialogs } from "@/components/reader/map-and-photo-dialogs";
import { BookPickerDialog } from "@/components/reader/book-picker-dialog";
import { RenameTabDialog } from "@/components/reader/rename-tab-dialog";
import { SettingsDialog } from "@/components/reader/settings-dialog";
import { ProgressDialog } from "@/components/reader/progress-dialog";
import { GenealogyPersonDetails } from "@/components/reader/genealogy-person-details";
import { useReferencePreview } from "@/hooks/use-reference-preview";
import { useTabActions } from "@/hooks/use-tab-actions";
import {
  STUDY_ACCORDION_ITEMS,
  useStudySidebarState,
} from "@/hooks/use-study-sidebar-state";
import { TabsStrip } from "@/components/reader/tabs-strip";
import { TokenPopupCard } from "@/components/reader/token-popup-card";
import { ReaderTopBar } from "@/components/reader/reader-top-bar";
import { TabsWorkspace } from "@/components/reader/tabs-workspace";
import { ReaderStatusScreen } from "@/components/reader/reader-status-screen";
import { ReaderStudySidebar } from "@/components/reader/reader-study-sidebar";
import {
  ChapterTextContent,
} from "@/components/reader/chapter-text-content";
import { Progress } from "@/components/ui/progress";

export function KJVReader() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
  const [tokenPopup, setTokenPopup] = useState<TokenPopupState | null>(null);
  const [fullscreenLeafId, setFullscreenLeafId] = useState<string | null>(null);
  const [panelMenuOpenLeafId, setPanelMenuOpenLeafId] = useState<string | null>(
    null,
  );
  const [bookPickerDialogLeafId, setBookPickerDialogLeafId] = useState<
    string | null
  >(null);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [leafScrollProgress, setLeafScrollProgress] = useState<
    Record<string, number>
  >({});
  const [concordance, setConcordance] = useState<ConcordancePayload | null>(
    null,
  );
  const [crossRefs, setCrossRefs] = useState<CrossRefsPayload | null>(null);
  const [selectedCrossReferences, setSelectedCrossReferences] = useState<{
    key: string;
    references: string[];
  } | null>(null);
  const [isCrossRefsLoading, setIsCrossRefsLoading] = useState(false);
  const [crossRefsError, setCrossRefsError] = useState<string | null>(null);
  const [selectedConcordanceWord, setSelectedConcordanceWord] = useState<{
    key: string;
    references: string[];
  } | null>(null);
  const [concordanceSearchTerm, setConcordanceSearchTerm] = useState("");
  const [isConcordanceSearching, setIsConcordanceSearching] = useState(false);
  const [concordanceAccordionValue, setConcordanceAccordionValue] = useState<
    string[]
  >([]);
  const [concordanceWordAccordionValue, setConcordanceWordAccordionValue] =
    useState<string[]>([]);
  const [isConcordanceLoading, setIsConcordanceLoading] = useState(false);
  const [concordanceError, setConcordanceError] = useState<string | null>(null);
  const [websters, setWebsters] = useState<WebstersPayload | null>(null);
  const [webstersSearchTerm, setWebstersSearchTerm] = useState("");
  const [isWebstersSearching, setIsWebstersSearching] = useState(false);
  const [isWebstersLoading, setIsWebstersLoading] = useState(false);
  const [webstersError, setWebstersError] = useState<string | null>(null);
  const [webstersWordAccordionValue, setWebstersWordAccordionValue] = useState<
    string[]
  >([]);
  const [selectedWebstersEntry, setSelectedWebstersEntry] = useState<{
    key: string;
    entry: WebstersEntry;
  } | null>(null);
  const [hitchcocks, setHitchcocks] = useState<HitchcocksPayload | null>(null);
  const [hitchcocksSearchTerm, setHitchcocksSearchTerm] = useState("");
  const [isHitchcocksSearching, setIsHitchcocksSearching] = useState(false);
  const [isHitchcocksLoading, setIsHitchcocksLoading] = useState(false);
  const [hitchcocksError, setHitchcocksError] = useState<string | null>(null);
  const [selectedHitchcocksEntry, setSelectedHitchcocksEntry] = useState<{
    key: string;
    definition: string;
  } | null>(null);
  const [oldEnglish, setOldEnglish] = useState<OldEnglishPayload | null>(null);
  const [oldEnglishSearchTerm, setOldEnglishSearchTerm] = useState("");
  const [isOldEnglishSearching, setIsOldEnglishSearching] = useState(false);
  const [isOldEnglishLoading, setIsOldEnglishLoading] = useState(false);
  const [oldEnglishError, setOldEnglishError] = useState<string | null>(null);
  const [selectedOldEnglishEntry, setSelectedOldEnglishEntry] = useState<{
    key: string;
    definitions: string[];
  } | null>(null);
  const [genealogy, setGenealogy] = useState<GenealogyPayload | null>(null);
  const [genealogySearchTerm, setGenealogySearchTerm] = useState("");
  const [isGenealogySearching, setIsGenealogySearching] = useState(false);
  const [isGenealogyLoading, setIsGenealogyLoading] = useState(false);
  const [genealogyError, setGenealogyError] = useState<string | null>(null);
  const [selectedGenealogyIds, setSelectedGenealogyIds] = useState<string[]>(
    [],
  );
  const [strongsGreek, setStrongsGreek] = useState<StrongsPayload | null>(null);
  const [strongsHebrew, setStrongsHebrew] = useState<StrongsPayload | null>(null);
  const [strongsSearchTerm, setStrongsSearchTerm] = useState("");
  const [isStrongsSearching, setIsStrongsSearching] = useState(false);
  const [isStrongsLoading, setIsStrongsLoading] = useState(false);
  const [strongsError, setStrongsError] = useState<string | null>(null);
  const [strongsWordAccordionValue, setStrongsWordAccordionValue] = useState<
    string[]
  >([]);
  const [selectedStrongsEntry, setSelectedStrongsEntry] = useState<{
    code: string;
    testament: "greek" | "hebrew";
    entry: StrongsEntry;
  } | null>(null);
  const [ancientMaps, setAncientMaps] = useState<AncientMapPayload | null>(null);
  const [mapsSearchTerm, setMapsSearchTerm] = useState("");
  const [isMapsSearching, setIsMapsSearching] = useState(false);
  const [isMapsLoading, setIsMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [selectedMapsEntries, setSelectedMapsEntries] = useState<
    AncientMapEntry[]
  >([]);
  const [mapsWordAccordionValue, setMapsWordAccordionValue] = useState<
    string[]
  >([]);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [activeMapDialogEntry, setActiveMapDialogEntry] =
    useState<AncientMapEntry | null>(null);
  const [mapDialogGeoJson, setMapDialogGeoJson] =
    useState<MapGeoJsonPayload | null>(null);
  const [isMapDialogLoading, setIsMapDialogLoading] = useState(false);
  const [mapDialogError, setMapDialogError] = useState<string | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [photoDialogItems, setPhotoDialogItems] = useState<MapPhotoDialogItem[]>(
    [],
  );
  const [photoDialogIndex, setPhotoDialogIndex] = useState(0);
  const [mapImages, setMapImages] = useState<MapImageEntry[] | null>(null);
  const [isMapImagesLoading, setIsMapImagesLoading] = useState(false);
  const [mapImagesError, setMapImagesError] = useState<string | null>(null);
  const [pendingVerseHighlights, setPendingVerseHighlights] = useState<
    Record<string, { start: number; end: number }>
  >({});
  const tabEndRef = useRef<HTMLDivElement>(null);
  const strongsSearchInputRef = useRef<HTMLInputElement | null>(null);
  const panelElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previewLeafIdRef = useRef<string | null>(null);
  const addPreviewLeafIdsRef = useRef<string[]>([]);
  const addPreviewDirectionRef = useRef<PanelDirection | null>(null);
  const addPreviewIsGroupRef = useRef(false);
  const orientationPreviewLeafIdsRef = useRef<string[]>([]);
  const fullscreenRequestedLeafIdRef = useRef<string | null>(null);
  const highlightedVerseElementsRef = useRef<HTMLElement[]>([]);
  const domNeighborCacheRef = useRef<{
    root: PanelNode | null;
    neighbors: Map<string, LeafNeighbors>;
  }>({
    root: null,
    neighbors: new Map(),
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
    setMapsWordAccordionValue([]);
    setSelectedMapsEntries([]);
    setIsMapDialogOpen(false);
    setIsPhotoDialogOpen(false);
    setPhotoDialogItems([]);
    setPhotoDialogIndex(0);
    setActiveMapDialogEntry(null);
    setMapDialogGeoJson(null);
    setMapDialogError(null);
    setIsMapImagesLoading(false);
    setMapImagesError(null);
  }, [isStudyMode]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("kjv-display-settings-v1");
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as {
        verseSpacing?: number;
        hideReadModeVerseNumbers?: boolean;
        readModeParagraphIndent?: boolean;
        flowVersesByParagraph?: boolean;
        tabsOrientation?: TabsOrientation;
      };
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
        verseSpacing,
        hideReadModeVerseNumbers,
        readModeParagraphIndent,
        flowVersesByParagraph,
        tabsOrientation,
      }),
    );
  }, [
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

        const initialTab = createInitialTab(1);
        setBooks(parsedBooks);
        setTabs([initialTab]);
        setActiveTabId(initialTab.id);
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

  const chapterRefs = useMemo(
    () =>
      books.flatMap((book, bIndex) =>
        book.chapters.map((_, cIndex) => ({
          bookIndex: bIndex,
          chapterIndex: cIndex,
        })),
      ),
    [books],
  );

  const chapterRefIndex = useMemo(() => {
    const map = new Map<string, number>();
    chapterRefs.forEach((ref, index) => {
      map.set(`${ref.bookIndex}-${ref.chapterIndex}`, index);
    });
    return map;
  }, [chapterRefs]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? null,
    [activeTabId, tabs],
  );
  const modelLeafNeighbors = useMemo(
    () => (activeTab ? buildLeafNeighborMap(activeTab.root) : new Map()),
    [activeTab],
  );
  const existingTabTargets = useMemo(
    () =>
      tabs
        .map((tab, index) => ({
          id: tab.id,
          index,
          title: tab.title,
        }))
        .filter((tab) => tab.id !== activeTabId),
    [tabs, activeTabId],
  );

  useEffect(() => {
    domNeighborCacheRef.current = { root: null, neighbors: new Map() };
  }, [activeTab]);
  const progressByTestament = useMemo(() => {
    const oldBooks = books.slice(0, 39);
    const newBooks = books.slice(39);

    const makeBookProgress = (book: Book, bookIndex: number) => {
      const total = book.chapters.length;
      const chapters = book.chapters.map((chapter, chapterIndex) => {
        const read = readChapters.has(
          chapterProgressKey(bookIndex, chapterIndex),
        );
        return {
          chapterIndex,
          chapterNumber: chapter.chapter,
          read,
        };
      });
      const read = chapters.reduce(
        (count, chapter) => count + (chapter.read ? 1 : 0),
        0,
      );
      return { name: book.name, bookIndex, read, total, chapters };
    };

    const oldBookProgress = oldBooks.map((book, index) =>
      makeBookProgress(book, index),
    );
    const newBookProgress = newBooks.map((book, index) =>
      makeBookProgress(book, index + 39),
    );

    const summarize = (items: { read: number; total: number }[]) =>
      items.reduce(
        (acc, item) => ({
          read: acc.read + item.read,
          total: acc.total + item.total,
        }),
        { read: 0, total: 0 },
      );

    const oldSummary = summarize(oldBookProgress);
    const newSummary = summarize(newBookProgress);
    const totalSummary = {
      read: oldSummary.read + newSummary.read,
      total: oldSummary.total + newSummary.total,
    };

    return {
      old: { label: "Old Testament", ...oldSummary, books: oldBookProgress },
      new: { label: "New Testament", ...newSummary, books: newBookProgress },
      total: totalSummary,
    };
  }, [books, readChapters]);
  const readChapterCountByBook = useMemo(() => {
    const counts = new Map<number, number>();
    for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
      const book = books[bookIndex];
      let count = 0;
      for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
        if (readChapters.has(chapterProgressKey(bookIndex, chapterIndex))) {
          count += 1;
        }
      }
      counts.set(bookIndex, count);
    }
    return counts;
  }, [books, readChapters]);
  const totalProgressPercent =
    progressByTestament.total.total > 0
      ? Math.round(
          (progressByTestament.total.read / progressByTestament.total.total) *
            100,
        )
      : 0;
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

  useEffect(() => {
    if (!activeTab) {
      return;
    }

    const leafIds: string[] = [];
    const collectLeafIds = (node: PanelNode) => {
      if (node.type === "leaf") {
        leafIds.push(node.id);
        return;
      }
      collectLeafIds(node.first);
      collectLeafIds(node.second);
    };
    collectLeafIds(activeTab.root);

    const cleanups: Array<() => void> = [];
    const viewports = new Map<string, HTMLElement>();
    const pendingProgress: Record<string, number> = {};
    let rafId: number | null = null;

    const flushPendingProgress = () => {
      rafId = null;
      setLeafScrollProgress((current) => {
        let changed = false;
        const next = { ...current };
        for (const [leafId, value] of Object.entries(pendingProgress)) {
          if (next[leafId] !== value) {
            next[leafId] = value;
            changed = true;
          }
          delete pendingProgress[leafId];
        }
        return changed ? next : current;
      });
    };

    const queueProgressForLeaf = (leafId: string, value: number) => {
      pendingProgress[leafId] = value;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(flushPendingProgress);
      }
    };

    const calculateProgress = (viewport: HTMLElement) => {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      return maxScroll <= 0
        ? 0
        : Math.round((viewport.scrollTop / maxScroll) * 100);
    };

    for (const leafId of leafIds) {
      const panelElement = panelElementRefs.current[leafId];
      const viewport = panelElement?.querySelector<HTMLElement>(
        '[data-panel-content-scroll] [data-slot="scroll-area-viewport"]',
      );

      if (!viewport) {
        continue;
      }

      viewports.set(leafId, viewport);

      const update = () => {
        const next = calculateProgress(viewport);
        queueProgressForLeaf(leafId, next);
      };

      update();
      viewport.addEventListener("scroll", update, { passive: true });
      cleanups.push(() => {
        viewport.removeEventListener("scroll", update);
      });
    }

    const onResize = () => {
      for (const [leafId, viewport] of viewports.entries()) {
        queueProgressForLeaf(leafId, calculateProgress(viewport));
      }
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => {
      window.removeEventListener("resize", onResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [activeTab]);

  useEffect(() => {
    const entries = Object.entries(pendingVerseHighlights);
    if (entries.length === 0) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      const appliedLeafIds: string[] = [];
      for (const highlightedElement of highlightedVerseElementsRef.current) {
        highlightedElement.classList.remove("verse-reference-highlight");
      }
      highlightedVerseElementsRef.current = [];

      for (const [leafId, verseRange] of entries) {
        const panelElement = panelElementRefs.current[leafId];
        const viewport = panelViewportElement(panelElement);
        if (!viewport || !panelElement) {
          continue;
        }

        const verseElements: HTMLElement[] = [];
        const seen = new Set<HTMLElement>();
        for (
          let verseNumber = verseRange.start;
          verseNumber <= verseRange.end;
          verseNumber += 1
        ) {
          const match =
            panelElement.querySelector<HTMLElement>(
              `article[data-verse-number="${verseNumber}"]`,
            ) ??
            panelElement.querySelector<HTMLElement>(
              `[data-verse-number="${verseNumber}"]`,
            );
          if (!match || seen.has(match)) {
            continue;
          }
          seen.add(match);
          verseElements.push(match);
        }
        if (verseElements.length === 0) {
          continue;
        }

        const viewportRect = viewport.getBoundingClientRect();
        let blockTop = Number.POSITIVE_INFINITY;
        let blockBottom = Number.NEGATIVE_INFINITY;
        for (const verseElement of verseElements) {
          const rect = verseElement.getBoundingClientRect();
          const top = rect.top - viewportRect.top + viewport.scrollTop;
          const bottom = rect.bottom - viewportRect.top + viewport.scrollTop;
          blockTop = Math.min(blockTop, top);
          blockBottom = Math.max(blockBottom, bottom);
          verseElement.classList.add("verse-reference-highlight");
        }
        highlightedVerseElementsRef.current = [
          ...highlightedVerseElementsRef.current,
          ...verseElements,
        ];

        const blockHeight = Math.max(1, blockBottom - blockTop);
        const centeredTop =
          blockTop - viewport.clientHeight / 2 + blockHeight / 2;
        const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const clampedTop = Math.max(0, Math.min(maxTop, centeredTop));

        viewport.scrollTo({
          top: clampedTop,
          behavior: "auto",
        });
        window.requestAnimationFrame(() => {
          viewport.scrollTo({
            top: clampedTop,
            behavior: "auto",
          });
        });

        appliedLeafIds.push(leafId);
      }

      if (appliedLeafIds.length > 0) {
        setPendingVerseHighlights((current) => {
          const next = { ...current };
          for (const leafId of appliedLeafIds) {
            delete next[leafId];
          }
          return next;
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pendingVerseHighlights, activeTabId, tabs]);

  const ensureConcordanceLoaded = useCallback(async () => {
    if (concordance) {
      return concordance;
    }
    setConcordanceError(null);
    setIsConcordanceLoading(true);
    try {
      const data = await loadConcordance();
      setConcordance(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load concordance data";
      setConcordanceError(message);
      throw error;
    } finally {
      setIsConcordanceLoading(false);
    }
  }, [concordance]);

  const ensureCrossRefsLoaded = useCallback(async () => {
    if (crossRefs) {
      return crossRefs;
    }
    setCrossRefsError(null);
    setIsCrossRefsLoading(true);
    try {
      const data = await loadCrossRefs();
      setCrossRefs(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load cross-reference data";
      setCrossRefsError(message);
      throw error;
    } finally {
      setIsCrossRefsLoading(false);
    }
  }, [crossRefs]);

  const concordanceSearchResults = useMemo(() => {
    const term = concordanceSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedConcordanceWord ? [selectedConcordanceWord] : [];
    }
    if (!concordance) {
      return [];
    }
    return Object.keys(concordance)
      .filter((word) => word.toLowerCase().includes(term))
      .sort((a, b) => a.localeCompare(b))
      .map((word) => ({
        key: word,
        references: concordance[word] ?? [],
      }));
  }, [concordance, concordanceSearchTerm, selectedConcordanceWord]);

  const applyConcordanceSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setConcordanceSearchTerm(nextTerm);
      setConcordanceWordAccordionValue([]);
      if (!nextTerm) {
        setIsConcordanceSearching(false);
        return;
      }
      setIsConcordanceSearching(true);
      void ensureConcordanceLoaded()
        .catch(() => {
          // Error state is set by ensureConcordanceLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsConcordanceSearching(false);
          });
        });
    },
    [ensureConcordanceLoaded],
  );

  const ensureWebstersLoaded = useCallback(async () => {
    if (websters) {
      return websters;
    }
    setWebstersError(null);
    setIsWebstersLoading(true);
    try {
      const data = await loadWebsters();
      setWebsters(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load Webster's data";
      setWebstersError(message);
      throw error;
    } finally {
      setIsWebstersLoading(false);
    }
  }, [websters]);

  const webstersSearchResults = useMemo(() => {
    const term = webstersSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedWebstersEntry ? [selectedWebstersEntry] : [];
    }
    if (!websters) {
      return [];
    }
    return Object.keys(websters)
      .filter((word) => word.toLowerCase().includes(term))
      .sort((a, b) => a.localeCompare(b))
      .map((word) => ({ key: word, entry: websters[word] }));
  }, [selectedWebstersEntry, websters, webstersSearchTerm]);

  const applyWebstersSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setWebstersSearchTerm(nextTerm);
      setWebstersWordAccordionValue([]);
      if (!nextTerm) {
        setIsWebstersSearching(false);
        return;
      }
      setIsWebstersSearching(true);
      void ensureWebstersLoaded()
        .catch(() => {
          // Error state is set by ensureWebstersLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsWebstersSearching(false);
          });
        });
    },
    [ensureWebstersLoaded],
  );

  const ensureHitchcocksLoaded = useCallback(async () => {
    if (hitchcocks) {
      return hitchcocks;
    }
    setHitchcocksError(null);
    setIsHitchcocksLoading(true);
    try {
      const data = await loadHitchcocks();
      setHitchcocks(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load Hitchcock's data";
      setHitchcocksError(message);
      throw error;
    } finally {
      setIsHitchcocksLoading(false);
    }
  }, [hitchcocks]);

  const hitchcocksSearchResults = useMemo(() => {
    const term = hitchcocksSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedHitchcocksEntry ? [selectedHitchcocksEntry] : [];
    }
    if (!hitchcocks) {
      return [];
    }
    return Object.keys(hitchcocks)
      .filter((word) => word.toLowerCase().includes(term))
      .sort((a, b) => a.localeCompare(b))
      .map((word) => ({ key: word, definition: hitchcocks[word] }));
  }, [hitchcocks, hitchcocksSearchTerm, selectedHitchcocksEntry]);

  const applyHitchcocksSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setHitchcocksSearchTerm(nextTerm);
      if (!nextTerm) {
        setIsHitchcocksSearching(false);
        return;
      }
      setIsHitchcocksSearching(true);
      void ensureHitchcocksLoaded()
        .catch(() => {
          // Error state is set by ensureHitchcocksLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsHitchcocksSearching(false);
          });
        });
    },
    [ensureHitchcocksLoaded],
  );

  const ensureOldEnglishLoaded = useCallback(async () => {
    if (oldEnglish) {
      return oldEnglish;
    }
    setOldEnglishError(null);
    setIsOldEnglishLoading(true);
    try {
      const data = await loadOldEnglish();
      setOldEnglish(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load Old English data";
      setOldEnglishError(message);
      throw error;
    } finally {
      setIsOldEnglishLoading(false);
    }
  }, [oldEnglish]);

  const oldEnglishSearchResults = useMemo(() => {
    const term = oldEnglishSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedOldEnglishEntry ? [selectedOldEnglishEntry] : [];
    }
    if (!oldEnglish) {
      return [];
    }
    return Object.keys(oldEnglish)
      .filter((word) => word.toLowerCase().includes(term))
      .sort((a, b) => a.localeCompare(b))
      .map((word) => ({ key: word, definitions: oldEnglish[word] }));
  }, [oldEnglish, oldEnglishSearchTerm, selectedOldEnglishEntry]);

  const applyOldEnglishSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setOldEnglishSearchTerm(nextTerm);
      if (!nextTerm) {
        setIsOldEnglishSearching(false);
        return;
      }
      setIsOldEnglishSearching(true);
      void ensureOldEnglishLoaded()
        .catch(() => {
          // Error state is set by ensureOldEnglishLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsOldEnglishSearching(false);
          });
        });
    },
    [ensureOldEnglishLoaded],
  );

  const ensureGenealogyLoaded = useCallback(async () => {
    if (genealogy) {
      return genealogy;
    }
    setGenealogyError(null);
    setIsGenealogyLoading(true);
    try {
      const data = await loadGenealogy();
      setGenealogy(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load genealogy data";
      setGenealogyError(message);
      throw error;
    } finally {
      setIsGenealogyLoading(false);
    }
  }, [genealogy]);

  const genealogyById = useMemo(() => {
    const map = new Map<string, GenealogyPerson>();
    for (const person of genealogy ?? []) {
      map.set(person.id, person);
    }
    return map;
  }, [genealogy]);

  const genealogySearchResults = useMemo(() => {
    const term = genealogySearchTerm.trim().toLowerCase();
    if (term) {
      return (genealogy ?? [])
        .filter((person) =>
          person.names.some((name) => name.toLowerCase().includes(term)),
        )
        .sort((a, b) =>
          (a.names[0] ?? a.id).localeCompare(b.names[0] ?? b.id),
        );
    }
    if (selectedGenealogyIds.length === 0) {
      return [] as GenealogyPerson[];
    }
    return selectedGenealogyIds
      .map((id) => genealogyById.get(id))
      .filter((person): person is GenealogyPerson => Boolean(person));
  }, [genealogy, genealogyById, genealogySearchTerm, selectedGenealogyIds]);

  const applyGenealogySearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setGenealogySearchTerm(nextTerm);
      if (!nextTerm) {
        setIsGenealogySearching(false);
        return;
      }
      setIsGenealogySearching(true);
      void ensureGenealogyLoaded()
        .catch(() => {
          // Error state is set by ensureGenealogyLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsGenealogySearching(false);
          });
        });
    },
    [ensureGenealogyLoaded],
  );

  const ensureStrongsLoaded = useCallback(async () => {
    if (strongsGreek && strongsHebrew) {
      return { greek: strongsGreek, hebrew: strongsHebrew };
    }
    setStrongsError(null);
    setIsStrongsLoading(true);
    try {
      const [greek, hebrew] = await Promise.all([
        strongsGreek ? Promise.resolve(strongsGreek) : loadStrongsGreek(),
        strongsHebrew ? Promise.resolve(strongsHebrew) : loadStrongsHebrew(),
      ]);
      setStrongsGreek(greek);
      setStrongsHebrew(hebrew);
      return { greek, hebrew };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load Strong's data";
      setStrongsError(message);
      throw error;
    } finally {
      setIsStrongsLoading(false);
    }
  }, [strongsGreek, strongsHebrew]);

  const strongsSearchResults = useMemo(() => {
    const term = strongsSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedStrongsEntry ? [selectedStrongsEntry] : [];
    }
    const results: Array<{
      code: string;
      testament: "greek" | "hebrew";
      entry: StrongsEntry;
    }> = [];
    const pushMatches = (
      payload: StrongsPayload | null,
      testament: "greek" | "hebrew",
    ) => {
      if (!payload) {
        return;
      }
      for (const [code, entry] of Object.entries(payload)) {
        const haystack = [
          code,
          entry.lemma ?? "",
          entry.translit ?? "",
          entry.kjv_def ?? "",
          entry.strongs_def ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (haystack.includes(term)) {
          results.push({ code, testament, entry });
        }
      }
    };
    pushMatches(strongsGreek, "greek");
    pushMatches(strongsHebrew, "hebrew");
    return results.sort((a, b) => a.code.localeCompare(b.code));
  }, [selectedStrongsEntry, strongsGreek, strongsHebrew, strongsSearchTerm]);

  const applyStrongsSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setStrongsSearchTerm(nextTerm);
      setStrongsWordAccordionValue([]);
      if (!nextTerm) {
        setIsStrongsSearching(false);
        return;
      }
      setIsStrongsSearching(true);
      void ensureStrongsLoaded()
        .catch(() => {
          // Error state is set by ensureStrongsLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsStrongsSearching(false);
          });
        });
    },
    [ensureStrongsLoaded],
  );

  const ensureAncientMapsLoaded = useCallback(async () => {
    if (ancientMaps) {
      return ancientMaps;
    }
    setMapsError(null);
    setIsMapsLoading(true);
    try {
      const data = await loadAncientMap();
      setAncientMaps(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load ancient map data";
      setMapsError(message);
      throw error;
    } finally {
      setIsMapsLoading(false);
    }
  }, [ancientMaps]);

  const ensureMapImagesLoaded = useCallback(async () => {
    if (mapImages) {
      return mapImages;
    }
    setMapImagesError(null);
    setIsMapImagesLoading(true);
    try {
      const data = await loadMapImages();
      setMapImages(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load map images";
      setMapImagesError(message);
      throw error;
    } finally {
      setIsMapImagesLoading(false);
    }
  }, [mapImages]);

  const mapImagesByLocationId = useMemo(() => {
    const index = new Map<string, MapImageEntry[]>();
    for (const image of mapImages ?? []) {
      const ids = new Set<string>([
        ...Object.keys(image.thumbnails ?? {}),
        ...Object.keys(image.descriptions ?? {}),
      ]);
      for (const id of ids) {
        const existing = index.get(id);
        if (existing) {
          existing.push(image);
        } else {
          index.set(id, [image]);
        }
      }
    }
    return index;
  }, [mapImages]);

  const mapsSearchResults = useMemo(() => {
    const term = mapsSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedMapsEntries;
    }
    if (!ancientMaps) {
      return [] as AncientMapEntry[];
    }
    return ancientMaps
      .filter((entry) => mapEntrySearchableText(entry).includes(term))
      .sort((a, b) => mapEntryLabel(a).localeCompare(mapEntryLabel(b)));
  }, [ancientMaps, mapsSearchTerm, selectedMapsEntries]);
  const mapsDisplayEntries = useMemo(
    () =>
      mapsSearchResults.map((entry, index) => {
        const itemKey = `${entry.geojson_file}-${index}`;
        const title = mapEntryLabel(entry);
        const modernIds = modernIdsForMapEntry(entry);
        const imageCandidates = modernIds.flatMap(
          (id) => mapImagesByLocationId.get(id) ?? [],
        );
        const seenImageIds = new Set<string>();
        const photoEntries = imageCandidates.filter((image) => {
          if (seenImageIds.has(image.id)) {
            return false;
          }
          seenImageIds.add(image.id);
          return true;
        });
        const linkedPlaces = Object.entries(entry.geojson_roles ?? {}).map(
          ([roleKey, role]) => ({
            roleKey,
            text: cleanMapMarkup(role.description ?? roleKey),
          }),
        );

        return {
          entry,
          itemKey,
          title,
          modernIds,
          photoEntries,
          linkedPlaces,
        };
      }),
    [mapsSearchResults, mapImagesByLocationId],
  );

  const applyMapsSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setMapsSearchTerm(nextTerm);
      setMapsWordAccordionValue([]);
      if (!nextTerm) {
        setIsMapsSearching(false);
        return;
      }
      setIsMapsSearching(true);
      void Promise.all([ensureAncientMapsLoaded(), ensureMapImagesLoaded()])
        .catch(() => {
          // Error state is set by ensure loaders.
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsMapsSearching(false);
          });
        });
    },
    [ensureAncientMapsLoaded, ensureMapImagesLoaded],
  );

  const openMapDialog = useCallback(
    (entry: AncientMapEntry) => {
      setActiveMapDialogEntry(entry);
      setIsMapDialogOpen(true);
      void ensureMapImagesLoaded().catch(() => {
        // Error state is set by ensureMapImagesLoaded.
      });
    },
    [ensureMapImagesLoaded],
  );

  const openPhotoDialog = useCallback(
    (items: MapPhotoDialogItem[], startIndex: number) => {
      if (items.length === 0) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(items.length - 1, startIndex));
      setPhotoDialogItems(items);
      setPhotoDialogIndex(clampedIndex);
      setIsPhotoDialogOpen(true);
    },
    [],
  );

  const movePhotoDialog = useCallback((direction: -1 | 1) => {
    setPhotoDialogIndex((current) => {
      if (photoDialogItems.length === 0) {
        return 0;
      }
      return (current + direction + photoDialogItems.length) % photoDialogItems.length;
    });
  }, [photoDialogItems.length]);

  useEffect(() => {
    if (!isMapDialogOpen || !activeMapDialogEntry) {
      setMapDialogGeoJson(null);
      setMapDialogError(null);
      setIsMapDialogLoading(false);
      return;
    }

    let cancelled = false;
    setMapDialogError(null);
    setIsMapDialogLoading(true);
    void loadMapGeoJson(activeMapDialogEntry.geojson_file)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setMapDialogGeoJson(payload);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load map geometry data";
        setMapDialogError(message);
        setMapDialogGeoJson(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsMapDialogLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeMapDialogEntry, isMapDialogOpen]);

  function chapterFromLeaf(leaf: LeafNode): Chapter | null {
    const book = books[leaf.bookIndex];
    if (!book) {
      return null;
    }

    return book.chapters[leaf.chapterIndex] ?? null;
  }

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

    setLeafScrollProgress((current) => {
      if (current[leafId] === 0) {
        return current;
      }
      return { ...current, [leafId]: 0 };
    });

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

  const openChapterReferenceInNewTab = useCallback((
    bookIndex: number,
    chapterIndex: number,
    verseStart: number,
    verseEnd = verseStart,
  ) => {
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
    setPendingVerseHighlights((current) => ({
      ...current,
      [nextLeaf.id]: { start: verseStart, end: verseEnd },
    }));
    setActiveTabId(nextTabId);
    setIsProgressOpen(false);
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }, [tabsOrientation]);

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
        const references = data[matchedKey] ?? [];
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
        const matchIds = matches.map((person) => person.id);
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
        setMapsWordAccordionValue([]);
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
      void ensureMapImagesLoaded().catch(() => {
        // Error state is set by ensureMapImagesLoaded.
      });
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
      ensureMapImagesLoaded,
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

  function renderLeaf(leaf: LeafNode) {
    const book = books[leaf.bookIndex];
    if (!book) {
      return null;
    }

    const chapter = chapterFromLeaf(leaf);

    const key = `${leaf.bookIndex}-${leaf.chapterIndex}`;
    const chapterReadKey = chapterProgressKey(
      leaf.bookIndex,
      leaf.chapterIndex,
    );
    const isChapterRead = readChapters.has(chapterReadKey);
    const readChapterCount = readChapterCountByBook.get(leaf.bookIndex) ?? 0;
    const isBookComplete = readChapterCount === book.chapters.length;
    const currentBookIconCode = bookCodeForIndex(leaf.bookIndex);
    const currentBookIconSrc = iconPath(
      isBookComplete ? "color" : "bw",
      currentBookIconCode,
    );
    const readingProgress = leafScrollProgress[leaf.id] ?? 0;
    const showVerseNumbers = !hideReadModeVerseNumbers;
    const isPanelMenuOpen = panelMenuOpenLeafId === leaf.id;
    const neighbors = isPanelMenuOpen
      ? (modelLeafNeighbors.get(leaf.id) ?? neighborsForLeaf(leaf.id))
      : {};
    const moveDirections = isPanelMenuOpen
      ? (["left", "right", "up", "down"] as PanelDirection[]).filter((direction) =>
          Boolean(neighbors[direction]),
        )
      : [];
    const groupTargets =
      isPanelMenuOpen && activeTab
        ? {
            left: findGroupTargetNodeId(activeTab.root, leaf.id, "left"),
            right: findGroupTargetNodeId(activeTab.root, leaf.id, "right"),
            up: findGroupTargetNodeId(activeTab.root, leaf.id, "up"),
            down: findGroupTargetNodeId(activeTab.root, leaf.id, "down"),
          }
        : { left: null, right: null, up: null, down: null };
    const parentSplit =
      isPanelMenuOpen && activeTab
        ? findParentSplitForLeaf(activeTab.root, leaf.id)
        : null;
    const nextOrientationLabel = parentSplit
      ? parentSplit.orientation === "horizontal"
        ? "Make Group Vertical"
        : "Make Group Horizontal"
      : null;
    const hasGroupAddOptions = Boolean(
      groupTargets.left ||
      groupTargets.right ||
      groupTargets.up ||
      groupTargets.down,
    );
    const refIndex = chapterRefIndex.get(key) ?? -1;
    const hasPrev = refIndex > 0;
    const hasNext = refIndex >= 0 && refIndex < chapterRefs.length - 1;
    const isFullscreenLeaf = fullscreenLeafId === leaf.id;
    const closePanelMenu = () => {
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
    };

    const openBookPickerDialog = () => {
      const isOldTestament = leaf.bookIndex < 39;
      updateLeafLocation(leaf.id, {
        pickerTestament: isOldTestament ? "old" : "new",
        pickerBookIndex: leaf.bookIndex,
      });
      setBookPickerDialogLeafId(leaf.id);
    };

    return (
      <div
        data-panel-leaf-id={leaf.id}
        ref={(element) => {
          panelElementRefs.current[leaf.id] = element;
        }}
        className={cn(
          "h-full w-full min-w-0 bg-background",
          isFullscreenLeaf && "fixed inset-0 z-40 h-screen w-screen",
        )}
      >
        <Card className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-none py-0">
          <CardHeader className="border-b p-2!">
            <div className="flex flex-wrap items-center gap-2">
              {leaf.view === "reader" && chapter ? (
                <>
                  <img
                    src={currentBookIconSrc}
                    alt={`${book.name} icon`}
                    className="size-6 shrink-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-auto max-w-full justify-start px-2"
                    onClick={openBookPickerDialog}
                  >
                    {`${book.name} ${chapter.chapter}`}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Choose a book and chapter
                </p>
              )}

              <DropdownMenu
                open={isPanelMenuOpen}
                onOpenChange={(open) => {
                  if (open) {
                    setPanelMenuOpenLeafId(leaf.id);
                    return;
                  }
                  if (panelMenuOpenLeafId === leaf.id) {
                    setPanelMenuOpenLeafId(null);
                  }
                  clearAllPanelPreviews();
                }}
              >
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="ml-auto"
                    />
                  }
                >
                  <EllipsisVerticalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      closePanelMenu();
                      void toggleFullscreenLeaf(leaf.id);
                    }}
                  >
                    {isFullscreenLeaf ? <MinimizeIcon /> : <ExpandIcon />}
                    {isFullscreenLeaf ? "Exit Full Screen" : "Full Screen"}
                  </DropdownMenuItem>
                  {!isFullscreenLeaf ? (
                    <>
                      {parentSplit ? (
                        <DropdownMenuItem
                          onClick={() => toggleParentGroupOrientation(leaf.id)}
                          onPointerEnter={() =>
                            setOrientationPreviewTarget(leaf.id)
                          }
                          onPointerLeave={() => clearOrientationPreview()}
                        >
                          <RotateCwIcon />
                          {nextOrientationLabel}
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      {moveDirections.length > 0 ? (
                        <>
                          <DropdownMenuGroup>
                            {moveDirections.includes("left") ? (
                              <DropdownMenuItem
                                onClick={() => moveLeaf(leaf.id, "left")}
                                onPointerEnter={() =>
                                  setMovePreviewTarget(leaf.id, "left")
                                }
                                onPointerLeave={() => clearMovePreview()}
                              >
                                <ArrowLeftIcon />
                                Move Left
                              </DropdownMenuItem>
                            ) : null}
                            {moveDirections.includes("right") ? (
                              <DropdownMenuItem
                                onClick={() => moveLeaf(leaf.id, "right")}
                                onPointerEnter={() =>
                                  setMovePreviewTarget(leaf.id, "right")
                                }
                                onPointerLeave={() => clearMovePreview()}
                              >
                                <ArrowRightIcon />
                                Move Right
                              </DropdownMenuItem>
                            ) : null}
                            {moveDirections.includes("up") ? (
                              <DropdownMenuItem
                                onClick={() => moveLeaf(leaf.id, "up")}
                                onPointerEnter={() =>
                                  setMovePreviewTarget(leaf.id, "up")
                                }
                                onPointerLeave={() => clearMovePreview()}
                              >
                                <ArrowUpIcon />
                                Move Up
                              </DropdownMenuItem>
                            ) : null}
                            {moveDirections.includes("down") ? (
                              <DropdownMenuItem
                                onClick={() => moveLeaf(leaf.id, "down")}
                                onPointerEnter={() =>
                                  setMovePreviewTarget(leaf.id, "down")
                                }
                                onPointerLeave={() => clearMovePreview()}
                              >
                                <ArrowDownIcon />
                                Move Down
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                        </>
                      ) : null}
                      <DropdownMenuItem
                        onClick={() => splitLeaf(leaf.id, "left")}
                        onPointerEnter={() =>
                          setAddPreviewTarget(leaf.id, "left")
                        }
                        onPointerLeave={() => clearAddPreview()}
                      >
                        <SplitSquareHorizontalIcon />
                        Add Panel Left
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => splitLeaf(leaf.id, "right")}
                        onPointerEnter={() =>
                          setAddPreviewTarget(leaf.id, "right")
                        }
                        onPointerLeave={() => clearAddPreview()}
                      >
                        <SplitSquareHorizontalIcon className="rotate-180" />
                        Add Panel Right
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => splitLeaf(leaf.id, "up")}
                        onPointerEnter={() =>
                          setAddPreviewTarget(leaf.id, "up")
                        }
                        onPointerLeave={() => clearAddPreview()}
                      >
                        <SplitSquareVerticalIcon />
                        Add Panel Above
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => splitLeaf(leaf.id, "down")}
                        onPointerEnter={() =>
                          setAddPreviewTarget(leaf.id, "down")
                        }
                        onPointerLeave={() => clearAddPreview()}
                      >
                        <SplitSquareVerticalIcon className="rotate-180" />
                        Add Panel Below
                      </DropdownMenuItem>
                      {hasGroupAddOptions ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            {groupTargets.left ? (
                              <DropdownMenuItem
                                onClick={() => splitPanelGroup(leaf.id, "left")}
                                onPointerEnter={() =>
                                  setGroupAddPreviewTarget(leaf.id, "left")
                                }
                                onPointerLeave={() => clearAddPreview()}
                              >
                                <SquareChevronLeftIcon />
                                Add Panel Left (Group)
                              </DropdownMenuItem>
                            ) : null}
                            {groupTargets.right ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  splitPanelGroup(leaf.id, "right")
                                }
                                onPointerEnter={() =>
                                  setGroupAddPreviewTarget(leaf.id, "right")
                                }
                                onPointerLeave={() => clearAddPreview()}
                              >
                                <SquareChevronRightIcon />
                                Add Panel Right (Group)
                              </DropdownMenuItem>
                            ) : null}
                            {groupTargets.up ? (
                              <DropdownMenuItem
                                onClick={() => splitPanelGroup(leaf.id, "up")}
                                onPointerEnter={() =>
                                  setGroupAddPreviewTarget(leaf.id, "up")
                                }
                                onPointerLeave={() => clearAddPreview()}
                              >
                                <SquareChevronUpIcon />
                                Add Panel Above (Group)
                              </DropdownMenuItem>
                            ) : null}
                            {groupTargets.down ? (
                              <DropdownMenuItem
                                onClick={() => splitPanelGroup(leaf.id, "down")}
                                onPointerEnter={() =>
                                  setGroupAddPreviewTarget(leaf.id, "down")
                                }
                                onPointerLeave={() => clearAddPreview()}
                              >
                                <SquareChevronDownIcon />
                                Add Panel Below (Group)
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuGroup>
                        </>
                      ) : null}
                      <DropdownMenuSeparator />
                      {existingTabTargets.length > 0 ? (
                        <>
                          <DropdownMenuGroup>
                            {existingTabTargets.map((targetTab) => (
                              <DropdownMenuItem
                                key={`move-panel-${leaf.id}-${targetTab.id}`}
                                onClick={() =>
                                  moveLeafToExistingTab(leaf.id, targetTab.id)
                                }
                              >
                                <ExternalLinkIcon />
                                {`Move to Tab ${targetTab.index + 1}) ${targetTab.title}`}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                        </>
                      ) : null}
                      <DropdownMenuItem
                        onClick={() => moveLeafToNewTab(leaf.id)}
                      >
                        <ExternalLinkIcon />
                        Move to New Tab
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => closeLeaf(leaf.id)}>
                        <XIcon />
                        Close Panel
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          {leaf.view === "reader" && chapter ? (
            <>
              <CardContent className="min-h-0 flex-1 p-0">
                <ScrollArea className="h-full w-full" data-panel-content-scroll>
                  <ChapterTextContent
                    bookName={book.name}
                    chapterNumber={chapter.chapter}
                    verses={chapter.verses}
                    flowVersesByParagraph={flowVersesByParagraph}
                    readModeParagraphIndent={readModeParagraphIndent}
                    showVerseNumbers={showVerseNumbers}
                    isStudyMode={isStudyMode}
                    verseSpacing={verseSpacing}
                    onOpenTokenDetails={(element, token) =>
                      openTokenDetailsFromElement(
                        element,
                        token,
                        leaf.bookIndex,
                        leaf.chapterIndex,
                      )
                    }
                    onSelectVerse={(verseNumber) =>
                      openCrossReferencesForVerse(
                        leaf.bookIndex,
                        leaf.chapterIndex,
                        verseNumber,
                      )
                    }
                  />
                </ScrollArea>
              </CardContent>

              <div className="border-t">
                <Progress
                  value={readingProgress}
                  className="w-full"
                  aria-label={`Reading progress for ${book.name} ${chapter.chapter}`}
                />
                <div className="flex items-center justify-between p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveLeafChapter(leaf.id, -1)}
                    disabled={!hasPrev}
                  >
                    <ChevronLeftIcon />
                    Prev
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isChapterRead ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        toggleChapterRead(leaf.bookIndex, leaf.chapterIndex)
                      }
                    >
                      {isChapterRead ? "Read" : "Mark Read"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveLeafChapter(leaf.id, 1)}
                      disabled={!hasNext}
                    >
                      Next
                      <ChevronRightIcon />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="min-h-0 flex-1 overflow-auto p-2">
              <BookChapterPicker
                books={books}
                selectedTestament={leaf.pickerTestament}
                selectedBookIndex={leaf.pickerBookIndex}
                onSelectTestament={(testament) =>
                  updateLeafLocation(leaf.id, {
                    pickerTestament: testament,
                    pickerBookIndex: null,
                  })
                }
                onBackToTestaments={() =>
                  updateLeafLocation(leaf.id, {
                    pickerTestament: null,
                    pickerBookIndex: null,
                  })
                }
                onSelectBook={(bookIndex) =>
                  updateLeafLocation(leaf.id, {
                    pickerBookIndex: bookIndex,
                  })
                }
                onBackToBooks={() =>
                  updateLeafLocation(leaf.id, { pickerBookIndex: null })
                }
                onSelectChapter={(bookIndex, chapterIndex) =>
                  updateLeafLocation(leaf.id, {
                    bookIndex,
                    chapterIndex,
                    view: "reader",
                    pickerTestament: null,
                    pickerBookIndex: null,
                  })
                }
              />
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  function renderNode(node: PanelNode) {
    if (node.type === "leaf") {
      return renderLeaf(node);
    }

    return (
      <ResizablePanelGroup
        orientation={node.orientation}
        onLayoutChanged={(layout) => {
          const nextSize = layout[`${node.id}-first`];
          if (typeof nextSize === "number") {
            updateSplitSize(node.id, nextSize);
          }
        }}
        className="min-h-0 min-w-0 flex-1"
      >
        <ResizablePanel
          id={`${node.id}-first`}
          defaultSize={node.ratio}
          minSize={15}
        >
          {renderNode(node.first)}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          id={`${node.id}-second`}
          defaultSize={100 - node.ratio}
          minSize={15}
        >
          {renderNode(node.second)}
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

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
  } = useStudySidebarState({
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
  const currentPhotoDialogItem =
    photoDialogItems.length > 0 ? photoDialogItems[photoDialogIndex] : null;

  return (
    <main className="h-screen w-full overflow-hidden bg-background">
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
            onStudyModeChange={setIsStudyMode}
            onOpenProgress={() => setIsProgressOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <TabsWorkspace
            tabsOrientation={tabsOrientation}
            tabsStrip={tabsStrip}
            readerContent={renderNode(activeTab.root)}
          />
        </SidebarInset>

        <ReaderStudySidebar
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
            wordAccordionValue: mapsWordAccordionValue,
            onWordAccordionValueChange: setMapsWordAccordionValue,
            onSearch: applyMapsSearch,
            onOpenMapDialog: openMapDialog,
            isMapImagesLoading: isMapImagesLoading,
            mapImagesError: mapImagesError,
            onOpenPhotoDialog: openPhotoDialog,
            renderPreview: referencePreviewContent,
            onOpenReference: openConcordanceReference,
            onCloseSidebar: closeRightSidebarForMobile,
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
      </SidebarProvider>

      {tokenPopupCard}

      <MapAndPhotoDialogs
        isMapDialogOpen={isMapDialogOpen}
        activeMapDialogEntry={activeMapDialogEntry}
        isMapDialogLoading={isMapDialogLoading}
        mapDialogError={mapDialogError}
        mapDialogGeoJson={mapDialogGeoJson}
        onMapDialogOpenChange={(open) => {
          setIsMapDialogOpen(open);
          if (!open) {
            setActiveMapDialogEntry(null);
            setMapDialogGeoJson(null);
            setMapDialogError(null);
          }
        }}
        onCloseMapDialog={() => {
          setIsMapDialogOpen(false);
          setActiveMapDialogEntry(null);
          setMapDialogGeoJson(null);
          setMapDialogError(null);
        }}
        isPhotoDialogOpen={isPhotoDialogOpen}
        currentPhotoDialogItem={currentPhotoDialogItem}
        photoDialogIndex={photoDialogIndex}
        photoDialogItemsLength={photoDialogItems.length}
        onPhotoDialogOpenChange={(open) => {
          setIsPhotoDialogOpen(open);
          if (!open) {
            setPhotoDialogItems([]);
            setPhotoDialogIndex(0);
          }
        }}
        onClosePhotoDialog={() => {
          setIsPhotoDialogOpen(false);
          setPhotoDialogItems([]);
          setPhotoDialogIndex(0);
        }}
        onPreviousPhoto={() => movePhotoDialog(-1)}
        onNextPhoto={() => movePhotoDialog(1)}
      />

      <BookPickerDialog
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

      <RenameTabDialog
        open={isRenameDialogOpen}
        value={renameValue}
        error={renameError}
        onOpenChange={setIsRenameDialogOpen}
        onValueChange={onRenameValueChange}
        onCancel={onRenameCancel}
        onConfirm={confirmRenameTab}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        theme={theme}
        onThemeChange={setTheme}
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

      <ProgressDialog
        open={isProgressOpen}
        onOpenChange={setIsProgressOpen}
        totalProgressPercent={totalProgressPercent}
        progressByTestament={progressByTestament}
        onSetAllBookChaptersRead={setAllBookChaptersRead}
        onOpenChapterInNewTab={openChapterInNewTab}
        onToggleChapterRead={toggleChapterRead}
        onResetAllProgress={resetAllProgress}
      />
    </main>
  );
}
