const UptimeMonitor = require("../models/UptimeMonitor");
const UptimeCheck = require("../models/UptimeCheck");
const uptimeMonitor = require("../services/uptimeMonitor");
const logger = require("../utils/logger");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const WebsiteAnalysis = require("../models/WebsiteAnalysis");
const WebsiteScanner = require("../utils/websiteScanner");

exports.createMonitor = async (req, res) => {
  try {
    const monitor = await UptimeMonitor.create({
      ...req.body,
      user: req.user.id,
    });

    if (monitor.status === "active") {
      await uptimeMonitor.startMonitoring(monitor);
    }

    res.status(201).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    logger.error("Failed to create uptime monitor", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to create uptime monitor",
    });
  }
};

exports.getMonitors = async (req, res) => {
  try {
    const monitors = await UptimeMonitor.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: monitors.length,
      data: monitors,
    });
  } catch (error) {
    logger.error("Failed to get uptime monitors", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get uptime monitors",
    });
  }
};

exports.getMonitor = async (req, res) => {
  try {
    const monitor = await UptimeMonitor.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    logger.error("Failed to get uptime monitor", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get uptime monitor",
    });
  }
};

exports.updateMonitor = async (req, res) => {
  try {
    let monitor = await UptimeMonitor.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    // Stop monitoring if status changed to paused
    if (req.body.status === "paused" && monitor.status === "active") {
      await uptimeMonitor.stopMonitoring(monitor._id);
    }

    monitor = await UptimeMonitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Start monitoring if status changed to active
    if (req.body.status === "active" && monitor.status !== "active") {
      await uptimeMonitor.startMonitoring(monitor);
    }

    res.status(200).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    logger.error("Failed to update uptime monitor", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to update uptime monitor",
    });
  }
};

exports.deleteMonitor = async (req, res) => {
  try {
    const monitor = await UptimeMonitor.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    await uptimeMonitor.stopMonitoring(monitor._id);
    await monitor.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error("Failed to delete uptime monitor", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to delete uptime monitor",
    });
  }
};

exports.getMonitorStats = async (req, res) => {
  try {
    const monitor = await UptimeMonitor.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        error: "Monitor not found",
      });
    }

    const checks = await UptimeCheck.find({
      monitor: monitor._id,
    })
      .sort("-timestamp")
      .limit(100);

    res.status(200).json({
      success: true,
      data: {
        monitor,
        checks,
        stats: {
          uptime: monitor.stats.uptime,
          averageResponseTime: monitor.stats.averageResponseTime,
          lastDowntime: monitor.stats.lastDowntime,
        },
      },
    });
  } catch (error) {
    logger.error("Failed to get monitor stats", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get monitor stats",
    });
  }
};

// @desc    Analyze website uptime
// @route   POST /api/v1/uptime/:websiteAnalysisId/analyze
// @access  Private
exports.analyzeUptime = asyncHandler(async (req, res, next) => {
  const { websiteAnalysisId } = req.params;
  const { url } = req.body;

  logger.info("Starting uptime analysis", {
    analysisId: websiteAnalysisId,
    url,
    userId: req.user._id,
  });

  // Get the website analysis
  const analysis = await WebsiteAnalysis.findById(websiteAnalysisId);
  if (!analysis) {
    return next(new ErrorResponse("Analysis not found", 404));
  }

  try {
    const scanner = new WebsiteScanner();
    const uptimeResults = await scanner.analyzeUptime(url);

    // Update the analysis with uptime results
    analysis.results = {
      ...analysis.results,
      uptime: uptimeResults,
    };
    await analysis.save();

    logger.info("Uptime analysis completed", {
      analysisId: websiteAnalysisId,
      score: uptimeResults.score,
      responseTime: uptimeResults.metrics.responseTime,
    });

    res.status(200).json({
      success: true,
      data: uptimeResults,
    });
  } catch (error) {
    logger.error("Uptime analysis failed", {
      analysisId: websiteAnalysisId,
      error: error.message,
    });
    return next(new ErrorResponse("Failed to analyze uptime", 500));
  }
});
