const mongoose = require('mongoose');

const performanceAnalysisSchema = new mongoose.Schema({
  websiteAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteAnalysis',
    required: true
  },
  performance: {
    score: Number,
    firstContentfulPaint: Number,
    speedIndex: Number,
    largestContentfulPaint: Number,
    timeToInteractive: Number,
    totalBlockingTime: Number,
    cumulativeLayoutShift: Number
  },
  resourceUsage: {
    totalBytes: Number,
    jsBytes: Number,
    cssBytes: Number,
    imageBytes: Number,
    fontBytes: Number,
    otherBytes: Number,
    requests: Number
  },
  metrics: {
    serverResponseTime: Number,
    domSize: Number,
    bootupTime: Number,
    mainThreadWork: Number,
    resourceCount: Number
  },
  opportunities: [{
    title: String,
    description: String,
    savings: Number
  }],
  diagnostics: [{
    title: String,
    description: String,
    impact: String
  }],
  overallScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PerformanceAnalysis', performanceAnalysisSchema); 