const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment-timezone");

// ✅ Safe ENV parsing
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

    // ✅ Fix: Convert to number
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

    console.log("Distance:", distance);

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
        second: 0,
        millisecond: 0,
      });
    }

    const today = now.format("YYYY-MM-DD");
    const minutesNow = now.hours() * 60 + now.minutes();

    console.log("TIME:", now.format("HH:mm"));

    // =======================
    // TIME WINDOWS
    // =======================
    const CHECKIN_START = 8 * 60 + 45;
    const CHECKIN_END = 9 * 60 + 30;

    const CHECKOUT_START = 16 * 60 + 45;
    const CHECKOUT_END = 17 * 60 + 30;

    // =======================
    // FIND ATTENDANCE (FIXED)
    // =======================
    let attendance = await Attendance.findOne({
      employee: user.id,
      date: today,
    }).sort({ createdAt: -1 });

    // =======================
    // CHECK-IN
    // =======================
    if (minutesNow >= CHECKIN_START && minutesNow <= CHECKIN_END) {

      if (attendance && attendance.checkIn) {
        return res.status(400).json({
          message: "Already checked in",
        });
      }

      let status = "present";

      if (minutesNow > 9 * 60 + 15) {
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
        type: "checkin",   // ✅ IMPORTANT
        message: "Check-in successful",
        time: now.format("HH:mm"),
        status,
      });
    }

    // =======================
    // CHECK-OUT
    // =======================
    else if (minutesNow >= CHECKOUT_START && minutesNow <= CHECKOUT_END) {

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
        type: "checkout",   // ✅ IMPORTANT (frontend fix)
        message: "Check-out successful",
        time: now.format("HH:mm"),
        status: attendance.status,
      });
    }

    // =======================
    // OUTSIDE WINDOW
    // =======================
    else {
      return res.status(400).json({
        message: "QR not active at this time",
      });
    }

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};