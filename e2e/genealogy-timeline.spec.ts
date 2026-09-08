import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
test.use({ serviceWorkers: "block" });
const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", error => errors.push(error.message));
});
test.afterEach(({ page }) => { expect(pageErrors.get(page)).toEqual([]); });

async function openTimeline(page: Page) {
  await page.goto("/#tab=0&tabs=h&layout=Genesis%205:GEN.5");
  await page.getByLabel("Genesis 5 panel", { exact: true }).locator('[data-verse-number="6"]').last().getByRole("button", { name: "Details for Seth", exact: true }).click();
  await page.getByRole("button", { name: "Expand All", exact: true }).click();
  await page.getByRole("button", { name: "View Tree", exact: true }).first().click();
  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(dialog.getByRole("region", { name: "Genealogy timeline chart" }).locator(".vis-timeline")).toBeVisible();
  return dialog;
}

test("range labels move with their dates when panned beyond the left edge", async ({ page }) => {
  const dialog = await openTimeline(page);
  await dialog.getByRole("textbox", { name: "Filter timeline" }).fill("EXO.12.40");
  await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  const chart = dialog.getByRole("region", { name: "Genealogy timeline chart" });
  const span = chart.locator(".vis-range.bible-time-period");
  const positions = () => span.evaluate(el => ({
    bar: el.getBoundingClientRect().x,
    label: el.querySelector(".bible-time-label")!.getBoundingClientRect().x,
  }));
  const before = await positions();
  const plot = await chart.locator(".vis-panel.vis-center").boundingBox();
  await page.mouse.move(plot!.x + plot!.width * 0.6, plot!.y + plot!.height - 20);
  await page.mouse.down();
  await page.mouse.move(plot!.x + plot!.width * 0.6 - 50, plot!.y + plot!.height - 20, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await positions()).bar - before.bar)).toBeGreaterThan(30);
  const after = await positions();
  expect(Math.abs((after.label - before.label) - (after.bar - before.bar))).toBeLessThan(2);
});

test.describe("timeline panning", () => {
  test.use({ hasTouch: true });
  for (const touch of [false, true]) {
    test(`dates remain aligned through repeated ${touch ? "touch" : "mouse"} drags and row scrolling`, async ({ page }) => {
      await page.setViewportSize(touch ? { width: 375, height: 812 } : { width: 1200, height: 1000 });
      const dialog = await openTimeline(page);
      await dialog.getByRole("combobox", { name: "Timeline period" }).click();
      await page.getByRole("option", { name: "Exodus and Judges", exact: true }).click();
      await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
      const chart = dialog.getByRole("region", { name: "Genealogy timeline chart" });
      const checkDates = async () => {
        // Compare rendered anchors to the current date-to-screen conversion,
        // including items that have left and re-entered the vertical viewport.
        const entries = chart.locator(".vis-foreground .bible-time-item:is(.vis-box, .vis-point, .vis-range)");
        expect(await entries.count()).toBeGreaterThan(0);
        await expect.poll(() => entries.evaluateAll(elements => elements.map(element => {
          const item = (element as HTMLElement & { "vis-item": {
            data: { start: Date; end?: Date }; conversion: { toScreen: (date: Date) => number };
          } })["vis-item"];
          const rect = element.getBoundingClientRect();
          const origin = element.parentElement!.getBoundingClientRect().x;
          const anchor = rect.x - origin + (element.classList.contains("vis-box") ? rect.width / 2 : 0);
          return { label: element.textContent, error: Math.abs(anchor - item.conversion.toScreen(item.data.start)) };
        }).filter(item => item.error > 2))).toEqual([]);
      };
      await expect(chart.locator(".vis-box").first()).toBeVisible();
      await checkDates();
      const session = touch ? await page.context().newCDPSession(page) : undefined;
      for (const direction of [-1, 1, -1, 1]) {
        const plot = (await chart.locator(".vis-panel.vis-center").boundingBox())!;
        const x = plot.x + plot.width / 2;
        const y = plot.y + plot.height - 12;
        const label = chart.locator(".vis-box").first();
        const before = (await label.boundingBox())!.x;
        if (session) {
          await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
          for (let step = 1; step <= 10; step++) {
            await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + direction * step * 3, y }] });
          }
          await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        } else {
          await page.mouse.move(x, y);
          await page.mouse.down();
          await page.mouse.move(x + direction * 30, y, { steps: 10 });
          await page.mouse.up();
        }
        await expect.poll(async () => Math.abs((await label.boundingBox())!.x - before)).toBeGreaterThan(15);
        await checkDates();
      }
      const rows = chart.getByRole("region", { name: "Timeline rows" });
      await rows.evaluate(el => { el.scrollTop = el.scrollHeight; });
      await checkDates();
      await rows.evaluate(el => { el.scrollTop = 0; });
      await expect(chart.locator(".vis-range").first()).toBeVisible();
      await checkDates();
      await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
      await checkDates();
      await dialog.getByRole("button", { name: "Fit selection", exact: true }).click();
      await checkDates();
      await session?.detach();
    });
  }
});

for (const width of [375, 1200]) {
  test(`fitting includes final labels and period checkmarks have room at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const dialog = await openTimeline(page);
    const chart = dialog.getByRole("region", { name: "Genealogy timeline chart" });
    const checkLastLabel = async () => {
      await chart.getByRole("region", { name: "Timeline rows" }).evaluate(el => { el.scrollTop = el.scrollHeight; });
      await expect.poll(() => chart.evaluate(el => {
        const plot = el.querySelector(".vis-panel.vis-center")!.getBoundingClientRect();
        const labels = [...el.querySelectorAll(".vis-foreground .bible-time-label")];
        return labels.length > 0 && labels.every(el => {
          const label = el.getBoundingClientRect();
          return label.width > 0 && label.left >= plot.left && label.right <= plot.right;
        });
      }), { timeout: 10000 }).toBe(true);
    };
    await checkLastLabel();
    for (const period of ["Adam to the patriarchs", "Abraham to Egypt", "Exodus and Judges", "Kings and prophets", "Exile and return", "Toward Jesus"]) {
      await dialog.getByRole("combobox", { name: "Timeline period" }).click();
      await page.getByRole("option", { name: period, exact: true }).click();
      await checkLastLabel();
      await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
      await dialog.getByRole("button", { name: "Fit selection", exact: true }).click();
      await checkLastLabel();
      await dialog.getByRole("combobox", { name: "Timeline period" }).click();
      const option = page.getByRole("option", { name: period, exact: true });
      await expect.poll(() => option.evaluate(el => {
        const text = el.firstElementChild!.getBoundingClientRect();
        const check = el.querySelector("svg")!.getBoundingClientRect();
        return check.left - text.right;
      })).toBeGreaterThanOrEqual(4);
      await page.keyboard.press("Escape");
    }
    await dialog.getByRole("textbox", { name: "Filter timeline" }).fill("Crucifixion");
    await checkLastLabel();
    await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
    await dialog.getByRole("button", { name: "Fit selection", exact: true }).click();
    await checkLastLabel();
    await page.screenshot({ path: `design/genealogy-timeline-label-fit-${width}.png` });
  });
}

test("timeline cites the KJV, changes assumptions, filters families, and returns to the tree", async ({ page }) => {
  const dialog = await openTimeline(page);
  const evidence = dialog.getByRole("article", { name: "Timeline evidence" });
  await expect(evidence).toContainText("912 years (KJV)");
  await expect(evidence).toContainText("Birth: year 130 from Adam");
  await expect(evidence.getByRole("link", { name: /Old Testament chronology/ })).toHaveAttribute("href", /Chronology-Old-Testament/);
  await dialog.getByRole("button", { name: "Family", exact: true }).click();
  await expect(dialog.getByRole("group", { name: "Timeline entries" })).toContainText("Eve");
  await expect(dialog.getByRole("group", { name: "Timeline entries" })).toContainText("Death: Unknown");
  await dialog.getByRole("button", { name: "Overview", exact: true }).click();
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  const method = dialog.getByRole("region", { name: "Chronology sources and method" });
  expect(await method.evaluate(el => el.clientHeight)).toBeLessThanOrEqual(384);
  await expect(dialog.getByRole("button", { name: /Hide explanation/ })).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByText(/substantial unresolved synchronism/)).toBeVisible();
  await dialog.getByRole("combobox", { name: "Sojourn interpretation" }).click();
  await page.getByRole("option", { name: "430 years from the promise", exact: true }).click();
  await dialog.getByRole("button", { name: /Sources & method/ }).click();
  await expect(evidence).toContainText("912 years (KJV)");
  await expect(evidence).toContainText("Birth: c. 3829 BC");
  await dialog.getByRole("button", { name: "List", exact: true }).click();
  await expect(dialog.getByRole("region", { name: "Genealogy timeline chart" })).toHaveCount(0);
  await dialog.getByRole("button", { name: "View Seth in tree", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "Genealogy Tree", exact: true })).toBeVisible();
});

for (const viewport of [{ width: 375, height: 812 }, { width: 812, height: 375 }]) {
  test(`single-date diamonds stay in their rows at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const dialog = await openTimeline(page);
    await dialog.getByRole("textbox", { name: "Filter timeline" }).fill("EXO.12.40");
    const chart = dialog.getByRole("region", { name: "Genealogy timeline chart" });
    const event = chart.locator(".vis-point.bible-time-event").filter({ hasText: "The Exodus" });
    await expect(event).toBeVisible();
    await expect(chart.locator(".vis-box.bible-time-event, .vis-line.bible-time-event")).toHaveCount(0);
    const markers = chart.locator(".vis-dot.bible-time-event");
    await expect(markers).toHaveCount(1);
    const marker = event.locator(":scope > .vis-dot");
    const legendShape = await dialog.locator(".bible-time-key-point").evaluate(el => getComputedStyle(el).clipPath);
    await expect(marker).toHaveCSS("clip-path", legendShape);
    expect(legendShape).not.toBe("none");
    await expect(event).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(event).toHaveCSS("border-width", "0px");
    const span = chart.locator(".vis-range.bible-time-period");
    await expect(span).toBeVisible();
    expect(await span.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
    const checkMarkerRow = async () => {
      // Read both rectangles in the same frame during dialog resizing.
      await expect.poll(() => event.evaluate(el => {
        const row = el.getBoundingClientRect();
        const dot = el.querySelector(":scope > .vis-dot")!.getBoundingClientRect();
        return dot.y >= row.y && dot.bottom <= row.bottom && Math.abs(dot.x + dot.width / 2 - row.x) < 2;
      })).toBe(true);
    };
    await checkMarkerRow();
    await event.locator(".bible-time-label").click();
    await expect(dialog.getByText(/The Exodus · Single-date event/)).toBeVisible();
    await expect(event).toHaveCSS("outline-style", "none");
    await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
    await dialog.getByRole("button", { name: "Fit selection", exact: true }).click();
    await checkMarkerRow();
    await page.screenshot({ path: `design/genealogy-timeline-diamonds-${viewport.width}.png` });
  });

  test(`timeline fits and exposes unknown endpoints at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const dialog = await openTimeline(page);
    const filter = dialog.getByRole("textbox", { name: "Filter timeline" });
    await filter.fill("Miriam");
    await expect(dialog.locator(".vis-box.bible-time-open-start")).toBeVisible();
    await expect(dialog.locator(".vis-line.bible-time-open-start")).toBeHidden();
    await expect(dialog.locator(".vis-dot.bible-time-open-start")).toBeHidden();
    await expect(dialog.getByRole("article", { name: "Timeline evidence" })).toContainText("Birth: Unknown");
    await filter.fill("Caleb");
    await expect(dialog.locator(".vis-box.bible-time-open-end").first()).toBeVisible();
    await expect(dialog.locator(".vis-line.bible-time-open-end")).toBeHidden();
    await expect(dialog.locator(".vis-dot.bible-time-open-end")).toBeHidden();
    await filter.fill("Jesus");
    await expect(dialog.locator(".vis-time-axis .vis-text").filter({ hasText: /^0 BC$/ })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
    await dialog.getByRole("button", { name: "Fit selection", exact: true }).click();
    await expect(dialog.locator(".vis-range").filter({ hasText: "Jesus — earthly life and ministry" })).toBeVisible();
    const birth = dialog.locator(".vis-range.bible-time-date-window").filter({ hasText: "Birth of Jesus" });
    await expect(birth).toBeVisible();
    expect(await birth.locator(".bible-time-label").evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    expect(await dialog.locator(".vis-range.bible-time-period").first().evaluate(el => getComputedStyle(el).backgroundImage)).toBe("none");
    await dialog.getByRole("region", { name: "Genealogy timeline chart" }).scrollIntoViewIfNeeded();
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `design/genealogy-timeline-${viewport.width}.png` });
    await dialog.getByRole("button", { name: "Expand chart", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Collapse chart", exact: true })).toBeVisible();
    const chart = dialog.getByRole("region", { name: "Genealogy timeline chart" });
    await expect.poll(() => chart.evaluate(el => el.clientHeight)).toBeGreaterThan(viewport.height > 500 ? 400 : 100);
    const box = await chart.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThan(viewport.height);
    await birth.click();
    await expect(dialog.getByText(/Birth of Jesus · Uncertain event date/)).toBeVisible();
    await page.screenshot({ path: `design/genealogy-timeline-expanded-${viewport.width}.png` });
    const axe = await new AxeBuilder({ page }).include('[role="alertdialog"]').analyze();
    expect(axe.violations.filter(v => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
    await filter.fill("no matching timeline entry");
    await expect(dialog.getByText(/No supported calendar placements/)).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Collapse chart", exact: true })).toBeVisible();
    await filter.fill("Jesus");
    await dialog.getByRole("button", { name: "Collapse chart", exact: true }).click();
    await expect(dialog.getByRole("article", { name: "Timeline evidence" })).toContainText("Uncertain event date");
    await expect.poll(() => chart.evaluate(el => el.clientHeight)).toBe(318);
  });
}

test("a timeline KJV citation opens the reader and closes the dialog", async ({ page }) => {
  const dialog = await openTimeline(page);
  const evidence = dialog.getByRole("article", { name: "Timeline evidence" });
  await evidence.getByRole("button", { name: "GEN.5.6", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const openedPanel = page.getByLabel("Genesis 5 panel", { exact: true }).last();
  await expect(openedPanel).toBeVisible();
  await expect(openedPanel.locator('[data-verse-number="6"]').last()).toContainText("Seth lived an hundred and five years");
});

test("selecting Jesus in the reader and repeatedly opening the timeline produces no page errors", async ({ page }) => {
  await page.goto("/#tab=0&tabs=h&layout=Matthew%201:MAT.1");
  for (let i = 0; i < 2; i++) {
    // Clicking the already selected word toggles it off; select its neighbor first.
    if (i > 0) await page.getByLabel("Matthew 1 panel", { exact: true }).locator('[data-verse-number="16"]').last().getByRole("button", { name: "Details for Christ", exact: true }).click();
    await page.getByLabel("Matthew 1 panel", { exact: true }).locator('[data-verse-number="16"]').last().getByRole("button", { name: "Details for Jesus", exact: true }).click();
    await page.getByRole("button", { name: "Expand All", exact: true }).click();
    await page.getByRole("button", { name: "View Tree", exact: true }).first().click();
    const dialog = page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: "Timeline", exact: true }).click();
    await dialog.getByRole("textbox", { name: "Filter timeline" }).fill("Jesus");
    await dialog.locator(".vis-range.bible-time-period").filter({ hasText: "Jesus — earthly life and ministry" }).click();
    await expect(dialog.getByRole("article", { name: "Timeline evidence" })).toContainText("Jesus — earthly life and ministry");
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).not.toBeVisible();
  }
});
