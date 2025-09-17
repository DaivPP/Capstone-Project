const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['mg', 'mcg', 'g', 'ml', 'tablet', 'capsule', 'dose', 'puff', 'drop', 'injection']
    }
  },
  frequency: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  prescribingDoctor: {
    name: String,
    contact: String
  },
  reminders: [{
    time: {
      type: String,
      required: true
    },
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  colorCode: {
    type: String,
    default: '#4361ee'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adherence: [{
    date: Date,
    taken: Boolean,
    timeTaken: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Medication', medicationSchema);