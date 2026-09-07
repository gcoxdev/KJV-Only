import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseMapSearchResults } from "@/lib/map-search";

const feature = {
  type: "Feature", geometry: { type: "Point", coordinates: [35.2, 31.8] },
  properties: { osm_id: 42, osm_type: "R", name: "Jerusalem", city: "Jerusalem", country: "Example", extent: [35, 32, 36, 31] },
};

describe("map place search", () => {
  beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-07T12:00:00Z")); });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("parses coordinates, deduplicates label parts, and reorders Photon bounds", () => {
    expect(parseMapSearchResults({ features: [feature] })).toEqual([
      { id: "R:42", label: "Jerusalem, Example", center: [35.2, 31.8], bounds: [35, 31, 36, 32] },
    ]);
  });

  it("rejects invalid results and ignores unsafe or inverted extents", () => {
    expect(() => parseMapSearchResults({ error: "bad" })).toThrow(/unreadable/);
    expect(parseMapSearchResults({ features: [null, {}, { ...feature, geometry: { type: "Point", coordinates: [999, 0] } }] })).toEqual([]);
    expect(parseMapSearchResults({ features: [{ ...feature, properties: { ...feature.properties, extent: [-999, 32, 36, 31] } }] })[0].bounds).toBeUndefined();
  });

  it("only sends submitted queries, normalizes and caches repeats, and throttles new searches", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [feature] }) });
    vi.stubGlobal("fetch", fetchMock);
    const { searchMapPlaces } = await import("@/lib/map-search");
    const signal = new AbortController().signal;
    expect(await searchMapPlaces("a", signal)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    await searchMapPlaces(" Jerusalem  ", signal);
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("q")).toBe("Jerusalem");
    await searchMapPlaces("jerusalem", signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(searchMapPlaces("London", signal)).rejects.toThrow(/wait a moment/);
    vi.advanceTimersByTime(1000);
    await searchMapPlaces("London", signal);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("propagates cancellation and surfaces provider failures without caching them", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);
    const { searchMapPlaces } = await import("@/lib/map-search");
    const controller = new AbortController();
    controller.abort();
    await expect(searchMapPlaces("Jerusalem", controller.signal)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(searchMapPlaces("Jerusalem", new AbortController().signal)).rejects.toThrow(/unavailable/);
  });
});
