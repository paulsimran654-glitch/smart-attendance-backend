const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    dateString: {
      type: String,
      required: true,
    },

    checkIn: {
      type: String,
      default: null,
    },

    checkOut: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present",
    },

    isAutoAbsent: {
      type: Boolean,
      default: false,
    },

    // ✅ NEW FIELD
    photo: {
      type: String, // file path
      default: null
    }

  },
  { timestamps: true }
);

attendanceSchema.index(
  { employee: 1, dateString: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);