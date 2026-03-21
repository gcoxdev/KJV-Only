import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT_PATH = path.resolve("public/topics/topic-scores.txt");
const OUTPUT_PATH = path.resolve("public/topics/topics-index.json");

const BOOK_CODE_MAP = new Map([
  ["Gen", "GEN"],
  ["Exod", "EXO"],
  ["Lev", "LEV"],
  ["Num", "NUM"],
  ["Deut", "DEU"],
  ["Josh", "JOS"],
  ["Judg", "JDG"],
  ["Ruth", "RUT"],
  ["1Sam", "1SA"],
  ["2Sam", "2SA"],
  ["1Kgs", "1KI"],
  ["2Kgs", "2KI"],
  ["1Chr", "1CH"],
  ["2Chr", "2CH"],
  ["Ezra", "EZR"],
  ["Neh", "NEH"],
  ["Esth", "EST"],
  ["Job", "JOB"],
  ["Ps", "PSA"],
  ["Prov", "PRO"],
  ["Eccl", "ECC"],
  ["Song", "SNG"],
  ["Isa", "ISA"],
  ["Jer", "JER"],
  ["Lam", "LAM"],
  ["Ezek", "EZK"],
  ["Dan", "DAN"],
  ["Hos", "HOS"],
  ["Joel", "JOL"],
  ["Amos", "AMO"],
  ["Obad", "OBA"],
  ["Jonah", "JON"],
  ["Mic", "MIC"],
  ["Nah", "NAM"],
  ["Hab", "HAB"],
  ["Zeph", "ZEP"],
  ["Hag", "HAG"],
  ["Zech", "ZEC"],
  ["Mal", "MAL"],
  ["Matt", "MAT"],
  ["Mark", "MRK"],
  ["Luke", "LUK"],
  ["John", "JHN"],
  ["Acts", "ACT"],
  ["Rom", "ROM"],
  ["1Cor", "1CO"],
  ["2Cor", "2CO"],
  ["Gal", "GAL"],
  ["Eph", "EPH"],
  ["Phil", "PHP"],
  ["Col", "COL"],
  ["1Thess", "1TH"],
  ["2Thess", "2TH"],
  ["1Tim", "1TI"],
  ["2Tim", "2TI"],
  ["Titus", "TIT"],
  ["Phlm", "PHM"],
  ["Heb", "HEB"],
  ["Jas", "JAS"],
  ["1Pet", "1PE"],
  ["2Pet", "2PE"],
  ["1John", "1JN"],
  ["2John", "2JN"],
  ["3John", "3JN"],
  ["Jude", "JUD"],
  ["Rev", "REV"],
]);

function parseOsisEndpoint(value) {
  const match = value.match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }

  const [, rawBook, chapter, verse] = match;
  const bookCode = BOOK_CODE_MAP.get(rawBook);
  if (!bookCode) {
    return null;
  }

  return {
    bookCode,
    chapter: Number.parseInt(chapter, 10),
    verse: Number.parseInt(verse, 10),
  };
}

function convertOsisToStandardReference(osis) {
  const [startRaw, endRaw] = osis.split("-");
  const start = parseOsisEndpoint(startRaw);
  if (!start) {
    return null;
  }

  if (!endRaw) {
    return `${start.bookCode}.${start.chapter}.${start.verse}`;
  }

  const end = parseOsisEndpoint(endRaw);
  if (!end || start.bookCode !== end.bookCode) {
    return null;
  }

  if (start.chapter === end.chapter) {
    return `${start.bookCode}.${start.chapter}.${start.verse}-${end.verse}`;
  }

  return `${start.bookCode}.${start.chapter}.${start.verse}-${end.chapter}.${end.verse}`;
}

function compareTopic(left, right) {
  return left.localeCompare(right);
}

async function main() {
  const input = await readFile(INPUT_PATH, "utf8");

  const grouped = new Map();
  const rows = input
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split("\t"))
    .filter((parts) => parts.length >= 3);

  for (const [rawTopic, osis] of rows) {
    const topic = rawTopic.trim().toLowerCase();
    const reference = convertOsisToStandardReference(osis.trim());
    if (!reference) {
      continue;
    }

    const references = grouped.get(topic) ?? [];
    if (!references.includes(reference)) {
      references.push(reference);
    }
    grouped.set(topic, references);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: "OpenBible topic-scores.txt",
    topics: Array.from(grouped.entries())
      .sort(([left], [right]) => compareTopic(left, right))
      .map(([topic, references]) => ({
        topic,
        references,
      })),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
