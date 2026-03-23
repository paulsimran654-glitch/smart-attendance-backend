const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment-timezone");

// ENV
const OFFICE_LAT = parseFloat(process.env.OFFICE_LAT) || 0;
const OFFICE_LNG = parseFloat(process.env.OFFICE_LNG) || 0;
const ALLOWED_RADIUS = parseInt(process.env.ALLOWED_RADIUS) || 100;

// =======================
// Distance Function
// =======================
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// =======================
// MAIN CONTROLLER
// =======================
exports.scanQR = async (req, res) => {
  try {
    let { latitude, longitude, qr } = req.body;

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (!latitude || !longitude || !qr) {
      return res.status(400).json({ message: "Missing required data" });
    }

    // =======================
    // QR VALIDATION
    // =======================
    let qrData;
    try {
      qrData = JSON.parse(qr);
    } catch {
      return res.status(400).json({ message: "Invalid QR format" });
    }

    if (qrData.type !== "attendance") {
      return res.status(400).json({ message: "Invalid QR" });
    }

    // ✅ NEW: mode check
    const mode = qrData.mode; // checkin / checkout

    if (!["checkin", "checkout"].includes(mode)) {
      return res.status(400).json({ message: "Invalid QR mode" });
    }

    // =======================
    // USER
    // =======================
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // =======================
    // LOCATION CHECK
    // =======================
    const distance = getDistance(
      latitude,
      longitude,
      OFFICE_LAT,
      OFFICE_LNG
    );

    if (distance > ALLOWED_RADIUS) {
      return res.status(400).json({
        message: "Not inside office location",
      });
    }

    // =======================
    // TIME
    // =======================
    let now = moment().tz("Asia/Kolkata");

    if (process.env.TEST_TIME) {
      const [hour, minute] = process.env.TEST_TIME.split(":").map(Number);

      now = now.clone().set({
        hour,
        minute,
      });
    }

    const today = now.clone().startOf("day").toDate(); // ✅ FIXED
    const minutesNow = now.hours() * 60 + now.minutes();

    // =======================
    // WEEKDAY CHECK (Mon–Fri)
    // =======================
    const day = now.isoWeekday(); // 1 = Monday, 7 = Sunday

    if (day > 5) {
      return res.status(400).json({
        message: "Attendance allowed only on weekdays",
      });
    }

    // =======================
    // TIME WINDOWS
    // =======================
    const CHECKIN_START = 8 * 60 + 45;
    const CHECKIN_END = 9 * 60 + 30;

    const CHECKOUT_START = 16 * 60 + 45;
    const CHECKOUT_END = 17 * 60 + 30;

    // =======================
    // FIND ATTENDANCE
    // =======================
    let attendance = await Attendance.findOne({
      employee: user.id,
      date: today,
    });

    // =======================
    // CHECK-IN
    // =======================
    if (mode === "checkin") {

      if (minutesNow < CHECKIN_START || minutesNow > CHECKIN_END) {
        return res.status(400).json({
          message: "Check-in QR not active",
        });
      }

      if (attendance && attendance.checkIn) {
        return res.status(400).json({
          message: "Already checked in",
        });
      }

      let status = "present";

      // ✅ UPDATED LOGIC
      if (minutesNow >= (9 * 60 + 16)) {
        status = "late";
      }

      attendance = await Attendance.create({
        employee: user.id,
        employeeId: user.employeeId,
        date: today,
        checkIn: now.format("HH:mm"),
        status,
      });

      return res.json({
        type: "checkin",
        message: "Check-in successful",
        time: now.format("HH:mm"),
        status,
      });
    }

    // =======================
    // CHECK-OUT
    // =======================
    if (mode === "checkout") {

      if (minutesNow < CHECKOUT_START || minutesNow > CHECKOUT_END) {
        return res.status(400).json({
          message: "Check-out QR not active",
        });
      }

      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({
          message: "Check-in required before check-out",
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          message: "Already checked out",
        });
      }

      attendance.checkOut = now.format("HH:mm");
      await attendance.save();

      return res.json({
        type: "checkout",
        message: "Check-out successful",
        time: now.format("HH:mm"),
        status: attendance.status,
      });
    }

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =======================
// GET EMPLOYEE HISTORY
// =======================
exports.getHistory = async (req, res) => {
  try {

    const attendance = await Attendance.find({
      employee: req.user.id
    }).sort({ createdAt: -1 });

    return res.json(attendance);

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    return res.status(500).json({
      message: "Error fetching history"
    });
  }
};
