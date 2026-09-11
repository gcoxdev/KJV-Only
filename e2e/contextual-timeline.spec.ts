import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function openTimeline(page: Page, mobile: boolean) {
  await page.goto("/#tab=0&tabs=h&layout=Ezra%206:EZR.6");
  await expect(page.getByLabel("Ezra 6 panel", { exact: true })).toBeVisible();
  if (mobile) await page.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
  await sidebar.getByRole("button", { name: "Tools", exact: true }).click();
  await sidebar.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(sidebar.getByRole("listitem").filter({ hasText: "Second temple completed" })).toBeVisible();
  await sidebar.getByRole("button", { name: "Open timeline", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: /Historical timeline/ });
  await expect(dialog.getByRole("region", { name: "Historical timeline chart" }).locator(".vis-timeline")).toBeVisible();
  return dialog;
}

for (const width of [390, 1280]) {
  test(`chapter context, figures, evidence and expanded layout at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const chart = dialog.getByRole("region", { name: "Historical timeline chart" });
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const content = dialog.getByRole("group", { name: "Historical timeline content" });
    await expect(chart.locator(".vis-labelset .vis-label")).toContainText(["Biblical events", "Historical context"]);
    await expect(entries.getByRole("button", { name: /Darius I/ })).toBeVisible();
    await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
    const bookOptions = page.getByRole("option");
    await expect(bookOptions).toHaveCount(66);
    // Every full name fits before the checkmark, including long book names.
    expect(await bookOptions.evaluateAll(options => options.every(option => {
      const label = option.querySelector("span.whitespace-nowrap")!;
      const text = document.createRange();
      text.selectNodeContents(label);
      const bounds = text.getBoundingClientRect();
      const row = option.getBoundingClientRect();
      return text.getClientRects().length === 1 && bounds.left >= row.left && bounds.right <= row.right - 28;
    }))).toBe(true);
    await page.getByRole("option", { name: "2 Thessalonians", exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `design/contextual-timeline-book-options-${width}.png` });
    await page.keyboard.press("Escape");
    await page.screenshot({ path: `design/contextual-timeline-chapter-${width}.png` });
    await content.getByRole("button", { name: "Biblical", exact: true }).click();
    await expect(entries.getByRole("button", { name: /Darius I/ })).toHaveCount(0);
    await expect(entries.getByRole("button", { name: /Second temple completed/ })).toBeVisible();
    await content.getByRole("button", { name: "Historical context", exact: true }).click();
    await expect(entries.getByRole("button", { name: /Second temple completed/ })).toHaveCount(0);
    await dialog.getByRole("combobox", { name: "Timeline collection", exact: true }).click();
    await page.getByRole("option", { name: "Wider history", exact: true }).click();
    await dialog.getByRole("textbox", { name: "Find timeline entries" }).fill("Aristotle");
    await expect(entries.getByRole("button")).toHaveCount(1);
    await entries.getByRole("button", { name: /Aristotle/ }).click();
    await expect(dialog.getByRole("article", { name: "Historical timeline evidence" })).toContainText("384 BC");
    await expect(dialog.getByRole("link", { name: /Stanford Encyclopedia of Philosophy: Aristotle/ })).toHaveAttribute("href", "https://plato.stanford.edu/entries/aristotle/");
    await dialog.getByRole("textbox", { name: "Find timeline entries" }).fill("Socrates");
    await expect(entries).toContainText("Socrates");
    await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
    await dialog.getByRole("button", { name: "Fit selection", exact: true }).click();
    expect((await chart.boundingBox())!.height).toBeGreaterThan(500);
    if (width < 768) {
      await expect(content).not.toBeVisible();
      await expect(dialog.getByLabel("Timeline legend")).not.toBeVisible();
    }
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `design/contextual-timeline-expanded-${width}.png` });
    await dialog.getByRole("button", { name: "Collapse chart", exact: true }).click();
    const accessibility = await new AxeBuilder({ page }).include('[data-slot="dialog-content"]').withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    await dialog.getByRole("button", { name: "Close timeline", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("manual chapter pin, unknown dates and unsupported coverage", async ({ page }) => {
  const dialog = await openTimeline(page, false);
  await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
  await page.getByRole("option", { name: "Chapter 4", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Follow reader", exact: true })).toBeVisible();
  await dialog.getByRole("group", { name: "Historical timeline entries" }).getByRole("button", { name: /Opposition under later Persian kings/ }).click();
  await expect(dialog.getByRole("article", { name: "Historical timeline evidence" })).toContainText("Dates unknown");
  await dialog.getByRole("button", { name: "Follow reader", exact: true }).click();
  await expect(dialog.getByRole("combobox", { name: "Timeline chapter", exact: true })).toContainText("Chapter 6");
  await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
  await page.getByRole("option", { name: "Job", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("not a date assigned");
});

test("Tools panel remembers the active reader and follows chapter navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/#tab=0&tabs=h&layout=Study:h40(EZR.6;h50(LUK.3;tools))");
  const luke = page.getByLabel("Luke 3 panel", { exact: true });
  await expect(luke).toBeVisible();
  await luke.focus();
  const tools = page.getByLabel("Tools panel", { exact: true });
  await tools.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(tools.getByRole("region", { name: "Timeline", exact: true })).toContainText("Luke 3");
  await tools.getByRole("button", { name: "Open timeline", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: /Historical timeline/ });
  await expect(dialog.getByRole("heading", { name: /Historical timeline · Luke 3/ })).toBeVisible();
  await dialog.getByRole("button", { name: "Close timeline", exact: true }).click();
  await page.getByLabel("Ezra 6 panel", { exact: true }).focus();
  await expect(tools.getByRole("region", { name: "Timeline", exact: true })).toContainText("Ezra 6");
  await page.getByLabel("Ezra 6 panel", { exact: true }).getByRole("button", { name: "Previous chapter", exact: true }).click();
  await expect(tools.getByRole("region", { name: "Timeline", exact: true })).toContainText("Ezra 5");
  await tools.getByRole("button", { name: "Open timeline", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: /Historical timeline · Ezra 5/ })).toBeVisible();
});

test("expanded coverage exposes biblical evidence and recognizable contemporaries", async ({ page }) => {
  const dialog = await openTimeline(page, false);
  const choose = async (book: string, chapter: number) => {
    await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
    await page.getByRole("option", { name: book, exact: true }).click();
    await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
    await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
  };
  const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
  const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
  await choose("Nehemiah", 5);
  await expect(entries).toContainText("Socrates");
  await entries.getByRole("button", { name: /Nehemiah's first governorship/ }).click();
  await expect(evidence).toContainText("Twelve years");
  await choose("Daniel", 9);
  await entries.getByRole("button", { name: /seventy-weeks prophecy/ }).click();
  await expect(evidence).toContainText("Dates unknown");
  await choose("Acts", 18);
  await entries.getByRole("button", { name: /Paul before Gallio/ }).click();
  await expect(evidence.getByRole("link", { name: /Gallio/ })).toBeVisible();
  await expect(evidence.getByRole("button", { name: "ACT.18.12", exact: true })).toBeVisible();
  await expect(dialog.getByRole("status")).not.toContainText("not yet available");
});

for (const width of [390, 1280]) {
  test(`Gospel harmony and Paul's mission stages at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    await dialog.getByRole("combobox", { name: "Timeline collection" }).click();
    await page.getByRole("option", { name: "Gospel harmony", exact: true }).click();
    await dialog.getByRole("combobox", { name: "Timeline stage" }).click();
    await page.getByRole("option", { name: "Galilean ministry", exact: true }).click();
    await dialog.getByRole("textbox", { name: "Find timeline entries" }).fill("five thousand");
    await entries.getByRole("button", { name: /Feeding the five thousand/ }).click();
    const passages = evidence.getByLabel("Narrative passages");
    await expect(passages.getByRole("button")).toHaveCount(4);
    await expect(passages).toContainText("Matthew 14:13–21");
    await expect(passages).toContainText("John 6:1–15");
    await page.screenshot({ path: `design/contextual-timeline-harmony-${width}.png` });
    await dialog.getByRole("textbox", { name: "Find timeline entries" }).clear();
    await dialog.getByRole("combobox", { name: "Timeline collection" }).click();
    await page.getByRole("option", { name: "Paul’s missions", exact: true }).click();
    await expect(dialog.getByRole("combobox", { name: "Timeline stage" })).toContainText("All stages");
    await dialog.getByRole("combobox", { name: "Timeline stage" }).click();
    await page.getByRole("option", { name: "Second mission", exact: true }).click();
    await expect(entries).toContainText("Philippi");
    await expect(entries.getByRole("button", { name: /Eutychus/ })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
    const chart = dialog.getByRole("region", { name: "Historical timeline chart" });
    expect((await chart.boundingBox())!.height).toBeGreaterThan(500);
    await dialog.getByRole("button", { name: "Collapse chart", exact: true }).click();
    await dialog.getByRole("combobox", { name: "Timeline stage" }).click();
    await page.getByRole("option", { name: "Later letters and plans", exact: true }).click();
    await entries.getByRole("button", { name: /intention to visit Spain/ }).click();
    await expect(evidence).toContainText("Dates unknown");
    await expect(evidence).toContainText("not a completed fourth mission");
    await expect(chart.locator(".vis-item")).toHaveCount(0);
    await page.screenshot({ path: `design/contextual-timeline-paul-plans-${width}.png` });
    await evidence.getByLabel("Narrative passages").getByRole("button", { name: "Romans 15:22–29", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByLabel("Romans 15 panel", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
