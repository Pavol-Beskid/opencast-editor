import { test, expect } from './baseFixtures';

const baseURL = 'http://localhost:3000/';


test('Test: Navigation', async ({page}) => {
  await page.route('**/*/edit.json', async route => {
    const mockResponse = await import('./testAssets/fakeResponse.json');
    await route.fulfill({json: mockResponse});
  });
  await page.goto(baseURL);
  await expect(page).toHaveTitle("Opencast Editor");

  // checks if Navbar on left has 4 elements
  const length = await page.locator('#root > div > div > nav > li').count();
  expect(length >= 2).toBeTruthy();

  // Navigation to Finish
  await page.click('li[role="menuitem"]:has-text("Finish")');

  // Navigation to Cutting
  await page.click('li[role="menuitem"]:has-text("Cutting")');
});
