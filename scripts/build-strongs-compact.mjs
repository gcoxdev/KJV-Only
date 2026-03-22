import fs from "node:fs";
import path from "node:path";

function resolveInputPath(...candidates) {
  const resolved = candidates.map((candidate) => path.resolve(candidate));
  const existing = resolved.find((candidate) => fs.existsSync(candidate));
  if (!existing) {
    throw new Error(`Missing input file. Checked: ${resolved.join(", ")}`);
  }
  return existing;
}

const FILES = [
  {
    input: resolveInputPath(
      "public/references/strongs-greek.json",
      "public/delete/public/references/strongs-greek.json",
    ),
    output: path.resolve("public/references/strongs-greek.compact.min.json"),
    report: path.resolve("public/references/strongs-greek.build-report.json"),
  },
  {
    input: resolveInputPath(
      "public/references/strongs-hebrew.json",
      "public/delete/public/references/strongs-hebrew.json",
    ),
    output: path.resolve("public/references/strongs-hebrew.compact.min.json"),
    report: path.resolve("public/references/strongs-hebrew.build-report.json"),
  },
];

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

for (const file of FILES) {
  const raw = fs.readFileSync(file.input, "utf8");
  const input = JSON.parse(raw);

  const verseIndexes = new Map();
  const verses = [];

  const wordIndexes = new Map();
  const words = [];

  const stringIndexes = new Map();
  const strings = [];

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

  function getWordIndex(word) {
    const existing = wordIndexes.get(word);
    if (existing != null) {
      return existing;
    }
    const next = words.length;
    words.push(word);
    wordIndexes.set(word, next);
    return next;
  }

  function getStringIndex(value) {
    if (!value) {
      return -1;
    }
    const existing = stringIndexes.get(value);
    if (existing != null) {
      return existing;
    }
    const next = strings.length;
    strings.push(value);
    stringIndexes.set(value, next);
    return next;
  }

  const compact = {
    v: verses,
    w: words,
    s: strings,
    e: {},
  };

  for (const [code, entry] of Object.entries(input)) {
    compact.e[code] = trimTrailingEmpty([
      getStringIndex(entry.kjv_def ?? ""),
      getStringIndex(entry.strongs_def ?? ""),
      getStringIndex(entry.lemma ?? ""),
      getStringIndex(entry.translit ?? ""),
      getStringIndex(entry.pron ?? ""),
      getStringIndex(entry.derivation ?? ""),
      entry.kjv_refs
        ? Object.entries(entry.kjv_refs).map(([word, references]) => {
            const refIndexes = references
              .map(getVerseIndex)
              .sort((left, right) => left - right);
            return [getWordIndex(word), deltaEncode(refIndexes)];
          })
        : 0,
    ]);
  }

  fs.writeFileSync(file.output, JSON.stringify(compact));

  const inputSize = fs.statSync(file.input).size;
  const outputSize = fs.statSync(file.output).size;

  fs.writeFileSync(
    file.report,
    JSON.stringify({
      inputPath: path.relative(process.cwd(), file.input),
      outputPath: path.relative(process.cwd(), file.output),
      inputSize,
      outputSize,
      savedBytes: inputSize - outputSize,
      entryCount: Object.keys(input).length,
      verseCount: verses.length,
      wordCount: words.length,
      stringCount: strings.length,
    }),
  );
}
