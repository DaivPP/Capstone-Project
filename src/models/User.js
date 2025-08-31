const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config').default;

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },

  // Medical Profile
  medicalProfile: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    height: {
      type: Number, // in cm
      min: 50,
      max: 250
    },
    weight: {
      type: Number, // in kg
      min: 10,
      max: 300
    },
    allergies: [{
      name: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      description: String
    }],
    chronicConditions: [{
      name: String,
      diagnosedDate: Date,
      medications: [String],
      notes: String
    }],
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      prescribedBy: String,
      notes: String
    }],
    emergencyContacts: [{
      name: String,
      relationship: String,
      phoneNumber: String,
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    insurance: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      expiryDate: Date
    }
  },

  // Location Information
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    preferredHospital: {
      name: String,
      address: String,
      phoneNumber: String,
      distance: Number
    }
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en-IN',
      enum: ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      medicationReminders: {
        type: Boolean,
        default: true
      },
      appointmentReminders: {
        type: Boolean,
        default: true
      }
    },
    accessibility: {
      fontSize: {
        type: String,
        default: 'medium',
        enum: ['small', 'medium', 'large', 'extra-large']
      },
      highContrast: {
        type: Boolean,
        default: false
      },
      screenReader: {
        type: Boolean,
        default: false
      },
      voiceNavigation: {
        type: Boolean,
        default: false
      }
    }
  },

  // Security & Authentication
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },

  // Analytics & Tracking
  analytics: {
    totalSessions: {
      type: Number,
      default: 0
    },
    lastSession: Date,
    totalChats: {
      type: Number,
      default: 0
    },
    emergencyCalls: {
      type: Number,
      default: 0
    },
    fileUploads: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for BMI
userSchema.virtual('bmi').get(function() {
  if (!this.medicalProfile.height || !this.medicalProfile.weight) return null;
  const heightInMeters = this.medicalProfile.height / 100;
  return (this.medicalProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    userId: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName
  };
  
  return jwt.sign(payload, config.security.jwtSecret, {
    expiresIn: '24h'
  });
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by phone
userSchema.statics.findByPhone = function(phoneNumber) {
  return this.findOne({ phoneNumber });
};

// Static method to find nearby users (for emergency purposes)
userSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = mongoose.model('User', userSchema);
