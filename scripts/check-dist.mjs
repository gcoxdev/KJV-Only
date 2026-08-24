#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const REQUIRED_PATHS = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "app-cache-config.js",
  "data/kjv.json",
  "icons/app-icon.svg",
];
const FORBIDDEN_PATHS = [
  "delete",
  "data/kjv.sqlite",
  "data/kjv.osis.xml",
];
const FORBIDDEN_FILE_PATTERNS = [
  { pattern: /\.kml$/i, label: "KML generator input" },
  { pattern: /\.jsonl$/i, label: "JSONL generator input" },
  { pattern: /\.zip$/i, label: "source archive" },
  { pattern: /^maps\/schemas\//, label: "map schema" },
  { pattern: /^maps\/data\/(?!map\.json$)/, label: "non-runtime map data" },
  { pattern: /^references\/ancient_map\.json$/, label: "legacy map source" },
];
const BUDGETS = {
  maxFiles: 7_000,
  maxTotalBytes: 1_150_000_000,
  maxEntryJavaScriptBytes: 650_000,
  maxEntryCssBytes: 200_000,
};

async function exists(relativePath) {
  try {
    await fs.access(path.join(DIST_DIR, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const value = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(value)));
    } else if (entry.isFile()) {
      const stats = await fs.stat(value);
      files.push({ path: value, size: stats.size });
    }
  }
  return files;
}

const failures = [];
for (const requiredPath of REQUIRED_PATHS) {
  if (!(await exists(requiredPath))) {
    failures.push(`Missing required runtime asset: ${requiredPath}`);
  }
}
for (const forbiddenPath of FORBIDDEN_PATHS) {
  if (await exists(forbiddenPath)) {
    failures.push(`Forbidden build artifact: ${forbiddenPath}`);
  }
}

const files = await collectFiles(DIST_DIR);
for (const file of files) {
  const relative = path.relative(DIST_DIR, file.path).split(path.sep).join("/");
  const forbidden = FORBIDDEN_FILE_PATTERNS.find(({ pattern }) =>
    pattern.test(relative),
  );
  if (forbidden) {
    failures.push(`Forbidden ${forbidden.label}: ${relative}`);
  }
}
const totalBytes = files.reduce((total, file) => total + file.size, 0);
const entryJavaScript = files.find((file) =>
  /\/assets\/index-[^/]+\.js$/.test(file.path),
);
const entryCss = files.find((file) =>
  /\/assets\/index-[^/]+\.css$/.test(file.path),
);

if (files.length > BUDGETS.maxFiles) {
  failures.push(`File budget exceeded: ${files.length} > ${BUDGETS.maxFiles}`);
}
if (totalBytes > BUDGETS.maxTotalBytes) {
  failures.push(`Byte budget exceeded: ${totalBytes} > ${BUDGETS.maxTotalBytes}`);
}
if (!entryJavaScript || entryJavaScript.size > BUDGETS.maxEntryJavaScriptBytes) {
  failures.push(
    `Entry JavaScript budget exceeded or missing: ${entryJavaScript?.size ?? "missing"} > ${BUDGETS.maxEntryJavaScriptBytes}`,
  );
}
if (!entryCss || entryCss.size > BUDGETS.maxEntryCssBytes) {
  failures.push(
    `Entry CSS budget exceeded or missing: ${entryCss?.size ?? "missing"} > ${BUDGETS.maxEntryCssBytes}`,
  );
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      files: files.length,
      totalBytes,
      entryJavaScriptBytes: entryJavaScript.size,
      entryCssBytes: entryCss.size,
    },
    null,
    2,
  ),
);
