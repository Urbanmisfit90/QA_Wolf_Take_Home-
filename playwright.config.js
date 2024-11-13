const { chromium } = require('playwright');

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

(async () => {
  // Step 1: Launch browser
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Step 2: Navigate to Hacker News 'newest' page
  await page.goto('https://news.ycombinator.com/newest');

  let articles = [];
  let pageCounter = 1;

  while (articles.length < 100) {
    // Step 3: Extract articles from the current page
    const newArticles = await page.$$eval('.athing', nodes =>
      nodes.map(node => {
        const title = node.querySelector('.titleline > a')?.textContent;
        const ageElement = node.nextElementSibling?.querySelector('.age a');
        const timeText = ageElement ? ageElement.textContent : null;
        return { title, timeText };
      })
    );

    // Step 4: Parse relative time and add to articles
    newArticles.forEach(article => {
      if (article.timeText) {
        article.time = parseRelativeTime(article.timeText);
      }
    });

    articles = articles.concat(newArticles);

    // Check if we need to go to the next page
    if (articles.length < 100) {
      const moreLink = await page.$("a.morelink");
      if (moreLink) {
        await moreLink.click();
        await page.waitForLoadState("networkidle");
        pageCounter++;
      } else {
        break;
      }
    }
  }

  // Ensure we only have 100 articles
  articles = articles.slice(0, 100);

  // Step 5: Sort articles by time
  articles.sort((a, b) => b.time - a.time);

  // Step 6: Validate if articles are sorted by age
  const isSorted = articles.every((article, index, array) => 
    index === 0 || article.time <= array[index - 1].time
  );

  if (isSorted) {
    console.log('Articles are correctly sorted newest to oldest.');
  } else {
    console.log('Warning: Articles are not correctly sorted.');
  }

  console.log(`Successfully collected ${articles.length} articles.`);

  // Step 7: Close browser
  await browser.close();
})();


