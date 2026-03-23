const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  getAllUsers,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllAttendance   // ✅ added
} = require("../controllers/admin.controller");

/* Get all employees */
router.get("/users", auth, requireAdmin, getAllUsers);

/* Create employee */
router.post("/users", auth, requireAdmin, createEmployee);

/* Update employee */
router.put("/users/:id", auth, requireAdmin, updateEmployee);

/* Delete employee */
router.delete("/users/:id", auth, requireAdmin, deleteEmployee);

/* ✅ NEW: Get all attendance */
router.get("/attendance", auth, requireAdmin, getAllAttendance);

module.exports = router;