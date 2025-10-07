// index.js
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { fileURLToPath } from "url";
import { sendResetEmail } from "./utils/emailTransporter.js";

// --- Fix __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load .env ---
dotenv.config({ path: path.join(__dirname, ".env") });

// --- Environment info ---
console.log("📦 ENV CHECK:", {
  PORT: process.env.PORT,
  RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ Loaded" : "❌ Missing",
  EMAIL_FROM: process.env.EMAIL_FROM || "not set",
});

// --- Auto-detect environment ---
const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = isProduction
  ? "https://passwordresetfloww.netlify.app"
  : process.env.FRONTEND_URL || "http://localhost:3000";

console.log("🌐 FRONTEND_URL:", FRONTEND_URL);

// --- Initialize Express ---
const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// --- Simple JSON Database (for demo) ---
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
  console.log("✅ Seeded users.json with default user.");
}

// --- Helper functions ---
function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_DB));
}
function writeUsers(users) {
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// --- Routes ---

// 🔹 Forgot Password
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

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    // ✅ Send email using Resend
    await sendResetEmail(user.email, resetLink);

    console.log(`📧 Reset link sent to ${user.email}: ${resetLink}`);
    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// 🔹 Verify Token
app.post("/api/verify-token", (req, res) => {
  const { email, token } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.resetToken !== token || Date.now() > user.resetExpires) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
  res.json({ message: "Token valid" });
});

// 🔹 Reset Password
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

    console.log(`🔒 Password reset for ${user.email}`);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Health check
app.get("/ping", (req, res) => res.json({ message: "pong" }));

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
