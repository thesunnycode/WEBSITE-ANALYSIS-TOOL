const SeoAnalysis = require("../models/SeoAnalysis");
const seoAnalyzer = require("../utils/seoAnalyzer");
const logger = require("../utils/logger");

exports.analyzeSEO = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    logger.info("Starting SEO analysis", {
      websiteAnalysisId,
      url,
    });

    const seoData = await seoAnalyzer.analyze(url);

    const seoAnalysis = await SeoAnalysis.create({
      websiteAnalysis: websiteAnalysisId,
      ...seoData,
    });

    logger.info("SEO analysis completed", {
      analysisId: seoAnalysis._id,
      url,
      score: seoData.overallScore,
    });

    res.status(201).json({
      success: true,
      data: seoAnalysis,
    });
  } catch (error) {
    logger.error("SEO analysis failed", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: "Error performing SEO analysis",
    });
  }
};

exports.getSEOAnalysis = async (req, res) => {
  try {
    const analysis = await SeoAnalysis.findById(req.params.id).populate(
      "websiteAnalysis"
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "SEO analysis not found",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error("Error retrieving SEO analysis", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Error retrieving SEO analysis",
    });
  }
};

exports.getSEOHistory = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const analyses = await SeoAnalysis.find({
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
    logger.error("Error retrieving SEO history", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Error retrieving SEO history",
    });
  }
};
