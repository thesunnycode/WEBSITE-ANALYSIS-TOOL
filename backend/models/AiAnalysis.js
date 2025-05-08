const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  websiteAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteAnalysis',
    required: true
  },
  uiuxAnalysis: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  readabilityAnalysis: {
    score: Number,
    readingLevel: String,
    suggestions: [String],
    complexPhrases: [String]
  },
  userBehaviorPrediction: {
    bounceRatePrediction: Number,
    engagementScore: Number,
    painPoints: [String],
    improvements: [String]
  },
  contentQuality: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  overallInsights: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AiAnalysis', aiAnalysisSchema);