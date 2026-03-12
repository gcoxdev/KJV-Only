import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("public/references/genealogy.json");
const outputPath = path.resolve("public/references/genealogy.compact.min.json");
const reportPath = path.resolve("public/references/genealogy.build-report.json");
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
  "SON",
  "ISA",
  "JER",
  "LAM",
  "EZE",
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
  "MAR",
  "MRK",
  "LUK",
  "JHN",
  "JOH",
  "ACT",
  "ROM",
  "1CO",
  "2CO",
  "GAL",
  "EPH",
  "PHP",
  "PHI",
  "COL",
  "1TH",
  "2TH",
  "1TI",
  "2TI",
  "TIT",
  "PHM",
  "HEB",
  "JAS",
  "JAM",
  "1PE",
  "2PE",
  "1JN",
  "2JN",
  "3JN",
  "JUD",
  "REV",
];
const BOOK_ORDER_INDEX = new Map(BOOK_ORDER.map((book, index) => [book, index]));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value));
}

function deltaEncode(values) {
  return values.map((value, index) => (index === 0 ? value : value - values[index - 1]));
}

function trimTrailingEmpty(values) {
  let index = values.length;
  while (index > 0) {
    const value = values[index - 1];
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    if (
      value === "" ||
      value === 0 ||
      value === -1 ||
      value == null ||
      isEmptyArray
    ) {
      index -= 1;
      continue;
    }
    break;
  }
  return values.slice(0, index);
}

function parseReference(reference) {
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

function compareReferences(left, right) {
  const parsedLeft = parseReference(left);
  const parsedRight = parseReference(right);

  if (!parsedLeft || !parsedRight) {
    return left.localeCompare(right);
  }

  const leftBookOrder = BOOK_ORDER_INDEX.get(parsedLeft.book) ?? Number.MAX_SAFE_INTEGER;
  const rightBookOrder = BOOK_ORDER_INDEX.get(parsedRight.book) ?? Number.MAX_SAFE_INTEGER;

  if (leftBookOrder !== rightBookOrder) {
    return leftBookOrder - rightBookOrder;
  }

  if (parsedLeft.chapter !== parsedRight.chapter) {
    return parsedLeft.chapter - parsedRight.chapter;
  }

  if (parsedLeft.verse !== parsedRight.verse) {
    return parsedLeft.verse - parsedRight.verse;
  }

  return left.localeCompare(right);
}

const input = readJson(inputPath);

const nameIndexes = new Map();
const names = [];

function getNameIndex(name) {
  const existing = nameIndexes.get(name);
  if (existing != null) {
    return existing;
  }
  const next = names.length;
  names.push(name);
  nameIndexes.set(name, next);
  return next;
}

const verseSet = new Set();
for (const person of input) {
  for (const entry of person.verses?.byName ?? []) {
    for (const reference of entry.verses ?? []) {
      verseSet.add(reference);
    }
  }
  for (const relation of person.spouses ?? []) {
    if (relation.verse) {
      verseSet.add(relation.verse);
    }
  }
  for (const relation of person.siblings ?? []) {
    if (relation.verse) {
      verseSet.add(relation.verse);
    }
  }
  for (const relation of person.children ?? []) {
    if (relation.verse) {
      verseSet.add(relation.verse);
    }
  }
}

const verses = [...verseSet].sort(compareReferences);
const verseIndexes = new Map(verses.map((verse, index) => [verse, index]));

function getVerseIndex(verse) {
  const index = verseIndexes.get(verse);
  if (index == null) {
    throw new Error(`Missing verse index for ${verse}`);
  }
  return index;
}

const compact = {
  v: verses,
  w: names,
  p: input.map((person) =>
    trimTrailingEmpty([
      person.id,
      (person.names ?? []).map(getNameIndex),
      person.gender ?? "",
      person.verses
        ? trimTrailingEmpty([
            (person.verses.byName ?? []).map((entry) => {
              const refs = [...(entry.verses ?? [])].sort(compareReferences).map(getVerseIndex);
              return trimTrailingEmpty([
                getNameIndex(entry.name),
                deltaEncode(refs),
                entry.numOccurrences ?? 0,
                entry.numVerses ?? 0,
              ]);
            }),
            person.verses.totalOccurrences ?? 0,
            person.verses.totalVerses ?? 0,
            person.verses.first ? getVerseIndex(person.verses.first) : -1,
          ])
        : 0,
      person.father?.id ?? "",
      person.mother?.id ?? "",
      (person.spouses ?? []).map((relation) =>
        trimTrailingEmpty([
          relation.id,
          relation.verse ? getVerseIndex(relation.verse) : -1,
        ]),
      ),
      (person.siblings ?? []).map((relation) =>
        trimTrailingEmpty([
          relation.id,
          relation.verse ? getVerseIndex(relation.verse) : -1,
        ]),
      ),
      (person.children ?? []).map((relation) =>
        trimTrailingEmpty([
          relation.id,
          relation.verse ? getVerseIndex(relation.verse) : -1,
        ]),
      ),
    ]),
  ),
};

writeJson(outputPath, compact);

const outputSize = fs.statSync(outputPath).size;
const inputSize = fs.statSync(inputPath).size;

writeJson(reportPath, {
  inputPath: path.relative(process.cwd(), inputPath),
  outputPath: path.relative(process.cwd(), outputPath),
  inputSize,
  outputSize,
  savedBytes: inputSize - outputSize,
  personCount: input.length,
  verseCount: verses.length,
  nameCount: names.length,
});
