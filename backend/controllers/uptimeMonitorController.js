const uptimeMonitorService = require("../services/uptimeMonitorService");
const logger = require("../utils/logger");

exports.startMonitoring = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { url, checkFrequency, locations, alertSettings } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const monitor = await uptimeMonitorService.startMonitoring(
      websiteAnalysisId,
      url,
      {
        checkFrequency,
        locations,
        alertSettings,
      }
    );

    res.status(201).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    logger.error("Failed to start monitoring", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getUptimeStats = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { period } = req.query;

    const stats = await uptimeMonitorService.getUptimeStats(
      websiteAnalysisId,
      period
    );

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Failed to get uptime stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getIncidentHistory = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { limit } = req.query;

    const incidents = await uptimeMonitorService.getIncidentHistory(
      websiteAnalysisId,
      parseInt(limit) || 10
    );

    res.json({
      success: true,
      data: incidents,
    });
  } catch (error) {
    logger.error("Failed to get incident history", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.setMaintenanceMode = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { enabled, startTime, endTime, message } = req.body;

    const monitor = await uptimeMonitorService.setMaintenanceMode(
      websiteAnalysisId,
      enabled,
      {
        startTime,
        endTime,
        message,
      }
    );

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    res.json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    logger.error("Failed to set maintenance mode", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateAlertSettings = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { alertSettings } = req.body;

    const monitor = await uptimeMonitorService.updateAlertSettings(
      websiteAnalysisId,
      alertSettings
    );

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    res.json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    logger.error("Failed to update alert settings", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.calculateDowntimeCost = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationInMinutes } = req.query;

    const monitor = await uptimeMonitorService.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    const costAnalysis = await uptimeMonitorService.calculateDowntimeCost(
      monitor,
      parseInt(durationInMinutes)
    );

    res.json({
      success: true,
      data: costAnalysis,
    });
  } catch (error) {
    logger.error("Failed to calculate downtime cost", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateTrafficStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { averageDailyVisitors, averageConversionRate, averageTransactionValue } = req.body;

    const monitor = await uptimeMonitorService.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    monitor.trafficStats = {
      averageDailyVisitors,
      averageConversionRate,
      averageTransactionValue,
    };

    await monitor.save();

    res.json({
      success: true,
      data: monitor.trafficStats,
    });
  } catch (error) {
    logger.error("Failed to update traffic stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getBenchmarks = async (req, res) => {
  try {
    const { id } = req.params;

    const monitor = await uptimeMonitorService.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    const benchmarks = await uptimeMonitorService.updateBenchmarks(monitor);

    res.json({
      success: true,
      data: benchmarks,
    });
  } catch (error) {
    logger.error("Failed to get benchmarks", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateIndustryBenchmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { industry } = req.body;

    const monitor = await uptimeMonitorService.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    monitor.benchmarks.industry = industry;
    await monitor.save();

    const benchmarks = await uptimeMonitorService.updateBenchmarks(monitor);

    res.json({
      success: true,
      data: benchmarks,
    });
  } catch (error) {
    logger.error("Failed to update industry benchmark", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getStatusPageData = async (req, res) => {
  try {
    const { id } = req.params;

    const monitor = await uptimeMonitorService.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    const statusPageData = await uptimeMonitorService.generateStatusPageData(monitor);

    res.json({
      success: true,
      data: statusPageData,
    });
  } catch (error) {
    logger.error("Failed to get status page data", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateStatusPage = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, title, description, theme, customDomain } = req.body;

    const monitor = await uptimeMonitorService.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    monitor.statusPage = {
      enabled,
      title,
      description,
      theme,
      customDomain,
      publicToken: monitor.statusPage.publicToken || require("crypto").randomBytes(16).toString("hex"),
    };

    await monitor.save();

    res.json({
      success: true,
      data: monitor.statusPage,
    });
  } catch (error) {
    logger.error("Failed to update status page", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getPublicStatusPage = async (req, res) => {
  try {
    const { publicToken } = req.params;

    const monitor = await UptimeMonitor.findOne({
      "statusPage.publicToken": publicToken,
      "statusPage.enabled": true,
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Status page not found",
      });
    }

    const statusPageData = await uptimeMonitorService.generateStatusPageData(monitor);

    res.json({
      success: true,
      data: statusPageData,
    });
  } catch (error) {
    logger.error("Failed to get public status page", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}; 