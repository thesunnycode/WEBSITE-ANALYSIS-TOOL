const mongoose = require("mongoose");

const uptimeMonitorSchema = new mongoose.Schema(
  {
    websiteAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebsiteAnalysis",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    checkFrequency: {
      type: Number, // in minutes
      enum: [5, 15, 30],
      default: 15,
    },
    locations: [{
      type: String,
      default: ["default"],
    }],
    alertSettings: {
      appNotifications: {
        enabled: {
          type: Boolean,
          default: true,
        },
        notifyOn: {
          downtime: {
            type: Boolean,
            default: true,
          },
          recovery: {
            type: Boolean,
            default: true,
          },
          responseTime: {
            type: Boolean,
            default: true,
          },
        },
      },
    },
    alertThresholds: {
      responseTime: {
        warning: {
          type: Number, // in milliseconds
          default: 2000,
        },
        critical: {
          type: Number, // in milliseconds
          default: 5000,
        },
      },
      uptime: {
        warning: {
          type: Number, // percentage
          default: 99.5,
        },
        critical: {
          type: Number, // percentage
          default: 99.0,
        },
      },
    },
    maintenanceMode: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: Date,
      endTime: Date,
      message: String,
    },
    status: {
      type: String,
      enum: ["active", "paused", "maintenance"],
      default: "active",
    },
    lastCheck: {
      type: Date,
    },
    uptimeStats: {
      daily: {
        type: Number,
        default: 100,
      },
      weekly: {
        type: Number,
        default: 100,
      },
      monthly: {
        type: Number,
        default: 100,
      },
    },
    responseTimeStats: {
      current: {
        type: Number,
        default: 0,
      },
      average: {
        type: Number,
        default: 0,
      },
      trend: {
        type: String,
        enum: ["improving", "stable", "declining"],
        default: "stable",
      },
    },
    // Downtime cost calculator fields
    trafficStats: {
      averageDailyVisitors: {
        type: Number,
        default: 0,
      },
      averageConversionRate: {
        type: Number,
        default: 0,
      },
      averageTransactionValue: {
        type: Number,
        default: 0,
      },
    },
    // Public status page configuration
    statusPage: {
      enabled: {
        type: Boolean,
        default: false,
      },
      publicToken: {
        type: String,
      },
      customDomain: {
        type: String,
      },
      title: {
        type: String,
        default: "Status Page",
      },
      description: {
        type: String,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
    },
    // Benchmark comparison
    benchmarks: {
      industry: {
        type: String,
        enum: ["ecommerce", "saas", "blog", "corporate", "other"],
        default: "other",
      },
      performanceScore: {
        type: Number,
        default: 0,
      },
      comparisonMetrics: {
        uptime: {
          type: Number,
          default: 0,
        },
        responseTime: {
          type: Number,
          default: 0,
        },
        reliability: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
uptimeMonitorSchema.index({ websiteAnalysis: 1 });
uptimeMonitorSchema.index({ status: 1 });
uptimeMonitorSchema.index({ "maintenanceMode.enabled": 1 });
uptimeMonitorSchema.index({ "statusPage.publicToken": 1 });

module.exports = mongoose.model("UptimeMonitor", uptimeMonitorSchema);
