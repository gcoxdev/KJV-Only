import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Genesis 1', exact: true }).click();
  await expect(page.getByLabel('Show audio').first()).toBeVisible();
}

test('sidebar shares Home actions and edits notes, searches, and returns Home', async ({ page }) => {
  await ready(page);
  const sidebar = page.getByRole('region', { name: 'Study sidebar', exact: true });
  await expect(sidebar.getByRole('heading', { name: 'Sidebar Home', exact: true })).toBeVisible();
  await expect(sidebar.getByLabel('Panel options')).toHaveCount(0);
  await expect(sidebar.getByText('Choose a book and chapter', { exact: true })).toHaveCount(0);
  await expect(sidebar.getByRole('button', { name: 'Sidebar Home', exact: true })).toHaveCount(0);
  for (const title of ['Tools', 'Topics', 'Bookmarks', 'Reading Progress']) {
    await sidebar.getByRole('button', { name: title, exact: true }).click();
    await expect(sidebar.getByRole('heading', { name: title, exact: true }).first()).toBeVisible();
    await sidebar.getByRole('button', { name: 'Sidebar Home', exact: true }).click();
  }
  await sidebar.getByRole('button', { name: 'Notes', exact: true }).click();
  await sidebar.getByRole('button', { name: 'New General', exact: true }).click();
  await sidebar.getByPlaceholder('Note title').fill('Sidebar study');
  await sidebar.getByRole('textbox', { name: 'Note body' }).fill('Saved in the sidebar');
  await page.keyboard.press('Control+Enter');
  await expect(sidebar.getByRole('button', { name: 'Edit note', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('kjv-reader-notes-v1') ?? '[]')[0]?.title)).toBe('Sidebar study');
  await expect(page.locator('[data-panel-leaf-id]:visible')).toHaveCount(1);
  await sidebar.getByRole('button', { name: 'Sidebar Home', exact: true }).click();
  await sidebar.getByRole('button', { name: 'Notes', exact: true }).click();
  await expect(sidebar.getByText('Sidebar study', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await sidebar.getByRole('button', { name: 'Sidebar Home', exact: true }).click();
  await sidebar.getByRole('button', { name: 'Search', exact: true }).click();
  await sidebar.getByLabel('Word or phrase').fill('predestinate');
  await sidebar.getByLabel('Run Bible search').click();
  await expect(sidebar.getByText('4 matching verses loaded', { exact: true })).toBeVisible();
  await sidebar.getByRole('button', { name: 'Sidebar Home', exact: true }).click();
  await sidebar.getByRole('button', { name: 'Search', exact: true }).click();
  await sidebar.getByRole('button', { name: 'Show', exact: true }).click();
  await expect(sidebar.getByLabel('Word or phrase')).toHaveValue('predestinate');
  await expect(sidebar.getByText('4 matching verses loaded', { exact: true })).toBeVisible();
  const heading = await sidebar.getByRole('heading', { name: 'Search', exact: true }).last().boundingBox();
  const saveSearch = await sidebar.getByRole('button', { name: 'Save Search', exact: true }).boundingBox();
  expect(saveSearch!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height);
  expect(await sidebar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/sidebar-search.png', fullPage: true });
  await sidebar.getByRole('button', { name: 'Hide', exact: true }).click();
  await sidebar.getByText('Romans 8:29', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Romans 8 panel', exact: true }).filter({ visible: true })).toBeVisible();
});

test('mobile sidebar progress wraps and Continue opens the reader', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.getByRole('button', { name: 'Toggle Sidebar', exact: true }).click();
  const sidebar = page.getByRole('region', { name: 'Study sidebar', exact: true });
  const progress = sidebar.getByRole('region', { name: 'Reading progress', exact: true });
  await expect(progress.getByText('Next: Genesis 1', { exact: true })).toBeVisible();
  const text = await progress.getByText('Next: Genesis 1', { exact: true }).boundingBox();
  const button = await progress.getByRole('button', { name: 'Continue reading at Genesis 1', exact: true }).boundingBox();
  expect(text).not.toBeNull();
  expect(button).not.toBeNull();
  expect(button!.y).toBeGreaterThanOrEqual(text!.y + text!.height);
  expect(await sidebar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/sidebar-home-phone.png', fullPage: true });
  await sidebar.getByRole('button', { name: 'Reading Progress', exact: true }).click();
  await expect(sidebar.getByText('Up next', { exact: true })).toBeVisible();
  await sidebar.getByRole('button', { name: 'Sidebar Home', exact: true }).click();
  await sidebar.getByRole('button', { name: 'Continue reading at Genesis 1', exact: true }).click();
  await expect(sidebar).not.toBeVisible();
  await expect(page.locator('[data-active-panel="true"][aria-label="Genesis 1 panel"]')).toBeVisible();
});

test('note save shortcuts affect only the active sidebar or panel editor', async ({ page }) => {
  await ready(page);
  const panel = page.locator('[data-panel-leaf-id]:visible');
  await panel.getByLabel('Panel options').click();
  await page.getByRole('menuitem', { name: 'Home', exact: true }).click();
  await panel.getByRole('button', { name: 'Notes', exact: true }).click();
  await panel.getByRole('button', { name: 'New General', exact: true }).click();
  await panel.getByPlaceholder('Note title').fill('Panel draft');
  const sidebar = page.getByRole('region', { name: 'Study sidebar', exact: true });
  await sidebar.getByRole('button', { name: 'Notes', exact: true }).click();
  await sidebar.getByRole('button', { name: 'New General', exact: true }).click();
  await sidebar.getByPlaceholder('Note title').fill('Sidebar draft');
  await sidebar.getByRole('textbox', { name: 'Note body' }).fill('Sidebar body');
  await page.keyboard.press('Control+Enter');
  await expect(sidebar.getByRole('button', { name: 'Edit note', exact: true })).toBeVisible();
  await expect(panel.getByPlaceholder('Note title')).toHaveValue('Panel draft');
  const savedTitles = () => page.evaluate(() => JSON.parse(localStorage.getItem('kjv-reader-notes-v1') ?? '[]').map((note: { title: string }) => note.title));
  expect(await savedTitles()).toContain('Sidebar draft');
  expect(await savedTitles()).not.toContain('Panel draft');
  await panel.getByPlaceholder('Note title').click();
  await page.keyboard.press('Control+Enter');
  await expect(panel.getByRole('button', { name: 'Edit note', exact: true })).toBeVisible();
  await expect.poll(savedTitles).toEqual(expect.arrayContaining(['Panel draft', 'Sidebar draft']));
});
