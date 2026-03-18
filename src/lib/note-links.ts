import type { Book } from "@/types/bible";
import type { NoteLinkTarget, ParsedBibleReference } from "@/types/notes";

const NOTE_LINK_PROTOCOL = "kjv://";
const NOTE_LINK_WEB_ORIGIN = "https://kjv.local";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function bookPattern(books: Book[]) {
  return books
    .map((book) => book.name)
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join("|");
}

function buildTypedReferenceRegex(books: Book[]) {
  return new RegExp(
    `\\b(?<book>${bookPattern(books)})\\s+(?<chapter>\\d+)(?::(?<verse>\\d+))?\\b`,
    "g",
  );
}

function findBookIndexByName(books: Book[], bookName: string) {
  return books.findIndex((book) => book.name === bookName);
}

function encodeRanges(ranges: Array<{ start: number; end: number }>) {
  return ranges
    .map((range) => `${range.start}-${range.end}`)
    .join(",");
}

function decodeRanges(value: string) {
  const ranges = value
    .split(",")
    .map((segment) => {
      const [startText, endText] = segment.split("-");
      const start = Number.parseInt(startText ?? "", 10);
      const end = Number.parseInt(endText ?? "", 10);
      if (
        !Number.isInteger(start) ||
        start <= 0 ||
        !Number.isInteger(end) ||
        end <= 0
      ) {
        return null;
      }
      return { start: Math.min(start, end), end: Math.max(start, end) };
    })
    .filter((range): range is { start: number; end: number } => range !== null);

  return ranges.length > 0 ? ranges : null;
}

export function buildNoteLinkHref(target: NoteLinkTarget): string {
  if (target.type === "chapter") {
    return `${NOTE_LINK_PROTOCOL}chapter/${target.bookIndex}/${target.chapterIndex}`;
  }
  if (target.type === "verse") {
    return `${NOTE_LINK_PROTOCOL}verse/${target.bookIndex}/${target.chapterIndex}/${target.verseNumber}`;
  }
  if (target.type === "selection") {
    return `${NOTE_LINK_PROTOCOL}selection/${target.bookIndex}/${target.chapterIndex}/${encodeRanges(target.ranges)}`;
  }
  return `${NOTE_LINK_PROTOCOL}word/${target.bookIndex}/${target.chapterIndex}/${target.verseNumber}/${encodeURIComponent(target.word)}`;
}

export function parseNoteLinkHref(href: string): NoteLinkTarget | null {
  let path = "";
  if (href.startsWith(NOTE_LINK_PROTOCOL)) {
    path = href.slice(NOTE_LINK_PROTOCOL.length);
  } else if (href.startsWith(`${NOTE_LINK_WEB_ORIGIN}/`)) {
    path = href.slice(`${NOTE_LINK_WEB_ORIGIN}/`.length);
  } else {
    return null;
  }
  const segments = path.split("/");
  const kind = segments[0];

  if (kind === "chapter" && segments.length === 3) {
    const bookIndex = Number.parseInt(segments[1] ?? "", 10);
    const chapterIndex = Number.parseInt(segments[2] ?? "", 10);
    if (Number.isInteger(bookIndex) && bookIndex >= 0 && Number.isInteger(chapterIndex) && chapterIndex >= 0) {
      return { type: "chapter", bookIndex, chapterIndex };
    }
  }

  if (kind === "verse" && segments.length === 4) {
    const bookIndex = Number.parseInt(segments[1] ?? "", 10);
    const chapterIndex = Number.parseInt(segments[2] ?? "", 10);
    const verseNumber = Number.parseInt(segments[3] ?? "", 10);
    if (
      Number.isInteger(bookIndex) &&
      bookIndex >= 0 &&
      Number.isInteger(chapterIndex) &&
      chapterIndex >= 0 &&
      Number.isInteger(verseNumber) &&
      verseNumber > 0
    ) {
      return { type: "verse", bookIndex, chapterIndex, verseNumber };
    }
  }

  if (kind === "word" && segments.length >= 5) {
    const bookIndex = Number.parseInt(segments[1] ?? "", 10);
    const chapterIndex = Number.parseInt(segments[2] ?? "", 10);
    const verseNumber = Number.parseInt(segments[3] ?? "", 10);
    const rawWord = segments.slice(4).join("/");
    const word = decodeURIComponent(rawWord);
    if (
      Number.isInteger(bookIndex) &&
      bookIndex >= 0 &&
      Number.isInteger(chapterIndex) &&
      chapterIndex >= 0 &&
      Number.isInteger(verseNumber) &&
      verseNumber > 0 &&
      word.trim()
    ) {
      return { type: "word", bookIndex, chapterIndex, verseNumber, word };
    }
  }

  if (kind === "selection" && segments.length === 4) {
    const bookIndex = Number.parseInt(segments[1] ?? "", 10);
    const chapterIndex = Number.parseInt(segments[2] ?? "", 10);
    const ranges = decodeRanges(segments[3] ?? "");
    if (
      Number.isInteger(bookIndex) &&
      bookIndex >= 0 &&
      Number.isInteger(chapterIndex) &&
      chapterIndex >= 0 &&
      ranges
    ) {
      return { type: "selection", bookIndex, chapterIndex, ranges };
    }
  }

  return null;
}

export function isInternalNoteLink(href: string): boolean {
  return parseNoteLinkHref(href) !== null;
}

export function migrateNoteBodyInternalLinks(body: string) {
  const normalizedBody = body.replaceAll(`${NOTE_LINK_WEB_ORIGIN}/`, NOTE_LINK_PROTOCOL);

  try {
    const parsed = JSON.parse(normalizedBody) as Record<string, unknown>;
    const visit = (node: unknown): void => {
      if (!node || typeof node !== "object") {
        return;
      }
      const record = node as Record<string, unknown>;
      const url = typeof record.url === "string" ? record.url : null;
      const isLinkLikeNode = record.type === "link" || record.type === "autolink";
      if (url && isLinkLikeNode) {
        const normalizedUrl = url.replace(`${NOTE_LINK_WEB_ORIGIN}/`, NOTE_LINK_PROTOCOL);
        if (
          normalizedUrl.startsWith(NOTE_LINK_PROTOCOL) ||
          normalizedUrl.startsWith(`${NOTE_LINK_WEB_ORIGIN}/`)
        ) {
          record.type = "kjv-link";
          record.url = normalizedUrl;
        } else if (record.type === "autolink") {
          record.type = "link";
          record.url = normalizedUrl;
        }
      }
      const children = record.children;
      if (Array.isArray(children)) {
        for (const child of children) {
          visit(child);
        }
      }
      for (const [key, value] of Object.entries(record)) {
        if (key === "children" || key === "url" || key === "type") {
          continue;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            visit(item);
          }
        } else if (value && typeof value === "object") {
          visit(value);
        }
      }
    };

    visit(parsed);
    return JSON.stringify(parsed);
  } catch {
    return normalizedBody;
  }
}

export function formatNoteLinkLabel(target: NoteLinkTarget, books: Book[]): string {
  const bookName = books[target.bookIndex]?.name ?? `Book ${target.bookIndex + 1}`;
  const chapterNumber = target.chapterIndex + 1;
  if (target.type === "chapter") {
    return `${bookName} ${chapterNumber}`;
  }
  if (target.type === "verse") {
    return `${bookName} ${chapterNumber}:${target.verseNumber}`;
  }
  if (target.type === "selection") {
    const rangesLabel = target.ranges
      .map((range) =>
        range.start === range.end
          ? `${range.start}`
          : `${range.start}-${range.end}`,
      )
      .join(", ");
    return `${bookName} ${chapterNumber}:${rangesLabel}`;
  }
  return `${bookName} ${chapterNumber}:${target.verseNumber} • "${target.word}"`;
}

export function parseTypedBibleReference(
  text: string,
  books: Book[],
): ParsedBibleReference | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const regex = new RegExp(
    `^(?<book>${bookPattern(books)})\\s+(?<chapter>\\d+)(?::(?<verse>\\d+))?$`,
  );
  const match = regex.exec(trimmed);
  if (!match?.groups) {
    return null;
  }

  const bookIndex = findBookIndexByName(books, match.groups.book);
  const chapterNumber = Number.parseInt(match.groups.chapter ?? "", 10);
  const verseNumber = match.groups.verse
    ? Number.parseInt(match.groups.verse, 10)
    : null;

  if (bookIndex < 0 || !Number.isInteger(chapterNumber) || chapterNumber <= 0) {
    return null;
  }

  const chapterIndex = chapterNumber - 1;
  if (verseNumber === null) {
    return { type: "chapter", bookIndex, chapterIndex };
  }
  if (!Number.isInteger(verseNumber) || verseNumber <= 0) {
    return null;
  }
  return { type: "verse", bookIndex, chapterIndex, verseNumber };
}

export function typedBibleReferenceMatches(
  text: string,
  books: Book[],
): Array<{ index: number; length: number; text: string; target: ParsedBibleReference }> {
  const regex = buildTypedReferenceRegex(books);
  const matches: Array<{
    index: number;
    length: number;
    text: string;
    target: ParsedBibleReference;
  }> = [];

  for (const match of text.matchAll(regex)) {
    if (match.index === undefined) {
      continue;
    }
    const fullText = match[0];
    const target = parseTypedBibleReference(fullText, books);
    if (!target) {
      continue;
    }
    matches.push({
      index: match.index,
      length: fullText.length,
      text: fullText,
      target,
    });
  }

  return matches;
}
