const router = require("express").Router();

const auth = require("../middleware/auth.middleware");

const {
  scanQR,
  getHistory,
  getTodayAttendance
} = require("../controllers/attendance.controller");

// =======================
// SCAN QR
// =======================
router.post("/scan", auth, scanQR);

// =======================
// GET HISTORY
// =======================
router.get("/history", auth, getHistory);

// =======================
// GET TODAY (DASHBOARD)
// =======================
router.get("/today", auth, getTodayAttendance);

module.exports = router;