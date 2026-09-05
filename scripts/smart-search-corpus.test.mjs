import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  isSmartSearchCandidate,
  prepareSmartSearch,
  scorePreparedSmartSearch,
} from "@/lib/search";

// Exercise the shipped worker against the actual corpus, including competing
// verses, ranking, and its 500-result cap. Keep the fallback path in agreement.
const resultLimit = 500;
const allBooks = Array.from({ length: 66 }, (_, index) => index);
let index;
let receive;
let nextRequestId = 0;
const pending = new Map();
const reference = (match) => `${match.bookName} ${match.chapterIndex + 1}:${match.verseNumber}`;

function runWorker(query, selectedBookIndexes = allBooks, caseSensitive = false) {
  const requestId = ++nextRequestId;
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    receive({ data: { type: "smart-search", requestId, query, caseSensitive, selectedBookIndexes, resultLimit } });
  });
}

function runFallback(query, selectedBookIndexes = allBooks, caseSensitive = false) {
  const prepared = prepareSmartSearch(query, caseSensitive);
  const selected = new Set(selectedBookIndexes);
  const cache = new Map();
  const scored = [];
  index.forEach((entry, position) => {
    if (!selected.has(entry.bookIndex) || !isSmartSearchCandidate(entry, prepared))
      return;
    const score = scorePreparedSmartSearch(entry, prepared, cache);
    if (score !== null)
      scored.push({ entry, position, score });
  });
  return scored.sort((a, b) => b.score - a.score || a.position - b.position)
    .slice(0, resultLimit).map(({ entry }) => reference(entry));
}

beforeAll(async () => {
  vi.stubGlobal("self", {
    setTimeout,
    addEventListener: (_type, listener) => { receive = listener; },
    postMessage: (response) => {
      if (response.type === "index-ready")
        index = response.index;
      if (response.type === "index-error")
        throw new Error(response.message);
      if (response.type === "smart-search-update" && response.isComplete) {
        pending.get(response.requestId)?.resolve(response.matches);
        pending.delete(response.requestId);
      }
      if (response.type === "smart-search-error") {
        pending.get(response.requestId)?.reject(new Error(response.message));
        pending.delete(response.requestId);
      }
    },
  });
  await import("../src/workers/verse-search-index.worker");
  const { books } = JSON.parse(readFileSync(new URL("../public/data/kjv.json", import.meta.url), "utf8"));
  expect(books).toHaveLength(66);
  receive({ data: { type: "build-index", books } });
  expect(index).toHaveLength(31102);
}, 15000);

afterAll(() => vi.unstubAllGlobals());

describe("Smart Search across the full KJV corpus", { timeout: 15000 }, () => {

  it.each([
    { query: "begnning", target: "Genesis 1:1", within: 1 },
    { query: "sheperd", target: "Psalms 23:1", within: 50 },
    { query: "righteosness", target: "Proverbs 14:34", within: 500 },
    { query: "melchizedek", target: "Genesis 14:18", within: 1 },
    { query: "nebuchadnezer", target: "Daniel 3:1", within: 500 },
    { query: "mercy endureth ever", target: "Psalms 136:1", within: 50 },
    { query: "work together good", target: "Romans 8:28", within: 1 },
    { query: "still small voice", target: "1 Kings 19:12", within: 1 },
    { query: "faith without works", target: "James 2:26", within: 10 },
    { query: "peace passeth understanding", target: "Philippians 4:7", within: 5 },
  ])("keeps $target within the first $within results for $query", async ({ query, target, within }) => {
    const matches = await runWorker(query);
    const references = matches.map(reference);
    expect(references.slice(0, within)).toContain(target);
    expect(references).toEqual(runFallback(query));
    expect(new Set(references).size).toBe(references.length);
    if (query === "sheperd")
      expect(references).not.toContain("Genesis 3:20");
  });

  it("keeps only the four close predestinate matches", async () => {
    const references = (await runWorker("predestinate")).map(reference);
    expect(references).toHaveLength(4);
    expect(references).toEqual(expect.arrayContaining([
      "Romans 8:29", "Romans 8:30", "Ephesians 1:5", "Ephesians 1:11",
    ]));
    expect(references).toEqual(runFallback("predestinate"));
  });

  it("requires a standalone word for quoted love", async () => {
    const matches = await runWorker('"love"');
    expect(matches.map(reference)).toContain("1 John 4:8");
    expect(matches.map(reference)).not.toContain("John 3:35"); // loveth only
    expect(matches.every(({ text }) => /\blove\b/i.test(text))).toBe(true);
    expect(matches.map(reference)).toEqual(runFallback('"love"'));
  });

  it.each(['"sheperd"', "zqxjkv", '"the LORD is my shepherd"'])("does not invent matches for %s", async (query) => {
    expect(await runWorker(query, allBooks, true)).toEqual([]);
    expect(runFallback(query, allBooks, true)).toEqual([]);
  });

  it("respects the selected books and exact phrase case", async () => {
    const matches = await runWorker("sheperd", [18]);
    expect(matches.map(reference)).toContain("Psalms 23:1");
    expect(matches.every(({ bookIndex }) => bookIndex === 18)).toBe(true);
    expect(matches.map(reference)).toEqual(runFallback("sheperd", [18]));
    expect((await runWorker('"The LORD is my shepherd"', [18], true)).map(reference)).toEqual(["Psalms 23:1"]);
  });

  it("caps broad searches consistently without duplicate results", async () => {
    const matches = await runWorker("the");
    const references = matches.map(reference);
    expect(matches).toHaveLength(resultLimit);
    expect(new Set(references).size).toBe(resultLimit);
    expect(references).toEqual(runFallback("the"));
  });
});
