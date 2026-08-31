import { useEffect, useRef, useState } from "react";
import {
  GPUInitializationError,
  Map as MapLibreMap,
  NavigationControl,
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

const OPEN_FREE_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
const GEOJSON_SOURCE_ID = "kjv-map-geometry";
const GEOJSON_FILL_LAYER_ID = "kjv-map-geometry-fill";
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

  return "The English map could not be loaded. Choose Leaflet above to try the fallback map.";
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
    id: GEOJSON_FILL_LAYER_ID,
    type: "fill",
    source: GEOJSON_SOURCE_ID,
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "fill-color": "#60a5fa",
      "fill-opacity": 0.25,
    },
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
    { animate: false, maxZoom: 12, padding: 24 },
  );
}

export function OpenFreeMapGeoJsonView({
  geojson,
  className,
}: {
  geojson: MapGeoJsonPayload;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<MapStatus>({ state: "loading" });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let styleLoaded = false;
    let map: MapLibreMap | null = null;
    const abortController = new AbortController();
    const displayGeoJson = mapGeoJsonForDisplay(geojson);

    const reportFailure = (error: unknown) => {
      if (disposed || styleLoaded) {
        return;
      }
      setStatus({ state: "error", message: mapErrorMessage(error) });
    };

    void loadOpenFreeMapStyle(abortController.signal)
      .then((style) => {
        if (disposed) {
          return;
        }

        map = new MapLibreMap({
          attributionControl: { compact: true },
          center: [35, 31.5],
          container,
          dragRotate: false,
          pitchWithRotate: false,
          style,
          touchPitch: false,
          zoom: 6,
        });

        map.touchZoomRotate.disableRotation();
        map.addControl(
          new NavigationControl({ showCompass: false }),
          "top-left",
        );

        const canvas = map.getCanvas();
        canvas.setAttribute("aria-label", "Interactive English map");

        map.on("error", (event: MapLibreErrorEvent) => {
          reportFailure(event.error);
        });

        map.once("load", () => {
          if (disposed || !map) {
            return;
          }

          try {
            applyEnglishLabels(map);
            addGeoJsonLayers(map, displayGeoJson);
            fitGeoJsonBounds(map, displayGeoJson);
            styleLoaded = true;
            setStatus({ state: "ready" });
          } catch (error) {
            reportFailure(error);
          }
        });
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
        reportFailure(error);
        container.replaceChildren();
      });

    return () => {
      disposed = true;
      abortController.abort();
      map?.remove();
    };
  }, [geojson]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      data-map-renderer="open-free-map"
    >
      <div ref={containerRef} className="h-full w-full" />
      {status.state !== "ready" ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center text-sm text-muted-foreground"
          role={status.state === "error" ? "alert" : "status"}
        >
          {status.state === "error" ? status.message : "Loading English map..."}
        </div>
      ) : null}
    </div>
  );
}
