// routes/authRoutes.js
import express from "express";
import { forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// Forgot Password → send reset link
router.post("/forgot-password", forgotPassword);

// Reset Password → verify token + update password
router.post("/reset-password/:token", resetPassword);

export default router;
