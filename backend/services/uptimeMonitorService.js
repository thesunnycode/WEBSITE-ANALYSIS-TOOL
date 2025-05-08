const axios = require("axios");
const UptimeMonitor = require("../models/UptimeMonitor");
const UptimeCheck = require("../models/UptimeCheck");
const logger = require("../utils/logger");
const appNotificationService = require("./appNotificationService");

class UptimeMonitorService {
  async performCheck(monitor) {
    try {
      const startTime = Date.now();
      const response = await axios.get(monitor.url, {
        timeout: 10000,
        validateStatus: null,
      });
      const responseTime = Date.now() - startTime;

      const check = new UptimeCheck({
        websiteAnalysis: monitor.websiteAnalysis,
        status: response.status >= 200 && response.status < 400 ? "up" : "down",
        responseTime,
        statusCode: response.status,
        location: monitor.locations[0],
        timestamp: new Date(),
      });

      await check.save();
      await this.updateMonitorStats(monitor, check);
      await this.handleAlerts(monitor, check);

      return check;
    } catch (error) {
      const check = new UptimeCheck({
        websiteAnalysis: monitor.websiteAnalysis,
        status: "down",
        responseTime: 0,
        statusCode: 0,
        error: error.message,
        location: monitor.locations[0],
        timestamp: new Date(),
      });

      await check.save();
      await this.updateMonitorStats(monitor, check);
      await this.handleAlerts(monitor, check);

      return check;
    }
  }

  async updateMonitorStats(monitor, check) {
    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyChecks, weeklyChecks, monthlyChecks] = await Promise.all([
      UptimeCheck.find({
        websiteAnalysis: monitor.websiteAnalysis,
        timestamp: { $gte: dayStart },
      }),
      UptimeCheck.find({
        websiteAnalysis: monitor.websiteAnalysis,
        timestamp: { $gte: weekStart },
      }),
      UptimeCheck.find({
        websiteAnalysis: monitor.websiteAnalysis,
        timestamp: { $gte: monthStart },
      }),
    ]);

    const calculateUptime = (checks) => {
      if (checks.length === 0) return 100;
      const upCount = checks.filter((c) => c.status === "up").length;
      return (upCount / checks.length) * 100;
    };

    // Calculate response time trend
    const recentChecks = await UptimeCheck.find({
      websiteAnalysis: monitor.websiteAnalysis,
      timestamp: { $gte: new Date(now - 24 * 60 * 60 * 1000) }, // Last 24 hours
    }).sort({ timestamp: -1 });

    const responseTimeTrend = this.calculateResponseTimeTrend(recentChecks);

    await UptimeMonitor.findByIdAndUpdate(monitor._id, {
      lastCheck: new Date(),
      uptimeStats: {
        daily: calculateUptime(dailyChecks),
        weekly: calculateUptime(weeklyChecks),
        monthly: calculateUptime(monthlyChecks),
      },
      responseTimeStats: {
        current: check.responseTime,
        average: this.calculateAverageResponseTime(recentChecks),
        trend: responseTimeTrend,
      },
    });
  }

  calculateResponseTimeTrend(checks) {
    if (checks.length < 2) return "stable";

    const recentAvg = this.calculateAverageResponseTime(checks.slice(0, 5));
    const olderAvg = this.calculateAverageResponseTime(checks.slice(5, 10));

    if (!olderAvg) return "stable";

    const difference = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (difference < -10) return "improving";
    if (difference > 10) return "declining";
    return "stable";
  }

  calculateAverageResponseTime(checks) {
    if (checks.length === 0) return 0;
    const sum = checks.reduce((acc, check) => acc + check.responseTime, 0);
    return Math.round(sum / checks.length);
  }

  async handleAlerts(monitor, check) {
    if (!monitor.alertSettings.appNotifications.enabled) return;

    const alerts = [];

    // Response time alerts
    if (
      monitor.alertSettings.appNotifications.notifyOn.responseTime &&
      check.responseTime > monitor.alertThresholds.responseTime.critical
    ) {
      alerts.push({
        type: "critical",
        message: `Critical response time: ${check.responseTime}ms`,
      });
    } else if (
      monitor.alertSettings.appNotifications.notifyOn.responseTime &&
      check.responseTime > monitor.alertThresholds.responseTime.warning
    ) {
      alerts.push({
        type: "warning",
        message: `High response time: ${check.responseTime}ms`,
      });
    }

    // Status alerts
    if (
      check.status === "down" &&
      monitor.alertSettings.appNotifications.notifyOn.downtime
    ) {
      alerts.push({
        type: "critical",
        message: `Website is down: ${check.error || "Unknown error"}`,
      });
    } else if (
      check.status === "up" &&
      monitor.alertSettings.appNotifications.notifyOn.recovery
    ) {
      alerts.push({
        type: "info",
        message: "Website is back online",
      });
    }

    // Send alerts
    for (const alert of alerts) {
      await appNotificationService.createNotification(
        monitor.websiteAnalysis.user,
        alert
      );
    }
  }

  async startMonitoring(websiteAnalysisId, url, options = {}) {
    const monitor = new UptimeMonitor({
      websiteAnalysis: websiteAnalysisId,
      url,
      ...options,
    });

    await monitor.save();
    return monitor;
  }

  async getUptimeStats(websiteAnalysisId, period = "daily") {
    const monitor = await UptimeMonitor.findOne({ websiteAnalysis: websiteAnalysisId });
    if (!monitor) return null;

    return {
      uptime: monitor.uptimeStats[period],
      lastCheck: monitor.lastCheck,
      status: monitor.status,
      responseTime: monitor.responseTimeStats,
    };
  }

  async getIncidentHistory(websiteAnalysisId, limit = 10) {
    return UptimeCheck.find({
      websiteAnalysis: websiteAnalysisId,
      status: "down",
    })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async setMaintenanceMode(websiteAnalysisId, enabled, options = {}) {
    const monitor = await UptimeMonitor.findOne({ websiteAnalysis: websiteAnalysisId });
    if (!monitor) return null;

    monitor.maintenanceMode = {
      enabled,
      startTime: options.startTime,
      endTime: options.endTime,
      message: options.message,
    };
    monitor.status = enabled ? "maintenance" : "active";

    await monitor.save();
    return monitor;
  }

  async calculateDowntimeCost(monitor, durationInMinutes) {
    const {
      averageDailyVisitors,
      averageConversionRate,
      averageTransactionValue,
    } = monitor.trafficStats;

    // Calculate visitors per minute
    const visitorsPerMinute = averageDailyVisitors / (24 * 60);
    
    // Calculate potential visitors during downtime
    const affectedVisitors = visitorsPerMinute * durationInMinutes;
    
    // Calculate potential lost conversions
    const lostConversions = affectedVisitors * (averageConversionRate / 100);
    
    // Calculate potential revenue loss
    const revenueLoss = lostConversions * averageTransactionValue;

    return {
      durationInMinutes,
      affectedVisitors,
      lostConversions,
      revenueLoss,
    };
  }

  async updateBenchmarks(monitor) {
    const industryStandards = {
      ecommerce: {
        uptime: 99.95,
        responseTime: 2000,
        reliability: 99.9,
      },
      saas: {
        uptime: 99.9,
        responseTime: 1500,
        reliability: 99.8,
      },
      blog: {
        uptime: 99.5,
        responseTime: 3000,
        reliability: 99.0,
      },
      corporate: {
        uptime: 99.9,
        responseTime: 2500,
        reliability: 99.5,
      },
      other: {
        uptime: 99.0,
        responseTime: 3000,
        reliability: 98.0,
      },
    };

    const standard = industryStandards[monitor.benchmarks.industry];

    // Calculate performance score (0-100)
    const uptimeScore = (monitor.uptimeStats.monthly / standard.uptime) * 40;
    const responseTimeScore = (standard.responseTime / monitor.responseTimeStats.average) * 30;
    const reliabilityScore = (monitor.uptimeStats.monthly / standard.reliability) * 30;

    const performanceScore = Math.min(100, Math.round(uptimeScore + responseTimeScore + reliabilityScore));

    // Update benchmarks
    monitor.benchmarks = {
      ...monitor.benchmarks,
      performanceScore,
      comparisonMetrics: {
        uptime: standard.uptime,
        responseTime: standard.responseTime,
        reliability: standard.reliability,
      },
    };

    await monitor.save();
    return monitor.benchmarks;
  }

  async generateStatusPageData(monitor) {
    if (!monitor.statusPage.enabled) {
      throw new Error("Status page is not enabled for this monitor");
    }

    const recentIncidents = await UptimeCheck.find({
      websiteAnalysis: monitor.websiteAnalysis,
      status: "down",
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    }).sort({ timestamp: -1 });

    const incidents = recentIncidents.map(incident => ({
      timestamp: incident.timestamp,
      duration: this.calculateIncidentDuration(incident),
      status: incident.status,
      error: incident.error,
    }));

    return {
      title: monitor.statusPage.title,
      description: monitor.statusPage.description,
      theme: monitor.statusPage.theme,
      currentStatus: monitor.status,
      uptime: monitor.uptimeStats,
      responseTime: monitor.responseTimeStats,
      incidents,
      lastUpdated: new Date(),
    };
  }

  calculateIncidentDuration(incident) {
    // Find the next "up" status after this incident
    return UptimeCheck.findOne({
      websiteAnalysis: incident.websiteAnalysis,
      status: "up",
      timestamp: { $gt: incident.timestamp },
    }).then(nextUp => {
      if (!nextUp) return null;
      return (nextUp.timestamp - incident.timestamp) / (1000 * 60); // Duration in minutes
    });
  }
}

module.exports = new UptimeMonitorService(); 