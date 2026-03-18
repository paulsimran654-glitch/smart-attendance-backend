require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();

/* =========================
   Middleware
========================= */

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://192.168.1.8:5173",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

/* =========================
   Routes
========================= */

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/qr", require("./routes/qr.routes"));

/* =========================
   Admin Seeder Logic
========================= */

const createFirstAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {

      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
      }

      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );

      await User.create({
        name: process.env.ADMIN_NAME,
        employeeId: "ADMIN001",
        email: process.env.ADMIN_EMAIL,
        phone: "0000000000",
        department: "Administration",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ First admin created");

    } else {
      console.log("ℹ️ Admin already exists");
    }

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

/* =========================
   START SERVER + CRON
========================= */

connectDB().then(async () => {

  await createFirstAdmin();

  // ✅ START CRON ONLY AFTER DB CONNECTS
  require("./jobs/attendance.job");

  app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
  });

}).catch((err) => {
  console.error("❌ DB Connection Failed:", err.message);
});