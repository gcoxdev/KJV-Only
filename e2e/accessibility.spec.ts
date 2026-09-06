import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const FIRST_VERSE = "In the beginning God created the heaven and the earth."
const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
]

type AccessibilityState = {
  name: string
  violations: Array<{
    id: string
    impact: string | null | undefined
    nodes: Array<{
      target: string[]
      html: string
      failureSummary: string | undefined
    }>
  }>
}

async function expectReaderReady(page: Page) {
  const genesisTab = page.getByRole("button", { name: "Genesis 1", exact: true })
  await expect(genesisTab).toBeVisible()
  await genesisTab.click()
  await expect(
    page.getByText(FIRST_VERSE, { exact: false }).filter({ visible: true }),
  ).toBeVisible()
}

async function auditState(page: Page, name: string): Promise<AccessibilityState> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const violations = results.violations
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes
        .filter(
          (node) =>
            violation.id !== "target-size" ||
            !node.html.includes('data-inline-study-token="true"'),
        )
        .map((node) => ({
          target: node.target.map(String),
          html: node.html,
          failureSummary: node.failureSummary,
        })),
    }))
    .filter((violation) => violation.nodes.length > 0)

  return {
    name,
    violations,
  }
}

function expectNoViolations(states: AccessibilityState[]) {
  expect(states, JSON.stringify(states, null, 2)).toEqual(
    states.map((state) => ({ ...state, violations: [] })),
  )
}

test("major reader and overlay states meet automated WCAG checks", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  const states = [await auditState(page, "reader")]

  await page.getByLabel("Open menu").click()
  states.push(await auditState(page, "main menu"))
  await page.keyboard.press("Escape")

  await page.getByLabel("Open reference command").click()
  states.push(await auditState(page, "empty reference command"))
  await page
    .getByPlaceholder("Type references like John 3:16; Romans 8:1-2")
    .fill("John 3:16")
  await expect(
    page.getByRole("option", { name: "Open in New Tab John 3:16" }),
  ).toBeVisible()
  states.push(await auditState(page, "populated reference command"))
  await page.keyboard.press("Escape")

  await page.getByLabel("Open menu").click()
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click()
  states.push(await auditState(page, "settings visual"))
  await page.getByRole("tab", { name: "Targeting", exact: true }).click()
  states.push(await auditState(page, "settings targeting"))
  await page.getByRole("tab", { name: "Shortcuts", exact: true }).click()
  states.push(await auditState(page, "settings shortcuts"))
  await page.getByRole("tab", { name: "Other", exact: true }).click()
  states.push(await auditState(page, "settings other"))

  await page.keyboard.press("Escape")
  await page.getByLabel("Open menu").click()
  await page.getByRole("menuitem", { name: "Help", exact: true }).click()
  await expect(page.getByLabel("Search application help")).toBeVisible()
  states.push(await auditState(page, "help page"))

  expectNoViolations(states)
})

test("search and note editing states meet automated WCAG checks", async ({
  page,
}) => {
  await page.goto("/")
  await expectReaderReady(page)

  const states: AccessibilityState[] = []

  await page.getByLabel("Open search").click()
  states.push(await auditState(page, "search form"))
  await page.getByLabel("Word or phrase").fill('"In the beginning"')
  await page.getByLabel("Run Bible search").click()
  await expect(page.getByText("Genesis 1:1", { exact: true })).toBeVisible()
  states.push(await auditState(page, "search results"))
  await page.getByRole("button", { name: "Facets" }).click()
  states.push(await auditState(page, "search facets"))

  await page.keyboard.press("Escape")
  await page.getByLabel("Panel options").filter({ visible: true }).first().click()
  await page.getByRole("menuitem", { name: "Home", exact: true }).click()
  await page
    .getByRole("button", { name: "Notes", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await page.getByRole("button", { name: "New General", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "Note body" })).toBeVisible()
  states.push(await auditState(page, "note editor"))

  expectNoViolations(states)
})

test("expanded study tools meet automated WCAG checks", async ({ page }) => {
  await page.goto("/")
  await expectReaderReady(page)

  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true })
  await sidebar.getByRole("button", { name: "Tools", exact: true }).click()
  const expandAll = sidebar
    .getByRole("button", { name: "Expand All", exact: true })
    .filter({ visible: true })
    .first()
  await expect(expandAll).toBeVisible()
  await expandAll.click()
  const concordanceSearch = page.getByLabel("Search concordance term")
  await expect(concordanceSearch).toBeVisible()

  expectNoViolations([await auditState(page, "expanded study tools")])
})
