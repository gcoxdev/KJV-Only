import type {
  ExpressionSpecification,
  FilterSpecification,
  StyleSpecification,
} from "maplibre-gl";

export const MAP_RENDERERS = ["open-free-map", "leaflet"] as const;

export type MapRenderer = (typeof MAP_RENDERERS)[number];

export const DEFAULT_MAP_RENDERER: MapRenderer = "open-free-map";
const MAP_RENDERER_SESSION_KEY = "kjv-map-renderer-v1";

export const ENGLISH_MAP_NAME_EXPRESSION: ExpressionSpecification = [
  "coalesce",
  ["get", "name_en"],
  ["get", "name:en"],
  ["get", "name:latin"],
  ["get", "name"],
];

const MAP_NAME_FIELDS = new Set([
  "name",
  "name_en",
  "name:en",
  "name:latin",
  "name:nonlatin",
]);

const ORDERED_FILTER_OPERATORS = new Set([">", ">=", "<", "<="]);
const NULLABLE_OPEN_FREE_MAP_NUMBER_FIELDS = new Set([
  "admin_level",
  "rank",
  "ref_length",
]);

function nullSafeOpenFreeMapFilter(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  const nextValue = value.map(nullSafeOpenFreeMapFilter);
  if (!ORDERED_FILTER_OPERATORS.has(nextValue[0] as string)) {
    return nextValue;
  }

  for (let index = 1; index < nextValue.length; index += 1) {
    const operand = nextValue[index];
    if (
      Array.isArray(operand) &&
      operand[0] === "get" &&
      NULLABLE_OPEN_FREE_MAP_NUMBER_FIELDS.has(operand[1] as string)
    ) {
      nextValue[index] = ["coalesce", operand, 9999];
    }
  }

  return nextValue;
}

export function normalizeOpenFreeMapStyle(
  style: StyleSpecification,
): StyleSpecification {
  return {
    ...style,
    layers: style.layers.map((layer) =>
      "filter" in layer && layer.filter
        ? {
            ...layer,
            filter: nullSafeOpenFreeMapFilter(
              layer.filter,
            ) as FilterSpecification,
          }
        : layer,
    ),
  };
}

export function containsMapNameField(value: unknown): boolean {
  if (typeof value === "string") {
    return MAP_NAME_FIELDS.has(value);
  }

  return Array.isArray(value) && value.some(containsMapNameField);
}

export function isMapRenderer(value: unknown): value is MapRenderer {
  return MAP_RENDERERS.includes(value as MapRenderer);
}

export function readSessionMapRenderer(): MapRenderer {
  if (typeof window === "undefined") {
    return DEFAULT_MAP_RENDERER;
  }

  try {
    const storedRenderer = window.sessionStorage.getItem(
      MAP_RENDERER_SESSION_KEY,
    );
    return isMapRenderer(storedRenderer)
      ? storedRenderer
      : DEFAULT_MAP_RENDERER;
  } catch {
    return DEFAULT_MAP_RENDERER;
  }
}

export function writeSessionMapRenderer(renderer: MapRenderer) {
  try {
    window.sessionStorage.setItem(MAP_RENDERER_SESSION_KEY, renderer);
  } catch {
    // The selection still works for this modal when storage is unavailable.
  }
}
