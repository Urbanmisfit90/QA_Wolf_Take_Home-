import { test, expect } from '@playwright/test';
import { scrapeArticles } from '../newsScraper.js';

// Mocking Playwright browser methods
test.describe('scrapeArticles', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Mocking Playwright's browser behavior (browser + page mocking)
    page.goto = async () => null;
    page.$$eval = async () =>
      new Array(100).fill({ title: 'Mock Title', timeText: '5 minutes ago' });
  });

  test('should scrape 100 articles', async ({ page }) => {
    const articles = await scrapeArticles(page); // Call your function
    expect(articles).toHaveLength(100);
    expect(articles[0].title).toBe('Mock Title');
  });
});