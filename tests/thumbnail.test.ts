import { test, expect } from './baseFixtures';

test.describe('Thumbnail editor tests', () => {
  test('Thumbnail should be generated in the window', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByLabel('Thumbnail').click();
    const views = await page.locator('div[class$="ThumbnailTableRow"]').all();
    const presenterView = views.filter(async loc => await loc.locator('div:has-text("Presenter")').count() == 1)[0];

    await presenterView.getByLabel('Generate').click();
    const thumbnail = await page.locator('div[class$="thumbnailTableRowRowStyle"] > img').all();
    expect(thumbnail.length).toBe(1);
  });
});

