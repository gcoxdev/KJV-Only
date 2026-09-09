import { resolvePersonPlaceContext, type PersonPlaceContext } from "@/lib/person-place-context";
import { genealogyNamesAtToken } from "@/lib/genealogy-names";
import type { Book, VerseToken } from "@/types/bible";
import type { AncientMapEntry, AncientMapPayload } from "@/lib/maps";
import {
  chapterVerseKey,
  decodeConcordanceReferences,
  normalizeConcordanceWord,
  resolveAIDictionaryKey,
  resolveAIDictionaryPhraseKeyForToken,
  resolveBibleWordBookKey,
  resolveConcordanceKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolvePhraseKeyForToken,
  resolveTokenStrongsCodes,
  resolveUnitsKey,
  resolveWebstersKey,
} from "@/lib/references";
import type {
  AIDictionaryEntry,
  AIDictionaryPayload,
  BibleWordBookPayload,
  ConcordancePayload,
  GenealogyPayload,
  GenealogyPerson,
  HitchcocksPayload,
  OldEnglishPayload,
  PhraseEntry,
  PhrasesPayload,
  StrongsPayload,
  UnitsPayload,
  WebstersPayload,
} from "@/types/reader";

export type WordTokenMatch = {
  token: VerseToken;
  tokenIndex: number;
};

export type AIDictionarySelection = {
  key: string;
  entry: AIDictionaryEntry;
};

export type PhraseSelection = {
  key: string;
  entry: PhraseEntry;
};

export type TokenAccordionOptions = {
  verseNumber?: number | null;
  bookIndex?: number;
  chapterIndex?: number;
  strongCodes?: string[];
  verseTokens?: VerseToken[] | null;
  tokenIndex?: number | null;
  concordanceData?: ConcordancePayload | null;
  webstersData?: WebstersPayload | null;
  aiDictionaryData?: AIDictionaryPayload | null;
  aiDictionarySelection?: AIDictionarySelection | null;
  bibleWordBookData?: BibleWordBookPayload | null;
  hitchcocksData?: HitchcocksPayload | null;
  oldEnglishData?: OldEnglishPayload | null;
  phraseSelection?: PhraseSelection | null;
  unitsData?: UnitsPayload | null;
  genealogyData?: GenealogyPayload | null;
  ancientMapsData?: AncientMapPayload | null;
  strongsGreekData?: StrongsPayload | null;
  strongsHebrewData?: StrongsPayload | null;
};

type RankedGenealogyMatch = {
  person: GenealogyPerson;
  rank: number;
  totalVerses: number;
};

const genealogyPeopleByNameCache = new WeakMap<
  GenealogyPayload,
  Map<string, GenealogyPerson[]>
>();
const mapEntriesByTranslationCache = new WeakMap<
  AncientMapPayload,
  Map<string, AncientMapEntry[]>
>();

function verseTokensAtLocation(
  books: Book[],
  bookIndex: number,
  chapterIndex: number,
  verseNumber: number,
) {
  return (
    books[bookIndex]?.chapters[chapterIndex]?.verses.find(
      (verse) => verse.verse === verseNumber,
    )?.tokens ?? null
  );
}

function normalizedWord(value: string) {
  return normalizeConcordanceWord(value).toLowerCase();
}

function genealogyPeopleByName(people: GenealogyPayload) {
  const cached = genealogyPeopleByNameCache.get(people);
  if (cached) {
    return cached;
  }

  const peopleByName = new Map<string, GenealogyPerson[]>();
  for (const person of people) {
    const names = new Set<string>();
    for (const name of person.names) {
      const normalized = normalizedWord(name);
      if (normalized) names.add(normalized);
    }
    for (const entry of person.verses?.byName ?? []) {
      const normalized = normalizedWord(entry.name);
      if (normalized) names.add(normalized);
    }
    for (const name of names) {
      const matches = peopleByName.get(name);
      if (matches) {
        matches.push(person);
      } else {
        peopleByName.set(name, [person]);
      }
    }
  }

  genealogyPeopleByNameCache.set(people, peopleByName);
  return peopleByName;
}

function mapEntriesByTranslation(entries: AncientMapPayload) {
  const cached = mapEntriesByTranslationCache.get(entries);
  if (cached) {
    return cached;
  }

  const entriesByTranslation = new Map<string, AncientMapEntry[]>();
  for (const entry of entries) {
    const translations = new Set(
      entry.translations.map(normalizedWord).filter(Boolean),
    );
    for (const translation of translations) {
      const matches = entriesByTranslation.get(translation);
      if (matches) {
        matches.push(entry);
      } else {
        entriesByTranslation.set(translation, [entry]);
      }
    }
  }

  mapEntriesByTranslationCache.set(entries, entriesByTranslation);
  return entriesByTranslation;
}

export function resolvePhraseSelectionAtLocation(
  books: Book[],
  phraseData: PhrasesPayload | null,
  bookIndex: number,
  chapterIndex: number,
  verseNumber: number,
  tokenIndex: number,
): PhraseSelection | null {
  if (!phraseData) {
    return null;
  }
  const verseTokens = verseTokensAtLocation(
    books,
    bookIndex,
    chapterIndex,
    verseNumber,
  );
  if (!verseTokens) {
    return null;
  }
  const matchedKey = resolvePhraseKeyForToken(
    phraseData,
    verseTokens,
    tokenIndex,
  );
  return matchedKey
    ? { key: matchedKey, entry: phraseData[matchedKey] }
    : null;
}

export function resolveAIDictionarySelectionAtLocation(
  books: Book[],
  aiDictionaryData: AIDictionaryPayload | null,
  bookIndex: number,
  chapterIndex: number,
  verseNumber: number,
  tokenIndex: number,
): AIDictionarySelection | null {
  if (!aiDictionaryData) {
    return null;
  }
  const verseTokens = verseTokensAtLocation(
    books,
    bookIndex,
    chapterIndex,
    verseNumber,
  );
  if (!verseTokens) {
    return null;
  }
  const matchedKey = resolveAIDictionaryPhraseKeyForToken(
    aiDictionaryData,
    verseTokens,
    tokenIndex,
  );
  return matchedKey
    ? { key: matchedKey, entry: aiDictionaryData[matchedKey] }
    : null;
}

export function resolveWordTokenAtLocation(
  books: Book[],
  bookIndex: number,
  chapterIndex: number,
  verseNumber: number,
  rawWord: string,
): WordTokenMatch | null {
  const verseTokens = verseTokensAtLocation(
    books,
    bookIndex,
    chapterIndex,
    verseNumber,
  );
  if (!verseTokens) {
    return null;
  }

  const targetWord = normalizedWord(rawWord);
  if (!targetWord) {
    return null;
  }

  let fallbackMatch: WordTokenMatch | null = null;
  for (const [tokenIndex, token] of verseTokens.entries()) {
    if (normalizedWord(token.text) !== targetWord) {
      continue;
    }

    const match = { token, tokenIndex };
    if (resolveTokenStrongsCodes(token).length > 0) {
      return match;
    }
    fallbackMatch ??= match;
  }

  return fallbackMatch;
}

export function findGenealogyMatches(
  people: GenealogyPayload | null | undefined,
  rawWord: string,
  referenceKey?: string | null,
  context?: PersonPlaceContext,
  selection?: Pick<TokenAccordionOptions, "verseTokens" | "tokenIndex">,
): GenealogyPerson[] {
  if (!people || context?.sense === "place" || context?.sense === "people") {
    return [];
  }

  const targetWord = normalizedWord(rawWord);
  if (!targetWord) {
    return [];
  }

  const phrases = genealogyNamesAtToken(rawWord, selection?.verseTokens, selection?.tokenIndex);
  const names = phrases.size ? phrases : new Set([targetWord]);
  const byName = genealogyPeopleByName(people);
  const candidates = new Set([...names].flatMap(name => byName.get(name) ?? []));
  const rankedMatches: RankedGenealogyMatch[] = [];
  for (const person of candidates) {
    const exactNameMatch = person.names.some(
      (name) => names.has(normalizedWord(name)),
    );
    const byNameMatches = (person.verses?.byName ?? []).filter(
      (entry) => names.has(normalizedWord(entry.name)),
    );
    const currentReferenceMatch =
      Boolean(referenceKey) &&
      byNameMatches.some((entry) =>
        entry.verses.includes(referenceKey ?? ""),
      );

    // A study-word click supplies a verse. Name-only discovery remains available
    // without that context, but must not imply that every namesake is in it.
    if (referenceKey && !currentReferenceMatch) continue;

    let rank = 0;
    if (currentReferenceMatch) {
      rank = 4;
    } else if (byNameMatches.length > 0) {
      rank = 3;
    } else if (exactNameMatch) {
      rank = 2;
    }

    if (rank > 0) {
      rankedMatches.push({
        person,
        rank,
        totalVerses:
          person.verses?.totalVerses ??
          byNameMatches.reduce(
            (count, entry) =>
              count + (entry.numVerses ?? entry.verses.length),
            0,
          ),
      });
    }
  }

  rankedMatches.sort(
    (left, right) =>
      right.rank - left.rank ||
      right.totalVerses - left.totalVerses ||
      (left.person.names[0] ?? left.person.id).localeCompare(
        right.person.names[0] ?? right.person.id,
      ),
  );

  const seen = new Set<string>();
  return rankedMatches
    .map((match) => match.person)
    .filter((person) => {
      if (seen.has(person.id)) {
        return false;
      }
      seen.add(person.id);
      return true;
    });
}

export function findMapMatches(
  entries: AncientMapPayload | null | undefined,
  rawWord: string,
  context?: PersonPlaceContext,
  personMatches: GenealogyPerson[] = [],
): AncientMapEntry[] {
  if (!entries) {
    return [];
  }
  const targetWord = normalizedWord(rawWord);
  if (!targetWord) {
    return [];
  }
  const matches = mapEntriesByTranslation(entries).get(targetWord) ?? [];
  if (!context?.referenceKey) return [...matches];
  if (context.sense === "person") return [];
  const supported = matches.filter(entry => context.mapIds
    ? context.mapIds.includes(entry.geojson_file)
    : entry.verses.includes(context.referenceKey!));
  if (supported.length) return supported;
  // A supported person with no place evidence must not turn into a city. For
  // unresolved ancestral/group names keep a clearly labeled name-only fallback.
  if (personMatches.length && !context.ambiguous && !context.sense) return [];
  return matches.map(entry => ({ ...entry,
    selectionNote: "Same name; location not verified for this verse.",
  }));
}

export function deriveTokenAccordionState(
  rawWord: string,
  options: TokenAccordionOptions = {},
): string[] {
  const nextAccordion: string[] = [];

  if ((options.verseNumber ?? null) !== null) {
    nextAccordion.push("cross-refs");
  }

  if (options.concordanceData) {
    const matchedKey = resolveConcordanceKey(
      options.concordanceData,
      rawWord,
    );
    const references = matchedKey
      ? decodeConcordanceReferences(options.concordanceData, matchedKey)
      : [];
    if (references.length > 0) {
      nextAccordion.push("concordance");
    }
  }

  if (
    options.webstersData &&
    resolveWebstersKey(options.webstersData, rawWord)
  ) {
    nextAccordion.push("websters");
  }

  if (
    options.aiDictionaryData &&
    (options.aiDictionarySelection ||
      resolveAIDictionaryKey(options.aiDictionaryData, rawWord))
  ) {
    nextAccordion.push("ai-dictionary");
  }

  if (
    options.bibleWordBookData &&
    resolveBibleWordBookKey(options.bibleWordBookData, rawWord)
  ) {
    nextAccordion.push("bible-word-book");
  }

  const strongsGreekData = options.strongsGreekData;
  const strongsHebrewData = options.strongsHebrewData;
  if (strongsGreekData && strongsHebrewData) {
    const hasStrongsEntry = (options.strongCodes ?? []).some((strongCode) => {
      const source = strongCode.startsWith("G")
        ? strongsGreekData
        : strongsHebrewData;
      return Boolean(source[strongCode]);
    });
    if (hasStrongsEntry) {
      nextAccordion.push("strongs");
    }
  }

  const referenceKey =
    (options.verseNumber ?? null) !== null
      ? chapterVerseKey(options.bookIndex ?? 0, options.chapterIndex ?? 0, options.verseNumber ?? 1)
      : null;
  const context = resolvePersonPlaceContext(rawWord, referenceKey, options.strongCodes, options.verseTokens, options.tokenIndex);
  const people = findGenealogyMatches(options.genealogyData, rawWord, referenceKey, context, options);
  if (findMapMatches(options.ancientMapsData, rawWord, context, people).some(entry => !entry.selectionNote)) {
    nextAccordion.push("maps");
  }

  if (
    options.hitchcocksData &&
    resolveHitchcocksKey(options.hitchcocksData, rawWord)
  ) {
    nextAccordion.push("hitchcocks");
  }

  if (
    (options.oldEnglishData &&
      resolveOldEnglishKey(options.oldEnglishData, rawWord)) ||
    options.phraseSelection ||
    (options.unitsData && resolveUnitsKey(options.unitsData, rawWord))
  ) {
    nextAccordion.push("kjv-words-phrases");
  }

  if (people.length > 0) {
    nextAccordion.push("genealogy");
  }

  return nextAccordion;
}
