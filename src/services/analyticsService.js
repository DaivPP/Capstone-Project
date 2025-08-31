const ReactGA = require('react-ga4');
const Sentry = require('@sentry/react');
const config = require('../config').default;

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.sessionId = null;
    
    // Initialize analytics services
    this.initializeAnalytics();
  }

  initializeAnalytics() {
    try {
      // Initialize Google Analytics (only in browser environment)
      if (typeof window !== 'undefined' && config.analytics.googleAnalytics.enabled && config.analytics.googleAnalytics.id) {
        ReactGA.initialize(config.analytics.googleAnalytics.id, {
          debug: config.development.debugMode,
          gaOptions: {
            siteSpeedSampleRate: 100
          }
        });
        console.log('✅ Google Analytics initialized');
      }

      // Initialize Sentry (only in browser environment)
      if (typeof window !== 'undefined' && config.analytics.sentry.enabled && config.analytics.sentry.dsn) {
        Sentry.init({
          dsn: config.analytics.sentry.dsn,
          environment: config.analytics.sentry.environment,
          debug: config.development.debugMode,
          integrations: [
            new Sentry.BrowserTracing({
              tracePropagationTargets: ['localhost', 'your-domain.com'],
            }),
            new Sentry.Replay({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          tracesSampleRate: config.analytics.sentry.environment === 'production' ? 0.1 : 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
        console.log('✅ Sentry initialized');
      }

      this.isInitialized = true;
      this.sessionId = this.generateSessionId();
      
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
    }
  }

  // User identification and tracking
  setUser(userId, userProperties = {}) {
    this.userId = userId;
    
    try {
      // Set user in Google Analytics
      if (config.analytics.googleAnalytics.enabled) {
        ReactGA.set({
          userId: userId,
          ...userProperties
        });
      }

      // Set user in Sentry
      if (config.analytics.sentry.enabled) {
        Sentry.setUser({
          id: userId,
          ...userProperties
        });
      }

      console.log('👤 User set in analytics:', userId);
    } catch (error) {
      console.error('Error setting user in analytics:', error);
    }
  }

  // Page view tracking
  trackPageView(page, title = null) {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        ReactGA.send({
          hitType: 'pageview',
          page: page,
          title: title || page
        });
      }

      // Track in Sentry as breadcrumb
      if (config.analytics.sentry.enabled) {
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Page view: ${page}`,
          level: 'info'
        });
      }

      console.log('📄 Page view tracked:', page);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Event tracking
  trackEvent(category, action, label = null, value = null) {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        ReactGA.event({
          category: category,
          action: action,
          label: label,
          value: value
        });
      }

      // Track in Sentry as breadcrumb
      if (config.analytics.sentry.enabled) {
        Sentry.addBreadcrumb({
          category: category,
          message: `${action}${label ? `: ${label}` : ''}`,
          level: 'info',
          data: {
            action: action,
            label: label,
            value: value
          }
        });
      }

      console.log('📊 Event tracked:', { category, action, label, value });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Medical-specific event tracking
  trackMedicalEvent(eventType, data = {}) {
    const category = 'medical';
    const action = eventType;
    
    this.trackEvent(category, action, JSON.stringify(data));
    
    // Additional medical-specific tracking
    this.trackEvent('medical_interaction', eventType, data.symptom || data.condition || 'general');
  }

  // Chat interaction tracking
  trackChatInteraction(interactionType, data = {}) {
    const category = 'chat';
    const action = interactionType;
    
    this.trackEvent(category, action, JSON.stringify(data));
    
    // Track message length, response time, etc.
    if (data.messageLength) {
      this.trackEvent('chat_metrics', 'message_length', null, data.messageLength);
    }
    
    if (data.responseTime) {
      this.trackEvent('chat_metrics', 'response_time', null, data.responseTime);
    }
  }

  // Emergency event tracking
  trackEmergencyEvent(emergencyType, severity, data = {}) {
    const category = 'emergency';
    const action = emergencyType;
    const label = severity;
    
    this.trackEvent(category, action, label);
    
    // High-priority tracking for emergencies
    this.trackEvent('critical_events', 'emergency_detected', emergencyType);
    
    // Send to Sentry as error for monitoring
    if (config.analytics.sentry.enabled) {
      Sentry.captureMessage(`Emergency detected: ${emergencyType}`, {
        level: 'error',
        tags: {
          emergency_type: emergencyType,
          severity: severity
        },
        extra: data
      });
    }
  }

  // Medication tracking
  trackMedicationEvent(eventType, medicationData = {}) {
    const category = 'medication';
    const action = eventType;
    
    this.trackEvent(category, action, medicationData.medicationName || 'unknown');
    
    // Track compliance metrics
    if (eventType === 'medication_taken') {
      this.trackEvent('compliance', 'medication_taken', medicationData.medicationName);
    } else if (eventType === 'medication_missed') {
      this.trackEvent('compliance', 'medication_missed', medicationData.medicationName);
    }
  }

  // File upload tracking
  trackFileUpload(fileType, fileSize, success = true) {
    const category = 'file_upload';
    const action = success ? 'upload_success' : 'upload_failed';
    const label = fileType;
    const value = fileSize;
    
    this.trackEvent(category, action, label, value);
  }

  // Voice interaction tracking
  trackVoiceInteraction(interactionType, data = {}) {
    const category = 'voice';
    const action = interactionType;
    
    this.trackEvent(category, action, JSON.stringify(data));
    
    if (data.duration) {
      this.trackEvent('voice_metrics', 'interaction_duration', null, data.duration);
    }
  }

  // Error tracking
  trackError(error, context = {}) {
    try {
      // Track in Google Analytics
      if (config.analytics.googleAnalytics.enabled) {
        this.trackEvent('error', 'application_error', error.message || 'Unknown error');
      }

      // Send to Sentry
      if (config.analytics.sentry.enabled) {
        Sentry.captureException(error, {
          tags: {
            error_type: 'application_error',
            ...context.tags
          },
          extra: {
            ...context,
            userId: this.userId,
            sessionId: this.sessionId
          }
        });
      }

      console.error('❌ Error tracked:', error);
    } catch (trackingError) {
      console.error('Error tracking error:', trackingError);
    }
  }

  // Performance tracking
  trackPerformance(metricName, value, unit = 'ms') {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        this.trackEvent('performance', metricName, unit, value);
      }

      // Send to Sentry for performance monitoring
      if (config.analytics.sentry.enabled) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `${metricName}: ${value}${unit}`,
          level: 'info',
          data: {
            metric: metricName,
            value: value,
            unit: unit
          }
        });
      }
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }

  // User engagement tracking
  trackEngagement(engagementType, data = {}) {
    const category = 'engagement';
    const action = engagementType;
    
    this.trackEvent(category, action, JSON.stringify(data));
    
    // Track session duration
    if (engagementType === 'session_start') {
      this.sessionStartTime = Date.now();
    } else if (engagementType === 'session_end' && this.sessionStartTime) {
      const sessionDuration = Date.now() - this.sessionStartTime;
      this.trackEvent('engagement', 'session_duration', null, sessionDuration);
    }
  }

  // Conversion tracking
  trackConversion(conversionType, value = null) {
    const category = 'conversion';
    const action = conversionType;
    
    this.trackEvent(category, action, null, value);
    
    // Track as goal completion in GA
    if (config.analytics.googleAnalytics.enabled) {
      ReactGA.event({
        category: 'conversion',
        action: conversionType,
        value: value
      });
    }
  }

  // Custom dimension tracking
  setCustomDimension(dimensionIndex, value) {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        ReactGA.set({
          [`dimension${dimensionIndex}`]: value
        });
      }
    } catch (error) {
      console.error('Error setting custom dimension:', error);
    }
  }

  // Custom metric tracking
  setCustomMetric(metricIndex, value) {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        ReactGA.set({
          [`metric${metricIndex}`]: value
        });
      }
    } catch (error) {
      console.error('Error setting custom metric:', error);
    }
  }

  // User properties tracking
  setUserProperties(properties) {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        ReactGA.set(properties);
      }

      if (config.analytics.sentry.enabled) {
        Sentry.setUser(properties);
      }
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  // Session tracking
  startSession() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    this.trackEngagement('session_start', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  endSession() {
    if (this.sessionStartTime) {
      const sessionDuration = Date.now() - this.sessionStartTime;
      
      this.trackEngagement('session_end', {
        sessionId: this.sessionId,
        duration: sessionDuration,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Utility methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Analytics data export
  exportAnalyticsData(startDate, endDate) {
    // This would integrate with Google Analytics API to export data
    // Implementation depends on specific requirements
    console.log('Exporting analytics data from', startDate, 'to', endDate);
  }

  // Health check
  checkAnalyticsHealth() {
    const health = {
      googleAnalytics: {
        enabled: config.analytics.googleAnalytics.enabled,
        initialized: config.analytics.googleAnalytics.enabled && this.isInitialized
      },
      sentry: {
        enabled: config.analytics.sentry.enabled,
        initialized: config.analytics.sentry.enabled && this.isInitialized
      },
      sessionId: this.sessionId,
      userId: this.userId
    };

    console.log('📊 Analytics health check:', health);
    return health;
  }

  // Privacy and GDPR compliance
  clearUserData() {
    try {
      if (config.analytics.googleAnalytics.enabled) {
        // Clear GA cookies and data
        ReactGA.ga('create', config.analytics.googleAnalytics.id, 'auto');
        ReactGA.ga('send', 'pageview');
      }

      if (config.analytics.sentry.enabled) {
        Sentry.setUser(null);
      }

      this.userId = null;
      this.sessionId = null;
      
      console.log('🧹 User data cleared from analytics');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Opt-out functionality
  setOptOut(optedOut) {
    try {
      if (optedOut) {
        // Disable tracking
        if (config.analytics.googleAnalytics.enabled) {
          window['ga-disable-' + config.analytics.googleAnalytics.id] = true;
        }
        
        if (config.analytics.sentry.enabled) {
          Sentry.close();
        }
        
        console.log('🚫 Analytics tracking disabled');
      } else {
        // Re-enable tracking
        if (config.analytics.googleAnalytics.enabled) {
          window['ga-disable-' + config.analytics.googleAnalytics.id] = false;
        }
        
        if (config.analytics.sentry.enabled) {
          this.initializeAnalytics();
        }
        
        console.log('✅ Analytics tracking enabled');
      }
    } catch (error) {
      console.error('Error setting analytics opt-out:', error);
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export both the class and the singleton instance
module.exports = { AnalyticsService };
module.exports.default = analyticsService;
