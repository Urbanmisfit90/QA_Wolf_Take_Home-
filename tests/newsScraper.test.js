const { scrapeArticles } = require('../newsScraper');

jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(() => ({
      newPage: jest.fn(() => ({
        goto: jest.fn(),
        $$eval: jest.fn(() => 
          new Array(100).fill({ title: 'Mock Title', timeText: '5 minutes ago' })
        ),
        $: jest.fn(() => ({ click: jest.fn() })),
        waitForLoadState: jest.fn(),
        close: jest.fn(),
      })),
      close: jest.fn(),
    })),
  },
}));

describe('scrapeArticles', () => {
  test('should scrape 100 articles', async () => {
    const articles = await scrapeArticles();
    expect(articles).toHaveLength(100);
    expect(articles[0]).toHaveProperty('title', 'Mock Title');
  });
});