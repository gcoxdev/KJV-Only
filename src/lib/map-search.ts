import { isMapAreaBounds, type MapAreaBounds } from "./map-area.ts";

export type MapSearchResult = { id: string; label: string; center: [number, number]; bounds?: MapAreaBounds };
export const MAP_SEARCH_URL = "https://photon.komoot.io/api/";
const cache = new Map<string, MapSearchResult[]>();
let lastRequestAt = 0;

export function parseMapSearchResults(payload: unknown): MapSearchResult[] {
  if (!payload || typeof payload !== "object" || !("features" in payload) || !Array.isArray(payload.features)) {
    throw new Error("Place search returned an unreadable response. Try again.");
  }
  return payload.features.flatMap((feature: unknown, index: number) => {
    if (!feature || typeof feature !== "object") return [];
    const { geometry, properties } = feature as { geometry?: { type?: string; coordinates?: unknown }; properties?: Record<string, unknown> };
    const coordinates = geometry?.coordinates;
    if (geometry?.type !== "Point" || !Array.isArray(coordinates) || coordinates.length < 2 ||
      !coordinates.slice(0, 2).every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90 || !properties) return [];
    const label = [...new Set([properties.name, properties.housenumber, properties.street, properties.city, properties.state, properties.country]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0))].join(", ");
    if (!label) return [];
    // Photon extent is west, north, east, south.
    const extent = properties.extent;
    const bounds = Array.isArray(extent) ? [extent[0], extent[3], extent[2], extent[1]] : null;
    return [{ id: `${String(properties.osm_type ?? "place")}:${String(properties.osm_id ?? index)}`,
      label, center: [coordinates[0], coordinates[1]] as [number, number],
      ...(isMapAreaBounds(bounds) && bounds[0] >= -180 && bounds[2] <= 180 && bounds[0] <= bounds[2] ? { bounds } : {}),
    }];
  }).slice(0, 5);
}

export async function searchMapPlaces(query: string, signal: AbortSignal): Promise<MapSearchResult[]> {
  const term = query.trim().replace(/\s+/g, " ");
  if (term.length < 2) return [];
  const key = term.toLowerCase();
  signal.throwIfAborted();
  const cached = cache.get(key);
  if (cached) return cached;
  if (Date.now() - lastRequestAt < 1000) throw new Error("Please wait a moment before searching again.");
  lastRequestAt = Date.now();
  const url = new URL(MAP_SEARCH_URL);
  url.search = new URLSearchParams({ q: term, lang: "en", limit: "5" }).toString();
  const response = await fetch(url, { signal, credentials: "omit" });
  if (!response.ok) throw new Error("Place search is unavailable. Try again shortly.");
  const results = parseMapSearchResults(await response.json());
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  cache.set(key, results);
  return results;
}
