import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AncientMapEntry,
  MapGeoJsonPayload,
  MapPhotoDialogItem,
} from "@/lib/maps";

type UseMapDialogStateArgs = {
  loadMapGeoJsonByFile: (geoJsonFile: string) => Promise<MapGeoJsonPayload>;
};

export function useMapDialogState({
  loadMapGeoJsonByFile,
}: UseMapDialogStateArgs) {
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [activeMapDialogEntry, setActiveMapDialogEntry] =
    useState<AncientMapEntry | null>(null);
  const [mapDialogGeoJson, setMapDialogGeoJson] =
    useState<MapGeoJsonPayload | null>(null);
  const [isMapDialogLoading, setIsMapDialogLoading] = useState(false);
  const [mapDialogError, setMapDialogError] = useState<string | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [photoDialogItems, setPhotoDialogItems] = useState<MapPhotoDialogItem[]>(
    [],
  );
  const [photoDialogIndex, setPhotoDialogIndex] = useState(0);

  const openMapDialog = useCallback((entry: AncientMapEntry) => {
    setActiveMapDialogEntry(entry);
    setIsMapDialogOpen(true);
  }, []);

  const openPhotoDialog = useCallback(
    (items: MapPhotoDialogItem[], startIndex: number) => {
      if (items.length === 0) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(items.length - 1, startIndex));
      setPhotoDialogItems(items);
      setPhotoDialogIndex(clampedIndex);
      setIsPhotoDialogOpen(true);
    },
    [],
  );

  const movePhotoDialog = useCallback(
    (direction: -1 | 1) => {
      setPhotoDialogIndex((current) => {
        if (photoDialogItems.length === 0) {
          return 0;
        }
        return (
          (current + direction + photoDialogItems.length) % photoDialogItems.length
        );
      });
    },
    [photoDialogItems.length],
  );

  const resetMapDialogState = useCallback(() => {
    setIsMapDialogOpen(false);
    setIsPhotoDialogOpen(false);
    setPhotoDialogItems([]);
    setPhotoDialogIndex(0);
    setActiveMapDialogEntry(null);
    setMapDialogGeoJson(null);
    setMapDialogError(null);
    setIsMapDialogLoading(false);
  }, []);

  const onMapDialogOpenChange = useCallback((open: boolean) => {
    setIsMapDialogOpen(open);
    if (!open) {
      setActiveMapDialogEntry(null);
      setMapDialogGeoJson(null);
      setMapDialogError(null);
    }
  }, []);

  const onCloseMapDialog = useCallback(() => {
    setIsMapDialogOpen(false);
    setActiveMapDialogEntry(null);
    setMapDialogGeoJson(null);
    setMapDialogError(null);
  }, []);

  const onPhotoDialogOpenChange = useCallback((open: boolean) => {
    setIsPhotoDialogOpen(open);
    if (!open) {
      setPhotoDialogItems([]);
      setPhotoDialogIndex(0);
    }
  }, []);

  const onClosePhotoDialog = useCallback(() => {
    setIsPhotoDialogOpen(false);
    setPhotoDialogItems([]);
    setPhotoDialogIndex(0);
  }, []);

  useEffect(() => {
    if (!isMapDialogOpen || !activeMapDialogEntry) {
      setMapDialogGeoJson(null);
      setMapDialogError(null);
      setIsMapDialogLoading(false);
      return;
    }

    let cancelled = false;
    setMapDialogError(null);
    setIsMapDialogLoading(true);
    void loadMapGeoJsonByFile(activeMapDialogEntry.geojson_file)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setMapDialogGeoJson(payload);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load map geometry data";
        setMapDialogError(message);
        setMapDialogGeoJson(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsMapDialogLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeMapDialogEntry, isMapDialogOpen, loadMapGeoJsonByFile]);

  const currentPhotoDialogItem = useMemo(
    () => (photoDialogItems.length > 0 ? photoDialogItems[photoDialogIndex] : null),
    [photoDialogIndex, photoDialogItems],
  );

  return {
    isMapDialogOpen,
    activeMapDialogEntry,
    isMapDialogLoading,
    mapDialogError,
    mapDialogGeoJson,
    onMapDialogOpenChange,
    onCloseMapDialog,
    openMapDialog,
    isPhotoDialogOpen,
    currentPhotoDialogItem,
    photoDialogIndex,
    photoDialogItemsLength: photoDialogItems.length,
    onPhotoDialogOpenChange,
    onClosePhotoDialog,
    openPhotoDialog,
    movePhotoDialog,
    resetMapDialogState,
  };
}
