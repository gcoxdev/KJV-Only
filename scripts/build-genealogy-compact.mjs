import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("public/references/genealogy.json");
const outputPath = path.resolve("public/references/genealogy.compact.min.json");
const reportPath = path.resolve("public/references/genealogy.build-report.json");

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

const input = readJson(inputPath);

const verseIndexes = new Map();
const verses = [];

const nameIndexes = new Map();
const names = [];

function getVerseIndex(verse) {
  const existing = verseIndexes.get(verse);
  if (existing != null) {
    return existing;
  }
  const next = verses.length;
  verses.push(verse);
  verseIndexes.set(verse, next);
  return next;
}

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

const compact = {
  v: verses,
  w: names,
  p: input.map((person) =>
    trimTrailingEmpty([
      person.id,
      (person.names ?? []).map(getNameIndex),
      person.gender ?? "",
      person.notes ?? "",
      person.verses
        ? trimTrailingEmpty([
            (person.verses.byName ?? []).map((entry) => {
              const refs = (entry.verses ?? [])
                .map(getVerseIndex)
                .sort((left, right) => left - right);
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
