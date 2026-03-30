const QR = require("../models/QR");
const moment = require("moment-timezone");

// =======================
// GET CURRENT QR
// =======================
exports.getCurrentQR = async (req, res) => {
  try {

    const now = moment().tz("Asia/Kolkata");
    const day = now.isoWeekday();

    // ✅ FIX: Allow QR in TEST MODE even on weekends
    if (process.env.TEST_MODE !== "true" && day > 5) {
      return res.json({ active: false });
    }

    // ✅ Get latest QR
    const qr = await QR.findOne().sort({ updatedAt: -1 });

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
// SET QR
// =======================
exports.setQR = async (qrData) => {
  try {

    await QR.findOneAndUpdate(
      {},
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
// CLEAR QR
// =======================
exports.clearQR = async () => {
  try {

    await QR.findOneAndUpdate({}, { active: false });

    console.log("⛔ QR deactivated");

  } catch (err) {
    console.error("QR CLEAR ERROR:", err.message);
  }
};