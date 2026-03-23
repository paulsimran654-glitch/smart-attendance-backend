const router = require("express").Router();

const auth = require("../middleware/auth.middleware");

const {
  scanQR,
  getHistory   // ✅ added
} = require("../controllers/attendance.controller");

// =======================
// SCAN QR
// =======================
router.post("/scan", auth, scanQR);

// =======================
// GET HISTORY
// =======================
router.get("/history", auth, getHistory);

module.exports = router;