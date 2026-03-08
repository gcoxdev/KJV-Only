export type AncientMapRole = {
  description?: string;
  score?: number;
};

export type AncientMapEntry = {
  verses: string[];
  translations: string[];
  types: string[];
  geojson_file: string;
  geojson_roles?: Record<string, AncientMapRole>;
};

export type AncientMapPayload = AncientMapEntry[];

export type MapGeoJsonPayload = {
  type?: string;
  bbox?: number[];
  features?: Array<{
    type?: string;
    geometry?: {
      type?: string;
      coordinates?: unknown;
    };
  }>;
};

export type MapImageThumbnail = {
  file?: string;
  description?: string;
};

export type MapImageEntry = {
  id: string;
  credit?: string;
  credit_url?: string;
  url?: string;
  file_url?: string;
  license?: string;
  descriptions?: Record<string, string>;
  thumbnails?: Record<string, MapImageThumbnail>;
};

export type MapPhotoDialogItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export function mapEntryLabel(entry: AncientMapEntry) {
  return entry.translations[0] ?? entry.geojson_file.replace(".geojson", "");
}

export function matchesMapWord(
  entry: AncientMapEntry,
  rawWord: string,
  normalizeWord: (value: string) => string,
) {
  const cleaned = normalizeWord(rawWord).toLowerCase();
  if (!cleaned) {
    return false;
  }

  return entry.translations.some(
    (name) => normalizeWord(name).toLowerCase() === cleaned,
  );
}

export function mapEntrySearchableText(entry: AncientMapEntry) {
  return [
    ...entry.translations,
    ...entry.types,
    ...entry.verses,
    entry.geojson_file,
  ]
    .join(" ")
    .toLowerCase();
}

export function cleanMapMarkup(input: string) {
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function modernIdsForMapEntry(entry: AncientMapEntry) {
  const ids = new Set<string>();
  for (const roleKey of Object.keys(entry.geojson_roles ?? {})) {
    const [root] = roleKey.split(".");
    if (/^m[0-9a-f]{6}$/i.test(root)) {
      ids.add(root);
    }
  }
  return [...ids];
}

function extractCoordinateBounds(
  coordinates: unknown,
  accumulator: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  if (!Array.isArray(coordinates)) {
    return;
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    const lng = coordinates[0];
    const lat = coordinates[1];
    accumulator.minLat = Math.min(accumulator.minLat, lat);
    accumulator.maxLat = Math.max(accumulator.maxLat, lat);
    accumulator.minLng = Math.min(accumulator.minLng, lng);
    accumulator.maxLng = Math.max(accumulator.maxLng, lng);
    return;
  }

  for (const item of coordinates) {
    extractCoordinateBounds(item, accumulator);
  }
}

export function boundsForGeoJson(payload: MapGeoJsonPayload) {
  if (Array.isArray(payload.bbox) && payload.bbox.length >= 4) {
    return [
      [payload.bbox[1], payload.bbox[0]],
      [payload.bbox[3], payload.bbox[2]],
    ] as [[number, number], [number, number]];
  }

  const bounds = {
    minLat: Number.POSITIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY,
    minLng: Number.POSITIVE_INFINITY,
    maxLng: Number.NEGATIVE_INFINITY,
  };

  for (const feature of payload.features ?? []) {
    extractCoordinateBounds(feature.geometry?.coordinates, bounds);
  }

  if (
    !Number.isFinite(bounds.minLat) ||
    !Number.isFinite(bounds.maxLat) ||
    !Number.isFinite(bounds.minLng) ||
    !Number.isFinite(bounds.maxLng)
  ) {
    return null;
  }

  return [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  ] as [[number, number], [number, number]];
}

export function parseJsonl<T>(text: string) {
  return text
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

export function deriveMapPhotoDialogItems(
  photoEntries: MapImageEntry[],
  modernIds: string[],
  fallbackTitle: string,
) {
  return photoEntries
    .map((item) => {
      const locationId = modernIds.find((id) =>
        Boolean(item.thumbnails?.[id]?.file ?? item.descriptions?.[id]),
      );
      const file = locationId ? item.thumbnails?.[locationId]?.file : undefined;
      if (!file) {
        return null;
      }

      const description = cleanMapMarkup(
        (locationId
          ? (item.thumbnails?.[locationId]?.description ??
            item.descriptions?.[locationId])
          : undefined) ??
          item.credit ??
          fallbackTitle,
      );

      return {
        id: item.id,
        src: `/maps/thumbnails/${file}`,
        alt: description,
        caption: description,
      } satisfies MapPhotoDialogItem;
    })
    .filter((item): item is MapPhotoDialogItem => Boolean(item));
}
