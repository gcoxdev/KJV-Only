import { cleanMapMarkup, type MapGeoJsonPayload, type MapIdentification } from "../../src/lib/maps.ts";

type SourceEntry = {
  id: string;
  identifications?: Array<{
    description?: string;
    score?: { time_total?: number };
    resolutions?: Array<{ best_time_score?: number; geojson_roles?: Record<string, { id?: string }> }>;
  }>;
};

/** Preserve upstream alternatives, grouping all geometry roles for each one. */
export function buildMapIdentifications(entry: SourceEntry, geometry: MapGeoJsonPayload) {
  if (!entry.identifications?.length) return {};
  const available = new Set(geometry.features?.map(feature => feature.properties?.id));
  const identifications: MapIdentification[] = entry.identifications.map((identification, index) => {
    const mappedResolutions = (identification.resolutions ?? []).filter(resolution =>
      Object.values(resolution.geojson_roles ?? {}).some(role => typeof role.id === "string" && available.has(role.id)),
    );
    const score = identification.score?.time_total;
    // OpenBible's documented 0–1000 time-weighted scale, adjusted for indirect
    // identifications using the most supported mapped resolution. Vote totals
    // are not percentages. Clamp extrapolated negative/over-range estimates.
    const clamp = (value: number) => Math.max(0, Math.min(1000, value));
    const validPaths = mappedResolutions.every(resolution => resolution.best_time_score === undefined ||
      (typeof resolution.best_time_score === "number" && Number.isFinite(resolution.best_time_score)));
    const confidence = typeof score === "number" && Number.isFinite(score) && mappedResolutions.length && validPaths
      ? Math.round(Math.max(...mappedResolutions.map(resolution => {
          const pathScore = resolution.best_time_score;
          return clamp(score) * (pathScore === undefined ? 1 : clamp(pathScore) / 1000);
        })))
      : undefined;
    return {
    id: `identification-${index + 1}`,
    label: cleanMapMarkup(identification.description ?? "") || `Proposed location ${index + 1}`,
    ...(confidence !== undefined ? { confidence } : {}),
    geometry_ids: [...new Set((identification.resolutions ?? []).flatMap(resolution =>
      Object.values(resolution.geojson_roles ?? {}).map(role => role.id)
        .filter((id): id is string => typeof id === "string" && available.has(id)),
    ))],
    };
  }).filter(identification => identification.geometry_ids.length > 0);
  // Source alternatives also include non-geographic readings (a person, a
  // common noun, etc.). Those are not selectable proposed map locations.
  return identifications.length ? { identifications } : {};
}
