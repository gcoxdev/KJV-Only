import { BOOK_ICON_CODES } from "@/lib/references";
import { createId } from "@/lib/reader-layout";
import {
  type LeafNode,
  type PanelNode,
  type ReaderTab,
  type TabsOrientation,
} from "@/types/reader";

const BOOK_INDEX_BY_CODE = new Map<string, number>(
  BOOK_ICON_CODES.map((code, index) => [code, index]),
);

export type SerializedVerseRange = {
  start: number;
  end: number;
};

type ParsedLayoutHash = {
  activeTabIndex: number;
  tabsOrientation: TabsOrientation;
  tabs: ReaderTab[];
  highlightedVerseRangesByLeafId: Record<string, SerializedVerseRange[]>;
  targetedPanelLeafId: string | null;
};

function normalizeVerseRanges(ranges: SerializedVerseRange[]) {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges]
    .map((range) => ({
      start: Math.max(1, Math.min(range.start, range.end)),
      end: Math.max(1, Math.max(range.start, range.end)),
    }))
    .sort((left, right) => left.start - right.start || left.end - right.end);

  const merged: SerializedVerseRange[] = [];
  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous || range.start > previous.end + 1) {
      merged.push({ ...range });
      continue;
    }
    previous.end = Math.max(previous.end, range.end);
  }
  return merged;
}

function parseVerseRanges(value: string) {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const ranges: SerializedVerseRange[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) {
      return null;
    }
    const start = Number.parseInt(match[1], 10);
    const end = Number.parseInt(match[2] ?? match[1], 10);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0) {
      return null;
    }
    ranges.push({
      start: Math.min(start, end),
      end: Math.max(start, end),
    });
  }

  return normalizeVerseRanges(ranges);
}

function serializeVerseRanges(ranges: SerializedVerseRange[]) {
  return normalizeVerseRanges(ranges)
    .map((range) =>
      range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`,
    )
    .join(",");
}

function createReaderLeaf(
  bookIndex: number,
  chapterIndex: number,
  view: LeafNode["view"],
): LeafNode {
  return {
    id: createId(),
    type: "leaf",
    view,
    bookIndex,
    chapterIndex,
    pickerTestament: null,
    pickerBookIndex: null,
    pageId: null,
  };
}

function serializeLeaf(
  node: LeafNode,
  highlightedVerseRangesByLeafId: Record<string, SerializedVerseRange[]>,
  targetedPanelLeafId: string | null,
) {
  let value = "picker";
  if (node.view === "reader") {
    const bookCode = BOOK_ICON_CODES[node.bookIndex] ?? "GEN";
    const chapterValue = `${bookCode}.${node.chapterIndex + 1}`;
    const ranges = highlightedVerseRangesByLeafId[node.id] ?? [];
    value =
      ranges.length === 0
        ? chapterValue
        : `${chapterValue}.${serializeVerseRanges(ranges)}`;
  } else if (node.view === "page" && node.pageId) {
    value = `page.${node.pageId}`;
  } else if (node.view === "search") {
    value = "search";
  } else if (node.view === "notes") {
    value = "notes";
  } else if (node.view === "tools") {
    value = "tools";
  } else if (node.view === "bookmarks") {
    value = "bookmarks";
  }
  return node.id === targetedPanelLeafId ? `${value}*` : value;
}

function serializeNode(
  node: PanelNode,
  highlightedVerseRangesByLeafId: Record<string, SerializedVerseRange[]>,
  targetedPanelLeafId: string | null,
): string {
  if (node.type === "leaf") {
    return serializeLeaf(node, highlightedVerseRangesByLeafId, targetedPanelLeafId);
  }
  const orientation = node.orientation === "horizontal" ? "h" : "v";
  const ratio = Math.max(1, Math.min(99, Math.round(node.ratio)));
  return `${orientation}${ratio}(${serializeNode(node.first, highlightedVerseRangesByLeafId, targetedPanelLeafId)};${serializeNode(node.second, highlightedVerseRangesByLeafId, targetedPanelLeafId)})`;
}

function parseLeafToken(
  token: string,
): [LeafNode | null, SerializedVerseRange[], boolean] {
  const isTargeted = token.endsWith("*");
  const normalizedToken = isTargeted ? token.slice(0, -1) : token;

  if (normalizedToken === "search") {
    return [{ ...createReaderLeaf(0, 0, "search"), pageId: null }, [], isTargeted];
  }
  if (normalizedToken === "notes") {
    return [{ ...createReaderLeaf(0, 0, "notes"), pageId: null }, [], isTargeted];
  }
  if (normalizedToken === "tools") {
    return [{ ...createReaderLeaf(0, 0, "tools"), pageId: null }, [], isTargeted];
  }
  if (normalizedToken === "bookmarks") {
    return [{ ...createReaderLeaf(0, 0, "bookmarks"), pageId: null }, [], isTargeted];
  }
  if (normalizedToken === "picker") {
    return [{ ...createReaderLeaf(0, 0, "picker"), pageId: null }, [], isTargeted];
  }
  if (normalizedToken.startsWith("page.")) {
    return [
      {
        ...createReaderLeaf(0, 0, "page"),
        pageId: normalizedToken.slice("page.".length) as LeafNode["pageId"],
      },
      [],
      isTargeted,
    ];
  }

  const match = normalizedToken.match(/^([1-3A-Z]{3})\.(\d+)(?:\.(.+))?$/);
  if (!match) {
    return [null, [], false];
  }
  const [, bookCode, chapterValue, rangeValue] = match;
  const bookIndex = BOOK_INDEX_BY_CODE.get(bookCode);
  if (bookIndex == null) {
    return [null, [], false];
  }
  const chapterIndex = Math.max(0, Number.parseInt(chapterValue, 10) - 1);
  const ranges = rangeValue ? parseVerseRanges(rangeValue) : [];
  if (rangeValue && !ranges) {
    return [null, [], false];
  }
  return [
    {
      ...createReaderLeaf(bookIndex, chapterIndex, "reader"),
      pageId: null,
    },
    ranges ?? [],
    isTargeted,
  ];
}

function parseNode(
  input: string,
  highlightedVerseRangesByLeafId: Record<string, SerializedVerseRange[]>,
  targetedPanelLeafIdRef: { current: string | null },
  startIndex = 0,
): [PanelNode | null, number] {
  const type = input[startIndex];
  const nextChar = input[startIndex + 1];
  if ((type === "h" || type === "v") && /[0-9(]/.test(nextChar ?? "")) {
    let cursor = startIndex + 1;
    let ratioText = "";
    while (cursor < input.length && /[0-9]/.test(input[cursor])) {
      ratioText += input[cursor];
      cursor += 1;
    }
    if (input[cursor] !== "(") {
      return [null, startIndex];
    }
    const [first, firstEnd] = parseNode(
      input,
      highlightedVerseRangesByLeafId,
      targetedPanelLeafIdRef,
      cursor + 1,
    );
    if (!first || input[firstEnd] !== ";") {
      return [null, startIndex];
    }
    const [second, secondEnd] = parseNode(
      input,
      highlightedVerseRangesByLeafId,
      targetedPanelLeafIdRef,
      firstEnd + 1,
    );
    if (!second || input[secondEnd] !== ")") {
      return [null, startIndex];
    }
    return [
      {
        id: createId(),
        type: "split",
        orientation: type === "h" ? "horizontal" : "vertical",
        ratio: ratioText ? Number.parseInt(ratioText, 10) : 50,
        first,
        second,
      },
      secondEnd + 1,
    ];
  }

  let cursor = startIndex;
  while (cursor < input.length && ![";", ")"].includes(input[cursor])) {
    cursor += 1;
  }
  const token = input.slice(startIndex, cursor);
  const [leaf, ranges, isTargeted] = parseLeafToken(token);
  if (leaf?.view === "reader" && ranges.length > 0) {
    highlightedVerseRangesByLeafId[leaf.id] = ranges;
  }
  if (leaf && isTargeted) {
    targetedPanelLeafIdRef.current = leaf.id;
  }
  return [leaf, cursor];
}

export function serializeLayoutHash(args: {
  tabs: ReaderTab[];
  activeTabId: string | null;
  tabsOrientation: TabsOrientation;
  highlightedVerseRangesByLeafId?: Record<string, SerializedVerseRange[]>;
  targetedPanelLeafId?: string | null;
}) {
  const activeTabIndex = Math.max(
    0,
    args.tabs.findIndex((tab) => tab.id === args.activeTabId),
  );
  const highlightedVerseRangesByLeafId = args.highlightedVerseRangesByLeafId ?? {};
  const targetedPanelLeafId = args.targetedPanelLeafId ?? null;
  const tabSegments = args.tabs.map((tab) => {
    const encodedTitle = encodeURIComponent(tab.title);
    return `${encodedTitle}:${serializeNode(
      tab.root,
      highlightedVerseRangesByLeafId,
      targetedPanelLeafId,
    )}`;
  });
  return `#tab=${activeTabIndex}&tabs=${args.tabsOrientation === "vertical" ? "v" : "h"}&layout=${tabSegments.join("|")}`;
}

export function parseLayoutHash(hash: string): ParsedLayoutHash | null {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!value) {
    return null;
  }
  const params = new URLSearchParams(value);
  const layout = params.get("layout");
  if (!layout) {
    return null;
  }

  const tabSegments = layout.split("|").filter(Boolean);
  const highlightedVerseRangesByLeafId: Record<string, SerializedVerseRange[]> = {};
  const targetedPanelLeafIdRef = { current: null as string | null };
  const tabs = tabSegments
    .map((segment, index): ReaderTab | null => {
      const separatorIndex = segment.indexOf(":");
      if (separatorIndex < 0) {
        return null;
      }
      const encodedTitle = segment.slice(0, separatorIndex);
      const treeValue = segment.slice(separatorIndex + 1);
      const [root, endIndex] = parseNode(
        treeValue,
        highlightedVerseRangesByLeafId,
        targetedPanelLeafIdRef,
      );
      if (!root || endIndex !== treeValue.length) {
        return null;
      }
      let title = `Tab ${index + 1}`;
      try {
        title = decodeURIComponent(encodedTitle) || title;
      } catch {
        // Ignore malformed title and fall back.
      }
      return {
        id: createId(),
        title,
        root,
      };
    })
    .filter((tab): tab is ReaderTab => Boolean(tab));

  if (tabs.length === 0) {
    return null;
  }

  const activeTabIndex = Math.max(
    0,
    Math.min(tabs.length - 1, Number(params.get("tab") ?? 0) || 0),
  );
  const tabsOrientation = params.get("tabs") === "v" ? "vertical" : "horizontal";

  return {
    activeTabIndex,
    tabsOrientation,
    tabs,
    highlightedVerseRangesByLeafId,
    targetedPanelLeafId: targetedPanelLeafIdRef.current,
  };
}
