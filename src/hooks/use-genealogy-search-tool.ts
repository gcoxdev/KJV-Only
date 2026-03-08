import { useCallback, useMemo, useState } from "react";

import { loadGenealogy } from "@/lib/reader-data";
import type { GenealogyPayload, GenealogyPerson } from "@/types/reader";

export function useGenealogySearchTool() {
  const [genealogy, setGenealogy] = useState<GenealogyPayload | null>(null);
  const [genealogySearchTerm, setGenealogySearchTerm] = useState("");
  const [isGenealogySearching, setIsGenealogySearching] = useState(false);
  const [isGenealogyLoading, setIsGenealogyLoading] = useState(false);
  const [genealogyError, setGenealogyError] = useState<string | null>(null);
  const [selectedGenealogyIds, setSelectedGenealogyIds] = useState<string[]>([]);

  const ensureGenealogyLoaded = useCallback(async () => {
    if (genealogy) {
      return genealogy;
    }
    setGenealogyError(null);
    setIsGenealogyLoading(true);
    try {
      const data = await loadGenealogy();
      setGenealogy(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load genealogy data";
      setGenealogyError(message);
      throw error;
    } finally {
      setIsGenealogyLoading(false);
    }
  }, [genealogy]);

  const genealogyById = useMemo(() => {
    const map = new Map<string, GenealogyPerson>();
    for (const person of genealogy ?? []) {
      map.set(person.id, person);
    }
    return map;
  }, [genealogy]);

  const genealogySearchResults = useMemo(() => {
    const term = genealogySearchTerm.trim().toLowerCase();
    if (term) {
      return (genealogy ?? [])
        .filter((person) =>
          person.names.some((name) => name.toLowerCase().includes(term)),
        )
        .sort((a, b) => (a.names[0] ?? a.id).localeCompare(b.names[0] ?? b.id));
    }
    if (selectedGenealogyIds.length === 0) {
      return [] as GenealogyPerson[];
    }
    return selectedGenealogyIds
      .map((id) => genealogyById.get(id))
      .filter((person): person is GenealogyPerson => Boolean(person));
  }, [genealogy, genealogyById, genealogySearchTerm, selectedGenealogyIds]);

  const applyGenealogySearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setGenealogySearchTerm(nextTerm);
      if (!nextTerm) {
        setIsGenealogySearching(false);
        return;
      }
      setIsGenealogySearching(true);
      void ensureGenealogyLoaded()
        .catch(() => {
          // Error state is set by ensureGenealogyLoaded
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsGenealogySearching(false);
          });
        });
    },
    [ensureGenealogyLoaded],
  );

  return {
    genealogy,
    genealogySearchTerm,
    isGenealogySearching,
    isGenealogyLoading,
    genealogyError,
    genealogyById,
    genealogySearchResults,
    selectedGenealogyIds,
    setGenealogySearchTerm,
    setIsGenealogySearching,
    setIsGenealogyLoading,
    setGenealogyError,
    setSelectedGenealogyIds,
    ensureGenealogyLoaded,
    applyGenealogySearch,
  };
}
