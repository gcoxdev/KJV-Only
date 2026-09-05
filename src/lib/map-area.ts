import type { AncientMapEntry } from "./maps.ts";

// West, south, east, north. Viewports may cross the antimeridian or wrap worlds.
export type MapAreaBounds = [number, number, number, number];

export function isMapAreaBounds(value: unknown): value is MapAreaBounds {
  return Array.isArray(value) && value.length === 4 && value.every(Number.isFinite) &&
    value[1] >= -90 && value[3] <= 90 && value[1] <= value[3];
}

export function mapBoundsOverlap(area: MapAreaBounds, viewport: MapAreaBounds) {
  if (!isMapAreaBounds(area) || !isMapAreaBounds(viewport)) return false;
  if (area[3] < viewport[1] || area[1] > viewport[3]) return false;
  let width = viewport[2] - viewport[0];
  if (width < 0) width = ((width % 360) + 360) % 360;
  if (width >= 360) return true;
  const west = ((viewport[0] + 180) % 360 + 360) % 360 - 180;
  const east = west + width;
  return [-360, 0, 360].some(shift =>
    area[0] <= east + shift && area[2] >= west + shift,
  );
}

export function findMapsInArea(entries: AncientMapEntry[], viewport: MapAreaBounds) {
  return entries.filter(entry => entry.bounds?.some(bounds => mapBoundsOverlap(bounds, viewport)));
}

export function mapAreaKey(bounds: MapAreaBounds) {
  return bounds.map(value => value.toFixed(4)).join(",");
}
