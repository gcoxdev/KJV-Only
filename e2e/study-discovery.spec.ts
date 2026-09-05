import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openStudyTools(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Genesis 1", exact: true }).click();
  await page.getByRole("button", { name: "Details for beginning", exact: true }).first().click();
}

async function expandTool(page: Page, name: string) {
  const trigger = page.getByRole("button", { name, exact: true }).filter({ visible: true });
  if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
}

test.use({ serviceWorkers: "block" });

for (const width of [375, 1280]) {
  test(`explains topic aliases and distinguishes same-name people at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openStudyTools(page);
    await expandTool(page, "Genealogy");
    const genealogySearch = page.getByRole("textbox", { name: "Search genealogy" });
    await genealogySearch.fill("Joseph");
    await genealogySearch.press("Enter");
    const joseph = page.getByRole("button", { name: /Joseph Father: Jacob · Mother: Rachel/ });
    await expect(joseph).toBeVisible();
    await expect(joseph).toHaveAttribute("aria-expanded", "false");
    await expect(joseph).toContainText("Name reference:");
    await expect(page.getByRole("button", { name: /Joseph Father: Asaph/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Joseph Father: Jacob · Spouse: Mary/ })).toHaveCount(1);
    await joseph.click();
    await expect(page.getByRole("button", { name: "View Tree", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Topics", exact: true }).filter({ visible: true }).click();
    const topicsSearch = page.getByRole("textbox", { name: "Filter topics" });
    await topicsSearch.fill("feeling afraid");
    const fear = page.getByRole("button", { name: /^Fear Related to/ });
    await expect(fear).toBeVisible();
    await expect(page.getByText("Related to “feeling afraid”", { exact: true })).toHaveCount(3);
    await fear.click();
    await expect(page.locator('[data-tool-reference-display="buttons"]').filter({ visible: true }).first()).toBeVisible();
    await topicsSearch.fill("I am not afraid");
    await expect(page.getByText("No topics match the current filter.")).toBeVisible();
    await topicsSearch.fill("Faith");
    await expect(page.getByRole("button", { name: /^Faith \d+$/ })).toBeVisible();
    await expect(page.getByText(/Related to/)).toHaveCount(0);
  });

  for (const renderer of ["OpenFreeMap", "Leaflet"]) {
    test(`searches map bounds and opens a place and passage with ${renderer} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route("https://tiles.openfreemap.org/styles/bright", route => route.fulfill({
        json: { version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f5f2ec" } }] },
      }));
      await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
      await page.route("**/maps/data/map.json", route => route.fulfill({ json: [
        { geojson_file: "selected.geojson", translations: ["Selected"], types: ["region"], verses: ["GEN.1.1"], modern_names: [], bounds: [[34, 31, 36, 33]] },
        { geojson_file: "nearby.geojson", translations: ["Nearby"], types: ["city"], verses: ["GEN.1.2"], modern_names: [], bounds: [[35, 32, 35, 32]] },
        { geojson_file: "far.geojson", translations: ["Far Away"], types: ["city"], verses: ["GEN.1.3"], modern_names: [], bounds: [[0, 0, 0, 0]] },
      ] }));
      await page.route("**/maps/geometry/selected.geojson", route => route.fulfill({ json: {
        type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[34, 31], [36, 31], [36, 33], [34, 33], [34, 31]]] } }],
      } }));
      await page.route("**/maps/geometry/nearby.geojson", route => route.fulfill({ json: {
        type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [35, 32] } }],
      } }));
      await openStudyTools(page);
      await expandTool(page, "Maps");
      const search = page.getByRole("textbox", { name: "Search maps" });
      await search.fill("Selected");
      await search.press("Enter");
      await page.getByRole("button", { name: "Open Map" }).first().click();
      const dialog = page.getByRole("alertdialog");
      await dialog.getByRole("button", { name: renderer, exact: true }).click();
      const map = dialog.locator(renderer === "Leaflet" ? ".leaflet-container" : '[data-map-renderer="open-free-map"]');
      await expect(map).toBeVisible();
      await expect(dialog.getByText(/Loading.*map/)).toHaveCount(0);
      await dialog.getByRole("button", { name: "Search this area", exact: true }).click();
      const results = dialog.getByRole("region", { name: "Places in searched area", exact: true });
      await expect(results).toContainText("Places in searched area (2)");
      await expect(results.getByRole("button", { name: "Far Away", exact: true })).toHaveCount(0);
      const mapBounds = await map.boundingBox();
      const footer = await dialog.locator('[data-slot="alert-dialog-footer"]').boundingBox();
      expect(Math.abs(footer!.y - (mapBounds!.y + mapBounds!.height))).toBeLessThanOrEqual(18);
      expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      const accessibility = await new AxeBuilder({ page }).include('[role="alertdialog"]').analyze();
      expect(accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
      await results.getByRole("button", { name: "Nearby", exact: true }).click();
      await results.getByRole("button", { name: "Open map", exact: true }).click();
      await expect(dialog.getByRole("heading", { name: "Nearby", exact: true })).toBeVisible();
      await expect(results).toBeHidden();
      await dialog.getByRole("button", { name: "Results (2)", exact: true }).click();
      await expect(results.getByText("Map view changed. Search this area to refresh.")).toBeVisible();
      await results.getByRole("button", { name: "Nearby", exact: true }).click();
      await results.getByRole("button", { name: "GEN.1.2", exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByRole("button", { name: "Genesis 1", exact: true }).first()).toBeVisible();
    });
  }
}
