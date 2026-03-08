import { useCallback, useMemo, useState } from "react";

import { loadAncientMap, loadMapImages } from "@/lib/reader-data";
import {
  cleanMapMarkup,
  mapEntryLabel,
  mapEntrySearchableText,
  modernIdsForMapEntry,
  type AncientMapEntry,
  type AncientMapPayload,
  type MapImageEntry,
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
  const [mapImages, setMapImages] = useState<MapImageEntry[] | null>(null);
  const [isMapImagesLoading, setIsMapImagesLoading] = useState(false);
  const [mapImagesError, setMapImagesError] = useState<string | null>(null);

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

  const ensureMapImagesLoaded = useCallback(async () => {
    if (mapImages) {
      return mapImages;
    }
    setMapImagesError(null);
    setIsMapImagesLoading(true);
    try {
      const data = await loadMapImages();
      setMapImages(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load map images";
      setMapImagesError(message);
      throw error;
    } finally {
      setIsMapImagesLoading(false);
    }
  }, [mapImages]);

  const mapImagesByLocationId = useMemo(() => {
    const index = new Map<string, MapImageEntry[]>();
    for (const image of mapImages ?? []) {
      const ids = new Set<string>([
        ...Object.keys(image.thumbnails ?? {}),
        ...Object.keys(image.descriptions ?? {}),
      ]);
      for (const id of ids) {
        const existing = index.get(id);
        if (existing) {
          existing.push(image);
        } else {
          index.set(id, [image]);
        }
      }
    }
    return index;
  }, [mapImages]);

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
        const modernIds = modernIdsForMapEntry(entry);
        const imageCandidates = modernIds.flatMap(
          (id) => mapImagesByLocationId.get(id) ?? [],
        );
        const seenImageIds = new Set<string>();
        const photoEntries = imageCandidates.filter((image) => {
          if (seenImageIds.has(image.id)) {
            return false;
          }
          seenImageIds.add(image.id);
          return true;
        });
        const linkedPlaces = Object.entries(entry.geojson_roles ?? {}).map(
          ([roleKey, role]) => ({
            roleKey,
            text: cleanMapMarkup(role.description ?? roleKey),
          }),
        );

        return {
          entry,
          itemKey,
          title,
          modernIds,
          photoEntries,
          linkedPlaces,
        };
      }),
    [mapsSearchResults, mapImagesByLocationId],
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
      void Promise.all([ensureAncientMapsLoaded(), ensureMapImagesLoaded()])
        .catch(() => {
          // Error state is set by ensure loaders.
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsMapsSearching(false);
          });
        });
    },
    [ensureAncientMapsLoaded, ensureMapImagesLoaded],
  );

  return {
    ancientMaps,
    mapsSearchTerm,
    isMapsSearching,
    isMapsLoading,
    mapsError,
    selectedMapsEntries,
    mapImages,
    isMapImagesLoading,
    mapImagesError,
    mapsSearchResults,
    mapsDisplayEntries,
    setMapsSearchTerm,
    setIsMapsSearching,
    setIsMapsLoading,
    setMapsError,
    setSelectedMapsEntries,
    setIsMapImagesLoading,
    setMapImagesError,
    ensureAncientMapsLoaded,
    ensureMapImagesLoaded,
    applyMapsSearch,
  };
}
