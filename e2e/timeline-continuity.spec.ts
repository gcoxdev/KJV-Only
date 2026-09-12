import { expect, test, type Page, type Locator } from "@playwright/test";
test.use({ serviceWorkers: "block" });
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
  await page.route("https://tiles.openfreemap.org/styles/bright", route => route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f5f2ec" } }] } }));
});
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]); });
async function start(page: Page, settings: Record<string, string> = {}, chapter = "EZR.6") {
  await page.addInitScript(settings => localStorage.setItem("kjv-display-settings-v1", JSON.stringify({ showWelcomeHomeAtStartup: false, ...settings })), settings);
  await page.goto(`/#tab=0&tabs=h&layout=Reader:${chapter}`);
  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
  if ((page.viewportSize()?.width ?? 1280) < 768) await page.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
  await sidebar.getByRole("button", { name: "Tools", exact: true }).click();
  await sidebar.getByRole("button", { name: "Timeline", exact: true }).click();
  await sidebar.getByRole("button", { name: "Open timeline", exact: true }).click();
  const viewer = settings.timelineOpenTarget ? page.getByRole("region", { name: "Timeline panel", exact: true }) : page.getByRole("dialog");
  await expect(viewer.getByRole("article", { name: "Historical timeline evidence" })).toBeVisible();
  if (chapter !== "PSA.23") await expect(viewer.getByRole("region", { name: "Historical timeline chart" }).locator(".vis-timeline")).toBeVisible();
  return viewer;
}
async function choose(page: Page, viewer: Locator, label: string, option: string) {
  await viewer.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
async function windowOf(viewer: Locator) {
  return viewer.locator("[data-window-start]").evaluate(el => [el.getAttribute("data-window-start"), el.getAttribute("data-window-end")]);
}

test("historical panel restores pinned context, collection, filter, selection and zoom", async ({ page }) => {
  const panel = await start(page, { timelineOpenTarget: "new-tab" });
  await choose(page, panel, "Timeline book", "Matthew");
  await choose(page, panel, "Timeline chapter", "Chapter 2");
  await choose(page, panel, "Timeline collection", "Gospel harmony");
  await choose(page, panel, "Timeline stage", "Origins and childhood");
  await panel.getByRole("button", { name: "Biblical", exact: true }).click();
  await panel.getByRole("textbox", { name: "Find timeline entries" }).fill("Jesus");
  await panel.getByRole("group", { name: "Historical timeline entries" }).getByRole("button", { name: /^Birth of Jesus/ }).click();
  await panel.getByRole("button", { name: "Zoom in", exact: true }).click();
  const saved = await windowOf(panel);
  await expect.poll(() => page.url()).toContain("viewState");
  await page.reload();
  await expect(panel.getByRole("combobox", { name: "Timeline book", exact: true })).toContainText("Matthew");
  await expect(panel.getByRole("combobox", { name: "Timeline chapter", exact: true })).toContainText("Chapter 2");
  await expect(panel.getByRole("combobox", { name: "Timeline collection", exact: true })).toContainText("Gospel harmony");
  await expect(panel.getByRole("combobox", { name: "Timeline stage", exact: true })).toContainText("Origins and childhood");
  await expect(panel.getByRole("textbox", { name: "Find timeline entries" })).toHaveValue("Jesus");
  await expect(panel.getByRole("button", { name: "Biblical", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(panel.getByRole("button", { name: "Follow reader", exact: true })).toBeVisible();
  await expect(panel.getByRole("article")).toContainText("Birth of Jesus");
  await expect.poll(() => windowOf(panel)).toEqual(saved);
  await panel.getByRole("button", { name: "Expand chart", exact: true }).click();
  await expect.poll(() => windowOf(panel)).toEqual(saved);
});

test("dialog remembers filters and shared chronology after reload", async ({ page }) => {
  let dialog = await start(page);
  await dialog.getByRole("button", { name: "Biblical", exact: true }).click();
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await choose(page, dialog, "Historical chronology model", "430 years from the promise");
  await dialog.getByRole("button", { name: "Close timeline", exact: true }).click();
  await page.reload();
  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
  await sidebar.getByRole("button", { name: "Tools", exact: true }).click();
  await sidebar.getByRole("button", { name: "Timeline", exact: true }).click();
  await sidebar.getByRole("button", { name: "Open timeline", exact: true }).click();
  dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Biblical", exact: true })).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(dialog.getByRole("combobox", { name: "Historical chronology model", exact: true })).toContainText("430 years from the promise");
});

for (const destination of ["dialog", "new-panel", "new-tab", "targeted-panel"]) test(`timeline links honor ${destination} targeting`, async ({ page }) => {
  const dialog = await start(page, { mapsOpenTarget: destination, genealogyOpenTarget: destination }, "MAT.1");
  await dialog.getByRole("group", { name: "Historical timeline entries" }).getByRole("button", { name: /^Birth of Jesus/ }).click();
  await dialog.getByRole("button", { name: "Map: Bethlehem in Judah", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /Historical timeline/ })).toHaveCount(0);
  const map = destination === "dialog" ? page.getByRole("alertdialog") : page.getByRole("region", { name: "Maps panel", exact: true });
  await expect(map).toContainText("Bethlehem");
  await expect(map.locator("[data-map-zoom]")).toBeVisible();
  if (destination === "dialog") await map.getByRole("button", { name: "Close", exact: true }).click();
  if (destination === "new-tab") await page.locator("[data-tab-id]").getByRole("button", { name: "Reader", exact: true }).click();
  await page.getByRole("region", { name: "Study sidebar", exact: true }).getByRole("button", { name: "Open timeline", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Genealogy: Jesus Christ", exact: true }).click();
  const genealogy = destination === "dialog" ? page.getByRole("alertdialog") : page.getByRole("region", { name: "Genealogy panel", exact: true });
  await expect(genealogy).toContainText("Focused on Jesus Christ.");
  await expect(page.getByRole("dialog", { name: /Historical timeline/ })).toHaveCount(0);
});

test("genealogy panel remembers lineage branch, content and list display", async ({ page }) => {
  const dialog = await start(page, { genealogyOpenTarget: "new-tab" }, "MAT.1");
  await dialog.getByRole("group", { name: "Historical timeline entries" }).getByRole("button", { name: /^Birth of Jesus/ }).click();
  await dialog.getByRole("button", { name: "Genealogy: Jesus Christ", exact: true }).click();
  const panel = page.getByRole("region", { name: "Genealogy panel", exact: true });
  await panel.getByRole("button", { name: "Timeline", exact: true }).click();
  await panel.getByRole("button", { name: "Jesus' lineage", exact: true }).click();
  await choose(page, panel, "Jesus lineage branch", "Mary (Luke interpretation)");
  await panel.getByRole("button", { name: "List", exact: true }).click();
  await panel.getByRole("textbox", { name: "Filter timeline" }).fill("Boaz");
  await page.reload();
  await expect(panel.getByRole("textbox", { name: "Filter timeline" })).toHaveValue("Boaz");
  await expect(panel.getByRole("combobox", { name: "Jesus lineage branch" })).toContainText("Mary");
  await expect(panel.getByRole("button", { name: "People", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(panel.getByRole("button", { name: "List", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(panel.getByRole("group", { name: "Timeline entries" }).getByRole("button")).toHaveCount(1);
  await panel.getByRole("button", { name: "View Boaz in tree", exact: true }).click();
  await expect(panel).toContainText("Focused on Boaz.");
  await panel.getByRole("button", { name: "Panel options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Back", exact: true }).click();
  await expect(panel.getByRole("textbox", { name: "Filter timeline" })).toHaveValue("Boaz");
  await expect(panel.getByRole("combobox", { name: "Jesus lineage branch" })).toContainText("Mary");
});

test("failed related-map load keeps the source available for retry", async ({ page }) => {
  await page.route("**/maps/data/map.json", route => route.abort());
  const dialog = await start(page);
  await dialog.getByRole("button", { name: "Map: Jerusalem", exact: true }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Map: Jerusalem", exact: true })).toBeEnabled();
  await page.unroute("**/maps/data/map.json");
  await dialog.getByRole("button", { name: "Map: Jerusalem", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Jerusalem");
  await expect(dialog).toHaveCount(0);
});

test("two timeline tabs keep independent filters after reload", async ({ page }) => {
  let panel = await start(page, { timelineOpenTarget: "new-tab" });
  await panel.getByRole("button", { name: "Biblical", exact: true }).click();
  await page.locator("[data-tab-id]").getByRole("button", { name: "Reader", exact: true }).click();
  await page.getByRole("region", { name: "Study sidebar", exact: true }).getByRole("button", { name: "Open timeline", exact: true }).click();
  panel = page.getByRole("region", { name: "Timeline panel", exact: true });
  await panel.getByRole("button", { name: "Historical context", exact: true }).click();
  await page.reload();
  await expect(panel.getByRole("button", { name: "Historical context", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-tab-id]").getByRole("button", { name: "Timeline", exact: true }).first().click();
  await expect(panel.getByRole("button", { name: "Biblical", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("Psalm headings provide distinct KJV evidence and working mobile genealogy links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = await start(page, {}, "PSA.23");
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await expect(evidence).toContainText("Psalm 23 heading");
  await expect(evidence).toContainText("A Psalm of David.");
  await evidence.getByRole("button", { name: "Genealogy: David", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Focused on David.");
  expect(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true);
});

test("long passage connection lists can expand and collapse", async ({ page }) => {
  const dialog = await start(page, {}, "MAT.1");
  await dialog.getByRole("textbox", { name: "Find timeline entries" }).fill("genealogies");
  const related = dialog.getByRole("group", { name: "Related people and places" });
  const before = await related.getByRole("button", { name: /^Genealogy:/ }).count();
  await related.getByRole("button", { name: /^Show all \d+ passage connections$/ }).click();
  expect(await related.getByRole("button", { name: /^Genealogy:/ }).count()).toBeGreaterThan(before);
  await related.getByRole("button", { name: "Show fewer connections", exact: true }).click();
  await expect(related.getByRole("button", { name: /^Genealogy:/ })).toHaveCount(before);
});

test("encyclopedia links appear on Credits and stay out of both timeline viewers", async ({ page }) => {
  const dialog = await start(page);
  const encyclopediaLinks = 'a[href*="encyclopedia"], a[href*="iranicaonline"], a[href*="plato.stanford"]';
  await expect(dialog.locator(encyclopediaLinks)).toHaveCount(0);
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(dialog.locator(encyclopediaLinks)).toHaveCount(0);
  await dialog.getByRole("button", { name: "Close timeline", exact: true }).click();
  await page.goto("/#tab=0&tabs=h&layout=Reader:MAT.1");
  await page.getByRole("region", { name: "Matthew 1 panel", exact: true }).locator('[data-verse-number="1"]').last().getByRole("button", { name: "Details for Jesus", exact: true }).first().click();
  await page.getByRole("button", { name: "View Tree", exact: true }).first().click();
  const genealogy = page.getByRole("alertdialog");
  await genealogy.getByRole("button", { name: "Timeline", exact: true }).click();
  await genealogy.getByRole("button", { name: /Sources & method/ }).click();
  await expect(genealogy.locator(encyclopediaLinks)).toHaveCount(0);
  await genealogy.getByRole("button", { name: "Close", exact: true }).click();
  await page.goto("/#tab=0&tabs=h&layout=Credits:page.credits");
  const credits = page.getByRole("region", { name: "Credits panel", exact: true });
  await expect(credits.locator(encyclopediaLinks)).toHaveCount(3);
  await expect(credits.getByRole("link", { name: "Encyclopedia of the Bible", exact: true })).toHaveCount(1);
  await expect(credits.getByRole("link", { name: "Stanford Encyclopedia of Philosophy", exact: true })).toHaveCount(1);
  await expect(credits).toContainText("Encyclopaedia Iranica: Artaxerxes I");
});

test("historical geography is labeled separately from biblical event connections", async ({ page }) => {
  const dialog = await start(page);
  await choose(page, dialog, "Timeline collection", "Wider history");
  await dialog.getByRole("textbox", { name: "Find timeline entries" }).fill("Socrates");
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await expect(evidence).toContainText("Historical geography");
  await expect(evidence).toContainText("Acts identifies the mapped city, not Socrates or his dates.");
  await evidence.getByRole("button", { name: "Map: Athens", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Athens");
});
