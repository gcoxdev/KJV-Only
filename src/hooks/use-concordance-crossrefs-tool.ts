import { useCallback, useMemo, useState } from "react";

import { loadConcordance, loadCrossRefs } from "@/lib/reader-data";
import type { ConcordancePayload, CrossRefsPayload } from "@/types/reader";

export function useConcordanceCrossRefsTool() {
  const [concordance, setConcordance] = useState<ConcordancePayload | null>(null);
  const [crossRefs, setCrossRefs] = useState<CrossRefsPayload | null>(null);
  const [selectedCrossReferences, setSelectedCrossReferences] = useState<{
    key: string;
    references: string[];
  } | null>(null);
  const [isCrossRefsLoading, setIsCrossRefsLoading] = useState(false);
  const [crossRefsError, setCrossRefsError] = useState<string | null>(null);
  const [selectedConcordanceWord, setSelectedConcordanceWord] = useState<{
    key: string;
    references: string[];
  } | null>(null);
  const [concordanceSearchTerm, setConcordanceSearchTerm] = useState("");
  const [isConcordanceSearching, setIsConcordanceSearching] = useState(false);
  const [isConcordanceLoading, setIsConcordanceLoading] = useState(false);
  const [concordanceError, setConcordanceError] = useState<string | null>(null);

  const ensureConcordanceLoaded = useCallback(async () => {
    if (concordance) {
      return concordance;
    }
    setConcordanceError(null);
    setIsConcordanceLoading(true);
    try {
      const data = await loadConcordance();
      setConcordance(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load concordance data";
      setConcordanceError(message);
      throw error;
    } finally {
      setIsConcordanceLoading(false);
    }
  }, [concordance]);

  const ensureCrossRefsLoaded = useCallback(async () => {
    if (crossRefs) {
      return crossRefs;
    }
    setCrossRefsError(null);
    setIsCrossRefsLoading(true);
    try {
      const data = await loadCrossRefs();
      setCrossRefs(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load cross-reference data";
      setCrossRefsError(message);
      throw error;
    } finally {
      setIsCrossRefsLoading(false);
    }
  }, [crossRefs]);

  const concordanceSearchResults = useMemo(() => {
    const term = concordanceSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedConcordanceWord ? [selectedConcordanceWord] : [];
    }
    if (!concordance) {
      return [];
    }
    return Object.keys(concordance)
      .filter((word) => word.toLowerCase().includes(term))
      .sort((a, b) => a.localeCompare(b))
      .map((word) => ({
        key: word,
        references: concordance[word] ?? [],
      }));
  }, [concordance, concordanceSearchTerm, selectedConcordanceWord]);

  const applyConcordanceSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setConcordanceSearchTerm(nextTerm);
      if (!nextTerm) {
        setIsConcordanceSearching(false);
        return;
      }
      setIsConcordanceSearching(true);
      void ensureConcordanceLoaded()
        .catch(() => {
          // Error state is set by ensureConcordanceLoaded.
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsConcordanceSearching(false);
          });
        });
    },
    [ensureConcordanceLoaded],
  );

  return {
    concordance,
    crossRefs,
    selectedCrossReferences,
    isCrossRefsLoading,
    crossRefsError,
    selectedConcordanceWord,
    concordanceSearchTerm,
    isConcordanceSearching,
    isConcordanceLoading,
    concordanceError,
    concordanceSearchResults,
    setSelectedCrossReferences,
    setIsCrossRefsLoading,
    setCrossRefsError,
    setSelectedConcordanceWord,
    setConcordanceSearchTerm,
    setIsConcordanceSearching,
    setIsConcordanceLoading,
    setConcordanceError,
    ensureConcordanceLoaded,
    ensureCrossRefsLoaded,
    applyConcordanceSearch,
  };
}
