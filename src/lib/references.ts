import type {
  AIDictionaryPayload,
  ConcordancePayload,
  HitchcocksPayload,
  BibleWordBookPayload,
  OldEnglishPayload,
  PhrasesPayload,
  UnitsPayload,
  WebstersPayload,
} from "@/types/reader";
import type { VerseToken } from "@/types/bible";

export const BOOK_ICON_CODES = [
  "GEN",
  "EXO",
  "LEV",
  "NUM",
  "DEU",
  "JOS",
  "JDG",
  "RUT",
  "1SA",
  "2SA",
  "1KI",
  "2KI",
  "1CH",
  "2CH",
  "EZR",
  "NEH",
  "EST",
  "JOB",
  "PSA",
  "PRO",
  "ECC",
  "SNG",
  "ISA",
  "JER",
  "LAM",
  "EZK",
  "DAN",
  "HOS",
  "JOL",
  "AMO",
  "OBA",
  "JON",
  "MIC",
  "NAM",
  "HAB",
  "ZEP",
  "HAG",
  "ZEC",
  "MAL",
  "MAT",
  "MRK",
  "LUK",
  "JHN",
  "ACT",
  "ROM",
  "1CO",
  "2CO",
  "GAL",
  "EPH",
  "PHP",
  "COL",
  "1TH",
  "2TH",
  "1TI",
  "2TI",
  "TIT",
  "PHM",
  "HEB",
  "JAS",
  "1PE",
  "2PE",
  "1JN",
  "2JN",
  "3JN",
  "JUD",
  "REV",
] as const;

const DASH_VARIANTS_PATTERN = /[‐‑‒–—−]/g;
const CURLY_APOSTROPHES_PATTERN = /[’‘]/g;

export function normalizeConcordanceWord(input: string) {
  return input
    .replace(CURLY_APOSTROPHES_PATTERN, "'")
    .replace(DASH_VARIANTS_PATTERN, "-")
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
}

export function resolveConcordanceKey(
  concordance: ConcordancePayload,
  rawWord: string,
) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const candidates = [
    cleaned,
    cleaned.toLowerCase(),
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
  ];

  for (const candidate of candidates) {
    if (concordance.words[candidate]) {
      return candidate;
    }
  }

  const lowered = cleaned.toLowerCase();
  const fallback = Object.keys(concordance.words).find(
    (key) => normalizeConcordanceWord(key).toLowerCase() === lowered,
  );

  if (fallback) {
    return fallback;
  }

  return null;
}

export function decodeConcordanceReferences(
  concordance: ConcordancePayload,
  key: string,
) {
  const encoded = concordance.words[key] ?? [];
  const decoded: number[] = [];
  let current = 0;

  encoded.forEach((value, index) => {
    if (index === 0) {
      current = value;
    } else {
      current += value;
    }
    decoded.push(current);
  });

  return decoded
    .map((index) => concordance.verses[index])
    .filter((reference): reference is string => Boolean(reference));
}

export function resolveWebstersKey(websters: WebstersPayload, rawWord: string) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const candidates = [
    cleaned,
    cleaned.toLowerCase(),
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
  ];

  for (const candidate of candidates) {
    if (websters[candidate]) {
      return candidate;
    }
  }

  const lowered = cleaned.toLowerCase();
  const fallback = Object.keys(websters).find(
    (key) => key.toLowerCase() === lowered,
  );
  return fallback ?? null;
}

export function resolveAIDictionaryKey(
  aiDictionary: AIDictionaryPayload,
  rawWord: string,
) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const lowered = cleaned.toLowerCase();
  const singular = lowered.endsWith("s") ? lowered.slice(0, -1) : lowered;
  const exactCandidates = new Set([
    cleaned,
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
    lowered,
  ]);
  const normalizedCandidate = normalizePhraseText(rawWord);

  for (const candidate of exactCandidates) {
    if (aiDictionary[candidate]) {
      return candidate;
    }
  }

  for (const [key, entry] of Object.entries(aiDictionary)) {
    if (
      entry.aliases?.some(
        (alias) =>
          exactCandidates.has(alias) ||
          (normalizedCandidate && normalizePhraseText(alias) === normalizedCandidate),
      )
    ) {
      return key;
    }
  }

  for (const [key, entry] of Object.entries(aiDictionary)) {
    const keyLower = key.toLowerCase();
    if (
      exactCandidates.has(keyLower) ||
      (normalizedCandidate && normalizePhraseText(key) === normalizedCandidate)
    ) {
      return key;
    }
    if (
      entry.aliases?.some((alias) => {
        const aliasLower = alias.toLowerCase();
        return (
          exactCandidates.has(alias) ||
          exactCandidates.has(aliasLower) ||
          (normalizedCandidate && normalizePhraseText(alias) === normalizedCandidate)
        );
      })
    ) {
      return key;
    }
  }

  const singularCandidates = new Set([singular]);

  for (const [key, entry] of Object.entries(aiDictionary)) {
    const keyLower = key.toLowerCase();
    if (singularCandidates.has(key) || singularCandidates.has(keyLower)) {
      return key;
    }
    if (
      entry.aliases?.some((alias) => singularCandidates.has(alias.toLowerCase()))
    ) {
      return key;
    }
  }

  return null;
}

export function resolveAIDictionaryPhraseKey(
  aiDictionary: AIDictionaryPayload,
  rawValue: string,
) {
  const normalized = normalizePhraseText(rawValue);
  if (!normalized || !normalized.includes(" ")) {
    return null;
  }

  for (const [key, entry] of Object.entries(aiDictionary)) {
    if (normalizePhraseText(key) === normalized) {
      return key;
    }
    if (
      entry.aliases?.some((alias) => normalizePhraseText(alias) === normalized)
    ) {
      return key;
    }
  }

  return null;
}

export function resolveAIDictionaryPhraseKeyForToken(
  aiDictionary: AIDictionaryPayload,
  verseTokens: VerseToken[],
  tokenIndex: number,
) {
  const normalizedWords = verseTokens
    .map((token, index) => ({
      sourceIndex: index,
      word: normalizePhraseText(token.text),
    }))
    .filter((item) => item.word.length > 0);

  const clickedWordIndex = normalizedWords.findIndex(
    (item) => item.sourceIndex === tokenIndex,
  );
  if (clickedWordIndex < 0) {
    return null;
  }

  const maxPhraseLength = Math.min(8, normalizedWords.length);
  for (let length = maxPhraseLength; length >= 2; length -= 1) {
    const startMin = Math.max(0, clickedWordIndex - length + 1);
    const startMax = Math.min(clickedWordIndex, normalizedWords.length - length);
    for (let start = startMin; start <= startMax; start += 1) {
      const candidate = normalizedWords
        .slice(start, start + length)
        .map((item) => item.word)
        .join(" ");
      const matchedKey = resolveAIDictionaryPhraseKey(aiDictionary, candidate);
      if (matchedKey) {
        return matchedKey;
      }
    }
  }

  return null;
}

export function resolveHitchcocksKey(
  hitchcocks: HitchcocksPayload,
  rawWord: string,
) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const candidates = [
    cleaned,
    cleaned.toLowerCase(),
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
  ];

  for (const candidate of candidates) {
    if (hitchcocks[candidate]) {
      return candidate;
    }
  }

  const lowered = cleaned.toLowerCase();
  const fallback = Object.keys(hitchcocks).find(
    (key) => key.toLowerCase() === lowered,
  );
  return fallback ?? null;
}

export function resolveOldEnglishKey(
  oldEnglish: OldEnglishPayload,
  rawWord: string,
) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const candidates = [
    cleaned,
    cleaned.toLowerCase(),
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
  ];

  for (const candidate of candidates) {
    if (oldEnglish[candidate]) {
      return candidate;
    }
  }

  const lowered = cleaned.toLowerCase();
  const fallback = Object.keys(oldEnglish).find(
    (key) => key.toLowerCase() === lowered,
  );
  return fallback ?? null;
}

export function resolveBibleWordBookKey(
  bibleWordBook: BibleWordBookPayload,
  rawWord: string,
) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const candidates = [
    cleaned,
    cleaned.toLowerCase(),
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
  ];

  for (const candidate of candidates) {
    if (bibleWordBook[candidate]) {
      return candidate;
    }
  }

  for (const [key, entry] of Object.entries(bibleWordBook)) {
    if (
      entry.aliases?.some((alias) => {
        const aliasLower = alias.toLowerCase();
        return candidates.includes(alias) || candidates.includes(aliasLower);
      })
    ) {
      return key;
    }
  }

  const lowered = cleaned.toLowerCase();
  const fallback = Object.keys(bibleWordBook).find(
    (key) => key.toLowerCase() === lowered,
  );
  return fallback ?? null;
}

export function resolveUnitsKey(units: UnitsPayload, rawWord: string) {
  const cleaned = normalizeConcordanceWord(rawWord);
  if (!cleaned) {
    return null;
  }

  const lowered = cleaned.toLowerCase();
  const singular = lowered.endsWith("s") ? lowered.slice(0, -1) : lowered;
  const candidates = new Set([
    cleaned,
    lowered,
    singular,
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase(),
    cleaned.toUpperCase(),
  ]);

  for (const [key, entry] of Object.entries(units)) {
    const keyLower = key.toLowerCase();
    if (candidates.has(key) || candidates.has(keyLower)) {
      return key;
    }
    if (
      entry.aliases?.some((alias) => {
        const aliasLower = alias.toLowerCase();
        return candidates.has(alias) || candidates.has(aliasLower);
      })
    ) {
      return key;
    }
  }

  return null;
}

export function normalizePhraseText(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolvePhraseKey(phrases: PhrasesPayload, rawValue: string) {
  const normalized = normalizePhraseText(rawValue);
  if (!normalized) {
    return null;
  }

  for (const [key, entry] of Object.entries(phrases)) {
    if (normalizePhraseText(key) === normalized) {
      return key;
    }
    if (entry.aliases?.some((alias) => normalizePhraseText(alias) === normalized)) {
      return key;
    }
  }

  return null;
}

export function resolvePhraseKeyForToken(
  phrases: PhrasesPayload,
  verseTokens: VerseToken[],
  tokenIndex: number,
) {
  const normalizedWords = verseTokens
    .map((token, index) => ({
      sourceIndex: index,
      word: normalizePhraseText(token.text),
    }))
    .filter((item) => item.word.length > 0);

  const clickedWordIndex = normalizedWords.findIndex(
    (item) => item.sourceIndex === tokenIndex,
  );
  if (clickedWordIndex < 0) {
    return null;
  }

  const maxPhraseLength = Math.min(6, normalizedWords.length);
  for (let length = maxPhraseLength; length >= 2; length -= 1) {
    const startMin = Math.max(0, clickedWordIndex - length + 1);
    const startMax = Math.min(clickedWordIndex, normalizedWords.length - length);
    for (let start = startMin; start <= startMax; start += 1) {
      const candidate = normalizedWords
        .slice(start, start + length)
        .map((item) => item.word)
        .join(" ");
      const matchedKey = resolvePhraseKey(phrases, candidate);
      if (matchedKey) {
        return matchedKey;
      }
    }
  }

  return null;
}

export function normalizeStrongsCode(value: string) {
  const match = value.toUpperCase().match(/([GH])\s*0*([0-9]{1,4})/);
  if (!match) {
    return null;
  }
  const [, prefix, numeric] = match;
  return `${prefix}${numeric.padStart(4, "0")}`;
}

export type StrongsDerivationToken =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "strongs";
      value: string;
    };

export function tokenizeStrongsDerivation(input: string): StrongsDerivationToken[] {
  const tokens: StrongsDerivationToken[] = [];
  const pattern = /\b([GH]\d{4})\b/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: input.slice(lastIndex, match.index),
      });
    }
    tokens.push({
      type: "strongs",
      value: match[1],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    tokens.push({
      type: "text",
      value: input.slice(lastIndex),
    });
  }

  return tokens;
}

export function parseBibleReference(reference: string) {
  const chapterSpanMatch = reference.match(
    /^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)(?::|-)(\d+)\.(\d+)$/,
  );
  if (chapterSpanMatch) {
    const [
      ,
      bookCode,
      startChapterString,
      startVerseString,
      endChapterString,
      endVerseString,
    ] = chapterSpanMatch;
    const bookIndex = BOOK_ICON_CODES.findIndex((code) => code === bookCode);
    if (bookIndex < 0) {
      return null;
    }

    const startChapterNumber = Number.parseInt(startChapterString, 10);
    const endChapterNumber = Number.parseInt(endChapterString, 10);
    const startVerse = Number.parseInt(startVerseString, 10);
    const endVerse = Number.parseInt(endVerseString, 10);
    if (!Number.isFinite(startChapterNumber) || startChapterNumber < 1) {
      return null;
    }
    if (!Number.isFinite(endChapterNumber) || endChapterNumber < 1) {
      return null;
    }
    if (!Number.isFinite(startVerse) || startVerse < 1) {
      return null;
    }
    if (!Number.isFinite(endVerse) || endVerse < 1) {
      return null;
    }

    const startChapterIndex = startChapterNumber - 1;
    const endChapterIndex = endChapterNumber - 1;
    if (startChapterIndex > endChapterIndex) {
      return null;
    }

    return {
      bookIndex,
      startChapterIndex,
      endChapterIndex,
      startVerse,
      endVerse,
      bookCode,
    };
  }

  const match = reference.match(/^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)(?:-(\d+))?$/);
  if (!match) {
    return null;
  }

  const [, bookCode, chapterString, verseStartString, verseEndString] = match;
  const bookIndex = BOOK_ICON_CODES.findIndex((code) => code === bookCode);
  if (bookIndex < 0) {
    return null;
  }

  const chapterNumber = Number.parseInt(chapterString, 10);
  const startVerseNumber = Number.parseInt(verseStartString, 10);
  const endVerseNumber = Number.parseInt(
    verseEndString ?? verseStartString,
    10,
  );
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1) {
    return null;
  }
  if (!Number.isFinite(startVerseNumber) || startVerseNumber < 1) {
    return null;
  }
  if (!Number.isFinite(endVerseNumber) || endVerseNumber < 1) {
    return null;
  }
  const verseStart = Math.min(startVerseNumber, endVerseNumber);
  const verseEnd = Math.max(startVerseNumber, endVerseNumber);

  return {
    bookIndex,
    startChapterIndex: chapterNumber - 1,
    endChapterIndex: chapterNumber - 1,
    startVerse: verseStart,
    endVerse: verseEnd,
    bookCode,
  };
}

export function chapterVerseKey(
  bookIndex: number,
  chapterIndex: number,
  verseNumber: number,
) {
  const code = BOOK_ICON_CODES[bookIndex] ?? "GEN";
  return `${code}.${chapterIndex + 1}.${verseNumber}`;
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
