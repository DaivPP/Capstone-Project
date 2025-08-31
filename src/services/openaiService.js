const OpenAI = require('openai');
const config = require('../config').default;

class OpenAIService {
  constructor() {
    this.openai = null;
    this.initialized = false;
    
    this.systemPrompt = `You are Sevak, an advanced AI medical assistant designed specifically for India. You provide helpful, accurate, and safe medical information while always prioritizing user safety.

IMPORTANT SAFETY GUIDELINES:
- NEVER provide definitive medical diagnoses
- ALWAYS recommend consulting healthcare professionals for serious symptoms
- IMMEDIATELY escalate to emergency services for life-threatening symptoms
- Be culturally sensitive to Indian healthcare practices and beliefs
- Consider local availability of medications and treatments
- Provide information in simple, understandable language

CAPABILITIES:
- Symptom analysis and preliminary assessment
- Medication information and interactions
- General health advice and wellness tips
- Emergency situation recognition
- Appointment scheduling guidance
- Health education and prevention tips

RESPONSE FORMAT:
Always structure your responses with:
1. Immediate assessment (safety first)
2. Helpful information and context
3. Clear next steps or recommendations
4. When to seek professional help

EMERGENCY KEYWORDS TO WATCH FOR:
- Chest pain, heart attack, stroke symptoms
- Severe bleeding, head injury, poisoning
- Difficulty breathing, unconsciousness
- Severe allergic reactions
- High fever with other symptoms

CULTURAL CONTEXT:
- Consider traditional Indian medicine practices
- Be aware of local healthcare infrastructure
- Respect cultural beliefs while providing evidence-based information
- Include both modern and traditional wellness approaches when appropriate

LANGUAGE SUPPORT:
- Primary: English (Indian context)
- Secondary: Hindi, Tamil, Telugu, Bengali, Marathi
- Use simple, clear language
- Avoid medical jargon unless necessary`;

    this.emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'unconscious', 'bleeding heavily',
      'difficulty breathing', 'severe pain', 'head injury', 'poisoning',
      'anaphylaxis', 'seizure', 'paralysis', 'sudden vision loss',
      'severe allergic reaction', 'high fever with rash', 'severe headache'
    ];
  }

  initialize() {
    if (!this.initialized && config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
      this.initialized = true;
    }
  }

  async processMessage(message, userContext = {}) {
    try {
      // Initialize OpenAI service if not already done
      this.initialize();
      
      if (!this.openai) {
        return {
          text: "I'm sorry, but I'm currently unable to process your request. Please check your configuration.",
          analysis: { type: 'error', confidence: 0 },
          emergency: false
        };
      }

      // Check for emergency keywords first
      const emergencyCheck = this.checkForEmergency(message);
      
      if (emergencyCheck.isEmergency) {
        return this.handleEmergency(message, emergencyCheck);
      }

      // Build context-aware prompt
      const enhancedPrompt = this.buildContextPrompt(message, userContext);
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0].message.content;
      
      // Analyze response for medical context
      const analysis = this.analyzeResponse(response, message);
      
      return {
        text: response,
        analysis,
        confidence: analysis.confidence,
        suggestions: analysis.suggestions,
        type: analysis.type,
        emergency: false
      };

    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw new Error('Unable to process your message at this time. Please try again.');
    }
  }

  checkForEmergency(message) {
    const lowerMessage = message.toLowerCase();
    const foundKeywords = this.emergencyKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      return {
        isEmergency: true,
        keywords: foundKeywords,
        severity: this.assessEmergencySeverity(foundKeywords),
        message: 'Emergency keywords detected'
      };
    }

    return { isEmergency: false };
  }

  assessEmergencySeverity(keywords) {
    const highSeverity = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding'];
    const mediumSeverity = ['difficulty breathing', 'severe pain', 'head injury'];
    
    if (keywords.some(keyword => highSeverity.includes(keyword))) {
      return 'high';
    } else if (keywords.some(keyword => mediumSeverity.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  handleEmergency(message, emergencyCheck) {
    const severity = emergencyCheck.severity;
    
    let response = '';
    let suggestions = [];
    
    if (severity === 'high') {
      response = `🚨 EMERGENCY ALERT 🚨

I've detected potential emergency symptoms in your message. This requires IMMEDIATE medical attention.

EMERGENCY ACTIONS:
• Call emergency services immediately: 108 (India)
• Call ambulance: 102
• Go to the nearest hospital emergency room
• Do NOT delay seeking medical help

Your safety is our top priority. Please seek immediate medical attention.`;

      suggestions = ['Call 108', 'Call 102', 'Go to hospital', 'Emergency services'];
    } else {
      response = `⚠️ URGENT MEDICAL ATTENTION NEEDED

I've detected symptoms that require prompt medical evaluation.

RECOMMENDED ACTIONS:
• Contact your doctor immediately
• Visit an urgent care facility
• Monitor your symptoms closely
• Seek medical attention if symptoms worsen

Please consult a healthcare professional as soon as possible.`;

      suggestions = ['Contact doctor', 'Visit urgent care', 'Monitor symptoms'];
    }

    return {
      text: response,
      confidence: 0.95,
      suggestions,
      type: 'emergency',
      emergency: true,
      severity: severity,
      keywords: emergencyCheck.keywords
    };
  }

  buildContextPrompt(message, userContext) {
    let contextPrompt = `User Message: ${message}\n\n`;
    
    if (userContext.age) {
      contextPrompt += `User Age: ${userContext.age}\n`;
    }
    
    if (userContext.gender) {
      contextPrompt += `User Gender: ${userContext.gender}\n`;
    }
    
    if (userContext.bloodGroup) {
      contextPrompt += `Blood Group: ${userContext.bloodGroup}\n`;
    }
    
    if (userContext.allergies && userContext.allergies.length > 0) {
      contextPrompt += `Known Allergies: ${userContext.allergies.join(', ')}\n`;
    }
    
    if (userContext.chronicConditions && userContext.chronicConditions.length > 0) {
      contextPrompt += `Chronic Conditions: ${userContext.chronicConditions.join(', ')}\n`;
    }
    
    if (userContext.currentMedications && userContext.currentMedications.length > 0) {
      contextPrompt += `Current Medications: ${userContext.currentMedications.join(', ')}\n`;
    }
    
    if (userContext.location) {
      contextPrompt += `Location: ${userContext.location}\n`;
    }
    
    if (userContext.language) {
      contextPrompt += `Preferred Language: ${userContext.language}\n`;
    }
    
    contextPrompt += `\nPlease provide a helpful, safe, and culturally appropriate response.`;
    
    return contextPrompt;
  }

  analyzeResponse(response, originalMessage) {
    const analysis = {
      confidence: 0.8,
      suggestions: [],
      type: 'general',
      symptoms: [],
      possibleConditions: [],
      urgency: 'routine'
    };

    // Analyze for symptom mentions
    const symptomKeywords = [
      'headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizziness',
      'pain', 'swelling', 'rash', 'itchy', 'sore throat', 'runny nose'
    ];

    const foundSymptoms = symptomKeywords.filter(symptom => 
      originalMessage.toLowerCase().includes(symptom)
    );

    if (foundSymptoms.length > 0) {
      analysis.type = 'symptom';
      analysis.symptoms = foundSymptoms;
      analysis.confidence = 0.85;
    }

    // Analyze for medication mentions
    const medicationKeywords = [
      'medicine', 'medication', 'pill', 'tablet', 'dose', 'prescription',
      'antibiotic', 'painkiller', 'vitamin', 'supplement'
    ];

    const foundMedications = medicationKeywords.filter(med => 
      originalMessage.toLowerCase().includes(med)
    );

    if (foundMedications.length > 0) {
      analysis.type = 'medication';
      analysis.confidence = 0.9;
    }

    // Generate suggestions based on response type
    if (analysis.type === 'symptom') {
      analysis.suggestions = ['Monitor symptoms', 'Rest', 'Stay hydrated', 'See doctor if severe'];
    } else if (analysis.type === 'medication') {
      analysis.suggestions = ['Follow prescription', 'Check interactions', 'Complete course', 'Consult pharmacist'];
    } else {
      analysis.suggestions = ['Stay healthy', 'Regular checkups', 'Balanced diet', 'Exercise regularly'];
    }

    // Assess urgency
    const urgentKeywords = ['severe', 'intense', 'worsening', 'persistent', 'chronic'];
    const urgentFound = urgentKeywords.some(keyword => 
      originalMessage.toLowerCase().includes(keyword)
    );

    if (urgentFound) {
      analysis.urgency = 'urgent';
      analysis.suggestions.push('Seek medical attention');
    }

    return analysis;
  }

  async generateFollowUpQuestions(context) {
    try {
      const prompt = `Based on this medical context, generate 3-5 relevant follow-up questions to better understand the user's situation:

Context: ${JSON.stringify(context)}

Generate questions that are:
- Specific and relevant
- Helpful for medical assessment
- Culturally appropriate for India
- Easy to understand

Format as a JSON array of strings.`;

      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'You are a medical assistant generating helpful follow-up questions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback to simple question generation
        return this.generateDefaultQuestions(context);
      }

    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return this.generateDefaultQuestions(context);
    }
  }

  generateDefaultQuestions(context) {
    const questions = [
      'How long have you been experiencing these symptoms?',
      'Have you taken any medications for this?',
      'Do you have any known allergies?',
      'Have you experienced similar symptoms before?',
      'Is there anything that makes the symptoms better or worse?'
    ];

    return questions.slice(0, 3);
  }

  async translateResponse(response, targetLanguage) {
    if (targetLanguage === 'en-IN') {
      return response;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: `Translate the following medical response to ${targetLanguage}. Maintain medical accuracy and cultural sensitivity for Indian context.` },
          { role: 'user', content: response }
        ],
        max_tokens: config.openai.maxTokens,
        temperature: 0.3
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Translation error:', error);
      return response; // Return original if translation fails
    }
  }

  async summarizeChatHistory(messages) {
    try {
      const messageHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'Summarize this medical conversation concisely, highlighting key symptoms, concerns, and recommendations.' },
          { role: 'user', content: messageHistory }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Summarization error:', error);
      return 'Unable to summarize conversation at this time.';
    }
  }
}

module.exports = new OpenAIService();
