import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  ExpandIcon,
  MinimizeIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  SplitSquareHorizontalIcon,
  SplitSquareVerticalIcon,
  XIcon,
} from "lucide-react";

import { type Book, type Chapter, type VerseToken } from "@/types/bible";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";
import { BookChapterPicker } from "@/components/reader/book-chapter-picker";

type ReaderPayload = {
  books?: Book[];
};

type PanelDirection = "left" | "right" | "up" | "down";
type SplitOrientation = "horizontal" | "vertical";

type LeafNode = {
  id: string;
  type: "leaf";
  view: "reader" | "picker";
  bookIndex: number;
  chapterIndex: number;
  pickerTestament: "old" | "new" | null;
  pickerBookIndex: number | null;
};

type SplitNode = {
  id: string;
  type: "split";
  orientation: SplitOrientation;
  ratio: number;
  first: PanelNode;
  second: PanelNode;
};

type PanelNode = LeafNode | SplitNode;

type ReaderTab = {
  id: string;
  title: string;
  root: PanelNode;
};

type TokenPopupState = {
  token: VerseToken;
  x: number;
  y: number;
};

function hasTokenMetadata(token: VerseToken) {
  return Boolean(
    token.strong || token.lemma || token.morph || token.divineName,
  );
}

function isPunctuationToken(tokenText: string) {
  return /^[,.;:!?)]/.test(tokenText);
}

function formatDisplayTokenText(token: VerseToken) {
  if (!token.divineName) {
    return token.text;
  }

  const possessiveMatch = token.text.match(/^(.+?)(['’])([sS])$/);
  if (possessiveMatch) {
    const [, base, apostrophe] = possessiveMatch;
    return `${base.toUpperCase()}${apostrophe}s`;
  }

  return token.text.toUpperCase();
}

function renderToken(
  token: VerseToken,
  isStudyMode: boolean,
  onOpenDetails: (element: HTMLElement, token: VerseToken) => void,
) {
  const tokenClassName = cn(token.added && "italic");
  const displayText = formatDisplayTokenText(token);
  const showMetadata = isStudyMode && hasTokenMetadata(token);

  if (!showMetadata) {
    return <span className={tokenClassName}>{displayText}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-sm px-0.5 py-0.5 underline decoration-dotted underline-offset-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60"
      aria-label={`Details for ${displayText}`}
      onClick={(event) => onOpenDetails(event.currentTarget, token)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(event.currentTarget, token);
        }
      }}
    >
      <span className={tokenClassName}>{displayText}</span>
    </span>
  );
}

function renderVerseTokens(
  tokens: VerseToken[],
  isStudyMode: boolean,
  onOpenDetails: (element: HTMLElement, token: VerseToken) => void,
) {
  return tokens.map((token, tokenIndex) => {
    const leadingSpace = tokenIndex > 0 && !isPunctuationToken(token.text);

    return (
      <Fragment key={`${token.text}-${tokenIndex}`}>
        {leadingSpace ? " " : null}
        {renderToken(token, isStudyMode, onOpenDetails)}
      </Fragment>
    );
  });
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

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLeaf(
  bookIndex = 0,
  chapterIndex = 0,
  view: LeafNode["view"] = "picker",
): LeafNode {
  return {
    id: createId(),
    type: "leaf",
    view,
    bookIndex,
    chapterIndex,
    pickerTestament: null,
    pickerBookIndex: null,
  };
}

function createInitialTab(
  index: number,
  view: LeafNode["view"] = "reader",
): ReaderTab {
  return {
    id: createId(),
    title: `Tab ${index}`,
    root: createLeaf(0, 0, view),
  };
}

function splitPanelNode(
  node: PanelNode,
  targetLeafId: string,
  direction: PanelDirection,
): { next: PanelNode; createdLeafId: string | null } {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return { next: node, createdLeafId: null };
    }

    const newLeaf = createLeaf();
    const orientation: SplitOrientation =
      direction === "left" || direction === "right" ? "horizontal" : "vertical";

    const placeNewFirst = direction === "left" || direction === "up";
    const split: SplitNode = {
      id: createId(),
      type: "split",
      orientation,
      ratio: 50,
      first: placeNewFirst ? newLeaf : node,
      second: placeNewFirst ? node : newLeaf,
    };

    return { next: split, createdLeafId: newLeaf.id };
  }

  const firstResult = splitPanelNode(node.first, targetLeafId, direction);
  if (firstResult.createdLeafId) {
    return {
      next: { ...node, first: firstResult.next },
      createdLeafId: firstResult.createdLeafId,
    };
  }

  const secondResult = splitPanelNode(node.second, targetLeafId, direction);
  if (secondResult.createdLeafId) {
    return {
      next: { ...node, second: secondResult.next },
      createdLeafId: secondResult.createdLeafId,
    };
  }

  return { next: node, createdLeafId: null };
}

function removeLeafNode(
  node: PanelNode,
  targetLeafId: string,
): { next: PanelNode | null; removed: boolean } {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return { next: node, removed: false };
    }
    return { next: null, removed: true };
  }

  const first = removeLeafNode(node.first, targetLeafId);
  if (first.removed) {
    if (!first.next) {
      return { next: node.second, removed: true };
    }
    return { next: { ...node, first: first.next }, removed: true };
  }

  const second = removeLeafNode(node.second, targetLeafId);
  if (second.removed) {
    if (!second.next) {
      return { next: node.first, removed: true };
    }
    return { next: { ...node, second: second.next }, removed: true };
  }

  return { next: node, removed: false };
}

function updateLeafNode(
  node: PanelNode,
  targetLeafId: string,
  patch: Partial<
    Pick<
      LeafNode,
      "bookIndex" | "chapterIndex" | "view" | "pickerTestament" | "pickerBookIndex"
    >
  >,
): PanelNode {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return node;
    }
    return { ...node, ...patch };
  }

  const nextFirst = updateLeafNode(node.first, targetLeafId, patch);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = updateLeafNode(node.second, targetLeafId, patch);
  if (nextSecond !== node.second) {
    return { ...node, second: nextSecond };
  }

  return node;
}

function updateSplitRatio(
  node: PanelNode,
  splitId: string,
  ratio: number,
): PanelNode {
  if (node.type === "leaf") {
    return node;
  }

  if (node.id === splitId) {
    return { ...node, ratio };
  }

  const nextFirst = updateSplitRatio(node.first, splitId, ratio);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = updateSplitRatio(node.second, splitId, ratio);
  if (nextSecond !== node.second) {
    return { ...node, second: nextSecond };
  }

  return node;
}

function countLeaves(node: PanelNode): number {
  if (node.type === "leaf") {
    return 1;
  }
  return countLeaves(node.first) + countLeaves(node.second);
}

function findLeafNode(node: PanelNode, leafId: string): LeafNode | null {
  if (node.type === "leaf") {
    return node.id === leafId ? node : null;
  }

  return findLeafNode(node.first, leafId) ?? findLeafNode(node.second, leafId);
}

export function KJVReader() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [tabs, setTabs] = useState<ReaderTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tokenPopup, setTokenPopup] = useState<TokenPopupState | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [fullscreenLeafId, setFullscreenLeafId] = useState<string | null>(null);
  const tabEndRef = useRef<HTMLDivElement>(null);
  const panelElementRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    let cancelled = false;

    async function loadGeneratedData() {
      try {
        const response = await fetch("/data/kjv.json");
        if (!response.ok) {
          if (!cancelled) {
            setLoadError("Could not load /data/kjv.json");
            setIsLoaded(true);
          }
          return;
        }

        const payload = (await response.json()) as unknown;
        const parsedBooks = parseBooks(payload);
        if (!parsedBooks || parsedBooks.length === 0 || cancelled) {
          if (!cancelled) {
            setLoadError("Invalid reader data format in /data/kjv.json");
            setIsLoaded(true);
          }
          return;
        }

        const initialTab = createInitialTab(1);
        setBooks(parsedBooks);
        setTabs([initialTab]);
        setActiveTabId(initialTab.id);
        setLoadError(null);
        setIsLoaded(true);
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load generated reader data");
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
  useEffect(() => {
    function onFullscreenChange() {
      const element = document.fullscreenElement as HTMLElement | null;
      const leafId = element?.dataset.panelLeafId ?? null;
      setFullscreenLeafId(leafId);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

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
        "bookIndex" | "chapterIndex" | "view" | "pickerTestament" | "pickerBookIndex"
      >
    >,
  ) {
    updateActiveTab((tab) => ({
      ...tab,
      root: updateLeafNode(tab.root, leafId, patch),
    }));
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

  function updateSplitSize(splitId: string, ratio: number) {
    updateActiveTab((tab) => ({
      ...tab,
      root: updateSplitRatio(tab.root, splitId, ratio),
    }));
  }

  function addTab() {
    const nextTab = createInitialTab(tabs.length + 1, "picker");
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
    requestAnimationFrame(() => {
      tabEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "end",
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

  function openTokenDetailsFromElement(
    element: HTMLElement,
    token: VerseToken,
  ) {
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
  }

  function openRenameDialog(tabId: string) {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) {
      return;
    }

    setRenameTabId(tabId);
    setRenameValue(tab.title);
    setIsRenameDialogOpen(true);
  }

  function confirmRenameTab() {
    if (!renameTabId) {
      return;
    }

    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      return;
    }

    setTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === renameTabId ? { ...tab, title: nextTitle } : tab,
      ),
    );
    setIsRenameDialogOpen(false);
    setRenameTabId(null);
  }

  async function toggleFullscreenLeaf(leafId: string) {
    const element = panelElementRefs.current[leafId];
    if (!element) {
      return;
    }

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
        return;
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      await element.requestFullscreen();
    } catch {
      // Ignore fullscreen rejections (browser policy/user gesture edge cases).
    }
  }

  function renderLeaf(leaf: LeafNode) {
    const book = books[leaf.bookIndex];
    if (!book) {
      return null;
    }

    const chapter = chapterFromLeaf(leaf);

    const key = `${leaf.bookIndex}-${leaf.chapterIndex}`;
    const refIndex = chapterRefIndex.get(key) ?? -1;
    const hasPrev = refIndex > 0;
    const hasNext = refIndex >= 0 && refIndex < chapterRefs.length - 1;

    return (
      <div
        data-panel-leaf-id={leaf.id}
        ref={(element) => {
          panelElementRefs.current[leaf.id] = element;
        }}
        className="h-full bg-background"
      >
        <Card className="flex h-full min-h-0 flex-col rounded-none">
        <CardHeader className="border-b p-2 sm:p-3">
          <div className="flex flex-wrap items-center gap-2">
            {leaf.view === "reader" && chapter ? (
              <>
                <Select
                  items={books.map((bookItem) => ({
                    label: bookItem.name,
                    value: bookItem.name,
                  }))}
                  value={book.name}
                  onValueChange={(value) => {
                    const nextBookIndex = books.findIndex(
                      (bookItem) => bookItem.name === value,
                    );
                    if (nextBookIndex >= 0) {
                      updateLeafLocation(leaf.id, {
                        bookIndex: nextBookIndex,
                        chapterIndex: 0,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="min-w-36 sm:min-w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {books.map((bookItem) => (
                        <SelectItem key={bookItem.name} value={bookItem.name}>
                          {bookItem.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  items={book.chapters.map((chapterItem) => ({
                    label: `Chapter ${chapterItem.chapter}`,
                    value: String(chapterItem.chapter),
                  }))}
                  value={String(chapter.chapter)}
                  onValueChange={(value) => {
                    const nextChapterIndex = book.chapters.findIndex(
                      (chapterItem) => String(chapterItem.chapter) === value,
                    );
                    if (nextChapterIndex >= 0) {
                      updateLeafLocation(leaf.id, {
                        chapterIndex: nextChapterIndex,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {book.chapters.map((chapterItem) => (
                        <SelectItem
                          key={`${book.name}-${chapterItem.chapter}`}
                          value={String(chapterItem.chapter)}
                        >
                          Chapter {chapterItem.chapter}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose a book and chapter
              </p>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="ml-auto" />
                }
              >
                <PlusIcon />
                Panel
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void toggleFullscreenLeaf(leaf.id)}>
                  {fullscreenLeafId === leaf.id ? (
                    <MinimizeIcon />
                  ) : (
                    <ExpandIcon />
                  )}
                  {fullscreenLeafId === leaf.id
                    ? "Exit Full Screen"
                    : "Full Screen"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => splitLeaf(leaf.id, "left")}>
                  <SplitSquareHorizontalIcon />
                  Split Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => splitLeaf(leaf.id, "right")}>
                  <SplitSquareHorizontalIcon className="rotate-180" />
                  Split Right
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => splitLeaf(leaf.id, "up")}>
                  <SplitSquareVerticalIcon />
                  Split Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => splitLeaf(leaf.id, "down")}>
                  <SplitSquareVerticalIcon className="rotate-180" />
                  Split Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => closeLeaf(leaf.id)}>
                  <XIcon />
                  Close Panel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {leaf.view === "reader" && chapter ? (
          <>
            <CardContent className="min-h-0 flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="space-y-5 p-3 sm:p-4">
                  {chapter.verses.map((verse) => (
                    <article
                      key={`${book.name}-${chapter.chapter}-${verse.verse}`}
                      className="[content-visibility:auto] [contain-intrinsic-size:0_2.5rem]"
                    >
                      <p
                        className={cn(
                          "text-pretty leading-7",
                          verse.redLetter && "text-red-700",
                          !isStudyMode && verse.paragraphStart && "pl-4 sm:pl-6",
                        )}
                      >
                        <span className="mr-2 align-top text-xs font-semibold text-muted-foreground">
                          {verse.verse}
                        </span>
                        {renderVerseTokens(
                          verse.tokens,
                          isStudyMode,
                          (element, token) =>
                            openTokenDetailsFromElement(element, token),
                        )}
                      </p>
                    </article>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            <div className="flex items-center justify-between border-t p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveLeafChapter(leaf.id, -1)}
                disabled={!hasPrev}
              >
                <ChevronLeftIcon />
                Prev
              </Button>
              <div className="text-xs text-muted-foreground">
                {book.name} {chapter.chapter}
              </div>
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
          </>
        ) : (
          <CardContent className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
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
          const nextSize = layout[`${node.id}-first`]
          if (typeof nextSize === "number") {
            updateSplitSize(node.id, nextSize)
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
        <ResizablePanel id={`${node.id}-second`} defaultSize={100 - node.ratio} minSize={15}>
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

  return (
    <main className="h-screen w-full overflow-hidden bg-background">
      <SidebarProvider
        open={isRightSidebarOpen}
        onOpenChange={setIsRightSidebarOpen}
      >
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
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="text-primary" />
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
              <SidebarTrigger />
            </div>
          </header>

          <div className="shrink-0 border-b px-4 py-2 sm:px-6">
            <ScrollArea className="w-full">
              <div className="flex w-max items-center gap-2 px-1 py-1">
                {tabs.map((tab, index) => {
                  const active = tab.id === activeTabId;
                  const canMoveLeft = tabs.length > 1 && index > 0;
                  const canMoveRight =
                    tabs.length > 1 && index < tabs.length - 1;
                  return (
                    <ButtonGroup key={tab.id}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTabId(tab.id)}
                        className={cn(
                          "min-w-24 justify-start",
                          active &&
                            "!border-foreground !bg-foreground !text-background hover:!bg-foreground/90 hover:!text-background",
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
                                active &&
                                  "!border-foreground !bg-foreground !text-background hover:!bg-foreground/90 hover:!text-background",
                              )}
                              aria-label={`Tab options for ${tab.title}`}
                            >
                              <EllipsisIcon />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="start" className="w-40">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => openRenameDialog(tab.id)}
                            >
                              Rename Tab
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          {tabs.length > 1 ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                {canMoveLeft ? (
                                  <DropdownMenuItem
                                    onClick={() => moveTab(tab.id, -1)}
                                  >
                                    Move Left
                                  </DropdownMenuItem>
                                ) : null}
                                {canMoveRight ? (
                                  <DropdownMenuItem
                                    onClick={() => moveTab(tab.id, 1)}
                                  >
                                    Move Right
                                  </DropdownMenuItem>
                                ) : null}
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() => closeTab(tab.id)}
                                >
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
                >
                  <PlusIcon />
                </Button>
                <div ref={tabEndRef} />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {renderNode(activeTab.root)}
          </div>
        </SidebarInset>

        <Sidebar side="right" className="h-screen">
          <SidebarHeader>
            <h2 className="text-base font-semibold">Sidebar</h2>
            <p className="text-sm text-muted-foreground">
              Placeholder for future tools.
            </p>
          </SidebarHeader>
          <SidebarContent className="text-muted-foreground">
            This right sidebar is ready for study tools, notes, references, or
            tab presets.
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>

      {tokenPopup ? (
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
      ) : null}

      <AlertDialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          setIsRenameDialogOpen(open);
          if (!open) {
            setRenameTabId(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Tab</AlertDialogTitle>
            <AlertDialogDescription>
              Update the current tab label.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder="Tab name"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsRenameDialogOpen(false);
                setRenameTabId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRenameTab}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Reader preferences for this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="theme-mode">Dark Mode</Label>
            <Switch
              id="theme-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
