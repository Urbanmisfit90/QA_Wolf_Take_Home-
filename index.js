require('dotenv').config();  // Load environment variables at the top

const { chromium } = require("playwright");
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Convert articles array to CSV format
const toCSV = (articles) => {
  const rows = articles.map((article, index) => {
    return `${index + 1},"${article.title.replace(/"/g, '""')}","${article.timeText}","${article.time.toISOString()}"`;
  });
  return rows.join("\n");
};

// Save CSV content to a file
const saveFile = (csvContent) => {
  const filePath = path.join(__dirname, "articles.csv");
  const header = "#,title,timeText,time\n";
  fs.writeFileSync(filePath, header + csvContent, "utf8");
  console.log("CSV file saved successfully.");
  return filePath;
};

// Send an email with the CSV file as an attachment
const sendEmailWithAttachment = async (filePath, recipientEmail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Use environment variables for security
      pass: process.env.EMAIL_PASS   // Replace 'EMAIL_USER' and 'EMAIL_PASS' with real values
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
    console.error(`Error sending email: ${error.message}`);
  }
};

// Scrape article information, save as CSV, and email
const getArticleInformation = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/newest");

  let articles = [];

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
    const newArticles = await page.$$eval(".athing", (items) =>
      items.map((item) => {
        const title = item.querySelector(".titleline > a")?.innerText || 'No title';
        const timeElement = item.nextElementSibling.querySelector(".age");
        const timeText = timeElement ? timeElement.innerText : 'Unknown time';
        return { title, timeText };
      })
    );

    articles = articles.concat(newArticles);

    if (articles.length >= 100) break;

    const moreButton = await page.$("a.morelink");
    if (!moreButton) break;

    await moreButton.click();
    await page.waitForLoadState("networkidle");
  }

  articles = articles.slice(0, 100);
  console.log(`Successfully collected ${articles.length} articles.`);

  articles = articles.map((article) => ({
    ...article,
    time: parseRelativeTime(article.timeText),
  }));
  articles.sort((a, b) => b.time - a.time);

  const csvContent = toCSV(articles);
  const filePath = saveFile(csvContent);

  console.log(`CSV file saved to: ${filePath}`);

  await sendEmailWithAttachment(filePath, 'recipient@example.com'); // Replace with real email

  await browser.close();
};

getArticleInformation();
