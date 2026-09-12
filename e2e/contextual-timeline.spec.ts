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

test("manual chapter pin and newly covered undated Job setting", async ({ page }) => {
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
  await expect(dialog.getByRole("status")).toContainText("Job 1:");
  await expect(dialog.getByRole("article", { name: "Historical timeline evidence" })).toContainText("Dates unknown");
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

for (const width of [390, 1280]) {
  test(`refined harmony and remaining New Testament chapter context at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
    };
    await choose("John", 20);
    await entries.getByRole("button", { name: /Jesus appears with Thomas present/ }).click();
    await expect(evidence).toContainText("after eight days");
    await expect(evidence.getByLabel("Narrative passages")).toContainText("John 20:24–29");
    await entries.getByRole("button", { name: /John's stated purpose/ }).click();
    await expect(evidence).toContainText("Dates unknown");
    await choose("Romans", 5);
    await expect(dialog.getByRole("status")).toContainText("Adam and Christ");
    await entries.getByRole("button", { name: /Romans · letter setting/ }).click();
    await expect(evidence).toContainText("Jerusalem");
    await expect(evidence.getByRole("button", { name: "ROM.5.1", exact: true })).toBeVisible();
    await dialog.getByRole("textbox", { name: "Find timeline entries" }).fill("Adam");
    await expect(entries.getByRole("button")).toHaveCount(1);
    await dialog.getByRole("textbox", { name: "Find timeline entries" }).clear();
    await choose("1 John", 3);
    await expect(entries).toContainText("Domitian");
    await entries.getByRole("button", { name: /1 John · letter setting/ }).click();
    await expect(evidence).toContainText("85");
    await choose("Hebrews", 11);
    await expect(dialog.getByRole("status")).toContainText("earlier generations");
    await expect(evidence).toContainText("Dates unknown");
    await choose("Revelation", 20);
    await expect(dialog.getByRole("status")).toContainText("thousand years");
    await expect(evidence).toContainText("no single date or interval joining them");
    await expect(evidence.getByRole("button", { name: "REV.20.1", exact: true })).toBeVisible();
    await expect(dialog.getByRole("region", { name: "Historical timeline chart" })).not.toBeVisible();
    await expect(entries.getByRole("button")).toHaveCount(1);
    await expect(dialog.getByRole("group", { name: "Timeline navigation" })).not.toBeVisible();
    await expect(dialog.getByLabel("Timeline legend")).not.toBeVisible();
    await page.screenshot({ path: `design/contextual-timeline-revelation-${width}.png` });
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1280]) {
  test(`Genesis through Ruth and recalled events at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const chart = dialog.getByRole("region", { name: "Historical timeline chart" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
    };
    await choose("Genesis", 35);
    await entries.getByRole("button", { name: /The death of Isaac/ }).click();
    await expect(evidence).toContainText("later than Joseph's sale");
    await expect(evidence.getByRole("button", { name: "GEN.35.28", exact: true })).toBeVisible();
    await entries.getByRole("button", { name: /Return to Bethel/ }).click();
    await expect(evidence).toContainText("Dates unknown");
    await choose("Genesis", 41);
    await expect(entries).toContainText("Seven plentiful years");
    await expect(chart.locator(".vis-timeline")).toBeVisible();
    await page.screenshot({ path: `design/contextual-timeline-genesis-${width}.png` });
    await choose("Exodus", 40);
    await expect(evidence).toContainText("second year, first month, first day");
    await choose("Numbers", 9);
    await expect(dialog.getByRole("status")).toContainText("earlier than the second-month census");
    await expect(evidence).toContainText("first-month Passover precedes");
    await choose("Leviticus", 16);
    await expect(dialog.getByRole("status")).toContainText("does not narrate an immediate observance");
    await choose("Deuteronomy", 34);
    await expect(evidence).toContainText("Thirty days of mourning");
    await choose("Joshua", 14);
    await expect(entries).toContainText("Caleb");
    await choose("Judges", 11);
    await expect(evidence).toContainText("three hundred years");
    await expect(evidence).toContainText("Dates unknown");
    await expect(chart).not.toBeVisible();
    await page.screenshot({ path: `design/contextual-timeline-judges-${width}.png` });
    await choose("Ruth", 2);
    await expect(evidence).toContainText("barley and wheat harvest");
    await expect(chart).not.toBeVisible();
    await choose("1 Corinthians", 10);
    await expect(evidence).toContainText("1 Corinthians");
    await entries.getByRole("button", { name: /The sea crossing/ }).click();
    await expect(evidence).toContainText("Background or an earlier event");
    await choose("Hebrews", 11);
    await expect(evidence).toContainText("Dates unknown");
    await expect(entries).toContainText("The fall of Jericho");
    await entries.getByRole("button", { name: /The fall of Jericho/ }).click();
    await expect(evidence).toContainText("Background or an earlier event");
    await expect(evidence.getByRole("button", { name: "JOS.6.20", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1280]) {
  test(`Samuel and Kings chronology and namesakes at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const content = dialog.getByRole("group", { name: "Historical timeline content" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
    };
    await choose("1 Samuel", 17);
    await expect(evidence).toContainText("does not give an age");
    await expect(evidence).toContainText("Dates unknown");
    await expect(entries).toContainText("Saul · reign");
    await choose("2 Samuel", 15);
    await expect(dialog.getByRole("status")).toContainText("forty years");
    await expect(evidence).toContainText("not silently changed to four years");
    await choose("2 Samuel", 24);
    await expect(evidence).toContainText("nine months and twenty days");
    await choose("1 Kings", 8);
    await expect(evidence).toContainText("seventh month");
    await expect(evidence).toContainText("Dates unknown");
    await expect(entries).toContainText("Solomon completes the temple");
    await choose("2 Kings", 8);
    await entries.getByRole("button", { name: /Jehoram son of Jehoshaphat and Ahaziah/ }).click();
    await expect(evidence).toContainText("distinct from the northern Jehoram");
    await choose("2 Kings", 12);
    await entries.getByRole("button", { name: /reorganizes temple repairs/ }).click();
    await expect(evidence).toContainText("twenty-third year");
    await choose("2 Kings", 13);
    await expect(evidence).toContainText("Jehoahaz son of Jehu");
    await entries.getByRole("button", { name: /Elisha's final prophecy/ }).click();
    await expect(evidence).toContainText("later incident");
    await choose("2 Kings", 9);
    await expect(entries).toContainText("Jehu's tribute recorded by Assyria");
    await content.getByRole("button", { name: "Historical context", exact: true }).click();
    await expect(entries.getByRole("button", { name: /Jehu's coup/ })).toHaveCount(0);
    await entries.getByRole("button", { name: /Jehu's tribute/ }).click();
    await expect(evidence).toContainText("not proof that Jehu was Omri's biological son");
    await page.screenshot({ path: `design/contextual-timeline-jehu-${width}.png` });
    await content.getByRole("button", { name: "All", exact: true }).click();
    await choose("2 Kings", 20);
    await entries.getByRole("button", { name: /Hezekiah's illness/ }).click();
    await expect(evidence).toContainText("701 BC");
    await choose("2 Kings", 23);
    await entries.getByRole("button", { name: /Josiah removes the altar/ }).click();
    await expect(evidence).toContainText("centuries-earlier prophecy");
    await entries.getByRole("button", { name: /Jeroboam's altars/ }).click();
    await expect(evidence).toContainText("Background or an earlier event");
    await choose("2 Kings", 25);
    await entries.getByRole("button", { name: /Gedaliah appointed/ }).click();
    await expect(evidence).toContainText("Dates unknown");
    await expect(evidence.getByRole("button", { name: "2KI.25.25", exact: true })).toBeVisible();
    await page.screenshot({ path: `design/contextual-timeline-kings-${width}.png` });
    expect(errors).toEqual([]);
  });
}

test("late sidebar loading preserves a panel's first pointer click", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  let releaseSidebar!: () => void;
  const sidebarReady = new Promise<void>(resolve => { releaseSidebar = resolve; });
  await page.route(/reader-study-sidebar[^/]*\.(?:tsx|js)(?:\?|$)/, async route => {
    await sidebarReady;
    await route.continue();
  });
  try {
    await page.goto("/#tab=0&tabs=h&layout=Study:h40(EZR.6;h50(LUK.3;tools))");
    const luke = page.getByLabel("Luke 3 panel", { exact: true });
    await expect(luke).toBeVisible();
    await luke.focus();
    await expect(page.getByRole("status").filter({ hasText: "Loading sidebar…" })).toBeVisible();
    const tools = page.getByLabel("Tools panel", { exact: true });
    const trigger = tools.getByRole("button", { name: "Timeline", exact: true });
    await expect(trigger).toBeVisible();
    const before = (await trigger.boundingBox())!;
    await trigger.hover();
    await page.mouse.down();
    releaseSidebar();
    await expect(page.getByRole("region", { name: "Study sidebar", exact: true })).toBeVisible();
    const after = (await trigger.boundingBox())!;
    expect(Math.abs(after.x - before.x)).toBeLessThan(1);
    expect(Math.abs(after.width - before.width)).toBeLessThan(1);
    await page.mouse.up();
    await expect(tools.getByRole("region", { name: "Timeline", exact: true })).toContainText("Luke 3");
  } finally {
    releaseSidebar();
  }
});

for (const width of [390, 1280]) {
  test(`Chronicles parallels, reform stages, and uncertain dates at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
    };
    await choose("1 Chronicles", 3);
    await expect(evidence).toContainText("extends beyond the exile");
    await expect(evidence).toContainText("Dates unknown");
    await choose("1 Chronicles", 21);
    await expect(evidence).toContainText("three years in Chronicles");
    await expect(evidence.getByRole("button", { name: "2SA.24.13", exact: true })).toBeVisible();
    await expect(evidence.getByRole("button", { name: "1CH.21.12", exact: true })).toBeVisible();
    await choose("1 Chronicles", 26);
    await entries.getByRole("button", { name: /Hebronite officers sought/ }).click();
    await expect(evidence).toContainText("Explicit fortieth regnal year");
    await choose("2 Chronicles", 16);
    await entries.getByRole("button", { name: /Baasha's Ramah blockade/ }).click();
    await expect(evidence).toContainText("not silently changed to sixteen");
    await expect(evidence).toContainText("Dates unknown");
    await choose("2 Chronicles", 34);
    await expect(entries.getByRole("button", { name: /eighth year/ })).toBeVisible();
    await expect(entries.getByRole("button", { name: /twelfth year/ })).toBeVisible();
    await entries.getByRole("button", { name: /twelfth year/ }).click();
    await expect(evidence).toContainText("six regnal years before");
    await page.screenshot({ path: `design/contextual-timeline-chronicles-${width}.png` });
    await choose("2 Chronicles", 33);
    await entries.getByRole("button", { name: /Manasseh taken to Babylon/ }).click();
    await expect(evidence).toContainText("king of Assyria");
    await expect(evidence).toContainText("Dates unknown");
    await choose("2 Chronicles", 36);
    await entries.getByRole("button", { name: /desolation and Jeremiah's seventy years/ }).click();
    await expect(evidence).toContainText("not seventy years apart");
    await expect(evidence.getByRole("button", { name: "JER.25.11", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1280]) {
  test(`broad poetry and minor prophet coverage at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
      await expect(dialog.getByRole("status")).toContainText(`${book} ${chapter}:`);
    };
    await choose("Psalms", 23);
    await expect(dialog.getByRole("status")).toContainText("shepherd");
    await expect(evidence.getByRole("button", { name: "PSA.23.1", exact: true })).toBeVisible();
    await choose("Psalms", 137);
    await expect(evidence).toContainText("not David's contemporary setting");
    await choose("Psalms", 150);
    await expect(dialog.getByRole("status")).toContainText("Everything that has breath");
    await choose("Proverbs", 25);
    await expect(evidence).toContainText("not the date Solomon first spoke");
    await choose("Proverbs", 30);
    await expect(evidence).toContainText("not silently identified as Solomon");
    await choose("Job", 42);
    await expect(evidence).toContainText("140 years after restoration");
    await expect(evidence).toContainText("Dates unknown");
    await choose("Ecclesiastes", 12);
    await expect(dialog.getByRole("status")).toContainText("Remembering the Creator");
    await choose("Song of Solomon", 8);
    await expect(evidence).toContainText("love poetry");
    for (const [book, chapter] of [["Hosea", 14], ["Joel", 3], ["Amos", 9], ["Obadiah", 1], ["Jonah", 4], ["Micah", 7], ["Nahum", 3], ["Habakkuk", 3], ["Malachi", 4]] as const) {
      await choose(book, chapter);
      await expect(evidence).toContainText("Dates unknown");
    }
    await expect(evidence).toContainText("contextual inference");
    await page.screenshot({ path: `design/contextual-timeline-broad-poetry-${width}.png` });
    expect(errors).toEqual([]);
  });

  test(`broad historical and major prophet settings at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
    };
    await choose("Nehemiah", 13);
    await expect(evidence).toContainText("interval until he returns to Jerusalem is unstated");
    await choose("Esther", 3);
    await expect(entries).toContainText("Xerxes I");
    await expect(evidence).toContainText("assumes Ahasuerus is Xerxes");
    await choose("Esther", 10);
    await expect(evidence).toContainText("Dates unknown");
    await choose("Isaiah", 53);
    await expect(dialog.getByRole("status")).toContainText("servant's suffering");
    await expect(evidence).toContainText("not a date for its predicted fulfillment");
    await choose("Jeremiah", 27);
    await expect(evidence).toContainText("not silently changed to Zedekiah");
    await choose("Jeremiah", 45);
    await expect(dialog.getByRole("status")).toContainText("earlier fourth-year message");
    await choose("Jeremiah", 52);
    await expect(entries).toContainText("Jehoiachin released from prison");
    await choose("Lamentations", 5);
    await expect(evidence).toContainText("Dates unknown");
    await choose("Ezekiel", 48);
    await expect(evidence).toContainText("do not assert that the temple was built then");
    await expect(evidence.getByRole("button", { name: "EZK.48.1", exact: true })).toBeVisible();
    await page.screenshot({ path: `design/contextual-timeline-broad-vision-${width}.png` });
    await choose("Daniel", 12);
    await expect(dialog.getByRole("status")).toContainText("does not reset the reception date");
    await choose("Zephaniah", 3);
    await expect(evidence).toContainText("outer possible-date window");
    await choose("Zechariah", 14);
    await expect(evidence).toContainText("Dates unknown");
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1280]) {
  test(`refined prophetic dates and Esther's sequence at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    const dialog = await openTimeline(page, width < 768);
    const entries = dialog.getByRole("group", { name: "Historical timeline entries" });
    const evidence = dialog.getByRole("article", { name: "Historical timeline evidence" });
    const choose = async (book: string, chapter: number) => {
      await dialog.getByRole("combobox", { name: "Timeline book", exact: true }).click();
      await page.getByRole("option", { name: book, exact: true }).click();
      await dialog.getByRole("combobox", { name: "Timeline chapter", exact: true }).click();
      await page.getByRole("option", { name: `Chapter ${chapter}`, exact: true }).click();
    };
    await choose("Ezekiel", 29);
    await entries.getByRole("button", { name: /tenth-year message/ }).click();
    await expect(evidence).toContainText("forty-year desolation is a prediction");
    await expect(evidence.getByRole("button", { name: "EZK.29.1", exact: true })).toBeVisible();
    await entries.getByRole("button", { name: /twenty-seventh-year message/ }).click();
    await expect(evidence).toContainText("seventeen regnal years after");
    await page.screenshot({ path: `design/contextual-timeline-ezekiel-dates-${width}.png` });
    await choose("Ezekiel", 33);
    await entries.getByRole("button", { name: /fugitive reports/ }).click();
    await expect(evidence).toContainText("rather than changed to an eleventh-year reading");
    await choose("Ezekiel", 4);
    await expect(evidence).toContainText("390 days for Israel and 40 for Judah");
    await expect(evidence).toContainText("Dates unknown");
    await choose("Jeremiah", 36);
    await entries.getByRole("button", { name: /scroll read and burned/ }).click();
    await expect(evidence).toContainText("fifth year, after preparation in the fourth");
    await choose("Jeremiah", 28);
    await expect(evidence).toContainText("false prediction");
    await choose("Jeremiah", 51);
    await entries.getByRole("button", { name: /Seraiah takes/ }).click();
    await expect(evidence).toContainText("does not date that fall to the journey");
    await choose("Esther", 9);
    await entries.getByRole("button", { name: /Adar deliverance/ }).click();
    await expect(evidence).toContainText("Shushan's additional Adar 14");
    await entries.getByRole("button", { name: /Purim established/ }).click();
    await expect(evidence).toContainText("Dates unknown");
    await choose("Nehemiah", 12);
    await entries.getByRole("button", { name: /Priestly generations/ }).click();
    await expect(evidence).toContainText("Darius the Persian without a number");
    await entries.getByRole("button", { name: /two thanksgiving companies/ }).click();
    await expect(evidence).toContainText("no regnal year dates this celebration");
    await choose("Daniel", 4);
    await expect(evidence).toContainText("Twelve months pass");
    await expect(evidence).toContainText("Dates unknown");
    expect(errors).toEqual([]);
  });
}
