import { memo, useEffect, useMemo } from "react";
import L from "leaflet";
import {
  GeoJSON as LeafletGeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  boundsForGeoJson,
  mapGeoJsonForDisplay,
  type MapGeoJsonPayload,
} from "@/lib/maps";

const MapBoundsSync = memo(function MapBoundsSync({
  geojson,
}: {
  geojson: MapGeoJsonPayload;
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = boundsForGeoJson(geojson);
    if (!bounds) {
      return;
    }
    const fitBounds = () => map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12, animate: false });
    fitBounds();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
      fitBounds();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [geojson, map]);

  return null;
});

export function MapGeoJsonView({
  geojson,
  className,
}: {
  geojson: MapGeoJsonPayload;
  className?: string;
}) {
  const displayGeoJson = useMemo(
    () => mapGeoJsonForDisplay(geojson),
    [geojson],
  );

  return (
    <MapContainer
      center={[31.5, 35]}
      zoom={6}
      className={className}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LeafletGeoJSON
        data={displayGeoJson as never}
        style={(feature?: { geometry?: { type?: string } }) => ({
          color: "#2563eb",
          weight: 2,
          opacity: 0.9,
          ...(feature?.geometry?.type === "Polygon" || feature?.geometry?.type === "MultiPolygon"
            ? { fill: false }
            : {}),
          fillColor: "#60a5fa",
          fillOpacity: 0.25,
        })}
        pointToLayer={(_feature: unknown, latlng: { lat: number; lng: number }) =>
          L.circleMarker([latlng.lat, latlng.lng], {
            radius: 5,
            color: "#1d4ed8",
            weight: 2,
            fillColor: "#60a5fa",
            fillOpacity: 0.8,
          })
        }
      />
      <MapBoundsSync geojson={displayGeoJson} />
    </MapContainer>
  );
}
