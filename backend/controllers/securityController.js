const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const WebsiteAnalysis = require("../models/WebsiteAnalysis");
const WebsiteScanner = require("../utils/websiteScanner");
const logger = require("../utils/logger");

// @desc    Analyze website security
// @route   POST /api/v1/security/:websiteAnalysisId/analyze
// @access  Private
exports.analyzeSecurity = asyncHandler(async (req, res, next) => {
  const { websiteAnalysisId } = req.params;
  const { url } = req.body;

  logger.info("Starting security analysis", {
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
    const securityResults = await scanner.analyzeSecurity(url);

    // Update the analysis with security results
    analysis.results = {
      ...analysis.results,
      security: securityResults,
    };
    await analysis.save();

    logger.info("Security analysis completed", {
      analysisId: websiteAnalysisId,
      score: securityResults.score,
      issuesCount: securityResults.issues.length,
    });

    res.status(200).json({
      success: true,
      data: securityResults,
    });
  } catch (error) {
    logger.error("Security analysis failed", {
      analysisId: websiteAnalysisId,
      error: error.message,
    });
    return next(new ErrorResponse("Failed to analyze security", 500));
  }
});
