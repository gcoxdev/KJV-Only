import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  ExpandIcon,
  MinimizeIcon,
  MenuIcon,
  PlusIcon,
  RotateCwIcon,
  SettingsIcon,
  SquareChevronDownIcon,
  SquareChevronLeftIcon,
  SquareChevronRightIcon,
  SquareChevronUpIcon,
  SplitSquareHorizontalIcon,
  SplitSquareVerticalIcon,
  XIcon,
} from "lucide-react";

import { type Book, type Chapter, type Verse, type VerseToken } from "@/types/bible";
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
import { Slider } from "@/components/ui/slider";
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
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

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

function chapterProgressKey(bookIndex: number, chapterIndex: number) {
  return `${bookIndex}:${chapterIndex}`;
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

function directionOrientation(direction: PanelDirection): SplitOrientation {
  return direction === "left" || direction === "right"
    ? "horizontal"
    : "vertical";
}

function wrapNodeWithNewPanel(node: PanelNode, direction: PanelDirection): SplitNode {
  const newLeaf = createLeaf();
  const orientation = directionOrientation(direction);
  const placeNewFirst = direction === "left" || direction === "up";

  return {
    id: createId(),
    type: "split",
    orientation,
    ratio: 50,
    first: placeNewFirst ? newLeaf : node,
    second: placeNewFirst ? node : newLeaf,
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
    const split = wrapNodeWithNewPanel(node, direction);
    const createdLeaf = split.first.type === "leaf" ? split.first : split.second;
    return { next: split, createdLeafId: createdLeaf.id };
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

function splitNodeById(
  node: PanelNode,
  targetNodeId: string,
  direction: PanelDirection,
): { next: PanelNode; changed: boolean } {
  if (node.id === targetNodeId) {
    return { next: wrapNodeWithNewPanel(node, direction), changed: true };
  }

  if (node.type === "leaf") {
    return { next: node, changed: false };
  }

  const first = splitNodeById(node.first, targetNodeId, direction);
  if (first.changed) {
    return { next: { ...node, first: first.next }, changed: true };
  }

  const second = splitNodeById(node.second, targetNodeId, direction);
  if (second.changed) {
    return { next: { ...node, second: second.next }, changed: true };
  }

  return { next: node, changed: false };
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

function updateSplitOrientation(
  node: PanelNode,
  splitId: string,
  orientation: SplitOrientation,
): PanelNode {
  if (node.type === "leaf") {
    return node;
  }

  if (node.id === splitId) {
    return { ...node, orientation };
  }

  const nextFirst = updateSplitOrientation(node.first, splitId, orientation);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = updateSplitOrientation(node.second, splitId, orientation);
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

function collectLeafIds(node: PanelNode, ids: string[] = []) {
  if (node.type === "leaf") {
    ids.push(node.id);
    return ids;
  }

  collectLeafIds(node.first, ids);
  collectLeafIds(node.second, ids);
  return ids;
}

function findNodeById(node: PanelNode, nodeId: string): PanelNode | null {
  if (node.id === nodeId) {
    return node;
  }

  if (node.type === "leaf") {
    return null;
  }

  return findNodeById(node.first, nodeId) ?? findNodeById(node.second, nodeId);
}

function findLeafNode(node: PanelNode, leafId: string): LeafNode | null {
  if (node.type === "leaf") {
    return node.id === leafId ? node : null;
  }

  return findLeafNode(node.first, leafId) ?? findLeafNode(node.second, leafId);
}

function extractLeafNode(
  node: PanelNode,
  targetLeafId: string,
): { next: PanelNode | null; extracted: LeafNode | null } {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return { next: node, extracted: null };
    }
    return { next: null, extracted: node };
  }

  const first = extractLeafNode(node.first, targetLeafId);
  if (first.extracted) {
    if (!first.next) {
      return { next: node.second, extracted: first.extracted };
    }
    return {
      next: { ...node, first: first.next },
      extracted: first.extracted,
    };
  }

  const second = extractLeafNode(node.second, targetLeafId);
  if (second.extracted) {
    if (!second.next) {
      return { next: node.first, extracted: second.extracted };
    }
    return {
      next: { ...node, second: second.next },
      extracted: second.extracted,
    };
  }

  return { next: node, extracted: null };
}

function swapLeafContent(
  node: PanelNode,
  sourceLeafId: string,
  targetLeafId: string,
): PanelNode {
  const sourceLeaf = findLeafNode(node, sourceLeafId);
  const targetLeaf = findLeafNode(node, targetLeafId);
  if (!sourceLeaf || !targetLeaf) {
    return node;
  }

  const sourceContent = {
    view: sourceLeaf.view,
    bookIndex: sourceLeaf.bookIndex,
    chapterIndex: sourceLeaf.chapterIndex,
    pickerTestament: sourceLeaf.pickerTestament,
    pickerBookIndex: sourceLeaf.pickerBookIndex,
  };
  const targetContent = {
    view: targetLeaf.view,
    bookIndex: targetLeaf.bookIndex,
    chapterIndex: targetLeaf.chapterIndex,
    pickerTestament: targetLeaf.pickerTestament,
    pickerBookIndex: targetLeaf.pickerBookIndex,
  };

  return updateLeafNode(
    updateLeafNode(node, sourceLeafId, targetContent),
    targetLeafId,
    sourceContent,
  );
}

type LeafRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LeafNeighbors = Partial<Record<PanelDirection, string>>;

function collectLeafRects(
  node: PanelNode,
  x: number,
  y: number,
  width: number,
  height: number,
  rects: Map<string, LeafRect>,
) {
  if (node.type === "leaf") {
    rects.set(node.id, { x, y, width, height });
    return;
  }

  const ratio = Math.min(90, Math.max(10, node.ratio)) / 100;
  if (node.orientation === "horizontal") {
    const firstWidth = width * ratio;
    collectLeafRects(node.first, x, y, firstWidth, height, rects);
    collectLeafRects(
      node.second,
      x + firstWidth,
      y,
      width - firstWidth,
      height,
      rects,
    );
    return;
  }

  const firstHeight = height * ratio;
  collectLeafRects(node.first, x, y, width, firstHeight, rects);
  collectLeafRects(node.second, x, y + firstHeight, width, height - firstHeight, rects);
}

function overlapSize(startA: number, endA: number, startB: number, endB: number) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function neighborForDirection(
  sourceId: string,
  direction: PanelDirection,
  rects: Map<string, LeafRect>,
) {
  const source = rects.get(sourceId);
  if (!source) {
    return null;
  }

  const epsilon = 0.001;
  let bestId: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestOverlap = -1;

  for (const [candidateId, rect] of rects.entries()) {
    if (candidateId === sourceId) {
      continue;
    }

    let distance = Number.POSITIVE_INFINITY;
    let overlap = 0;

    if (direction === "left") {
      if (rect.x + rect.width > source.x + epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.y,
        source.y + source.height,
        rect.y,
        rect.y + rect.height,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = source.x - (rect.x + rect.width);
    } else if (direction === "right") {
      if (rect.x < source.x + source.width - epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.y,
        source.y + source.height,
        rect.y,
        rect.y + rect.height,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = rect.x - (source.x + source.width);
    } else if (direction === "up") {
      if (rect.y + rect.height > source.y + epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.x,
        source.x + source.width,
        rect.x,
        rect.x + rect.width,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = source.y - (rect.y + rect.height);
    } else {
      if (rect.y < source.y + source.height - epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.x,
        source.x + source.width,
        rect.x,
        rect.x + rect.width,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = rect.y - (source.y + source.height);
    }

    if (
      distance < bestDistance - epsilon ||
      (Math.abs(distance - bestDistance) <= epsilon && overlap > bestOverlap)
    ) {
      bestDistance = distance;
      bestOverlap = overlap;
      bestId = candidateId;
    }
  }

  return bestId;
}

function buildLeafNeighborMap(root: PanelNode) {
  const rects = new Map<string, LeafRect>();
  collectLeafRects(root, 0, 0, 1, 1, rects);

  const map = new Map<string, LeafNeighbors>();
  for (const leafId of rects.keys()) {
    map.set(leafId, {
      left: neighborForDirection(leafId, "left", rects) ?? undefined,
      right: neighborForDirection(leafId, "right", rects) ?? undefined,
      up: neighborForDirection(leafId, "up", rects) ?? undefined,
      down: neighborForDirection(leafId, "down", rects) ?? undefined,
    });
  }

  return map;
}

function buildLeafNeighborMapFromDom(
  root: PanelNode,
  panelElements: Record<string, HTMLDivElement | null>,
) {
  const rects = new Map<string, LeafRect>();
  const leafIds = collectLeafIds(root);

  for (const leafId of leafIds) {
    const element = panelElements[leafId];
    if (!element) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }
    rects.set(leafId, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  const map = new Map<string, LeafNeighbors>();
  for (const leafId of rects.keys()) {
    map.set(leafId, {
      left: neighborForDirection(leafId, "left", rects) ?? undefined,
      right: neighborForDirection(leafId, "right", rects) ?? undefined,
      up: neighborForDirection(leafId, "up", rects) ?? undefined,
      down: neighborForDirection(leafId, "down", rects) ?? undefined,
    });
  }

  return map;
}

function pathToLeaf(node: PanelNode, leafId: string, path: PanelNode[] = []): PanelNode[] | null {
  const nextPath = [...path, node];
  if (node.type === "leaf") {
    return node.id === leafId ? nextPath : null;
  }

  return pathToLeaf(node.first, leafId, nextPath) ?? pathToLeaf(node.second, leafId, nextPath);
}

function findGroupTargetNodeId(
  root: PanelNode,
  leafId: string,
  direction: PanelDirection,
) {
  const desiredOrientation = directionOrientation(direction);
  const path = pathToLeaf(root, leafId);
  if (!path) {
    return null;
  }

  for (let index = path.length - 2; index >= 0; index -= 1) {
    const node = path[index];
    if (node.type === "split" && node.orientation !== desiredOrientation) {
      return node.id;
    }
  }

  return null;
}

function findParentSplitForLeaf(root: PanelNode, leafId: string): SplitNode | null {
  const path = pathToLeaf(root, leafId);
  if (!path || path.length < 2) {
    return null;
  }

  const parent = path[path.length - 2];
  return parent.type === "split" ? parent : null;
}

export function KJVReader() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [verseSpacing, setVerseSpacing] = useState(0);
  const [hideReadModeVerseNumbers, setHideReadModeVerseNumbers] = useState(false);
  const [readModeParagraphIndent, setReadModeParagraphIndent] = useState(false);
  const [flowVersesByParagraph, setFlowVersesByParagraph] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [tabs, setTabs] = useState<ReaderTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tokenPopup, setTokenPopup] = useState<TokenPopupState | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [fullscreenLeafId, setFullscreenLeafId] = useState<string | null>(null);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [leafScrollProgress, setLeafScrollProgress] = useState<
    Record<string, number>
  >({});
  const tabEndRef = useRef<HTMLDivElement>(null);
  const panelElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previewLeafIdRef = useRef<string | null>(null);
  const addPreviewLeafIdsRef = useRef<string[]>([]);
  const addPreviewDirectionRef = useRef<PanelDirection | null>(null);
  const addPreviewIsGroupRef = useRef(false);
  const orientationPreviewLeafIdsRef = useRef<string[]>([]);

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
      };
      if (typeof parsed.verseSpacing === "number") {
        setVerseSpacing(Math.max(0, Math.min(24, Math.round(parsed.verseSpacing))));
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
      }),
    );
  }, [
    verseSpacing,
    hideReadModeVerseNumbers,
    readModeParagraphIndent,
    flowVersesByParagraph,
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
      const storedProgress = window.localStorage.getItem("kjv-read-chapters-v1");
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
  const modelLeafNeighbors = useMemo(
    () => (activeTab ? buildLeafNeighborMap(activeTab.root) : new Map()),
    [activeTab],
  );
  const domLeafNeighbors = useMemo(
    () =>
      activeTab
        ? buildLeafNeighborMapFromDom(activeTab.root, panelElementRefs.current)
        : new Map(),
    [activeTab, tabs],
  );
  const progressByTestament = useMemo(() => {
    const oldBooks = books.slice(0, 39);
    const newBooks = books.slice(39);

    const makeBookProgress = (book: Book, bookIndex: number) => {
      const total = book.chapters.length;
      let read = 0;
      for (let chapterIndex = 0; chapterIndex < total; chapterIndex += 1) {
        if (readChapters.has(chapterProgressKey(bookIndex, chapterIndex))) {
          read += 1;
        }
      }
      return { name: book.name, read, total };
    };

    const oldBookProgress = oldBooks.map((book, index) =>
      makeBookProgress(book, index),
    );
    const newBookProgress = newBooks.map((book, index) =>
      makeBookProgress(book, index + 39),
    );

    const summarize = (items: { read: number; total: number }[]) =>
      items.reduce(
        (acc, item) => ({ read: acc.read + item.read, total: acc.total + item.total }),
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
  const totalProgressPercent =
    progressByTestament.total.total > 0
      ? Math.round(
          (progressByTestament.total.read / progressByTestament.total.total) * 100,
        )
      : 0;
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

    const updateProgressForLeaf = (leafId: string, value: number) => {
      setLeafScrollProgress((current) => {
        if (current[leafId] === value) {
          return current;
        }
        return { ...current, [leafId]: value };
      });
    };

    for (const leafId of leafIds) {
      const panelElement = panelElementRefs.current[leafId];
      const viewport = panelElement?.querySelector<HTMLElement>(
        '[data-panel-content-scroll] [data-slot="scroll-area-viewport"]',
      );

      if (!viewport) {
        continue;
      }

      const update = () => {
        const maxScroll = viewport.scrollHeight - viewport.clientHeight;
        const next =
          maxScroll <= 0
            ? 0
            : Math.round((viewport.scrollTop / maxScroll) * 100);
        updateProgressForLeaf(leafId, next);
      };

      update();
      viewport.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      cleanups.push(() => {
        viewport.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [activeTab]);

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
    return (
      domLeafNeighbors.get(leafId) ??
      modelLeafNeighbors.get(leafId) ??
      {}
    );
  }

  function panelCardElement(leafId: string) {
    const panelElement = panelElementRefs.current[leafId];
    return panelElement?.querySelector<HTMLElement>(':scope > [data-slot="card"]') ?? null;
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
    const targetLeafId = neighborsForLeaf(leafId)[direction] ?? null;
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

    const targetNodeId = findGroupTargetNodeId(activeTab.root, leafId, direction);
    if (!targetNodeId) {
      return;
    }

    const targetNode = findNodeById(activeTab.root, targetNodeId);
    if (!targetNode) {
      return;
    }

    const targetLeafIds = collectLeafIds(targetNode);
    const edgeLeafIds = targetLeafIds.filter((targetLeafId) => {
      const panelElement = panelElementRefs.current[targetLeafId];
      const rect = panelElement?.getBoundingClientRect();
      if (!rect) {
        return false;
      }

      const allRects = targetLeafIds
        .map((id) => panelElementRefs.current[id]?.getBoundingClientRect())
        .filter((item): item is DOMRect => Boolean(item));
      if (allRects.length === 0) {
        return false;
      }

      const epsilon = 0.5;
      if (direction === "left") {
        const minLeft = Math.min(...allRects.map((item) => item.left));
        return Math.abs(rect.left - minLeft) <= epsilon;
      }
      if (direction === "right") {
        const maxRight = Math.max(...allRects.map((item) => item.right));
        return Math.abs(rect.right - maxRight) <= epsilon;
      }
      if (direction === "up") {
        const minTop = Math.min(...allRects.map((item) => item.top));
        return Math.abs(rect.top - minTop) <= epsilon;
      }
      const maxBottom = Math.max(...allRects.map((item) => item.bottom));
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

    const targetNodeId = findGroupTargetNodeId(activeTab.root, leafId, direction);
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
    const freshDomNeighbors = buildLeafNeighborMapFromDom(
      activeTab.root,
      panelElementRefs.current,
    );
    const targetLeafId =
      freshDomNeighbors.get(leafId)?.[direction] ??
      neighborsForLeaf(leafId)[direction];
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
      const activeIndex = currentTabs.findIndex((tab) => tab.id === activeTabId);
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
          block: "nearest",
          inline: "end",
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
    const chapterReadKey = chapterProgressKey(leaf.bookIndex, leaf.chapterIndex);
    const isChapterRead = readChapters.has(chapterReadKey);
    const readingProgress = leafScrollProgress[leaf.id] ?? 0;
    const showVerseNumbers = !hideReadModeVerseNumbers;
    const paragraphGroups: Verse[][] = [];
    if (chapter) {
      let currentGroup: Verse[] = [];
      for (const verse of chapter.verses) {
        if (currentGroup.length === 0 || verse.paragraphStart) {
          if (currentGroup.length > 0) {
            paragraphGroups.push(currentGroup);
          }
          currentGroup = [verse];
        } else {
          currentGroup.push(verse);
        }
      }
      if (currentGroup.length > 0) {
        paragraphGroups.push(currentGroup);
      }
    }
    const neighbors = neighborsForLeaf(leaf.id);
    const moveDirections = (["left", "right", "up", "down"] as PanelDirection[]).filter(
      (direction) => Boolean(neighbors[direction]),
    );
    const groupTargets = activeTab
      ? {
          left: findGroupTargetNodeId(activeTab.root, leaf.id, "left"),
          right: findGroupTargetNodeId(activeTab.root, leaf.id, "right"),
          up: findGroupTargetNodeId(activeTab.root, leaf.id, "up"),
          down: findGroupTargetNodeId(activeTab.root, leaf.id, "down"),
        }
      : { left: null, right: null, up: null, down: null };
    const parentSplit = activeTab ? findParentSplitForLeaf(activeTab.root, leaf.id) : null;
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

    return (
      <div
        data-panel-leaf-id={leaf.id}
        ref={(element) => {
          panelElementRefs.current[leaf.id] = element;
        }}
        className="h-full w-full min-w-0 bg-background"
      >
        <Card className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-none">
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

            <DropdownMenu
              onOpenChange={(open) => {
                if (!open) {
                  clearAllPanelPreviews();
                }
              }}
            >
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="ml-auto" />
                }
              >
                <PlusIcon />
                Panel
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                          onPointerEnter={() => setMovePreviewTarget(leaf.id, "left")}
                          onPointerLeave={() => clearMovePreview()}
                        >
                          <ArrowLeftIcon />
                          Move Left
                        </DropdownMenuItem>
                      ) : null}
                      {moveDirections.includes("right") ? (
                        <DropdownMenuItem
                          onClick={() => moveLeaf(leaf.id, "right")}
                          onPointerEnter={() => setMovePreviewTarget(leaf.id, "right")}
                          onPointerLeave={() => clearMovePreview()}
                        >
                          <ArrowRightIcon />
                          Move Right
                        </DropdownMenuItem>
                      ) : null}
                      {moveDirections.includes("up") ? (
                        <DropdownMenuItem
                          onClick={() => moveLeaf(leaf.id, "up")}
                          onPointerEnter={() => setMovePreviewTarget(leaf.id, "up")}
                          onPointerLeave={() => clearMovePreview()}
                        >
                          <ArrowUpIcon />
                          Move Up
                        </DropdownMenuItem>
                      ) : null}
                      {moveDirections.includes("down") ? (
                        <DropdownMenuItem
                          onClick={() => moveLeaf(leaf.id, "down")}
                          onPointerEnter={() => setMovePreviewTarget(leaf.id, "down")}
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
                <DropdownMenuItem onClick={() => moveLeafToNewTab(leaf.id)}>
                  <ExternalLinkIcon />
                  Move to New Tab
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
              <ScrollArea className="h-full w-full" data-panel-content-scroll>
                <div className="flex w-full flex-col p-3 sm:p-4" style={{ rowGap: `${verseSpacing}px` }}>
                  {flowVersesByParagraph
                    ? paragraphGroups.map((group, groupIndex) => (
                        <article
                          key={`${book.name}-${chapter.chapter}-paragraph-${groupIndex}`}
                          className="[content-visibility:auto] [contain-intrinsic-size:0_2.5rem]"
                        >
                          <p
                            className={cn(
                              "text-pretty leading-7",
                            )}
                            style={
                              readModeParagraphIndent &&
                              (groupIndex === 0 || group[0]?.paragraphStart)
                                ? { textIndent: "1.5rem" }
                                : undefined
                            }
                          >
                            {group.map((verse, verseIndex) => (
                              <Fragment key={`${book.name}-${chapter.chapter}-${verse.verse}`}>
                                {verseIndex > 0 ? " " : null}
                                <span className={cn(verse.redLetter && "text-red-700")}>
                                  {showVerseNumbers ? (
                                    <span className="mr-2 inline-flex w-7 shrink-0 justify-end align-top text-xs font-semibold tabular-nums text-muted-foreground">
                                      {verse.verse}
                                    </span>
                                  ) : null}
                                  {renderVerseTokens(
                                    verse.tokens,
                                    isStudyMode,
                                    (element, token) =>
                                      openTokenDetailsFromElement(element, token),
                                  )}
                                </span>
                              </Fragment>
                            ))}
                          </p>
                        </article>
                      ))
                    : chapter.verses.map((verse) => (
                        <article
                          key={`${book.name}-${chapter.chapter}-${verse.verse}`}
                          className="[content-visibility:auto] [contain-intrinsic-size:0_2.5rem]"
                        >
                          <p
                            className={cn(
                              "leading-7",
                              showVerseNumbers &&
                                "grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-2",
                            )}
                          >
                            {showVerseNumbers ? (
                              <span className="inline-flex w-7 shrink-0 justify-start align-top text-xs font-semibold tabular-nums text-muted-foreground">
                                {verse.verse}
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                "text-pretty",
                                verse.redLetter && "text-red-700",
                              )}
                              style={
                                readModeParagraphIndent &&
                                (verse.verse === 1 || verse.paragraphStart)
                                  ? { textIndent: "1.5rem" }
                                  : undefined
                              }
                            >
                              {renderVerseTokens(
                                verse.tokens,
                                isStudyMode,
                                (element, token) =>
                                  openTokenDetailsFromElement(element, token),
                              )}
                            </span>
                          </p>
                        </article>
                      ))}
                </div>
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
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setIsProgressOpen(true)}>
                    <ChartBarIcon />
                    Reading Progress
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="verse-spacing">Verse Spacing</Label>
              <span className="text-xs text-muted-foreground">{verseSpacing}px</span>
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
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="hide-read-mode-verse-numbers">
              Hide Verse Numbers
            </Label>
            <Switch
              id="hide-read-mode-verse-numbers"
              checked={hideReadModeVerseNumbers}
              onCheckedChange={(checked) => setHideReadModeVerseNumbers(checked)}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="read-mode-indents">Paragraph Indents</Label>
            <Switch
              id="read-mode-indents"
              checked={readModeParagraphIndent}
              onCheckedChange={(checked) => setReadModeParagraphIndent(checked)}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="flow-verses">Flow Verses by Paragraph</Label>
            <Switch
              id="flow-verses"
              checked={flowVersesByParagraph}
              onCheckedChange={(checked) => setFlowVersesByParagraph(checked)}
            />
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
            <Progress value={totalProgressPercent}>
              <ProgressLabel className="font-semibold">Whole Bible</ProgressLabel>
              <ProgressValue>
                {() =>
                  `${progressByTestament.total.read}/${progressByTestament.total.total} (${totalProgressPercent}%)`
                }
              </ProgressValue>
            </Progress>

            {[progressByTestament.old, progressByTestament.new].map((testament) => {
              const testamentPercent =
                testament.total > 0
                  ? Math.round((testament.read / testament.total) * 100)
                  : 0;

              return (
                <details key={testament.label} className="rounded-md border p-3">
                  <summary className="cursor-pointer">
                    <Progress value={testamentPercent}>
                      <ProgressLabel>{testament.label}</ProgressLabel>
                      <ProgressValue>
                        {() => `${testament.read}/${testament.total} (${testamentPercent}%)`}
                      </ProgressValue>
                    </Progress>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {testament.books.map((book) => {
                      const bookPercent =
                        book.total > 0 ? Math.round((book.read / book.total) * 100) : 0;
                      return (
                        <Progress key={book.name} value={bookPercent}>
                          <ProgressLabel className="text-xs">{book.name}</ProgressLabel>
                          <ProgressValue className="text-xs">
                            {() => `${book.read}/${book.total} (${bookPercent}%)`}
                          </ProgressValue>
                        </Progress>
                      );
                    })}
                  </div>
                </details>
              );
            })}
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
