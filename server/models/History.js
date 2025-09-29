const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication' },
  reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reminder' },
  action: { type: String, required: true }, // e.g., "Taken", "Missed"
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);