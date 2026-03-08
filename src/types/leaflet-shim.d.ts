declare module "leaflet" {
  const L: {
    circleMarker: (
      latlng: [number, number],
      options?: Record<string, unknown>,
    ) => unknown;
  };

  export default L;
}

declare module "react-leaflet" {
  import type { ComponentType } from "react";

  export const MapContainer: ComponentType<Record<string, unknown>>;
  export const TileLayer: ComponentType<Record<string, unknown>>;
  export const GeoJSON: ComponentType<Record<string, unknown>>;
  export function useMap(): {
    fitBounds: (bounds: unknown, options?: unknown) => void;
  };
}
