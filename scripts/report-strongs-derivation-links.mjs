import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const reportsDir = path.join(repoRoot, "reports");

function resolveInputPath(...candidates) {
  const existing = candidates.find((candidate) => existsSync(candidate));
  if (!existing) {
    throw new Error(`Missing input file. Checked: ${candidates.join(", ")}`);
  }
  return existing;
}

const greekPath = resolveInputPath(
  path.join(repoRoot, "public/references/strongs-greek.json"),
  path.join(repoRoot, "public/delete/public/references/strongs-greek.json"),
);
const hebrewPath = resolveInputPath(
  path.join(repoRoot, "public/references/strongs-hebrew.json"),
  path.join(repoRoot, "public/delete/public/references/strongs-hebrew.json"),
);

const greek = JSON.parse(await fs.readFile(greekPath, "utf8"));
const hebrew = JSON.parse(await fs.readFile(hebrewPath, "utf8"));

const greekKeys = new Set(Object.keys(greek));
const hebrewKeys = new Set(Object.keys(hebrew));
const allKeys = new Set([...greekKeys, ...hebrewKeys]);

const STRONGS_REF_PATTERN = /\b([GH])\s*([0-9]{1,4})\b/g;

function normalizeStrongsRef(prefix, digits) {
  return `${prefix}${digits.padStart(4, "0")}`;
}

function inspectDataset(datasetName, payload) {
  const findings = [];

  for (const [entryId, entry] of Object.entries(payload)) {
    const derivation = entry?.derivation;
    if (typeof derivation !== "string" || derivation.length === 0) {
      continue;
    }

    STRONGS_REF_PATTERN.lastIndex = 0;
    let match = null;
    while ((match = STRONGS_REF_PATTERN.exec(derivation)) !== null) {
      const [, prefix, rawDigits] = match;
      const compactRaw = `${prefix}${rawDigits}`;
      const exactExists = allKeys.has(compactRaw);
      const normalized = normalizeStrongsRef(prefix, rawDigits);
      const normalizedExists = allKeys.has(normalized);
      const alternatePrefix = prefix === "G" ? "H" : "G";
      const crossPrefix = normalizeStrongsRef(alternatePrefix, rawDigits);
      const crossPrefixExists = allKeys.has(crossPrefix);

      if (exactExists) {
        continue;
      }

      const suggestedReference = normalizedExists
        ? normalized
        : crossPrefixExists
          ? crossPrefix
          : null;
      const status = normalizedExists
        ? "normalizable"
        : crossPrefixExists
          ? "cross-prefix"
          : "unresolved";

      findings.push({
        dataset: datasetName,
        sourceEntry: entryId,
        rawReference: compactRaw,
        suggestedReference,
        suggestedExists: Boolean(suggestedReference),
        status,
        derivation,
      });
    }
  }

  return findings;
}

const greekFindings = inspectDataset("greek", greek);
const hebrewFindings = inspectDataset("hebrew", hebrew);
const findings = [...greekFindings, ...hebrewFindings];

const uniqueRawReferences = [...new Set(findings.map((finding) => finding.rawReference))].sort();
const unresolved = findings.filter((finding) => !finding.suggestedExists);
const normalizable = findings.filter((finding) => finding.suggestedExists);
const crossPrefix = findings.filter((finding) => finding.status === "cross-prefix");

const summary = {
  totalEntries: {
    greek: Object.keys(greek).length,
    hebrew: Object.keys(hebrew).length,
    combined: Object.keys(greek).length + Object.keys(hebrew).length,
  },
  findings: {
    total: findings.length,
    greek: greekFindings.length,
    hebrew: hebrewFindings.length,
    normalizable: normalizable.length,
    crossPrefix: crossPrefix.length,
    unresolved: unresolved.length,
    uniqueRawReferences: uniqueRawReferences.length,
  },
};

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  findings,
  unresolved,
};

const markdownLines = [
  "# Strong's Derivation Link Audit",
  "",
  "## Summary",
  "",
  `- Greek entries: ${summary.totalEntries.greek}`,
  `- Hebrew entries: ${summary.totalEntries.hebrew}`,
  `- Total mismatched derivation refs: ${summary.findings.total}`,
  `- Greek mismatches: ${summary.findings.greek}`,
  `- Hebrew mismatches: ${summary.findings.hebrew}`,
  `- Normalizable mismatches: ${summary.findings.normalizable}`,
  `- Cross-prefix mismatches: ${summary.findings.crossPrefix}`,
  `- Unresolved mismatches: ${summary.findings.unresolved}`,
  `- Unique raw mismatched refs: ${summary.findings.uniqueRawReferences}`,
  "",
  "## Findings",
  "",
];

for (const finding of findings) {
  markdownLines.push(`### ${finding.sourceEntry}`);
  markdownLines.push("");
  markdownLines.push(`- Dataset: ${finding.dataset}`);
  markdownLines.push(`- Raw reference: \`${finding.rawReference}\``);
  markdownLines.push(
    `- Suggested reference: ${
      finding.suggestedReference ? `\`${finding.suggestedReference}\`` : "_none found_"
    }`,
  );
  markdownLines.push(`- Status: ${finding.status}`);
  markdownLines.push(`- Derivation: ${finding.derivation}`);
  markdownLines.push("");
}

if (unresolved.length > 0) {
  markdownLines.push("## Unresolved");
  markdownLines.push("");
  for (const finding of unresolved) {
    markdownLines.push(
      `- ${finding.sourceEntry}: \`${finding.rawReference}\` in "${finding.derivation}"`,
    );
  }
  markdownLines.push("");
}

await fs.mkdir(reportsDir, { recursive: true });
await fs.writeFile(
  path.join(reportsDir, "strongs-derivation-link-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
await fs.writeFile(
  path.join(reportsDir, "strongs-derivation-link-report.md"),
  `${markdownLines.join("\n")}\n`,
);

console.log(
  JSON.stringify(
    {
      markdown: "reports/strongs-derivation-link-report.md",
      json: "reports/strongs-derivation-link-report.json",
      summary,
    },
    null,
    2,
  ),
);
