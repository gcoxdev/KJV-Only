#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_ANCIENT_PATH = "public/maps/data/ancient.jsonl";
const DEFAULT_MODERN_PATH = "public/maps/data/modern.jsonl";
const DEFAULT_OUTPUT_PATH = "public/maps/data/map.json";
const DEFAULT_REPORT_PATH = "public/maps/data/map.build-report.json";
const DEFAULT_LEGACY_PATH = "public/maps/data/ancient_map.json";

function parseArgs(argv) {
  const options = {
    ancientPath: DEFAULT_ANCIENT_PATH,
    modernPath: DEFAULT_MODERN_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    reportPath: DEFAULT_REPORT_PATH,
    legacyPath: DEFAULT_LEGACY_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--ancient":
        options.ancientPath = argv[++index];
        break;
      case "--modern":
        options.modernPath = argv[++index];
        break;
      case "--output":
        options.outputPath = argv[++index];
        break;
      case "--report":
        options.reportPath = argv[++index];
        break;
      case "--legacy":
        options.legacyPath = argv[++index];
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
  console.log(`Usage: node scripts/build-map-json.mjs [options]

Builds a compact map.json file from the raw maps jsonl sources.

Options:
  --ancient <path>   Ancient jsonl input (default: ${DEFAULT_ANCIENT_PATH})
  --modern <path>    Modern jsonl input (default: ${DEFAULT_MODERN_PATH})
  --output <path>    Output JSON path (default: ${DEFAULT_OUTPUT_PATH})
  --report <path>    Build report path (default: ${DEFAULT_REPORT_PATH})
  --legacy <path>    Existing derived file for size comparison (default: ${DEFAULT_LEGACY_PATH})
  --help             Show this message
`);
}

function parseJsonl(text) {
  return text
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function dedupeStrings(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function cleanMarkup(input) {
  return input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function toCompactVerseReference(verse) {
  if (typeof verse?.usx === "string") {
    return verse.usx.replace(/\s+/g, ".").replace(":", ".");
  }
  if (typeof verse?.osis === "string") {
    return verse.osis
      .replace(/^([1-3]?[A-Za-z]+)\./, (_, bookCode) => `${normalizeBookCode(bookCode)}.`)
      .replace(/\./g, ".");
  }
  return null;
}

function normalizeBookCode(bookCode) {
  const upper = bookCode.toUpperCase();
  const map = {
    "1KGS": "1KI",
    "2KGS": "2KI",
    "1CHR": "1CH",
    "2CHR": "2CH",
    JOSH: "JOS",
    JUDG: "JDG",
    PS: "PSA",
    PROV: "PRO",
    ECCL: "ECC",
    ISA: "ISA",
    JER: "JER",
    EZEK: "EZK",
    HOS: "HOS",
    JOEL: "JOL",
    OBAD: "OBA",
    JONAH: "JON",
    MICAH: "MIC",
    NAH: "NAM",
    HAB: "HAB",
    ZEPH: "ZEP",
    HAG: "HAG",
    ZECH: "ZEC",
    MAL: "MAL",
    MATT: "MAT",
    MARK: "MRK",
    LUKE: "LUK",
    JOHN: "JHN",
    ACTS: "ACT",
    ROM: "ROM",
    "1COR": "1CO",
    "2COR": "2CO",
    GAL: "GAL",
    EPH: "EPH",
    PHIL: "PHP",
    COL: "COL",
    "1THESS": "1TH",
    "2THESS": "2TH",
    "1TIM": "1TI",
    "2TIM": "2TI",
    TITUS: "TIT",
    PHLM: "PHM",
    HEB: "HEB",
    JAS: "JAS",
    "1PET": "1PE",
    "2PET": "2PE",
    "1JOHN": "1JN",
    "2JOHN": "2JN",
    "3JOHN": "3JN",
    JUDE: "JUD",
    REV: "REV",
  };

  return map[upper] ?? upper.slice(0, 3);
}

function modernNamesForId(modernEntry) {
  if (!modernEntry) {
    return [];
  }

  const modernOnly = (modernEntry.names ?? []).filter((name) => name.type === "modern");
  const names = modernOnly.length > 0 ? modernOnly : (modernEntry.names ?? []);
  return dedupeStrings(names.map((name) => name.name));
}

function modernIdsForAncient(ancientEntry) {
  const ids = new Set(Object.keys(ancientEntry.modern_associations ?? {}));

  for (const identification of ancientEntry.identifications ?? []) {
    for (const resolution of identification.resolutions ?? []) {
      if (resolution.modern_basis_id) {
        ids.add(resolution.modern_basis_id);
      }
    }
  }

  return [...ids];
}

function buildModernNames(ancientEntry, modernById) {
  const names = [];
  const modernIds = modernIdsForAncient(ancientEntry);

  for (const modernId of modernIds) {
    names.push(...modernNamesForId(modernById.get(modernId)));
    const assocName = ancientEntry.modern_associations?.[modernId]?.name;
    if (assocName) {
      names.push(assocName);
    }
  }

  for (const identification of ancientEntry.identifications ?? []) {
    const cleaned = cleanMarkup(identification.description ?? "");
    if (cleaned) {
      names.push(cleaned);
    }
  }

  return dedupeStrings(names);
}

function buildTranslations(ancientEntry) {
  const translationCounts = Object.entries(ancientEntry.translation_name_counts ?? {});
  translationCounts.sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }
    return left[0].localeCompare(right[0]);
  });

  return translationCounts.map(([name]) => name);
}

async function safeStat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [ancientText, modernText] = await Promise.all([
    fs.readFile(options.ancientPath, "utf8"),
    fs.readFile(options.modernPath, "utf8"),
  ]);

  const ancientEntries = parseJsonl(ancientText);
  const modernEntries = parseJsonl(modernText);
  const modernById = new Map(modernEntries.map((entry) => [entry.id, entry]));

  const compactEntries = ancientEntries
    .filter(
      (entry) =>
        Boolean(entry.geojson_file) &&
        Boolean(entry.translation_name_counts) &&
        Boolean(entry.verses),
    )
    .map((entry) => ({
      geojson_file: entry.geojson_file,
      translations: buildTranslations(entry),
      types: dedupeStrings(entry.types ?? []),
      verses: dedupeStrings(
        (entry.verses ?? [])
          .map((verse) => toCompactVerseReference(verse))
          .filter(Boolean),
      ),
      modern_names: buildModernNames(entry, modernById),
    }))
    .map((entry) => ({
      ...entry,
      modern_names: entry.modern_names.sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.translations[0].localeCompare(right.translations[0]));

  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
  await fs.mkdir(path.dirname(options.reportPath), { recursive: true });

  const outputText = `${JSON.stringify(compactEntries, null, 2)}\n`;
  await fs.writeFile(options.outputPath, outputText, "utf8");

  const [outputStat, legacyStat] = await Promise.all([
    safeStat(options.outputPath),
    safeStat(options.legacyPath),
  ]);

  const report = {
    counts: {
      ancientEntries: ancientEntries.length,
      modernEntries: modernEntries.length,
      compactEntries: compactEntries.length,
    },
    size: {
      outputBytes: outputStat?.size ?? null,
      legacyBytes: legacyStat?.size ?? null,
      bytesSaved:
        legacyStat && outputStat ? legacyStat.size - outputStat.size : null,
    },
    sample: compactEntries[0] ?? null,
  };

  await fs.writeFile(`${options.reportPath}`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
