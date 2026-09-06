import { expect, test, type Page } from '@playwright/test';

test.use({ isMobile: true, hasTouch: true, serviceWorkers: 'block' });

async function expectSidebarWidth(page: Page) {
  const viewport = page.viewportSize()!;
  const expectedWidth = viewport.width > viewport.height ? viewport.width / 2 : viewport.width - 32;
  const popup = page.locator('[data-slot="sidebar"][data-mobile="true"]');
  await expect(popup).toBeVisible();
  await expect.poll(async () => {
    const bounds = await popup.boundingBox();
    return bounds !== null
      && Math.abs(bounds.width - expectedWidth) < 1
      && Math.abs(bounds.x - (viewport.width - expectedWidth)) < 1;
  }).toBe(true);
  expect(await popup.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
}

for (const viewport of [{ width: 375, height: 667 }, { width: 412, height: 915 }, { width: 915, height: 412 }]) {
  test(`phone sidebar keeps its width across opening routes and rotation at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: 'Genesis 1', exact: true }).click();
    await expect(page.getByLabel('Show audio').first()).toBeVisible();
    const sidebar = page.getByRole('region', { name: 'Study sidebar', exact: true });
    const toggle = page.getByRole('button', { name: 'Toggle Sidebar', exact: true });

    // The first open must already have the intended width and a tappable backdrop.
    await toggle.click();
    await expect(sidebar.getByRole('heading', { name: 'Sidebar Home', exact: true })).toBeVisible();
    await expectSidebarWidth(page);
    await page.touchscreen.tap(16, viewport.height / 2);
    await expect(sidebar).not.toBeVisible();

    await page.getByRole('button', { name: 'Details for beginning', exact: true }).first().click();
    await expect(sidebar.getByRole('heading', { name: 'Tools', exact: true })).toBeVisible();
    await expectSidebarWidth(page);
    await sidebar.getByRole('button', { name: 'Expand All', exact: true }).click();
    await expectSidebarWidth(page);
    await page.touchscreen.tap(16, viewport.height / 2);
    await expect(sidebar).not.toBeVisible();

    await toggle.click();
    await expectSidebarWidth(page);
    await sidebar.getByRole('button', { name: 'Sidebar Home', exact: true }).click();
    await expectSidebarWidth(page);
    await sidebar.getByRole('button', { name: 'Notes', exact: true }).click();
    await sidebar.getByRole('button', { name: 'New General', exact: true }).click();
    await sidebar.getByPlaceholder('Note title').fill('Rotation draft');

    // Rotation must resize the same mobile sheet without discarding its editor.
    await page.setViewportSize({ width: viewport.height, height: viewport.width });
    await expectSidebarWidth(page);
    await expect(sidebar.getByPlaceholder('Note title')).toHaveValue('Rotation draft');
    await page.screenshot({ path: `test-results/sidebar-rotated-${viewport.width}.png`, fullPage: true });
    await page.setViewportSize(viewport);
    await expectSidebarWidth(page);
    await expect(sidebar.getByPlaceholder('Note title')).toHaveValue('Rotation draft');
    await page.touchscreen.tap(16, viewport.height / 2);
    await expect(sidebar).not.toBeVisible();
  });
}
