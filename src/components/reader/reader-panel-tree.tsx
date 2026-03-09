import { memo, type ReactNode, type RefObject, useEffect, useState } from "react";
import {
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
  RotateCwIcon,
  SplitSquareHorizontalIcon,
  SplitSquareVerticalIcon,
  SquareChevronDownIcon,
  SquareChevronLeftIcon,
  SquareChevronRightIcon,
  SquareChevronUpIcon,
  XIcon,
} from "lucide-react";

import { type Book, type Chapter, type VerseToken } from "@/types/bible";
import type {
  LeafNode,
  PanelDirection,
  PanelNode,
} from "@/types/reader";
import { cn } from "@/lib/utils";
import {
  findGroupTargetNodeId,
  findParentSplitForLeaf,
} from "@/lib/reader-layout";
import { bookCodeForIndex, chapterProgressKey, iconPath } from "@/lib/reader-view";
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
import { SearchPage } from "@/components/reader/search-page";
import { NotesPage } from "@/components/reader/notes-page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { LeafNeighbors } from "@/lib/reader-neighbors";
import type { NotesContext, NotesTabState, ReaderNote } from "@/types/notes";

type ExistingTabTarget = {
  id: string;
  index: number;
  title: string;
};

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
};

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
  onCreateGeneralNote,
  onCreateContextNote,
  onUpdateNote,
  onDeleteNote,
  moveLeafChapter,
  toggleChapterRead,
  updateSplitSize,
}: ReaderPanelTreeProps) {
  const [leafScrollProgress, setLeafScrollProgress] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const leafIds: string[] = [];
    const collectLeafIds = (node: PanelNode) => {
      if (node.type === "leaf") {
        leafIds.push(node.id);
        return;
      }
      collectLeafIds(node.first);
      collectLeafIds(node.second);
    };
    collectLeafIds(root);

    setLeafScrollProgress((current) => {
      const next: Record<string, number> = {};
      for (const leafId of leafIds) {
        next[leafId] = current[leafId] ?? 0;
      }
      return next;
    });

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
  }, [panelElementRefs, root]);

  const renderLeaf = (leaf: LeafNode) => {
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
    const readingProgress = leafScrollProgress[leaf.id] ?? 0;
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
          ) : leaf.view === "search" ? (
            <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
              <SearchPage
                books={books}
                concordanceWords={concordanceWords}
                ensureConcordanceWordsLoaded={ensureConcordanceWordsLoaded}
                onOpenResult={onOpenSearchResult}
              />
            </CardContent>
          ) : leaf.view === "notes" ? (
            <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
              <NotesPage
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
  };

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
