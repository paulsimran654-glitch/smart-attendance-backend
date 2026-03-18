const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment-timezone");

// ✅ IMPORT QR FUNCTIONS (NEW)
const { setQR, clearQR } = require("../controllers/qr.controller");

// =======================
// AUTO ABSENT FUNCTION
// =======================
const markAbsent = async () => {
  try {

    const now = moment().tz("Asia/Kolkata");

    // ✅ Weekday check (Mon–Fri only)
    const day = now.isoWeekday();
    if (day > 5) {
      console.log("⏭ Skipping absent marking (Weekend)");
      return;
    }

    const today = now.clone().startOf("day").toDate();

    const employees = await User.find({ role: "employee" });

    for (const emp of employees) {

      const exists = await Attendance.findOne({
        employee: emp._id,
        date: today,
      });

      // ✅ If no attendance → mark absent
      if (!exists) {
        await Attendance.create({
          employee: emp._id,
          employeeId: emp.employeeId,
          date: today,
          status: "absent",
          isAutoAbsent: true,
        });
      }

      // ✅ If exists but no check-in → also mark absent
      else if (!exists.checkIn) {
        exists.status = "absent";
        exists.isAutoAbsent = true;
        await exists.save();
      }
    }

    console.log("✅ Absent marked successfully at 9:31 AM");

  } catch (err) {
    console.error("❌ Error in markAbsent:", err.message);
  }
};

// =======================
// CRON JOBS
// =======================

// 🚨 Auto Absent at 9:31 AM
cron.schedule("31 9 * * *", markAbsent);


// =======================
// ✅ REAL QR GENERATION (NEW)
// =======================

// 🟢 CHECK-IN QR (8:45 AM)
cron.schedule("45 8 * * *", () => {

  const now = moment().tz("Asia/Kolkata");
  const day = now.isoWeekday();

  if (day > 5) {
    console.log("⏭ Weekend - No Check-in QR");
    return;
  }

  const qrData = {
    type: "attendance",
    mode: "checkin",
    date: now.format("YYYY-MM-DD")
  };

  setQR(qrData);

  console.log("🟢 Check-in QR GENERATED (8:45 - 9:30)");
});


// ❌ CLEAR QR AFTER CHECK-IN WINDOW (9:31 AM)
cron.schedule("31 9 * * *", () => {
  clearQR();
  console.log("⛔ Check-in QR cleared (after 9:30)");
});


// 🔵 CHECK-OUT QR (4:45 PM)
cron.schedule("45 16 * * *", () => {

  const now = moment().tz("Asia/Kolkata");
  const day = now.isoWeekday();

  if (day > 5) {
    console.log("⏭ Weekend - No Check-out QR");
    return;
  }

  const qrData = {
    type: "attendance",
    mode: "checkout",
    date: now.format("YYYY-MM-DD")
  };

  setQR(qrData);

  console.log("🔵 Check-out QR GENERATED (4:45 - 5:30)");
});


// ❌ CLEAR QR AFTER CHECK-OUT WINDOW (5:31 PM)
cron.schedule("31 17 * * *", () => {
  clearQR();
  console.log("⛔ Check-out QR cleared (after 5:30)");
});

// =======================
// ⚡ TEMP TEST (REMOVE AFTER TESTING)
// =======================
setTimeout(() => {
  console.log("⚡ TEST: Generating QR manually");

  setQR({
    type: "attendance",
    mode: "checkin",
    date: moment().format("YYYY-MM-DD")
  });

}, 3000);