import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", error => messages.push(error.message));
  await page.route("https://tiles.openfreemap.org/styles/bright", route => route.fulfill({ json: {
    version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#f5f2ec" } }],
  } }));
});
test.afterEach(({ page }) => { expect(errors.get(page)).toEqual([]); });

const cases = [
  { kind: "genealogy", title: "Genealogy", book: "Matthew 1", ref: "MAT.1", verse: 1, word: "Jesus" },
  { kind: "maps", title: "Maps", book: "Judges 18", ref: "JDG.18", verse: 29, word: "Dan" },
  { kind: "timeline", title: "Timeline", book: "Ezra 6", ref: "EZR.6", verse: 0, word: "" },
] as const;

async function configure(page: Page, settings: Record<string, string | boolean>) {
  await page.addInitScript(settings => localStorage.setItem("kjv-display-settings-v1", JSON.stringify({ showWelcomeHomeAtStartup: false, ...settings })), settings);
}
async function openViewer(page: Page, item: typeof cases[number]) {
  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
  if (item.kind === "timeline") {
    if ((page.viewportSize()?.width ?? 1280) < 768) await page.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
    await sidebar.getByRole("button", { name: "Tools", exact: true }).click();
    await sidebar.getByRole("button", { name: "Timeline", exact: true }).click();
    await sidebar.getByRole("button", { name: "Open timeline", exact: true }).click();
  } else {
    await page.getByRole("region", { name: `${item.book} panel`, exact: true }).locator(`[data-verse-number="${item.verse}"]`).last()
      .getByRole("button", { name: `Details for ${item.word}`, exact: true }).first().click();
    await page.getByRole("button", { name: item.kind === "maps" ? "Open Map" : "View Tree", exact: true }).first().click();
  }
}
async function verifyViewer(page: Page, item: typeof cases[number]) {
  const panel = page.getByRole("region", { name: `${item.title} panel`, exact: true });
  await expect(panel).toBeVisible();
  await expect(panel.locator("[data-slot=card-header]").first()).toContainText(item.title);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  if (item.kind === "genealogy") await expect(panel).toContainText("Focused on Jesus Christ.");
  if (item.kind === "maps") {
    await expect(panel.locator("[data-map-zoom]")).toHaveAttribute("data-map-zoom", "15");
    await expect(panel.getByRole("status", { name: "Location confidence" })).toContainText("Tel Dan");
  }
  if (item.kind === "timeline") {
    await expect(panel.getByRole("region", { name: "Historical timeline chart" }).locator(".vis-timeline")).toBeVisible();
    await expect(panel.getByRole("combobox", { name: "Timeline book", exact: true })).toContainText("Ezra");
    await expect(panel.getByRole("combobox", { name: "Timeline chapter", exact: true })).toContainText("Chapter 6");
  }
  expect(await panel.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  return panel;
}

for (const item of cases) for (const destination of ["new-panel", "new-tab", "targeted-panel"] as const) {
  test(`${item.title} opens in ${destination} and survives reload`, async ({ page }) => {
    await configure(page, { [`${item.kind}OpenTarget`]: destination });
    const layout = destination === "targeted-panel" ? `h50(${item.ref};picker*)` : item.ref;
    await page.goto(`/#tab=0&tabs=h&layout=${encodeURIComponent(item.book)}:${layout}`);
    const originalTarget = destination === "targeted-panel" ? await page.getByRole("region", { name: "Panel Home panel", exact: true }).getAttribute("data-panel-leaf-id") : null;
    await openViewer(page, item);
    const panel = await verifyViewer(page, item);
    if (destination === "targeted-panel") await expect(panel).toHaveAttribute("data-panel-leaf-id", originalTarget!);
    if (destination === "new-tab") await expect(page.getByRole("region", { name: `${item.book} panel`, exact: true })).not.toBeVisible();
    else await expect(page.getByRole("region", { name: `${item.book} panel`, exact: true })).toBeVisible();
    await expect(page).toHaveURL(/tool\./);
    await page.reload();
    await verifyViewer(page, item);
  });
}

test("targeting settings are separate and persist", async ({ page }) => {
  await page.goto("/#tab=0&tabs=h&layout=Settings:page.settings");
  await page.getByRole("tab", { name: "Targeting", exact: true }).click();
  for (const [label, target] of [["Genealogy", "New Panel"], ["Maps", "Targeted Panel"], ["Timeline", "New Tab"]]) {
    await expect(page.getByLabel(`${label} Target`, { exact: true })).toContainText("Dialog");
    await page.getByLabel(`${label} Target`, { exact: true }).click();
    await page.getByRole("option", { name: target, exact: true }).click();
  }
  await page.reload();
  await page.getByRole("tab", { name: "Targeting", exact: true }).click();
  for (const [label, target] of [["Genealogy", "New Panel"], ["Maps", "Targeted Panel"], ["Timeline", "New Tab"]]) {
    await expect(page.getByLabel(`${label} Target`, { exact: true })).toContainText(target);
  }
  await expect(page.getByRole("button", { name: "Target this panel", exact: true })).toBeVisible();
});

for (const item of cases) test(`${item.title} uses a mobile tab with normal panel controls`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await configure(page, { [`${item.kind}OpenTarget`]: "new-tab" });
  await page.goto(`/#tab=0&tabs=h&layout=${encodeURIComponent(item.book)}:${item.ref}`);
  await openViewer(page, item);
  const panel = await verifyViewer(page, item);
  await expect(page.getByRole("region", { name: "Study sidebar", exact: true })).not.toBeVisible();
  if (item.kind === "genealogy") {
    await panel.getByRole("button", { name: "Timeline", exact: true }).click();
    await expect(panel.getByRole("region", { name: "Genealogy timeline chart" }).locator(".vis-timeline")).toBeVisible();
  }
  if (item.kind !== "maps") {
    await panel.getByRole("button", { name: "Expand chart", exact: true }).click();
    await expect(panel.getByRole("button", { name: "Fit selection", exact: true })).toBeVisible();
    await panel.getByRole("button", { name: "Collapse chart", exact: true }).click();
  }
  await page.screenshot({ path: `design/${item.kind}-panel-mobile.png` });
  await panel.getByRole("button", { name: "Panel options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Home", exact: true }).click();
  await expect(page.getByRole("region", { name: "Panel Home panel", exact: true })).toBeVisible();
});

for (const item of cases) test(`${item.title} replaces its targeted Tools source and keeps working`, async ({ page }) => {
  await configure(page, { [`${item.kind}OpenTarget`]: "targeted-panel", wordVerseSelectionTarget: "targeted-panel" });
  await page.goto(`/#tab=0&tabs=h&layout=${encodeURIComponent(item.book)}:h50(${item.ref};tools*)`);
  const tools = page.getByRole("region", { name: "Tools panel", exact: true });
  const targetId = await tools.getAttribute("data-panel-leaf-id");
  if (item.kind === "timeline") {
    await tools.getByRole("button", { name: "Timeline", exact: true }).click();
    await tools.getByRole("button", { name: "Open timeline", exact: true }).click();
  } else {
    await page.getByRole("region", { name: `${item.book} panel`, exact: true }).locator(`[data-verse-number="${item.verse}"]`).last()
      .getByRole("button", { name: `Details for ${item.word}`, exact: true }).first().click();
    await tools.getByRole("button", { name: item.kind === "maps" ? "Open Map" : "View Tree", exact: true }).first().click();
  }
  const panel = await verifyViewer(page, item);
  await expect(panel).toHaveAttribute("data-panel-leaf-id", targetId!);
  await expect(tools).toHaveCount(0);
  if (item.kind === "genealogy") {
    await panel.getByRole("button", { name: "Joseph", exact: true }).first().click();
    await expect(panel).toContainText("Focused on Joseph.");
    await panel.getByRole("button", { name: "Panel options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Back", exact: true }).click();
    await expect(panel).toContainText("Focused on Jesus Christ.");
  } else if (item.kind === "maps") {
    await panel.getByRole("button", { name: "Hide areas", exact: true }).click();
    await expect(panel.getByRole("button", { name: "Show areas", exact: true })).toHaveAttribute("aria-pressed", "false");
    await panel.getByRole("button", { name: "Recenter", exact: true }).click();
  } else {
    await panel.getByRole("button", { name: "Biblical", exact: true }).click();
    await expect(panel.getByRole("group", { name: "Historical timeline entries" }).getByRole("button", { name: /Darius I/ })).toHaveCount(0);
  }
});

test("timeline tab keeps filters when following a reference into another tab", async ({ page }) => {
  await configure(page, { timelineOpenTarget: "new-tab" });
  await page.goto("/#tab=0&tabs=h&layout=Ezra%206:EZR.6");
  await openViewer(page, cases[2]);
  const panel = await verifyViewer(page, cases[2]);
  await panel.getByRole("button", { name: "Pin chapter", exact: true }).click();
  await panel.getByRole("button", { name: "Biblical", exact: true }).click();
  await panel.getByRole("article", { name: "Historical timeline evidence" }).getByRole("button", { name: /EZR\.6\./ }).first().click();
  await expect(panel).not.toBeVisible();
  await page.locator("[data-tab-id]").getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("button", { name: "Biblical", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(panel.getByRole("button", { name: "Follow reader", exact: true })).toBeVisible();
  await expect(panel.getByRole("region", { name: "Historical timeline chart" }).locator(".vis-timeline")).toBeVisible();
});

test("a targeted tool in another tab is reused", async ({ page }) => {
  await configure(page, { timelineOpenTarget: "targeted-panel" });
  await page.goto("/#tab=0&tabs=h&layout=Ezra%206:EZR.6|Destination:picker*");
  await openViewer(page, cases[2]);
  const panel = await verifyViewer(page, cases[2]);
  const id = await panel.getAttribute("data-panel-leaf-id");
  await expect(page.locator("[data-tab-id]")).toHaveCount(2);
  await page.locator("[data-tab-id]").getByRole("button", { name: "Ezra 6", exact: true }).click();
  await page.getByRole("region", { name: "Study sidebar", exact: true }).getByRole("button", { name: "Open timeline", exact: true }).click();
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-panel-leaf-id", id!);
  await expect(page.locator("[data-tab-id]")).toHaveCount(2);
});
