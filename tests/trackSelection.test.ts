import { test, expect } from './baseFixtures';

test.beforeEach(async ({page}) => {
  await page.route('**/*/edit.json', async route => {
    const mockResponse = await import('./testAssets/fakeResponse.json');
    await route.fulfill({json: mockResponse});
  });
  await page.goto('http://localhost:3000/');
  await page.getByLabel('Tracks').click();
  const trackItem = page.locator('div[class$="trackAreaStyle"] > div').last();
  const btn = trackItem.getByLabel('Do not encode and publish this track.');
  expect(await btn.textContent()).toBe('Delete Track');
  await btn.click();
});

test.describe('Track selection tests', () => {
  test('Deleting a track should disable deleting other track', async ({ page }) => {
    const trackItem = page.locator('div[class$="trackAreaStyle"] > div').first();
    const disabledButton = await trackItem.locator('div[class$="deactivatedButtonStyle"]').all();
    expect(disabledButton.length).toBe(1);
  });

  test('Deleted track should be restored', async ({page}) => {
    let trackItem = page.locator('div[class$="trackAreaStyle"] > div').last();
    const btn = trackItem.locator('div[role="button"]:has-text("Restore Track")');
    await btn.click();
    trackItem = page.locator('div[class$="trackAreaStyle"] > div').first();
    const disabledButton = await trackItem.locator('div[class$="deactivatedButtonStyle"]').all();
    expect(disabledButton.length).toBe(0);
  })
})
