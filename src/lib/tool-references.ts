import { parseBibleReference } from "@/lib/references";

export type OrderedToolReference = {
  reference: string;
  originalIndex: number;
  location: ReturnType<typeof parseBibleReference>;
};

export function orderToolReferences(
  references: readonly string[],
): OrderedToolReference[] {
  return references
    .map((reference, originalIndex) => ({
      reference,
      originalIndex,
      location: parseBibleReference(reference),
    }))
    .sort((left, right) => {
      if (!left.location || !right.location) {
        if (left.location) {
          return -1;
        }
        if (right.location) {
          return 1;
        }
        return left.originalIndex - right.originalIndex;
      }

      return (
        left.location.bookIndex - right.location.bookIndex ||
        left.location.startChapterIndex - right.location.startChapterIndex ||
        left.location.startVerse - right.location.startVerse ||
        left.location.endChapterIndex - right.location.endChapterIndex ||
        left.location.endVerse - right.location.endVerse ||
        left.originalIndex - right.originalIndex
      );
    });
}
