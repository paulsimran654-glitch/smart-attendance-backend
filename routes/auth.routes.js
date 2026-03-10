const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  login,
  logout,
  me
} = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/logout", logout);

// Logged-in user route
router.get("/me", auth, me);

// Admin test route
router.get("/admin-test", auth, requireAdmin, (req, res) => {
  res.json({ message: "Welcome Admin 👑" });
});

module.exports = router;