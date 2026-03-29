import type { Book, Verse } from "@/types/bible";
import { normalizeConcordanceWord } from "@/lib/references";
import type { SearchMode } from "@/types/reader";

export type SearchableVerseEntry = {
  text: string;
  textLower: string;
  searchWords: string[];
  searchWordsLower: string[];
  searchWordPhonetics: string[];
};

export type VerseSearchIndexEntry = SearchableVerseEntry & {
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
  bookName: string;
};

function isPunctuationTokenText(text: string) {
  return /^[,.;:!?)]$/.test(text) || /^['"]$/.test(text) || /^--?$/.test(text);
}

function normalizeSearchDisplayText(text: string) {
  return text.replace(/[’‘]/g, "'").replace(/[‐‑‒–—−]/g, "-");
}

function formatSearchTokenText(verse: Verse, tokenIndex: number) {
  const token = verse.tokens[tokenIndex];
  const normalized = normalizeSearchDisplayText(token.text);
  if (!token.divineName) {
    return normalized;
  }

  const nextToken = verse.tokens[tokenIndex + 1];
  const hasPossessiveSuffix =
    nextToken &&
    (normalizeSearchDisplayText(nextToken.text) === "'s" ||
      normalizeSearchDisplayText(nextToken.text) === "'");

  return hasPossessiveSuffix ? normalized.toUpperCase() : normalized.toUpperCase();
}

function formatVerseText(verse: Verse) {
  let value = "";
  verse.tokens.forEach((_, index) => {
    const tokenText = formatSearchTokenText(verse, index);
    if (index > 0 && !isPunctuationTokenText(tokenText)) {
      value += " ";
    }
    value += tokenText;
  });
  return value;
}

export function extractSearchWords(text: string) {
  return text
    .split(/\s+/)
    .map((word) => normalizeConcordanceWord(normalizeSearchDisplayText(word)))
    .filter(Boolean);
}

export function createSearchableVerseEntry(text: string): SearchableVerseEntry {
  const searchWords = extractSearchWords(text);
  return {
    text,
    textLower: text.toLowerCase(),
    searchWords,
    searchWordsLower: searchWords.map((word) => word.toLowerCase()),
    searchWordPhonetics: searchWords.map((word) => phoneticCode(word.toLowerCase())),
  };
}

export function buildVerseSearchIndex(books: Book[]): VerseSearchIndexEntry[] {
  const indexed: VerseSearchIndexEntry[] = [];
  books.forEach((book, bookIndex) => {
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.verses.forEach((verse) => {
        const text = formatVerseText(verse);
        indexed.push({
          bookIndex,
          chapterIndex,
          verseNumber: verse.verse,
          bookName: book.name,
          ...createSearchableVerseEntry(text),
        });
      });
    });
  });
  return indexed;
}

export function matchSelectedWords(
  entry: Pick<SearchableVerseEntry, "searchWords" | "searchWordsLower">,
  selectedWords: string[],
  mode: Extract<SearchMode, "contains-any" | "contains-all">,
  caseSensitive: boolean,
) {
  const normalizedNeedles = selectedWords
    .map((word) => normalizeConcordanceWord(word.trim()))
    .filter(Boolean);

  if (normalizedNeedles.length === 0) {
    return false;
  }

  const haystack = new Set(
    caseSensitive ? entry.searchWords : entry.searchWordsLower,
  );
  const needles = caseSensitive
    ? normalizedNeedles
    : normalizedNeedles.map((word) => word.toLowerCase());

  return mode === "contains-any"
    ? needles.some((needle) => haystack.has(needle))
    : needles.every((needle) => haystack.has(needle));
}

export function suggestConcordanceWords(
  words: string[],
  input: string,
  selectedWords: string[] = [],
  limit = 40,
) {
  const query = input.trim().toLowerCase();
  if (query.length < 2) {
    return [] as string[];
  }

  const selected = new Set(selectedWords.map((word) => word.toLowerCase()));
  const startsWith: string[] = [];
  const includes: string[] = [];

  for (const word of words) {
    const lower = word.toLowerCase();
    if (selected.has(lower)) {
      continue;
    }
    if (lower.startsWith(query)) {
      startsWith.push(word);
      continue;
    }
    if (lower.includes(query)) {
      includes.push(word);
    }
  }

  return [...startsWith, ...includes].slice(0, limit);
}

export function buildRegexMatcher(pattern: string, caseSensitive: boolean) {
  const trimmed = pattern.trim();
  if (!trimmed) {
    return {
      regex: null,
      error: "Enter a regular expression.",
    };
  }

  try {
    return {
      regex: new RegExp(trimmed, caseSensitive ? "" : "i"),
      error: null,
    };
  } catch (error) {
    return {
      regex: null,
      error:
        error instanceof Error ? error.message : "Invalid regular expression.",
    };
  }
}

const SMART_SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "he",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "unto",
  "was",
  "were",
  "with",
  "ye",
  "you",
]);

export function isSmartSearchStopWord(word: string) {
  return SMART_SEARCH_STOP_WORDS.has(word.toLowerCase());
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }
    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function createTrigrams(value: string) {
  const padded = `  ${value}  `;
  const trigrams = new Set<string>();
  for (let index = 0; index <= padded.length - 3; index += 1) {
    trigrams.add(padded.slice(index, index + 3));
  }
  return trigrams;
}

function trigramSimilarity(a: string, b: string) {
  if (a === b) {
    return 1;
  }

  const aTrigrams = createTrigrams(a);
  const bTrigrams = createTrigrams(b);
  let shared = 0;
  for (const trigram of aTrigrams) {
    if (bTrigrams.has(trigram)) {
      shared += 1;
    }
  }

  const total = aTrigrams.size + bTrigrams.size;
  if (total === 0) {
    return 0;
  }

  return (2 * shared) / total;
}

function phoneticCode(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z]/g, "");
  if (!normalized) {
    return "";
  }

  const firstLetter = normalized[0];
  const replacements = normalized
    .replace(/PH/g, "F")
    .replace(/GH/g, "G")
    .replace(/KN/g, "N")
    .replace(/WR/g, "R")
    .replace(/QU/g, "K")
    .replace(/CK/g, "K")
    .replace(/SCH/g, "S")
    .replace(/SH/g, "S")
    .replace(/CH/g, "K")
    .replace(/TH/g, "T")
    .replace(/TZ/g, "Z")
    .replace(/TS/g, "Z")
    .replace(/CZ/g, "Z");

  const encode = (character: string) => {
    if ("BFPV".includes(character)) return "1";
    if ("CGJKQSXZ".includes(character)) return "2";
    if ("DT".includes(character)) return "3";
    if (character === "L") return "4";
    if ("MN".includes(character)) return "5";
    if (character === "R") return "6";
    return "";
  };

  let encoded = "";
  let previousDigit = encode(firstLetter);
  for (const character of replacements.slice(1)) {
    const digit = encode(character);
    if (!digit) {
      previousDigit = "";
      continue;
    }
    if (digit !== previousDigit) {
      encoded += digit;
    }
    previousDigit = digit;
  }

  return `${firstLetter}${encoded}`.slice(0, 5);
}

export function getSmartPhoneticCode(value: string) {
  return phoneticCode(value.toLowerCase());
}

export function smartWordSimilarity(queryWord: string, verseWord: string) {
  return tokenSimilarity(queryWord.toLowerCase(), verseWord.toLowerCase());
}

export type SmartSuggestionCandidate = {
  word: string;
  score: number;
};

function tokenSimilarity(queryWord: string, verseWord: string) {
  if (queryWord === verseWord) {
    return 1;
  }

  const shorterLength = Math.min(queryWord.length, verseWord.length);
  if (
    shorterLength >= 3 &&
    (queryWord.startsWith(verseWord) || verseWord.startsWith(queryWord))
  ) {
    return 0.92;
  }

  if (
    shorterLength >= 4 &&
    (queryWord.includes(verseWord) || verseWord.includes(queryWord))
  ) {
    return 0.82;
  }

  const maxLength = Math.max(queryWord.length, verseWord.length);
  if (maxLength < 3) {
    return 0;
  }

  const distance = levenshteinDistance(queryWord, verseWord);
  const maxDistance = Math.max(1, Math.floor(maxLength / 3));
  const editSimilarity =
    distance > maxDistance ? 0 : Math.max(0, 1 - distance / maxLength);
  const ngramSimilarity = trigramSimilarity(queryWord, verseWord);
  const queryPhonetic = phoneticCode(queryWord);
  const versePhonetic = phoneticCode(verseWord);
  const phoneticSimilarity =
    queryWord.length >= 4 &&
    verseWord.length >= 4 &&
    queryPhonetic &&
    queryPhonetic === versePhonetic
      ? 0.76
      : 0;
  const blended = Math.max(
    editSimilarity * 0.88,
    ngramSimilarity * 0.82,
    phoneticSimilarity,
  );

  return blended >= 0.38 ? blended : 0;
}

function sharedPrefixLength(a: string, b: string) {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  while (index < limit && a[index] === b[index]) {
    index += 1;
  }
  return index;
}

function consonantSkeleton(value: string) {
  if (!value) {
    return "";
  }
  const lowered = value.toLowerCase();
  const first = lowered[0];
  const rest = lowered
    .slice(1)
    .replace(/[aeiouy]/g, "")
    .replace(/(.)\1+/g, "$1");
  return `${first}${rest}`;
}

function longestCommonSubsequenceLength(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[a.length][b.length];
}

type PreparedSmartSearch = {
  rawQuery: string;
  queryWords: string[];
  significantQueryWords: string[];
  queryWordPhonetics: string[];
  exactPhrases: string[];
  caseSensitive: boolean;
};

type SmartSimilarityCache = Map<string, number>;

function hasOrderedWords(
  haystackWords: string[],
  needleWords: string[],
) {
  let searchIndex = 0;
  for (const needle of needleWords) {
    const nextIndex = haystackWords.indexOf(needle, searchIndex);
    if (nextIndex === -1) {
      return false;
    }
    searchIndex = nextIndex + 1;
  }
  return true;
}

function bestOrderedSpanScore(
  haystackWords: string[],
  needleWords: string[],
) {
  if (needleWords.length < 2) {
    return 0;
  }

  let bestScore = 0;
  for (let start = 0; start < haystackWords.length; start += 1) {
    let searchIndex = start;
    const matchedPositions: number[] = [];
    for (const needle of needleWords) {
      const nextIndex = haystackWords.findIndex(
        (word, index) => index >= searchIndex && tokenSimilarity(needle, word) >= 0.72,
      );
      if (nextIndex === -1) {
        break;
      }
      matchedPositions.push(nextIndex);
      searchIndex = nextIndex + 1;
    }

    if (matchedPositions.length < 2) {
      continue;
    }

    const span =
      matchedPositions[matchedPositions.length - 1] - matchedPositions[0] + 1;
    const compactness = matchedPositions.length / span;
    const coverage = matchedPositions.length / needleWords.length;
    bestScore = Math.max(bestScore, compactness * coverage);
  }

  return bestScore;
}

export function scoreSmartSearch(
  entry: Pick<
    SearchableVerseEntry,
    "text" | "textLower" | "searchWords" | "searchWordsLower" | "searchWordPhonetics"
  >,
  query: string,
  caseSensitive: boolean,
) {
  const prepared = prepareSmartSearch(query, caseSensitive);
  if (!prepared) {
    return null;
  }

  return scorePreparedSmartSearch(entry, prepared, new Map());
}

export function getSmartHighlightWords(
  entry: Pick<
    SearchableVerseEntry,
    "searchWords" | "searchWordsLower"
  >,
  query: string,
  caseSensitive: boolean,
) {
  const prepared = prepareSmartSearch(query, caseSensitive);
  if (!prepared) {
    return [] as string[];
  }

  const haystackWords = caseSensitive ? entry.searchWords : entry.searchWordsLower;
  const highlights = new Set<string>();

  for (const queryWord of prepared.queryWords) {
    let best = 0;
    let bestWord: string | null = null;
    for (const verseWord of haystackWords) {
      const similarity = tokenSimilarity(queryWord, verseWord);
      if (similarity > best) {
        best = similarity;
        bestWord = verseWord;
      }
    }

    if (bestWord && best >= 0.55) {
      highlights.add(bestWord);
    }
  }

  return Array.from(highlights);
}

export function suggestSmartCorrections(
  query: string,
  vocabulary: Iterable<string>,
  limit = 3,
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 3 || isSmartSearchStopWord(normalizedQuery)) {
    return [] as SmartSuggestionCandidate[];
  }

  const queryPhonetic = phoneticCode(normalizedQuery);
  const queryLength = normalizedQuery.length;
  const shortPrefix = normalizedQuery.slice(0, Math.min(queryLength, 3));
  const longPrefix = normalizedQuery.slice(0, Math.min(queryLength, 5));
  const hasStrongPrefix = queryLength >= 4;
  const querySkeleton = consonantSkeleton(normalizedQuery);
  const ranked: SmartSuggestionCandidate[] = [];

  for (const rawCandidate of vocabulary) {
    const candidate = rawCandidate.toLowerCase();
    if (candidate === normalizedQuery || candidate.length < 2) {
      continue;
    }

    const candidateLength = candidate.length;
    const lengthGap = Math.abs(candidateLength - queryLength);
    const commonPrefix = sharedPrefixLength(normalizedQuery, candidate);
    const candidateSkeleton = consonantSkeleton(candidate);
    const skeletonPrefix = sharedPrefixLength(querySkeleton, candidateSkeleton);
    const subsequenceRatio =
      longestCommonSubsequenceLength(normalizedQuery, candidate) / queryLength;
    const startsWithQuery = candidate.startsWith(normalizedQuery);
    const sharesLongPrefix = longPrefix.length >= 4 && candidate.startsWith(longPrefix);
    const sharesShortPrefix = shortPrefix.length >= 3 && candidate.startsWith(shortPrefix);
    const sharesPhonetic =
      queryLength >= 4 &&
      candidateLength >= 4 &&
      queryPhonetic &&
      phoneticCode(candidate) === queryPhonetic;
    const similarity = smartWordSimilarity(normalizedQuery, candidate);

    if (
      !startsWithQuery &&
      !sharesLongPrefix &&
      !sharesShortPrefix &&
      skeletonPrefix < Math.min(3, querySkeleton.length) &&
      !sharesPhonetic &&
      similarity < 0.72
    ) {
      continue;
    }

    let score = similarity;

    if (startsWithQuery) {
      score += 1.4;
    } else if (sharesLongPrefix) {
      score += 1.05;
    } else if (sharesShortPrefix) {
      score += 0.55;
    }

    if (sharesPhonetic) {
      score += 0.5;
    }

    score += Math.min(commonPrefix, 6) * 0.16;
    score += Math.min(skeletonPrefix, 5) * 0.18;
    score += subsequenceRatio * 0.5;

    if (skeletonPrefix >= 3 && subsequenceRatio >= 0.8) {
      score += 0.6;
    } else if (skeletonPrefix >= 3 && subsequenceRatio >= 0.65) {
      score += 0.25;
    }

    if (candidateLength >= queryLength) {
      score += 0.22;
      score += Math.max(0, 0.18 - Math.min(lengthGap, 6) * 0.03);
    } else {
      score -= 0.45 + Math.min(queryLength - candidateLength, 6) * 0.1;
    }

    if (hasStrongPrefix && candidateLength <= queryLength - 2) {
      score -= 0.75;
    }

    if (queryLength >= 5) {
      if (commonPrefix < 2 && skeletonPrefix < 3) {
        score -= 0.9;
      } else if (commonPrefix < 3 && skeletonPrefix < 4) {
        score -= 0.35;
      }
      if (subsequenceRatio < 0.65) {
        score -= 0.8;
      } else if (subsequenceRatio < 0.7) {
        score -= 0.45;
      }
    }

    if (
      queryLength >= 5 &&
      candidateLength >= 5 &&
      similarity >= 0.82 &&
      candidate[0] === normalizedQuery[0]
    ) {
      score += 0.2;
    }

    if (score >= 1.02) {
      ranked.push({ word: candidate, score });
    }
  }

  ranked.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    if (right.word.length !== left.word.length) {
      return right.word.length - left.word.length;
    }
    return left.word.localeCompare(right.word);
  });

  return ranked.slice(0, limit);
}

export function prepareSmartSearch(query: string, caseSensitive: boolean) {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const exactPhrases = Array.from(
    trimmed.matchAll(/"([^"]+)"/g),
    (match) => match[1]?.trim(),
  ).filter(Boolean) as string[];

  const normalizedQueryWords = extractSearchWords(trimmed);
  if (normalizedQueryWords.length === 0) {
    return null;
  }

  const queryWords = caseSensitive
    ? normalizedQueryWords
    : normalizedQueryWords.map((word) => word.toLowerCase());
  const significantQueryWords = queryWords.filter(
    (word) => !SMART_SEARCH_STOP_WORDS.has(word),
  );

  return {
    rawQuery: caseSensitive ? trimmed : trimmed.toLowerCase(),
    queryWords,
    significantQueryWords,
    queryWordPhonetics: queryWords.map((word) => phoneticCode(word)),
    exactPhrases: caseSensitive
      ? exactPhrases
      : exactPhrases.map((phrase) => phrase.toLowerCase()),
    caseSensitive,
  } satisfies PreparedSmartSearch;
}

export function isSmartSearchCandidate(
  entry: Pick<
    SearchableVerseEntry,
    "text" | "textLower" | "searchWords" | "searchWordsLower" | "searchWordPhonetics"
  >,
  prepared: PreparedSmartSearch,
) {
  const haystackText = prepared.caseSensitive ? entry.text : entry.textLower;
  if (prepared.exactPhrases.some((phrase) => !haystackText.includes(phrase))) {
    return false;
  }

  const haystackWords = prepared.caseSensitive
    ? entry.searchWords
    : entry.searchWordsLower;
  const candidateWords =
    prepared.significantQueryWords.length > 0
      ? prepared.significantQueryWords
      : prepared.queryWords;

  if (candidateWords.length === 0) {
    return false;
  }

  let matchedCandidateWords = 0;
  for (const [index, queryWord] of candidateWords.entries()) {
    const queryPhonetic =
      prepared.queryWordPhonetics[
        prepared.queryWords.indexOf(queryWord)
      ] ?? phoneticCode(queryWord);
    let matchedThisWord = false;
    for (const [wordIndex, verseWord] of haystackWords.entries()) {
      if (queryWord === verseWord) {
        matchedThisWord = true;
        break;
      }
      const shorterLength = Math.min(queryWord.length, verseWord.length);
      if (
        shorterLength >= 3 &&
        (queryWord.startsWith(verseWord) || verseWord.startsWith(queryWord))
      ) {
        matchedThisWord = true;
        break;
      }
      if (
        queryWord.length >= 4 &&
        verseWord.length >= 4 &&
        queryPhonetic &&
        queryPhonetic === entry.searchWordPhonetics[wordIndex]
      ) {
        matchedThisWord = true;
        break;
      }
      if (index === 0 && shorterLength >= 4 && trigramSimilarity(queryWord, verseWord) >= 0.5) {
        matchedThisWord = true;
        break;
      }
    }

    if (matchedThisWord) {
      matchedCandidateWords += 1;
      const minimumMatches =
        candidateWords.length >= 4 ? 2 : candidateWords.length >= 3 ? 2 : 1;
      if (matchedCandidateWords >= minimumMatches) {
        return true;
      }
    }
  }

  return false;
}

export function scorePreparedSmartSearch(
  entry: Pick<
    SearchableVerseEntry,
    "text" | "textLower" | "searchWords" | "searchWordsLower" | "searchWordPhonetics"
  >,
  prepared: PreparedSmartSearch,
  similarityCache: SmartSimilarityCache,
) {
  const haystackWords = prepared.caseSensitive
    ? entry.searchWords
    : entry.searchWordsLower;
  const queryWords = prepared.queryWords;
  const significantQueryWords = prepared.significantQueryWords;
  const text = prepared.caseSensitive ? entry.text : entry.textLower;
  const rawNeedle = prepared.rawQuery;

  let score = 0;
  let weakMatches = 0;
  let exactWordMatches = 0;
  const matchedPositions: number[] = [];
  let significantStrongMatches = 0;

  for (const queryWord of queryWords) {
    const isStopWord = SMART_SEARCH_STOP_WORDS.has(queryWord);
    const weight = isStopWord ? 1.4 : 5;
    let best = 0;
    let bestIndex = -1;
    for (const [verseIndex, verseWord] of haystackWords.entries()) {
      const cacheKey = `${queryWord}|${verseWord}`;
      let similarity = similarityCache.get(cacheKey);
      if (similarity === undefined) {
        similarity = tokenSimilarity(queryWord, verseWord);
        similarityCache.set(cacheKey, similarity);
      }
      if (similarity > best) {
        best = similarity;
        bestIndex = verseIndex;
      }
      if (best === 1) {
        break;
      }
    }

    if (best >= 1) {
      exactWordMatches += 1;
    }
    if (best < 0.55) {
      weakMatches += 1;
    }
    if (!isStopWord && best >= 0.55) {
      significantStrongMatches += 1;
    }
    if (bestIndex >= 0 && best >= 0.55) {
      matchedPositions.push(bestIndex);
    }

    score += best * best * weight;
  }

  if (text.includes(rawNeedle)) {
    score += 42;
  }

  if (prepared.exactPhrases.length > 0) {
    for (const phrase of prepared.exactPhrases) {
      if (text.includes(phrase)) {
        score += 60;
      } else {
        return null;
      }
    }
  }

  if (exactWordMatches === queryWords.length) {
    score += 14;
  }

  score += exactWordMatches * 8;
  score += matchedPositions.filter(
    (position, index) =>
      position >= 0 &&
      haystackWords[position] === queryWords[index],
  ).length * 6;

  if (hasOrderedWords(haystackWords, queryWords)) {
    score += 10;
  }

  const orderedSpanBonus = bestOrderedSpanScore(
    haystackWords,
    significantQueryWords.length > 0 ? significantQueryWords : queryWords,
  );
  if (orderedSpanBonus > 0) {
    score += orderedSpanBonus * 8;
  }

  if (matchedPositions.length >= 2) {
    const sortedPositions = [...matchedPositions].sort((a, b) => a - b);
    const span =
      sortedPositions[sortedPositions.length - 1] - sortedPositions[0] + 1;
    if (span === queryWords.length) {
      score += 7;
    } else {
      score += Math.max(0, 5 - (span - queryWords.length));
    }
  }

  const requiredWords =
    significantQueryWords.length > 0 ? significantQueryWords.length : queryWords.length;
  const strongMatches = queryWords.length - weakMatches;
  if (significantQueryWords.length > 0 && significantStrongMatches === 0) {
    return null;
  }
  if (requiredWords >= 3 && strongMatches < Math.ceil(requiredWords / 2)) {
    return null;
  }

  if (queryWords.length === 1 && exactWordMatches === 0 && score < 2.75) {
    return null;
  }

  if (weakMatches >= queryWords.length) {
    return null;
  }

  return score >= 2 ? score : null;
}
