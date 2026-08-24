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
  let releaseCorpus: () => void = () => {}
  const corpusGate = new Promise<void>((resolve) => {
    releaseCorpus = resolve
  })
  await page.route("**/data/kjv.json", async (route) => {
    await corpusGate
    await route.continue()
  })

  await page.goto("/")
  try {
    await expectReaderReady(page)

    const earlyMeasures = await page.evaluate(() => ({
      bootstrap: performance.getEntriesByName("kjv:bootstrap-load").at(-1)
        ?.duration,
      firstReader: performance.getEntriesByName("kjv:first-reader-ready").at(-1)
        ?.duration,
      corpusCount: performance.getEntriesByName("kjv:corpus-load").length,
    }))
    expect(earlyMeasures.bootstrap).toBeGreaterThan(0)
    expect(earlyMeasures.bootstrap).toBeLessThan(5_000)
    expect(earlyMeasures.firstReader).toBeGreaterThan(0)
    expect(earlyMeasures.firstReader).toBeLessThan(5_000)
    expect(earlyMeasures.corpusCount).toBe(0)
  } finally {
    releaseCorpus()
  }

  await expect
    .poll(() =>
      page.evaluate(
        () => performance.getEntriesByName("kjv:corpus-load").at(-1)?.duration,
      ),
    )
    .toBeTruthy()
  const corpusLoadDuration = await page.evaluate(
    () => performance.getEntriesByName("kjv:corpus-load").at(-1)?.duration,
  )
  expect(corpusLoadDuration).toBeGreaterThan(0)
  expect(corpusLoadDuration).toBeLessThan(30_000)

  await expect(page.getByLabel("Next chapter").first()).toBeEnabled()
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
  await page.getByLabel("Run Bible search").click()
  await expect(page.getByText("Genesis 1:1", { exact: true })).toBeVisible()

  const indexBuildDuration = await page.evaluate(
    () => performance.getEntriesByName("kjv:search-index-build").at(-1)?.duration,
  )
  expect(indexBuildDuration).toBeGreaterThan(0)
  expect(indexBuildDuration).toBeLessThan(15_000)
})

test("loads study-word tools progressively without blocking the reader", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)
  await page.evaluate(() => {
    performance.clearMeasures("kjv:study-word-first-tools")
    performance.clearMeasures("kjv:study-word-concordance-selection")
    performance.clearMeasures("kjv:study-word-all-tools")
  })

  await page
    .getByRole("button", { name: "Details for beginning", exact: true })
    .first()
    .click()

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          performance.getEntriesByName("kjv:study-word-all-tools").at(-1)
            ?.duration,
      ),
    )
    .toBeTruthy()
  await expect(
    page
      .getByRole("button", { name: "Concordance", exact: true })
      .filter({ visible: true }),
  ).toBeVisible()
  await expect(
    page
      .getByRole("button", {
        name: "Webster's 1828 Dictionary",
        exact: true,
      })
      .filter({ visible: true }),
  ).toBeVisible()

  const measures = await page.evaluate(() => ({
    firstTools: performance
      .getEntriesByName("kjv:study-word-first-tools")
      .at(-1)?.duration,
    concordance: performance
      .getEntriesByName("kjv:study-word-concordance-selection")
      .at(-1)?.duration,
    allTools: performance
      .getEntriesByName("kjv:study-word-all-tools")
      .at(-1)?.duration,
  }))
  expect(measures.firstTools).toBeGreaterThan(0)
  expect(measures.firstTools).toBeLessThan(5_000)
  expect(measures.concordance).toBeGreaterThan(0)
  expect(measures.concordance).toBeLessThan(10_000)
  expect(measures.allTools).toBeGreaterThan(0)
  expect(measures.allTools).toBeLessThan(15_000)
})

test("restores a shared chapter layout after reload", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)
  await expect(page.getByLabel("Next chapter").first()).toBeEnabled()
  await page.getByLabel("Next chapter").first().click()
  await expect(
    page.getByRole("button", { name: "Genesis 2", exact: true }),
  ).toBeVisible()
  await expect.poll(() => new URL(page.url()).hash).toContain("GEN.2")

  await page.reload()
  await page.getByRole("button", { name: "Genesis 1", exact: true }).click()
  await expect(
    page
      .getByText("Thus the heavens and the earth were finished", {
        exact: false,
      })
      .filter({ visible: true }),
  ).toBeVisible()
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
