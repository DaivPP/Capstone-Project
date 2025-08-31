const twilio = require('twilio');
const config = require('../config').default;

class TwilioService {
  constructor() {
    this.client = null;
    this.fromNumber = null;
    this.initialized = false;
    
    // Message templates for different scenarios
    this.messageTemplates = {
      medicationReminder: {
        en: '🔔 Medication Reminder: Time to take {medication} ({dosage}). Stay healthy! - Sevak Medical',
        hi: '🔔 दवा की याद दिलाने: {medication} ({dosage}) लेने का समय हो गया है। स्वस्थ रहें! - सेवक मेडिकल',
        ta: '🔔 மருந்து நினைவூட்டல்: {medication} ({dosage}) எடுக்க வேண்டிய நேரம். ஆரோக்கியமாக இருங்கள்! - சேவக மருத்துவம்'
      },
      emergencyAlert: {
        en: '🚨 EMERGENCY ALERT: {userName} may need immediate medical attention. Location: {location}. Call: {userPhone}',
        hi: '🚨 आपातकालीन चेतावनी: {userName} को तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है। स्थान: {location}। कॉल: {userPhone}',
        ta: '🚨 அவசர எச்சரிக்கை: {userName} க்கு உடனடி மருத்துவ உதவி தேவைப்படலாம். இடம்: {location}. அழைப்பு: {userPhone}'
      },
      appointmentReminder: {
        en: '📅 Appointment Reminder: Your appointment with Dr. {doctorName} is scheduled for {date} at {time}. - Sevak Medical',
        hi: '📅 अपॉइंटमेंट रिमाइंडर: डॉ. {doctorName} के साथ आपका अपॉइंटमेंट {date} को {time} पर निर्धारित है। - सेवक मेडिकल',
        ta: '📅 நியமன நினைவூட்டல்: டாக்டர் {doctorName} உடனான உங்கள் நியமனம் {date} அன்று {time} மணிக்கு திட்டமிடப்பட்டுள்ளது. - சேவக மருத்துவம்'
      },
      healthCheck: {
        en: '💚 Health Check: How are you feeling today? Reply with your symptoms or concerns. - Sevak Medical',
        hi: '💚 स्वास्थ्य जांच: आज आप कैसा महसूस कर रहे हैं? अपने लक्षणों या चिंताओं के साथ जवाब दें। - सेवक मेडिकल',
        ta: '💚 சுகாதார சோதனை: இன்று நீங்கள் எப்படி உணர்கிறீர்கள்? உங்கள் அறிகுறிகள் அல்லது கவலைகளுடன் பதிலளிக்கவும். - சேவக மருத்துவம்'
      },
      wellnessTip: {
        en: '💡 Wellness Tip: {tip}. Stay healthy and hydrated! - Sevak Medical',
        hi: '💡 स्वास्थ्य टिप: {tip}. स्वस्थ और हाइड्रेटेड रहें! - सेवक मेडिकल',
        ta: '💡 ஆரோக்கிய குறிப்பு: {tip}. ஆரோக்கியமாகவும் நீரேற்றமாகவும் இருங்கள்! - சேவக மருத்துவம்'
      }
    };

    // Voice call scripts
    this.voiceScripts = {
      emergencyCall: {
        en: `Hello, this is an automated emergency call from Sevak Medical Assistant. 
             A user has reported emergency symptoms and may need immediate medical attention. 
             Please contact emergency services at 108 or 102. 
             This is an automated message.`,
        hi: `नमस्ते, यह सेवक मेडिकल असिस्टेंट से एक स्वचालित आपातकालीन कॉल है। 
             एक उपयोगकर्ता ने आपातकालीन लक्षणों की रिपोर्ट की है और उन्हें तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है। 
             कृपया 108 या 102 पर आपातकालीन सेवाओं से संपर्क करें। 
             यह एक स्वचालित संदेश है।`,
        ta: `வணக்கம், இது சேவக மருத்துவ உதவியாளரிடமிருந்து ஒரு தானியங்கி அவசர அழைப்பு. 
             ஒரு பயனர் அவசர அறிகுறிகளை அறிக்கை செய்துள்ளார் மற்றும் உடனடி மருத்துவ உதவி தேவைப்படலாம். 
             தயவுசெய்து 108 அல்லது 102 இல் அவசர சேவைகளை தொடர்பு கொள்ளவும். 
             இது ஒரு தானியங்கி செய்தி.`
      },
      medicationReminder: {
        en: `Hello, this is your medication reminder from Sevak Medical Assistant. 
             It's time to take your medication. Please take {medication} as prescribed. 
             Stay healthy and have a great day!`,
        hi: `नमस्ते, यह सेवक मेडिकल असिस्टेंट से आपकी दवा की याद दिलाने वाला है। 
             आपकी दवा लेने का समय हो गया है। कृपया निर्धारित अनुसार {medication} लें। 
             स्वस्थ रहें और आपका दिन शुभ हो!`,
        ta: `வணக்கம், இது சேவக மருத்துவ உதவியாளரிடமிருந்து உங்கள் மருந்து நினைவூட்டல். 
             உங்கள் மருந்து எடுக்க வேண்டிய நேரம். தயவுசெய்து முன்கூட்டியே {medication} எடுக்கவும். 
             ஆரோக்கியமாக இருங்கள் மற்றும் நல்ல நாள்!`
      }
    };
  }

  initialize() {
    if (!this.initialized && config.twilio.accountSid && config.twilio.authToken) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
      this.fromNumber = config.twilio.phoneNumber;
      this.initialized = true;
    }
  }

  async sendSMS(to, template, language = 'en', variables = {}) {
    try {
      // Initialize Twilio service if not already done
      this.initialize();
      
      if (!this.client) {
        return {
          success: false,
          error: 'Twilio service not configured'
        };
      }

      if (!this.messageTemplates[template]) {
        throw new Error(`Template '${template}' not found`);
      }

      let message = this.messageTemplates[template][language] || this.messageTemplates[template]['en'];
      
      // Replace variables in the message
      Object.keys(variables).forEach(key => {
        message = message.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
      });

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to)
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        message: message
      };

    } catch (error) {
      console.error('Twilio SMS Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async makeVoiceCall(to, script, language = 'en', variables = {}) {
    try {
      if (!this.voiceScripts[script]) {
        throw new Error(`Script '${script}' not found`);
      }

      let voiceScript = this.voiceScripts[script][language] || this.voiceScripts[script]['en'];
      
      // Replace variables in the script
      Object.keys(variables).forEach(key => {
        voiceScript = voiceScript.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
      });

      // Create TwiML for the voice call
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say({
        voice: this.getVoiceForLanguage(language)
      }, voiceScript);

      const result = await this.client.calls.create({
        twiml: twiml.toString(),
        from: this.fromNumber,
        to: this.formatPhoneNumber(to)
      });

      return {
        success: true,
        callId: result.sid,
        status: result.status,
        script: voiceScript
      };

    } catch (error) {
      console.error('Twilio Voice Call Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendMedicationReminder(user, medication) {
    const variables = {
      medication: medication.name,
      dosage: `${medication.dosage.amount}${medication.dosage.unit}`
    };

    const language = user.preferences?.language || 'en';
    
    // Send SMS
    const smsResult = await this.sendSMS(
      user.phoneNumber,
      'medicationReminder',
      language,
      variables
    );

    // Send voice call if enabled
    let voiceResult = null;
    if (user.preferences?.notifications?.voice) {
      voiceResult = await this.makeVoiceCall(
        user.phoneNumber,
        'medicationReminder',
        language,
        variables
      );
    }

    return {
      sms: smsResult,
      voice: voiceResult,
      timestamp: new Date()
    };
  }

  async sendEmergencyAlert(user, emergencyData) {
    const variables = {
      userName: `${user.firstName} ${user.lastName}`,
      location: user.location?.address?.city || 'Unknown location',
      userPhone: user.phoneNumber
    };

    // Send to emergency contacts
    const emergencyContacts = user.medicalProfile?.emergencyContacts || [];
    const results = [];

    for (const contact of emergencyContacts) {
      const result = await this.sendSMS(
        contact.phoneNumber,
        'emergencyAlert',
        'en',
        variables
      );
      results.push({
        contact: contact.name,
        result: result
      });
    }

    // Also send to user's phone
    const userResult = await this.sendSMS(
      user.phoneNumber,
      'emergencyAlert',
      'en',
      variables
    );

    return {
      emergencyContacts: results,
      userNotification: userResult,
      timestamp: new Date()
    };
  }

  async sendAppointmentReminder(user, appointment) {
    const variables = {
      doctorName: appointment.doctorName,
      date: new Date(appointment.date).toLocaleDateString(),
      time: appointment.time
    };

    const language = user.preferences?.language || 'en';

    return await this.sendSMS(
      user.phoneNumber,
      'appointmentReminder',
      language,
      variables
    );
  }

  async sendHealthCheck(user) {
    const language = user.preferences?.language || 'en';

    return await this.sendSMS(
      user.phoneNumber,
      'healthCheck',
      language
    );
  }

  async sendWellnessTip(user, tip) {
    const variables = { tip };
    const language = user.preferences?.language || 'en';

    return await this.sendSMS(
      user.phoneNumber,
      'wellnessTip',
      language,
      variables
    );
  }

  async sendBulkSMS(recipients, template, language = 'en', variables = {}) {
    const results = [];

    for (const recipient of recipients) {
      const result = await this.sendSMS(
        recipient.phoneNumber,
        template,
        language,
        { ...variables, ...recipient.variables }
      );
      
      results.push({
        recipient: recipient.name || recipient.phoneNumber,
        result: result
      });

      // Add delay to avoid rate limiting
      await this.delay(100);
    }

    return {
      success: true,
      results,
      totalSent: results.length,
      timestamp: new Date()
    };
  }

  async verifyPhoneNumber(phoneNumber) {
    try {
      const result = await this.client.lookups.v2.phoneNumbers(phoneNumber).fetch({
        fields: ['country_code', 'carrier', 'line_type']
      });

      return {
        success: true,
        phoneNumber: result.phoneNumber,
        countryCode: result.countryCode,
        carrier: result.carrier,
        lineType: result.lineType,
        valid: true
      };

    } catch (error) {
      console.error('Phone verification error:', error);
      return {
        success: false,
        error: error.message,
        valid: false
      };
    }
  }

  async sendVerificationCode(phoneNumber, code) {
    const message = `Your Sevak Medical verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;
    
    return await this.sendSMS(phoneNumber, 'custom', 'en', { message });
  }

  formatPhoneNumber(phoneNumber) {
    // Ensure phone number is in international format
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // If it's an Indian number without country code, add +91
    if (formatted.length === 10 && formatted.startsWith('6') || formatted.startsWith('7') || formatted.startsWith('8') || formatted.startsWith('9')) {
      formatted = '+91' + formatted;
    } else if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }

  getVoiceForLanguage(language) {
    const voiceMap = {
      'en': 'alice',
      'hi': 'alice',
      'ta': 'alice',
      'te': 'alice',
      'bn': 'alice',
      'mr': 'alice'
    };
    
    return voiceMap[language] || 'alice';
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Analytics methods
  async getMessageHistory(phoneNumber, limit = 50) {
    try {
      const messages = await this.client.messages.list({
        to: this.formatPhoneNumber(phoneNumber),
        limit: limit
      });

      return messages.map(msg => ({
        sid: msg.sid,
        body: msg.body,
        status: msg.status,
        direction: msg.direction,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent
      }));

    } catch (error) {
      console.error('Error fetching message history:', error);
      return [];
    }
  }

  async getCallHistory(phoneNumber, limit = 50) {
    try {
      const calls = await this.client.calls.list({
        to: this.formatPhoneNumber(phoneNumber),
        limit: limit
      });

      return calls.map(call => ({
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        direction: call.direction,
        dateCreated: call.dateCreated,
        startTime: call.startTime,
        endTime: call.endTime
      }));

    } catch (error) {
      console.error('Error fetching call history:', error);
      return [];
    }
  }

  // Rate limiting and quota management
  async checkQuota() {
    try {
      const account = await this.client.api.accounts(config.twilio.accountSid).fetch();
      
      return {
        accountSid: account.sid,
        status: account.status,
        balance: account.balance,
        currency: account.currency
      };

    } catch (error) {
      console.error('Error checking quota:', error);
      return null;
    }
  }
}

module.exports = new TwilioService();
