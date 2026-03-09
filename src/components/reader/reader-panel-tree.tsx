import {
  lazy,
  memo,
  Suspense,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AudioLinesIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  ExpandIcon,
  ExternalLinkIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  SplitSquareHorizontalIcon,
  SplitSquareVerticalIcon,
  SquareChevronDownIcon,
  SquareChevronLeftIcon,
  SquareChevronRightIcon,
  SquareChevronUpIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react";

import { type Book, type Chapter, type VerseToken } from "@/types/bible";
import type {
  LeafNode,
  PanelDirection,
  PanelNode,
  SearchPageState,
} from "@/types/reader";
import { cn } from "@/lib/utils";
import {
  findGroupTargetNodeId,
  findParentSplitForLeaf,
} from "@/lib/reader-layout";
import {
  bookCodeForIndex,
  chapterProgressKey,
  iconPath,
  panelViewportElement,
} from "@/lib/reader-view";
import { BookChapterPicker } from "@/components/reader/book-chapter-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChapterTextContent } from "@/components/reader/chapter-text-content";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { LeafNeighbors } from "@/lib/reader-neighbors";
import type { NotesContext, NotesTabState, ReaderNote } from "@/types/notes";
import type { BookmarkPoint } from "@/types/bookmarks";

type ExistingTabTarget = {
  id: string;
  index: number;
  title: string;
};

const LazySearchPage = lazy(async () => {
  const module = await import("@/components/reader/search-page");
  return { default: module.SearchPage };
});

const LazyNotesPage = lazy(async () => {
  const module = await import("@/components/reader/notes-page");
  return { default: module.NotesPage };
});

const AUDIO_PLAYBACK_RATE_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const value = (index + 1) * 0.25;
  return {
    value,
    label: `${value.toFixed(2)}x`,
  };
});

type LeafLocationPatch = Partial<
  Pick<
    LeafNode,
    "bookIndex" | "chapterIndex" | "view" | "pickerTestament" | "pickerBookIndex"
  >
>;

type ReaderPanelTreeProps = {
  root: PanelNode;
  books: Book[];
  activeRoot: PanelNode | null;
  chapterRefIndex: Map<string, number>;
  chapterRefCount: number;
  readChapters: Set<string>;
  readChapterCountByBook: Map<number, number>;
  hideReadModeVerseNumbers: boolean;
  panelMenuOpenLeafId: string | null;
  setPanelMenuOpenLeafId: (leafId: string | null) => void;
  modelLeafNeighbors: Map<string, LeafNeighbors>;
  neighborsForLeaf: (leafId: string) => LeafNeighbors;
  fullscreenLeafId: string | null;
  panelElementRefs: RefObject<Record<string, HTMLDivElement | null>>;
  clearAllPanelPreviews: () => void;
  updateLeafLocation: (leafId: string, patch: LeafLocationPatch) => void;
  setBookPickerDialogLeafId: (leafId: string | null) => void;
  toggleFullscreenLeaf: (leafId: string) => Promise<void>;
  toggleParentGroupOrientation: (leafId: string) => void;
  setOrientationPreviewTarget: (leafId: string) => void;
  clearOrientationPreview: () => void;
  moveLeaf: (leafId: string, direction: PanelDirection) => void;
  setMovePreviewTarget: (leafId: string, direction: PanelDirection) => void;
  clearMovePreview: () => void;
  splitLeaf: (leafId: string, direction: PanelDirection) => void;
  setAddPreviewTarget: (leafId: string, direction: PanelDirection) => void;
  clearAddPreview: () => void;
  splitPanelGroup: (leafId: string, direction: PanelDirection) => void;
  setGroupAddPreviewTarget: (
    leafId: string,
    direction: PanelDirection,
  ) => void;
  existingTabTargets: ExistingTabTarget[];
  moveLeafToExistingTab: (leafId: string, targetTabId: string) => void;
  moveLeafToNewTab: (leafId: string) => void;
  closeLeaf: (leafId: string) => void;
  flowVersesByParagraph: boolean;
  readModeParagraphIndent: boolean;
  isStudyMode: boolean;
  verseSpacing: number;
  onOpenTokenDetails: (
    element: HTMLElement,
    token: VerseToken,
    bookIndex: number,
    chapterIndex: number,
  ) => void;
  onSelectVerse: (
    bookIndex: number,
    chapterIndex: number,
    verseNumber: number,
  ) => void;
  concordanceWords: string[];
  ensureConcordanceWordsLoaded: () => Promise<unknown>;
  onOpenSearchResult: (
    bookIndex: number,
    chapterIndex: number,
    verseStart: number,
    verseEnd?: number,
  ) => void;
  notes: ReaderNote[];
  notesContext: NotesContext | null;
  notesTabStateByLeafId: Record<string, NotesTabState>;
  onChangeNotesTabState: (
    leafId: string,
    patch: Partial<NotesTabState>,
  ) => void;
  onCreateGeneralNote: () => string;
  onCreateContextNote: (context: NotesContext | null) => string | null;
  onUpdateNote: (
    noteId: string,
    patch: Partial<Pick<ReaderNote, "title" | "body" | "scope">>,
  ) => void;
  onDeleteNote: (noteId: string) => void;
  moveLeafChapter: (leafId: string, step: -1 | 1) => void;
  toggleChapterRead: (bookIndex: number, chapterIndex: number) => void;
  updateSplitSize: (splitId: string, ratio: number) => void;
  bookmarkModeEnabled: boolean;
  pendingBookmarkRangeStart: BookmarkPoint | null;
  highlightedVerseRangesByLeafId: Record<string, { start: number; end: number }>;
  searchPageStateByLeafId: Record<string, SearchPageState>;
  onChangeSearchPageState: (
    leafId: string,
    patch: Partial<SearchPageState>,
  ) => void;
  onClearLeafHighlights: (leafId: string) => void;
};

type ReaderLeafPanelProps = Omit<ReaderPanelTreeProps, "root"> & {
  leaf: LeafNode;
};

function formatAudioTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const ReaderLeafPanel = memo(function ReaderLeafPanel({
  leaf,
  books,
  activeRoot,
  chapterRefIndex,
  chapterRefCount,
  readChapters,
  readChapterCountByBook,
  hideReadModeVerseNumbers,
  panelMenuOpenLeafId,
  setPanelMenuOpenLeafId,
  modelLeafNeighbors,
  neighborsForLeaf,
  fullscreenLeafId,
  panelElementRefs,
  clearAllPanelPreviews,
  updateLeafLocation,
  setBookPickerDialogLeafId,
  toggleFullscreenLeaf,
  toggleParentGroupOrientation,
  setOrientationPreviewTarget,
  clearOrientationPreview,
  moveLeaf,
  setMovePreviewTarget,
  clearMovePreview,
  splitLeaf,
  setAddPreviewTarget,
  clearAddPreview,
  splitPanelGroup,
  setGroupAddPreviewTarget,
  existingTabTargets,
  moveLeafToExistingTab,
  moveLeafToNewTab,
  closeLeaf,
  flowVersesByParagraph,
  readModeParagraphIndent,
  isStudyMode,
  verseSpacing,
  onOpenTokenDetails,
  onSelectVerse,
  concordanceWords,
  ensureConcordanceWordsLoaded,
  onOpenSearchResult,
  notes,
  notesContext,
  notesTabStateByLeafId,
  onChangeNotesTabState,
  searchPageStateByLeafId,
  onChangeSearchPageState,
  onCreateGeneralNote,
  onCreateContextNote,
  onUpdateNote,
  onDeleteNote,
  moveLeafChapter,
  toggleChapterRead,
  bookmarkModeEnabled,
  pendingBookmarkRangeStart,
  highlightedVerseRangesByLeafId,
  onClearLeafHighlights,
}: ReaderLeafPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAutoPlayRef = useRef(false);
  const lastAudioSrcRef = useRef("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [audioVisible, setAudioVisible] = useState(false);
  const [audioAutoPlay, setAudioAutoPlay] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioErrored, setAudioErrored] = useState(false);

  useEffect(() => {
    const viewport = panelViewportElement(panelRef.current);
    if (!viewport) {
      setReadingProgress(0);
      return;
    }

    let rafId: number | null = null;
    const calculateProgress = () => {
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      const next = maxScroll <= 0 ? 0 : Math.round((viewport.scrollTop / maxScroll) * 100);
      setReadingProgress(next);
    };
    const onScroll = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(calculateProgress);
    };

    calculateProgress();
    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [leaf.id, leaf.bookIndex, leaf.chapterIndex]);

  const book = books[leaf.bookIndex] ?? null;
  const chapter: Chapter | null = book?.chapters[leaf.chapterIndex] ?? null;
  const key = `${leaf.bookIndex}-${leaf.chapterIndex}`;
  const chapterReadKey = chapterProgressKey(leaf.bookIndex, leaf.chapterIndex);
  const isChapterRead = readChapters.has(chapterReadKey);
  const readChapterCount = readChapterCountByBook.get(leaf.bookIndex) ?? 0;
  const isBookComplete = book ? readChapterCount === book.chapters.length : false;
  const currentBookIconCode = bookCodeForIndex(leaf.bookIndex);
  const currentBookIconSrc = iconPath(
    isBookComplete ? "color" : "bw",
    currentBookIconCode,
  );
  const showVerseNumbers = !hideReadModeVerseNumbers;
  const isPanelMenuOpen = panelMenuOpenLeafId === leaf.id;
  const neighbors = isPanelMenuOpen
    ? (modelLeafNeighbors.get(leaf.id) ?? neighborsForLeaf(leaf.id))
    : {};
  const moveDirections = isPanelMenuOpen
    ? (["left", "right", "up", "down"] as PanelDirection[]).filter(
        (direction) => Boolean(neighbors[direction]),
      )
    : [];
  const groupTargets =
    isPanelMenuOpen && activeRoot
      ? {
          left: findGroupTargetNodeId(activeRoot, leaf.id, "left"),
          right: findGroupTargetNodeId(activeRoot, leaf.id, "right"),
          up: findGroupTargetNodeId(activeRoot, leaf.id, "up"),
          down: findGroupTargetNodeId(activeRoot, leaf.id, "down"),
        }
      : { left: null, right: null, up: null, down: null };
  const parentSplit =
    isPanelMenuOpen && activeRoot
      ? findParentSplitForLeaf(activeRoot, leaf.id)
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
  const hasNext = refIndex >= 0 && refIndex < chapterRefCount - 1;
  const audioSrc = chapter
    ? `/audio/${bookCodeForIndex(leaf.bookIndex)}.${chapter.chapter}.mp3`
    : null;
  const effectiveVolume = audioMuted ? 0 : audioVolume;
  const pendingRangeStartVerseNumber =
    pendingBookmarkRangeStart &&
    pendingBookmarkRangeStart.bookIndex === leaf.bookIndex &&
    pendingBookmarkRangeStart.chapterIndex === leaf.chapterIndex
      ? pendingBookmarkRangeStart.verseNumber
      : null;
  const isFullscreenLeaf = fullscreenLeafId === leaf.id;
  const hasHighlightInLeaf = Boolean(highlightedVerseRangesByLeafId[leaf.id]);

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
        panelRef.current = element;
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
                  alt={`${book?.name ?? "Book"} icon`}
                  className="size-6 shrink-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-auto max-w-full justify-start px-2"
                  onClick={openBookPickerDialog}
                >
                  {`${book?.name ?? "Book"} ${chapter.chapter}`}
                </Button>
              </>
            ) : leaf.view === "search" ? (
              <p className="text-sm text-muted-foreground">Search</p>
            ) : leaf.view === "notes" ? (
              <p className="text-sm text-muted-foreground">Notes</p>
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
                  <Button variant="outline" size="icon-sm" className="ml-auto" />
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
                {hasHighlightInLeaf ? (
                  <DropdownMenuItem
                    onClick={() => {
                      onClearLeafHighlights(leaf.id);
                      closePanelMenu();
                    }}
                  >
                    <XIcon />
                    Clear Highlights
                  </DropdownMenuItem>
                ) : null}
                {!isFullscreenLeaf ? (
                  <>
                    {parentSplit ? (
                      <DropdownMenuItem
                        onClick={() => toggleParentGroupOrientation(leaf.id)}
                        onPointerEnter={() => setOrientationPreviewTarget(leaf.id)}
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
                      onPointerEnter={() => setAddPreviewTarget(leaf.id, "left")}
                      onPointerLeave={() => clearAddPreview()}
                    >
                      <SplitSquareHorizontalIcon />
                      Add Panel Left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => splitLeaf(leaf.id, "right")}
                      onPointerEnter={() => setAddPreviewTarget(leaf.id, "right")}
                      onPointerLeave={() => clearAddPreview()}
                    >
                      <SplitSquareHorizontalIcon className="rotate-180" />
                      Add Panel Right
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => splitLeaf(leaf.id, "up")}
                      onPointerEnter={() => setAddPreviewTarget(leaf.id, "up")}
                      onPointerLeave={() => clearAddPreview()}
                    >
                      <SplitSquareVerticalIcon />
                      Add Panel Above
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => splitLeaf(leaf.id, "down")}
                      onPointerEnter={() => setAddPreviewTarget(leaf.id, "down")}
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
                              onClick={() => splitPanelGroup(leaf.id, "right")}
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
                    <DropdownMenuItem onClick={() => moveLeafToNewTab(leaf.id)}>
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
                  enableVerseSelection={isStudyMode || bookmarkModeEnabled}
                  bookmarkModeEnabled={bookmarkModeEnabled}
                  pendingRangeStartVerseNumber={pendingRangeStartVerseNumber}
                  highlightedVerseRange={
                    highlightedVerseRangesByLeafId[leaf.id] ?? null
                  }
                  verseSpacing={verseSpacing}
                  onOpenTokenDetails={(element, token) =>
                    onOpenTokenDetails(
                      element,
                      token,
                      leaf.bookIndex,
                      leaf.chapterIndex,
                    )
                  }
                  onSelectVerse={(verseNumber) =>
                    onSelectVerse(leaf.bookIndex, leaf.chapterIndex, verseNumber)
                  }
                />
              </ScrollArea>
            </CardContent>

            <div className="border-t">
              <Progress
                value={readingProgress}
                className="w-full"
                aria-label={`Reading progress for ${book?.name ?? "Book"} ${chapter.chapter}`}
              />
              {audioVisible ? (
                <div className="space-y-2 border-b p-2">
                  {audioSrc ? (
                    <>
                      <audio
                        ref={audioRef}
                        src={audioSrc}
                        preload="metadata"
                        muted={audioMuted}
                        onPlay={() => {
                          setAudioPlaying(true);
                        }}
                        onPause={() => {
                          setAudioPlaying(false);
                        }}
                        onTimeUpdate={(event) => {
                          setAudioCurrentTime(event.currentTarget.currentTime);
                        }}
                        onLoadedMetadata={(event) => {
                          const element = event.currentTarget;
                          const previousSrc = lastAudioSrcRef.current;
                          const isSameTrack = previousSrc === audioSrc;
                          lastAudioSrcRef.current = audioSrc ?? "";
                          element.playbackRate = audioPlaybackRate;
                          element.volume = audioVolume;
                          if (isSameTrack) {
                            if (audioCurrentTime > 0) {
                              element.currentTime = audioCurrentTime;
                            }
                          } else {
                            element.currentTime = 0;
                            setAudioCurrentTime(0);
                            setAudioPlaying(false);
                          }
                          setAudioDuration(Number.isFinite(element.duration) ? element.duration : 0);
                          setAudioErrored(false);
                          if (pendingAutoPlayRef.current) {
                            pendingAutoPlayRef.current = false;
                            void element.play().catch(() => {});
                          }
                        }}
                        onEnded={() => {
                          setAudioPlaying(false);
                          if (audioAutoPlay && hasNext) {
                            pendingAutoPlayRef.current = true;
                            moveLeafChapter(leaf.id, 1);
                          }
                        }}
                        onError={() => {
                          setAudioErrored(true);
                        }}
                        className="hidden"
                      />
                      <div className="@container/audio">
                        <div className="flex flex-col gap-2 @md/audio:flex-row @md/audio:items-center">
                          <div className="flex w-full min-w-0 items-center gap-2 @md/audio:w-1/2 @lg/audio:w-7/12">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => {
                                const audio = audioRef.current;
                                if (!audio) {
                                  return;
                                }
                                if (audio.paused) {
                                  void audio.play().catch(() => {});
                                } else {
                                  audio.pause();
                                }
                              }}
                              aria-label={audioPlaying ? "Pause audio" : "Play audio"}
                            >
                              {audioPlaying ? <PauseIcon /> : <PlayIcon />}
                            </Button>
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <span className="w-16 shrink-0 text-[10px] text-muted-foreground tabular-nums">
                                {formatAudioTime(audioCurrentTime)}/{formatAudioTime(audioDuration)}
                              </span>
                              <Slider
                                className="flex-1"
                                min={0}
                                max={audioDuration || 1}
                                value={[Math.min(audioCurrentTime, audioDuration || 0)]}
                                onValueChange={(value) => {
                                  const nextTime = Array.isArray(value) ? (value[0] ?? 0) : value;
                                  const audio = audioRef.current;
                                  if (!audio) {
                                    return;
                                  }
                                  audio.currentTime = nextTime;
                                  setAudioCurrentTime(nextTime);
                                }}
                                aria-label="Seek chapter audio"
                              />
                            </div>
                          </div>

                          <div className="flex w-full min-w-0 items-center gap-1.5 @md/audio:w-1/2 @md/audio:justify-start @lg/audio:w-5/12 @lg/audio:justify-end">
                            <Select
                              value={`${audioPlaybackRate.toFixed(2)}x`}
                              onValueChange={(value) => {
                                if (!value) {
                                  return;
                                }
                                const nextRate = Number.parseFloat(value);
                                if (!Number.isFinite(nextRate)) {
                                  return;
                                }
                                setAudioPlaybackRate(nextRate);
                                const audio = audioRef.current;
                                if (audio) {
                                  audio.playbackRate = nextRate;
                                }
                              }}
                            >
                              <SelectTrigger size="sm" className="h-7 w-20 shrink-0 px-2 text-xs tabular-nums">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="w-20 min-w-0">
                                {AUDIO_PLAYBACK_RATE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.label}
                                    className="pr-8"
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex min-w-0 flex-1 items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => {
                                  const nextMuted = !audioMuted;
                                  setAudioMuted(nextMuted);
                                  const audio = audioRef.current;
                                  if (audio) {
                                    audio.muted = nextMuted;
                                  }
                                }}
                                aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
                              >
                                {effectiveVolume <= 0 ? (
                                  <VolumeXIcon />
                                ) : effectiveVolume < 0.5 ? (
                                  <Volume1Icon />
                                ) : (
                                  <Volume2Icon />
                                )}
                              </Button>
                              <div className="min-w-14 flex-1">
                                <Slider
                                  className="w-full"
                                  min={0}
                                  max={1}
                                  step={0.05}
                                  value={[audioVolume]}
                                  onValueChange={(value) => {
                                    const nextVolume = Array.isArray(value) ? (value[0] ?? 0) : value;
                                    setAudioVolume(nextVolume);
                                    const audio = audioRef.current;
                                    if (audio) {
                                      audio.volume = nextVolume;
                                    }
                                  }}
                                  aria-label="Audio volume"
                                />
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <span className="text-[11px] whitespace-nowrap text-muted-foreground">Auto</span>
                              <Switch
                                checked={audioAutoPlay}
                                onCheckedChange={(checked) => {
                                  setAudioAutoPlay(checked === true);
                                }}
                                size="sm"
                                aria-label="Toggle auto-play next chapter"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {audioErrored ? (
                        <p className="text-xs text-muted-foreground">
                          Audio unavailable for this chapter.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Audio unavailable for this chapter.
                    </p>
                  )}
                </div>
              ) : null}
              <div className="flex items-center justify-between p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAudioVisible((current) => {
                      const nextVisible = !current;
                      if (!nextVisible) {
                        const audio = audioRef.current;
                        if (audio) {
                          audio.pause();
                          setAudioCurrentTime(audio.currentTime);
                        }
                        setAudioPlaying(false);
                      }
                      return nextVisible;
                    })
                  }
                >
                  <AudioLinesIcon />
                  {audioVisible ? "Hide Audio" : "Show Audio"}
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
                    onClick={() => moveLeafChapter(leaf.id, -1)}
                    disabled={!hasPrev}
                  >
                    <ChevronLeftIcon />
                    Prev
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
        ) : leaf.view === "search" ? (
          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading search...
                </div>
              }
            >
              <LazySearchPage
                books={books}
                concordanceWords={concordanceWords}
                ensureConcordanceWordsLoaded={ensureConcordanceWordsLoaded}
                state={
                  searchPageStateByLeafId[leaf.id] ?? {
                    searchMode: "contains-any",
                    caseSensitive: false,
                    chipInput: "",
                    phraseInput: "",
                    selectedWords: [],
                    expandedBookTree: ["entire", "old", "new"],
                    selectedBookIndexes: [],
                    results: [],
                    error: null,
                  }
                }
                onStateChange={(patch) => onChangeSearchPageState(leaf.id, patch)}
                onOpenResult={onOpenSearchResult}
              />
            </Suspense>
          </CardContent>
        ) : leaf.view === "notes" ? (
          <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading notes...
                </div>
              }
            >
              <LazyNotesPage
                books={books}
                notes={notes}
                context={notesContext}
                tabState={notesTabStateByLeafId[leaf.id] ?? null}
                onTabStateChange={(patch) => onChangeNotesTabState(leaf.id, patch)}
                onCreateGeneralNote={onCreateGeneralNote}
                onCreateContextNote={onCreateContextNote}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
              />
            </Suspense>
          </CardContent>
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
});

export const ReaderPanelTree = memo(function ReaderPanelTree({
  root,
  books,
  activeRoot,
  chapterRefIndex,
  chapterRefCount,
  readChapters,
  readChapterCountByBook,
  hideReadModeVerseNumbers,
  panelMenuOpenLeafId,
  setPanelMenuOpenLeafId,
  modelLeafNeighbors,
  neighborsForLeaf,
  fullscreenLeafId,
  panelElementRefs,
  clearAllPanelPreviews,
  updateLeafLocation,
  setBookPickerDialogLeafId,
  toggleFullscreenLeaf,
  toggleParentGroupOrientation,
  setOrientationPreviewTarget,
  clearOrientationPreview,
  moveLeaf,
  setMovePreviewTarget,
  clearMovePreview,
  splitLeaf,
  setAddPreviewTarget,
  clearAddPreview,
  splitPanelGroup,
  setGroupAddPreviewTarget,
  existingTabTargets,
  moveLeafToExistingTab,
  moveLeafToNewTab,
  closeLeaf,
  flowVersesByParagraph,
  readModeParagraphIndent,
  isStudyMode,
  verseSpacing,
  onOpenTokenDetails,
  onSelectVerse,
  concordanceWords,
  ensureConcordanceWordsLoaded,
  onOpenSearchResult,
  notes,
  notesContext,
  notesTabStateByLeafId,
  onChangeNotesTabState,
  searchPageStateByLeafId,
  onChangeSearchPageState,
  onCreateGeneralNote,
  onCreateContextNote,
  onUpdateNote,
  onDeleteNote,
  moveLeafChapter,
  toggleChapterRead,
  updateSplitSize,
  bookmarkModeEnabled,
  pendingBookmarkRangeStart,
  highlightedVerseRangesByLeafId,
  onClearLeafHighlights,
}: ReaderPanelTreeProps) {
  const renderLeaf = (leaf: LeafNode) => (
    <ReaderLeafPanel
      key={leaf.id}
      leaf={leaf}
      books={books}
      activeRoot={activeRoot}
      chapterRefIndex={chapterRefIndex}
      chapterRefCount={chapterRefCount}
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
      verseSpacing={verseSpacing}
      onOpenTokenDetails={onOpenTokenDetails}
      onSelectVerse={onSelectVerse}
      concordanceWords={concordanceWords}
      ensureConcordanceWordsLoaded={ensureConcordanceWordsLoaded}
      onOpenSearchResult={onOpenSearchResult}
      notes={notes}
      notesContext={notesContext}
      notesTabStateByLeafId={notesTabStateByLeafId}
      onChangeNotesTabState={onChangeNotesTabState}
      searchPageStateByLeafId={searchPageStateByLeafId}
      onChangeSearchPageState={onChangeSearchPageState}
      onCreateGeneralNote={onCreateGeneralNote}
      onCreateContextNote={onCreateContextNote}
      onUpdateNote={onUpdateNote}
      onDeleteNote={onDeleteNote}
      moveLeafChapter={moveLeafChapter}
      toggleChapterRead={toggleChapterRead}
      updateSplitSize={updateSplitSize}
      bookmarkModeEnabled={bookmarkModeEnabled}
      pendingBookmarkRangeStart={pendingBookmarkRangeStart}
      highlightedVerseRangesByLeafId={highlightedVerseRangesByLeafId}
      onClearLeafHighlights={onClearLeafHighlights}
    />
  );

  const renderNode = (node: PanelNode): ReactNode => {
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
        <ResizablePanel id={`${node.id}-first`} defaultSize={node.ratio} minSize={15}>
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
  };

  return <>{renderNode(root)}</>;
});
