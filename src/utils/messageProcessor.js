const MEDICAL_DATABASE = {
  diseases: {
    'common_cold': {
      name: 'Common Cold',
      symptoms: ['runny nose', 'sneezing', 'congestion', 'sore throat', 'cough', 'mild fever'],
      treatments: ['rest', 'fluids', 'over-the-counter medications'],
      medications: ['acetaminophen', 'ibuprofen', 'decongestants'],
      severity: 'mild',
      confidence_threshold: 0.7
    },
    'flu': {
      name: 'Influenza',
      symptoms: ['high fever', 'body aches', 'fatigue', 'headache', 'cough', 'sore throat'],
      treatments: ['rest', 'fluids', 'antiviral medications'],
      medications: ['oseltamivir', 'zanamivir'],
      severity: 'moderate',
      confidence_threshold: 0.8
    },
    'diabetes': {
      name: 'Diabetes',
      symptoms: ['frequent urination', 'excessive thirst', 'hunger', 'weight loss', 'fatigue', 'blurred vision'],
      treatments: ['diet management', 'exercise', 'medication'],
      medications: ['metformin', 'insulin'],
      severity: 'serious',
      confidence_threshold: 0.9
    },
    'hypertension': {
      name: 'Hypertension',
      symptoms: ['headache', 'shortness of breath', 'nosebleeds', 'chest pain', 'dizziness'],
      treatments: ['lifestyle changes', 'medication'],
      medications: ['ACE inhibitors', 'beta blockers', 'calcium channel blockers'],
      severity: 'serious',
      confidence_threshold: 0.85
    }
  },
  
  emergency_symptoms: [
    'chest pain', 'heart attack', 'stroke', 'severe bleeding', 'unconsciousness',
    'difficulty breathing', 'severe head injury', 'seizure', 'poisoning'
  ],
  
  medications: {
    'acetaminophen': {
      name: 'Acetaminophen (Paracetamol)',
      uses: ['fever', 'pain relief'],
      side_effects: ['liver damage in high doses', 'allergic reactions'],
      dosage: '500-1000mg every 4-6 hours',
      warnings: ['Do not exceed 4000mg per day', 'Avoid alcohol']
    },
    'ibuprofen': {
      name: 'Ibuprofen',
      uses: ['pain relief', 'inflammation', 'fever'],
      side_effects: ['stomach upset', 'kidney problems', 'increased bleeding risk'],
      dosage: '200-400mg every 4-6 hours',
      warnings: ['Take with food', 'Avoid if pregnant']
    }
  }
};

export const processMessage = async (userMessage, messageHistory = []) => {
  try {
    const message = userMessage.toLowerCase().trim();
    
    if (isEmergencyMessage(message)) {
      return generateEmergencyResponse(message);
    }
    
    if (isSymptomMessage(message)) {
      return await generateSymptomResponse(message);
    }
    
    if (isMedicationMessage(message)) {
      return generateMedicationResponse(message);
    }
    
    if (isGeneralMedicalMessage(message)) {
      return generateGeneralMedicalResponse(message);
    }
    
    return generateDefaultResponse(message);
    
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      id: Date.now(),
      type: 'bot',
      content: {
        text: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact support if the issue persists.",
        confidence: 0.5
      },
      timestamp: new Date()
    };
  }
};

const isEmergencyMessage = (message) => {
  const emergencyKeywords = [
    'emergency', 'urgent', 'help', 'pain', 'chest pain', 'heart attack',
    'stroke', 'bleeding', 'unconscious', 'breathing', 'seizure', 'poison'
  ];
  
  return emergencyKeywords.some(keyword => message.includes(keyword));
};

const isSymptomMessage = (message) => {
  const symptomKeywords = [
    'symptom', 'feel', 'pain', 'ache', 'fever', 'cough', 'headache',
    'nausea', 'dizzy', 'tired', 'weak', 'sore', 'swelling'
  ];
  
  return symptomKeywords.some(keyword => message.includes(keyword));
};

const isMedicationMessage = (message) => {
  const medicationKeywords = [
    'medicine', 'medication', 'pill', 'drug', 'prescription', 'dosage',
    'side effect', 'interaction', 'allergy'
  ];
  
  return medicationKeywords.some(keyword => message.includes(keyword));
};

const isGeneralMedicalMessage = (message) => {
  const generalKeywords = [
    'what is', 'how to', 'treatment', 'cure', 'prevention', 'cause',
    'diagnosis', 'test', 'doctor', 'hospital'
  ];
  
  return generalKeywords.some(keyword => message.includes(keyword));
};

const generateEmergencyResponse = (message) => {
  const isCritical = message.includes('chest pain') || message.includes('heart attack') || 
                    message.includes('stroke') || message.includes('unconscious');
  
  return {
    id: Date.now(),
    type: 'bot',
    content: {
      text: isCritical 
        ? "🚨 EMERGENCY DETECTED! 🚨\n\nThis appears to be a medical emergency. Please:\n\n1. Call emergency services immediately (108 in India)\n2. Do not wait for online advice\n3. Seek immediate medical attention\n\nI can help you find nearby hospitals and provide basic guidance, but professional medical care is essential."
        : "⚠️ This may require medical attention. Please describe your symptoms in detail so I can better assist you.",
      confidence: isCritical ? 0.95 : 0.8
    },
    isEmergency: isCritical,
    hospitalInfo: getNearbyHospitals(),
    suggestions: [
      "Call emergency services",
      "Find nearby hospitals",
      "Describe symptoms in detail"
    ],
    timestamp: new Date()
  };
};

const generateSymptomResponse = async (message) => {
  const symptoms = extractSymptoms(message);
  
  if (symptoms.length === 0) {
    return {
      id: Date.now(),
      type: 'bot',
      content: {
        text: "I understand you're not feeling well. Could you please describe your symptoms in more detail? For example:\n\n• What specific symptoms are you experiencing?\n• How long have you had these symptoms?\n• How severe are they?\n• Are there any other symptoms?\n\nThis will help me provide more accurate guidance.",
        confidence: 0.6,
        suggestions: [
          "I have a fever and cough",
          "I'm experiencing chest pain",
          "I have a headache and nausea"
        ]
      },
      timestamp: new Date()
    };
  }
  
  const predictions = analyzeSymptoms(symptoms);
  
  if (predictions.length === 0) {
    return {
      id: Date.now(),
      type: 'bot',
      content: {
        text: "I've analyzed your symptoms, but I need more information to provide accurate guidance. Please provide additional details about:\n\n• Duration of symptoms\n• Severity level\n• Any other symptoms you're experiencing\n• Your medical history\n\nRemember, I'm an AI assistant and cannot replace professional medical diagnosis.",
        confidence: 0.4,
        suggestions: [
          "Provide more symptom details",
          "Schedule a doctor appointment",
          "Find nearby clinics"
        ]
      },
      timestamp: new Date()
    };
  }
  
  const primaryPrediction = predictions[0];
  const disease = MEDICAL_DATABASE.diseases[primaryPrediction.disease];
  
  let responseText = `Based on your symptoms, here's what I found:\n\n`;
  responseText += `**Possible Condition:** ${disease.name}\n`;
  responseText += `**Confidence Level:** ${Math.round(primaryPrediction.confidence * 100)}%\n\n`;
  
  if (primaryPrediction.confidence >= disease.confidence_threshold) {
    responseText += `**Symptoms:** ${disease.symptoms.join(', ')}\n\n`;
    responseText += `**General Treatment:** ${disease.treatments.join(', ')}\n\n`;
    responseText += `**Common Medications:** ${disease.medications.join(', ')}\n\n`;
  }
  
  responseText += `**Important:** This is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.\n\n`;
  
  if (primaryPrediction.confidence < 0.7) {
    responseText += `⚠️ **Low Confidence Warning:** Due to the complexity of your symptoms, I recommend consulting a doctor for proper evaluation.`;
  }
  
  return {
    id: Date.now(),
    type: 'bot',
    content: {
      text: responseText,
      confidence: primaryPrediction.confidence,
      suggestions: [
        "Schedule doctor appointment",
        "Learn more about this condition",
        "Find nearby clinics",
        "Emergency help"
      ]
    },
    timestamp: new Date()
  };
};

const generateMedicationResponse = (message) => {
  const medication = extractMedicationName(message);
  
  if (!medication) {
    return {
      id: Date.now(),
      type: 'bot',
      content: {
        text: "I can help you with medication information. Please specify which medication you'd like to know about, or ask about:\n\n• Side effects\n• Dosage information\n• Drug interactions\n• Precautions\n\nWhat medication are you asking about?",
        confidence: 0.6,
        suggestions: [
          "Acetaminophen information",
          "Ibuprofen side effects",
          "Drug interactions"
        ]
      },
      timestamp: new Date()
    };
  }
  
  const medInfo = MEDICAL_DATABASE.medications[medication.toLowerCase()];
  
  if (!medInfo) {
    return {
      id: Date.now(),
      type: 'bot',
      content: {
        text: `I don't have specific information about "${medication}" in my database. Please:\n\n• Verify the medication name\n• Consult your doctor or pharmacist\n• Check the medication leaflet\n\nFor accurate medication information, always consult healthcare professionals.`,
        confidence: 0.3,
        suggestions: [
          "Consult your doctor",
          "Ask your pharmacist",
          "Check medication leaflet"
        ]
      },
      timestamp: new Date()
    };
  }
  
  const responseText = `**${medInfo.name}**\n\n`;
  responseText += `**Uses:** ${medInfo.uses.join(', ')}\n\n`;
  responseText += `**Dosage:** ${medInfo.dosage}\n\n`;
  responseText += `**Side Effects:** ${medInfo.side_effects.join(', ')}\n\n`;
  responseText += `**Warnings:** ${medInfo.warnings.join(', ')}\n\n`;
  responseText += `**Important:** Always follow your doctor's prescription and consult them for any concerns.`;
  
  return {
    id: Date.now(),
    type: 'bot',
    content: {
      text: responseText,
      confidence: 0.9,
      suggestions: [
        "Ask about side effects",
        "Check drug interactions",
        "Consult your doctor"
      ]
    },
    timestamp: new Date()
  };
};

const generateGeneralMedicalResponse = (message) => {
  return {
    id: Date.now(),
    type: 'bot',
    content: {
      text: "I can help you with general medical information, but please remember that I'm an AI assistant and cannot provide medical diagnosis or treatment. For specific medical advice, always consult a healthcare professional.\n\nWhat specific medical information are you looking for?",
      confidence: 0.7,
      suggestions: [
        "Find nearby doctors",
        "Schedule appointment",
        "Learn about symptoms",
        "Emergency help"
      ]
    },
    timestamp: new Date()
  };
};

const generateDefaultResponse = (message) => {
  return {
    id: Date.now(),
    type: 'bot',
    content: {
      text: "Hello! I'm Sevak, your AI medical assistant. I can help you with:\n\n• Symptom checking and disease prediction\n• Medication information and side effects\n• Treatment guidance\n• Emergency support\n• Finding nearby healthcare facilities\n\nHow can I assist you today?",
      confidence: 0.8,
      suggestions: [
        "Check my symptoms",
        "Medication information",
        "Find nearby hospitals",
        "Emergency help"
      ]
    },
    timestamp: new Date()
  };
};

const extractSymptoms = (message) => {
  const allSymptoms = [];
  
  Object.values(MEDICAL_DATABASE.diseases).forEach(disease => {
    allSymptoms.push(...disease.symptoms);
  });
  
  const foundSymptoms = allSymptoms.filter(symptom => 
    message.includes(symptom.toLowerCase())
  );
  
  return foundSymptoms;
};

const analyzeSymptoms = (symptoms) => {
  const predictions = [];
  
  Object.entries(MEDICAL_DATABASE.diseases).forEach(([diseaseKey, disease]) => {
    const matchingSymptoms = symptoms.filter(symptom => 
      disease.symptoms.includes(symptom)
    );
    
    if (matchingSymptoms.length > 0) {
      const confidence = matchingSymptoms.length / disease.symptoms.length;
      predictions.push({
        disease: diseaseKey,
        confidence: Math.min(confidence, 0.95),
        matchingSymptoms
      });
    }
  });
  
  return predictions.sort((a, b) => b.confidence - a.confidence);
};

const extractMedicationName = (message) => {
  const medicationNames = Object.keys(MEDICAL_DATABASE.medications);
  
  for (const medName of medicationNames) {
    if (message.includes(medName.toLowerCase())) {
      return medName;
    }
  }
  
  return null;
};

const getNearbyHospitals = () => {
  const hospitals = [
    {
      name: "Apollo Hospitals",
      address: "154/11, Bannerghatta Road, Bangalore",
      phone: "+91-80-2630-4050",
      distance: "2.3 km"
    },
    {
      name: "Fortis Hospital",
      address: "154/9, Bannerghatta Road, Bangalore",
      phone: "+91-80-6621-4444",
      distance: "3.1 km"
    },
    {
      name: "Manipal Hospital",
      address: "98, HAL Airport Road, Bangalore",
      phone: "+91-80-2502-4444",
      distance: "4.7 km"
    }
  ];
  
  return hospitals[Math.floor(Math.random() * hospitals.length)];
};

export const getDiseaseInfo = (diseaseKey) => {
  return MEDICAL_DATABASE.diseases[diseaseKey] || null;
};

export const getMedicationInfo = (medicationKey) => {
  return MEDICAL_DATABASE.medications[medicationKey] || null;
};

export const getAllDiseases = () => {
  return Object.keys(MEDICAL_DATABASE.diseases);
};

export const getAllMedications = () => {
  return Object.keys(MEDICAL_DATABASE.medications);
};
