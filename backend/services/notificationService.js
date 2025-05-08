const { sendPushNotification } = require("../config/firebase");
const logger = require("../utils/logger");

class NotificationService {
  /**
   * Send uptime status notification
   * @param {Object} monitor - The uptime monitor object
   * @param {Object} status - The status object containing uptime information
   */
  async sendUptimeNotification(monitor, status) {
    try {
      if (!monitor.notifications || !monitor.notifications.push) {
        return;
      }

      const { deviceToken, topicName } = monitor.notifications.push;
      const target = topicName ? `/topics/${topicName}` : deviceToken;

      if (!target) {
        logger.warn("No push notification target configured for monitor", {
          monitorId: monitor._id,
        });
        return;
      }

      const notification = {
        title: `${monitor.name} - ${status.isUp ? "Back Online" : "Site Down"}`,
        body: status.isUp
          ? `${monitor.url} is back online. Response time: ${status.responseTime}ms`
          : `${monitor.url} is down! Error: ${
              status.error || "Connection failed"
            }`,
      };

      const data = {
        monitorId: monitor._id.toString(),
        url: monitor.url,
        timestamp: new Date().toISOString(),
        status: status.isUp ? "up" : "down",
        responseTime: status.responseTime?.toString() || "0",
      };

      await sendPushNotification(target, notification, data);
    } catch (error) {
      logger.error("Failed to send uptime notification", {
        error: error.message,
        monitorId: monitor._id,
      });
    }
  }

  /**
   * Send SSL certificate expiry notification
   * @param {Object} monitor - The uptime monitor object
   * @param {Object} sslData - SSL certificate data
   */
  async sendSSLExpiryNotification(monitor, sslData) {
    try {
      if (!monitor.notifications?.push || !sslData?.expiryDate) {
        return;
      }

      const { deviceToken, topicName } = monitor.notifications.push;
      const target = topicName ? `/topics/${topicName}` : deviceToken;

      if (!target) return;

      const daysToExpiry = Math.ceil(
        (new Date(sslData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (daysToExpiry > 30) return; // Only notify if expiring within 30 days

      const notification = {
        title: `SSL Certificate Expiring - ${monitor.name}`,
        body: `SSL certificate for ${monitor.url} will expire in ${daysToExpiry} days`,
      };

      const data = {
        monitorId: monitor._id.toString(),
        url: monitor.url,
        expiryDate: sslData.expiryDate,
        daysToExpiry: daysToExpiry.toString(),
        issuer: sslData.issuer || "Unknown",
      };

      await sendPushNotification(target, notification, data);
    } catch (error) {
      logger.error("Failed to send SSL expiry notification", {
        error: error.message,
        monitorId: monitor._id,
      });
    }
  }
}

module.exports = new NotificationService();
