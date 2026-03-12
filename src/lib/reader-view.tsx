import type { ReactNode } from "react";

import { BOOK_ICON_CODES, escapeRegExp } from "@/lib/references";
import type { IconVariant } from "@/types/reader";

export function renderHighlightedText(
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

export function renderHighlightedTerms(
  text: string,
  needles: string[],
  keyPrefix: string,
): ReactNode {
  const normalizedNeedles = Array.from(
    new Set(needles.map((needle) => needle.trim()).filter(Boolean)),
  );
  if (normalizedNeedles.length === 0) {
    return text;
  }

  const matcher = new RegExp(
    `(${normalizedNeedles
      .sort((left, right) => right.length - left.length)
      .map((needle) => escapeRegExp(needle))
      .join("|")})`,
    "ig",
  );
  const parts = text.split(matcher);
  if (parts.length <= 1) {
    return text;
  }

  const highlights = new Set(
    normalizedNeedles.map((needle) => needle.toLowerCase()),
  );

  return parts.map((part, index) =>
    highlights.has(part.toLowerCase()) ? (
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

export function chapterProgressKey(bookIndex: number, chapterIndex: number) {
  return `${bookIndex}:${chapterIndex}`;
}

export function bookCodeForIndex(bookIndex: number) {
  return BOOK_ICON_CODES[bookIndex] ?? "GEN";
}

export function iconPath(variant: IconVariant, code: string) {
  return `/icons/${variant}/${code}.png`;
}

export function panelViewportElement(
  panelElement: HTMLDivElement | null | undefined,
) {
  return (
    panelElement?.querySelector<HTMLElement>(
      '[data-panel-content-scroll] [data-slot="scroll-area-viewport"]',
    ) ?? null
  );
}
