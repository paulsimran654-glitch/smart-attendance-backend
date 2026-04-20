const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    employeeId: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    phone: {
      type: String,
      required: true
    },

    department: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    },

    // ✅ NEW FIELDS
    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);