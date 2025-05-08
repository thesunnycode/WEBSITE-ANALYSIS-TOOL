const mongoose = require('mongoose');

const accessibilityAnalysisSchema = new mongoose.Schema({
  websiteAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteAnalysis',
    required: true
  },
  violations: [{
    id: String,
    impact: String,
    description: String,
    help: String,
    helpUrl: String,
    nodes: [{
      html: String,
      target: [String],
      failureSummary: String
    }]
  }],
  passes: [{
    id: String,
    description: String,
    nodes: [{
      html: String,
      target: [String]
    }]
  }],
  incomplete: [{
    id: String,
    impact: String,
    description: String,
    nodes: [{
      html: String,
      target: [String],
      failureSummary: String
    }]
  }],
  summary: {
    totalViolations: Number,
    criticalViolations: Number,
    seriousViolations: Number,
    moderateViolations: Number,
    minorViolations: Number,
    totalPasses: Number,
    totalIncomplete: Number
  },
  categories: {
    colorContrast: {
      score: Number,
      violations: [String],
      suggestions: [String]
    },
    keyboardNavigation: {
      score: Number,
      violations: [String],
      suggestions: [String]
    },
    screenReader: {
      score: Number,
      violations: [String],
      suggestions: [String]
    },
    ariaAttributes: {
      score: Number,
      violations: [String],
      suggestions: [String]
    }
  },
  overallScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AccessibilityAnalysis', accessibilityAnalysisSchema);