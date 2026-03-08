import type {
  ConcordancePayload,
  HitchcocksPayload,
  OldEnglishPayload,
  WebstersPayload,
} from "@/types/reader";

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

export function normalizeConcordanceWord(input: string) {
  return input.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
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
    if (concordance[candidate]) {
      return candidate;
    }
  }

  return null;
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

export function normalizeStrongsCode(value: string) {
  const match = value.toUpperCase().match(/([GH])\s*0*([0-9]{1,4})/);
  if (!match) {
    return null;
  }
  const [, prefix, numeric] = match;
  return `${prefix}${numeric.padStart(4, "0")}`;
}

export function parseBibleReference(reference: string) {
  const chapterSpanMatch = reference.match(
    /^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+):(\d+)\.(\d+)$/,
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
