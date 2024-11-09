const { chromium } = require('playwright');

async function scrapeArticles() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com/newest');

  let articles = [];
  let pageCounter = 1;

  const parseRelativeTime = (timeText) => {
    const now = new Date();
    const [amount, unit] = timeText.split(" ");
    const value = parseInt(amount, 10);

    if (unit.startsWith("minute")) now.setMinutes(now.getMinutes() - value);
    else if (unit.startsWith("hour")) now.setHours(now.getHours() - value);
    else if (unit.startsWith("day")) now.setDate(now.getDate() - value);
    else if (unit.startsWith("month")) now.setMonth(now.getMonth() - value);
    else if (unit.startsWith("year")) now.setFullYear(now.getFullYear() - value);

    return now;
  };

  while (articles.length < 100) {
    const newArticles = await page.$$eval('.athing', items => items.map(item => {
      const title = item.querySelector('.titleline > a')?.innerText;
      const timeElement = item.nextElementSibling.querySelector('.age');
      const timeText = timeElement ? timeElement.innerText : null;
      return { title, timeText };
    }));

    articles = articles.concat(newArticles);

    if (articles.length >= 100) break;

    const moreButton = await page.$('a.morelink');
    if (!moreButton) break;

    await moreButton.click();
    await page.waitForLoadState('networkidle');
    pageCounter++;
  }

  articles = articles.slice(0, 100);
  articles = articles.map(article => ({
    ...article,
    time: parseRelativeTime(article.timeText),
  }));

  await browser.close();
  return articles;
}

module.exports = { scrapeArticles };

