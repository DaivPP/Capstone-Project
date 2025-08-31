const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    // For user messages
    symptoms: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'low'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    // For assistant messages
    suggestions: [String],
    diagnosis: {
      possibleConditions: [String],
      confidence: Number,
      urgency: {
        type: String,
        enum: ['routine', 'urgent', 'emergency']
      }
    },
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      warnings: [String]
    }],
    // File attachments
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'document', 'audio']
      },
      url: String,
      filename: String,
      size: Number,
      mimeType: String
    }],
    // Voice data
    voiceData: {
      duration: Number,
      transcription: String,
      confidence: Number,
      language: String
    }
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  
  // Chat Context
  context: {
    primarySymptom: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'low'
    },
    category: {
      type: String,
      enum: ['general', 'symptom', 'medication', 'emergency', 'appointment', 'information'],
      default: 'general'
    },
    language: {
      type: String,
      default: 'en-IN'
    },
    userLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    userProfile: {
      age: Number,
      gender: String,
      bloodGroup: String,
      knownAllergies: [String],
      chronicConditions: [String]
    }
  },

  // Medical Analysis
  analysis: {
    symptoms: [{
      name: String,
      severity: String,
      duration: String,
      frequency: String
    }],
    possibleConditions: [{
      name: String,
      probability: Number,
      urgency: String,
      description: String
    }],
    recommendations: [{
      type: String,
      description: String,
      priority: String,
      actionRequired: Boolean
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      warnings: [String],
      interactions: [String]
    }],
    emergencyAssessment: {
      isEmergency: {
        type: Boolean,
        default: false
      },
      severity: String,
      immediateActions: [String],
      contactEmergency: {
        type: Boolean,
        default: false
      }
    }
  },

  // Session Information
  session: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // in seconds
    deviceInfo: {
      userAgent: String,
      platform: String,
      screenResolution: String,
      timezone: String
    },
    location: {
      ip: String,
      country: String,
      region: String,
      city: String
    }
  },

  // Analytics
  analytics: {
    messageCount: {
      user: {
        type: Number,
        default: 0
      },
      assistant: {
        type: Number,
        default: 0
      }
    },
    responseTime: {
      average: Number,
      min: Number,
      max: Number
    },
    userSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      timestamp: Date
    },
    engagement: {
      totalTime: Number,
      activeTime: Number,
      idleTime: Number,
      scrollDepth: Number
    },
    conversions: {
      emergencyCall: {
        type: Boolean,
        default: false
      },
      appointmentBooked: {
        type: Boolean,
        default: false
      },
      medicationReminder: {
        type: Boolean,
        default: false
      },
      fileUploaded: {
        type: Boolean,
        default: false
      }
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  
  // Tags for organization
  tags: [String],
  
  // Privacy and security
  isPrivate: {
    type: Boolean,
    default: true
  },
  encryptionLevel: {
    type: String,
    enum: ['standard', 'enhanced', 'medical'],
    default: 'medical'
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ 'context.severity': 1 });
chatSchema.index({ 'analysis.emergencyAssessment.isEmergency': 1 });
chatSchema.index({ 'session.startTime': -1 });

// Virtual for chat duration
chatSchema.virtual('duration').get(function() {
  if (!this.session.startTime) return 0;
  const endTime = this.session.endTime || new Date();
  return Math.floor((endTime - this.session.startTime) / 1000);
});

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Pre-save middleware to update analytics
chatSchema.pre('save', function(next) {
  // Update message counts
  this.analytics.messageCount.user = this.messages.filter(m => m.role === 'user').length;
  this.analytics.messageCount.assistant = this.messages.filter(m => m.role === 'assistant').length;
  
  // Update session duration
  if (this.session.startTime) {
    this.session.duration = this.duration;
  }
  
  // Update end time if chat is completed
  if (this.status === 'completed' && !this.session.endTime) {
    this.session.endTime = new Date();
  }
  
  next();
});

// Method to add message
chatSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  return this.save();
};

// Method to get chat summary
chatSchema.methods.getSummary = function() {
  const userMessages = this.messages.filter(m => m.role === 'user');
  const assistantMessages = this.messages.filter(m => m.role === 'assistant');
  
  return {
    id: this._id,
    sessionId: this.sessionId,
    title: this.title,
    messageCount: this.messages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    duration: this.duration,
    severity: this.context.severity,
    category: this.context.category,
    isEmergency: this.analysis.emergencyAssessment.isEmergency,
    startTime: this.session.startTime,
    endTime: this.session.endTime,
    status: this.status
  };
};

// Method to mark as emergency
chatSchema.methods.markAsEmergency = function(severity = 'high') {
  this.context.severity = 'emergency';
  this.analysis.emergencyAssessment.isEmergency = true;
  this.analysis.emergencyAssessment.severity = severity;
  return this.save();
};

// Method to add satisfaction rating
chatSchema.methods.addSatisfactionRating = function(rating, feedback = '') {
  this.analytics.userSatisfaction = {
    rating,
    feedback,
    timestamp: new Date()
  };
  return this.save();
};

// Static method to find emergency chats
chatSchema.statics.findEmergencyChats = function() {
  return this.find({
    'analysis.emergencyAssessment.isEmergency': true,
    status: { $ne: 'archived' }
  }).populate('userId', 'firstName lastName phoneNumber');
};

// Static method to find chats by user
chatSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-messages');
};

// Static method to get chat statistics
chatSchema.statics.getStatistics = function(userId = null) {
  const match = userId ? { userId } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalChats: { $sum: 1 },
        totalMessages: { $sum: { $size: '$messages' } },
        emergencyChats: {
          $sum: { $cond: ['$analysis.emergencyAssessment.isEmergency', 1, 0] }
        },
        averageDuration: { $avg: '$session.duration' },
        averageSatisfaction: { $avg: '$analytics.userSatisfaction.rating' }
      }
    }
  ]);
};

module.exports = mongoose.model('Chat', chatSchema);
