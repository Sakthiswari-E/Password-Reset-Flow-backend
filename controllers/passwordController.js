import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import transporter from "../utils/emailTransporter.js";

const USERS_DB = path.join(process.cwd(), "db", "users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_DB));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// --- Forgot Password ---
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log("⚠️ Forgot-password: email not found:", email);
      return res.json({ message: "If that email exists, a reset link was sent." });
    }

    const token = uuidv4();
    user.resetToken = token;
    user.resetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    writeUsers(users);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>
             <p>This link expires in 15 minutes.</p>`,
    });

    console.log(`📧 Sent reset link to ${user.email}: ${resetLink}`);
    res.json({ message: "✅ Reset link sent to your email." });
  } catch (err) {
    console.error("❌ Forgot-password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

// --- Verify Token ---
export const verifyToken = (req, res) => {
  const { email, token } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.resetToken !== token || Date.now() > user.resetExpires) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  res.json({ message: "Token valid" });
};

// --- Reset Password ---
export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.resetToken !== token || Date.now() > user.resetExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetExpires = null;
    writeUsers(users);

    console.log(`🔑 Password reset for ${user.email}`);
    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("❌ Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
