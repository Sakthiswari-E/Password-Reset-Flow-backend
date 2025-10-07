// utils/emailTransporter.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to, link) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Support <onboarding@resend.dev>",
      to,
      subject: "Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset.</p>
        <p>Click <a href="${link}">here</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });
    console.log(`📨 Resend email sent to ${to}`);
  } catch (err) {
    console.error("❌ Resend email error:", err);
    throw err;
  }
}
