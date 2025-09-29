const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  contact: { type: String }, // e.g., phone or email
  address: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);