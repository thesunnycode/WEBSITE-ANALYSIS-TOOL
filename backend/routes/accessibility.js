const express = require('express');
const router = express.Router();
const {
  analyzeAccessibility,
  getAccessibilityAnalysis,
  getAccessibilityHistory
} = require('../controllers/accessibilityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/:websiteAnalysisId/analyze', authorize('admin', 'user'), analyzeAccessibility);
router.get('/:id', authorize('admin', 'user'), getAccessibilityAnalysis);
router.get('/:websiteAnalysisId/history', authorize('admin', 'user'), getAccessibilityHistory);

module.exports = router; 