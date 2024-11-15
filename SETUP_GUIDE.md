# Comprehensive Instructions for Setting Up and Using Google App Passwords in Your Node.js Project

## 1. Enable 2-Step Verification (if not already enabled)

1. Go to your **Google Account Security** settings.
2. Under "Signing in to Google", enable **2-Step Verification** by following the on-screen instructions.
3. This step is crucial as App Passwords are only available when 2-Step Verification is enabled.

---

## 2. Generate an App Password

1. If you don’t see **App Passwords** directly in the Security section:
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

Important:
Ensure your .env file is in your project root.
Add .env to .gitignore to avoid accidental exposure:

Use the following code snippet in your index.js file to configure Nodemailer:

javascript
Copy code
const nodemailer = require('nodemailer');
require('dotenv').config();

/*const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'recipient@example.com',
  subject: 'Latest Articles CSV',
  text: 'Hello, please find attached the latest articles CSV file.',
  attachments: [
    { filename: 'articles.csv', path: './articles.csv' },
  ],
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error(`Error sending email: ${err}`);
  } else {
    console.log(`Email sent: ${info.response}`);
  }
});*/

5. Run the Script
Execute your script using the following command:

bash
Copy code
node index.js 100 recipient@example.com
100: The number of articles to scrape (default is 100 if not provided).
recipient@example.com: Replace this with the actual recipient's email address.
6. Verify Everything Works
If configured correctly, your script will:

Scrape articles.
Generate a CSV file.
Send the CSV as an email attachment.
Expected Output in Terminal:
plaintext
Copy code
Email sent: 250 OK <message-id> - gsmtp
Troubleshooting Tips
Invalid login errors: Double-check your .env file for typos in EMAIL_USER or EMAIL_PASS.

Environment variables not loading: Ensure dotenv is properly installed and imported:

bash
Copy code
npm install dotenv
"App Passwords" not visible: Ensure you’ve followed the 2-Step Verification process.
