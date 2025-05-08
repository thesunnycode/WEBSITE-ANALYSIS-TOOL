const AccessibilityAnalysis = require("../models/AccessibilityAnalysis");
const accessibilityAnalyzer = require("../utils/accessibilityAnalyzer");
const logger = require("../utils/logger");

exports.analyzeAccessibility = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    logger.info("Starting accessibility analysis", {
      websiteAnalysisId,
      url,
    });

    const accessibilityData = await accessibilityAnalyzer.analyze(url);

    // Debug logs
    console.log("AXE Violations:", accessibilityData.violations);
    console.log("AXE Score:", accessibilityData.overallScore);

    // Map violations to issues for frontend compatibility
    const issues = accessibilityData.violations
      ? accessibilityData.violations.map(v => ({
          impact: v.impact || "unknown",
          description: v.description,
          solution: v.help || "",
          wcagGuideline: v.helpUrl || "",
          priority: v.impact === "critical" ? "high" : 
                   v.impact === "serious" ? "high" :
                   v.impact === "moderate" ? "medium" : "low"
        }))
      : [];

    console.log("Mapped Issues:", issues);

    // --- Consistency Enforcement ---
    if (accessibilityData.overallScore < 100 && issues.length === 0) {
      issues.push({
        impact: "unknown",
        description: "Accessibility issue detected but no details were provided.",
        solution: "",
        wcagGuideline: "",
        priority: "medium"
      });
    }
    if (issues.length === 0) {
      accessibilityData.overallScore = 100;
    }
    // --- End Consistency Enforcement ---

    const accessibilityAnalysis = await AccessibilityAnalysis.create({
      websiteAnalysis: websiteAnalysisId,
      ...accessibilityData,
      issues: issues // Explicitly include the mapped issues
    });

    logger.info("Accessibility analysis completed", {
      analysisId: accessibilityAnalysis._id,
      url,
      score: accessibilityData.overallScore,
      issuesCount: issues.length
    });

    res.status(201).json({
      success: true,
      data: {
        ...accessibilityAnalysis.toObject(),
        issues: issues // Ensure issues are included in the response
      }
    });
  } catch (error) {
    logger.error("Accessibility analysis failed", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getAccessibilityAnalysis = async (req, res) => {
  try {
    const analysis = await AccessibilityAnalysis.findById(
      req.params.id
    ).populate("websiteAnalysis");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "Accessibility analysis not found",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error("Error retrieving accessibility analysis", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Error retrieving accessibility analysis",
    });
  }
};

exports.getAccessibilityHistory = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const analyses = await AccessibilityAnalysis.find({
      websiteAnalysis: websiteAnalysisId,
    })
      .sort("-createdAt")
      .populate("websiteAnalysis");

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    logger.error("Error retrieving accessibility history", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Error retrieving accessibility history",
    });
  }
};
