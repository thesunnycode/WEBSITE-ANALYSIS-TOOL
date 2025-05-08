const mongoose = require('mongoose');

const uptimeCheckSchema = new mongoose.Schema(
  {
    websiteAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebsiteAnalysis',
      required: true,
    },
    status: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
    responseTime: {
      type: Number, // in milliseconds
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    error: {
      type: String,
    },
    location: {
      type: String,
      required: true,
      default: 'default',
    },
    checkType: {
      type: String,
      enum: ['http', 'ping'],
      default: 'http',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
uptimeCheckSchema.index({ websiteAnalysis: 1, timestamp: -1 });
uptimeCheckSchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('UptimeCheck', uptimeCheckSchema); 