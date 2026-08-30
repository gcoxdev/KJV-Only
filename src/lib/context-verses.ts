export const MIN_CONTEXT_VERSE_COUNT = 1;
export const MAX_CONTEXT_VERSE_COUNT = 10;

export function clampContextVerseCount(value: number) {
  if (!Number.isFinite(value)) {
    return MIN_CONTEXT_VERSE_COUNT;
  }
  return Math.max(
    MIN_CONTEXT_VERSE_COUNT,
    Math.min(MAX_CONTEXT_VERSE_COUNT, Math.round(value)),
  );
}
