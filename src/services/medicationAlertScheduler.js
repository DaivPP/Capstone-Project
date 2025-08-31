const cron = require('node-cron');
const MedicationAlert = require('../models/MedicationAlert');
const TwilioService = require('./twilioService');
const User = require('../models/User');
const config = require('../config').default;

class MedicationAlertScheduler {
  constructor() {
    this.scheduler = null;
    this.isRunning = false;
    this.activeJobs = new Map();
    
    // Initialize the scheduler
    this.initializeScheduler();
  }

  initializeScheduler() {
    try {
      // Schedule medication reminders every minute
      this.scheduler = cron.schedule('* * * * *', async () => {
        await this.processMedicationReminders();
      }, {
        scheduled: false,
        timezone: 'Asia/Kolkata'
      });

      // Schedule daily health checks at 9 AM
      const healthCheckScheduler = cron.schedule('0 9 * * *', async () => {
        await this.sendDailyHealthChecks();
      }, {
        scheduled: false,
        timezone: 'Asia/Kolkata'
      });

      // Schedule weekly medication compliance reports
      const complianceScheduler = cron.schedule('0 10 * * 1', async () => {
        await this.generateWeeklyComplianceReports();
      }, {
        scheduled: false,
        timezone: 'Asia/Kolkata'
      });

      console.log('✅ Medication Alert Scheduler initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Medication Alert Scheduler:', error);
    }
  }

  async startScheduler() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler is already running');
      return;
    }

    try {
      this.scheduler.start();
      this.isRunning = true;
      console.log('🚀 Medication Alert Scheduler started');
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
    }
  }

  async stopScheduler() {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler is not running');
      return;
    }

    try {
      this.scheduler.stop();
      this.isRunning = false;
      console.log('🛑 Medication Alert Scheduler stopped');
    } catch (error) {
      console.error('❌ Failed to stop scheduler:', error);
    }
  }

  async processMedicationReminders() {
    try {
      const now = new Date();
      const upcomingTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

      // Find all medication alerts that are due within the next 15 minutes
      const dueAlerts = await MedicationAlert.find({
        status: 'active',
        'alertConfig.enabled': true,
        'schedule.nextDose': {
          $gte: now,
          $lte: upcomingTime
        }
      }).populate('userId');

      console.log(`📅 Processing ${dueAlerts.length} medication reminders`);

      for (const alert of dueAlerts) {
        await this.processSingleReminder(alert);
      }

    } catch (error) {
      console.error('❌ Error processing medication reminders:', error);
    }
  }

  async processSingleReminder(alert) {
    try {
      const user = alert.userId;
      const medication = alert.medication;
      const now = new Date();

      // Check if it's time to send the reminder
      const timeUntilDose = alert.schedule.nextDose.getTime() - now.getTime();
      const minutesUntilDose = Math.floor(timeUntilDose / (1000 * 60));

      // Send reminder 15 minutes before dose time
      if (minutesUntilDose <= 15 && minutesUntilDose >= 0) {
        console.log(`🔔 Sending reminder for ${medication.name} to ${user.firstName} ${user.lastName}`);

        // Send notification based on user preferences
        const notificationResult = await this.sendMedicationNotification(user, alert);

        // Update alert with notification sent
        alert.lastNotificationSent = now;
        await alert.save();

        // Track the notification
        this.trackNotificationSent(alert, notificationResult);

      } else if (timeUntilDose < 0) {
        // Medication is overdue
        await this.handleOverdueMedication(alert);
      }

    } catch (error) {
      console.error(`❌ Error processing reminder for alert ${alert._id}:`, error);
    }
  }

  async sendMedicationNotification(user, alert) {
    const results = {
      sms: null,
      email: null,
      push: null,
      voice: null
    };

    try {
      // Send SMS if enabled
      if (user.preferences?.notifications?.sms && alert.alertConfig.notificationTypes.sms) {
        results.sms = await TwilioService.sendMedicationReminder(user, alert.medication);
      }

      // Send voice call if enabled
      if (user.preferences?.notifications?.voice && alert.alertConfig.notificationTypes.voice) {
        results.voice = await TwilioService.makeVoiceCall(
          user.phoneNumber,
          'medicationReminder',
          user.preferences.language || 'en',
          {
            medication: alert.medication.name,
            dosage: `${alert.medication.dosage.amount}${alert.medication.dosage.unit}`
          }
        );
      }

      // Send email if enabled (implement email service)
      if (user.preferences?.notifications?.email && alert.alertConfig.notificationTypes.email) {
        results.email = await this.sendEmailNotification(user, alert);
      }

      // Send push notification if enabled (implement push service)
      if (user.preferences?.notifications?.push && alert.alertConfig.notificationTypes.push) {
        results.push = await this.sendPushNotification(user, alert);
      }

      return results;

    } catch (error) {
      console.error('❌ Error sending medication notification:', error);
      return results;
    }
  }

  async handleOverdueMedication(alert) {
    try {
      const user = alert.userId;
      const medication = alert.medication;
      const overdueMinutes = Math.floor((new Date() - alert.schedule.nextDose) / (1000 * 60));

      console.log(`⚠️ Medication ${medication.name} is overdue by ${overdueMinutes} minutes for ${user.firstName}`);

      // Check if escalation is needed
      if (alert.alertConfig.escalation.enabled && overdueMinutes >= alert.alertConfig.escalation.delay) {
        await this.escalateOverdueMedication(alert);
      }

      // Send overdue notification
      await this.sendOverdueNotification(user, alert, overdueMinutes);

    } catch (error) {
      console.error('❌ Error handling overdue medication:', error);
    }
  }

  async escalateOverdueMedication(alert) {
    try {
      const user = alert.userId;
      const medication = alert.medication;

      // Get emergency contacts
      const emergencyContacts = user.medicalProfile?.emergencyContacts || [];

      // Send emergency alert to contacts
      for (const contact of emergencyContacts) {
        if (contact.isPrimary) {
          await TwilioService.sendSMS(
            contact.phoneNumber,
            'emergencyAlert',
            'en',
            {
              userName: `${user.firstName} ${user.lastName}`,
              location: user.location?.address?.city || 'Unknown location',
              userPhone: user.phoneNumber,
              medication: medication.name
            }
          );
        }
      }

      console.log(`🚨 Escalated overdue medication ${medication.name} for ${user.firstName}`);

    } catch (error) {
      console.error('❌ Error escalating overdue medication:', error);
    }
  }

  async sendOverdueNotification(user, alert, overdueMinutes) {
    try {
      const message = `⚠️ Your medication ${alert.medication.name} is overdue by ${overdueMinutes} minutes. Please take it as soon as possible.`;

      await TwilioService.sendSMS(
        user.phoneNumber,
        'custom',
        user.preferences?.language || 'en',
        { message }
      );

    } catch (error) {
      console.error('❌ Error sending overdue notification:', error);
    }
  }

  async sendDailyHealthChecks() {
    try {
      // Find users who have enabled health check notifications
      const users = await User.find({
        'preferences.notifications.healthCheck': true,
        isActive: true
      });

      console.log(`💚 Sending daily health checks to ${users.length} users`);

      for (const user of users) {
        try {
          await TwilioService.sendHealthCheck(user);
          
          // Add delay to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`❌ Error sending health check to ${user.email}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error sending daily health checks:', error);
    }
  }

  async generateWeeklyComplianceReports() {
    try {
      // Get all active medication alerts
      const alerts = await MedicationAlert.find({ status: 'active' }).populate('userId');

      console.log(`📊 Generating weekly compliance reports for ${alerts.length} medications`);

      for (const alert of alerts) {
        try {
          const complianceRate = alert.compliance.complianceRate;
          const user = alert.userId;

          // Send report if compliance is below 80%
          if (complianceRate < 80) {
            await this.sendComplianceReport(user, alert, complianceRate);
          }

        } catch (error) {
          console.error(`❌ Error generating compliance report for alert ${alert._id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error generating weekly compliance reports:', error);
    }
  }

  async sendComplianceReport(user, alert, complianceRate) {
    try {
      const message = `📊 Weekly Medication Report: Your compliance rate for ${alert.medication.name} is ${complianceRate}%. Please try to improve your medication adherence.`;

      await TwilioService.sendSMS(
        user.phoneNumber,
        'custom',
        user.preferences?.language || 'en',
        { message }
      );

    } catch (error) {
      console.error('❌ Error sending compliance report:', error);
    }
  }

  async sendEmailNotification(user, alert) {
    // Implement email service integration
    console.log(`📧 Email notification would be sent to ${user.email} for ${alert.medication.name}`);
    return { success: true, method: 'email' };
  }

  async sendPushNotification(user, alert) {
    // Implement push notification service integration
    console.log(`📱 Push notification would be sent to ${user.firstName} for ${alert.medication.name}`);
    return { success: true, method: 'push' };
  }

  trackNotificationSent(alert, notificationResult) {
    // Track notification analytics
    console.log(`📊 Notification sent for ${alert.medication.name}:`, {
      userId: alert.userId._id,
      medication: alert.medication.name,
      notificationMethods: Object.keys(notificationResult).filter(key => notificationResult[key]?.success),
      timestamp: new Date()
    });
  }

  // Manual medication tracking methods
  async markMedicationAsTaken(alertId, notes = '') {
    try {
      const alert = await MedicationAlert.findById(alertId);
      if (!alert) {
        throw new Error('Medication alert not found');
      }

      await alert.markAsTaken(notes);
      console.log(`✅ Medication ${alert.medication.name} marked as taken`);

      return { success: true, alert };

    } catch (error) {
      console.error('❌ Error marking medication as taken:', error);
      return { success: false, error: error.message };
    }
  }

  async markMedicationAsMissed(alertId, reason = '') {
    try {
      const alert = await MedicationAlert.findById(alertId);
      if (!alert) {
        throw new Error('Medication alert not found');
      }

      await alert.markAsMissed(reason);
      console.log(`❌ Medication ${alert.medication.name} marked as missed`);

      return { success: true, alert };

    } catch (error) {
      console.error('❌ Error marking medication as missed:', error);
      return { success: false, error: error.message };
    }
  }

  async markMedicationAsSkipped(alertId, reason = '') {
    try {
      const alert = await MedicationAlert.findById(alertId);
      if (!alert) {
        throw new Error('Medication alert not found');
      }

      await alert.markAsSkipped(reason);
      console.log(`⏭️ Medication ${alert.medication.name} marked as skipped`);

      return { success: true, alert };

    } catch (error) {
      console.error('❌ Error marking medication as skipped:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSchedulerStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.activeJobs.size,
      timezone: 'Asia/Kolkata',
      nextRun: this.scheduler ? this.scheduler.nextDate() : null
    };
  }

  async getOverdueMedications() {
    try {
      const overdueAlerts = await MedicationAlert.find({
        status: 'active',
        'alertConfig.enabled': true,
        'schedule.nextDose': { $lt: new Date() }
      }).populate('userId');

      return overdueAlerts.map(alert => ({
        id: alert._id,
        medication: alert.medication.name,
        user: `${alert.userId.firstName} ${alert.userId.lastName}`,
        overdueBy: Math.floor((new Date() - alert.schedule.nextDose) / (1000 * 60 * 60)), // hours
        severity: alert.emergency.isCritical ? 'critical' : 'normal'
      }));

    } catch (error) {
      console.error('❌ Error getting overdue medications:', error);
      return [];
    }
  }

  async getUpcomingMedications(minutes = 30) {
    try {
      const now = new Date();
      const future = new Date(now.getTime() + minutes * 60 * 1000);

      const upcomingAlerts = await MedicationAlert.find({
        status: 'active',
        'alertConfig.enabled': true,
        'schedule.nextDose': {
          $gte: now,
          $lte: future
        }
      }).populate('userId');

      return upcomingAlerts.map(alert => ({
        id: alert._id,
        medication: alert.medication.name,
        user: `${alert.userId.firstName} ${alert.userId.lastName}`,
        dueIn: Math.floor((alert.schedule.nextDose - now) / (1000 * 60)), // minutes
        dosage: `${alert.medication.dosage.amount}${alert.medication.dosage.unit}`
      }));

    } catch (error) {
      console.error('❌ Error getting upcoming medications:', error);
      return [];
    }
  }
}

// Create singleton instance
const medicationAlertScheduler = new MedicationAlertScheduler();

// Export both the class and the singleton instance
module.exports = { MedicationAlertScheduler };
module.exports.default = medicationAlertScheduler;
