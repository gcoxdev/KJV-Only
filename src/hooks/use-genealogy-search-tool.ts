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

  const indexedGenealogy = useMemo(() => {
    return (genealogy ?? [])
      .map((person) => ({
        person,
        firstName: person.names[0] ?? person.id,
        namesLower: [
          ...person.names,
          ...(person.verses?.byName ?? []).map((entry) => entry.name),
        ].map((name) => name.toLowerCase()),
      }))
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [genealogy]);

  const personSemanticKey = useCallback((person: GenealogyPerson) => {
    const byNameKey = (person.verses?.byName ?? [])
      .map(
        (entry) =>
          `${entry.name}:${entry.numOccurrences ?? 0}:${entry.numVerses ?? entry.verses.length}:${entry.verses.join("|")}`,
      )
      .sort()
      .join("||");
    return [
      person.names.join("|"),
      person.verses?.first ?? "",
      person.verses?.totalOccurrences ?? 0,
      person.verses?.totalVerses ?? 0,
      byNameKey,
    ].join("::");
  }, []);

  const dedupeEquivalentPeople = useCallback(
    (people: GenealogyPerson[]) => {
      const seen = new Set<string>();
      return people.filter((person) => {
        const key = personSemanticKey(person);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    },
    [personSemanticKey],
  );

  const genealogySearchResults = useMemo(() => {
    const term = genealogySearchTerm.trim().toLowerCase();
    if (term) {
      return dedupeEquivalentPeople(
        indexedGenealogy
          .filter((item) => item.namesLower.some((name) => name.includes(term)))
          .map((item) => item.person),
      );
    }
    if (selectedGenealogyIds.length === 0) {
      return [] as GenealogyPerson[];
    }
    return dedupeEquivalentPeople(
      selectedGenealogyIds
        .map((id) => genealogyById.get(id))
        .filter((person): person is GenealogyPerson => Boolean(person)),
    );
  }, [
    dedupeEquivalentPeople,
    genealogyById,
    genealogySearchTerm,
    indexedGenealogy,
    selectedGenealogyIds,
  ]);

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
