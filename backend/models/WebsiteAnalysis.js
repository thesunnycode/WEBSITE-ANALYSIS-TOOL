const mongoose = require("mongoose");

const websiteAnalysisSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    selectedOptions: [
      {
        type: String,
        enum: [
          "performance",
          "security",
          "seo",
          "uptime",
          "ai_insights",
          "accessibility",
        ],
      },
    ],
    results: {
      performance: {
        score: Number,
        metrics: {
          loadTime: Number,
          firstContentfulPaint: Number,
          speedIndex: Number,
        },
      },
      security: {
        score: Number,
        issues: [
          {
            severity: {
              type: String,
              enum: ["critical", "high", "medium", "low"],
            },
            description: String,
            recommendation: String,
          },
        ],
      },
      seo: {
        score: Number,
        issues: [
          {
            severity: {
              type: String,
              enum: ["high", "medium", "low"],
            },
            description: String,
            recommendation: String,
          },
        ],
      },
      accessibility: {
        score: Number,
        wcagCompliance: {
          level: {
            type: String,
            enum: ["A", "AA", "AAA"],
          },
          percentage: Number,
          status: {
            type: String,
            enum: ["compliant", "partial", "non-compliant"],
          },
        },
        issuesByPriority: {
          high: Number,
          medium: Number,
          low: Number,
        },
        issues: [
          {
            type: String,
            description: String,
            priority: {
              type: String,
              enum: ["high", "medium", "low"],
            },
            wcagGuideline: String,
            affectedElements: [
              {
                selector: String,
                html: String,
              },
            ],
            remediation: {
              steps: [String],
              resources: [
                {
                  title: String,
                  url: String,
                },
              ],
            },
          },
        ],
      },
      uptime: {
        score: Number,
        metrics: {
          availability: Number,
          responseTime: Number,
        },
      },
      ai_insights: {
        score: Number,
        summary: String,
        recommendations: [
          {
            category: String,
            description: String,
            priority: {
              type: String,
              enum: ["high", "medium", "low"],
            },
          },
        ],
        insights: [
          {
            aspect: String,
            analysis: String,
            suggestions: [String],
          },
        ],
      },
    },
    error: String,
    lastAnalyzed: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    performanceAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerformanceAnalysis",
    },
    seoAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeoAnalysis",
    },
    accessibilityAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessibilityAnalysis",
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiAnalysis",
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for analysis history
websiteAnalysisSchema.virtual("performanceHistory", {
  ref: "PerformanceAnalysis",
  localField: "_id",
  foreignField: "websiteAnalysis",
});

websiteAnalysisSchema.virtual("seoHistory", {
  ref: "SeoAnalysis",
  localField: "_id",
  foreignField: "websiteAnalysis",
});

websiteAnalysisSchema.virtual("accessibilityHistory", {
  ref: "AccessibilityAnalysis",
  localField: "_id",
  foreignField: "websiteAnalysis",
});

websiteAnalysisSchema.virtual("aiHistory", {
  ref: "AiAnalysis",
  localField: "_id",
  foreignField: "websiteAnalysis",
});

// Calculate overall score before saving
websiteAnalysisSchema.pre("save", async function (next) {
  if (
    this.performanceAnalysis &&
    this.seoAnalysis &&
    this.accessibilityAnalysis &&
    this.aiAnalysis
  ) {
    const analyses = await Promise.all([
      this.model("PerformanceAnalysis").findById(this.performanceAnalysis),
      this.model("SeoAnalysis").findById(this.seoAnalysis),
      this.model("AccessibilityAnalysis").findById(this.accessibilityAnalysis),
      this.model("AiAnalysis").findById(this.aiAnalysis),
    ]);

    const scores = analyses.map((analysis) => analysis?.overallScore || 0);
    this.overallScore = Math.round(
      scores.reduce((acc, score) => acc + score, 0) / scores.length
    );
    this.status = "completed";
  }
  next();
});

module.exports = mongoose.model("WebsiteAnalysis", websiteAnalysisSchema);
