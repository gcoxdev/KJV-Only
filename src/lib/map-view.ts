import type { MapAreaBounds } from "./map-area.ts";
import type { MapGeoJsonPayload } from "./maps.ts";
import type { MapRenderer } from "./map-renderers.ts";

export type MapStyle = "regular" | "topographic";
// Shared zoom uses 256px tiles; MapLibre's camera uses a 512px world at zoom 0.
export const PLACE_ZOOM = 15;
export const MAP_PADDING = 24;
export const LEAFLET_WHEEL_PIXELS = 180;
export const MAPLIBRE_WHEEL_RATE = 1 / 160;
export const MAPLIBRE_TRACKPAD_RATE = 1 / 80;
export function rendererZoom(zoom: number, renderer: MapRenderer) {
  return renderer === "open-free-map" ? zoom - 1 : zoom;
}

export type MapCamera = { center: [number, number]; zoom: number };
export type MapViewRequest = {
  id: number;
  target: { center: [number, number]; bounds?: MapAreaBounds; label: string; showMarker?: boolean } | null;
};
export type MapViewProps = {
  geojson: MapGeoJsonPayload;
  className?: string;
  onBoundsChange?: (bounds: MapAreaBounds) => void;
  onCameraChange?: (camera: MapCamera) => void;
  initialCamera?: MapCamera;
  mapStyle?: MapStyle;
  showAreas?: boolean;
  viewRequest?: MapViewRequest;
};

export type RasterBasemap = { url: string; attribution: string; maxNativeZoom: number };
export const REGULAR_RASTER: RasterBasemap = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxNativeZoom: 19,
};
export const TOPOGRAPHIC_RASTER: RasterBasemap = {
  url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  maxNativeZoom: 17,
};

export function rasterBasemap(style: MapStyle): RasterBasemap {
  return style === "topographic" ? TOPOGRAPHIC_RASTER : REGULAR_RASTER;
}
