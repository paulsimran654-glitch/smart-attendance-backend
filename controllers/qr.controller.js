const QR = require("../models/QR");
const moment = require("moment-timezone");

// =======================
// GET CURRENT QR
// =======================
exports.getCurrentQR = async (req, res) => {
  try {

    const now = moment().tz("Asia/Kolkata");
    const day = now.isoWeekday();

    // ❌ Weekend → no QR
    if (day > 5) {
      return res.json({ active: false });
    }

    // ✅ Get latest QR from DB
    const qr = await QR.findOne().sort({ createdAt: -1 });

    if (!qr || !qr.active) {
      return res.json({ active: false });
    }

    return res.json({
      active: true,
      qr: {
        type: qr.type,
        mode: qr.mode,
        date: qr.date
      }
    });

  } catch (err) {
    console.error("QR FETCH ERROR:", err.message);
    return res.status(500).json({ message: "Error fetching QR" });
  }
};


// =======================
// SET QR (USED BY CRON)
// =======================
exports.setQR = async (qrData) => {
  try {

    await QR.findOneAndUpdate(
      {}, // single QR document
      {
        ...qrData,
        active: true
      },
      {
        upsert: true,
        new: true
      }
    );

    console.log("✅ QR stored in DB");

  } catch (err) {
    console.error("QR SET ERROR:", err.message);
  }
};


// =======================
// CLEAR QR (USED BY CRON)
// =======================
exports.clearQR = async () => {
  try {

    await QR.findOneAndUpdate({}, { active: false });

    console.log("⛔ QR deactivated");

  } catch (err) {
    console.error("QR CLEAR ERROR:", err.message);
  }
};