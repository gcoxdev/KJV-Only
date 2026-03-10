import { useCallback, useEffect, useState } from "react";

import type { AncientMapEntry, MapGeoJsonPayload } from "@/lib/maps";

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

  const openMapDialog = useCallback((entry: AncientMapEntry) => {
    setActiveMapDialogEntry(entry);
    setIsMapDialogOpen(true);
  }, []);

  const resetMapDialogState = useCallback(() => {
    setIsMapDialogOpen(false);
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

  return {
    isMapDialogOpen,
    activeMapDialogEntry,
    isMapDialogLoading,
    mapDialogError,
    mapDialogGeoJson,
    onMapDialogOpenChange,
    onCloseMapDialog,
    openMapDialog,
    resetMapDialogState,
  };
}
