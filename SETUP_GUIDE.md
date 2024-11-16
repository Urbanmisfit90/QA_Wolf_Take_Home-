# Comprehensive Instructions for Setting Up and Using Google App Passwords in Your Node.js Project

## 1. Enable 2-Step Verification (if not already enabled)

1. Go to your **Google Account Security** settings.
2. Under "Signing in to Google", enable **2-Step Verification** by following the on-screen instructions.
3. This step is crucial as App Passwords are only available when 2-Step Verification is enabled.

---

## 2. Generate an App Password

1. If you don't see **App Passwords** directly in the Security section:
   - Search for **"App Passwords"** in your Google Account settings.
   - Select **App Passwords** under the Security settings.
   
2. Generate a new app password:
   - Choose **Mail** as the app.
   - Select **Other (Custom)** for the device, and name it (e.g., "NodeMailer").
   - A 16-character password will be displayed. **Copy it**.

---

## 3. Update the `.env` File

Store your Gmail credentials securely in a `.env` file:

```plaintext
EMAIL_USER=robmsc24@gmail.com
EMAIL_PASS=your-app-password-here

## 4. Run the Script

node index.js 100 recipient@example.com

This script automates the process of scraping the latest articles from Hacker News, converting the data into a CSV file, and emailing the file as an attachment. It uses Playwright for web scraping, processes the timestamps of the articles, and ensures they are sorted from newest to oldest before sending the email.
