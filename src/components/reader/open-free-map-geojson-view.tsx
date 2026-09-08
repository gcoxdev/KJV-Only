import { useEffect, useRef, useState } from "react";
import {
  GPUInitializationError,
  Map as MapLibreMap,
  NavigationControl,
  Marker,
  Popup,
  setWorkerUrl,
  type ErrorEvent as MapLibreErrorEvent,
  type GeoJSONSourceSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import mapLibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import { cn } from "@/lib/utils";
import {
  boundsForGeoJson,
  mapGeoJsonForDisplay,
  type MapGeoJsonPayload,
} from "@/lib/maps";
import {
  containsMapNameField,
  ENGLISH_MAP_NAME_EXPRESSION,
  normalizeOpenFreeMapStyle,
} from "@/lib/map-renderers";

import { MAPLIBRE_TRACKPAD_RATE, MAPLIBRE_WHEEL_RATE, MAP_PADDING, PLACE_ZOOM, rasterBasemap, rendererZoom, type MapViewProps, type MapViewRequest } from "@/lib/map-view";

const OPEN_FREE_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
const GEOJSON_SOURCE_ID = "kjv-map-geometry";
const GEOJSON_LINE_LAYER_ID = "kjv-map-geometry-line";

setWorkerUrl(mapLibreWorkerUrl);

type MapStatus =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

function mapErrorMessage(error: unknown) {
  if (error instanceof GPUInitializationError) {
    return "The English map requires WebGL 2, which is unavailable in this browser. Choose Leaflet above to use the fallback map.";
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Background maps require a connection. The downloaded Maps bundle keeps place data and geometry available offline, but not provider tiles.";
  }

  return "The map could not be loaded. Try another map style or choose Leaflet.";
}

function applyEnglishLabels(map: MapLibreMap) {
  for (const layer of map.getStyle().layers ?? []) {
    if (
      layer.type !== "symbol" ||
      !containsMapNameField(layer.layout?.["text-field"])
    ) {
      continue;
    }

    map.setLayoutProperty(
      layer.id,
      "text-field",
      ENGLISH_MAP_NAME_EXPRESSION,
    );
  }
}

async function loadOpenFreeMapStyle(signal: AbortSignal) {
  const response = await fetch(OPEN_FREE_MAP_STYLE_URL, {
    cache: "force-cache",
    signal,
  });
  if (!response.ok) {
    throw new Error(`Could not load ${OPEN_FREE_MAP_STYLE_URL}`);
  }

  const style = (await response.json()) as StyleSpecification;
  return normalizeOpenFreeMapStyle(style);
}

function addGeoJsonLayers(map: MapLibreMap, geojson: MapGeoJsonPayload) {
  map.addSource(GEOJSON_SOURCE_ID, {
    type: "geojson",
    data: geojson as GeoJSONSourceSpecification["data"],
  });

  map.addLayer({
    id: GEOJSON_LINE_LAYER_ID,
    type: "line",
    source: GEOJSON_SOURCE_ID,
    filter: [
      "any",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["geometry-type"], "Polygon"],
    ],
    paint: {
      "line-color": "#2563eb",
      "line-opacity": 0.9,
      "line-width": 2,
    },
  });

  if (
    geojson.features?.some(
      (feature) =>
        feature.geometry?.type === "Point" ||
        feature.geometry?.type === "MultiPoint",
    )
  ) {
    map.addLayer({
      id: "kjv-map-geometry-points",
      type: "circle",
      source: GEOJSON_SOURCE_ID,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-color": "#60a5fa",
        "circle-opacity": 0.8,
        "circle-radius": 5,
        "circle-stroke-color": "#1d4ed8",
        "circle-stroke-width": 2,
      },
    });
  }
}

function fitGeoJsonBounds(map: MapLibreMap, geojson: MapGeoJsonPayload) {
  const bounds = boundsForGeoJson(geojson);
  if (!bounds) {
    return;
  }

  map.fitBounds(
    [
      [bounds[0][1], bounds[0][0]],
      [bounds[1][1], bounds[1][0]],
    ],
    { animate: false, maxZoom: rendererZoom(PLACE_ZOOM, "open-free-map"), padding: MAP_PADDING },
  );
}

function applyViewRequest(map: MapLibreMap, geojson: MapGeoJsonPayload, request: MapViewRequest) {
  const target = request.target;
  if (target?.bounds) {
    const [west, south, east, north] = target.bounds;
    map.fitBounds([[west, south], [east, north]], { animate: false, padding: MAP_PADDING, maxZoom: rendererZoom(PLACE_ZOOM, "open-free-map") });
  } else if (target) map.jumpTo({ center: target.center, zoom: rendererZoom(PLACE_ZOOM, "open-free-map") });
  else fitGeoJsonBounds(map, geojson);
}

function setAreasVisible(map: MapLibreMap, visible: boolean) {
  for (const id of [GEOJSON_LINE_LAYER_ID, "kjv-map-geometry-points"]) {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  }
}

export function OpenFreeMapGeoJsonView({ geojson, className, onBoundsChange, onCameraChange, initialCamera,
  mapStyle = "regular", showAreas = true, viewRequest }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const cameraRef = useRef(initialCamera);
  const controlsRef = useRef({ showAreas, viewRequest });
  const appliedRequestRef = useRef(initialCamera ? viewRequest?.id : undefined);
  const markerRef = useRef<Marker | null>(null);
  const [status, setStatus] = useState<MapStatus>({ state: "loading" });
  const [tileError, setTileError] = useState<string | null>(null);

  useEffect(() => {
    controlsRef.current = { showAreas, viewRequest };
    const map = mapRef.current;
    if (!map?.getSource(GEOJSON_SOURCE_ID)) return;
    setAreasVisible(map, showAreas);
    if (viewRequest && appliedRequestRef.current !== viewRequest.id) {
      appliedRequestRef.current = viewRequest.id;
      applyViewRequest(map, mapGeoJsonForDisplay(geojson), viewRequest);
    }
    markerRef.current?.remove();
    markerRef.current = viewRequest?.target && viewRequest.target.showMarker !== false
      ? new Marker({ color: "#b91c1c" }).setLngLat(viewRequest.target.center)
          .setPopup(new Popup().setText(viewRequest.target.label)).addTo(map) : null;
  }, [showAreas, viewRequest, geojson]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setStatus({ state: "loading" });
    setTileError(null);
    let disposed = false;
    let styleLoaded = false;
    let map: MapLibreMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const abortController = new AbortController();
    const displayGeoJson = mapGeoJsonForDisplay(geojson);
    const reportFailure = (error: unknown) => {
      if (disposed) return;
      if (styleLoaded) { setTileError(mapStyle); return; }
      setStatus({ state: "error", message: mapErrorMessage(error) });
    };
    const tiles = rasterBasemap(mapStyle);
    const stylePromise: Promise<StyleSpecification> = mapStyle === "regular"
      ? loadOpenFreeMapStyle(abortController.signal)
      : Promise.resolve({ version: 8, sources: { basemap: {
          type: "raster", tiles: [tiles.url], tileSize: 256, maxzoom: tiles.maxNativeZoom, attribution: tiles.attribution,
        } }, layers: [{ id: "basemap", type: "raster", source: "basemap" }] });

    void stylePromise.then(style => {
      if (disposed) return;
      map = new MapLibreMap({ attributionControl: { compact: true }, center: [35, 31.5], container,
        dragRotate: false, pitchWithRotate: false, style, touchPitch: false, zoom: 5, maxZoom: 19 });
      mapRef.current = map;
      map.scrollZoom.setWheelZoomRate(MAPLIBRE_WHEEL_RATE);
      map.scrollZoom.setZoomRate(MAPLIBRE_TRACKPAD_RATE);
      map.touchZoomRotate.disableRotation();
      map.addControl(new NavigationControl({ showCompass: false }), "top-left");
      map.getCanvas().setAttribute("aria-label", "Interactive map");
      map.on("error", (event: MapLibreErrorEvent) => reportFailure(event.error));
      map.once("style.load", () => {
        if (disposed || !map) return;
        try {
          const reportBounds = () => {
            if (!map || disposed) return;
            const bounds = map.getBounds();
            const center = map.getCenter();
            const camera = { center: [center.lng, center.lat] as [number, number], zoom: map.getZoom() + 1 };
            cameraRef.current = camera;
            container.dataset.mapZoom = String(camera.zoom);
            container.dataset.mapCenter = JSON.stringify(camera.center);
            onBoundsChange?.([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
            onCameraChange?.(camera);
          };
          map.on("moveend", reportBounds);
          if (mapStyle === "regular") applyEnglishLabels(map);
          addGeoJsonLayers(map, displayGeoJson);
          setAreasVisible(map, controlsRef.current.showAreas);
          if (cameraRef.current) map.jumpTo({ center: cameraRef.current.center, zoom: rendererZoom(cameraRef.current.zoom, "open-free-map") });
          else fitGeoJsonBounds(map, displayGeoJson);
          const request = controlsRef.current.viewRequest;
          if (request && appliedRequestRef.current !== request.id) {
            appliedRequestRef.current = request.id;
            applyViewRequest(map, displayGeoJson, request);
          }
          if (request?.target && request.target.showMarker !== false) markerRef.current = new Marker({ color: "#b91c1c" }).setLngLat(request.target.center)
            .setPopup(new Popup().setText(request.target.label)).addTo(map);
          resizeObserver = new ResizeObserver(() => { if (!disposed) map?.resize(); });
          resizeObserver.observe(container);
          reportBounds();
          styleLoaded = true;
          setStatus({ state: "ready" });
        } catch (error) { reportFailure(error); }
      });
    }).catch((error: unknown) => {
      if (abortController.signal.aborted) return;
      reportFailure(error);
    });
    return () => {
      disposed = true;
      abortController.abort();
      resizeObserver?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, [geojson, mapStyle, onBoundsChange, onCameraChange]);

  return (
    <div className={cn("relative overflow-hidden", className)} data-map-renderer="open-free-map">
      <div ref={containerRef} className="h-full w-full" />
      {status.state !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center text-sm text-muted-foreground"
          role={status.state === "error" ? "alert" : "status"}>
          {status.state === "error" ? status.message : "Loading map..."}
        </div>
      ) : null}
      {status.state === "ready" && tileError === mapStyle ? <p role="status" className="absolute top-2 right-2 max-w-60 rounded-md border bg-background p-2 text-xs">
        Some background tiles could not load. Try another map style or check your connection.
      </p> : null}
    </div>
  );
}
