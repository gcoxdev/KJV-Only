import { useCallback, useMemo, useState } from "react";

import { loadAncientMap } from "@/lib/reader-data";
import {
  cleanMapMarkup,
  mapEntryLabel,
  mapEntrySearchableText,
  type AncientMapEntry,
  type AncientMapPayload,
} from "@/lib/maps";

export function useMapsSearchTool() {
  const [ancientMaps, setAncientMaps] = useState<AncientMapPayload | null>(null);
  const [mapsSearchTerm, setMapsSearchTerm] = useState("");
  const [isMapsSearching, setIsMapsSearching] = useState(false);
  const [isMapsLoading, setIsMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [selectedMapsEntries, setSelectedMapsEntries] = useState<AncientMapEntry[]>(
    [],
  );

  const ensureAncientMapsLoaded = useCallback(async () => {
    if (ancientMaps) {
      return ancientMaps;
    }
    setMapsError(null);
    setIsMapsLoading(true);
    try {
      const data = await loadAncientMap();
      setAncientMaps(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load ancient map data";
      setMapsError(message);
      throw error;
    } finally {
      setIsMapsLoading(false);
    }
  }, [ancientMaps]);

  const indexedAncientMaps = useMemo(() => {
    if (!ancientMaps) {
      return [];
    }
    return ancientMaps
      .map((entry) => ({
        entry,
        label: mapEntryLabel(entry),
        searchable: mapEntrySearchableText(entry),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [ancientMaps]);

  const mapsSearchResults = useMemo(() => {
    const term = mapsSearchTerm.trim().toLowerCase();
    if (!term) {
      return selectedMapsEntries;
    }
    if (indexedAncientMaps.length === 0) {
      return [] as AncientMapEntry[];
    }
    return indexedAncientMaps
      .filter((item) => item.searchable.includes(term))
      .map((item) => item.entry);
  }, [indexedAncientMaps, mapsSearchTerm, selectedMapsEntries]);

  const mapsDisplayEntries = useMemo(
    () =>
      mapsSearchResults.map((entry, index) => {
        const itemKey = `${entry.geojson_file}-${index}`;
        const title = mapEntryLabel(entry);
        const linkedPlaces = entry.modern_names.map((name) => ({
          roleKey: name.toLowerCase(),
          text: cleanMapMarkup(name),
        }));

        return {
          entry,
          itemKey,
          title,
          linkedPlaces,
        };
      }),
    [mapsSearchResults],
  );

  const applyMapsSearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setMapsSearchTerm(nextTerm);
      if (!nextTerm) {
        setIsMapsSearching(false);
        return;
      }
      setIsMapsSearching(true);
      void ensureAncientMapsLoaded()
        .catch(() => {
          // Error state is set by ensureAncientMapsLoaded.
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsMapsSearching(false);
          });
        });
    },
    [ensureAncientMapsLoaded],
  );

  return {
    ancientMaps,
    mapsSearchTerm,
    isMapsSearching,
    isMapsLoading,
    mapsError,
    selectedMapsEntries,
    mapsSearchResults,
    mapsDisplayEntries,
    setMapsSearchTerm,
    setIsMapsSearching,
    setIsMapsLoading,
    setMapsError,
    setSelectedMapsEntries,
    ensureAncientMapsLoaded,
    applyMapsSearch,
  };
}
