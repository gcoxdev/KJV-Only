import { useCallback, useDeferredValue, useMemo, useState } from "react";

import { loadTopicsIndex, type TopicsIndexPayload } from "@/lib/reader-data";

export type TopicsToolEntry = TopicsIndexPayload["topics"][number];

export const TOPIC_LETTERS = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
);

export function useTopicsTool() {
  const [payload, setPayload] = useState<TopicsIndexPayload | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const ensureTopicsLoaded = useCallback(async () => {
    if (payload) {
      return payload;
    }
    setError(null);
    setIsLoading(true);
    try {
      const data = await loadTopicsIndex();
      setPayload(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load topics";
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [payload]);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const entry of payload?.topics ?? []) {
      const first = entry.topic.charAt(0).toUpperCase();
      if (first >= "A" && first <= "Z") {
        letters.add(first);
      }
    }
    return TOPIC_LETTERS.filter((letter) => letters.has(letter));
  }, [payload]);

  const preparedEntries = useMemo(
    () =>
      (payload?.topics ?? []).map((entry) => ({
        entry,
        firstLetter: entry.topic.charAt(0).toUpperCase(),
        topicLower: entry.topic.toLowerCase(),
      })),
    [payload],
  );

  const results = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    const selectedLetterSet =
      selectedLetters.length > 0 ? new Set(selectedLetters) : null;
    if (!term) {
      if (!selectedLetterSet) {
        return [];
      }
      return preparedEntries
        .filter((item) => selectedLetterSet.has(item.firstLetter))
        .map((item) => item.entry);
    }

    const ranked = preparedEntries
      .map((item) => {
        if (selectedLetterSet && !selectedLetterSet.has(item.firstLetter)) {
          return null;
        }
        const startsWith = item.topicLower.startsWith(term);
        const wordBoundary = item.topicLower.includes(` ${term}`);
        const includes = item.topicLower.includes(term);
        if (!includes) {
          return null;
        }
        const rank = startsWith ? 0 : wordBoundary ? 1 : 2;
        return { entry: item.entry, rank };
      })
      .filter((value): value is { entry: TopicsToolEntry; rank: number } => value !== null)
      .sort((left, right) => left.rank - right.rank || left.entry.topic.localeCompare(right.entry.topic));

    return ranked.map(({ entry }) => entry);
  }, [deferredSearchTerm, preparedEntries, selectedLetters]);

  const applySearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setSearchTerm(nextTerm);
      if (!payload) {
        void ensureTopicsLoaded().catch(() => {
          // Error state is set by ensureTopicsLoaded.
        });
      }
    },
    [ensureTopicsLoaded, payload],
  );

  const selectLetter = useCallback(
    (letter: string) => {
      setSelectedLetters((current) =>
        current.includes(letter)
          ? current.filter((item) => item !== letter)
          : [...current, letter],
      );
      void ensureTopicsLoaded().catch(() => {
        // Error state is set by ensureTopicsLoaded.
      });
    },
    [ensureTopicsLoaded],
  );

  return {
    payload,
    searchTerm,
    selectedLetters,
    isLoading,
    isSearching: isLoading && !payload,
    error,
    results,
    availableLetters,
    ensureTopicsLoaded,
    applySearch,
    selectLetter,
  };
}
