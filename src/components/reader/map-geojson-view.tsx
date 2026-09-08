import { memo, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { CircleMarker, GeoJSON as LeafletGeoJSON, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

import { boundsForGeoJson, mapGeoJsonForDisplay } from "@/lib/maps";
import { LEAFLET_WHEEL_PIXELS, MAP_PADDING, PLACE_ZOOM, rasterBasemap, type MapViewProps } from "@/lib/map-view";

const MapBoundsSync = memo(function MapBoundsSync({ geojson, onBoundsChange, onCameraChange, initialCamera, viewRequest }: MapViewProps) {
  const map = useMap();
  const initial = useRef(initialCamera);
  const appliedRequest = useRef(initialCamera ? viewRequest?.id : undefined);

  useEffect(() => {
    const reportBounds = () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      map.getContainer().dataset.mapZoom = String(map.getZoom());
      map.getContainer().dataset.mapCenter = JSON.stringify([center.lng, center.lat]);
      onBoundsChange?.([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
      onCameraChange?.({ center: [center.lng, center.lat], zoom: map.getZoom() });
    };
    map.on("moveend", reportBounds);
    reportBounds();
    return () => { map.off("moveend", reportBounds); };
  }, [map, onBoundsChange, onCameraChange]);

  useEffect(() => {
    const bounds = boundsForGeoJson(geojson);
    if (initial.current) map.setView([initial.current.center[1], initial.current.center[0]], initial.current.zoom, { animate: false });
    else if (bounds) map.fitBounds(bounds, { padding: [MAP_PADDING, MAP_PADDING], maxZoom: PLACE_ZOOM, animate: false });
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [geojson, map]);

  useEffect(() => {
    if (!viewRequest || appliedRequest.current === viewRequest.id) return;
    appliedRequest.current = viewRequest.id;
    const target = viewRequest.target;
    if (target?.bounds) {
      const [west, south, east, north] = target.bounds;
      map.fitBounds([[south, west], [north, east]], { padding: [MAP_PADDING, MAP_PADDING], maxZoom: PLACE_ZOOM, animate: false });
    } else if (target) map.setView([target.center[1], target.center[0]], PLACE_ZOOM, { animate: false });
    else {
      const bounds = boundsForGeoJson(geojson);
      if (bounds) map.fitBounds(bounds, { padding: [MAP_PADDING, MAP_PADDING], maxZoom: PLACE_ZOOM, animate: false });
    }
  }, [map, geojson, viewRequest]);
  return null;
});

export function MapGeoJsonView({ geojson, className, onBoundsChange, onCameraChange, initialCamera, mapStyle = "regular", showAreas = true, viewRequest }: MapViewProps) {
  const displayGeoJson = useMemo(() => mapGeoJsonForDisplay(geojson), [geojson]);
  const tiles = rasterBasemap(mapStyle);
  const [tileError, setTileError] = useState<string | null>(null);
  const target = viewRequest?.target;
  return (
    <div className={className} data-map-renderer="leaflet">
      <MapContainer center={[31.5, 35]} zoom={6} maxZoom={20} zoomSnap={0.25} zoomDelta={1}
        wheelPxPerZoomLevel={LEAFLET_WHEEL_PIXELS} className="h-full w-full rounded-md" scrollWheelZoom>
        <TileLayer key={mapStyle} attribution={tiles.attribution} url={tiles.url} maxNativeZoom={tiles.maxNativeZoom} maxZoom={20}
          eventHandlers={{ tileerror: () => setTileError(mapStyle), tileload: () => setTileError(null) }} />
        {showAreas ? <LeafletGeoJSON data={displayGeoJson as never}
          style={() => ({ color: "#2563eb", weight: 2, opacity: 0.9, fill: false })}
          pointToLayer={(_feature: unknown, latlng: { lat: number; lng: number }) => L.circleMarker([latlng.lat, latlng.lng], {
            radius: 5, color: "#1d4ed8", weight: 2, fillColor: "#60a5fa", fillOpacity: 0.8,
          })} /> : null}
        {target && target.showMarker !== false ? <CircleMarker center={[target.center[1], target.center[0]]} radius={7}
          pathOptions={{ color: "#b91c1c", fillColor: "#ef4444", fillOpacity: 0.9, weight: 2 }}>
          <Tooltip>{target.label}</Tooltip>
        </CircleMarker> : null}
        <MapBoundsSync geojson={displayGeoJson} onBoundsChange={onBoundsChange} onCameraChange={onCameraChange}
          initialCamera={initialCamera} viewRequest={viewRequest} />
      </MapContainer>
      {tileError === mapStyle ? <p role="status" className="absolute top-2 right-2 max-w-60 rounded-md border bg-background p-2 text-xs">
        Some background tiles could not load. Try another map style or check your connection.
      </p> : null}
    </div>
  );
}
