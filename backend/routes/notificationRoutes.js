const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected and require authentication
router.use(protect);

// Get user's notifications
router.get("/", notificationController.getNotifications);

// Mark a notification as read
router.put("/:notificationId/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllAsRead);

module.exports = router; 