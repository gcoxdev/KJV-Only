#!/usr/bin/env node

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_INPUT = "public/references/concordance.json";
const DEFAULT_COMPACT = "public/references/concordance.compact.json";
const DEFAULT_NESTED = "public/references/concordance.nested.json";
const DEFAULT_COMPACT_MIN = "public/references/concordance.compact.min.json";
const DEFAULT_NESTED_MIN = "public/references/concordance.nested.min.json";
const DEFAULT_COMPACT_DELTA_MIN =
  "public/references/concordance.compact.delta.min.json";
const DEFAULT_REPORT = "public/references/concordance.build-report.json";
const FALLBACK_INPUT = "public/delete/public/references/concordance.json";

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    compact: DEFAULT_COMPACT,
    nested: DEFAULT_NESTED,
    compactMin: DEFAULT_COMPACT_MIN,
    nestedMin: DEFAULT_NESTED_MIN,
    compactDeltaMin: DEFAULT_COMPACT_DELTA_MIN,
    report: DEFAULT_REPORT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--input":
        options.input = argv[++index];
        break;
      case "--compact":
        options.compact = argv[++index];
        break;
      case "--nested":
        options.nested = argv[++index];
        break;
      case "--compact-min":
        options.compactMin = argv[++index];
        break;
      case "--nested-min":
        options.nestedMin = argv[++index];
        break;
      case "--compact-delta-min":
        options.compactDeltaMin = argv[++index];
        break;
      case "--report":
        options.report = argv[++index];
        break;
      case "--help":
        printUsage();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printUsage() {
  console.log(`Usage: node scripts/build-concordance-variants.mjs [options]

Builds two alternative concordance formats from the current concordance file.

Options:
  --input <path>    Input concordance JSON (default: ${DEFAULT_INPUT})
  --compact <path>  Output compact dictionary format (default: ${DEFAULT_COMPACT})
  --nested <path>   Output nested word/book/chapter format (default: ${DEFAULT_NESTED})
  --compact-min <path>       Output minified compact format (default: ${DEFAULT_COMPACT_MIN})
  --nested-min <path>        Output minified nested format (default: ${DEFAULT_NESTED_MIN})
  --compact-delta-min <path> Output minified delta compact format (default: ${DEFAULT_COMPACT_DELTA_MIN})
  --report <path>   Output comparison report (default: ${DEFAULT_REPORT})
`);
}

function ensureDir(filePath) {
  return fs.mkdir(path.dirname(filePath), { recursive: true });
}

function parseReference(reference) {
  const match = reference.match(/^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    book: match[1],
    chapter: match[2],
    verse: Number.parseInt(match[3], 10),
  };
}

function buildCompactPayload(concordance) {
  const verseSet = new Set();
  for (const refs of Object.values(concordance)) {
    for (const ref of refs) {
      verseSet.add(ref);
    }
  }

  const verses = [...verseSet].sort((left, right) => left.localeCompare(right));
  const verseIndex = new Map(verses.map((ref, index) => [ref, index]));
  const words = {};

  for (const [word, refs] of Object.entries(concordance)) {
    words[word] = refs.map((ref) => verseIndex.get(ref));
  }

  return { verses, words };
}

function buildNestedPayload(concordance) {
  const words = {};

  for (const [word, refs] of Object.entries(concordance)) {
    const byBook = {};

    for (const ref of refs) {
      const parsed = parseReference(ref);
      if (!parsed) {
        continue;
      }

      if (!byBook[parsed.book]) {
        byBook[parsed.book] = {};
      }

      if (!byBook[parsed.book][parsed.chapter]) {
        byBook[parsed.book][parsed.chapter] = [];
      }

      byBook[parsed.book][parsed.chapter].push(parsed.verse);
    }

    words[word] = byBook;
  }

  return words;
}

function deltaEncode(values) {
  if (values.length === 0) {
    return [];
  }

  const encoded = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    encoded.push(values[index] - values[index - 1]);
  }
  return encoded;
}

function buildCompactDeltaPayload(compactPayload) {
  const words = {};

  for (const [word, indexes] of Object.entries(compactPayload.words)) {
    const sorted = [...indexes].sort((left, right) => left - right);
    words[word] = deltaEncode(sorted);
  }

  return {
    verses: compactPayload.verses,
    words,
  };
}

function computeNestedStats(nestedPayload) {
  let bookBuckets = 0;
  let chapterBuckets = 0;
  let verseEntries = 0;

  for (const byBook of Object.values(nestedPayload)) {
    bookBuckets += Object.keys(byBook).length;
    for (const versesByChapter of Object.values(byBook)) {
      chapterBuckets += Object.keys(versesByChapter).length;
      for (const verses of Object.values(versesByChapter)) {
        verseEntries += verses.length;
      }
    }
  }

  return { bookBuckets, chapterBuckets, verseEntries };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.input === DEFAULT_INPUT && !existsSync(options.input) && existsSync(FALLBACK_INPUT)) {
    options.input = FALLBACK_INPUT;
  }
  const rawText = await fs.readFile(options.input, "utf8");
  const concordance = JSON.parse(rawText);

  const compactPayload = buildCompactPayload(concordance);
  const nestedPayload = buildNestedPayload(concordance);
  const compactDeltaPayload = buildCompactDeltaPayload(compactPayload);

  const compactText = `${JSON.stringify(compactPayload, null, 2)}\n`;
  const nestedText = `${JSON.stringify(nestedPayload, null, 2)}\n`;
  const compactMinText = JSON.stringify(compactPayload);
  const nestedMinText = JSON.stringify(nestedPayload);
  const compactDeltaMinText = JSON.stringify(compactDeltaPayload);

  await Promise.all([
    ensureDir(options.compact),
    ensureDir(options.nested),
    ensureDir(options.compactMin),
    ensureDir(options.nestedMin),
    ensureDir(options.compactDeltaMin),
    ensureDir(options.report),
  ]);

  await Promise.all([
    fs.writeFile(options.compact, compactText, "utf8"),
    fs.writeFile(options.nested, nestedText, "utf8"),
    fs.writeFile(options.compactMin, compactMinText, "utf8"),
    fs.writeFile(options.nestedMin, nestedMinText, "utf8"),
    fs.writeFile(options.compactDeltaMin, compactDeltaMinText, "utf8"),
  ]);

  const [
    sourceStat,
    compactStat,
    nestedStat,
    compactMinStat,
    nestedMinStat,
    compactDeltaMinStat,
  ] = await Promise.all([
    fs.stat(options.input),
    fs.stat(options.compact),
    fs.stat(options.nested),
    fs.stat(options.compactMin),
    fs.stat(options.nestedMin),
    fs.stat(options.compactDeltaMin),
  ]);

  const report = {
    input: {
      path: options.input,
      bytes: sourceStat.size,
      wordCount: Object.keys(concordance).length,
    },
    compact: {
      path: options.compact,
      bytes: compactStat.size,
      bytesSaved: sourceStat.size - compactStat.size,
      versesCount: compactPayload.verses.length,
      wordsCount: Object.keys(compactPayload.words).length,
      sample: {
        word: "Abana",
        value: compactPayload.words.Abana ?? null,
      },
    },
    compactMin: {
      path: options.compactMin,
      bytes: compactMinStat.size,
      bytesSaved: sourceStat.size - compactMinStat.size,
    },
    compactDeltaMin: {
      path: options.compactDeltaMin,
      bytes: compactDeltaMinStat.size,
      bytesSaved: sourceStat.size - compactDeltaMinStat.size,
      sample: {
        word: "Abana",
        value: compactDeltaPayload.words.Abana ?? null,
      },
    },
    nested: {
      path: options.nested,
      bytes: nestedStat.size,
      bytesSaved: sourceStat.size - nestedStat.size,
      wordsCount: Object.keys(nestedPayload).length,
      ...computeNestedStats(nestedPayload),
      sample: {
        word: "Abana",
        value: nestedPayload.Abana ?? null,
      },
    },
    nestedMin: {
      path: options.nestedMin,
      bytes: nestedMinStat.size,
      bytesSaved: sourceStat.size - nestedMinStat.size,
    },
  };

  await fs.writeFile(options.report, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
