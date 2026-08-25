#!/usr/bin/env -S node --experimental-strip-types

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { parseBooks } from "../src/lib/bible-payload.ts";
import { augmentConcordanceWithNormalizedWordForms } from "../src/lib/concordance-enrichment.ts";
import {
  decodeGenealogyPayload,
  enrichGenealogyPayload,
  GENEALOGY_ENRICHMENT_VERSION,
} from "../src/lib/genealogy.ts";
import { encodeGenealogyPayload } from "../src/lib/genealogy-compact.ts";
import type {
  ConcordancePayload,
  GenealogyCompactPayload,
} from "../src/types/reader.ts";

const CORPUS_PATH = path.resolve("public/data/kjv.json");
const CONCORDANCE_PATH = path.resolve(
  "public/references/concordance.compact.delta.min.json",
);
const GENEALOGY_PATH = path.resolve(
  "public/references/genealogy.compact.min.json",
);

type BuildOptions = {
  concordance: boolean;
  genealogy: boolean;
  dryRun: boolean;
};

function parseArgs(args: string[]): BuildOptions {
  const selectedConcordance = args.includes("--concordance");
  const selectedGenealogy = args.includes("--genealogy");
  const knownArgs = new Set(["--concordance", "--genealogy", "--dry-run"]);
  const unknownArg = args.find((arg) => !knownArgs.has(arg));
  if (unknownArg) {
    throw new Error(`Unknown argument: ${unknownArg}`);
  }

  return {
    concordance:
      selectedConcordance || (!selectedConcordance && !selectedGenealogy),
    genealogy:
      selectedGenealogy || (!selectedConcordance && !selectedGenealogy),
    dryRun: args.includes("--dry-run"),
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeJsonAtomically(filePath: string, value: unknown) {
  const temporaryPath = `${filePath}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(value), "utf8");
  await fs.rename(temporaryPath, filePath);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const corpusPayload = await readJson<unknown>(CORPUS_PATH);
  const books = parseBooks(corpusPayload);
  if (!books || books.length === 0) {
    throw new Error(`Invalid Bible corpus in ${path.relative(process.cwd(), CORPUS_PATH)}`);
  }

  if (options.concordance) {
    const concordance = await readJson<ConcordancePayload>(CONCORDANCE_PATH);
    const startedAt = performance.now();
    const enriched = augmentConcordanceWithNormalizedWordForms(
      concordance,
      books,
    );
    const durationMs = performance.now() - startedAt;
    const changedWordCount = Object.keys(enriched.words).filter(
      (word) =>
        !concordance.words[word] ||
        concordance.words[word].some(
          (value, index) => value !== enriched.words[word]?.[index],
        ) ||
        concordance.words[word].length !== enriched.words[word]?.length,
    ).length;

    if (!options.dryRun && enriched !== concordance) {
      await writeJsonAtomically(CONCORDANCE_PATH, enriched);
    }
    console.log(
      `Concordance: ${durationMs.toFixed(1)}ms runtime-equivalent scan; ${changedWordCount} changed word(s)${options.dryRun ? " (dry run)" : ""}`,
    );
  }

  if (options.genealogy) {
    const compact = await readJson<GenealogyCompactPayload>(GENEALOGY_PATH);
    const decoded = decodeGenealogyPayload(compact);
    const startedAt = performance.now();
    const enriched = compact.x
      ? decoded
      : enrichGenealogyPayload(decoded, books);
    const durationMs = performance.now() - startedAt;
    const encoded = encodeGenealogyPayload(
      enriched,
      GENEALOGY_ENRICHMENT_VERSION,
    );
    const roundTripped = decodeGenealogyPayload(encoded);
    assert.ok(
      isDeepStrictEqual(roundTripped, enriched),
      "Encoded genealogy must preserve the runtime-enriched payload exactly",
    );

    if (!options.dryRun && compact.x !== GENEALOGY_ENRICHMENT_VERSION) {
      await writeJsonAtomically(GENEALOGY_PATH, encoded);
    }
    console.log(
      `Genealogy: ${durationMs.toFixed(1)}ms runtime-equivalent enrichment; ${enriched.length} people; payload equivalence passed${options.dryRun ? " (dry run)" : ""}`,
    );
  }
}

await main();
