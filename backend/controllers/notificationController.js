const appNotificationService = require("../services/appNotificationService");
const logger = require("../utils/logger");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await appNotificationService.getUnreadNotifications(
      req.user._id
    );

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logger.error("Failed to get notifications", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await appNotificationService.markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error("Failed to mark notification as read", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await appNotificationService.markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    logger.error("Failed to mark all notifications as read", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}; 