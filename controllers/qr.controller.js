const moment = require("moment-timezone");

// 👉 Global QR state (simple + safe for your project)
let currentQR = {
  active: false,
  qr: null
};

// =======================
// GET CURRENT QR
// =======================
exports.getCurrentQR = (req, res) => {

  const now = moment().tz("Asia/Kolkata");
  const day = now.isoWeekday();

  // ❌ Weekend → no QR
  if (day > 5) {
    return res.json({ active: false });
  }

  if (!currentQR.active) {
    return res.json({ active: false });
  }

  return res.json({
    active: true,
    qr: currentQR.qr
  });
};

// =======================
// SET QR (used by cron)
// =======================
exports.setQR = (qrData) => {
  currentQR = {
    active: true,
    qr: qrData
  };
};

// =======================
// CLEAR QR (used by cron)
// =======================
exports.clearQR = () => {
  currentQR = {
    active: false,
    qr: null
  };
};