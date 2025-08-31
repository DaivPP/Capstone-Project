// Advanced Configuration for Sevak Medical Chatbot
const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    appName: process.env.REACT_APP_APP_NAME || 'Sevak Medical Chatbot',
    version: process.env.REACT_APP_VERSION || '1.0.0',
  },

  // Google Services
  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    cloudVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    translateApiKey: process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY,
    analyticsId: process.env.GOOGLE_ANALYTICS_ID,
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: 0.7,
  },

  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Database Configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sevak_medical_chatbot',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    postgres: {
      uri: process.env.POSTGRES_URI || 'postgresql://username:password@localhost:5432/sevak_medical',
      dialect: 'postgres',
      logging: false,
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-change-in-production',
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Emergency Services (India)
  emergency: {
    ambulance: process.env.REACT_APP_EMERGENCY_AMBULANCE || '102',
    police: process.env.REACT_APP_EMERGENCY_POLICE || '100',
    fire: process.env.REACT_APP_EMERGENCY_FIRE || '101',
    general: process.env.REACT_APP_EMERGENCY_GENERAL || '108',
    hospitals: {
      searchRadius: 10000, // 10km
      maxResults: 10,
    },
  },

  // Medical Database
  medical: {
    apiUrl: process.env.REACT_APP_MEDICAL_API_URL || 'https://api.medical-database.com',
    apiKey: process.env.REACT_APP_MEDICAL_API_KEY,
    timeout: 10000,
  },

  // Voice Services
  voice: {
    recognitionLanguage: process.env.REACT_APP_SPEECH_RECOGNITION_LANGUAGE || 'en-IN',
    synthesisVoice: process.env.REACT_APP_SPEECH_SYNTHESIS_VOICE || 'en-IN-Standard-A',
    enabled: process.env.REACT_APP_ENABLE_VOICE === 'true',
  },

  // Analytics & Monitoring
  analytics: {
    googleAnalytics: {
      id: process.env.GOOGLE_ANALYTICS_ID,
      enabled: !!process.env.GOOGLE_ANALYTICS_ID,
    },
    sentry: {
      dsn: process.env.SENTRY_DSN_FRONTEND,
      dsnBackend: process.env.SENTRY_DSN_BACKEND,
      enabled: !!(process.env.SENTRY_DSN_FRONTEND || process.env.SENTRY_DSN_BACKEND),
      environment: process.env.NODE_ENV || 'development',
    },
  },

  // Feature Flags
  features: {
    voice: process.env.REACT_APP_ENABLE_VOICE === 'true',
    fileUpload: process.env.REACT_APP_ENABLE_FILE_UPLOAD === 'true',
    emergencyMode: process.env.REACT_APP_ENABLE_EMERGENCY_MODE === 'true',
    accessibility: process.env.REACT_APP_ENABLE_ACCESSIBILITY === 'true',
    chatHistory: process.env.REACT_APP_ENABLE_CHAT_HISTORY === 'true',
    multilingual: process.env.REACT_APP_ENABLE_MULTILINGUAL === 'true',
    medicationAlerts: process.env.REACT_APP_ENABLE_MEDICATION_ALERTS === 'true',
    realTimeChat: process.env.REACT_APP_ENABLE_REAL_TIME_CHAT === 'true',
  },

  // Development
  development: {
    debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  },

  // Email Configuration
  email: {
    service: process.env.REACT_APP_EMAIL_SERVICE || 'gmail',
    user: process.env.REACT_APP_EMAIL_USER,
    password: process.env.REACT_APP_EMAIL_PASSWORD,
    from: process.env.REACT_APP_EMAIL_FROM || 'noreply@sevakmedical.com',
  },

  // File Upload
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadDir: 'uploads/',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },

  // CORS Configuration
  cors: {
    origin: process.env.REACT_APP_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
};

// Validation function to check required environment variables
const validateConfig = () => {
  const required = [
    'REACT_APP_GOOGLE_MAPS_API_KEY',
    'REACT_APP_OPENAI_API_KEY',
    'REACT_APP_JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missing);
    console.warn('Please check your .env file and ensure all required variables are set.');
  }

  return missing.length === 0;
};

// Export configuration with validation
export { config as default, validateConfig };
