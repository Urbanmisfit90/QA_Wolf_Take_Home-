const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/newest');
  const title = await page.title();
  expect(title).toBe('New Links | Hacker News');
});