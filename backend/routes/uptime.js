const express = require("express");
const router = express.Router();
const {
  createMonitor,
  getMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  getMonitorStats,
  analyzeUptime,
} = require("../controllers/uptimeController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.route("/").post(authorize("admin"), createMonitor).get(getMonitors);

router
  .route("/:id")
  .get(getMonitor)
  .put(authorize("admin"), updateMonitor)
  .delete(authorize("admin"), deleteMonitor);

router.get("/:id/stats", getMonitorStats);

// Add the analyze endpoint
router.post(
  "/:websiteAnalysisId/analyze",
  authorize("admin", "user"),
  analyzeUptime
);

module.exports = router;
