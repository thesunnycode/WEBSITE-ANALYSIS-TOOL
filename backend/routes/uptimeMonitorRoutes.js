const express = require("express");
const router = express.Router();
const uptimeMonitorController = require("../controllers/uptimeMonitorController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected and require authentication
router.use(protect);

// Basic CRUD operations
router.post("/", uptimeMonitorController.createMonitor);
router.get("/", uptimeMonitorController.getMonitors);
router.get("/:id", uptimeMonitorController.getMonitor);
router.put("/:id", uptimeMonitorController.updateMonitor);
router.delete("/:id", uptimeMonitorController.deleteMonitor);

// Monitor operations
router.post("/:id/check", uptimeMonitorController.runCheck);
router.get("/:id/history", uptimeMonitorController.getHistory);
router.put("/:id/maintenance", uptimeMonitorController.toggleMaintenance);

// Downtime cost calculator
router.get("/:id/downtime-cost", uptimeMonitorController.calculateDowntimeCost);
router.put("/:id/traffic-stats", uptimeMonitorController.updateTrafficStats);

// Benchmark comparison
router.get("/:id/benchmarks", uptimeMonitorController.getBenchmarks);
router.put("/:id/benchmarks/industry", uptimeMonitorController.updateIndustryBenchmark);

// Status page
router.get("/:id/status-page", uptimeMonitorController.getStatusPageData);
router.put("/:id/status-page", uptimeMonitorController.updateStatusPage);
router.get("/status/:publicToken", uptimeMonitorController.getPublicStatusPage);

module.exports = router; 