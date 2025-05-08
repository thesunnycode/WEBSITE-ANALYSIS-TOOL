const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["critical", "warning", "info"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    metadata: {
      timestamp: Date,
      severity: {
        type: String,
        enum: ["high", "medium", "low"],
      },
      websiteAnalysis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WebsiteAnalysis",
      },
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema); 