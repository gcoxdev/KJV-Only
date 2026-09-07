import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });
const tile = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");

async function openDanMap(page: Page) {
  await page.route("https://tiles.openfreemap.org/styles/bright", route => route.fulfill({ json: {
    version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f5f2ec" } }],
  } }));
  await page.route(/https:\/\/.*tile\.(openstreetmap|opentopomap)\.org\//, route => route.fulfill({ contentType: "image/png", body: tile }));
  await page.goto("/#tab=0&tabs=h&layout=Judges%2018:JDG.18");
  await page.getByLabel("Judges 18 panel", { exact: true }).locator('[data-verse-number="29"]').last()
    .getByRole("button", { name: "Details for Dan", exact: true }).first().click();
  await page.getByRole("button", { name: "Open Map", exact: true }).first().click();
  return page.getByRole("alertdialog");
}

for (const renderer of ["OpenFreeMap", "Leaflet"]) {
  test(`map controls preserve and restore the view in ${renderer}`, async ({ page }) => {
    const dialog = await openDanMap(page);
    await dialog.getByRole("button", { name: renderer, exact: true }).click();
    const camera = dialog.locator("[data-map-zoom]");
    await expect(camera).toHaveAttribute("data-map-zoom", "15");
    const originalCenter = JSON.parse((await camera.getAttribute("data-map-center"))!) as number[];
    await dialog.getByRole("button", { name: "Hide areas", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Show areas", exact: true })).toHaveAttribute("aria-pressed", "false");
    if (renderer === "Leaflet") await expect(dialog.locator(".leaflet-overlay-pane path")).toHaveCount(0);

    const bounds = (await camera.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.wheel(120, 0); // Horizontal scroll must not be interpreted as vertical zoom.
    await page.mouse.wheel(0, -120);
    await expect.poll(async () => Number(await camera.getAttribute("data-map-zoom"))).toBeGreaterThan(15);
    // One wheel event should move less than a full zoom level with both renderers.
    await page.waitForTimeout(500);
    const delta = Number(await camera.getAttribute("data-map-zoom")) - 15;
    expect(delta).toBeGreaterThanOrEqual(0.25);
    expect(delta).toBeLessThanOrEqual(0.8);

    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2 + 50, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const movedCenter = await camera.getAttribute("data-map-center");
    expect(movedCenter).not.toBe(JSON.stringify(originalCenter));

    await dialog.getByRole("combobox", { name: "Map style", exact: true }).click();
    await page.getByRole("option", { name: "Topographic", exact: true }).click();
    await expect(camera).toHaveAttribute("data-map-center", movedCenter!);
    await expect(dialog.getByRole("button", { name: "Show areas", exact: true })).toHaveAttribute("aria-pressed", "false");
    await page.setViewportSize({ width: 1000, height: 760 });
    await expect(camera).toHaveAttribute("data-map-center", movedCenter!);

    await dialog.getByRole("button", { name: "Recenter", exact: true }).click();
    await expect(camera).toHaveAttribute("data-map-zoom", "15");
    const restored = JSON.parse((await camera.getAttribute("data-map-center"))!) as number[];
    expect(restored[0]).toBeCloseTo(originalCenter[0], 4);
    expect(restored[1]).toBeCloseTo(originalCenter[1], 4);
    await dialog.getByRole("button", { name: "Show areas", exact: true }).click();
    if (renderer === "Leaflet") await expect(dialog.locator(".leaflet-overlay-pane path")).toHaveCount(1);

    const otherRenderer = renderer === "Leaflet" ? "OpenFreeMap" : "Leaflet";
    await dialog.getByRole("button", { name: otherRenderer, exact: true }).click();
    await expect(camera).toHaveAttribute("data-map-zoom", "15");
    const switched = JSON.parse((await camera.getAttribute("data-map-center"))!) as number[];
    expect(switched[0]).toBeCloseTo(restored[0], 4);
    expect(switched[1]).toBeCloseTo(restored[1], 4);
  });
}

test("searches places on submit, marks the result, and recenters on Dan", async ({ page }) => {
  let queries = 0;
  await page.route("https://photon.komoot.io/api/**", route => {
    queries++;
    return route.fulfill({ json: { features: [{ type: "Feature", geometry: { type: "Point", coordinates: [35.22, 31.78] },
      properties: { name: "Jerusalem", osm_type: "R", osm_id: 1, extent: [35.2, 31.8, 35.24, 31.76] } }] } });
  });
  const dialog = await openDanMap(page);
  const camera = dialog.locator("[data-map-zoom]");
  await expect(camera).toHaveAttribute("data-map-zoom", "15");
  const search = dialog.getByRole("textbox", { name: "Search places or addresses" });
  await search.fill("Jerusalem");
  expect(queries).toBe(0);
  await search.press("Enter");
  await dialog.getByRole("region", { name: "Place search results" }).getByRole("button", { name: "Jerusalem", exact: true }).click();
  await expect.poll(async () => JSON.parse((await camera.getAttribute("data-map-center"))!)[1] as number).toBeLessThan(32);
  await expect(dialog.locator(".maplibregl-marker")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Leaflet", exact: true }).click();
  await expect.poll(async () => JSON.parse((await camera.getAttribute("data-map-center"))!)[1] as number).toBeLessThan(32);
  await dialog.getByRole("button", { name: "Recenter", exact: true }).click();
  await expect(camera).toHaveAttribute("data-map-zoom", "15");
  await expect.poll(async () => JSON.parse((await camera.getAttribute("data-map-center"))!)[1] as number).toBeGreaterThan(33);
  await search.press("Enter");
  await expect(dialog.getByRole("region", { name: "Place search results" }).getByRole("button", { name: "Jerusalem", exact: true })).toBeVisible();
  expect(queries).toBe(1);
});

test("place search reports a provider failure and leaves the map usable", async ({ page }) => {
  await page.route("https://photon.komoot.io/api/**", route => route.fulfill({ status: 503, body: "Unavailable" }));
  const dialog = await openDanMap(page);
  await expect(dialog.locator("[data-map-zoom]")).toHaveAttribute("data-map-zoom", "15");
  const search = dialog.getByRole("textbox", { name: "Search places or addresses" });
  await search.fill("Jerusalem");
  await search.press("Enter");
  await expect(dialog.getByRole("alert")).toHaveText("Place search is unavailable. Try again shortly.");
  await expect(dialog.getByRole("button", { name: "Search places", exact: true })).toBeEnabled();
  await dialog.getByRole("button", { name: "Hide", exact: true }).click();
  await dialog.getByRole("button", { name: "Recenter", exact: true }).click();
  await expect(dialog.locator("[data-map-zoom]")).toHaveAttribute("data-map-zoom", "15");
});

for (const viewport of [{ width: 375, height: 812 }, { width: 812, height: 375 }]) {
  test(`map toolbar fits at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const dialog = await openDanMap(page);
    await expect(dialog.locator("[data-map-zoom]")).toHaveAttribute("data-map-zoom", "15");
    await expect(dialog.getByRole("button", { name: "Recenter", exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Hide areas", exact: true })).toBeVisible();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const mapBox = (await dialog.locator('[data-map-renderer="open-free-map"]').boundingBox())!;
    expect(mapBox.height).toBeGreaterThan(viewport.height < 500 ? 100 : 300);
    const footer = (await dialog.locator('[data-slot="alert-dialog-footer"]').boundingBox())!;
    expect(footer.y - (mapBox.y + mapBox.height)).toBeLessThanOrEqual(18);
    const result = await new AxeBuilder({ page }).include('[role="alertdialog"]').analyze();
    expect(result.violations.filter(item => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  });
}
