/// <reference lib="webworker" />

import {
  buildSmartSearchLookup,
  getExactSmartSearchCandidateIndexes,
  getIndexedSmartSearchCandidateIndexes,
  isSmartSearchCandidate,
  prepareSmartSearch,
  scorePreparedSmartSearch,
  type SmartSearchLookup,
} from "@/lib/search";
import type {
  VerseSearchWorkerRequest,
  VerseSearchWorkerResponse,
} from "@/lib/smart-search-worker";
import {
  buildVerseSearchIndex,
  type VerseSearchIndexEntry,
} from "@/lib/verse-search-index";
import type { SearchMatch } from "@/types/reader";

type ScoredVerse = {
  entry: VerseSearchIndexEntry;
  index: number;
  score: number;
};

let verseIndex: VerseSearchIndexEntry[] = [];
let smartLookup: SmartSearchLookup | null = null;
const cancelledSearches = new Set<number>();

function postResponse(response: VerseSearchWorkerResponse) {
  self.postMessage(response);
}

function compareScores(left: ScoredVerse, right: ScoredVerse) {
  return right.score - left.score || left.index - right.index;
}

function buildMatches(scored: ScoredVerse[], resultLimit: number) {
  return scored
    .slice()
    .sort(compareScores)
    .slice(0, resultLimit)
    .map(({ entry }) => ({
      bookIndex: entry.bookIndex,
      chapterIndex: entry.chapterIndex,
      verseNumber: entry.verseNumber,
      bookName: entry.bookName,
      text: entry.text,
    })) satisfies SearchMatch[];
}

function startSmartSearch(
  request: Extract<VerseSearchWorkerRequest, { type: "smart-search" }>,
) {
  const { requestId, query, caseSensitive, selectedBookIndexes, resultLimit } =
    request;
  const lookup = smartLookup;
  const prepared = prepareSmartSearch(query, caseSensitive);
  if (!lookup || verseIndex.length === 0 || !prepared) {
    postResponse({
      type: "smart-search-error",
      requestId,
      message: "Could not prepare this Bible search.",
    });
    return;
  }

  cancelledSearches.delete(requestId);
  const selectedBooks = new Set(selectedBookIndexes);
  const similarityCache = new Map<string, number>();
  const scored: ScoredVerse[] = [];
  const exactCandidateIndexes = getExactSmartSearchCandidateIndexes(
    lookup,
    prepared,
  );
  const exactCandidateSet = new Set(exactCandidateIndexes);

  const scoreCandidate = (index: number) => {
    const entry = verseIndex[index];
    if (
      !selectedBooks.has(entry.bookIndex) ||
      !isSmartSearchCandidate(entry, prepared)
    ) {
      return;
    }
    const score = scorePreparedSmartSearch(
      entry,
      prepared,
      similarityCache,
    );
    if (score !== null) {
      scored.push({ entry, index, score });
    }
  };

  for (const index of exactCandidateIndexes) {
    scoreCandidate(index);
  }
  if (scored.length > 0) {
    postResponse({
      type: "smart-search-update",
      requestId,
      matches: buildMatches(scored, resultLimit),
      processed: 0,
      total: verseIndex.length,
      isComplete: false,
    });
  }

  self.setTimeout(() => {
    if (cancelledSearches.delete(requestId)) {
      return;
    }

    try {
      const candidateIndexes = getIndexedSmartSearchCandidateIndexes(
        lookup,
        prepared,
      ).filter((index) => !exactCandidateSet.has(index));
      const total = candidateIndexes.length + exactCandidateIndexes.length;
      let candidateOffset = 0;
      let batchesSincePublish = 0;
      const batchSize = 500;

      const pruneScores = () => {
        if (scored.length < resultLimit * 2) {
          return;
        }
        scored.sort(compareScores);
        scored.length = resultLimit;
      };

      const processBatch = () => {
        if (cancelledSearches.delete(requestId)) {
          return;
        }
        const endOffset = Math.min(
          candidateOffset + batchSize,
          candidateIndexes.length,
        );
        for (; candidateOffset < endOffset; candidateOffset += 1) {
          scoreCandidate(candidateIndexes[candidateOffset]);
        }
        pruneScores();
        batchesSincePublish += 1;
        const processed = exactCandidateIndexes.length + candidateOffset;
        const isComplete = candidateOffset >= candidateIndexes.length;
        if (isComplete || batchesSincePublish >= 8) {
          postResponse({
            type: "smart-search-update",
            requestId,
            matches: buildMatches(scored, resultLimit),
            processed,
            total,
            isComplete,
          });
          batchesSincePublish = 0;
        }
        if (!isComplete) {
          self.setTimeout(processBatch, 0);
        }
      };

      processBatch();
    } catch (error) {
      postResponse({
        type: "smart-search-error",
        requestId,
        message:
          error instanceof Error
            ? error.message
            : "The Smart Search worker failed.",
      });
    }
  }, 0);
}

self.addEventListener(
  "message",
  (event: MessageEvent<VerseSearchWorkerRequest>) => {
    const request = event.data;
    if (request.type === "cancel-smart-search") {
      cancelledSearches.add(request.requestId);
      return;
    }
    if (request.type === "smart-search") {
      startSmartSearch(request);
      return;
    }

    try {
      verseIndex = buildVerseSearchIndex(request.books);
      smartLookup = buildSmartSearchLookup(verseIndex);
      postResponse({ type: "index-ready", index: verseIndex });
    } catch (error) {
      verseIndex = [];
      smartLookup = null;
      postResponse({
        type: "index-error",
        message:
          error instanceof Error
            ? error.message
            : "Could not prepare Bible search.",
      });
    }
  },
);
