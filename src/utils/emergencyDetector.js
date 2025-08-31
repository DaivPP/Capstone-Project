const EMERGENCY_KEYWORDS = {
  critical: [
    'chest pain', 'heart attack', 'cardiac arrest', 'stroke', 'brain attack',
    'unconscious', 'not breathing', 'stopped breathing', 'severe bleeding',
    'major trauma', 'head injury', 'spinal injury', 'seizure', 'convulsion',
    'poisoning', 'overdose', 'anaphylaxis', 'allergic reaction'
  ],
  
  urgent: [
    'difficulty breathing', 'shortness of breath', 'wheezing', 'severe pain',
    'broken bone', 'fracture', 'dislocation', 'severe burn', 'high fever',
    'dehydration', 'vomiting blood', 'blood in stool', 'severe headache',
    'vision problems', 'paralysis', 'numbness', 'tingling'
  ],
  
  concerning: [
    'pain', 'ache', 'discomfort', 'fever', 'cough', 'sore throat',
    'headache', 'dizziness', 'nausea', 'vomiting', 'diarrhea',
    'fatigue', 'weakness', 'swelling', 'bruising', 'rash'
  ]
};

const EMERGENCY_RESPONSES = {
  critical: {
    message: "🚨 CRITICAL EMERGENCY DETECTED! 🚨\n\nThis is a medical emergency requiring immediate attention.\n\n**IMMEDIATE ACTIONS:**\n1. Call emergency services: 108 (India)\n2. Call ambulance: 102\n3. Do not wait for online advice\n4. Seek immediate medical care\n\n**Stay calm and follow emergency protocols.**",
    priority: 1,
    autoCall: true,
    hospitalRedirect: true
  },
  
  urgent: {
    message: "⚠️ URGENT MEDICAL ATTENTION NEEDED ⚠️\n\nThis requires prompt medical evaluation.\n\n**RECOMMENDED ACTIONS:**\n1. Contact your doctor immediately\n2. Visit nearest emergency room\n3. Call emergency services if symptoms worsen\n4. Do not delay seeking care\n\n**Monitor symptoms closely.**",
    priority: 2,
    autoCall: false,
    hospitalRedirect: true
  },
  
  concerning: {
    message: "⚠️ MEDICAL ATTENTION ADVISED ⚠️\n\nThis may require medical evaluation.\n\n**RECOMMENDED ACTIONS:**\n1. Schedule appointment with doctor\n2. Monitor symptoms\n3. Seek care if symptoms worsen\n4. Contact healthcare provider\n\n**Better safe than sorry.**",
    priority: 3,
    autoCall: false,
    hospitalRedirect: false
  }
};

export const detectEmergency = (message) => {
  if (!message || typeof message !== 'string') {
    return { isEmergency: false, severity: null, keywords: [] };
  }

  const lowerMessage = message.toLowerCase();
  const detectedKeywords = [];
  let highestSeverity = null;

  for (const keyword of EMERGENCY_KEYWORDS.critical) {
    if (lowerMessage.includes(keyword)) {
      detectedKeywords.push({ keyword, severity: 'critical' });
      highestSeverity = 'critical';
    }
  }

  if (highestSeverity !== 'critical') {
    for (const keyword of EMERGENCY_KEYWORDS.urgent) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push({ keyword, severity: 'urgent' });
        if (highestSeverity !== 'urgent') {
          highestSeverity = 'urgent';
        }
      }
    }
  }

  if (!highestSeverity) {
    for (const keyword of EMERGENCY_KEYWORDS.concerning) {
      if (lowerMessage.includes(keyword)) {
        detectedKeywords.push({ keyword, severity: 'concerning' });
        if (!highestSeverity) {
          highestSeverity = 'concerning';
        }
      }
    }
  }

  return {
    isEmergency: !!highestSeverity,
    severity: highestSeverity,
    keywords: detectedKeywords,
    response: highestSeverity ? EMERGENCY_RESPONSES[highestSeverity] : null
  };
};

export const detectEmergencyWithContext = (message, messageHistory = []) => {
  const basicDetection = detectEmergency(message);
  
  if (!basicDetection.isEmergency) {
    return basicDetection;
  }

  const context = analyzeEmergencyContext(messageHistory);
  
  const enhancedDetection = {
    ...basicDetection,
    context,
    enhancedSeverity: determineEnhancedSeverity(basicDetection, context),
    recommendations: generateEmergencyRecommendations(basicDetection, context)
  };

  return enhancedDetection;
};

const analyzeEmergencyContext = (messageHistory) => {
  const context = {
    duration: null,
    severity: null,
    location: null,
    medicalHistory: null,
    medications: [],
    allergies: [],
    recentEvents: []
  };

  const durationPatterns = [
    /(\d+)\s*(hour|hr|day|week|month)s?\s*ago/i,
    /for\s*(\d+)\s*(hour|hr|day|week|month)s?/i,
    /since\s*(yesterday|this morning|last night)/i
  ];

  for (const pattern of durationPatterns) {
    const match = messageHistory.join(' ').match(pattern);
    if (match) {
      context.duration = match[0];
      break;
    }
  }

  const severityWords = ['severe', 'intense', 'mild', 'moderate', 'extreme', 'terrible', 'awful'];
  for (const word of severityWords) {
    if (messageHistory.join(' ').toLowerCase().includes(word)) {
      context.severity = word;
      break;
    }
  }

  const locationPatterns = [
    /(chest|head|stomach|back|leg|arm|throat|eye)s?/i,
    /(left|right)\s*(side|arm|leg|chest)/i
  ];

  for (const pattern of locationPatterns) {
    const match = messageHistory.join(' ').match(pattern);
    if (match) {
      context.location = match[0];
      break;
    }
  }

  return context;
};

const determineEnhancedSeverity = (basicDetection, context) => {
  let severity = basicDetection.severity;

  if (context.severity === 'severe' || context.severity === 'intense' || context.severity === 'extreme') {
    if (severity === 'concerning') severity = 'urgent';
    if (severity === 'urgent') severity = 'critical';
  }

  if (context.duration && context.duration.includes('hour')) {
    const hours = parseInt(context.duration.match(/\d+/)[0]);
    if (hours < 1 && severity !== 'critical') {
      severity = severity === 'concerning' ? 'urgent' : 'critical';
    }
  }

  if (context.location && (context.location.includes('chest') || context.location.includes('head'))) {
    if (severity === 'concerning') severity = 'urgent';
  }

  return severity;
};

const generateEmergencyRecommendations = (detection, context) => {
  const recommendations = [];

  if (detection.severity === 'critical') {
    recommendations.push({
      action: 'Call Emergency Services',
      number: '108',
      description: 'Immediate emergency response',
      priority: 1
    });
    
    recommendations.push({
      action: 'Call Ambulance',
      number: '102',
      description: 'Medical transport',
      priority: 2
    });
  }

  if (detection.severity === 'urgent' || detection.severity === 'critical') {
    recommendations.push({
      action: 'Visit Emergency Room',
      description: 'Immediate medical evaluation',
      priority: 3
    });
  }

  if (context.location === 'chest') {
    recommendations.push({
      action: 'Cardiac Evaluation',
      description: 'Chest symptoms require cardiac assessment',
      priority: 4
    });
  }

  if (context.location === 'head') {
    recommendations.push({
      action: 'Neurological Evaluation',
      description: 'Head symptoms require neurological assessment',
      priority: 4
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
};

export const getEmergencyResponse = (severity) => {
  return EMERGENCY_RESPONSES[severity] || null;
};

export const requiresImmediateAction = (severity) => {
  return severity === 'critical' || severity === 'urgent';
};

export const getEmergencyContacts = () => {
  return {
    emergency: '108',
    ambulance: '102',
    police: '100',
    fire: '101',
    womenHelpline: '1091',
    childHelpline: '1098'
  };
};

export const validateEmergencyDetection = (detection) => {
  const requiredFields = ['isEmergency', 'severity', 'keywords'];
  
  for (const field of requiredFields) {
    if (!(field in detection)) {
      return false;
    }
  }

  if (detection.isEmergency && !detection.severity) {
    return false;
  }

  if (detection.severity && !EMERGENCY_RESPONSES[detection.severity]) {
    return false;
  }

  return true;
};

export const getNearbyEmergencyFacilities = (location = null) => {
  const facilities = [
    {
      name: 'Apollo Hospitals Emergency',
      type: 'Hospital',
      address: '154/11, Bannerghatta Road, Bangalore',
      phone: '+91-80-2630-4050',
      distance: '2.3 km',
      emergency: true,
      specialties: ['Cardiology', 'Neurology', 'Trauma']
    },
    {
      name: 'Fortis Hospital ER',
      type: 'Hospital',
      address: '154/9, Bannerghatta Road, Bangalore',
      phone: '+91-80-6621-4444',
      distance: '3.1 km',
      emergency: true,
      specialties: ['Emergency Medicine', 'Surgery', 'ICU']
    },
    {
      name: 'Manipal Emergency',
      type: 'Hospital',
      address: '98, HAL Airport Road, Bangalore',
      phone: '+91-80-2502-4444',
      distance: '4.7 km',
      emergency: true,
      specialties: ['Emergency Care', 'Critical Care', 'Trauma']
    }
  ];

  return facilities;
};

export const getEmergencyProtocols = (severity) => {
  const protocols = {
    critical: [
      '1. Call emergency services immediately (108)',
      '2. Stay with the person',
      '3. Do not move them unless in immediate danger',
      '4. Monitor breathing and consciousness',
      '5. Follow dispatcher instructions',
      '6. Prepare for ambulance arrival'
    ],
    urgent: [
      '1. Contact healthcare provider immediately',
      '2. Monitor symptoms closely',
      '3. Prepare to visit emergency room',
      '4. Have medical information ready',
      '5. Arrange transportation if needed'
    ],
    concerning: [
      '1. Schedule appointment with doctor',
      '2. Monitor symptoms for changes',
      '3. Keep record of symptoms',
      '4. Avoid self-medication',
      '5. Seek care if symptoms worsen'
    ]
  };

  return protocols[severity] || [];
};

export const getEmergencyKeywords = () => {
  return EMERGENCY_KEYWORDS;
};
