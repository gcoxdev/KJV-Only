import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

function tool(container: Locator, name: string) {
  return container.getByRole("button", { name, exact: true })
    .locator('xpath=ancestor::*[@data-slot="accordion-item"][1]');
}

async function expand(container: Locator, name: string) {
  const trigger = container.getByRole("button", { name, exact: true });
  if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
}

async function closeMobileSidebar(page: Page, width: number) {
  if (width < 768) await page.getByRole("button", { name: "Close Sidebar", exact: true }).click();
}

for (const width of [375, 1280]) {
  for (const example of [
    { name: "Haran", book: "Genesis", chapter: 11, code: "GEN", verse: 31, person: 0, place: 1 },
    { name: "Dan", book: "Judges", chapter: 18, code: "JDG", verse: 29, person: 1, place: 0 },
  ]) {
    test(`distinguishes both ${example.name} occurrences at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const title = `${example.book} ${example.chapter}`;
      await page.goto(`/#tab=0&tabs=h&layout=${encodeURIComponent(title)}:${example.code}.${example.chapter}`);
      const reader = page.getByLabel(`${title} panel`, { exact: true });
      const words = reader.locator(`[data-verse-number="${example.verse}"]`).last()
        .getByRole("button", { name: `Details for ${example.name}`, exact: true });
      await expect(words).toHaveCount(2);
      await words.nth(example.person).click();
      const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
      const genealogy = tool(sidebar, "Genealogy");
      const maps = tool(sidebar, "Maps");
      await expect(sidebar.getByRole("button", { name: "Genealogy", exact: true })).toHaveClass(/text-success/);
      await expand(sidebar, "Genealogy");
      await expect(genealogy.getByRole("button", { name: "View Tree", exact: true })).toHaveCount(1);
      await expect(sidebar.getByRole("button", { name: "Maps", exact: true })).not.toHaveClass(/text-success/);
      await expand(sidebar, "Maps");
      await expect(maps.getByRole("button", { name: "Open Map", exact: true })).toHaveCount(0);
      await closeMobileSidebar(page, width);
      await words.nth(example.place).click();
      await expect(sidebar.getByRole("button", { name: "Maps", exact: true })).toHaveClass(/text-success/);
      await expand(sidebar, "Maps");
      await expect(maps.getByRole("button", { name: "Open Map", exact: true })).toHaveCount(1);
      await expect(sidebar.getByRole("button", { name: "Genealogy", exact: true })).not.toHaveClass(/text-success/);
      await expand(sidebar, "Genealogy");
      await expect(genealogy.getByRole("button", { name: "View Tree", exact: true })).toHaveCount(0);
    });
  }
}

test("uses corrected Moab map evidence in a Tools panel", async ({ page }) => {
  await page.goto("/#tab=0&tabs=h&layout=Numbers%2022:NUM.22");
  const reader = page.getByLabel("Numbers 22 panel", { exact: true });
  await expect(reader).toBeVisible();
  await page.getByLabel("Open menu").click();
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click();
  await page.getByRole("tab", { name: "Targeting", exact: true }).click();
  await page.getByLabel("Word / Verse Selection Target").click();
  await page.getByRole("option", { name: "New Panel", exact: true }).click();
  await page.getByRole("button", { name: "Numbers 22", exact: true }).filter({ visible: true }).click();
  await reader.locator('[data-verse-number="1"]').last().getByRole("button", { name: "Details for Moab", exact: true }).click();
  const panel = page.getByLabel("Tools panel", { exact: true });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("button", { name: "Maps", exact: true })).toHaveClass(/text-success/);
  await expand(panel, "Maps");
  await expect(tool(panel, "Maps").getByRole("button", { name: "Open Map", exact: true })).toHaveCount(1);
  await expect(tool(panel, "Maps").getByText(/location not verified/)).toHaveCount(0);
  await expand(panel, "Genealogy");
  await expect(tool(panel, "Genealogy").getByRole("button", { name: "View Tree", exact: true })).toHaveCount(0);
});

test("labels incomplete map evidence and keeps manual searches available", async ({ page }) => {
  await page.goto("/#tab=0&tabs=h&layout=Judges%2017:JDG.17");
  const reader = page.getByLabel("Judges 17 panel", { exact: true });
  await reader.getByRole("button", { name: "Details for Ephraim", exact: true }).first().click();
  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
  await expect(sidebar.getByRole("button", { name: "Maps", exact: true })).not.toHaveClass(/text-success/);
  await expand(sidebar, "Maps");
  const maps = tool(sidebar, "Maps");
  await expect(maps.getByText("Same name; location not verified for this verse.").first()).toBeVisible();
  const search = maps.getByRole("textbox", { name: "Search maps" });
  await search.fill("Lydia");
  await search.press("Enter");
  // Manual search also finds Magog through its descriptive location names.
  await expect(maps.getByRole("button", { name: "Open Map", exact: true })).toHaveCount(3);
  await expect(maps.getByText(/location not verified/)).toHaveCount(0);
});

test("marks an unresolved ancestor or nation as a possible match", async ({ page }) => {
  await page.goto("/#tab=0&tabs=h&layout=Exodus%201:EXO.1");
  await page.getByLabel("Exodus 1 panel", { exact: true }).getByRole("button", { name: "Details for Israel", exact: true }).first().click();
  const sidebar = page.getByRole("region", { name: "Study sidebar", exact: true });
  await expect(sidebar.getByRole("button", { name: "Genealogy", exact: true })).toHaveClass(/text-success/);
  await expand(sidebar, "Genealogy");
  const genealogy = tool(sidebar, "Genealogy");
  await expect(genealogy.getByText(/The selected occurrence is not yet distinguished/)).toBeVisible();
  const search = genealogy.getByRole("textbox", { name: "Search genealogy" });
  await search.fill("Eden");
  await search.press("Enter");
  await expect(genealogy.getByRole("button", { name: /^Eden Father: Joah/ })).toBeVisible();
  await expect(genealogy.getByText(/The selected occurrence is not yet distinguished/)).toHaveCount(0);
});
