import { jest } from '@jest/globals'; // Import jest for mocking

// Mock the entire playwright module
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockImplementation(() => ({
      newPage: jest.fn().mockImplementation(() => ({
        goto: jest.fn().mockResolvedValue(null),
        $$eval: jest.fn().mockResolvedValue(
          new Array(100).fill({ title: 'Mock Title', timeText: '5 minutes ago' })
        ),
        $: jest.fn().mockResolvedValue({ click: jest.fn().mockResolvedValue(null) }),
        waitForLoadState: jest.fn().mockResolvedValue(null),
        close: jest.fn().mockResolvedValue(null),
      })),
      close: jest.fn().mockResolvedValue(null),
    })),
  },
}));

import { scrapeArticles } from '../newsScraper.js'; // Import the function to test

describe('scrapeArticles', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should scrape 100 articles', async () => {
    const articles = await scrapeArticles(); // Call the function being tested
    expect(articles).toHaveLength(100); // Check if it returns 100 articles
    expect(articles[0]).toHaveProperty('title', 'Mock Title'); // Check if the first article's title is mocked
  });
});