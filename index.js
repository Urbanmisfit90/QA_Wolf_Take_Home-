const { chromium } = require("playwright");
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Convert articles array to CSV format
const toCSV = (articles) => {
  let headers = Object.keys(articles[0]).join(",");
  headers = '#,' + headers;
  const rows = articles.map((article, index) => {
    let line = Object.values(article)
      .map((value) => `"${value}"`)
      .join(",");
    line = `${index + 1},` + line;
    return line;
  });
  return [headers, ...rows].join("\n");
};

// Save CSV content to a file
const saveFile = (csvContent) => {
  const filePath = path.join(__dirname, "articles.csv");
  fs.writeFileSync(filePath, csvContent, "utf8");
  return filePath; // Return the path for use in emailing
};

// Send an email with the CSV file as an attachment
const sendEmailWithAttachment = async (filePath, recipientEmail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Load email user from .env file
      pass: process.env.EMAIL_PASS, // Load email password from .env file
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Latest Articles CSV',
    text: 'Hello, please find attached the latest articles CSV file.',
    attachments: [
      {
        filename: 'articles.csv',
        path: filePath
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
};

// Scrape article information, save as CSV, and email
const getArticleInformation = async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: false }); // Launch browser with UI
    const page = await browser.newPage();
    await page.goto("https://news.ycombinator.com/newest");

    let articles = [];
    let pageCounter = 1;

    const parseRelativeTime = (timeText) => {
      const now = new Date();
      const [amount, unit] = timeText.split(" ");
      const value = parseInt(amount, 10);

      if (isNaN(value)) {
        console.warn(`Unexpected time format: ${timeText}`);
        return now; // return current time if parsing fails
      }

      if (unit.startsWith("minute")) now.setMinutes(now.getMinutes() - value);
      else if (unit.startsWith("hour")) now.setHours(now.getHours() - value);
      else if (unit.startsWith("day")) now.setDate(now.getDate() - value);
      else if (unit.startsWith("month")) now.setMonth(now.getMonth() - value);
      else if (unit.startsWith("year")) now.setFullYear(now.getFullYear() - value);

      return now;
    };

    while (articles.length < 100) {
      const newArticles = await page.$$eval(".athing", (items) =>
        items.map((item) => {
          const title = item.querySelector(".titleline > a")?.innerText;
          const timeElement = item.nextElementSibling.querySelector(".age");
          const timeText = timeElement ? timeElement.innerText : null;
          return { title, timeText };
        })
      );

      articles = articles.concat(newArticles);

      if (articles.length >= 100) break;

      const moreButton = await page.$("a.morelink");
      if (!moreButton) break;

      await moreButton.click();
      await page.waitForLoadState("networkidle", { timeout: 10000 }); // Wait for the page to load
      pageCounter++;
    }

    articles = articles.slice(0, 100); // Ensure we have a maximum of 100 articles
    console.log(`Successfully collected ${articles.length} articles.`);

    articles = articles.map((article) => ({
      ...article,
      time: parseRelativeTime(article.timeText),
    }));
    articles.sort((a, b) => b.time - a.time);

    const csvContent = toCSV(articles); // Convert articles to CSV format
    const filePath = saveFile(csvContent); // Save CSV to file

    // Send the CSV file via email
    await sendEmailWithAttachment(filePath, 'jacobmaxplumb@gmail.com'); // Replace with recipient email

  } catch (error) {
    console.error(`Error in getting articles: ${error}`);
  } finally {
    if (browser) {
      await browser.close(); // Ensure the browser closes after the operation
    }
  }
};

getArticleInformation(); // Run the function to start the scraping process 
