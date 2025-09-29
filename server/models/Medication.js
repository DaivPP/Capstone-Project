const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: String,
  frequency: String,
  time: String, // sent from frontend
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }); // optional: track createdAt/updatedAt

module.exports = mongoose.model('Medication', medicationSchema);

