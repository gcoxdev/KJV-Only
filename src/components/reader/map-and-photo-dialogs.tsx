import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { LoaderCircleIcon } from "lucide-react";

import type { AncientMapEntry, MapGeoJsonPayload } from "@/lib/maps";
import { mapEntryLabel } from "@/lib/maps";
import { loadAncientMap } from "@/lib/reader-data";
import { findMapsInArea, mapAreaKey, type MapAreaBounds } from "@/lib/map-area";
import { Button } from "@/components/ui/button";
import { MapAreaResults } from "@/components/reader/map-area-results";
import {
  DEFAULT_MAP_RENDERER,
  isMapRenderer,
  readSessionMapRenderer,
  type MapRenderer,
  writeSessionMapRenderer,
} from "@/lib/map-renderers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

const LazyLeafletMapGeoJsonView = lazy(async () => {
  const module = await import("@/components/reader/map-geojson-view");
  return { default: module.MapGeoJsonView };
});

const LazyOpenFreeMapGeoJsonView = lazy(async () => {
  const module = await import(
    "@/components/reader/open-free-map-geojson-view"
  );
  return { default: module.OpenFreeMapGeoJsonView };
});

class MapRendererErrorBoundary extends Component<
  { children: ReactNode; renderer: MapRenderer },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="text-sm text-destructive" role="alert">
          {this.props.renderer === "open-free-map"
            ? "The English map renderer could not be loaded. Choose Leaflet above to use the fallback map."
            : "The Leaflet map renderer could not be loaded. Choose OpenFreeMap above to use the English map."}
        </p>
      );
    }

    return this.props.children;
  }
}

type MapAndPhotoDialogsProps = {
  isMapDialogOpen: boolean;
  activeMapDialogEntry: AncientMapEntry | null;
  isMapDialogLoading: boolean;
  mapDialogError: string | null;
  mapDialogGeoJson: MapGeoJsonPayload | null;
  onMapDialogOpenChange: (open: boolean) => void;
  onCloseMapDialog: () => void;
  onOpenMap: (entry: AncientMapEntry) => void;
  onOpenReference: (reference: string) => void;
  renderReferencePreview: (reference: string, highlightWord: string) => ReactNode;
};

export function MapAndPhotoDialogs({
  isMapDialogOpen,
  activeMapDialogEntry,
  isMapDialogLoading,
  mapDialogError,
  mapDialogGeoJson,
  onMapDialogOpenChange,
  onCloseMapDialog,
  onOpenMap,
  onOpenReference,
  renderReferencePreview,
}: MapAndPhotoDialogsProps) {
  const [mapRenderer, setMapRenderer] = useState<MapRenderer>(() =>
    typeof window === "undefined"
      ? DEFAULT_MAP_RENDERER
      : readSessionMapRenderer(),
  );
  const MapView =
    mapRenderer === "open-free-map"
      ? LazyOpenFreeMapGeoJsonView
      : LazyLeafletMapGeoJsonView;
  const viewKey = `${mapRenderer}:${activeMapDialogEntry?.geojson_file ?? ""}`;
  const [viewport, setViewport] = useState<{ key: string; bounds: MapAreaBounds } | null>(null);
  const onBoundsChange = useCallback((bounds: MapAreaBounds) => {
    setViewport({ key: viewKey, bounds });
  }, [viewKey]);
  const [areaSearch, setAreaSearch] = useState<{ bounds: MapAreaBounds; entries: AncientMapEntry[] } | null>(null);
  const [showAreaResults, setShowAreaResults] = useState(false);
  const [areaBusy, setAreaBusy] = useState(false);
  const [areaError, setAreaError] = useState<string | null>(null);
  const currentBounds = viewport?.key === viewKey ? viewport.bounds : null;
  const searchArea = async () => {
    if (!currentBounds || areaBusy) return;
    setAreaBusy(true);
    setAreaError(null);
    try {
      const entries = await loadAncientMap();
      if (!entries.some(entry => entry.bounds?.length)) {
        throw new Error("Area search data is unavailable. Reload the app to update it.");
      }
      setAreaSearch({ bounds: currentBounds, entries: findMapsInArea(entries, currentBounds) });
      setShowAreaResults(true);
    } catch (error) {
      setAreaError(error instanceof Error ? error.message : "Could not search this area. Try again.");
    } finally {
      setAreaBusy(false);
    }
  };

  return (
    <AlertDialog open={isMapDialogOpen} onOpenChange={onMapDialogOpenChange}>
      <AlertDialogContent className="flex h-[min(86vh,900px)] w-[min(98vw,1700px)]! max-w-none! flex-col">
        <div className="flex min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <AlertDialogHeader className="min-w-0 flex-1 sm:place-items-start sm:text-left">
            <AlertDialogTitle>
              {activeMapDialogEntry
                ? mapEntryLabel(activeMapDialogEntry)
                : "Map"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeMapDialogEntry?.types.length
                ? activeMapDialogEntry.types.join(", ")
                : "Location and geometry from the selected map entry."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Map
            </span>
            <ToggleGroup
              aria-label="Map renderer"
              value={[mapRenderer]}
              onValueChange={(value) => {
                const nextRenderer = value[0];
                if (isMapRenderer(nextRenderer)) {
                  setMapRenderer(nextRenderer);
                  writeSessionMapRenderer(nextRenderer);
                }
              }}
              variant="outline"
              size="sm"
              spacing={0}
            >
              <ToggleGroupItem
                value="open-free-map"
                title="OpenFreeMap with English-first labels"
              >
                OpenFreeMap
              </ToggleGroupItem>
              <ToggleGroupItem
                value="leaflet"
                title="Leaflet with local-language OpenStreetMap tiles"
              >
                Leaflet
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <div className="relative isolate min-h-0 flex-1">
          {isMapDialogLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Loading map...
            </p>
          ) : mapDialogError ? (
            <p className="text-sm text-destructive">{mapDialogError}</p>
          ) : mapDialogGeoJson ? (
            <MapRendererErrorBoundary
              key={mapRenderer}
              renderer={mapRenderer}
            >
              <Suspense
                fallback={
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Loading map renderer...
                  </p>
                }
              >
                <MapView
                  key={activeMapDialogEntry?.geojson_file}
                  geojson={mapDialogGeoJson}
                  onBoundsChange={onBoundsChange}
                  className="relative z-0 h-full w-full rounded-md border"
                />
              </Suspense>
            </MapRendererErrorBoundary>
          ) : (
            <p className="text-sm text-muted-foreground">No map data found.</p>
          )}
          {showAreaResults && areaSearch ? (
            <MapAreaResults
              key={mapAreaKey(areaSearch.bounds)}
              entries={areaSearch.entries}
              viewChanged={!currentBounds || mapAreaKey(currentBounds) !== mapAreaKey(areaSearch.bounds)}
              onHide={() => setShowAreaResults(false)}
              onOpenMap={(entry) => { setShowAreaResults(false); onOpenMap(entry); }}
              onOpenReference={onOpenReference}
              renderPreview={renderReferencePreview}
            />
          ) : null}
        </div>
        {areaError ? <p role="alert" className="text-sm text-destructive">{areaError}</p> : null}
        <AlertDialogFooter className="shrink-0 flex-row flex-wrap items-center justify-end py-3 sm:flex sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => void searchArea()} disabled={areaBusy || isMapDialogLoading || !!mapDialogError || !currentBounds}>
            {areaBusy ? "Searching area..." : "Search this area"}
          </Button>
          {areaSearch && !showAreaResults ? <Button variant="ghost" size="sm" onClick={() => setShowAreaResults(true)}>Results ({areaSearch.entries.length})</Button> : null}
          <AlertDialogAction onClick={onCloseMapDialog} className="w-auto">
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
