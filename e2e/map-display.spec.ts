import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const ring = [[34, 31], [36, 31], [36, 33], [34, 33], [34, 31]];
const overlappingAreas = {
  type: "FeatureCollection",
  features: Array.from({ length: 12 }, (_, index) => ({
    type: "Feature",
    properties: { id: `area-${index}` },
    geometry: index % 2
      ? { type: "MultiPolygon", coordinates: [[ring]] }
      : { type: "Polygon", coordinates: [ring] },
  })),
};

async function expectMapFillsDialog(dialog: Locator, map: Locator) {
  await expect.poll(async () => {
    const bounds = await map.boundingBox();
    const footer = await dialog.locator('[data-slot="alert-dialog-footer"]').boundingBox();
    return bounds && footer ? Math.abs(footer.y - (bounds.y + bounds.height)) : Infinity;
  }).toBeLessThanOrEqual(18);
  const mapBounds = await map.boundingBox();
  expect(mapBounds).not.toBeNull();
  expect(mapBounds!.height).toBeGreaterThan(200);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
}

async function polygonPixels(page: Page, canvas: Locator) {
  // Inspect the actual rendered pixels: layered fills would tint the center,
  // while visible blue edges prove that the geometry has finished rendering.
  const png = await canvas.screenshot();
  return page.evaluate(async (bytes) => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
    const buffer = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = buffer.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    const center = Array.from(context.getImageData(Math.floor(bitmap.width / 2), Math.floor(bitmap.height / 2), 1, 1).data).slice(0, 3);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let blueEdges = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 2] > pixels[i] + 60 && pixels[i + 2] > pixels[i + 1] + 30) blueEdges++;
    }
    bitmap.close();
    return { center, blueEdges };
  }, Array.from(png));
}

test.describe("map display", () => {
  test.use({ serviceWorkers: "block" });

  for (const width of [375, 1280]) {
    test(`keeps overlapping areas clear and fills the dialog at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route("https://tiles.openfreemap.org/styles/bright", (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f5f2ec" } }] }),
      }));
      await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
      await page.route("**/maps/data/map.json", (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([{ geojson_file: "overlap.geojson", translations: ["Overlap"], types: ["region"], verses: ["GEN.1.1"], modern_names: [] }]),
      }));
      await page.route("**/maps/geometry/overlap.geojson", (route) => route.fulfill({
        contentType: "application/json", body: JSON.stringify(overlappingAreas),
      }));

      await page.goto("/");
      await page.getByRole("button", { name: "Genesis 1", exact: true }).click();
      await page.getByRole("button", { name: "Details for beginning", exact: true }).first().click();
      const maps = page.getByRole("button", { name: "Maps", exact: true }).filter({ visible: true });
      if ((await maps.getAttribute("aria-expanded")) !== "true") await maps.click();
      const search = page.getByRole("textbox", { name: "Search maps" });
      await search.fill("Overlap");
      await search.press("Enter");
      await page.getByRole("button", { name: "Open Map" }).first().click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog.locator("summary")).toHaveCount(0);
      const openFreeMap = page.locator('[data-map-renderer="open-free-map"]');
      await expect(page.getByText("Loading English map...")).toBeHidden();
      const canvas = openFreeMap.locator("canvas");
      await expect.poll(async () => (await polygonPixels(page, canvas)).blueEdges).toBeGreaterThan(100);
      expect((await polygonPixels(page, canvas)).center).toEqual([245, 242, 236]);
      await expectMapFillsDialog(dialog, openFreeMap);
      await dialog.screenshot({ path: testInfo.outputPath("open-free-map.png") });

      await dialog.getByRole("button", { name: "Leaflet", exact: true }).click();
      const leaflet = dialog.locator(".leaflet-container");
      const paths = leaflet.locator(".leaflet-overlay-pane path");
      await expect(paths).toHaveCount(12);
      for (const outline of await paths.all()) await expect(outline).toHaveAttribute("fill", "none");
      await expectMapFillsDialog(dialog, leaflet);
      await dialog.screenshot({ path: testInfo.outputPath("leaflet.png") });
      const accessibility = await new AxeBuilder({ page }).include('[role="alertdialog"]').analyze();
      expect(accessibility.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);

      await page.setViewportSize({ width, height: 700 });
      await expectMapFillsDialog(dialog, leaflet);
      await expect.poll(async () => {
        const mapBounds = await leaflet.boundingBox();
        const outlineBounds = await paths.first().boundingBox();
        return Boolean(mapBounds && outlineBounds && outlineBounds.y >= mapBounds.y &&
          outlineBounds.y + outlineBounds.height <= mapBounds.y + mapBounds.height);
      }).toBe(true);
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await expect(dialog).toBeHidden();
    });
  }
});
