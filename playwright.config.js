const { chromium } = require('playwright');

(async () => {
  // Step 1: Launch browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Step 2: Navigate to Hacker News 'newest' page
  await page.goto('https://news.ycombinator.com/newest');

  // Step 3: Extract the first 100 articles
  const articles = await page.$$eval('.athing', nodes =>
    nodes.slice(0, 100).map(node => {
      const title = node.querySelector('.titleline > a')?.textContent;
      const ageElement = node.nextElementSibling?.querySelector('.age a');
      const ageText = ageElement ? ageElement.textContent : null;

      return { title, ageText };
    })
  );

  // Step 4: Convert relative time to milliseconds
  const parseRelativeTimeToMilliseconds = (text) => {
    const [value, unit] = text.split(' ');
    const num = parseInt(value, 10);

    if (unit.startsWith('minute')) return num * 60 * 1000;
    if (unit.startsWith('hour')) return num * 60 * 60 * 1000;
    if (unit.startsWith('day')) return num * 24 * 60 * 60 * 1000;
    if (unit.startsWith('month')) return num * 30 * 24 * 60 * 60 * 1000; // Approximate
    if (unit.startsWith('year')) return num * 365 * 24 * 60 * 60 * 1000;

    return 0; // Default fallback for unrecognized units
  };

  // Step 5: Validate if articles are sorted by age
  const isSorted = articles.every((article, i, arr) => {
    if (i === 0) return true; // Skip the first article
    const prevAge = parseRelativeTimeToMilliseconds(arr[i - 1].ageText);
    const currAge = parseRelativeTimeToMilliseconds(article.ageText);
    return prevAge <= currAge; // Ensure that previous article is newer or same
  });

  if (isSorted) {
    console.log('Articles are correctly sorted newest to oldest.');
  } else {
    console.log('Articles are NOT sorted correctly.');
  }

  // Step 6: Close browser
  await browser.close();
})();


