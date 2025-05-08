const logger = require("../utils/logger");
const Notification = require("../models/Notification");

class AppNotificationService {
  async createNotification(userId, alert) {
    try {
      const notification = new Notification({
        user: userId,
        type: alert.type,
        message: alert.message,
        status: "unread",
        metadata: {
          timestamp: new Date(),
          severity: alert.type === "critical" ? "high" : "medium",
        },
      });

      await notification.save();
      logger.info("App notification created", {
        userId,
        alertType: alert.type,
      });

      return notification;
    } catch (error) {
      logger.error("Failed to create app notification", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getUnreadNotifications(userId) {
    return Notification.find({
      user: userId,
      status: "unread",
    }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { status: "read" },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, status: "unread" },
      { status: "read" }
    );
  }
}

module.exports = new AppNotificationService(); 