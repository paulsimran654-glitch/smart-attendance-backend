const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "attendance"
  },
  mode: {
    type: String, // checkin / checkout
    required: true
  },
  date: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("QR", qrSchema);