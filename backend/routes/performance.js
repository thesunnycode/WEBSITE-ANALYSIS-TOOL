const express = require("express");
const router = express.Router();
const {
  analyzePerformance,
  getPerformanceAnalysis,
  getWebsitePerformanceHistory,
  comparePerformance,
} = require("../controllers/performanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post(
  "/:websiteAnalysisId/analyze",
  authorize("admin", "user"),
  analyzePerformance
);
router.get("/:id", authorize("admin", "user"), getPerformanceAnalysis);
router.get(
  "/:websiteAnalysisId/history",
  authorize("admin", "user"),
  getWebsitePerformanceHistory
);
router.get("/compare", authorize("admin", "user"), comparePerformance);

module.exports = router;
