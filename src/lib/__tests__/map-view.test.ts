import { describe, expect, it } from "vitest";
import { MAPLIBRE_WHEEL_RATE, LEAFLET_WHEEL_PIXELS, PLACE_ZOOM, rasterBasemap, rendererZoom } from "@/lib/map-view";

describe("shared map camera and providers", () => {
  it("gives both renderers the same ground resolution and a closer small-place view", () => {
    const leaflet = rendererZoom(PLACE_ZOOM, "leaflet");
    const maplibre = rendererZoom(PLACE_ZOOM, "open-free-map");
    expect(256 * 2 ** leaflet).toBe(512 * 2 ** maplibre);
    expect(leaflet).toBe(15);
    expect(maplibre).toBe(14);
  });
  it("speeds up MapLibre wheel zoom and slows Leaflet with attribution on both raster styles", () => {
    expect(MAPLIBRE_WHEEL_RATE).toBeGreaterThan(1 / 450);
    expect(LEAFLET_WHEEL_PIXELS).toBeGreaterThan(60);
    expect(rasterBasemap("regular").attribution).toContain("OpenStreetMap");
    expect(rasterBasemap("topographic").attribution).toContain("CC-BY-SA");
    expect(rasterBasemap("topographic").maxNativeZoom).toBe(17);
  });
});
