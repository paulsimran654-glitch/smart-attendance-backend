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

    // ✅ REAL DATE (for sorting / analytics)
    date: {
      type: Date,
      required: true,
    },

    // ✅ FIX: STRING DATE (for exact matching)
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

    // ✅ auto-absent flag
    isAutoAbsent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// =======================
// ✅ FIXED UNIQUE INDEX
// =======================
attendanceSchema.index(
  { employee: 1, dateString: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);