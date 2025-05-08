const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const WebsiteAnalysis = require("../models/WebsiteAnalysis");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// @desc    Analyze website with AI
// @route   POST /api/v1/ai/:websiteAnalysisId/analyze
// @access  Private/Admin
exports.analyzeWithAI = asyncHandler(async (req, res, next) => {
  const { websiteAnalysisId } = req.params;
  const { url, content, metrics } = req.body;

  logger.info("Starting AI analysis", {
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
    // Prepare the prompt for Gemini
    const prompt = `Analyze this website data and provide comprehensive insights:
    URL: ${url}
    Content: ${content}
    Performance Metrics: ${JSON.stringify(metrics, null, 2)}
    
    Please provide:
    1. Overall assessment
    2. Key strengths
    3. Areas for improvement
    4. Specific recommendations
    5. Technical insights
    6. SEO recommendations
    7. Performance optimization suggestions
    8. Security considerations
    
    Format the response in a structured way with clear sections.`;

    // Generate AI insights
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Parse and structure the AI response
    const aiInsights = {
      timestamp: new Date(),
      analysis: aiResponse,
      summary: extractSummary(aiResponse),
      recommendations: extractRecommendations(aiResponse),
      technicalInsights: extractTechnicalInsights(aiResponse),
    };

    // Update the analysis with AI insights
    analysis.results = {
      ...analysis.results,
      ai: aiInsights,
    };
    await analysis.save();

    logger.info("AI analysis completed", {
      analysisId: websiteAnalysisId,
      insightsLength: aiResponse.length,
    });

    res.status(200).json({
      success: true,
      data: aiInsights,
    });
  } catch (error) {
    logger.error("AI analysis failed", {
      analysisId: websiteAnalysisId,
      error: error.message,
    });
    return next(new ErrorResponse("Failed to generate AI insights", 500));
  }
});

// @desc    Get AI analysis
// @route   GET /api/v1/ai/:id
// @access  Private
exports.getAIAnalysis = asyncHandler(async (req, res, next) => {
  const analysis = await WebsiteAnalysis.findById(req.params.id);

  if (!analysis) {
    return next(new ErrorResponse("Analysis not found", 404));
  }

  if (!analysis.results?.ai) {
    return next(new ErrorResponse("AI analysis not found", 404));
  }

  res.status(200).json({
    success: true,
    data: analysis.results.ai,
  });
});

// @desc    Get AI analysis history
// @route   GET /api/v1/ai/:websiteAnalysisId/history
// @access  Private
exports.getAIHistory = asyncHandler(async (req, res, next) => {
  const analyses = await WebsiteAnalysis.find({
    user: req.user._id,
    "results.ai": { $exists: true },
  })
    .select("results.ai createdAt url")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: analyses.length,
    data: analyses,
  });
});

// Helper functions to parse AI response
function extractSummary(aiResponse) {
  // Extract the overall assessment and key points
  const summaryMatch = aiResponse.match(
    /Overall assessment:(.*?)(?=Key strengths:|$)/s
  );
  return summaryMatch ? summaryMatch[1].trim() : "";
}

function extractRecommendations(aiResponse) {
  // Extract specific recommendations
  const recommendationsMatch = aiResponse.match(
    /Specific recommendations:(.*?)(?=Technical insights:|$)/s
  );
  if (!recommendationsMatch) return [];

  return recommendationsMatch[1]
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());
}

function extractTechnicalInsights(aiResponse) {
  // Extract technical insights
  const technicalMatch = aiResponse.match(
    /Technical insights:(.*?)(?=SEO recommendations:|$)/s
  );
  if (!technicalMatch) return [];

  return technicalMatch[1]
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());
}
