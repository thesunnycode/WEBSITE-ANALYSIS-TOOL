const WebsiteAnalysis = require("../models/WebsiteAnalysis");
const WebsiteScanner = require("../utils/websiteScanner");
const logger = require("../utils/logger");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// Helper function to process analysis in the background
async function processAnalysis(analysisId, url, options, scanner) {
  try {
    logger.info("Starting analysis process", { analysisId, url, options });

    // Get the current analysis document
    const analysis = await WebsiteAnalysis.findById(analysisId);
    if (!analysis) {
      throw new Error("Analysis record not found");
    }

    // Initialize results object if it doesn't exist
    if (!analysis.results) {
      analysis.results = {};
    }

    // Perform the scan
    const scanResults = await scanner.scanWebsite(url, options);
    logger.info("Scan completed. Raw results:", {
      analysisId,
      results: JSON.stringify(scanResults),
    });

    // Update analysis with results
    if (scanResults && scanResults.results) {
      analysis.results = scanResults.results;

      // Calculate overall score from all analysis types that have scores
      const scores = Object.values(scanResults.results)
        .filter((result) => result && typeof result.score === "number" && !result.error)
        .map((result) => result.score);

      analysis.overallScore =
        scores.length > 0
          ? Math.round(
              scores.reduce((acc, score) => acc + score, 0) / scores.length
            )
          : 0;

      // Check if all requested analyses have results (even if some failed)
      const completedAnalyses = Object.keys(scanResults.results).length;
      const requestedAnalyses = options.length;

      // Update analysis status and save
      await WebsiteAnalysis.findByIdAndUpdate(
        analysisId,
        {
          status: "completed", // Always mark as completed since we have all possible results
          completedAt: new Date(),
          lastAnalyzed: new Date(),
          results: analysis.results,
          overallScore: analysis.overallScore
        },
        { new: true }
      );

      logger.info("Analysis saved successfully", {
        analysisId,
        status: "completed",
        results: JSON.stringify(analysis.results),
      });
    }
  } catch (error) {
    logger.error("Analysis processing failed", {
      error: error.message,
      stack: error.stack,
      analysisId,
      url,
    });

    // Update analysis with error status
    try {
      await WebsiteAnalysis.findByIdAndUpdate(
        analysisId,
        {
          status: "failed",
          error: error.message || "Unknown error occurred",
          lastAnalyzed: new Date(),
        },
        { new: true }
      );
    } catch (updateError) {
      logger.error("Failed to update analysis status", {
        error: updateError.message,
        analysisId,
      });
    }
  } finally {
    // Ensure scanner is properly closed
    try {
      await scanner.close();
      logger.info("Scanner closed successfully", { analysisId });
    } catch (closeError) {
      logger.error("Error closing scanner", {
        error: closeError.message,
        analysisId,
      });
    }
  }
}

// @desc    Analyze a website
// @route   POST /api/v1/website-analysis/analyze
// @access  Private
exports.analyzeWebsite = asyncHandler(async (req, res, next) => {
  const { url, options = [] } = req.body;

  if (!url) {
    logger.warn("Missing URL in analysis request");
    return next(new ErrorResponse("Please provide a URL to analyze", 400));
  }

  if (!options || !Array.isArray(options) || options.length === 0) {
    logger.warn("Missing or invalid analysis options");
    return next(
      new ErrorResponse("Please select at least one analysis option", 400)
    );
  }

  logger.info("Starting website analysis", {
    url,
    options,
    userId: req.user._id,
    role: req.user.role,
  });

  // Create initial analysis record
  const analysis = await WebsiteAnalysis.create({
    url,
    user: req.user._id,
    status: "pending",
    selectedOptions: options,
    results: {},
  });

  // Start the analysis process in the background
  const scanner = new WebsiteScanner();
  processAnalysis(analysis._id, url, options, scanner).catch((error) => {
    logger.error("Background analysis failed", {
      error: error.message,
      analysisId: analysis._id,
      userId: req.user._id,
    });
  });

  logger.info("Website analysis initiated", {
    analysisId: analysis._id,
    url,
    options,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: analysis,
  });
});

// @desc    Get a single analysis
// @route   GET /api/v1/website-analysis/:id
// @access  Private
exports.getAnalysis = asyncHandler(async (req, res, next) => {
  const analysis = await WebsiteAnalysis.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!analysis) {
    logger.warn("Analysis not found", {
      id: req.params.id,
      userId: req.user._id,
    });
    return next(new ErrorResponse("Analysis not found", 404));
  }

  logger.info("Analysis retrieved", {
    analysisId: analysis._id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

// @desc    Get all analyses for a user
// @route   GET /api/v1/website-analysis/history/all
// @access  Private
exports.getAnalysisHistory = asyncHandler(async (req, res, next) => {
  const analyses = await WebsiteAnalysis.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("url createdAt status results");

  res.status(200).json({
    success: true,
    analyses: analyses.map((analysis) => ({
      id: analysis._id,
      url: analysis.url,
      createdAt: analysis.createdAt,
      status: analysis.status,
      results: analysis.results || {},
    })),
  });
});

// @desc    Delete analysis
// @route   DELETE /api/v1/website-analysis/:id
// @access  Private
exports.deleteAnalysis = asyncHandler(async (req, res, next) => {
  logger.info("Attempting to delete analysis", {
    analysisId: req.params.id,
    userId: req.user._id,
  });

  const analysis = await WebsiteAnalysis.findById(req.params.id);

  if (!analysis) {
    logger.warn("Analysis not found for deletion", {
      analysisId: req.params.id,
      userId: req.user._id,
    });
    return next(new ErrorResponse("Analysis not found", 404));
  }

  // Make sure user owns analysis
  if (analysis.user.toString() !== req.user._id.toString()) {
    logger.warn("Unauthorized deletion attempt", {
      analysisId: req.params.id,
      userId: req.user._id,
      ownerUserId: analysis.user,
    });
    return next(
      new ErrorResponse("Not authorized to delete this analysis", 401)
    );
  }

  await analysis.deleteOne();

  logger.info("Analysis deleted successfully", {
    analysisId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
