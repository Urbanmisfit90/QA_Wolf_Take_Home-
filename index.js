require('dotenv').config()
const { chromium } = require("playwright");
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Convert articles array to CSV format
const toCSV = (articles) => {
  let headers = "#,title,timeText,time";
  const rows = articles.map((article, index) => {
    return `${index + 1},"${article.title}","${article.timeText}","${article.time.toISOString()}"`;
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
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
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
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://news.ycombinator.com/newest");

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
    const newArticles = await page.$$eval(".athing", (items) => {
      return items.map((item) => {
        const title = item.querySelector(".titleline > a")?.innerText;
        const timeElement = item.nextElementSibling.querySelector(".age");
        const timeText = timeElement ? timeElement.innerText : null;
        return { title, timeText };
      });
    });

    newArticles.forEach(article => {
      if (article.timeText) {
        article.time = parseRelativeTime(article.timeText);
      }
    });

    articles = articles.concat(newArticles);

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

  articles = articles.slice(0, 100);
  articles.sort((a, b) => b.time - a.time);

  const isSorted = articles.every((article, index, array) => 
    index === 0 || article.time <= array[index - 1].time
  );

  if (isSorted) {
    console.log("Articles are correctly sorted newest to oldest.");
  } else {
    console.log("Warning: Articles are not correctly sorted.");
  }

  console.log(`Successfully collected ${articles.length} articles.`);

  const csvContent = toCSV(articles);
  const filePath = saveFile(csvContent);

  await sendEmailWithAttachment(filePath, 'recipient@example.com');

  await browser.close();
};

getArticleInformation();