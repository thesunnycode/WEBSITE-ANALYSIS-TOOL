const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { analyzeAiInsights } = require("../controllers/aiInsightsController");

// Route for AI insights analysis
router.post("/:websiteAnalysisId/analyze", protect, authorize('admin', 'user'), analyzeAiInsights);

module.exports = router;
