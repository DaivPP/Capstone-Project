// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const Sentry = require('@sentry/node');

// Import configuration
const config = require('./src/config').default;

// Import services
const openaiService = require('./src/services/openaiService');
const googleMapsService = require('./src/services/googleMapsService');
const twilioService = require('./src/services/twilioService');
const analyticsService = require('./src/services/analyticsService');
const medicationAlertScheduler = require('./src/services/medicationAlertScheduler').default;

// Import models
const User = require('./src/models/User');
const Chat = require('./src/models/Chat');
const MedicationAlert = require('./src/models/MedicationAlert');

// Import utilities
const { validateConfig } = require('./src/config');

// Initialize Sentry
if (config.analytics.sentry.enabled) {
  Sentry.init({
    dsn: config.analytics.sentry.dsn,
    environment: config.analytics.sentry.environment,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express }),
    ],
    tracesSampleRate: config.analytics.sentry.environment === 'production' ? 0.1 : 1.0,
  });
}

// Initialize logger
const logger = winston.createLogger({
  level: config.development.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sevak-medical-chatbot' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.development.debugMode) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://maps.googleapis.com", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "https://api.openai.com", "https://maps.googleapis.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sentry request handler
if (config.analytics.sentry.enabled) {
  app.use(Sentry.Handlers.requestHandler());
}

// Database connection
mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options)
  .then(() => {
    logger.info('✅ Connected to MongoDB');
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('❌ MongoDB connection error:', error);
    console.error('❌ MongoDB connection error:', error);
  });

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, config.security.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.server.version,
    environment: config.server.nodeEnv,
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      openai: config.openai.apiKey ? 'configured' : 'not_configured',
      twilio: config.twilio.accountSid ? 'configured' : 'not_configured',
      googleMaps: config.google.mapsApiKey ? 'configured' : 'not_configured',
      analytics: {
        googleAnalytics: config.analytics.googleAnalytics.enabled,
        sentry: config.analytics.sentry.enabled
      }
    }
  };

  res.json(health);
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, dateOfBirth, gender, bloodGroup } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      'medicalProfile.bloodGroup': bloodGroup
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Track registration
    analyticsService.trackEvent('user', 'registration', 'success');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ error: 'Account is temporarily locked due to too many failed attempts' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Track login
    analyticsService.trackEvent('user', 'login', 'success');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Public chat endpoint for testing (no authentication required)
app.post('/api/chat/public', async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process message with OpenAI
    const startTime = Date.now();
    const response = await openaiService.processMessage(message, userContext);
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      response: response.text,
      confidence: response.confidence || 0.8,
      type: response.type,
      emergency: response.emergency,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      analytics: {
        responseTime
      }
    });

  } catch (error) {
    logger.error('Public Chat API Error:', error);
    Sentry.captureException(error);
    
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Enhanced chat endpoint with OpenAI integration (requires authentication)
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat session
    let chat = await Chat.findOne({ sessionId, userId });
    if (!chat) {
      chat = new Chat({
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        title: 'New Chat'
      });
    }

    // Add user message to chat
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        symptoms: userContext?.symptoms || [],
        severity: userContext?.severity || 'low'
      }
    });

    // Process message with OpenAI
    const startTime = Date.now();
    const response = await openaiService.processMessage(message, userContext);
    const responseTime = Date.now() - startTime;

    // Add assistant response to chat
    chat.messages.push({
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      metadata: {
        suggestions: response.suggestions || [],
        confidence: response.confidence,
        type: response.type
      }
    });

    // Update chat analytics
    chat.analytics.messageCount.user = chat.messages.filter(m => m.role === 'user').length;
    chat.analytics.messageCount.assistant = chat.messages.filter(m => m.role === 'assistant').length;
    chat.analytics.responseTime = {
      average: responseTime,
      min: Math.min(chat.analytics.responseTime?.min || responseTime, responseTime),
      max: Math.max(chat.analytics.responseTime?.max || responseTime, responseTime)
    };

    await chat.save();

    // Track chat interaction
    analyticsService.trackChatInteraction('message_sent', {
      messageLength: message.length,
      responseTime,
      sessionId,
      userId
    });

    // Track medical events if applicable
    if (response.type === 'emergency') {
      analyticsService.trackEmergencyEvent('emergency_detected', response.severity || 'high', {
        keywords: response.keywords,
        sessionId,
        userId
      });
    }

    res.json({
      success: true,
      response: {
        text: response.text,
        confidence: response.confidence,
        suggestions: response.suggestions,
        type: response.type,
        emergency: response.emergency
      },
      sessionId: chat.sessionId,
      timestamp: new Date().toISOString(),
      analytics: {
        responseTime,
        messageCount: chat.messages.length
      }
    });

  } catch (error) {
    logger.error('Chat API Error:', error);
    Sentry.captureException(error);
    analyticsService.trackError(error, { context: 'chat_api' });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Unable to process your message at this time'
    });
  }
});

// Enhanced emergency endpoint with Google Maps integration
app.post('/api/emergency', authenticateToken, async (req, res) => {
  try {
    const { symptoms, location, severity } = req.body;
    const userId = req.user.userId;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find nearby hospitals
    const userLocation = location || user.location?.coordinates;
    let nearbyHospitals = [];
    
    if (userLocation) {
      const hospitalsResult = await googleMapsService.findNearbyHospitals(
        userLocation.latitude,
        userLocation.longitude,
        config.emergency.hospitals.searchRadius
      );
      nearbyHospitals = hospitalsResult.hospitals || [];
    }

    // Send emergency alerts
    const alertResult = await twilioService.sendEmergencyAlert(user, {
      symptoms,
      severity,
      location: userLocation
    });

    // Track emergency event
    analyticsService.trackEmergencyEvent('emergency_triggered', severity || 'high', {
      symptoms,
      location: userLocation,
      userId
    });

    res.json({
      success: true,
      emergency: {
        severity: severity || 'high',
        symptoms,
        immediateActions: [
          'Call emergency services (108)',
          'Stay calm and assess the situation',
          'Follow medical professional guidance'
        ]
      },
      nearbyHospitals,
      emergencyContacts: config.emergency,
      alertsSent: alertResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Emergency API Error:', error);
    Sentry.captureException(error);
    analyticsService.trackError(error, { context: 'emergency_api' });
    
    res.status(500).json({ 
      error: 'Emergency service unavailable',
      message: 'Please call emergency services directly'
    });
  }
});

// Medication alert endpoints
app.post('/api/medication-alerts', authenticateToken, async (req, res) => {
  try {
    const { medication, alertConfig } = req.body;
    const userId = req.user.userId;

    const alert = new MedicationAlert({
      userId,
      medication,
      alertConfig: alertConfig || {
        enabled: true,
        notificationTypes: {
          push: true,
          sms: true,
          email: false,
          voice: false
        }
      }
    });

    await alert.save();

    // Track medication alert creation
    analyticsService.trackMedicationEvent('alert_created', {
      medicationName: medication.name,
      userId
    });

    res.status(201).json({
      success: true,
      alert: {
        id: alert._id,
        medication: alert.medication,
        nextDose: alert.schedule.nextDose,
        status: alert.status
      }
    });

  } catch (error) {
    logger.error('Medication Alert Creation Error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to create medication alert' });
  }
});

app.get('/api/medication-alerts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const alerts = await MedicationAlert.find({ userId, status: 'active' });

    res.json({
      success: true,
      alerts: alerts.map(alert => ({
        id: alert._id,
        medication: alert.medication,
        nextDose: alert.schedule.nextDose,
        compliance: alert.compliance,
        status: alert.status
      }))
    });

  } catch (error) {
    logger.error('Medication Alerts Fetch Error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to fetch medication alerts' });
  }
});

// File upload endpoint with enhanced processing
app.post('/api/upload', authenticateToken, async (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;
    const userId = req.user.userId;

    // Validate file type
    if (!config.upload.allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'File type not allowed' });
    }

    // Process file (OCR for images, text extraction for PDFs)
    let extractedText = '';
    let analysis = {};

    if (fileType.startsWith('image/')) {
      // Use Google Cloud Vision API for image processing
      // Implementation would go here
      extractedText = "Prescription: Paracetamol 500mg - 1 tablet every 6 hours for fever";
      analysis = {
        medications: ["Paracetamol"],
        dosage: "500mg",
        frequency: "Every 6 hours",
        condition: "Fever",
        confidence: 0.85
      };
    } else if (fileType === 'application/pdf') {
      // Use PDF processing library
      extractedText = "Medical report: Patient shows signs of improvement";
      analysis = {
        type: "medical_report",
        confidence: 0.90
      };
    }

    // Track file upload
    analyticsService.trackFileUpload(fileType, fileData?.length || 0, true);

    res.json({
      success: true,
      fileName,
      extractedText,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Upload API Error:', error);
    Sentry.captureException(error);
    analyticsService.trackFileUpload(req.body.fileType, 0, false);
    
    res.status(500).json({ 
      error: 'File processing failed',
      message: 'Unable to process your file at this time'
    });
  }
});

// Voice processing endpoint
app.post('/api/voice/process', authenticateToken, async (req, res) => {
  try {
    const { audioData, language = 'en-IN' } = req.body;
    const userId = req.user.userId;

    // Process voice data (would integrate with speech-to-text service)
    const mockTranscription = "I have been experiencing chest pain for the last two hours";
    
    // Track voice interaction
    analyticsService.trackVoiceInteraction('voice_input', {
      language,
      duration: audioData?.length || 0,
      userId
    });

    res.json({
      success: true,
      transcription: mockTranscription,
      confidence: 0.92,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Voice API Error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

// Analytics endpoints
app.get('/api/analytics/health', (req, res) => {
  const health = analyticsService.checkAnalyticsHealth();
  res.json(health);
});

app.post('/api/analytics/event', authenticateToken, (req, res) => {
  const { category, action, label, value } = req.body;
  analyticsService.trackEvent(category, action, label, value);
  res.json({ success: true });
});

// BFHL API endpoint
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    
    // Validate input
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        error: 'Data must be an array'
      });
    }

    // Initialize arrays for different types
    const evenNumbers = [];
    const oddNumbers = [];
    const alphabets = [];
    const specialCharacters = [];
    let sum = 0;
    const alphabetChars = [];

    // Process each item in the array
    data.forEach(item => {
      const str = String(item);
      
      // Check if it's a number
      if (!isNaN(str) && str.trim() !== '') {
        const num = parseInt(str);
        sum += num;
        
        if (num % 2 === 0) {
          evenNumbers.push(str);
        } else {
          oddNumbers.push(str);
        }
      }
      // Check if it's an alphabet (single character or word)
      else if (/^[a-zA-Z]+$/.test(str)) {
        alphabets.push(str.toUpperCase());
        // Add individual characters for concatenation
        str.split('').forEach(char => {
          alphabetChars.push(char.toLowerCase());
        });
      }
      // Check if it's a special character
      else if (/^[^a-zA-Z0-9\s]+$/.test(str)) {
        specialCharacters.push(str);
      }
    });

    // Create concatenated string with alternating caps in reverse order
    let concatString = '';
    for (let i = alphabetChars.length - 1; i >= 0; i--) {
      const char = alphabetChars[i];
      if (i % 2 === 0) {
        concatString += char.toUpperCase();
      } else {
        concatString += char.toLowerCase();
      }
    }

    // Generate user_id (you can customize this)
    const fullName = "john_doe"; // You can make this dynamic
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const user_id = `${fullName}_${day}${month}${year}`;

    // Prepare response
    const response = {
      is_success: true,
      user_id: user_id,
      email: "john@xyz.com", // You can make this dynamic
      roll_number: "ABCD123", // You can make this dynamic
      odd_numbers: oddNumbers,
      even_numbers: evenNumbers,
      alphabets: alphabets,
      special_characters: specialCharacters,
      sum: String(sum),
      concat_string: concatString
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('BFHL API Error:', error);
    Sentry.captureException(error);
    
    res.status(500).json({
      is_success: false,
      error: 'Internal server error',
      message: 'Something went wrong while processing your request'
    });
  }
});

// Start medication alert scheduler
if (config.features.medicationAlerts) {
  medicationAlertScheduler.startScheduler();
  logger.info('🚀 Medication Alert Scheduler started');
}

// Serve React app for all other routes (only in production)
if (config.server.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Sentry error handler
if (config.analytics.sentry.enabled) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Server Error:', error);
  Sentry.captureException(error);
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// Start server
const PORT = config.server.port || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Sevak Medical Chatbot Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics/health`);
  
  // Validate configuration
  if (!validateConfig()) {
    console.warn('⚠️  Some required environment variables are missing. Check your .env file.');
  }
});

module.exports = app;
