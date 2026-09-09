import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LocateFixedIcon, LayersIcon, LoaderCircleIcon } from "lucide-react";

import type { AncientMapEntry, MapGeoJsonPayload } from "@/lib/maps";
import { mapConfidenceSummary, mapEntryLabel } from "@/lib/maps";
import { loadAncientMap } from "@/lib/reader-data";
import { findMapsInArea, mapAreaKey, type MapAreaBounds } from "@/lib/map-area";
import { Button } from "@/components/ui/button";
import { DialogDismissButton } from "@/components/reader/dialog-dismiss-button";
import { MapPlaceSearch } from "@/components/reader/map-place-search";
import { MapProposedLocations } from "@/components/reader/map-proposed-locations";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MapCamera, MapStyle, MapViewRequest } from "@/lib/map-view";
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
  const [mapStyle, setMapStyle] = useState<MapStyle>("regular");
  const [showAreas, setShowAreas] = useState(true);
  const [camera, setCamera] = useState<{ entry: string; value: MapCamera } | null>(null);
  const entryKey = activeMapDialogEntry?.geojson_file ?? "";
  const onCameraChange = useCallback((value: MapCamera) => setCamera({ entry: entryKey, value }), [entryKey]);
  const [viewCommand, setViewCommand] = useState<{ entry: string; request: MapViewRequest; identificationId?: string } | null>(null);
  const viewRequest = viewCommand?.entry === entryKey ? viewCommand.request : undefined;
  const requestView = (target: MapViewRequest["target"], identificationId?: string) => {
    setShowAreaResults(false);
    setViewCommand(previous => ({ entry: entryKey, identificationId, request: { id: (previous?.request.id ?? 0) + 1, target } }));
  };
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
  const areaRequest = useRef(0);
  useEffect(() => {
    if (isMapDialogOpen) return;
    areaRequest.current += 1;
    setCamera(null);
    setViewCommand(null);
    setViewport(null);
    setAreaSearch(null);
    setShowAreaResults(false);
    setAreaBusy(false);
    setAreaError(null);
  }, [isMapDialogOpen]);
  const currentBounds = viewport?.key === viewKey ? viewport.bounds : null;
  const searchArea = async () => {
    if (!currentBounds || areaBusy) return;
    const requestId = ++areaRequest.current;
    setAreaBusy(true);
    setAreaError(null);
    try {
      const entries = await loadAncientMap();
      if (areaRequest.current !== requestId) return;
      if (!entries.some(entry => entry.bounds?.length)) {
        throw new Error("Area search data is unavailable. Reload the app to update it.");
      }
      setAreaSearch({ bounds: currentBounds, entries: findMapsInArea(entries, currentBounds) });
      setShowAreaResults(true);
    } catch (error) {
      if (areaRequest.current !== requestId) return;
      setAreaError(error instanceof Error ? error.message : "Could not search this area. Try again.");
    } finally {
      if (areaRequest.current === requestId) setAreaBusy(false);
    }
  };

  return (
    <AlertDialog open={isMapDialogOpen} onOpenChange={onMapDialogOpenChange}>
      <AlertDialogContent className="flex h-[min(94dvh,900px)] w-[min(98vw,1700px)]! max-w-none! flex-col gap-2 p-3">
        <DialogDismissButton onClose={onCloseMapDialog} />
        <div className="flex min-w-0 shrink-0 items-start justify-between gap-2 pr-9">
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
        <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-2">
          <MapPlaceSearch key={entryKey || "closed"} onSelect={result => requestView(result)} />
          <Select items={[{ value: "regular", label: "Regular" }, { value: "topographic", label: "Topographic" }]}
            value={mapStyle} onValueChange={value => { if (value === "regular" || value === "topographic") setMapStyle(value); }}>
            <SelectTrigger aria-label="Map style" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="topographic">Topographic</SelectItem>
            </SelectGroup></SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => requestView(null)} disabled={!mapDialogGeoJson || isMapDialogLoading}>
            <LocateFixedIcon data-icon="inline-start" /> Recenter
          </Button>
          <Button variant="outline" size="sm" aria-pressed={showAreas} onClick={() => setShowAreas(visible => !visible)}>
            <LayersIcon data-icon="inline-start" /> {showAreas ? "Hide areas" : "Show areas"}
          </Button>
          {activeMapDialogEntry ? <MapProposedLocations key={`${entryKey}:${isMapDialogOpen}`}
            entry={activeMapDialogEntry} geojson={mapDialogGeoJson}
            selectedId={viewCommand?.entry === entryKey ? viewCommand.identificationId : undefined}
            disabled={isMapDialogLoading || !!mapDialogError}
            onSelect={(target, identificationId) => {
              setShowAreas(true);
              requestView(target, identificationId);
            }} /> : null}
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
                  mapStyle={mapStyle}
                  showAreas={showAreas}
                  viewRequest={viewRequest}
                  initialCamera={camera?.entry === entryKey ? camera.value : undefined}
                  onCameraChange={onCameraChange}
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
        <AlertDialogFooter className="-mx-3 -mb-3 shrink-0 flex-row flex-wrap items-center justify-end px-3 py-2 sm:flex sm:justify-end">
          <p role="status" aria-label="Location confidence"
            title="Estimated confidence in the location identification, not coordinate precision."
            className="mr-auto min-w-0 basis-full text-left text-xs text-muted-foreground sm:basis-auto sm:flex-1">
            {isMapDialogLoading ? "Loading location…" : mapConfidenceSummary(activeMapDialogEntry,
              viewCommand?.entry === entryKey ? viewCommand.identificationId : undefined,
              !!viewRequest?.target && !viewCommand?.identificationId)}
          </p>
          <Button variant="outline" size="sm" onClick={() => void searchArea()} disabled={areaBusy || isMapDialogLoading || !!mapDialogError || !currentBounds}>
            {areaBusy ? "Searching area..." : "Search this area"}
          </Button>
          {areaSearch && !showAreaResults ? <Button variant="ghost" size="sm" onClick={() => setShowAreaResults(true)}>Results ({areaSearch.entries.length})</Button> : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
