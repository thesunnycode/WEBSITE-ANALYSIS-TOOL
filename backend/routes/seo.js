const express = require("express");
const router = express.Router();
const {
  analyzeSEO,
  getSEOAnalysis,
  getSEOHistory,
} = require("../controllers/seoController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post(
  "/:websiteAnalysisId/analyze",
  authorize("admin", "user"),
  analyzeSEO
);
router.get("/:id", authorize("admin", "user"), getSEOAnalysis);
router.get(
  "/:websiteAnalysisId/history",
  authorize("admin", "user"),
  getSEOHistory
);

module.exports = router;
