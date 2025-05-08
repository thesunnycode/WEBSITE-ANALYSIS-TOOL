const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  analyzeWebsite,
  getAnalysis,
  getAnalysisHistory,
  deleteAnalysis,
} = require("../controllers/websiteAnalysisController");

router.use(protect);

// Create a new analysis
router.post("/analyze", authorize("admin", "user"), analyzeWebsite);

// Get analysis history (must come before /:id route)
router.get("/history", authorize("admin", "user"), getAnalysisHistory);

// Get analysis by ID
router.get("/:id", authorize("admin", "user"), getAnalysis);

// Delete analysis
router.delete("/:id", authorize("admin", "user"), deleteAnalysis);

module.exports = router;
