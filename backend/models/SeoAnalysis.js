const mongoose = require('mongoose');

const seoAnalysisSchema = new mongoose.Schema({
  websiteAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebsiteAnalysis',
    required: true
  },
  metaTags: {
    title: {
      content: String,
      length: Number,
      score: Number,
      suggestions: [String]
    },
    description: {
      content: String,
      length: Number,
      score: Number,
      suggestions: [String]
    },
    keywords: {
      content: [String],
      score: Number,
      suggestions: [String]
    }
  },
  headings: {
    h1: {
      count: Number,
      content: [String],
      score: Number,
      suggestions: [String]
    },
    h2: {
      count: Number,
      content: [String]
    },
    h3: {
      count: Number,
      content: [String]
    }
  },
  images: {
    total: Number,
    withAlt: Number,
    withoutAlt: Number,
    score: Number,
    suggestions: [String]
  },
  links: {
    internal: {
      count: Number,
      list: [{
        url: String,
        text: String
      }]
    },
    external: {
      count: Number,
      list: [{
        url: String,
        text: String
      }]
    },
    score: Number,
    suggestions: [String]
  },
  contentAnalysis: {
    wordCount: Number,
    readabilityScore: Number,
    keywordDensity: Map,
    suggestions: [String]
  },
  technicalSEO: {
    hasRobotsTxt: Boolean,
    hasSitemap: Boolean,
    isMobileFriendly: Boolean,
    hasSSL: Boolean,
    score: Number,
    suggestions: [String]
  },
  overallScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SeoAnalysis', seoAnalysisSchema); 