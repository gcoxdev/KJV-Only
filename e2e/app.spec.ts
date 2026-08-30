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
    localStorage.setItem("kjv-search-library-v1", "{broken")
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

test("prioritizes exact multiword Smart Search results", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open search").click()
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
  await page.getByLabel("Word or phrase").fill("work together")
  await page.getByLabel("Run Bible search").click()

  await expect(page.locator("p.tabular-data").first()).toHaveText("Romans 8:28")
  await expect(page.getByText(/\d+ matching verses loaded/)).toBeVisible()
  await expect(page.locator("p.tabular-data").first()).toHaveText("Romans 8:28")
})

test("keeps single-word Smart Search close to the requested spelling", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open search").click()
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
  await page.getByLabel("Word or phrase").fill("predestinate")
  await page.getByLabel("Run Bible search").click()

  await expect(
    page.getByText("4 matching verses loaded", { exact: true }),
  ).toBeVisible()
  for (const reference of [
    "Romans 8:29",
    "Romans 8:30",
    "Ephesians 1:5",
    "Ephesians 1:11",
  ]) {
    await expect(page.getByText(reference, { exact: true })).toBeVisible()
  }
})

test("provides search facets, context, sorting, copy/export, and local reuse", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open search").click()
  await page.getByLabel("Word or phrase").fill('"In the beginning"')
  await page.getByLabel("Run Bible search").click()
  await expect(page.getByText("Genesis 1:1", { exact: true })).toBeVisible()
  await expect(page.getByText(/\d+ matching verses loaded/)).toBeVisible()

  await page.getByRole("button", { name: "Facets" }).click()
  await expect(page.getByText("Loaded Result Counts")).toBeVisible()
  await expect(page.getByText(/Old Testament \d+/)).toBeVisible()
  await page.keyboard.press("Escape")

  await page.getByText("Context", { exact: true }).click()
  await expect(
    page.getByText(/And the earth was without form/).filter({ visible: true }),
  ).toBeVisible()

  await page.getByLabel("Sort search results").click()
  await page.getByRole("option", { name: "Bible order" }).click()
  await expect(page.getByLabel("Sort search results")).toContainText("Bible order")

  await page.getByRole("button", { name: "Result Tools" }).click()
  await page.getByRole("menuitem", { name: "Copy as Text" }).click()
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("Genesis 1:1")

  await page.getByRole("button", { name: "Result Tools" }).click()
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Export .txt" }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe("kjv-search-results.txt")

  await page.getByRole("button", { name: "Save Search" }).click()
  await page.getByLabel("Name").fill("Creation opening")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await page.getByRole("button", { name: "Saved & Recent" }).click()
  await expect(page.getByText("Creation opening", { exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Recent Searches" })).toBeVisible()

  const storedLibrary = await page.evaluate(() =>
    localStorage.getItem("kjv-search-library-v1"),
  )
  expect(storedLibrary).toContain('"version":1')
  expect(storedLibrary).not.toContain('"results"')
})

test("uses context and reference display preferences across Search and tools", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open menu").click()
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click()
  await page.getByRole("tab", { name: "Other", exact: true }).click()

  const contextVerseSlider = page.getByRole("slider", {
    name: "Context verses before and after",
  })
  await contextVerseSlider.press("Home")
  await contextVerseSlider.press("ArrowRight")
  await expect(page.getByText("2 verses each side", { exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("kjv-display-settings-v1") ?? "null"),
      ),
    )
    .toMatchObject({ contextVerseCount: 2 })

  await page.getByLabel("Open search").click()
  await page.getByLabel("Word or phrase").fill("work together")
  await page.getByLabel("Run Bible search").click()
  await expect(page.locator("p.tabular-data").first()).toHaveText("Romans 8:28")
  await page.getByText("Context", { exact: true }).click()
  await expect(
    page.getByText(/Likewise the Spirit also helpeth our infirmities/),
  ).toBeVisible()
  await expect(
    page.getByText(/Moreover whom he did predestinate/),
  ).toBeVisible()
  const searchContext = page
    .locator("p.tabular-data")
    .first()
    .locator("..")
    .locator('[data-verse-context="true"]')
  await expect(searchContext).not.toHaveClass(/border-l-2/)
  await expect(searchContext.locator('[data-context-section="before"]')).toHaveClass(
    /border-l-2/,
  )
  await expect(searchContext.locator('[data-context-section="after"]')).toHaveClass(
    /border-l-2/,
  )
  expect(
    await searchContext.locator("[data-context-line]").evaluateAll((lines) =>
      lines.map((line) => line.getAttribute("data-context-verse")),
    ),
  ).toEqual(["26", "27", "28", "29", "30"])
  await expect(searchContext.locator('[data-context-primary="true"]')).toHaveClass(
    /font-semibold/,
  )
  expect(
    await searchContext
      .locator('[data-context-primary="true"]')
      .evaluate((line) => line.closest("[data-context-section]") === null),
  ).toBe(true)

  await page.getByRole("button", { name: "Genesis 1", exact: true }).click()
  await page
    .getByRole("button", { name: "Details for beginning", exact: true })
    .first()
    .click()
  const sidebar = page.locator('[data-tour="sidebar"]')
  await sidebar.getByRole("button", { name: /^References \d+$/ }).click()
  const referenceButtons = sidebar
    .locator('[data-tool-reference-display="buttons"]')
    .first()
  await expect(referenceButtons.locator(":scope > button").first()).toHaveText(
    "EXO.20.11",
  )

  const referenceFilter = sidebar.locator("[data-tool-reference-filter]").first()
  await expect(referenceFilter).toContainText("62 references in Bible order")
  await referenceFilter.getByRole("button", { name: "Filters" }).click()
  const filterPopover = page
    .locator('[data-slot="popover-content"]')
    .filter({ hasText: "Filter References" })
  const oldTestamentFilter = filterPopover.getByRole("checkbox", {
    name: "Old Testament",
    exact: true,
  })
  const newTestamentFilter = filterPopover.getByRole("checkbox", {
    name: "New Testament",
    exact: true,
  })
  await expect(oldTestamentFilter).toBeChecked()
  await expect(newTestamentFilter).toBeChecked()
  await filterPopover.getByText("Old Testament", { exact: true }).click()
  await expect(oldTestamentFilter).not.toBeChecked()
  await expect(newTestamentFilter).toBeChecked()
  await expect(referenceFilter).toContainText(/Showing \d+ of 62 references/)
  await expect(
    referenceButtons.getByRole("button", { name: "EXO.20.11", exact: true }),
  ).toHaveCount(0)
  await expect(
    referenceButtons.getByRole("button", { name: "HEB.11.3", exact: true }),
  ).toBeVisible()

  await filterPopover.getByText("Hebrews", { exact: true }).click()
  await expect(
    referenceButtons.getByRole("button", { name: "HEB.11.3", exact: true }),
  ).toHaveCount(0)
  await filterPopover
    .getByRole("button", { name: "Show all references" })
    .click()
  await expect(oldTestamentFilter).toBeChecked()
  await expect(newTestamentFilter).toBeChecked()
  await expect(referenceFilter).toContainText("62 references in Bible order")
  await page.keyboard.press("Escape")

  const referenceButton = sidebar.getByRole("button", {
    name: "HEB.11.3",
    exact: true,
  })
  await expect(referenceButton).toBeVisible()
  await referenceButton.hover()

  const referencePopover = page.getByRole("dialog")
  await expect(
    referencePopover.getByText(/Through faith we understand that the worlds were framed/),
  ).toBeVisible()
  const contextButton = referencePopover.getByRole("button", {
    name: "Context",
    exact: true,
  })
  const sideBeforeContext = await referencePopover.getAttribute("data-side")
  const contextButtonBefore = await contextButton.boundingBox()
  if (!contextButtonBefore) {
    throw new Error("Context button did not have a measurable position")
  }
  await contextButton.click()
  await expect(
    referencePopover.getByText(/For by it the elders obtained a good report/),
  ).toBeVisible()
  await expect(
    referencePopover.getByText(/By faith Abel offered unto God/),
  ).toBeVisible()
  await expect(referencePopover).toHaveAttribute("data-side", sideBeforeContext ?? "top")
  const contextButtonAfter = await contextButton.boundingBox()
  if (!contextButtonAfter) {
    throw new Error("Context button moved outside the rendered popover")
  }
  expect(Math.abs(contextButtonAfter.x - contextButtonBefore.x)).toBeLessThan(3)
  expect(Math.abs(contextButtonAfter.y - contextButtonBefore.y)).toBeLessThan(3)
  await page.mouse.move(
    contextButtonBefore.x + contextButtonBefore.width / 2 + 4,
    contextButtonBefore.y + contextButtonBefore.height / 2,
  )
  await page.waitForTimeout(450)
  await expect(referencePopover).toBeVisible()
  const popoverContext = referencePopover.locator('[data-verse-context="true"]')
  await expect(popoverContext).not.toHaveClass(/border-l-2/)
  await expect(popoverContext.locator('[data-context-section="before"]')).toHaveClass(
    /border-l-2/,
  )
  await expect(popoverContext.locator('[data-context-section="after"]')).toHaveClass(
    /border-l-2/,
  )
  await expect(popoverContext.locator('[data-context-primary="true"]')).toHaveCount(1)
  await expect(
    popoverContext.locator('[data-context-primary="true"]').first(),
  ).toHaveClass(/font-semibold/)
  await expect(
    popoverContext.locator('[data-context-line="surrounding"]').first(),
  ).toHaveClass(/font-normal/)
  expect(
    await popoverContext
      .locator('[data-context-primary="true"]')
      .evaluate((line) => line.closest("[data-context-section]") === null),
  ).toBe(true)
  const popoverVerseFontSize = await popoverContext
    .locator('[data-context-primary="true"]')
    .evaluate((line) => getComputedStyle(line).fontSize)

  await page.getByRole("button", { name: "Settings", exact: true }).click()
  await page.getByRole("tab", { name: "Other", exact: true }).click()
  const referenceDisplayOptions = page.getByRole("button", {
    name: /Reference (table|buttons)/,
  })
  expect(
    await referenceDisplayOptions.evaluateAll((options) =>
      options.map((option) => option.getAttribute("aria-label")),
    ),
  ).toEqual(["Reference table", "Reference buttons"])
  await referenceDisplayOptions.filter({ hasText: "Table" }).click()
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("kjv-display-settings-v1") ?? "null"),
      ),
    )
    .toMatchObject({ toolReferenceDisplayMode: "table" })

  const referenceTable = sidebar
    .locator('[data-tool-reference-display="table"]')
    .first()
  await expect(referenceTable).toBeVisible()
  await expect(referenceTable).toHaveAttribute("data-slot", "scroll-area")
  const tableContainer = referenceTable.locator('[data-slot="table-container"]')
  await expect
    .poll(() =>
      tableContainer.evaluate(
        (container) => container.scrollWidth <= container.clientWidth + 1,
      ),
    )
    .toBe(true)
  const tableWidths = await tableContainer.evaluate((container) => ({
    clientWidth: container.clientWidth,
    scrollWidth: container.scrollWidth,
  }))
  expect(tableWidths.scrollWidth).toBeLessThanOrEqual(tableWidths.clientWidth + 1)
  const showMoreReferences = referenceTable.getByRole("button", {
    name: /Show more \(\d+ remaining\)/,
  })
  await expect(showMoreReferences).toBeVisible()
  await showMoreReferences.click()
  const hebrewsRow = referenceTable
    .getByRole("row")
    .filter({ hasText: "Hebrews 11:3" })
  await expect(hebrewsRow).toContainText(
    "Through faith we understand that the worlds were framed",
  )
  const referenceHeading = hebrewsRow.locator("[data-reference-heading]")
  await expect(referenceHeading).toContainText("Hebrews 11:3")
  await expect(
    referenceHeading.getByRole("button", { name: "Open", exact: true }),
  ).toBeVisible()
  const rowContextButton = hebrewsRow.getByRole("button", {
    name: "Context",
    exact: true,
  })
  await expect(referenceHeading.getByRole("button", { name: "Context" })).toBeVisible()
  const tablePrimaryLine = hebrewsRow.locator('[data-context-primary="true"]')
  const tableTextSizes = await tablePrimaryLine.evaluate((line) => {
    const spans = line.querySelectorAll("span")
    return {
      line: getComputedStyle(line).fontSize,
      verseLabel: getComputedStyle(spans[0]).fontSize,
      verseText: getComputedStyle(spans[1]).fontSize,
    }
  })
  expect(tableTextSizes).toEqual({
    line: popoverVerseFontSize,
    verseLabel: popoverVerseFontSize,
    verseText: popoverVerseFontSize,
  })
  await expect(rowContextButton).toHaveAttribute("aria-expanded", "false")
  await rowContextButton.click()
  await expect(hebrewsRow.getByRole("button", { name: "Hide" })).toHaveAttribute(
    "aria-expanded",
    "true",
  )
  await expect(hebrewsRow).toContainText("For by it the elders obtained a good report")
  await expect(hebrewsRow).toContainText("By faith Abel offered unto God")
  await expect(hebrewsRow.locator('[data-context-primary="true"]')).toHaveClass(
    /font-semibold/,
  )
})

test("restores shareable search configuration without embedding results", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open search").click()
  await page.getByLabel("Word or phrase").fill("work together")
  await page.getByLabel("Word or phrase").blur()

  await expect
    .poll(() => new URL(page.url()).hash)
    .toContain("&search=")
  const sharedUrl = page.url()
  expect(decodeURIComponent(new URL(sharedUrl).hash)).not.toContain("results")
  expect(decodeURIComponent(new URL(sharedUrl).hash)).not.toContain("history")

  await page.reload()
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
  await expect(page.getByLabel("Word or phrase")).toHaveValue("work together")
  await expect(page.getByText("No verses loaded yet")).toBeVisible()
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

test.describe("study-data corpus isolation", () => {
  test.use({ serviceWorkers: "block" })

  test("loads genealogy-name study data without waiting for the full corpus", async ({
    page,
  }) => {
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
      await page.evaluate(() => {
        performance.clearMeasures("kjv:study-word-all-tools")
      })

      await page
        .getByRole("button", { name: "Details for God", exact: true })
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
        page.getByRole("button", { name: "View Tree", exact: true }),
      ).toBeVisible()

      const measures = await page.evaluate(() => ({
        allTools: performance
          .getEntriesByName("kjv:study-word-all-tools")
          .at(-1)?.duration,
        corpusCount: performance.getEntriesByName("kjv:corpus-load").length,
      }))
      expect(measures.allTools).toBeGreaterThan(0)
      expect(measures.allTools).toBeLessThan(10_000)
      expect(measures.corpusCount).toBe(0)
    } finally {
      releaseCorpus()
    }
  })
})

test("clears transient study selections when read mode closes the tools", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page
    .getByRole("button", { name: "Details for beginning", exact: true })
    .first()
    .click()
  await expect(
    page
      .getByRole("button", { name: "beginning", exact: true })
      .filter({ visible: true }),
  ).toBeVisible()

  await page.getByLabel("Switch to read mode").click()
  await expect(page.getByLabel("Switch to study mode")).toBeVisible()
  await page.getByLabel("Switch to study mode").click()
  await page.getByRole("button", { name: "Toggle Sidebar" }).click()

  await page
    .getByRole("button", { name: "Concordance", exact: true })
    .filter({ visible: true })
    .click()
  await expect(
    page.getByText("Click a word in the text or search concordance.", {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page
      .getByRole("button", { name: "beginning", exact: true })
      .filter({ visible: true }),
  ).toHaveCount(0)
})

test("loads auxiliary reader panels on demand", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  const openPanelHome = async () => {
    await page.getByLabel("Panel options").filter({ visible: true }).first().click()
    await page.getByRole("menuitem", { name: "Home", exact: true }).click()
    await expect(page.getByText("Panel Home", { exact: true })).toBeVisible()
  }

  await openPanelHome()
  await page
    .getByRole("button", { name: "Tools", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await expect(
    page.getByRole("button", { name: "Concordance", exact: true }),
  ).toBeVisible()

  await openPanelHome()
  await page
    .getByRole("button", { name: "Topics", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await expect(page.getByLabel("Filter topics")).toBeVisible()

  await openPanelHome()
  await page
    .getByRole("button", { name: "Bookmarks", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await expect(page.getByText("No bookmarks yet.", { exact: true })).toBeVisible()

  await page.getByLabel("Open menu").click()
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click()
  await expect(page.getByRole("tab", { name: "Visual", exact: true })).toBeVisible()

  await page.getByLabel("Open menu").click()
  await page
    .getByRole("menuitem", { name: "Reading Progress", exact: true })
    .click()
  await expect(page.getByText("Whole Bible", { exact: true })).toBeVisible()
})

test("keeps Tools and Topics accordion expansion scoped to each surface", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  const panels = page.locator("[data-panel-leaf-id]:visible")
  await panels
    .first()
    .getByLabel("Panel options")
    .click()
  await page.getByRole("menuitem", { name: "Split Right", exact: true }).click()
  await expect(panels).toHaveCount(2)

  const auxiliaryPanel = panels.nth(1)
  await auxiliaryPanel
    .getByRole("button", { name: "Tools", exact: true })
    .click()

  const sidebar = page.locator('[data-tour="sidebar"]')
  const panelConcordance = auxiliaryPanel.getByRole("button", {
    name: "Concordance",
    exact: true,
  })
  const sidebarConcordance = sidebar.getByRole("button", {
    name: "Concordance",
    exact: true,
  })

  await auxiliaryPanel
    .getByRole("button", { name: "Expand All", exact: true })
    .click()
  await expect(panelConcordance).toHaveAttribute("aria-expanded", "true")
  await expect(sidebarConcordance).toHaveAttribute("aria-expanded", "false")
  await expect(
    sidebar.getByRole("button", { name: "Collapse All", exact: true }),
  ).toBeDisabled()

  const panelConcordanceSearch = auxiliaryPanel.getByPlaceholder(
    "Search concordance...",
  )
  await panelConcordanceSearch.fill("faith")
  await auxiliaryPanel.getByLabel("Search concordance").click()
  await expect(panelConcordanceSearch).toHaveValue("faith")

  await sidebarConcordance.click()
  const sidebarConcordanceSearch = sidebar.getByPlaceholder(
    "Search concordance...",
  )
  await expect(sidebarConcordanceSearch).toHaveValue("")
  await sidebarConcordanceSearch.fill("love")
  await sidebar.getByLabel("Search concordance").click()
  await expect(sidebarConcordanceSearch).toHaveValue("love")
  await expect(panelConcordanceSearch).toHaveValue("faith")

  await panels
    .first()
    .getByRole("button", { name: "Details for beginning", exact: true })
    .click()
  await expect(
    sidebar.getByRole("button", { name: "beginning", exact: true }),
  ).toBeVisible()
  await expect(panelConcordanceSearch).toHaveValue("faith")

  await auxiliaryPanel.getByLabel("Panel options").click()
  await page.getByRole("menuitem", { name: "Home", exact: true }).click()
  await auxiliaryPanel
    .getByRole("button", { name: "Topics", exact: true })
    .click()
  await sidebar
    .getByRole("button", { name: "Topics", exact: true })
    .click()

  const topicLetter = auxiliaryPanel.getByRole("button", {
    name: "A",
    exact: true,
  })
  await expect(topicLetter).toBeEnabled()
  await topicLetter.click()
  await expect(
    auxiliaryPanel.getByText("Showing topics that begin with A.", {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    sidebar.getByText(
      "Choose one or more letters to browse topics, or start typing to filter them.",
      { exact: true },
    ),
  ).toBeVisible()

  await sidebar.getByRole("button", { name: "A", exact: true }).click()

  const panelTopic = auxiliaryPanel
    .locator('[data-slot="accordion-trigger"]')
    .first()
  const sidebarTopic = sidebar
    .locator('[data-slot="accordion-trigger"]')
    .first()
  await expect(panelTopic).toBeVisible()
  await expect(sidebarTopic).toBeVisible()
  await panelTopic.click()

  await expect(panelTopic).toHaveAttribute("aria-expanded", "true")
  await expect(sidebarTopic).toHaveAttribute("aria-expanded", "false")

  const panelTopicsFilter = auxiliaryPanel.getByPlaceholder("Filter topics...")
  const sidebarTopicsFilter = sidebar.getByPlaceholder("Filter topics...")
  await panelTopicsFilter.fill("Ab")
  await expect(panelTopicsFilter).toHaveValue("Ab")
  await expect(sidebarTopicsFilter).toHaveValue("")
  await sidebarTopicsFilter.fill("Faith")
  await expect(sidebarTopicsFilter).toHaveValue("Faith")
  await expect(panelTopicsFilter).toHaveValue("Ab")
})

test("routes word selections only to the configured Tools panel session", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open menu").click()
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click()
  await page.getByRole("tab", { name: "Targeting", exact: true }).click()
  await page.getByLabel("Word / Verse Selection Target").click()
  await page.getByRole("option", { name: "New Panel", exact: true }).click()

  const sidebar = page.locator('[data-tour="sidebar"]')
  const sidebarToggle = page.locator('[data-tour="sidebar-toggle"]')
  await expect(sidebar).toBeVisible()
  await expect(sidebarToggle).toBeVisible()
  await sidebarToggle.click()
  await expect(sidebar).not.toBeVisible()
  await sidebarToggle.click()
  await expect(sidebar).toBeVisible()

  await page
    .getByRole("button", { name: "Genesis 1", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await page
    .getByRole("button", { name: "Details for beginning", exact: true })
    .click()

  const panels = page.locator("[data-panel-leaf-id]:visible")
  await expect(panels).toHaveCount(2)
  const toolsPanel = panels.nth(1)
  await expect(
    toolsPanel.getByRole("button", { name: "beginning", exact: true }),
  ).toBeVisible()
  await expect(
    sidebar.getByRole("button", { name: "beginning", exact: true }),
  ).toHaveCount(0)

  await sidebar.getByRole("button", { name: "Topics", exact: true }).click()
  await expect(sidebar.getByPlaceholder("Filter topics...")).toBeVisible()
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

test("preserves panel split, preview, move, and close behavior", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  const panels = page.locator("[data-panel-leaf-id]:visible")
  const panelOptions = page
    .getByLabel("Panel options")
    .filter({ visible: true })
  await panelOptions.first().click()
  await page.getByRole("menuitem", { name: "Split Right", exact: true }).click()

  await expect(panels).toHaveCount(2)
  await expect(panels.nth(0)).toContainText(FIRST_VERSE)
  await expect(panels.nth(1)).toContainText("Panel Home")

  await panelOptions.first().click()
  const moveRight = page.getByRole("menuitem", {
    name: "Move Right",
    exact: true,
  })
  await moveRight.hover()
  await expect(
    panels.nth(1).locator(':scope > [data-slot="card"]'),
  ).toHaveClass(/panel-move-preview-surface/)
  await moveRight.click()

  await expect(panels.nth(0)).toContainText("Panel Home")
  await expect(panels.nth(1)).toContainText(FIRST_VERSE)

  await panelOptions.first().click()
  await page.getByRole("menuitem", { name: "Close Panel", exact: true }).click()
  await expect(panels).toHaveCount(1)
  await expect(panels.first()).toContainText(FIRST_VERSE)
})

test("opens multiple reference-command targets in the current tab", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByLabel("Open reference command").click()
  await page
    .getByPlaceholder("Type references like John 3:16; Romans 8:1-2")
    .fill("John 3:16; Romans 8:1-2")
  await page
    .getByText("Open All as New Panels in Current Tab", { exact: true })
    .click()

  await expect(page.locator("[data-panel-leaf-id]:visible")).toHaveCount(3)
  await expect(
    page.getByText("For God so loved the world", { exact: false }),
  ).toBeVisible()
  await expect(
    page.getByText("There is therefore now no condemnation", {
      exact: false,
    }),
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

test("preserves guided-tour navigation", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.getByRole("button", { name: "Welcome Home", exact: true }).click()
  await page.getByRole("button", { name: "Take the Tour", exact: true }).click()
  await expect(page.getByText("Tour Step 1 of 11", { exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Main Menu" })).toBeVisible()

  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(page.getByText("Tour Step 2 of 11", { exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Quick Open" })).toBeVisible()

  await page.getByRole("button", { name: "Back", exact: true }).click()
  await expect(page.getByText("Tour Step 1 of 11", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Skip Tour", exact: true }).click()
  await expect(page.getByText("Tour Step 1 of 11", { exact: true })).toBeHidden()
})

test("preserves deferred PWA installation", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  await page.evaluate(() => {
    const installPrompt = new Event("beforeinstallprompt")
    Object.defineProperties(installPrompt, {
      prompt: {
        value: async () => {
          ;(window as typeof window & { installPromptCalled?: boolean })
            .installPromptCalled = true
        },
      },
      userChoice: {
        value: Promise.resolve({ outcome: "accepted", platform: "web" }),
      },
    })
    window.dispatchEvent(installPrompt)
  })

  await page.getByLabel("Open menu").click()
  await page.getByRole("menuitem", { name: "Download", exact: true }).click()
  await expect(page.getByText("Ready to install", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Install App", exact: true }).click()
  await expect(page.getByText("Installed", { exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { installPromptCalled?: boolean })
            .installPromptCalled,
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
