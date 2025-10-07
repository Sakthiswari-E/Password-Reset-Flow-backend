// test-smtp.js
require("dotenv").config();
const nodemailer = require("nodemailer");

async function test() {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log(" SMTP connection success");
  } catch (err) {
    console.error(" SMTP connection failed", err);
  }
}

test();
