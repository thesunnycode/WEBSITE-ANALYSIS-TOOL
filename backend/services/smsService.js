const twilio = require("twilio");
const logger = require("../utils/logger");

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendAlert(recipients, alert) {
    try {
      const messagePromises = recipients.map((recipient) =>
        this.client.messages.create({
          body: this.generateSMSMessage(alert),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient,
        })
      );

      await Promise.all(messagePromises);
      logger.info("Alert SMS sent successfully", {
        recipients,
        alertType: alert.type,
      });
    } catch (error) {
      logger.error("Failed to send alert SMS", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  generateSMSMessage(alert) {
    return `[${alert.type.toUpperCase()}] Website Alert: ${alert.message}`;
  }
}

module.exports = new SMSService(); 