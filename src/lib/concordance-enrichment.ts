import { chapterVerseKey, normalizeConcordanceWord } from "./references.ts";
import type { Book } from "../types/bible.ts";
import type { ConcordancePayload } from "../types/reader.ts";

function deltaEncode(values: number[]) {
  return values.map((value, index) =>
    index === 0 ? value : value - values[index - 1],
  );
}

function deltaDecode(values: number[]) {
  const decoded: number[] = [];
  let current = 0;

  values.forEach((value, index) => {
    current = index === 0 ? value : current + value;
    decoded.push(current);
  });

  return decoded;
}

export function augmentConcordanceWithNormalizedWordForms(
  concordance: ConcordancePayload,
  books: Book[],
) {
  const nextWords = { ...concordance.words };
  const verseIndexes = new Map(
    concordance.verses.map((reference, index) => [reference, index]),
  );
  const normalizedExistingKeys = new Map<string, string>();
  const discoveredDisplayKeys = new Map<string, string>();

  for (const key of Object.keys(nextWords)) {
    normalizedExistingKeys.set(normalizeConcordanceWord(key).toLowerCase(), key);
  }

  const normalizedWordVerseIndexes = new Map<string, Set<number>>();

  for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
    const book = books[bookIndex];
    for (
      let chapterIndex = 0;
      chapterIndex < book.chapters.length;
      chapterIndex += 1
    ) {
      const chapter = book.chapters[chapterIndex];
      for (const verse of chapter.verses) {
        const reference = chapterVerseKey(bookIndex, chapterIndex, verse.verse);
        const verseIndex = verseIndexes.get(reference);
        if (verseIndex == null) {
          continue;
        }

        for (const token of verse.tokens) {
          if (!/[‐‑‒–—−]/.test(token.text)) {
            continue;
          }

          const normalizedWord = normalizeConcordanceWord(token.text);
          if (!normalizedWord) {
            continue;
          }

          const normalizedKey = normalizedWord.toLowerCase();
          if (!discoveredDisplayKeys.has(normalizedKey)) {
            discoveredDisplayKeys.set(normalizedKey, normalizedWord);
          }
          const existingSet = normalizedWordVerseIndexes.get(normalizedKey);
          if (existingSet) {
            existingSet.add(verseIndex);
          } else {
            normalizedWordVerseIndexes.set(normalizedKey, new Set([verseIndex]));
          }
        }
      }
    }
  }

  let changed = false;

  for (const [normalizedKey, indexes] of normalizedWordVerseIndexes) {
    const targetKey =
      normalizedExistingKeys.get(normalizedKey) ??
      discoveredDisplayKeys.get(normalizedKey) ??
      normalizedKey;
    const existingEncoded = nextWords[targetKey] ?? [];
    const merged = new Set<number>(deltaDecode(existingEncoded));
    for (const index of indexes) {
      merged.add(index);
    }
    const mergedSorted = Array.from(merged).sort((left, right) => left - right);
    const mergedEncoded = deltaEncode(mergedSorted);

    if (
      existingEncoded.length !== mergedEncoded.length ||
      existingEncoded.some((value, index) => value !== mergedEncoded[index])
    ) {
      nextWords[targetKey] = mergedEncoded;
      changed = true;
    }
  }

  return changed ? { ...concordance, words: nextWords } : concordance;
}
