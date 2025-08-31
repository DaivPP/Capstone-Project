const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: String,
  dosage: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['mg', 'mcg', 'g', 'ml', 'tablet', 'capsule', 'drops', 'inhaler', 'injection'],
      required: true
    },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'cream', 'drops', 'suppository'],
      default: 'tablet'
    }
  },
  frequency: {
    type: String,
    enum: ['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed', 'custom'],
    required: true
  },
  customSchedule: {
    times: [String], // Array of times like "08:00", "14:00", "20:00"
    days: [String], // Array of days like "monday", "tuesday", etc.
    instructions: String
  },
  duration: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    totalDays: Number
  },
  instructions: {
    beforeMeal: {
      type: Boolean,
      default: false
    },
    afterMeal: {
      type: Boolean,
      default: false
    },
    emptyStomach: {
      type: Boolean,
      default: false
    },
    specialInstructions: String
  },
  prescribedBy: {
    name: String,
    specialization: String,
    hospital: String,
    contact: String
  },
  pharmacy: {
    name: String,
    address: String,
    phone: String,
    refillReminder: {
      enabled: {
        type: Boolean,
        default: false
      },
      daysBefore: {
        type: Number,
        default: 7
      }
    }
  },
  sideEffects: [String],
  interactions: [String],
  warnings: [String],
  notes: String
});

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medication: medicationSchema,
  
  // Alert Configuration
  alertConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    notificationTypes: {
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      email: {
        type: Boolean,
        default: false
      },
      voice: {
        type: Boolean,
        default: false
      }
    },
    reminderAdvance: {
      type: Number, // minutes before scheduled time
      default: 15
    },
    snoozeOptions: [{
      duration: Number, // minutes
      label: String
    }],
    escalation: {
      enabled: {
        type: Boolean,
        default: true
      },
      delay: {
        type: Number, // minutes
        default: 30
      },
      maxEscalations: {
        type: Number,
        default: 3
      }
    }
  },

  // Schedule
  schedule: {
    nextDose: {
      type: Date,
      required: true
    },
    lastDose: Date,
    missedDoses: [{
      scheduledTime: Date,
      missedAt: Date,
      reason: String
    }],
    takenDoses: [{
      scheduledTime: Date,
      takenAt: Date,
      actualTime: Date,
      notes: String
    }],
    skippedDoses: [{
      scheduledTime: Date,
      skippedAt: Date,
      reason: String
    }]
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'discontinued'],
    default: 'active'
  },

  // Compliance Tracking
  compliance: {
    totalDoses: {
      type: Number,
      default: 0
    },
    takenDoses: {
      type: Number,
      default: 0
    },
    missedDoses: {
      type: Number,
      default: 0
    },
    skippedDoses: {
      type: Number,
      default: 0
    },
    complianceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      }
    }
  },

  // Analytics
  analytics: {
    averageDelay: Number, // average delay in minutes
    mostMissedTime: String, // time of day most often missed
    mostMissedDay: String, // day of week most often missed
    adherenceTrend: [{
      date: Date,
      adherence: Number
    }],
    sideEffectReports: [{
      date: Date,
      sideEffect: String,
      severity: String,
      reported: Boolean
    }]
  },

  // Emergency Information
  emergency: {
    isCritical: {
      type: Boolean,
      default: false
    },
    cannotSkip: {
      type: Boolean,
      default: false
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    emergencyInstructions: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
alertSchema.index({ userId: 1, 'schedule.nextDose': 1 });
alertSchema.index({ status: 1, 'alertConfig.enabled': 1 });
alertSchema.index({ 'schedule.nextDose': 1 }, { expireAfterSeconds: 0 }); // TTL index for expired alerts

// Virtual for next dose time
alertSchema.virtual('nextDoseTime').get(function() {
  return this.schedule.nextDose;
});

// Virtual for is overdue
alertSchema.virtual('isOverdue').get(function() {
  if (!this.schedule.nextDose) return false;
  return new Date() > this.schedule.nextDose;
});

// Virtual for days remaining
alertSchema.virtual('daysRemaining').get(function() {
  if (!this.medication.duration.endDate) return null;
  const today = new Date();
  const endDate = new Date(this.medication.duration.endDate);
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update compliance rate
alertSchema.pre('save', function(next) {
  const total = this.compliance.totalDoses;
  const taken = this.compliance.takenDoses;
  
  if (total > 0) {
    this.compliance.complianceRate = Math.round((taken / total) * 100);
  }
  
  next();
});

// Method to mark dose as taken
alertSchema.methods.markAsTaken = function(notes = '') {
  const now = new Date();
  const scheduledTime = this.schedule.nextDose;
  
  // Add to taken doses
  this.schedule.takenDoses.push({
    scheduledTime,
    takenAt: now,
    actualTime: now,
    notes
  });
  
  // Update compliance
  this.compliance.takenDoses++;
  this.compliance.totalDoses++;
  
  // Update last dose
  this.schedule.lastDose = now;
  
  // Calculate next dose
  this.calculateNextDose();
  
  return this.save();
};

// Method to mark dose as missed
alertSchema.methods.markAsMissed = function(reason = '') {
  const now = new Date();
  const scheduledTime = this.schedule.nextDose;
  
  // Add to missed doses
  this.schedule.missedDoses.push({
    scheduledTime,
    missedAt: now,
    reason
  });
  
  // Update compliance
  this.compliance.missedDoses++;
  this.compliance.totalDoses++;
  
  // Calculate next dose
  this.calculateNextDose();
  
  return this.save();
};

// Method to mark dose as skipped
alertSchema.methods.markAsSkipped = function(reason = '') {
  const now = new Date();
  const scheduledTime = this.schedule.nextDose;
  
  // Add to skipped doses
  this.schedule.skippedDoses.push({
    scheduledTime,
    skippedAt: now,
    reason
  });
  
  // Update compliance
  this.compliance.skippedDoses++;
  this.compliance.totalDoses++;
  
  // Calculate next dose
  this.calculateNextDose();
  
  return this.save();
};

// Method to calculate next dose time
alertSchema.methods.calculateNextDose = function() {
  const now = new Date();
  let nextDose = new Date(now);
  
  switch (this.medication.frequency) {
    case 'once_daily':
      nextDose.setDate(nextDose.getDate() + 1);
      break;
    case 'twice_daily':
      nextDose.setHours(nextDose.getHours() + 12);
      break;
    case 'thrice_daily':
      nextDose.setHours(nextDose.getHours() + 8);
      break;
    case 'four_times_daily':
      nextDose.setHours(nextDose.getHours() + 6);
      break;
    case 'every_6_hours':
      nextDose.setHours(nextDose.getHours() + 6);
      break;
    case 'every_8_hours':
      nextDose.setHours(nextDose.getHours() + 8);
      break;
    case 'every_12_hours':
      nextDose.setHours(nextDose.getHours() + 12);
      break;
    case 'custom':
      // Handle custom schedule
      if (this.medication.customSchedule.times.length > 0) {
        // Find next time in custom schedule
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const times = this.medication.customSchedule.times.map(time => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        });
        
        const nextTime = times.find(time => time > currentTime);
        if (nextTime) {
          nextDose.setHours(Math.floor(nextTime / 60), nextTime % 60, 0, 0);
        } else {
          // Next day, first time
          nextDose.setDate(nextDose.getDate() + 1);
          const [hours, minutes] = this.medication.customSchedule.times[0].split(':').map(Number);
          nextDose.setHours(hours, minutes, 0, 0);
        }
      }
      break;
    default:
      nextDose.setDate(nextDose.getDate() + 1);
  }
  
  this.schedule.nextDose = nextDose;
  return nextDose;
};

// Method to pause alerts
alertSchema.methods.pause = function() {
  this.status = 'paused';
  this.alertConfig.enabled = false;
  return this.save();
};

// Method to resume alerts
alertSchema.methods.resume = function() {
  this.status = 'active';
  this.alertConfig.enabled = true;
  return this.save();
};

// Method to discontinue medication
alertSchema.methods.discontinue = function(reason = '') {
  this.status = 'discontinued';
  this.alertConfig.enabled = false;
  this.medication.duration.endDate = new Date();
  return this.save();
};

// Static method to find overdue alerts
alertSchema.statics.findOverdue = function() {
  return this.find({
    status: 'active',
    'alertConfig.enabled': true,
    'schedule.nextDose': { $lt: new Date() }
  }).populate('userId', 'firstName lastName phoneNumber');
};

// Static method to find upcoming alerts
alertSchema.statics.findUpcoming = function(minutes = 30) {
  const future = new Date();
  future.setMinutes(future.getMinutes() + minutes);
  
  return this.find({
    status: 'active',
    'alertConfig.enabled': true,
    'schedule.nextDose': { $gte: new Date(), $lte: future }
  }).populate('userId', 'firstName lastName phoneNumber');
};

// Static method to get compliance statistics
alertSchema.statics.getComplianceStats = function(userId = null) {
  const match = userId ? { userId } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        averageCompliance: { $avg: '$compliance.complianceRate' },
        totalDoses: { $sum: '$compliance.totalDoses' },
        takenDoses: { $sum: '$compliance.takenDoses' },
        missedDoses: { $sum: '$compliance.missedDoses' }
      }
    }
  ]);
};

module.exports = mongoose.model('MedicationAlert', alertSchema);
