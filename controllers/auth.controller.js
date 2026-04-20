const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


// ================= CREATE JWT =================
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ UPDATED DOMAIN LOGIC (ADMIN + EMPLOYEE)
    if (
      !email.endsWith("@webcraft.com") &&
      !email.endsWith("@attendify.com")
    ) {
      return res.status(400).json({
        success: false,
        message: "Use company email (@webcraft.com or @attendify.com)",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const safeUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      user: safeUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ UPDATED DOMAIN LOGIC HERE ALSO
    if (
      !email.endsWith("@webcraft.com") &&
      !email.endsWith("@attendify.com")
    ) {
      return res.status(400).json({ message: "Use company email only" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("=================================");
    console.log("🔐 OTP GENERATED");
    console.log("Email:", email);
    console.log("OTP:", otp);
    console.log("Valid for 5 minutes");
    console.log("=================================");

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}. Valid for 5 minutes.`,
      });

      console.log("📩 OTP email sent");

    } catch (mailError) {
      console.log("⚠️ Email not sent (using console OTP instead)");
    }

    res.json({ message: "OTP generated (check console or email)" });

  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
};


// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
};


// ================= ME =================
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false });
  }
};