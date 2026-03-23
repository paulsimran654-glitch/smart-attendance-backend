const User = require("../models/User");
const bcrypt = require("bcryptjs");


// ================= GET ALL USERS =================
exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find({ role: "employee" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= CREATE EMPLOYEE =================
exports.createEmployee = async (req, res) => {

  try {

    const { name, email, phone, department, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const count = await User.countDocuments({ role: "employee" });

    const employeeId = "EMP" + String(count + 1).padStart(3, "0");

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      employeeId,
      email,
      phone,
      department,
      password: hashedPassword,
      role: "employee"
    });

    res.status(201).json(employee);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

// ================= UPDATE EMPLOYEE =================
exports.updateEmployee = async (req, res) => {

  try {

    const { id } = req.params;
    const { name, email, phone, department } = req.body;

    const employee = await User.findById(id);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    // Prevent duplicate email
    if (email && email !== employee.email) {

      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use"
        });
      }

    }

    // Update fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (department) employee.department = department;

    await employee.save();

    const safeEmployee = employee.toObject();
    delete safeEmployee.password;

    res.json(safeEmployee);

  } catch (error) {

    res.status(500).json({
      message: "Failed to update employee",
      error: error.message
    });

  }

};


// ================= DELETE EMPLOYEE =================
exports.deleteEmployee = async (req, res) => {

  try {

    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ message: "Employee deleted successfully" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

// ================= GET ALL ATTENDANCE =================
const Attendance = require("../models/Attendance");

exports.getAllAttendance = async (req, res) => {
  try {

    const records = await Attendance.find()
      .populate("employee", "name department")
      .sort({ createdAt: -1 });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};