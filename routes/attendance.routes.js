const router = require("express").Router();

const auth = require("../middleware/auth.middleware");

const { scanQR } = require("../controllers/attendance.controller");

router.post("/scan", auth, scanQR);

module.exports = router;