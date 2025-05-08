const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { analyzeSecurity } = require("../controllers/securityController");

router.use(protect);

router.post(
  "/:websiteAnalysisId/analyze",
  authorize("admin", "user"),
  analyzeSecurity
);

module.exports = router;
