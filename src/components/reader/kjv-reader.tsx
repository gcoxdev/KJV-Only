import {
  Fragment,
  lazy,
  Suspense,
  type ReactNode,
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
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  ExpandIcon,
  MinimizeIcon,
  MenuIcon,
  PlusIcon,
  RotateCwIcon,
  LoaderCircleIcon,
  SearchIcon,
  SettingsIcon,
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
  deriveMapPhotoDialogItems,
  mapEntryLabel,
  mapEntrySearchableText,
  matchesMapWord,
  modernIdsForMapEntry,
  parseJsonl,
  type MapGeoJsonPayload,
  type MapImageEntry,
  type MapPhotoDialogItem,
} from "@/lib/maps";
import {
  BOOK_ICON_CODES,
  chapterVerseKey,
  escapeRegExp,
  normalizeConcordanceWord,
  normalizeStrongsCode,
  parseBibleReference,
  resolveConcordanceKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolveWebstersKey,
} from "@/lib/references";
import {
  collectLeafIds,
  countLeaves,
  createId,
  createInitialTab,
  createLeaf,
  extractLeafNode,
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
  IconVariant,
  LeafNode,
  OldEnglishPayload,
  PanelDirection,
  PanelNode,
  ReaderPayload,
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
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Slider } from "@/components/ui/slider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookChapterPicker } from "@/components/reader/book-chapter-picker";
import {
  ChapterTextContent,
  formatDisplayTokenText,
  isPunctuationToken,
} from "@/components/reader/chapter-text-content";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LazyMapGeoJsonView = lazy(async () => {
  const module = await import("@/components/reader/map-geojson-view");
  return { default: module.MapGeoJsonView };
});

let kjvBooksPromise: Promise<Book[]> | null = null;
let concordancePromise: Promise<ConcordancePayload> | null = null;
let crossRefsPromise: Promise<CrossRefsPayload> | null = null;
let hitchcocksPromise: Promise<HitchcocksPayload> | null = null;
let oldEnglishPromise: Promise<OldEnglishPayload> | null = null;
let genealogyPromise: Promise<GenealogyPayload> | null = null;
let webstersPromise: Promise<WebstersPayload> | null = null;
let strongsGreekPromise: Promise<StrongsPayload> | null = null;
let strongsHebrewPromise: Promise<StrongsPayload> | null = null;
let ancientMapPromise: Promise<AncientMapPayload> | null = null;
const mapGeoJsonPromiseCache = new Map<string, Promise<MapGeoJsonPayload>>();
let mapImagesPromise: Promise<MapImageEntry[]> | null = null;

function loadKjvBooks() {
  if (!kjvBooksPromise) {
    kjvBooksPromise = fetch("/data/kjv.json", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /data/kjv.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        const parsedBooks = parseBooks(payload);
        if (!parsedBooks || parsedBooks.length === 0) {
          throw new Error("Invalid reader data format in /data/kjv.json");
        }
        return parsedBooks;
      })
      .catch((error) => {
        // Allow retry if the request fails for any reason.
        kjvBooksPromise = null;
        throw error;
      });
  }

  return kjvBooksPromise;
}

function loadConcordance() {
  if (!concordancePromise) {
    concordancePromise = fetch("/references/concordance.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/concordance.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as ConcordancePayload)
      .catch((error) => {
        concordancePromise = null;
        throw error;
      });
  }

  return concordancePromise;
}

function loadCrossRefs() {
  if (!crossRefsPromise) {
    crossRefsPromise = fetch("/references/cross-refs.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/cross-refs.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as CrossRefsPayload)
      .catch((error) => {
        crossRefsPromise = null;
        throw error;
      });
  }

  return crossRefsPromise;
}

function loadWebsters() {
  if (!webstersPromise) {
    webstersPromise = fetch("/references/websters.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/websters.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as WebstersPayload)
      .catch((error) => {
        webstersPromise = null;
        throw error;
      });
  }

  return webstersPromise;
}

function loadHitchcocks() {
  if (!hitchcocksPromise) {
    hitchcocksPromise = fetch("/references/hitchcocks.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/hitchcocks.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as HitchcocksPayload)
      .catch((error) => {
        hitchcocksPromise = null;
        throw error;
      });
  }

  return hitchcocksPromise;
}

function loadOldEnglish() {
  if (!oldEnglishPromise) {
    oldEnglishPromise = fetch("/references/old-english.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/old-english.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as OldEnglishPayload)
      .catch((error) => {
        oldEnglishPromise = null;
        throw error;
      });
  }

  return oldEnglishPromise;
}

function loadGenealogy() {
  if (!genealogyPromise) {
    genealogyPromise = fetch("/references/genealogy.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/genealogy.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as GenealogyPayload)
      .catch((error) => {
        genealogyPromise = null;
        throw error;
      });
  }

  return genealogyPromise;
}

function loadStrongsGreek() {
  if (!strongsGreekPromise) {
    strongsGreekPromise = fetch("/references/strongs-greek.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/strongs-greek.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as StrongsPayload)
      .catch((error) => {
        strongsGreekPromise = null;
        throw error;
      });
  }
  return strongsGreekPromise;
}

function loadStrongsHebrew() {
  if (!strongsHebrewPromise) {
    strongsHebrewPromise = fetch("/references/strongs-hebrew.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/strongs-hebrew.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as StrongsPayload)
      .catch((error) => {
        strongsHebrewPromise = null;
        throw error;
      });
  }
  return strongsHebrewPromise;
}

function loadAncientMap() {
  if (!ancientMapPromise) {
    ancientMapPromise = fetch("/references/ancient_map.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/ancient_map.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as AncientMapPayload)
      .catch((error) => {
        ancientMapPromise = null;
        throw error;
      });
  }
  return ancientMapPromise;
}

function loadMapGeoJson(geojsonFile: string) {
  const cached = mapGeoJsonPromiseCache.get(geojsonFile);
  if (cached) {
    return cached;
  }
  const promise = fetch(`/maps/geometry/${geojsonFile}`, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Could not load /maps/geometry/${geojsonFile}`);
      }
      return response.json() as Promise<unknown>;
    })
    .then((payload) => payload as MapGeoJsonPayload)
    .catch((error) => {
      mapGeoJsonPromiseCache.delete(geojsonFile);
      throw error;
    });
  mapGeoJsonPromiseCache.set(geojsonFile, promise);
  return promise;
}

function loadMapImages() {
  if (!mapImagesPromise) {
    mapImagesPromise = fetch("/maps/data/image.jsonl", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /maps/data/image.jsonl");
        }
        return response.text();
      })
      .then((text) => parseJsonl<MapImageEntry>(text))
      .catch((error) => {
        mapImagesPromise = null;
        throw error;
      });
  }
  return mapImagesPromise;
}

function renderHighlightedText(
  text: string,
  needle: string,
  keyPrefix: string,
): ReactNode {
  if (!needle) {
    return text;
  }

  const matcher = new RegExp(`(${escapeRegExp(needle)})`, "ig");
  const parts = text.split(matcher);
  if (parts.length <= 1) {
    return text;
  }

  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <span
        key={`${keyPrefix}-highlight-${index}`}
        className="bg-[#fafac5] text-black"
      >
        {part}
      </span>
    ) : (
      <span key={`${keyPrefix}-text-${index}`}>{part}</span>
    ),
  );
}

function parseBooks(input: unknown): Book[] | null {
  if (Array.isArray(input)) {
    return input as Book[];
  }

  if (typeof input === "object" && input !== null) {
    const payload = input as ReaderPayload;
    if (Array.isArray(payload.books)) {
      return payload.books;
    }
  }

  return null;
}

function chapterProgressKey(bookIndex: number, chapterIndex: number) {
  return `${bookIndex}:${chapterIndex}`;
}

function bookCodeForIndex(bookIndex: number) {
  return BOOK_ICON_CODES[bookIndex] ?? "GEN";
}

function iconPath(variant: IconVariant, code: string) {
  return `/icons/${variant}/${code}.png`;
}

function panelViewportElement(panelElement: HTMLDivElement | null | undefined) {
  return (
    panelElement?.querySelector<HTMLElement>(
      '[data-panel-content-scroll] [data-slot="scroll-area-viewport"]',
    ) ?? null
  );
}

function SidebarOpenRequestSync({
  requestKey,
  enabled,
}: {
  requestKey: number;
  enabled: boolean;
}) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const previousRequestKeyRef = useRef(requestKey);

  useEffect(() => {
    if (!enabled) {
      previousRequestKeyRef.current = requestKey;
      return;
    }
    if (previousRequestKeyRef.current === requestKey) {
      return;
    }
    previousRequestKeyRef.current = requestKey;
    if (isMobile) {
      setOpenMobile(true);
    } else {
      setOpen(true);
    }
  }, [enabled, isMobile, requestKey, setOpen, setOpenMobile]);

  return null;
}

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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
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
  const referencePreviewCacheRef = useRef<
    Map<string, { citation: string; verseLines: Array<{ label: string; text: string }> }>
  >(new Map());

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
    referencePreviewCacheRef.current.clear();
  }, [books]);

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

  function moveLeafToNewTab(leafId: string) {
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
      requestAnimationFrame(() => {
        tabEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: tabsOrientation === "vertical" ? "end" : "nearest",
          inline: tabsOrientation === "vertical" ? "nearest" : "end",
        });
      });
    }
  }

  function addTab() {
    const nextTab = createInitialTab(tabs.length + 1, "picker");
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: tabsOrientation === "vertical" ? "end" : "nearest",
        inline: tabsOrientation === "vertical" ? "nearest" : "end",
      });
    });
  }

  function closeTab(tabId: string) {
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
  }

  function moveTab(tabId: string, direction: -1 | 1) {
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
  }

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

  const openConcordanceReference = useCallback((reference: string) => {
    const parsed = parseBibleReference(reference);
    if (!parsed) {
      return;
    }
    const startChapter =
      books[parsed.bookIndex]?.chapters[parsed.startChapterIndex] ?? null;
    const highlightEnd =
      parsed.startChapterIndex === parsed.endChapterIndex
        ? parsed.endVerse
        : (startChapter?.verses[startChapter.verses.length - 1]?.verse ??
          parsed.startVerse);
    openChapterReferenceInNewTab(
      parsed.bookIndex,
      parsed.startChapterIndex,
      parsed.startVerse,
      highlightEnd,
    );
  }, [books, openChapterReferenceInNewTab]);

  const referencePreviewData = useCallback((reference: string) => {
    const cached = referencePreviewCacheRef.current.get(reference);
    if (cached) {
      return cached;
    }

    const parsed = parseBibleReference(reference);
    if (!parsed) {
      const fallback = {
        citation: reference,
        verseLines: [] as Array<{ label: string; text: string }>,
      };
      referencePreviewCacheRef.current.set(reference, fallback);
      return fallback;
    }

    const book = books[parsed.bookIndex];
    const chapters = book?.chapters ?? [];
    if (
      !book ||
      !chapters[parsed.startChapterIndex] ||
      !chapters[parsed.endChapterIndex]
    ) {
      const fallback = {
        citation: reference,
        verseLines: [] as Array<{ label: string; text: string }>,
      };
      referencePreviewCacheRef.current.set(reference, fallback);
      return fallback;
    }

    const MAX_PREVIEW_VERSES = 24;
    const verseLines: Array<{ label: string; text: string }> = [];
    for (
      let chapterIndex = parsed.startChapterIndex;
      chapterIndex <= parsed.endChapterIndex;
      chapterIndex += 1
    ) {
      const chapter = chapters[chapterIndex];
      if (!chapter) {
        continue;
      }

      const start =
        chapterIndex === parsed.startChapterIndex ? parsed.startVerse : 1;
      const end =
        chapterIndex === parsed.endChapterIndex
          ? parsed.endVerse
          : (chapter.verses[chapter.verses.length - 1]?.verse ?? 0);
      const verses = chapter.verses.filter(
        (candidate) => candidate.verse >= start && candidate.verse <= end,
      );

      for (const verse of verses) {
        verseLines.push({
          label: `${chapter.chapter}:${verse.verse}`,
          text: verse.tokens
            .map((token, index) => {
              const leadingSpace = index > 0 && !isPunctuationToken(token.text);
              return `${leadingSpace ? " " : ""}${formatDisplayTokenText(token)}`;
            })
            .join(""),
        });
        if (verseLines.length >= MAX_PREVIEW_VERSES) {
          break;
        }
      }

      if (verseLines.length >= MAX_PREVIEW_VERSES) {
        break;
      }
    }

    const citationVerse =
      parsed.startChapterIndex === parsed.endChapterIndex
        ? parsed.startVerse === parsed.endVerse
          ? `${parsed.startVerse}`
          : `${parsed.startVerse}-${parsed.endVerse}`
        : `${parsed.startChapterIndex + 1}:${parsed.startVerse}-${parsed.endChapterIndex + 1}:${parsed.endVerse}`;

    const computed = {
      citation: `${book.name} ${citationVerse}`,
      verseLines,
    };
    referencePreviewCacheRef.current.set(reference, computed);
    return computed;
  }, [books]);

  const referencePreviewContent = useCallback((
    reference: string,
    highlightWord: string,
  ): ReactNode => {
    const { citation, verseLines } = referencePreviewData(reference);
    const needle = normalizeConcordanceWord(highlightWord);

    if (verseLines.length === 0) {
      return (
        <div className="space-y-1">
          <p className="font-semibold">{citation}</p>
          <p>{reference}</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="font-semibold">{citation}</p>
        <div className="space-y-1">
          {verseLines.map((line) => (
            <p key={`${reference}-line-${line.label}`}>
              <span className="mr-1 text-xs font-semibold text-muted-foreground">
                {line.label}
              </span>
              <span>
                {renderHighlightedText(
                  line.text,
                  needle,
                  `${reference}-${line.label}`,
                )}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }, [referencePreviewData]);

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

  function renderGenealogyPersonDetails(person: GenealogyPerson) {
    const primaryName = person.names[0] ?? person.id;
    const byName = person.verses?.byName ?? [];
    const spouses = person.spouses ?? [];
    const siblings = person.siblings ?? [];
    const children = person.children ?? [];
    const fatherName =
      person.father?.name ||
      (person.father?.id ? (genealogyById.get(person.father.id)?.names[0] ?? "") : "");
    const motherName =
      person.mother?.name ||
      (person.mother?.id ? (genealogyById.get(person.mother.id)?.names[0] ?? "") : "");

    return (
      <div className="space-y-2 rounded-md border p-2 text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{primaryName}</span>
          {person.names.length > 1 ? (
            <span className="text-muted-foreground">
              ({person.names.slice(1).join(", ")})
            </span>
          ) : null}
          {person.gender ? (
            <span className="text-xs text-muted-foreground">{person.gender}</span>
          ) : null}
        </div>
        {byName.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              References
            </p>
            <Accordion className="w-full rounded-md border px-2" multiple>
              {byName.map((entry) => (
                <AccordionItem
                  key={`${person.id}-${entry.name}`}
                  value={`${person.id}-${entry.name}`}
                >
                  <AccordionTrigger>
                    {`${entry.name} (${entry.verses.length})`}
                  </AccordionTrigger>
                  <AccordionContent className="leading-7">
                    {entry.verses.map((reference, index) => (
                      <Fragment
                        key={`${person.id}-${entry.name}-${reference}-${index}`}
                      >
                        <ConcordanceReferencePopover
                          reference={reference}
                          highlightWord={entry.name}
                          renderPreview={referencePreviewContent}
                          onOpenReference={openConcordanceReference}
                          onCloseSidebar={closeRightSidebarForMobile}
                        />
                        {index < entry.verses.length - 1 ? ", " : null}
                      </Fragment>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : null}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lineage
          </p>
          {fatherName ? (
            <p>
              <span className="font-semibold">Father:</span>{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                onClick={() => selectGenealogyPerson(person.father?.id ?? "")}
              >
                {fatherName}
              </Button>
            </p>
          ) : null}
          {motherName ? (
            <p>
              <span className="font-semibold">Mother:</span>{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                onClick={() => selectGenealogyPerson(person.mother?.id ?? "")}
              >
                {motherName}
              </Button>
            </p>
          ) : null}
          {spouses.length > 0 ? (
            <p>
              <span className="font-semibold">Spouses:</span>{" "}
              {spouses.map((relation, index) => (
                <Fragment key={`${person.id}-spouse-${relation.id}-${index}`}>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0"
                    onClick={() => selectGenealogyPerson(relation.id)}
                  >
                    {relation.name || relation.id}
                  </Button>
                  {relation.verse ? (
                    <>
                      {" "}
                      (
                      <ConcordanceReferencePopover
                        reference={relation.verse}
                        highlightWord={relation.name || primaryName}
                        renderPreview={referencePreviewContent}
                        onOpenReference={openConcordanceReference}
                        onCloseSidebar={closeRightSidebarForMobile}
                      />
                      )
                    </>
                  ) : null}
                  {index < spouses.length - 1 ? ", " : null}
                </Fragment>
              ))}
            </p>
          ) : null}
          {siblings.length > 0 ? (
            <p>
              <span className="font-semibold">Siblings:</span>{" "}
              {siblings.map((relation, index) => (
                <Fragment key={`${person.id}-sibling-${relation.id}-${index}`}>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0"
                    onClick={() => selectGenealogyPerson(relation.id)}
                  >
                    {relation.name || relation.id}
                  </Button>
                  {relation.verse ? (
                    <>
                      {" "}
                      (
                      <ConcordanceReferencePopover
                        reference={relation.verse}
                        highlightWord={relation.name || primaryName}
                        renderPreview={referencePreviewContent}
                        onOpenReference={openConcordanceReference}
                        onCloseSidebar={closeRightSidebarForMobile}
                      />
                      )
                    </>
                  ) : null}
                  {index < siblings.length - 1 ? ", " : null}
                </Fragment>
              ))}
            </p>
          ) : null}
          {children.length > 0 ? (
            <p>
              <span className="font-semibold">Children:</span>{" "}
              {children.map((relation, index) => (
                <Fragment key={`${person.id}-child-${relation.id}-${index}`}>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0"
                    onClick={() => selectGenealogyPerson(relation.id)}
                  >
                    {relation.name || relation.id}
                  </Button>
                  {relation.verse ? (
                    <>
                      {" "}
                      (
                      <ConcordanceReferencePopover
                        reference={relation.verse}
                        highlightWord={relation.name || primaryName}
                        renderPreview={referencePreviewContent}
                        onOpenReference={openConcordanceReference}
                        onCloseSidebar={closeRightSidebarForMobile}
                      />
                      )
                    </>
                  ) : null}
                  {index < children.length - 1 ? ", " : null}
                </Fragment>
              ))}
            </p>
          ) : null}
        </div>
        {person.notes ? <p className="text-muted-foreground">{person.notes}</p> : null}
      </div>
    );
  }

  function openRenameDialog(tabId: string) {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) {
      return;
    }

    setRenameTabId(tabId);
    setRenameValue(tab.title);
    setRenameError(null);
    setIsRenameDialogOpen(true);
  }

  function confirmRenameTab() {
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
  }

  function moveLeafToExistingTab(leafId: string, targetTabId: string) {
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
  }

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
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-xl">KJV Only</CardTitle>
            <p className="text-sm text-muted-foreground">
              Loading Bible data...
            </p>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (loadError || !activeTab) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-xl">KJV Only</CardTitle>
            <p className="text-sm text-muted-foreground">
              {loadError ?? "No Bible data available. Run npm run build:data."}
            </p>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const tokenPopupCard = tokenPopup ? (
    <Card
      data-token-popup
      className="fixed z-50 w-[280px] shadow-lg"
      style={{ left: tokenPopup.x, top: tokenPopup.y }}
    >
      <CardContent className="space-y-2 p-3 text-sm">
        <p className="font-medium">
          {formatDisplayTokenText(tokenPopup.token)}
        </p>
        {tokenPopup.token.added ? (
          <p className="text-xs text-muted-foreground">
            Added word (italic in KJV typography)
          </p>
        ) : null}
        {tokenPopup.token.strong ? (
          <p>
            <span className="text-muted-foreground">Strong&apos;s:</span>{" "}
            <span className="font-mono">{tokenPopup.token.strong}</span>
          </p>
        ) : null}
        {tokenPopup.token.lemma ? (
          <p>
            <span className="text-muted-foreground">Lemma:</span>{" "}
            <span className="font-mono">{tokenPopup.token.lemma}</span>
          </p>
        ) : null}
        {tokenPopup.token.morph ? (
          <p>
            <span className="text-muted-foreground">Morph:</span>{" "}
            <span className="font-mono">{tokenPopup.token.morph}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  ) : null;

  const tabsStrip = (
    <ScrollArea className="h-full w-full">
      <div
        className={cn(
          "p-1",
          tabsOrientation === "vertical"
            ? "flex flex-col items-stretch gap-2"
            : "flex w-max items-center gap-2",
        )}
      >
        {tabs.map((tab, index) => {
          const active = tab.id === activeTabId;
          const canMoveLeft = tabs.length > 1 && index > 0;
          const canMoveRight = tabs.length > 1 && index < tabs.length - 1;
          return (
            <ButtonGroup
              key={tab.id}
              className={cn(tabsOrientation === "vertical" && "w-full")}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "min-w-24 justify-start",
                  tabsOrientation === "vertical" &&
                    "h-auto w-full min-w-0 flex-1 whitespace-normal wrap-break-word py-1.5 text-left leading-tight",
                  active &&
                    "border-foreground! bg-foreground! text-background! hover:bg-foreground/90! hover:text-background!",
                )}
              >
                {tab.title}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className={cn(
                        "relative",
                        tabsOrientation === "vertical" && "h-auto self-stretch",
                        active &&
                          "border-foreground! bg-foreground! text-background! hover:bg-foreground/90! hover:text-background! before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-background/45 before:content-['']",
                      )}
                      aria-label={`Tab options for ${tab.title}`}
                    >
                      <EllipsisIcon />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => openRenameDialog(tab.id)}>
                      Relabel Tab
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {tabs.length > 1 ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {canMoveLeft ? (
                          <DropdownMenuItem onClick={() => moveTab(tab.id, -1)}>
                            Move Left
                          </DropdownMenuItem>
                        ) : null}
                        {canMoveRight ? (
                          <DropdownMenuItem onClick={() => moveTab(tab.id, 1)}>
                            Move Right
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => closeTab(tab.id)}>
                          Close Tab
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={addTab}
          aria-label="New Tab"
          className={cn(tabsOrientation === "vertical" && "w-full")}
        >
          <PlusIcon />
        </Button>
        <div ref={tabEndRef} />
      </div>
      <ScrollBar
        orientation={tabsOrientation === "vertical" ? "vertical" : "horizontal"}
      />
    </ScrollArea>
  );

  const studyAccordionItems = [
    "cross-refs",
    "concordance",
    "websters",
    "strongs",
    "maps",
    "hitchcocks",
    "old-english",
    "genealogy",
  ] as const;
  const allStudyAccordionsOpen = studyAccordionItems.every((item) =>
    concordanceAccordionValue.includes(item),
  );
  const openStudySections = new Set(concordanceAccordionValue);
  const isCrossRefsSectionOpen = openStudySections.has("cross-refs");
  const isConcordanceSectionOpen = openStudySections.has("concordance");
  const isWebstersSectionOpen = openStudySections.has("websters");
  const isStrongsSectionOpen = openStudySections.has("strongs");
  const isMapsSectionOpen = openStudySections.has("maps");
  const isGenealogySectionOpen = openStudySections.has("genealogy");
  const isHitchcocksSectionOpen = openStudySections.has("hitchcocks");
  const isOldEnglishSectionOpen = openStudySections.has("old-english");
  const hasCrossRefsInfo = Boolean(
    selectedCrossReferences && selectedCrossReferences.references.length > 0,
  );
  const hasConcordanceInfo = concordanceSearchResults.length > 0;
  const hasWebstersInfo = webstersSearchResults.length > 0;
  const hasStrongsInfo = strongsSearchResults.length > 0;
  const hasMapsInfo = mapsSearchResults.length > 0;
  const hasHitchcocksInfo = hitchcocksSearchResults.length > 0;
  const hasOldEnglishInfo = oldEnglishSearchResults.length > 0;
  const hasGenealogyInfo = genealogySearchResults.length > 0;

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
          <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open menu"
                    />
                  }
                >
                  <MenuIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setIsProgressOpen(true)}>
                    <ChartBarIcon />
                    Reading Progress
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Pages</DropdownMenuLabel>
                    <DropdownMenuItem>How to Get Saved</DropdownMenuItem>
                    <DropdownMenuItem>Why KJV Only?</DropdownMenuItem>
                    <DropdownMenuItem>Resources</DropdownMenuItem>
                    <DropdownMenuItem>Local Churches</DropdownMenuItem>
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem>Donate</DropdownMenuItem>
                    <DropdownMenuItem>Credits</DropdownMenuItem>
                    <DropdownMenuItem>What&apos;s New</DropdownMenuItem>
                    <DropdownMenuItem>About</DropdownMenuItem>
                    <DropdownMenuItem>Contact</DropdownMenuItem>
                    <DropdownMenuItem>Help</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2">
                <img
                  src="/icons/app-icon.png"
                  alt="KJV Only icon"
                  className="size-5 rounded-sm"
                />
                <p className="font-semibold">KJV Only</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="study-mode" className="text-sm">
                  Study
                </Label>
                <Switch
                  id="study-mode"
                  checked={isStudyMode}
                  onCheckedChange={(checked) => setIsStudyMode(checked)}
                />
              </div>
              {isStudyMode ? <SidebarTrigger /> : null}
            </div>
          </header>

          {tabsOrientation === "horizontal" ? (
            <>
              <div className="shrink-0 border-b px-4 py-2 sm:px-6">
                {tabsStrip}
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                {renderNode(activeTab.root)}
              </div>
            </>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel
                  id="tabs-sidebar"
                  defaultSize={150}
                  minSize={150}
                  maxSize={300}
                  collapsible
                  className="min-h-0 min-w-0 border-r"
                >
                  <div className="h-full w-full px-2 py-2">{tabsStrip}</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel id="reader-content" minSize={15}>
                  <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
                    {renderNode(activeTab.root)}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </SidebarInset>

        {isStudyMode ? (
          <Sidebar side="right" className="h-screen">
            <SidebarHeader className="gap-2">
              <h2 className="text-base font-semibold">Study Tools</h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setConcordanceAccordionValue(
                    allStudyAccordionsOpen ? [] : [...studyAccordionItems],
                  );
                }}
              >
                {allStudyAccordionsOpen ? "Collapse All" : "Expand All"}
              </Button>
            </SidebarHeader>
            <SidebarContent className="px-2 pb-3">
              <Accordion
                className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
                multiple
                value={concordanceAccordionValue}
                onValueChange={(value) =>
                  setConcordanceAccordionValue(
                    value.filter(Boolean) as string[],
                  )
                }
              >
                <AccordionItem value="cross-refs">
                  <AccordionTrigger
                    className={cn(
                      hasCrossRefsInfo && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Cross References
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isCrossRefsSectionOpen ? (
                      <>
                        {isCrossRefsLoading ? (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircleIcon className="size-4 animate-spin" />
                            Loading cross references...
                          </p>
                        ) : crossRefsError ? (
                          <p className="text-sm text-destructive">
                            {crossRefsError}
                          </p>
                        ) : !selectedCrossReferences ? (
                          <p className="text-sm text-muted-foreground">
                            Click a word or verse to load cross references.
                          </p>
                        ) : selectedCrossReferences.references.length === 0 ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {(() => {
                                const parsed = parseBibleReference(
                                  selectedCrossReferences.key,
                                );
                                if (!parsed) {
                                  return selectedCrossReferences.key;
                                }
                                const book = books[parsed.bookIndex];
                                return `${book?.name ?? parsed.bookCode} ${parsed.startChapterIndex + 1}:${parsed.startVerse}`;
                              })()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              No cross references found.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {(() => {
                                const parsed = parseBibleReference(
                                  selectedCrossReferences.key,
                                );
                                if (!parsed) {
                                  return selectedCrossReferences.key;
                                }
                                const book = books[parsed.bookIndex];
                                return `${book?.name ?? parsed.bookCode} ${parsed.startChapterIndex + 1}:${parsed.startVerse}`;
                              })()}
                            </p>
                            <p className="text-sm leading-7">
                              {selectedCrossReferences.references.map(
                                (reference, index) => (
                                  <Fragment
                                    key={`${selectedCrossReferences.key}-${reference}-${index}`}
                                  >
                                    <ConcordanceReferencePopover
                                      reference={reference}
                                      highlightWord=""
                                      renderPreview={referencePreviewContent}
                                      onOpenReference={openConcordanceReference}
                                      onCloseSidebar={closeRightSidebarForMobile}
                                    />
                                    {index <
                                    selectedCrossReferences.references.length - 1
                                      ? ", "
                                      : null}
                                  </Fragment>
                                ),
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="concordance">
                  <AccordionTrigger
                    className={cn(
                      hasConcordanceInfo &&
                        "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Concordance
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isConcordanceSectionOpen ? (
                      <>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const value = formData.get("concordance-search");
                            applyConcordanceSearch(
                              typeof value === "string" ? value : "",
                            );
                          }}
                        >
                          <InputGroup>
                            <InputGroupInput
                              name="concordance-search"
                              placeholder="Search concordance..."
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="submit"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Search concordance"
                                disabled={
                                  isConcordanceLoading || isConcordanceSearching
                                }
                              >
                                {isConcordanceLoading || isConcordanceSearching ? (
                                  <LoaderCircleIcon className="animate-spin" />
                                ) : (
                                  <SearchIcon />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </form>
                        {isConcordanceLoading || isConcordanceSearching ? (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircleIcon className="size-4 animate-spin" />
                            {isConcordanceLoading
                              ? "Loading concordance..."
                              : "Searching concordance..."}
                          </p>
                        ) : concordanceError ? (
                          <p className="text-sm text-destructive">
                            {concordanceError}
                          </p>
                        ) : concordanceSearchResults.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {concordanceSearchTerm.trim()
                              ? "No matching words found."
                              : "Click a word in the text or search concordance."}
                          </p>
                        ) : (
                          <Accordion
                            className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
                            multiple
                            value={concordanceWordAccordionValue}
                            onValueChange={(value) =>
                              setConcordanceWordAccordionValue(
                                value.filter(Boolean) as string[],
                              )
                            }
                          >
                            {concordanceSearchResults.map((entry) => (
                              <AccordionItem key={entry.key} value={entry.key}>
                                <AccordionTrigger>
                                  {`${entry.key} (${entry.references.length})`}
                                </AccordionTrigger>
                                <AccordionContent>
                                  {entry.references.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                      No references found.
                                    </p>
                                  ) : (
                                    <p className="text-sm leading-7">
                                      {entry.references.map((reference, index) => (
                                        <Fragment
                                          key={`${entry.key}-${reference}-${index}`}
                                        >
                                          <ConcordanceReferencePopover
                                            reference={reference}
                                            highlightWord={entry.key}
                                            renderPreview={referencePreviewContent}
                                            onOpenReference={openConcordanceReference}
                                            onCloseSidebar={closeRightSidebarForMobile}
                                          />
                                          {index < entry.references.length - 1
                                            ? ", "
                                            : null}
                                        </Fragment>
                                      ))}
                                    </p>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="websters">
                  <AccordionTrigger
                    className={cn(
                      hasWebstersInfo && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Webster&apos;s 1828 Dictionary
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isWebstersSectionOpen ? (
                      <>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const value = formData.get("websters-search");
                            applyWebstersSearch(
                              typeof value === "string" ? value : "",
                            );
                          }}
                        >
                          <InputGroup>
                            <InputGroupInput
                              name="websters-search"
                              placeholder="Search Webster's..."
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="submit"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Search Webster's dictionary"
                                disabled={isWebstersLoading || isWebstersSearching}
                              >
                                {isWebstersLoading || isWebstersSearching ? (
                                  <LoaderCircleIcon className="animate-spin" />
                                ) : (
                                  <SearchIcon />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </form>
                        {isWebstersLoading || isWebstersSearching ? (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircleIcon className="size-4 animate-spin" />
                            {isWebstersLoading
                              ? "Loading Webster's..."
                              : "Searching Webster's..."}
                          </p>
                        ) : webstersError ? (
                          <p className="text-sm text-destructive">
                            {webstersError}
                          </p>
                        ) : webstersSearchResults.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {webstersSearchTerm.trim()
                              ? "No matching words found."
                              : "Search Webster's 1828 dictionary."}
                          </p>
                        ) : (
                          <Accordion
                            className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
                            multiple
                            value={webstersWordAccordionValue}
                            onValueChange={(value) =>
                              setWebstersWordAccordionValue(
                                value.filter(Boolean) as string[],
                              )
                            }
                          >
                            {webstersSearchResults.map(({ key, entry }) => (
                              <AccordionItem key={key} value={key}>
                                <AccordionTrigger>{key}</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                  {entry.pronunciation ? (
                                    <p className="text-sm text-muted-foreground">
                                      {entry.pronunciation}
                                    </p>
                                  ) : null}
                                  {entry.definitions.length > 0 ? (
                                    <div className="space-y-2 text-sm">
                                      {entry.definitions.map(
                                        (definition, index) => (
                                          <div
                                            key={`${key}-definition-${index}`}
                                            className="space-y-1"
                                          >
                                            <p className="font-medium capitalize">
                                              {definition.type}
                                            </p>
                                            <p
                                              className="leading-relaxed"
                                              dangerouslySetInnerHTML={{
                                                __html: definition.text,
                                              }}
                                            />
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      No definitions found.
                                    </p>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="strongs">
                  <AccordionTrigger
                    className={cn(
                      hasStrongsInfo && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Strong&apos;s Dictionary
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isStrongsSectionOpen ? (
                      <>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const value = formData.get("strongs-search");
                            applyStrongsSearch(typeof value === "string" ? value : "");
                          }}
                        >
                          <InputGroup>
                            <InputGroupInput
                              ref={strongsSearchInputRef}
                              name="strongs-search"
                              placeholder="Search Strong's..."
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="submit"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Search Strong's dictionary"
                                disabled={isStrongsLoading || isStrongsSearching}
                              >
                                {isStrongsLoading || isStrongsSearching ? (
                                  <LoaderCircleIcon className="animate-spin" />
                                ) : (
                                  <SearchIcon />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </form>
                        {isStrongsLoading || isStrongsSearching ? (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircleIcon className="size-4 animate-spin" />
                            {isStrongsLoading
                              ? "Loading Strong's..."
                              : "Searching Strong's..."}
                          </p>
                        ) : strongsError ? (
                          <p className="text-sm text-destructive">{strongsError}</p>
                        ) : strongsSearchResults.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {strongsSearchTerm.trim()
                              ? "No matching entries found."
                              : "Click a Strong's-tagged word or search Strong's dictionary."}
                          </p>
                        ) : (
                          <Accordion
                            className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
                            multiple
                            value={strongsWordAccordionValue}
                            onValueChange={(value) =>
                              setStrongsWordAccordionValue(
                                value.filter(Boolean) as string[],
                              )
                            }
                          >
                            {strongsSearchResults.map(({ code, testament, entry }) => (
                              <AccordionItem key={code} value={code}>
                                <AccordionTrigger>{`${code} (${testament})`}</AccordionTrigger>
                                <AccordionContent className="space-y-2 text-sm">
                                  {entry.kjv_def ? (
                                    <p>
                                      <span className="text-muted-foreground">
                                        KJV Definition:
                                      </span>{" "}
                                      {entry.kjv_def}
                                    </p>
                                  ) : null}
                                  {entry.kjv_refs && Object.keys(entry.kjv_refs).length > 0 ? (
                                    <div className="space-y-1">
                                      <p className="text-muted-foreground">KJV References</p>
                                      <Accordion className="w-full rounded-md border px-2" multiple>
                                        {Object.entries(entry.kjv_refs).map(
                                          ([word, references]) => (
                                            <AccordionItem
                                              key={`${code}-${word}`}
                                              value={`${code}-${word}`}
                                            >
                                              <AccordionTrigger>{`${word} (${references.length})`}</AccordionTrigger>
                                              <AccordionContent>
                                                <p className="leading-7">
                                                  {references.map((reference, index) => (
                                                    <Fragment key={`${code}-${word}-${reference}-${index}`}>
                                                      <ConcordanceReferencePopover
                                                        reference={reference}
                                                        highlightWord={word}
                                                        renderPreview={referencePreviewContent}
                                                        onOpenReference={openConcordanceReference}
                                                        onCloseSidebar={closeRightSidebarForMobile}
                                                      />
                                                      {index < references.length - 1
                                                        ? ", "
                                                        : null}
                                                    </Fragment>
                                                  ))}
                                                </p>
                                              </AccordionContent>
                                            </AccordionItem>
                                          ),
                                        )}
                                      </Accordion>
                                    </div>
                                  ) : null}
                                  {entry.strongs_def ? (
                                    <p>
                                      <span className="text-muted-foreground">
                                        Strong&apos;s Definition:
                                      </span>{" "}
                                      {entry.strongs_def}
                                    </p>
                                  ) : null}
                                  {entry.lemma ? (
                                    <p>
                                      <span className="text-muted-foreground">Lemma:</span>{" "}
                                      <span className="font-mono">{entry.lemma}</span>
                                    </p>
                                  ) : null}
                                  {entry.translit ? (
                                    <p>
                                      <span className="text-muted-foreground">
                                        Transliteration:
                                      </span>{" "}
                                      <span className="font-mono">{entry.translit}</span>
                                    </p>
                                  ) : null}
                                  {entry.pron ? (
                                    <p>
                                      <span className="text-muted-foreground">Pronunciation:</span>{" "}
                                      {entry.pron}
                                    </p>
                                  ) : null}
                                  {entry.derivation ? (
                                    <p>
                                      <span className="text-muted-foreground">Derivation:</span>{" "}
                                      {entry.derivation}
                                    </p>
                                  ) : null}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="old-english">
                  <AccordionTrigger
                    className={cn(
                      hasOldEnglishInfo && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Old English Dictionary
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isOldEnglishSectionOpen ? (
                      <>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const value = formData.get("old-english-search");
                            applyOldEnglishSearch(
                              typeof value === "string" ? value : "",
                            );
                          }}
                        >
                          <InputGroup>
                            <InputGroupInput
                              name="old-english-search"
                              placeholder="Search Old English..."
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="submit"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Search Old English dictionary"
                                disabled={
                                  isOldEnglishLoading || isOldEnglishSearching
                                }
                              >
                                {isOldEnglishLoading || isOldEnglishSearching ? (
                                  <LoaderCircleIcon className="animate-spin" />
                                ) : (
                                  <SearchIcon />
                                )}
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </form>
                        {isOldEnglishLoading || isOldEnglishSearching ? (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircleIcon className="size-4 animate-spin" />
                            {isOldEnglishLoading
                              ? "Loading Old English..."
                              : "Searching Old English..."}
                          </p>
                        ) : oldEnglishError ? (
                          <p className="text-sm text-destructive">
                            {oldEnglishError}
                          </p>
                        ) : oldEnglishSearchResults.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {oldEnglishSearchTerm.trim()
                              ? "No matching words found."
                              : "Click a word in the text or search Old English dictionary."}
                          </p>
                        ) : (
                          <div className="space-y-2 text-sm leading-relaxed">
                            {oldEnglishSearchResults.map(({ key, definitions }) => (
                              <p key={key}>
                                <span className="font-semibold">{key}</span>
                                {": "}
                                {definitions.join("; ")}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="maps">
                  <AccordionTrigger
                    className={cn(
                      hasMapsInfo && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Maps &amp; Photos
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isMapsSectionOpen ? (
                      <>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const value = formData.get("maps-search");
                        applyMapsSearch(typeof value === "string" ? value : "");
                      }}
                    >
                      <InputGroup>
                        <InputGroupInput
                          name="maps-search"
                          placeholder="Search maps and photos..."
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="submit"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Search maps"
                            disabled={isMapsLoading || isMapsSearching}
                          >
                            {isMapsLoading || isMapsSearching ? (
                              <LoaderCircleIcon className="animate-spin" />
                            ) : (
                              <SearchIcon />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </form>
                    {isMapsLoading || isMapsSearching ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        {isMapsLoading ? "Loading maps..." : "Searching maps..."}
                      </p>
                    ) : mapsError ? (
                      <p className="text-sm text-destructive">{mapsError}</p>
                    ) : mapsSearchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {mapsSearchTerm.trim()
                          ? "No matching places found."
                          : "Click a word in the text or search maps."}
                      </p>
                    ) : (
                      <Accordion
                        className="w-full rounded-md border px-2"
                        multiple
                        value={mapsWordAccordionValue}
                        onValueChange={(value) =>
                          setMapsWordAccordionValue(
                            value.filter(Boolean) as string[],
                          )
                        }
                      >
                        {mapsDisplayEntries.map(
                          ({
                            entry,
                            itemKey,
                            title,
                            modernIds,
                            photoEntries,
                            linkedPlaces,
                          }) => (
                            <AccordionItem key={itemKey} value={itemKey}>
                              <AccordionTrigger>
                                {title}
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2 text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openMapDialog(entry)}
                                  >
                                    Open Map
                                  </Button>
                                  {entry.types.length > 0 ? (
                                    <span className="text-xs text-muted-foreground">
                                      {entry.types.join(", ")}
                                    </span>
                                  ) : null}
                                </div>
                                {entry.translations.length > 1 ? (
                                  <p className="text-muted-foreground">
                                    Also: {entry.translations.slice(1).join(", ")}
                                  </p>
                                ) : null}
                                {linkedPlaces.length > 0 ? (
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      Linked Places ({linkedPlaces.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {linkedPlaces.map((place) => (
                                        <span
                                          key={`${itemKey}-${place.roleKey}`}
                                          className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                        >
                                          {place.text}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                                <Accordion className="w-full rounded-md border px-2" multiple>
                                  <AccordionItem value={`${itemKey}-references`}>
                                    <AccordionTrigger>
                                      {`References (${entry.verses.length})`}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <p className="leading-7">
                                        {entry.verses.map((reference, verseIndex) => (
                                          <Fragment key={`${itemKey}-${reference}`}>
                                            <ConcordanceReferencePopover
                                              reference={reference}
                                              highlightWord={title}
                                              renderPreview={referencePreviewContent}
                                              onOpenReference={openConcordanceReference}
                                              onCloseSidebar={closeRightSidebarForMobile}
                                            />
                                            {verseIndex < entry.verses.length - 1
                                              ? ", "
                                              : null}
                                          </Fragment>
                                        ))}
                                      </p>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                                {isMapImagesLoading ? (
                                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <LoaderCircleIcon className="size-3.5 animate-spin" />
                                    Loading photos...
                                  </p>
                                ) : mapImagesError ? (
                                  <p className="text-xs text-destructive">
                                    {mapImagesError}
                                  </p>
                                ) : photoEntries.length > 0 ? (
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      Photos ({photoEntries.length})
                                    </p>
                                    {(() => {
                                      const dialogPhotos = deriveMapPhotoDialogItems(
                                        photoEntries.slice(0, 9),
                                        modernIds,
                                        title,
                                      );

                                      return (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                      {photoEntries.slice(0, 9).map((image) => {
                                        const imageLocationKey = modernIds.find((id) =>
                                          Boolean(
                                            image.thumbnails?.[id]?.file ??
                                              image.descriptions?.[id],
                                          ),
                                        );
                                        const thumbFile = imageLocationKey
                                          ? image.thumbnails?.[imageLocationKey]?.file
                                          : undefined;
                                        const thumbDescription = imageLocationKey
                                          ? (image.thumbnails?.[imageLocationKey]
                                              ?.description ??
                                            image.descriptions?.[imageLocationKey])
                                          : undefined;

                                        const clickedIndex = dialogPhotos.findIndex(
                                          (item) => item.id === image.id,
                                        );

                                        return (
                                          <button
                                            key={`${itemKey}-${image.id}`}
                                            type="button"
                                            className="group block overflow-hidden rounded border bg-muted/30 text-left"
                                            onClick={() =>
                                              openPhotoDialog(
                                                dialogPhotos,
                                                Math.max(0, clickedIndex),
                                              )
                                            }
                                            disabled={!thumbFile}
                                          >
                                            {thumbFile ? (
                                              <img
                                                src={`/maps/thumbnails/${thumbFile}`}
                                                alt={cleanMapMarkup(
                                                  thumbDescription ?? title,
                                                )}
                                                className="aspect-4/3 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                                loading="lazy"
                                              />
                                            ) : (
                                              <div className="flex aspect-4/3 items-center justify-center text-[11px] text-muted-foreground">
                                                No local thumbnail
                                              </div>
                                            )}
                                            <div className="px-1.5 py-1 text-[11px] text-muted-foreground">
                                              {cleanMapMarkup(
                                                thumbDescription ??
                                                  image.credit ??
                                                  title,
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                      );
                                    })()}
                                  </div>
                                ) : null}
                              </AccordionContent>
                            </AccordionItem>
                          ),
                        )}
                      </Accordion>
                    )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="genealogy">
                  <AccordionTrigger
                    className={cn(
                      hasGenealogyInfo && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Genealogy
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isGenealogySectionOpen ? (
                      <>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const value = formData.get("genealogy-search");
                        applyGenealogySearch(
                          typeof value === "string" ? value : "",
                        );
                      }}
                    >
                      <InputGroup>
                        <InputGroupInput
                          name="genealogy-search"
                          placeholder="Search genealogy..."
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="submit"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Search genealogy"
                            disabled={isGenealogyLoading || isGenealogySearching}
                          >
                            {isGenealogyLoading || isGenealogySearching ? (
                              <LoaderCircleIcon className="animate-spin" />
                            ) : (
                              <SearchIcon />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </form>
                    {isGenealogyLoading || isGenealogySearching ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        {isGenealogyLoading
                          ? "Loading genealogy..."
                          : "Searching genealogy..."}
                      </p>
                    ) : genealogyError ? (
                      <p className="text-sm text-destructive">
                        {genealogyError}
                      </p>
                    ) : genealogySearchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {genealogySearchTerm.trim()
                          ? "No matching people found."
                          : "Click a name in the text or search genealogy."}
                      </p>
                    ) : (
                      genealogySearchTerm.trim() &&
                      genealogySearchResults.length > 1 ? (
                        <Accordion className="w-full rounded-md border px-2" multiple>
                          {genealogySearchResults.map((person) => (
                            <AccordionItem
                              key={person.id}
                              value={`genealogy-${person.id}`}
                            >
                              <AccordionTrigger>
                                {person.names[0] ?? person.id}
                              </AccordionTrigger>
                              <AccordionContent>
                                {renderGenealogyPersonDetails(person)}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="space-y-2">
                          {genealogySearchResults.map((person) => (
                            <Fragment key={person.id}>
                              {renderGenealogyPersonDetails(person)}
                            </Fragment>
                          ))}
                        </div>
                      )
                    )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="hitchcocks">
                  <AccordionTrigger
                    className={cn(
                      hasHitchcocksInfo &&
                        "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    Hitchcock&apos;s Bible Names
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 overflow-visible">
                    {isHitchcocksSectionOpen ? (
                      <>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const value = formData.get("hitchcocks-search");
                        applyHitchcocksSearch(
                          typeof value === "string" ? value : "",
                        );
                      }}
                    >
                      <InputGroup>
                        <InputGroupInput
                          name="hitchcocks-search"
                          placeholder="Search Hitchcock's..."
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="submit"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Search Hitchcock's Bible Names"
                            disabled={
                              isHitchcocksLoading || isHitchcocksSearching
                            }
                          >
                            {isHitchcocksLoading || isHitchcocksSearching ? (
                              <LoaderCircleIcon className="animate-spin" />
                            ) : (
                              <SearchIcon />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </form>
                    {isHitchcocksLoading || isHitchcocksSearching ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircleIcon className="size-4 animate-spin" />
                        {isHitchcocksLoading
                          ? "Loading Hitchcock's..."
                          : "Searching Hitchcock's..."}
                      </p>
                    ) : hitchcocksError ? (
                      <p className="text-sm text-destructive">
                        {hitchcocksError}
                      </p>
                    ) : hitchcocksSearchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {hitchcocksSearchTerm.trim()
                          ? "No matching names found."
                          : "Click a word in the text or search Hitchcock's Bible Names."}
                      </p>
                    ) : (
                      <div className="space-y-2 text-sm leading-relaxed">
                        {hitchcocksSearchResults.map(({ key, definition }) => (
                          <p key={key}>
                            <span className="font-semibold">{key}</span>
                            {": "}
                            {definition}
                          </p>
                        ))}
                      </div>
                    )}
                      </>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SidebarContent>
          </Sidebar>
        ) : null}
      </SidebarProvider>

      {tokenPopupCard}

      <AlertDialog
        open={isMapDialogOpen}
        onOpenChange={(open) => {
          setIsMapDialogOpen(open);
          if (!open) {
            setActiveMapDialogEntry(null);
            setMapDialogGeoJson(null);
            setMapDialogError(null);
          }
        }}
      >
        <AlertDialogContent className="h-[min(86vh,900px)] w-[min(98vw,1700px)] max-w-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeMapDialogEntry ? mapEntryLabel(activeMapDialogEntry) : "Map"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeMapDialogEntry?.types.length
                ? activeMapDialogEntry.types.join(", ")
                : "Ancient map view"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            {isMapDialogLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Loading map...
              </p>
            ) : mapDialogError ? (
              <p className="text-sm text-destructive">{mapDialogError}</p>
            ) : mapDialogGeoJson ? (
              <Suspense
                fallback={
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Loading map renderer...
                  </p>
                }
              >
                <LazyMapGeoJsonView
                  geojson={mapDialogGeoJson}
                  className="h-[calc(min(86vh,900px)-12rem)] min-h-96 w-full rounded-md border"
                />
              </Suspense>
            ) : (
              <p className="text-sm text-muted-foreground">No map data found.</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsMapDialogOpen(false);
                setActiveMapDialogEntry(null);
                setMapDialogGeoJson(null);
                setMapDialogError(null);
              }}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isPhotoDialogOpen}
        onOpenChange={(open) => {
          setIsPhotoDialogOpen(open);
          if (!open) {
            setPhotoDialogItems([]);
            setPhotoDialogIndex(0);
          }
        }}
      >
        <AlertDialogContent className="w-[min(98vw,1600px)] max-w-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Photo</AlertDialogTitle>
            <AlertDialogDescription>
              {currentPhotoDialogItem
                ? `${photoDialogIndex + 1} of ${photoDialogItems.length}`
                : "No photo selected"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {currentPhotoDialogItem ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-md border bg-muted/20">
                <img
                  src={currentPhotoDialogItem.src}
                  alt={currentPhotoDialogItem.alt}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPhotoDialogItem.caption}
              </p>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => movePhotoDialog(-1)}
                  disabled={photoDialogItems.length <= 1}
                >
                  <ChevronLeftIcon className="size-4" />
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground">
                  {photoDialogIndex + 1} / {photoDialogItems.length}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => movePhotoDialog(1)}
                  disabled={photoDialogItems.length <= 1}
                >
                  Next
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photo available.</p>
          )}
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsPhotoDialogOpen(false);
                setPhotoDialogItems([]);
                setPhotoDialogIndex(0);
              }}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isBookPickerDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBookPickerDialogLeafId(null);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Book and Chapter</AlertDialogTitle>
          </AlertDialogHeader>
          {bookPickerDialogLeaf ? (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <BookChapterPicker
                books={books}
                selectedTestament={bookPickerDialogLeaf.pickerTestament}
                selectedBookIndex={bookPickerDialogLeaf.pickerBookIndex}
                onSelectTestament={(testament) =>
                  updateLeafLocation(bookPickerDialogLeaf.id, {
                    pickerTestament: testament,
                    pickerBookIndex: null,
                  })
                }
                onBackToTestaments={() =>
                  updateLeafLocation(bookPickerDialogLeaf.id, {
                    pickerTestament: null,
                    pickerBookIndex: null,
                  })
                }
                onSelectBook={(bookIndex) =>
                  updateLeafLocation(bookPickerDialogLeaf.id, {
                    pickerBookIndex: bookIndex,
                  })
                }
                onBackToBooks={() =>
                  updateLeafLocation(bookPickerDialogLeaf.id, {
                    pickerBookIndex: null,
                  })
                }
                onSelectChapter={(bookIndex, chapterIndex) => {
                  updateLeafLocation(bookPickerDialogLeaf.id, {
                    bookIndex,
                    chapterIndex,
                    view: "reader",
                  });
                  setBookPickerDialogLeafId(null);
                }}
              />
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setBookPickerDialogLeafId(null);
              }}
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          setIsRenameDialogOpen(open);
          if (!open) {
            setRenameTabId(null);
            setRenameError(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Relabel Tab</AlertDialogTitle>
            <AlertDialogDescription>
              Update the current tab label (minimum 1 character).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => {
              const value = event.target.value;
              setRenameValue(value);
              setRenameError(
                value.trim().length > 0
                  ? null
                  : "Tab label must be at least 1 character.",
              );
            }}
            placeholder="Tab name"
            autoFocus
          />
          {renameError ? (
            <p className="text-sm text-destructive">{renameError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsRenameDialogOpen(false);
                setRenameTabId(null);
                setRenameError(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRenameTab}
              disabled={renameValue.trim().length < 1}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <AlertDialogContent
          size="sm"
          className="flex max-h-[calc(100vh-1.5rem)] flex-col gap-2 overflow-hidden"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Reader preferences for this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-2 py-2">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label htmlFor="theme-mode">Dark Mode</Label>
              <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
            <div className="space-y-2 border-t pt-3">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <Label htmlFor="verse-spacing">Verse Spacing</Label>
                <span className="text-xs text-muted-foreground">
                  {verseSpacing}px
                </span>
              </div>
              <Slider
                id="verse-spacing"
                min={0}
                max={24}
                step={1}
                value={[verseSpacing]}
                onValueChange={(value) => {
                  const nextValue = Array.isArray(value) ? value[0] : value;
                  setVerseSpacing(
                    Math.max(0, Math.min(24, Math.round(nextValue ?? 0))),
                  );
                }}
              />
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
              <Label htmlFor="hide-read-mode-verse-numbers">
                Hide Verse Numbers
              </Label>
              <Switch
                id="hide-read-mode-verse-numbers"
                checked={hideReadModeVerseNumbers}
                onCheckedChange={(checked) =>
                  setHideReadModeVerseNumbers(checked)
                }
              />
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
              <Label htmlFor="read-mode-indents">Paragraph Indents</Label>
              <Switch
                id="read-mode-indents"
                checked={readModeParagraphIndent}
                onCheckedChange={(checked) =>
                  setReadModeParagraphIndent(checked)
                }
              />
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
              <Label htmlFor="flow-verses">Flow Verses by Paragraph</Label>
              <Switch
                id="flow-verses"
                checked={flowVersesByParagraph}
                onCheckedChange={(checked) => setFlowVersesByParagraph(checked)}
              />
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
              <Label htmlFor="vertical-tabs">Vertical Tabs</Label>
              <Switch
                id="vertical-tabs"
                checked={tabsOrientation === "vertical"}
                onCheckedChange={(checked) =>
                  setTabsOrientation(checked ? "vertical" : "horizontal")
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reading Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Track chapter completion across the whole Bible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[65vh] space-y-3 overflow-auto pr-1 text-sm">
            <Progress value={totalProgressPercent} className="w-full">
              <ProgressLabel className="font-semibold">
                Whole Bible
              </ProgressLabel>
              <ProgressValue>
                {() =>
                  `${progressByTestament.total.read}/${progressByTestament.total.total} (${totalProgressPercent}%)`
                }
              </ProgressValue>
            </Progress>

            <Accordion
              className="w-full rounded-md border px-3"
              multiple
              defaultValue={[]}
            >
              {[progressByTestament.old, progressByTestament.new].map(
                (testament) => {
                  const testamentPercent =
                    testament.total > 0
                      ? Math.round((testament.read / testament.total) * 100)
                      : 0;
                  const testamentCode = testament.label.startsWith("Old")
                    ? "OT"
                    : "NT";
                  const testamentIconSrc = iconPath(
                    testamentPercent === 100 ? "color" : "bw",
                    testamentCode,
                  );

                  return (
                    <AccordionItem
                      key={testament.label}
                      value={testament.label}
                      className="w-full"
                    >
                      <AccordionTrigger className="w-full">
                        <div className="flex w-full items-center gap-3">
                          <img
                            src={testamentIconSrc}
                            alt={`${testament.label} icon`}
                            className="size-10 shrink-0"
                          />
                          <Progress value={testamentPercent} className="w-full">
                            <ProgressLabel>{testament.label}</ProgressLabel>
                            <ProgressValue>
                              {() =>
                                `${testament.read}/${testament.total} (${testamentPercent}%)`
                              }
                            </ProgressValue>
                          </Progress>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <Accordion
                          className="w-full rounded-md border px-2"
                          multiple
                          defaultValue={[]}
                        >
                          {testament.books.map((book) => {
                            const bookPercent =
                              book.total > 0
                                ? Math.round((book.read / book.total) * 100)
                                : 0;
                            const bookIconSrc = iconPath(
                              bookPercent === 100 ? "color" : "bw",
                              bookCodeForIndex(book.bookIndex),
                            );
                            return (
                              <AccordionItem
                                key={book.name}
                                value={`${testament.label}-${book.name}`}
                                className="w-full"
                              >
                                <AccordionTrigger className="w-full px-1">
                                  <div className="flex w-full items-center gap-3">
                                    <img
                                      src={bookIconSrc}
                                      alt={`${book.name} icon`}
                                      className="size-10 shrink-0"
                                    />
                                    <Progress
                                      value={bookPercent}
                                      className="w-full"
                                    >
                                      <ProgressLabel className="text-xs">
                                        {book.name}
                                      </ProgressLabel>
                                      <ProgressValue className="text-xs">
                                        {() =>
                                          `${book.read}/${book.total} (${bookPercent}%)`
                                        }
                                      </ProgressValue>
                                    </Progress>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 px-1">
                                  <div className="flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setAllBookChaptersRead(
                                          book.bookIndex,
                                          book.read !== book.total,
                                        )
                                      }
                                    >
                                      {book.read === book.total
                                        ? "Mark all incomplete"
                                        : "Mark all complete"}
                                    </Button>
                                  </div>
                                  <div className="space-y-1">
                                    {book.chapters.map((chapter) => (
                                      <div
                                        key={`${book.name}-${chapter.chapterNumber}`}
                                        className="flex items-center gap-2"
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="flex-1 justify-start"
                                          onClick={() =>
                                            openChapterInNewTab(
                                              book.bookIndex,
                                              chapter.chapterIndex,
                                            )
                                          }
                                        >
                                          {`Chapter ${chapter.chapterNumber}`}
                                        </Button>
                                        <Button
                                          variant={
                                            chapter.read
                                              ? "secondary"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            toggleChapterRead(
                                              book.bookIndex,
                                              chapter.chapterIndex,
                                            )
                                          }
                                        >
                                          {chapter.read ? "Read" : "Mark Read"}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  );
                },
              )}
            </Accordion>
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Reset all reading progress?")) {
                  resetAllProgress();
                }
              }}
            >
              Reset Progress
            </Button>
            <AlertDialogAction onClick={() => setIsProgressOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
