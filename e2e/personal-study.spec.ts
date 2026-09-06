import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  const tab = page.getByRole('button', { name: 'Genesis 1', exact: true });
  await expect(tab).toBeVisible();
  await tab.click();
  await expect(page.getByLabel('Show audio').first()).toBeVisible();
}
async function homeTool(page: Page, tool: string) {
  await page.getByLabel('Panel options').filter({ visible: true }).first().click();
  await page.getByRole('menuitem', { name: 'Home', exact: true }).click();
  await page.getByRole('button', { name: tool, exact: true }).filter({ visible: true }).first().click();
}

test('notes and bookmarks save folders and tags and filter them together', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.addInitScript(() => {
    if (!localStorage.getItem('kjv-reader-bookmarks-v1')) localStorage.setItem('kjv-reader-bookmarks-v1', JSON.stringify([{ id: 'study-bookmark', type: 'chapter', scope: { type: 'chapter', bookIndex: 0, chapterIndex: 0 }, label: 'Genesis 1', note: '', createdAt: 1, updatedAt: 1 }]));
  });
  await ready(page);
  await homeTool(page, 'Notes');
  await page.getByRole('button', { name: 'New General', exact: true }).click();
  await page.getByPlaceholder('Note title').fill('Sunday study');
  await page.getByLabel('Folder', { exact: true }).fill('Study');
  await page.getByLabel('Tags', { exact: true }).fill('Faith, Prayer, faith');
  await page.getByRole('textbox', { name: 'Note body' }).fill('My study notes');
  await page.screenshot({ path: 'test-results/note-organization-phone.png', fullPage: true });
  await page.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('kjv-reader-notes-v1') ?? '[]')[0]?.tags)).toEqual(['Faith', 'Prayer']);
  await page.getByRole('button', { name: 'Edit note', exact: true }).click();
  await page.getByLabel('Folder', { exact: true }).fill('Discard this');
  await page.getByLabel('Folder', { exact: true }).press('Escape');
  await page.getByRole('button', { name: 'Cancel editing', exact: true }).click();
  await expect(page.getByText('Folder: Study', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  const showList = page.getByRole('button', { name: 'Show notes list', exact: true });
  if (await showList.isVisible()) await showList.click();
  await page.getByLabel('Filter by folder').click();
  await page.getByRole('option', { name: 'Study', exact: true }).click();
  await page.getByLabel('Filter by tag').click();
  await page.getByRole('option', { name: 'Untagged', exact: true }).click();
  await expect(page.getByText('No notes match these filters.')).toBeVisible();
  await page.getByLabel('Filter by tag').click();
  await page.getByRole('option', { name: 'Faith', exact: true }).click();
  await expect(page.locator('[data-notes-list]').getByText('Sunday study', { exact: true })).toBeVisible();
  await homeTool(page, 'Bookmarks');
  await page.getByRole('button', { name: 'Edit Genesis 1', exact: true }).click();
  await page.getByLabel('Folder', { exact: true }).fill('Study');
  await page.getByLabel('Tags', { exact: true }).fill('Prayer, Hope');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('kjv-reader-bookmarks-v1') ?? '[]')[0]?.folder)).toBe('Study');
  await page.reload();
  await expect(page.getByText('Folder: Study', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await page.getByLabel('Filter by tag').click();
  await page.getByRole('option', { name: 'Prayer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit Genesis 1', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('legacy notes and bookmarks appear under Unfiled and Untagged without being edited', async ({ page }) => {
  await page.addInitScript(() => {
    const organization = [
      {},
      { folder: '', tags: [] },
      { folder: 'Study' },
      { tags: ['Faith'] },
      { folder: 'Study', tags: ['Faith'] },
    ];
    localStorage.setItem('kjv-reader-notes-v1', JSON.stringify(organization.map((fields, index) => ({
      id: `old-note-${index}`, title: `Old note ${index}`, body: 'Saved before organization',
      scope: { type: 'general' }, createdAt: 1, updatedAt: 1, ...fields,
    }))));
    localStorage.setItem('kjv-reader-bookmarks-v1', JSON.stringify(organization.map((fields, index) => ({
      id: `old-bookmark-${index}`, label: `Old bookmark ${index}`, note: '', type: 'chapter',
      scope: { type: 'chapter', bookIndex: 0, chapterIndex: index }, createdAt: 1, updatedAt: 1, ...fields,
    }))));
  });
  await ready(page);
  for (const tool of ['Notes', 'Bookmarks']) {
    await homeTool(page, tool);
    const item = (index: number) => tool === 'Notes'
      ? page.locator('[data-notes-list]').getByText(`Old note ${index}`, { exact: true })
      : page.getByRole('button', { name: `Edit Old bookmark ${index}`, exact: true });
    const choose = async (filter: string, option: string) => {
      await page.getByLabel(`Filter by ${filter}`, { exact: true }).filter({ visible: true }).click();
      await page.getByRole('option', { name: option, exact: true }).click();
    };
    const expectItems = async (included: number[]) => {
      for (let index = 0; index < 5; index++) {
        if (included.includes(index)) await expect(item(index)).toBeVisible();
        else await expect(item(index)).toHaveCount(0);
      }
    };
    await choose('folder', 'Unfiled');
    await expectItems([0, 1, 3]);
    await choose('tag', 'Untagged');
    await expectItems([0, 1]);
    await choose('folder', 'All folders');
    await expectItems([0, 1, 2]);
  }
  for (const key of ['kjv-reader-notes-v1', 'kjv-reader-bookmarks-v1']) {
    const legacy = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? '[]')[0], key);
    expect(legacy).not.toHaveProperty('folder');
    expect(legacy).not.toHaveProperty('tags');
    expect(legacy.updatedAt).toBe(1);
  }
});

test('downloads display measured sizes and unknown freshness for existing caches', async ({ page }) => {
  await ready(page);
  await page.getByLabel('Open menu').click();
  await page.getByRole('menuitem', { name: 'Download', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Check for Bundle Updates', exact: true })).toBeVisible();
  await expect(page.getByText('Freshness unknown', { exact: false })).toHaveCount(4);
  await expect(page.getByText('Last verified download: Not recorded', { exact: true })).toHaveCount(4);
  await expect(page.getByText('Size unavailable', { exact: true })).toHaveCount(0);
});

test.describe('verified offline downloads', () => {
  test.use({ serviceWorkers: 'block' });
  test('refresh verifies files, detects a changed bundle, and keeps a partial update unverified', async ({ page }) => {
    const { createHash } = await import('node:crypto');
    const indexPath = '/maps/data/map.json';
    const firstPath = '/maps/geometry/offline-test.geojson';
    const addedPath = '/maps/geometry/offline-added.geojson';
    let files: Record<string, string> = {
      [indexPath]: JSON.stringify([{ geojson_file: 'offline-test.geojson', translations: ['Test'], types: ['place'], verses: [], bounds: [[0, 0, 1, 1]] }]),
      [firstPath]: JSON.stringify({ type: 'FeatureCollection', features: [] }),
    };
    await page.route('**/offline-inventory.json', (route) => route.fulfill({ json: {
      schemaVersion: 1,
      mapUrls: Object.keys(files),
      assets: Object.fromEntries(Object.entries(files).map(([url, body]) => [url, { bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') }])),
    } }));
    await page.route('**/maps/**', (route) => {
      const body = files[new URL(route.request().url()).pathname];
      return body ? route.fulfill({ contentType: 'application/json', body }) : route.continue();
    });
    await ready(page);
    await page.getByLabel('Open menu').click();
    await page.getByRole('menuitem', { name: 'Download', exact: true }).click();
    const maps = page.getByText('Maps', { exact: true }).locator('xpath=ancestor::*[@data-slot="card"][1]');
    await expect(maps.getByText('Size unavailable', { exact: true })).toHaveCount(0);
    await maps.getByRole('button', { name: 'Refresh Bundle', exact: true }).click();
    await expect(maps.getByText('Up to date', { exact: false })).toBeVisible();
    await expect(maps.getByText('2/2', { exact: true })).toBeVisible();
    const firstReceipt = await page.evaluate(() => JSON.parse(localStorage.getItem('kjv-offline-bundle-history-v1') ?? '{}').maps);
    expect(firstReceipt.refreshedAt).toBeGreaterThan(0);
    files = { ...files, [indexPath]: JSON.stringify([{ geojson_file: 'offline-test.geojson' }, { geojson_file: 'offline-added.geojson' }]), [addedPath]: '{"type":"FeatureCollection","features":[]}' };
    await page.getByRole('button', { name: 'Check for Bundle Updates', exact: true }).click();
    await expect(maps.getByText('Update available', { exact: false })).toBeVisible();
    await expect(maps.getByText('2/3', { exact: true })).toBeVisible();
    await maps.getByRole('button', { name: 'Download Maps', exact: true }).click();
    await expect(maps.getByText('3/3', { exact: true })).toBeVisible();
    await expect(maps.getByText('Update available', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kjv-offline-bundle-history-v1') ?? '{}').maps)).toEqual(firstReceipt);
    await maps.getByRole('button', { name: 'Refresh Bundle', exact: true }).click();
    await expect(maps.getByText('Up to date', { exact: false })).toBeVisible();
    await page.reload();
    await expect(maps.getByText('Up to date', { exact: false })).toBeVisible();
    await maps.getByRole('button', { name: 'Clear Bundle', exact: true }).click();
    await expect(maps.getByText('0/3', { exact: true })).toBeVisible();
    await expect(maps.getByText('Last verified download: Not recorded', { exact: true })).toBeVisible();
  });
});

test('bookmark labels and locations edit independently, with shadcn folder choices', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    if (!localStorage.getItem('kjv-reader-bookmarks-v1')) localStorage.setItem('kjv-reader-bookmarks-v1', JSON.stringify([
      { id: 'editable', type: 'chapter', scope: { type: 'chapter', bookIndex: 0, chapterIndex: 0 }, label: 'Original', note: 'Keep this note', folder: 'Study', tags: ['Faith'], createdAt: 1, updatedAt: 1 },
      { id: 'other', type: 'chapter', scope: { type: 'chapter', bookIndex: 0, chapterIndex: 1 }, label: 'Other', note: '', folder: 'Sermons', createdAt: 1, updatedAt: 1 },
    ]));
  });
  const savedBookmark = () => page.evaluate(() => JSON.parse(localStorage.getItem('kjv-reader-bookmarks-v1') ?? '[]').find((item: { id: string }) => item.id === 'editable'));
  await ready(page);
  await homeTool(page, 'Bookmarks');
  await page.getByRole('button', { name: 'Edit Original', exact: true }).click();
  await page.getByLabel('Bookmark label', { exact: true }).fill('Love study');
  await expect(page.getByLabel('Bookmark location', { exact: true })).toHaveValue('Genesis 1');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Love study', { exact: true })).toBeVisible();
  expect((await savedBookmark()).scope).toEqual({ type: 'chapter', bookIndex: 0, chapterIndex: 0 });
  await page.getByRole('button', { name: 'Edit Love study', exact: true }).click();
  await page.getByLabel('Bookmark location', { exact: true }).fill('John 3:999');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Bookmark location', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Bookmark location', { exact: true }).fill('John 3:16');
  await expect(page.getByText('Opens John 3:16.', { exact: true })).toBeVisible();
  const folder = page.getByRole('combobox', { name: 'Folder', exact: true });
  await expect(page.getByRole('button', { name: 'Choose folder', exact: true })).toBeVisible();
  await expect(page.locator('datalist')).toHaveCount(0);
  await folder.fill('');
  await folder.press('ArrowDown');
  await page.getByRole('option', { name: 'Sermons', exact: true }).click();
  await expect(folder).toHaveValue('Sermons');
  await page.screenshot({ path: 'test-results/bookmark-edit-phone.png', fullPage: true });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(savedBookmark).toMatchObject({ id: 'editable', type: 'verse', label: 'Love study', scope: { type: 'verse', bookIndex: 42, chapterIndex: 2, verseNumber: 16 }, folder: 'Sermons', tags: ['Faith'], note: 'Keep this note', createdAt: 1 });
  await page.reload();
  await expect(page.getByText('Love study', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Love study', exact: true }).click();
  await expect(page.getByLabel('Bookmark location', { exact: true })).toHaveValue('John 3:16');
  await page.getByLabel('Bookmark location', { exact: true }).fill('Romans 8:1');
  await page.getByRole('combobox', { name: 'Folder', exact: true }).fill('Discard');
  await page.getByRole('combobox', { name: 'Folder', exact: true }).press('Escape');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect((await savedBookmark()).scope.bookIndex).toBe(42);
  expect((await savedBookmark()).folder).toBe('Sermons');
  await page.getByRole('button', { name: /^Love study Location: John 3:16/ }).click();
  await expect(page.getByRole('region', { name: 'John 3 panel', exact: true }).filter({ visible: true }).first()).toBeVisible();
});
