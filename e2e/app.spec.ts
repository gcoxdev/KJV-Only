import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const FIRST_VERSE = "In the beginning God created the heaven and the earth."

async function expectReaderReady(page: import("@playwright/test").Page) {
  const genesisTab = page.getByRole("button", { name: "Genesis 1", exact: true })
  await expect(genesisTab).toBeVisible()
  await genesisTab.click()
  await expect(
    page.getByText(FIRST_VERSE, { exact: false }).filter({ visible: true }),
  ).toBeVisible()
  await expect(page.getByLabel("Next chapter").first()).toBeVisible()
}

test("loads the default reader and preserves chapter navigation", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  const corpusLoadDuration = await page.evaluate(
    () => performance.getEntriesByName("kjv:corpus-load")[0]?.duration,
  )
  expect(corpusLoadDuration).toBeGreaterThan(0)
  expect(corpusLoadDuration).toBeLessThan(60_000)

  await page.getByLabel("Next chapter").first().click()
  await expect(
    page.getByRole("button", { name: "Genesis 2", exact: true }),
  ).toBeVisible()
})

test("recovers from corrupt persisted records", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kjv-reader-notes-v1", "{broken")
    localStorage.setItem("kjv-reader-bookmarks-v1", "not-json")
    localStorage.setItem("kjv-display-settings-v1", "[]")
  })

  await page.goto("/")
  await expectReaderReady(page)
})

test("builds the lazy search index and returns the expected verse", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open search").click()
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
  await page.getByLabel("Word or phrase").fill('"In the beginning"')
  await page.getByRole("button", { name: "Search", exact: true }).last().click()
  await expect(page.getByText("Genesis 1:1", { exact: true })).toBeVisible()

  const indexBuildDuration = await page.evaluate(
    () => performance.getEntriesByName("kjv:search-index-build")[0]?.duration,
  )
  expect(indexBuildDuration).toBeGreaterThan(0)
  expect(indexBuildDuration).toBeLessThan(60_000)
})

test("imports notes through the worker and persists the result", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  const importedNote = {
    id: "e2e-imported-note",
    title: "Imported note",
    body: "Imported body",
    scope: { type: "general" },
    createdAt: 1,
    updatedAt: 2,
  }
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "notes.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify([importedNote])),
  })
  await expect(page.getByRole("alertdialog")).toContainText("Notes Imported")
  await page.getByRole("button", { name: "OK" }).click()
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("kjv-reader-notes-v1") ?? "[]").some(
          (note: { id?: string }) => note.id === "e2e-imported-note",
        ),
      ),
    )
    .toBe(true)
})

test("returns keyboard focus when the main menu closes", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  const menuButton = page.getByLabel("Open menu")
  await menuButton.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("Share Current Layout", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(menuButton).toBeFocused()
})

test("has no serious automated accessibility violations on the reader", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()

  const seriousViolations = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  )
  expect(seriousViolations).toEqual([])
})
