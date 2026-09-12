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

test("external citations appear only on Credits across study pages", async ({ page }) => {
  const dialog = await start(page);
  const encyclopediaLinks = 'a[href*="encyclopedia"], a[href*="iranicaonline"], a[href*="plato.stanford"]';
  await expect(dialog.locator('a[href^="http"]')).toHaveCount(0);
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(dialog.locator('a[href^="http"]')).toHaveCount(0);
  await dialog.getByRole("button", { name: "Close timeline", exact: true }).click();
  await page.goto("/#tab=0&tabs=h&layout=Reader:MAT.1");
  await page.getByRole("region", { name: "Matthew 1 panel", exact: true }).locator('[data-verse-number="1"]').last().getByRole("button", { name: "Details for Jesus", exact: true }).first().click();
  await page.getByRole("button", { name: "View Tree", exact: true }).first().click();
  const genealogy = page.getByRole("alertdialog");
  await genealogy.getByRole("button", { name: "Timeline", exact: true }).click();
  await genealogy.getByRole("button", { name: /Sources & method/ }).click();
  await expect(genealogy.locator('a[href^="http"]')).toHaveCount(0);
  await genealogy.getByRole("button", { name: "Close", exact: true }).click();
  await page.goto("/#tab=0&tabs=h&layout=Credits:page.credits");
  const credits = page.getByRole("region", { name: "Credits panel", exact: true });
  await expect(credits.locator(encyclopediaLinks)).toHaveCount(3);
  await expect(credits.getByRole("link", { name: "Encyclopedia of the Bible", exact: true })).toHaveCount(1);
  await expect(credits.getByRole("link", { name: "Stanford Encyclopedia of Philosophy", exact: true })).toHaveCount(1);
  await expect(credits).toContainText("Encyclopaedia Iranica: Artaxerxes I");
  await expect(credits.getByRole("link", { name: "Livius: Cambyses II", exact: true })).toHaveAttribute("href", "https://www.livius.org/articles/person/cambyses-ii/");
  await expect(credits.getByRole("link", { name: "The Translators to the Reader", exact: true })).toBeVisible();
  await page.goto("/#tab=0&tabs=h&layout=Why:page.kjv-only");
  await expect(page.getByText("Historical and comparative source details are listed on the Credits page.", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="http"]')).toHaveCount(0);
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

test("expanded event detail appears in chapter views and narrative collections", async ({ page }) => {
  const dialog = await start(page, {}, "ACT.16");
  const query = dialog.getByRole("textbox", { name: "Find timeline entries" });
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await query.fill("Philippian jailer");
  await expect(evidence).toContainText("ACT.16.25");
  await expect(evidence).toContainText("following daylight release");
  await choose(page, dialog, "Timeline collection", "Paul’s missions");
  await expect(evidence).toContainText("The Philippian jailer");
  await query.fill("");
  await choose(page, dialog, "Timeline collection", "Gospel harmony");
  await query.fill("good Samaritan");
  await expect(evidence).toContainText("Luke 10:25–37");
  await expect(evidence).toContainText("The dated subject is Jesus’s teaching");
  await query.fill("tribute money");
  await expect(evidence).toContainText("Matthew 17:24–27");
});

test("Roman context and chronology review retain historical and biblical distinctions", async ({ page }) => {
  const dialog = await start(page);
  await choose(page, dialog, "Timeline collection", "Wider history");
  const query = dialog.getByRole("textbox", { name: "Find timeline entries" });
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await query.fill("Seneca");
  await expect(evidence).toContainText("Historical context");
  await expect(evidence).toContainText("1 BC");
  await expect(evidence).toContainText("no meeting");
  await query.fill("destroyed under Titus");
  await expect(evidence).toContainText("AD 70");
  await expect(evidence).toContainText("External historical context");
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(dialog).toContainText("double-counts overlap");
  await expect(dialog).toContainText("twenty-one years apart");
  await expect(dialog).toContainText("unnamed feast cannot supply an additional year");
});

test("custody and voyage detail distinguish a dated episode from the journey", async ({ page }) => {
  const dialog = await start(page, {}, "ACT.27");
  const query = dialog.getByRole("textbox", { name: "Find timeline entries" });
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await query.fill("ship breaks up");
  await expect(evidence).toContainText("Acts 27:39–44");
  await expect(evidence).toContainText("ACT.27.37");
  await choose(page, dialog, "Timeline chapter", "Chapter 28");
  await query.fill("viper");
  await expect(evidence).toContainText("Acts 28:1–10");
  await expect(evidence).toContainText("ACT.28.11");
  await expect(evidence).toContainText("does not make the visit two years long");
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(dialog).toContainText("Jotham, Pekah and Manasseh");
  await expect(dialog).toContainText("not independent proof of an eleven-year coregency");
});

test("mobile Help search explains new tools, organization, and download status", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#tab=0&tabs=h&layout=Help:page.help");
  const help = page.getByRole("region", { name: "Help panel", exact: true });
  const search = help.getByRole("textbox", { name: "Search application help" });
  for (const [query, expected] of [
    ["Gospel harmony", "Open Tools, expand Timeline below Maps"],
    ["Mary", "Luke explicitly names Joseph"],
    ["confidence", "not measured probabilities"],
    ["Untagged", "including older notes and bookmarks"],
    ["Bookmark location", "renaming it does not move the bookmark"],
    ["freshness", "Fully cached describes file availability"],
    ["Targeting", "Genealogy, Maps, and Timeline each have a separate setting"],
  ]) {
    await search.fill(query);
    await expect(help).toContainText(expected);
  }
  await help.getByRole("button", { name: "Clear help search" }).click();
  await expect(search).toHaveValue("");
  await expect(help).toContainText("How to open and browse Timeline");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("new Gospel scenes keep similar healings and parables separate", async ({ page }) => {
  const dialog = await start(page, {}, "JHN.9");
  const query = dialog.getByRole("textbox", { name: "Find timeline entries" });
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await query.fill("parents are questioned");
  await expect(evidence).toContainText("John 9:13–34");
  await choose(page, dialog, "Timeline collection", "Gospel harmony");
  await query.fill("healed at Bethsaida");
  await expect(evidence).toContainText("Mark 8:22–26");
  await expect(evidence).toContainText("distinct from the man born blind");
  await query.fill("labourers in the vineyard");
  await expect(evidence).toContainText("Matthew 20:1–16");
  await expect(evidence).toContainText("not independent historical events");
});

test("Persian context and exile review preserve the KJV chronology constraints", async ({ page }) => {
  const dialog = await start(page);
  await choose(page, dialog, "Timeline collection", "Wider history");
  const query = dialog.getByRole("textbox", { name: "Find timeline entries" });
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await query.fill("Cambyses conquers");
  await expect(evidence).toContainText("525 BC");
  await expect(evidence).toContainText("Historical geography");
  await expect(evidence.locator('a[href^="http"]')).toHaveCount(0);
  await expect(evidence).toContainText("External sources and citation details are listed on the Credits page");
  await expect(evidence.getByRole("button", { name: "Map: Egypt", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(dialog).toContainText("Exile and the seventy years");
  await expect(dialog).toContainText("586 to 538 is 48");
  await expect(dialog).toContainText("The seventy-year entry remains undated");
});
