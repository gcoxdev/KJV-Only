import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function resolveInputPath(...candidates) {
  const resolved = candidates.map((candidate) => path.resolve(candidate));
  const existing = resolved.find((candidate) => existsSync(candidate));
  if (!existing) {
    throw new Error(`Missing input file. Checked: ${resolved.join(", ")}`);
  }
  return existing;
}

const INPUT_PATH = resolveInputPath(
  "public/topics/topic-scores.txt",
  "public/delete/public/topics/topic-scores.txt",
);
const OUTPUT_PATH = path.resolve("public/topics/daily-scripture-topics.json");
const KEEP_FRACTION = 0.25;
const MAX_REFERENCES_PER_TOPIC = 5;
const TOPIC_ALLOWLIST = [
  "adversity",
  "be strong",
  "being a christian",
  "being a good christian",
  "being a good leader",
  "being a good wife",
  "being a wife",
  "being humble",
  "being strong",
  "believe",
  "believers",
  "believing",
  "building",
  "building each other up",
  "building relationships",
  "building up of others",
  "care",
  "christian attributes",
  "christian character",
  "christian families",
  "christian maturity",
  "christian service",
  "daily christian living",
  "family",
  "family love",
  "family relationships",
  "family unity",
  "forgive",
  "forgiveness",
  "forgiving",
  "forgiving each other",
  "forgiving one another",
  "forgiving others",
  "friend",
  "friends",
  "friends and friendship",
  "friendship",
  "generosity",
  "giving",
  "giving and stewardship",
  "giving back",
  "giving thanks",
  "giving to others",
  "giving to others in need",
  "giving to the needy",
  "giving to the poor",
  "good wife",
  "happiness",
  "happy",
  "hospitality",
  "humble",
  "humbleness",
  "lead by example",
  "leader",
  "leaders",
  "leadership",
  "leading by example",
  "love",
  "love and compassion",
  "love each other",
  "love for one another",
  "love god",
  "love is",
  "love is patient",
  "love of god",
  "love one another",
  "love others",
  "love thy neighbor",
  "loving as jesus loved",
  "man and wife",
  "marital love",
  "marriages",
  "overcome",
  "overcoming",
  "overcoming disappointment",
  "overcoming fear",
  "overcoming rejection",
  "overcoming stress",
  "peace",
  "peace of mind",
  "peacemakers",
  "peacemaking",
  "practical christian living",
  "pray",
  "pray without ceasing",
  "prayer",
  "prayers",
  "praying",
  "praying for each other",
  "praying for others",
  "praying together",
  "respect",
  "respect for others",
  "respecting others",
  "service",
  "service to others",
  "serving",
  "serving one another",
  "serving others",
  "serving the lord",
  "serving the poor",
  "staying strong",
  "strong",
  "trust",
  "trust god",
  "trust in god",
  "trust in the lord",
  "trusting",
  "trusting and believing",
  "trusting god",
  "trusting in god",
  "trusting in the lord",
  "virtuous wife",
];

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

function buildCuratedTopics(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const [rawTopic, osis, rawScore] = row;
    const topic = rawTopic.trim().toLowerCase();
    if (!TOPIC_ALLOWLIST.includes(topic)) {
      continue;
    }

    const reference = convertOsisToStandardReference(osis.trim());
    const score = Number.parseInt(rawScore, 10);
    if (!reference || !Number.isFinite(score)) {
      continue;
    }

    const bucket = grouped.get(topic) ?? [];
    if (!bucket.some((entry) => entry.reference === reference)) {
      bucket.push({ reference, score });
    }
    grouped.set(topic, bucket);
  }

  return TOPIC_ALLOWLIST.map((topic) => {
    const entries = (grouped.get(topic) ?? []).sort(
      (left, right) =>
        right.score - left.score || left.reference.localeCompare(right.reference),
    );
    const keepCount = Math.max(
      1,
      Math.min(MAX_REFERENCES_PER_TOPIC, Math.ceil(entries.length * KEEP_FRACTION)),
    );

    return {
      topic,
      references: entries.slice(0, keepCount).map((entry) => entry.reference),
    };
  }).filter((entry) => entry.references.length > 0);
}

async function main() {
  const input = await readFile(INPUT_PATH, "utf8");
  const rows = input
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split("\t"))
    .filter((parts) => parts.length >= 3);

  const output = {
    generatedAt: new Date().toISOString(),
    source: "OpenBible topic-scores.txt (curated positive-living topics)",
    keepFraction: KEEP_FRACTION,
    topics: buildCuratedTopics(rows),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
