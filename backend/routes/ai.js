const express = require('express');
const router = express.Router();
const {
  analyzeWithAI,
  getAIAnalysis,
  getAIHistory
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/:websiteAnalysisId/analyze', authorize('admin'), analyzeWithAI);
router.get('/:id', authorize('admin', 'user'), getAIAnalysis);
router.get('/:websiteAnalysisId/history', authorize('admin', 'user'), getAIHistory);

module.exports = router; 