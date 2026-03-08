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
