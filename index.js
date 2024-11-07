const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com/newest');

  let articles = [];
  let pageCounter = 1;

  // Helper function to convert relative time to a Date object
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
  console.log(`Successfully collected ${articles.length} articles.`);

  // Convert relative times to Date objects for comparison
  articles = articles.map(article => ({
    ...article,
    time: parseRelativeTime(article.timeText)
  }));

  // Validate the order based on timestamps
  const firstArticleTime = articles[0].time;
  const lastArticleTime = articles[99].time;

  if (firstArticleTime && lastArticleTime && firstArticleTime > lastArticleTime) {
    console.log('The articles are correctly ordered from newest to oldest.');
  } else {
    console.log('The articles are not ordered correctly.');
  }

  await browser.close();
})();





// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
// const { chromium } = require("playwright");

// async function sortHackerNewsArticles() {
//   // launch browser
//   const browser = await chromium.launch({ headless: false });
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // go to Hacker News
//   await page.goto("https://news.ycombinator.com/newest");
// }

// (async () => {
//   await sortHackerNewsArticles();
// })();
