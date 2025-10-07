import nodemailer from "nodemailer";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    console.log("📩 Forgot-password request for:", email);

    // Generate dummy token (replace with crypto+DB later if needed)
    const resetToken = Math.random().toString(36).slice(2);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Setup transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // Send mail
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({ message: "✅ Reset link sent to email" });
  } catch (err) {
    console.error("❌ Forgot-password error:", err.message);
    res.status(500).json({ message: "Failed to send email", error: err.message });
  }
};
