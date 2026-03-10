const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

const {
  getAllUsers,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/admin.controller");


/* Get all employees */
router.get("/users", auth, requireAdmin, getAllUsers);

/* Create employee */
router.post("/users", auth, requireAdmin, createEmployee);

/* Update employee */
router.put("/users/:id", auth, requireAdmin, updateEmployee);

/* Delete employee */
router.delete("/users/:id", auth, requireAdmin, deleteEmployee);

module.exports = router;