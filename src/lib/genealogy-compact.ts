import type {
  GenealogyCompactPayload,
  GenealogyPayload,
} from "../types/reader.ts";

const BOOK_ORDER = [
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

const BOOK_ORDER_INDEX = new Map(
  BOOK_ORDER.map((book, index) => [book, index]),
);

function deltaEncode(values: number[]) {
  return values.map((value, index) =>
    index === 0 ? value : value - values[index - 1],
  );
}

function trimTrailingEmpty(values: unknown[]) {
  let index = values.length;
  while (index > 0) {
    const value = values[index - 1];
    if (
      value === "" ||
      value === 0 ||
      value === -1 ||
      value == null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      index -= 1;
      continue;
    }
    break;
  }
  return values.slice(0, index);
}

function parseReference(reference: string) {
  const match = reference.match(/^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    book: match[1],
    chapter: Number.parseInt(match[2], 10),
    verse: Number.parseInt(match[3], 10),
  };
}

function compareReferences(left: string, right: string) {
  const parsedLeft = parseReference(left);
  const parsedRight = parseReference(right);
  if (!parsedLeft || !parsedRight) {
    return left.localeCompare(right);
  }

  const leftBookOrder =
    BOOK_ORDER_INDEX.get(parsedLeft.book as (typeof BOOK_ORDER)[number]) ??
    Number.MAX_SAFE_INTEGER;
  const rightBookOrder =
    BOOK_ORDER_INDEX.get(parsedRight.book as (typeof BOOK_ORDER)[number]) ??
    Number.MAX_SAFE_INTEGER;
  return (
    leftBookOrder - rightBookOrder ||
    parsedLeft.chapter - parsedRight.chapter ||
    parsedLeft.verse - parsedRight.verse ||
    left.localeCompare(right)
  );
}

export function encodeGenealogyPayload(
  people: GenealogyPayload,
  enrichmentVersion?: string,
): GenealogyCompactPayload {
  const nameIndexes = new Map<string, number>();
  const names: string[] = [];
  const getNameIndex = (name: string) => {
    const existing = nameIndexes.get(name);
    if (existing != null) {
      return existing;
    }
    const next = names.length;
    names.push(name);
    nameIndexes.set(name, next);
    return next;
  };

  const verseSet = new Set<string>();
  const referencedNames: Record<string, string> = {};
  const undefinedVerseIds: string[] = [];
  for (const person of people) {
    for (const entry of person.verses?.byName ?? []) {
      for (const reference of entry.verses) {
        verseSet.add(reference);
      }
    }
    if (person.verses?.first) {
      verseSet.add(person.verses.first);
    }
    if ("verses" in person && person.verses === undefined) {
      undefinedVerseIds.push(person.id);
    }
    for (const parent of [person.father, person.mother]) {
      if (parent) {
        referencedNames[parent.id] ??= parent.name;
      }
    }
    for (const relation of [
      ...(person.spouses ?? []),
      ...(person.siblings ?? []),
      ...(person.children ?? []),
    ]) {
      if (relation.verse) {
        verseSet.add(relation.verse);
      }
      referencedNames[relation.id] ??= relation.name;
    }
  }

  const verses = [...verseSet].sort(compareReferences);
  const verseIndexes = new Map(
    verses.map((reference, index) => [reference, index]),
  );
  const getVerseIndex = (reference: string) => {
    const index = verseIndexes.get(reference);
    if (index == null) {
      throw new Error(`Missing verse index for ${reference}`);
    }
    return index;
  };

  const compactPeople = people.map((person) =>
    trimTrailingEmpty([
      person.id,
      person.names.map(getNameIndex),
      person.gender ?? "",
      person.verses
        ? [
            (person.verses.byName ?? []).map((entry) =>
              trimTrailingEmpty([
                getNameIndex(entry.name),
                deltaEncode(entry.verses.map(getVerseIndex)),
                entry.numOccurrences ?? 0,
                entry.numVerses ?? 0,
              ]),
            ),
            person.verses.totalOccurrences ?? 0,
            person.verses.totalVerses ?? 0,
            person.verses.first ? getVerseIndex(person.verses.first) : -1,
          ]
        : 0,
      person.father?.id ?? "",
      person.mother?.id ?? "",
      (person.spouses ?? []).map((relation) =>
        [
          relation.id,
          relation.verse ? getVerseIndex(relation.verse) : -1,
        ],
      ),
      (person.siblings ?? []).map((relation) =>
        [
          relation.id,
          relation.verse ? getVerseIndex(relation.verse) : -1,
        ],
      ),
      (person.children ?? []).map((relation) =>
        [
          relation.id,
          relation.verse ? getVerseIndex(relation.verse) : -1,
        ],
      ),
    ]) as GenealogyCompactPayload["p"][number],
  );

  return {
    ...(enrichmentVersion ? { x: enrichmentVersion } : {}),
    ...(Object.keys(referencedNames).length > 0 ? { n: referencedNames } : {}),
    ...(undefinedVerseIds.length > 0 ? { u: undefinedVerseIds } : {}),
    v: verses,
    w: names,
    p: compactPeople,
  };
}
