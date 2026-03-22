import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function resolveInputPath(...candidates) {
  const existing = candidates.find((candidate) => existsSync(candidate));
  if (!existing) {
    throw new Error(`Missing input file. Checked: ${candidates.join(", ")}`);
  }
  return existing;
}

const files = [
  {
    input: resolveInputPath(
      path.join(repoRoot, "public/references/strongs-greek.json"),
      path.join(repoRoot, "public/delete/public/references/strongs-greek.json"),
    ),
    label: "greek",
  },
  {
    input: resolveInputPath(
      path.join(repoRoot, "public/references/strongs-hebrew.json"),
      path.join(repoRoot, "public/delete/public/references/strongs-hebrew.json"),
    ),
    label: "hebrew",
  },
];

const STRONGS_REF_PATTERN = /\b([GH])\s*([0-9]{1,4})\b/g;

function normalizeStrongsRef(prefix, digits) {
  return `${prefix}${digits.padStart(4, "0")}`;
}

function replaceDerivationRefs(payload, allKeys) {
  let updatedEntries = 0;
  let replacementCount = 0;
  const replacements = [];

  for (const [entryId, entry] of Object.entries(payload)) {
    const derivation = entry?.derivation;
    if (typeof derivation !== "string" || derivation.length === 0) {
      continue;
    }

    let changed = false;
    const nextDerivation = derivation.replace(
      STRONGS_REF_PATTERN,
      (fullMatch, prefix, rawDigits) => {
        const compactRaw = `${prefix}${rawDigits}`;
        if (allKeys.has(compactRaw)) {
          return compactRaw;
        }

        const normalized = normalizeStrongsRef(prefix, rawDigits);
        if (allKeys.has(normalized)) {
          changed = true;
          replacementCount += 1;
          replacements.push({
            sourceEntry: entryId,
            from: compactRaw,
            to: normalized,
            kind: "zero-pad",
          });
          return normalized;
        }

        const alternatePrefix = prefix === "G" ? "H" : "G";
        const crossPrefix = normalizeStrongsRef(alternatePrefix, rawDigits);
        if (allKeys.has(crossPrefix)) {
          changed = true;
          replacementCount += 1;
          replacements.push({
            sourceEntry: entryId,
            from: compactRaw,
            to: crossPrefix,
            kind: "cross-prefix",
          });
          return crossPrefix;
        }

        return fullMatch;
      },
    );

    if (changed) {
      payload[entryId] = {
        ...entry,
        derivation: nextDerivation,
      };
      updatedEntries += 1;
    }
  }

  return {
    payload,
    updatedEntries,
    replacementCount,
    replacements,
  };
}

const datasets = await Promise.all(
  files.map(async (file) => ({
    ...file,
    payload: JSON.parse(await fs.readFile(file.input, "utf8")),
  })),
);

const allKeys = new Set(datasets.flatMap((dataset) => Object.keys(dataset.payload)));
const summary = [];

for (const dataset of datasets) {
  const { payload, updatedEntries, replacementCount, replacements } =
    replaceDerivationRefs(dataset.payload, allKeys);

  await fs.writeFile(dataset.input, `${JSON.stringify(payload, null, 2)}\n`);

  summary.push({
    dataset: dataset.label,
    path: path.relative(repoRoot, dataset.input),
    updatedEntries,
    replacementCount,
    crossPrefixCount: replacements.filter((item) => item.kind === "cross-prefix").length,
  });
}

console.log(JSON.stringify({ summary }, null, 2));
