const PerformanceAnalysis = require('../models/PerformanceAnalysis');
const lighthouseAnalyzer = require('../utils/lighthouseAnalyzer');
const logger = require('../utils/logger');

exports.analyzePerformance = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    logger.info('Starting performance analysis', {
      websiteAnalysisId,
      url
    });

    const performanceData = await lighthouseAnalyzer.analyze(url);

    const performanceAnalysis = await PerformanceAnalysis.create({
      websiteAnalysis: websiteAnalysisId,
      ...performanceData
    });

    logger.info('Performance analysis completed and saved', {
      analysisId: performanceAnalysis._id,
      url,
      score: performanceData.performance.score
    });

    res.status(201).json({
      success: true,
      data: performanceAnalysis
    });
  } catch (error) {
    logger.error('Performance analysis failed', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Error performing performance analysis'
    });
  }
};

exports.getPerformanceAnalysis = async (req, res) => {
  try {
    const analysis = await PerformanceAnalysis.findById(req.params.id)
      .populate('websiteAnalysis');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Performance analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error retrieving performance analysis', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Error retrieving performance analysis'
    });
  }
};

exports.getWebsitePerformanceHistory = async (req, res) => {
  try {
    const { websiteAnalysisId } = req.params;
    const analyses = await PerformanceAnalysis.find({ 
      websiteAnalysis: websiteAnalysisId 
    })
    .sort('-createdAt')
    .populate('websiteAnalysis');

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    logger.error('Error retrieving performance history', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Error retrieving performance history'
    });
  }
};

exports.comparePerformance = async (req, res) => {
  try {
    const { analysisId1, analysisId2 } = req.query;

    const [analysis1, analysis2] = await Promise.all([
      PerformanceAnalysis.findById(analysisId1),
      PerformanceAnalysis.findById(analysisId2)
    ]);

    if (!analysis1 || !analysis2) {
      return res.status(404).json({
        success: false,
        error: 'One or both analyses not found'
      });
    }

    const comparison = {
      performanceScoreDiff: analysis2.performance.score - analysis1.performance.score,
      metrics: {
        loadTimeDiff: analysis2.performance.speedIndex - analysis1.performance.speedIndex,
        resourceSizeDiff: analysis2.resourceUsage.totalBytes - analysis1.resourceUsage.totalBytes,
        domSizeDiff: analysis2.metrics.domSize - analysis1.metrics.domSize
      },
      dates: {
        analysis1: analysis1.createdAt,
        analysis2: analysis2.createdAt
      }
    };

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error('Error comparing performance analyses', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Error comparing performance analyses'
    });
  }
}; 