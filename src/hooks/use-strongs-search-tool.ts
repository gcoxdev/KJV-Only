import { useCallback, useMemo, useState } from "react";

import { loadStrongsGreek, loadStrongsHebrew } from "@/lib/reader-data";
import type { StrongsEntry, StrongsPayload } from "@/types/reader";

export type StrongsSearchResult = {
  code: string;
  testament: "greek" | "hebrew";
  entry: StrongsEntry;
};

export function deriveStrongsSearchResults(
  indexedStrongsEntries: Array<{
    code: string;
    testament: "greek" | "hebrew";
    entry: StrongsEntry;
    haystackLower: string;
  }>,
  selectedStrongsEntry: StrongsSearchResult | null,
  strongsSearchTerm: string,
) {
  const term = strongsSearchTerm.trim().toLowerCase();
  if (!term) {
    return selectedStrongsEntry ? [selectedStrongsEntry] : [];
  }
  return indexedStrongsEntries
    .filter((item) => item.haystackLower.includes(term))
    .map(({ code, testament, entry }) => ({ code, testament, entry }));
}

export function useStrongsSearchTool() {
  const [strongsGreek, setStrongsGreek] = useState<StrongsPayload | null>(null);
  const [strongsHebrew, setStrongsHebrew] = useState<StrongsPayload | null>(null);
  const [strongsSearchTerm, setStrongsSearchTerm] = useState("");
  const [isStrongsSearching, setIsStrongsSearching] = useState(false);
  const [isStrongsLoading, setIsStrongsLoading] = useState(false);
  const [strongsError, setStrongsError] = useState<string | null>(null);
  const [selectedStrongsEntry, setSelectedStrongsEntry] =
    useState<StrongsSearchResult | null>(null);

  const ensureStrongsLoaded = useCallback(async () => {
    if (strongsGreek && strongsHebrew) {
      return { greek: strongsGreek, hebrew: strongsHebrew };
    }
    setStrongsError(null);
    setIsStrongsLoading(true);
    try {
      const [greek, hebrew] = await Promise.all([
        strongsGreek ? Promise.resolve(strongsGreek) : loadStrongsGreek(),
        strongsHebrew ? Promise.resolve(strongsHebrew) : loadStrongsHebrew(),
      ]);
      setStrongsGreek(greek);
      setStrongsHebrew(hebrew);
      return { greek, hebrew };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load Strong's data";
      setStrongsError(message);
      throw error;
    } finally {
      setIsStrongsLoading(false);
    }
  }, [strongsGreek, strongsHebrew]);

  const indexedStrongsEntries = useMemo(() => {
    const index: Array<{
      code: string;
      testament: "greek" | "hebrew";
      entry: StrongsEntry;
      haystackLower: string;
    }> = [];

    const pushEntries = (
      payload: StrongsPayload | null,
      testament: "greek" | "hebrew",
    ) => {
      if (!payload) {
        return;
      }
      for (const [code, entry] of Object.entries(payload)) {
        const haystackLower = [
          code,
          entry.lemma ?? "",
          entry.translit ?? "",
          entry.kjv_def ?? "",
          entry.strongs_def ?? "",
        ]
          .join(" ")
          .toLowerCase();
        index.push({ code, testament, entry, haystackLower });
      }
    };

    pushEntries(strongsGreek, "greek");
    pushEntries(strongsHebrew, "hebrew");
    return index.sort((a, b) => a.code.localeCompare(b.code));
  }, [strongsGreek, strongsHebrew]);

  const strongsSearchResults = useMemo(() => {
    return deriveStrongsSearchResults(
      indexedStrongsEntries,
      selectedStrongsEntry,
      strongsSearchTerm,
    );
  }, [indexedStrongsEntries, selectedStrongsEntry, strongsSearchTerm]);

  const applyStrongsSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setStrongsSearchTerm(nextTerm);
      if (!nextTerm) {
        setIsStrongsSearching(false);
        return;
      }
      setIsStrongsSearching(true);
      void ensureStrongsLoaded()
        .catch(() => {
          // Error state is set by ensureStrongsLoaded.
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsStrongsSearching(false);
          });
        });
    },
    [ensureStrongsLoaded],
  );

  return {
    strongsGreek,
    strongsHebrew,
    strongsSearchTerm,
    isStrongsSearching,
    isStrongsLoading,
    strongsError,
    selectedStrongsEntry,
    strongsSearchResults,
    setStrongsSearchTerm,
    setIsStrongsSearching,
    setIsStrongsLoading,
    setStrongsError,
    setSelectedStrongsEntry,
    ensureStrongsLoaded,
    applyStrongsSearch,
  };
}
