const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendAlert(recipients, alert) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: recipients.join(", "),
        subject: `[${alert.type.toUpperCase()}] Website Monitoring Alert`,
        html: this.generateEmailTemplate(alert),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info("Alert email sent successfully", {
        recipients,
        alertType: alert.type,
      });
    } catch (error) {
      logger.error("Failed to send alert email", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  generateEmailTemplate(alert) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${alert.type === "critical" ? "#dc3545" : "#ffc107"}">
          ${alert.type.toUpperCase()} Alert
        </h2>
        <p style="font-size: 16px; line-height: 1.5;">
          ${alert.message}
        </p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p style="margin: 0; color: #6c757d;">
            This is an automated message from your website monitoring system.
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = new EmailService(); 