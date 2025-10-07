// index.js
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import cors from "cors";
import { fileURLToPath } from "url";

// ---  Fix __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---  Load .env (explicit path for Windows safety) ---
dotenv.config({ path: path.join(__dirname, ".env") });

// ---  Debug: Verify env variables loaded ---
console.log(" ENV CHECK:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? " Loaded" : " Missing",
  PORT: process.env.PORT,
});

const app = express();
app.use(cors());
app.use(express.json());

// Debug logging middleware (log every request)
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// --- Simple JSON "DB" ---
const DB_DIR = path.join(__dirname, "db");
const USERS_DB = path.join(DB_DIR, "users.json");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

if (!fs.existsSync(USERS_DB)) {
  fs.writeFileSync(
    USERS_DB,
    JSON.stringify(
      [
        {
          id: "1",
          email: "elansakthiswari@gmail.com",
          passwordHash: bcrypt.hashSync("Password123!", 10),
          resetToken: null,
          resetExpires: null,
        },
      ],
      null,
      2
    )
  );
  console.log("Seeded users.json with a default user.");
}

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_DB));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// ---  Gmail transporter (check credentials) ---
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error(" Missing EMAIL_USER or EMAIL_PASS in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP on startup
transporter.verify((err, success) => {
  if (err) {
    console.error(" SMTP error:", err);
  } else {
    console.log("Gmail SMTP ready");
  }
});

// --- Routes ---

// Forgot Password
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      console.log("Forgot-password: email not found:", email);
      return res.json({
        message: "If that email exists, a reset link was sent.",
      });
    }

    const token = uuidv4();
    user.resetToken = token;
    user.resetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    writeUsers(users);

    const resetLink = `${
      process.env.FRONTEND_URL
    }/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>
             <p>This link expires in 15 minutes.</p>`,
    });

    console.log(`Sent reset link to ${user.email}: ${resetLink}`);
    res.json({ message: " Reset link sent to your email." });
  } catch (err) {
    console.error(" Forgot-password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// Verify Token
app.post("/api/verify-token", (req, res) => {
  const { email, token } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.resetToken !== token || Date.now() > user.resetExpires) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  res.json({ message: "Token valid" });
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user || user.resetToken !== token || Date.now() > user.resetExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetExpires = null;
    writeUsers(users);

    console.log(` Password reset for ${user.email}`);
    res.json({ message: " Password updated successfully" });
  } catch (err) {
    console.error(" Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Health check route
app.get("/ping", (req, res) => {
  console.log(" /ping was called");
  res.json({ message: "pong" });
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});