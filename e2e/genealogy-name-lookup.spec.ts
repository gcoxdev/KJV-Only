import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function selectWord(page: Page, panel: string, verse: number, word: string) {
  if ((page.viewportSize()?.width ?? 1200) < 768) {
    const close = page.getByRole("button", { name: "Close Sidebar", exact: true });
    if (await close.isVisible()) await close.click();
  }
  await page.getByLabel(`${panel} panel`, { exact: true }).locator(`[data-verse-number="${verse}"]`).last()
    .getByRole("button", { name: `Details for ${word}`, exact: true }).click();
}

async function checkPerson(page: Page, name: string) {
  const trigger = page.getByRole("button", { name: "Genealogy", exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const genealogy = trigger.locator('xpath=ancestor::*[@data-slot="accordion-item"][1]');
  await genealogy.getByRole("button", { name: "View Tree", exact: true }).first().click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText(`Focused on ${name}.`, { exact: false })).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
}

for (const width of [375, 1200]) for (const word of ["Jesus", "Christ"]) {
  test(`${word} opens Jesus' genealogy from a cold Matthew 1 at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/#tab=0&tabs=h&layout=Matthew%201:MAT.1");
    await selectWord(page, "Matthew 1", 1, word);
    await checkPerson(page, "Jesus Christ");
    await selectWord(page, "Matthew 1", 17, "Christ");
    await checkPerson(page, "Jesus Christ");
    await selectWord(page, "Matthew 1", 18, word);
    await checkPerson(page, "Jesus Christ");
    expect(errors).toEqual([]);
  });
}

for (const [panel, ref, verse, word, person] of [
  ["John 20", "JHN.20", 1, "Magdalene", "Mary Magdalene"],
  ["Acts 13", "ACT.13", 7, "Paulus", "Sergius Paulus"],
  ["Acts 24", "ACT.24", 27, "Festus", "Porcius Festus"],
  ["Acts 23", "ACT.23", 26, "Claudius", "Claudius Lysias"],
  ["Hebrews 4", "HEB.4", 8, "Jesus", "Joshua"],
  ["Colossians 4", "COL.4", 11, "Jesus", "Jesus"],
] as const) {
  test(`${word} in ${ref}:${verse} opens ${person}`, async ({ page }) => {
    await page.goto(`/#tab=0&tabs=h&layout=${encodeURIComponent(panel)}:${ref}`);
    await selectWord(page, panel, verse, word);
    await checkPerson(page, person);
  });
}
