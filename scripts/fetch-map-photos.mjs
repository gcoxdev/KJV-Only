#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_CANDIDATES_PATH = "public/maps/missing-photo-fetch-candidates.json";
const DEFAULT_IMAGES_PATH = "public/maps/data/image.jsonl";
const DEFAULT_OUTPUT_DIR = "public/maps/thumbnails";
const DEFAULT_WIDTH = 1024;

function parseArgs(argv) {
  const options = {
    candidatesPath: DEFAULT_CANDIDATES_PATH,
    imagesPath: DEFAULT_IMAGES_PATH,
    outputDir: DEFAULT_OUTPUT_DIR,
    width: DEFAULT_WIDTH,
    dryRun: false,
    limit: null,
    ids: null,
    overwrite: false,
    updateMetadataOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--candidates":
        options.candidatesPath = argv[++index];
        break;
      case "--images":
        options.imagesPath = argv[++index];
        break;
      case "--output-dir":
        options.outputDir = argv[++index];
        break;
      case "--width":
        options.width = Number.parseInt(argv[++index] ?? "", 10);
        break;
      case "--limit":
        options.limit = Number.parseInt(argv[++index] ?? "", 10);
        break;
      case "--ids":
        options.ids = new Set(
          (argv[++index] ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        );
        break;
      case "--overwrite":
        options.overwrite = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--update-metadata-only":
        options.updateMetadataOnly = true;
        break;
      case "--help":
        printUsage();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.width) || options.width < 64) {
    throw new Error("--width must be a number >= 64");
  }

  if (options.limit !== null && (!Number.isFinite(options.limit) || options.limit < 1)) {
    throw new Error("--limit must be a number >= 1");
  }

  return options;
}

function printUsage() {
  console.log(`Usage: node scripts/fetch-map-photos.mjs [options]

Downloads missing Wikimedia map photos into the local thumbnails directory and
backfills public/maps/data/image.jsonl with thumbnail file metadata.

Options:
  --candidates <path>      Candidate JSON file (default: ${DEFAULT_CANDIDATES_PATH})
  --images <path>          image.jsonl path (default: ${DEFAULT_IMAGES_PATH})
  --output-dir <path>      Output folder for local files (default: ${DEFAULT_OUTPUT_DIR})
  --width <px>             Wikimedia thumbnail width to request (default: ${DEFAULT_WIDTH})
  --limit <n>              Process only the first n candidates
  --ids <id1,id2,...>      Process only specific image ids
  --overwrite              Re-download files even if they already exist
  --dry-run                Show planned work without downloading or writing
  --update-metadata-only   Write missing metadata for already-downloaded files only
  --help                   Show this message
`);
}

function parseJsonl(text) {
  return text
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function stringifyJsonl(items) {
  return `${items.map((item) => JSON.stringify(item)).join("\n")}\n`;
}

function deriveExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const extension = path.extname(pathname).replace(".", "").toLowerCase();
    if (extension === "jpeg") {
      return "jpg";
    }
    if (["jpg", "png", "webp"].includes(extension)) {
      return extension;
    }
  } catch {
    // ignore URL parse failures
  }
  return "jpg";
}

function resolveDownloadUrl(entry, width) {
  if (entry.thumbnail_url_pattern) {
    return entry.thumbnail_url_pattern.replace("####", String(width));
  }
  return entry.file_url ?? null;
}

function ensureThumbnailEntries(entry, extension) {
  const descriptions = entry.descriptions ?? {};
  const thumbnails = { ...(entry.thumbnails ?? {}) };
  let changed = false;

  for (const [locationId, description] of Object.entries(descriptions)) {
    if (thumbnails[locationId]?.file) {
      continue;
    }

    thumbnails[locationId] = {
      ...(thumbnails[locationId] ?? {}),
      file: `${locationId}.${entry.id}.${extension}`,
      description,
    };
    changed = true;
  }

  return {
    changed,
    thumbnails,
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "kjv-only-map-photo-fetcher/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [candidateText, imageText] = await Promise.all([
    fs.readFile(options.candidatesPath, "utf8"),
    fs.readFile(options.imagesPath, "utf8"),
  ]);

  const candidatePayload = JSON.parse(candidateText);
  const candidates = (candidatePayload.candidates ?? []).filter((candidate) =>
    options.ids ? options.ids.has(candidate.id) : true,
  );
  const limitedCandidates =
    options.limit === null ? candidates : candidates.slice(0, options.limit);

  const imageEntries = parseJsonl(imageText);
  const imageIndex = new Map(imageEntries.map((entry, index) => [entry.id, { entry, index }]));

  await fs.mkdir(options.outputDir, { recursive: true });

  const report = {
    width: options.width,
    processedCandidates: 0,
    downloadedFiles: [],
    skippedExistingFiles: [],
    updatedMetadataIds: [],
    missingEntries: [],
    missingDownloadUrls: [],
    errors: [],
  };

  for (const candidate of limitedCandidates) {
    report.processedCandidates += 1;
    const indexed = imageIndex.get(candidate.id);
    if (!indexed) {
      report.missingEntries.push(candidate.id);
      continue;
    }

    const entry = indexed.entry;
    const downloadUrl = resolveDownloadUrl(entry, options.width);
    if (!downloadUrl) {
      report.missingDownloadUrls.push(candidate.id);
      continue;
    }

    const extension = deriveExtension(downloadUrl);
    const ensured = ensureThumbnailEntries(entry, extension);
    if (ensured.changed) {
      indexed.entry.thumbnails = ensured.thumbnails;
      report.updatedMetadataIds.push(candidate.id);
    }

    if (options.updateMetadataOnly) {
      continue;
    }

    const targets = Object.values(indexed.entry.thumbnails ?? {})
      .map((thumbnail) => thumbnail.file)
      .filter(Boolean)
      .map((file) => path.join(options.outputDir, file));

    if (targets.length === 0) {
      report.errors.push({
        id: candidate.id,
        message: "No thumbnail targets were derived from descriptions",
      });
      continue;
    }

    const existingFlags = await Promise.all(targets.map((target) => fileExists(target)));
    const needsDownload = options.overwrite || existingFlags.some((exists) => !exists);

    if (!needsDownload) {
      report.skippedExistingFiles.push(...targets);
      continue;
    }

    if (options.dryRun) {
      report.downloadedFiles.push(...targets.map((target) => `${target} <- ${downloadUrl}`));
      continue;
    }

    try {
      const buffer = await fetchBuffer(downloadUrl);
      await Promise.all(
        targets.map((target) => fs.writeFile(target, buffer)),
      );
      report.downloadedFiles.push(...targets);
    } catch (error) {
      report.errors.push({
        id: candidate.id,
        url: downloadUrl,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (!options.dryRun) {
    await fs.writeFile(options.imagesPath, stringifyJsonl(imageEntries), "utf8");
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
