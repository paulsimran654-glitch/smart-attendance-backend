const router = require("express").Router();
const { getCurrentQR } = require("../controllers/qr.controller");

// Public route (no auth needed for display screen)
router.get("/current", getCurrentQR);

module.exports = router;