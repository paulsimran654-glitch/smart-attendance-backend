const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    employeeId: {
      type: String,
      required: true
    },

    // ✅ Changed to Date (IMPORTANT for cron)
    date: {
      type: Date,
      required: true
    },

    checkIn: {
      type: String,
      default: null
    },

    checkOut: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present"
    },

    // ✅ NEW: track auto-absent
    isAutoAbsent: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

// ✅ Keep unique (VERY IMPORTANT)
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);