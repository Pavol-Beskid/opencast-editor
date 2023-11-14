import {test, expect} from './baseFixtures';

test.describe('Video editing tests', () => {
  test('Cutting the video should create segments', async ({ page }) => {
    await page.route('**/*/edit.json', async route => {
      const mockResponse = await import('./testAssets/fakeResponse.json');
      await route.fulfill({json: mockResponse});
    });
    await page.goto('http://localhost:3000/');
    await page.getByLabel('Main Navigation').getByLabel('Cutting').click();
    await page.getByLabel('Segment {{index}}. Alive. Start: 00 seconds. End: 01 minutes, 04 seconds.').click();
    await page.getByLabel('Cut. Split the segment at the current timeline marker position. Hotkey: Shift+Alt+c.').click();
    await page.getByLabel('Segment {{index}}. Alive. Start: 00 seconds. End: 32 seconds.').click();
    await page.getByLabel('Cut. Split the segment at the current timeline marker position. Hotkey: Shift+Alt+c.').click();
    await page.getByLabel('Segment {{index}}. Alive. Start: 32 seconds. End: 01 minutes, 04 seconds.').click();
    await page.getByLabel('Cut. Split the segment at the current timeline marker position. Hotkey: Shift+Alt+c.').click();
    let segments = await page.locator('div[class$="segmentsStyle"] > div').all();
    expect(segments.length).toBe(4);
    await page.locator('div[role="button"]:has-text("Merge All")').click();
    segments = await page.locator('div[class$="segmentsStyle"] > div').all();
    expect(segments.length).toBe(1);
  });
});
