const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const WebsiteAnalysis = require("../models/WebsiteAnalysis");
const AiAnalysis = require("../models/AiAnalysis");
const logger = require("../utils/logger");
const puppeteer = require("puppeteer");

// @desc    Analyze website with AI insights
// @route   POST /api/v1/ai-insights/:websiteAnalysisId/analyze
// @access  Private
exports.analyzeAiInsights = asyncHandler(async (req, res, next) => {
  const { websiteAnalysisId } = req.params;
  const { url } = req.body;

  if (!url) {
    return next(new ErrorResponse("URL is required", 400));
  }

  logger.info("Starting AI insights analysis", {
    analysisId: websiteAnalysisId,
    url,
    userId: req.user._id,
  });

  const analysis = await WebsiteAnalysis.findById(websiteAnalysisId);
  if (!analysis) {
    return next(new ErrorResponse("Analysis not found", 404));
  }

  try {
    // Launch browser for detailed analysis
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL with a timeout
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 300000,
    });

    // Collect comprehensive website data
    const websiteData = await page.evaluate(() => {
      const data = {
        title: document.title,
        metaDescription:
          document.querySelector('meta[name="description"]')?.content || "",
        h1Tags: Array.from(document.querySelectorAll("h1")).map(
          (h) => h.innerText
        ),
        paragraphs: Array.from(document.querySelectorAll("p")).map(
          (p) => p.innerText
        ),
        images: Array.from(document.querySelectorAll("img")).map((img) => ({
          alt: img.alt,
          src: img.src,
        })),
        links: Array.from(document.querySelectorAll("a")).map((a) => ({
          text: a.innerText,
          href: a.href,
        })),
        forms: Array.from(document.querySelectorAll("form")).length,
        buttons: Array.from(document.querySelectorAll("button")).map(
          (b) => b.innerText
        ),
        socialLinks: Array.from(
          document.querySelectorAll(
            'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'
          )
        ).length,
        navigationItems: Array.from(
          document.querySelectorAll("nav a, header a")
        ).map((n) => n.innerText),
        footerContent: document.querySelector("footer")?.innerText || "",
        hasChat:
          document.querySelector(
            '[class*="chat"], [id*="chat"], [class*="messenger"]'
          ) !== null,
        hasNewsletter:
          document.querySelector(
            'input[type="email"], [class*="newsletter"], [id*="newsletter"]'
          ) !== null,
        hasPricing:
          document.querySelector('[class*="price"], [id*="price"]') !== null,
        hasTestimonials:
          document.querySelector(
            '[class*="testimonial"], [id*="testimonial"], [class*="review"], [id*="review"]'
          ) !== null,
        hasContactForm:
          document.querySelector(
            'form:not([class*="search"], [class*="newsletter"])'
          ) !== null,
        colorScheme: {
          backgroundColor: window.getComputedStyle(document.body)
            .backgroundColor,
          textColor: window.getComputedStyle(document.body).color,
        },
        fontStyles: {
          headingFont: window.getComputedStyle(
            document.querySelector("h1") || document.body
          ).fontFamily,
          bodyFont: window.getComputedStyle(document.body).fontFamily,
        },
      };

      // Detect website type based on content
      const content = document.body.innerText.toLowerCase();
      const keywords = {
        ecommerce: ["shop", "cart", "product", "buy", "price"],
        business: ["services", "solutions", "clients", "business", "company"],
        education: ["courses", "students", "learning", "education", "training"],
        portfolio: ["portfolio", "work", "projects", "gallery", "showcase"],
        blog: ["blog", "article", "post", "author", "comments"],
        nonprofit: ["donate", "charity", "cause", "volunteer", "mission"],
      };

      data.websiteType = Object.entries(keywords).reduce(
        (type, [key, words]) => {
          const matches = words.filter((word) => content.includes(word)).length;
          return matches > (type.matches || 0) ? { type: key, matches } : type;
        },
        { type: "general", matches: 0 }
      ).type;

      return data;
    });

    // Close browser
    await browser.close();

    // Analyze the collected data
    const contentScore = calculateContentScore(websiteData);
    const uxScore = calculateUXScore(websiteData);
    const engagementScore = calculateEngagementScore(websiteData);
    const brandingScore = calculateBrandingScore(websiteData);

    const scores = {
      content: contentScore,
      ux: uxScore,
      engagement: engagementScore,
      branding: brandingScore,
      overall: Math.round(
        (contentScore + uxScore + engagementScore + brandingScore) / 4
      ),
    };

    // Generate insights based on website type and collected data
    const insights = generateContextualInsights(websiteData, scores);
    const recommendations = generatePrioritizedRecommendations(
      websiteData,
      scores
    );
    const competitiveAnalysis = generateCompetitiveAnalysis(websiteData);
    const conversionOptimization = generateConversionOptimization(websiteData);

    const aiResults = {
      score: scores.overall,
      websiteType: websiteData.websiteType,
      summary: generateContextualSummary(websiteData, scores),
      recommendations: recommendations,
      insights: [
        {
          aspect: "Content Strategy",
          analysis: insights.content,
          suggestions: insights.contentSuggestions,
        },
        {
          aspect: "User Experience",
          analysis: insights.ux,
          suggestions: insights.uxSuggestions,
        },
        {
          aspect: "Engagement & Conversion",
          analysis: insights.engagement,
          suggestions: insights.engagementSuggestions,
        },
        {
          aspect: "Branding & Visual Identity",
          analysis: insights.branding,
          suggestions: insights.brandingSuggestions,
        },
        {
          aspect: "Competitive Edge",
          analysis: competitiveAnalysis.analysis,
          suggestions: competitiveAnalysis.suggestions,
        },
        {
          aspect: "Conversion Optimization",
          analysis: conversionOptimization.analysis,
          suggestions: conversionOptimization.suggestions,
        },
      ],
    };

    // Create AI Analysis record
    const aiAnalysis = await AiAnalysis.create({
      websiteAnalysis: websiteAnalysisId,
      websiteType: websiteData.websiteType,
      contentAnalysis: {
        score: scores.content,
        strengths: insights.contentStrengths,
        weaknesses: insights.contentWeaknesses,
        suggestions: insights.contentSuggestions,
      },
      uxAnalysis: {
        score: scores.ux,
        strengths: insights.uxStrengths,
        weaknesses: insights.uxWeaknesses,
        suggestions: insights.uxSuggestions,
      },
      engagementAnalysis: {
        score: scores.engagement,
        strengths: insights.engagementStrengths,
        weaknesses: insights.engagementWeaknesses,
        suggestions: insights.engagementSuggestions,
      },
      brandingAnalysis: {
        score: scores.branding,
        strengths: insights.brandingStrengths,
        weaknesses: insights.brandingWeaknesses,
        suggestions: insights.brandingSuggestions,
      },
      competitiveAnalysis: competitiveAnalysis,
      conversionOptimization: conversionOptimization,
      overallScore: scores.overall,
    });

    // Update the website analysis with AI results
    analysis.results.ai_insights = aiResults;
    analysis.aiAnalysis = aiAnalysis._id;
    await analysis.save();

    logger.info("AI insights analysis completed", {
      analysisId: websiteAnalysisId,
      score: aiResults.score,
      websiteType: websiteData.websiteType,
    });

    res.status(200).json({
      success: true,
      data: aiResults,
    });
  } catch (error) {
    logger.error("AI insights analysis failed", {
      analysisId: websiteAnalysisId,
      error: error.message,
    });
    return next(new ErrorResponse("Failed to analyze AI insights", 500));
  }
});

function calculateContentScore(data) {
  let score = 100;

  // Title quality
  if (!data.title) score -= 10;
  else if (data.title.length < 20 || data.title.length > 60) score -= 5;

  // Meta description
  if (!data.metaDescription) score -= 10;
  else if (
    data.metaDescription.length < 120 ||
    data.metaDescription.length > 160
  )
    score -= 5;

  // Content structure
  if (data.h1Tags.length === 0) score -= 10;
  if (data.h1Tags.length > 1) score -= 5;
  if (data.paragraphs.length < 5) score -= 10;

  // Image optimization
  const imagesWithoutAlt = data.images.filter((img) => !img.alt).length;
  if (imagesWithoutAlt > 0) score -= Math.min(10, imagesWithoutAlt * 2);

  return Math.max(0, Math.min(100, score));
}

function calculateUXScore(data) {
  let score = 100;

  // Navigation
  if (data.navigationItems.length < 3) score -= 15;
  if (data.navigationItems.length > 8) score -= 10;

  // Forms and interaction
  if (!data.hasContactForm) score -= 10;
  if (data.forms === 0) score -= 5;

  // Mobile-friendly elements
  if (data.buttons.length === 0) score -= 10;

  // Social proof
  if (!data.hasTestimonials) score -= 10;

  // Communication channels
  if (!data.hasChat && !data.hasContactForm) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function calculateEngagementScore(data) {
  let score = 100;

  // Social media presence
  if (data.socialLinks === 0) score -= 15;

  // Call-to-actions
  if (data.buttons.length < 3) score -= 10;

  // Newsletter/Lead capture
  if (!data.hasNewsletter) score -= 10;

  // Content engagement
  if (data.paragraphs.length < 3) score -= 15;

  // Interactive elements
  if (!data.hasChat) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function calculateBrandingScore(data) {
  let score = 100;

  // Visual consistency
  if (!data.colorScheme.backgroundColor || !data.colorScheme.textColor)
    score -= 15;

  // Typography
  if (data.fontStyles.headingFont === data.fontStyles.bodyFont) score -= 10;

  // Logo and identity
  const hasLogo = data.images.some(
    (img) =>
      img.alt?.toLowerCase().includes("logo") ||
      img.src?.toLowerCase().includes("logo")
  );
  if (!hasLogo) score -= 15;

  // Brand messaging
  if (!data.metaDescription) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function generateContextualInsights(data, scores) {
  const insights = {
    content: "",
    ux: "",
    engagement: "",
    branding: "",
    contentSuggestions: [],
    uxSuggestions: [],
    engagementSuggestions: [],
    brandingSuggestions: [],
    contentStrengths: [],
    contentWeaknesses: [],
    uxStrengths: [],
    uxWeaknesses: [],
    engagementStrengths: [],
    engagementWeaknesses: [],
    brandingStrengths: [],
    brandingWeaknesses: [],
  };

  // Content Analysis
  if (scores.content >= 80) {
    insights.contentStrengths.push("Strong content structure and optimization");
    insights.content =
      "Your content is well-structured and optimized for both users and search engines.";
  } else if (scores.content >= 60) {
    insights.contentWeaknesses.push("Room for content improvement");
    insights.content =
      "Your content shows potential but needs some optimization to reach its full impact.";
    insights.contentSuggestions.push(
      "Enhance your meta descriptions for better click-through rates",
      "Add more descriptive alt text to images",
      "Improve heading hierarchy for better content structure"
    );
  } else {
    insights.contentWeaknesses.push("Significant content improvements needed");
    insights.content =
      "Your content requires substantial improvements to effectively communicate your message.";
    insights.contentSuggestions.push(
      "Develop a comprehensive content strategy",
      "Create more engaging and informative content",
      "Optimize all meta tags and descriptions"
    );
  }

  // UX Analysis based on website type
  switch (data.websiteType) {
    case "ecommerce":
      insights.ux = analyzeEcommerceUX(data, insights);
      break;
    case "education":
      insights.ux = analyzeEducationUX(data, insights);
      break;
    case "business":
      insights.ux = analyzeBusinessUX(data, insights);
      break;
    case "portfolio":
      insights.ux = analyzePortfolioUX(data, insights);
      break;
    default:
      insights.ux = analyzeGeneralUX(data, insights);
  }

  // Engagement Analysis
  insights.engagement = analyzeEngagement(data, scores.engagement, insights);

  // Branding Analysis
  insights.branding = analyzeBranding(data, scores.branding, insights);

  return insights;
}

function analyzeEcommerceUX(data, insights) {
  if (!data.hasPricing) {
    insights.uxWeaknesses.push("Missing clear pricing information");
    insights.uxSuggestions.push(
      "Add clear pricing information for all products"
    );
  }

  if (data.forms === 0) {
    insights.uxWeaknesses.push("No purchase forms found");
    insights.uxSuggestions.push("Implement easy-to-use purchase forms");
  }

  return "Your e-commerce platform's user experience focuses on converting visitors into customers through streamlined shopping processes.";
}

function analyzeEducationUX(data, insights) {
  const hasLearningPaths = data.navigationItems.some(
    (item) =>
      item.toLowerCase().includes("course") ||
      item.toLowerCase().includes("learn") ||
      item.toLowerCase().includes("study")
  );

  if (!hasLearningPaths) {
    insights.uxWeaknesses.push("Unclear learning pathways");
    insights.uxSuggestions.push("Create clear learning paths for students");
  }

  return "Your educational platform's user experience emphasizes accessible learning resources and clear progression paths.";
}

function analyzeBusinessUX(data, insights) {
  if (!data.hasContactForm) {
    insights.uxWeaknesses.push("Missing contact opportunities");
    insights.uxSuggestions.push(
      "Add multiple contact points for potential clients"
    );
  }

  if (!data.hasTestimonials) {
    insights.uxWeaknesses.push("Missing social proof");
    insights.uxSuggestions.push(
      "Showcase client testimonials and case studies"
    );
  }

  return "Your business website's user experience focuses on converting visitors into leads through clear value propositions and trust signals.";
}

function analyzePortfolioUX(data, insights) {
  const hasGallery = data.images.length > 5;

  if (!hasGallery) {
    insights.uxWeaknesses.push("Limited visual showcase");
    insights.uxSuggestions.push(
      "Expand your portfolio with more visual content"
    );
  }

  return "Your portfolio's user experience emphasizes visual impact and professional presentation of your work.";
}

function analyzeGeneralUX(data, insights) {
  if (data.navigationItems.length > 7) {
    insights.uxWeaknesses.push("Complex navigation");
    insights.uxSuggestions.push(
      "Simplify navigation for better user experience"
    );
  }

  return "Your website's user experience focuses on providing clear information and easy navigation for visitors.";
}

function analyzeEngagement(data, score, insights) {
  if (score >= 80) {
    insights.engagementStrengths.push("Strong engagement elements");
    return "Your website effectively engages visitors with multiple interaction points and clear calls-to-action.";
  } else {
    insights.engagementWeaknesses.push("Limited engagement opportunities");
    insights.engagementSuggestions.push(
      "Add more interactive elements",
      "Implement social sharing features",
      "Create compelling calls-to-action"
    );
    return "Your website needs more engagement elements to effectively convert visitors into active users.";
  }
}

function analyzeBranding(data, score, insights) {
  if (score >= 80) {
    insights.brandingStrengths.push("Strong brand identity");
    return "Your website maintains a consistent and professional brand identity throughout.";
  } else {
    insights.brandingWeaknesses.push("Inconsistent branding");
    insights.brandingSuggestions.push(
      "Develop a consistent color scheme",
      "Implement professional typography",
      "Strengthen visual brand identity"
    );
    return "Your website's branding needs improvement to create a more professional and memorable impression.";
  }
}

function generateContextualSummary(data, scores) {
  const strengthsCount = Object.values(scores).filter(
    (score) => score >= 80
  ).length;
  const weaknessesCount = Object.values(scores).filter(
    (score) => score < 60
  ).length;

  let summary = `As a ${data.websiteType} website, your platform `;

  if (strengthsCount > 2) {
    summary +=
      "demonstrates strong performance in multiple areas, particularly in ";
    if (scores.content >= 80) summary += "content quality, ";
    if (scores.ux >= 80) summary += "user experience, ";
    if (scores.engagement >= 80) summary += "user engagement, ";
    if (scores.branding >= 80) summary += "brand presentation, ";
    summary = summary.slice(0, -2) + ". ";
  } else if (weaknessesCount > 2) {
    summary += "has significant opportunities for improvement, especially in ";
    if (scores.content < 60) summary += "content strategy, ";
    if (scores.ux < 60) summary += "user experience, ";
    if (scores.engagement < 60) summary += "engagement features, ";
    if (scores.branding < 60) summary += "brand identity, ";
    summary = summary.slice(0, -2) + ". ";
  } else {
    summary +=
      "shows balanced performance with both strengths and areas for improvement. ";
  }

  summary += generateTypeSpecificInsight(data.websiteType, scores);

  return summary;
}

function generateTypeSpecificInsight(websiteType, scores) {
  switch (websiteType) {
    case "ecommerce":
      return "Focus on optimizing your conversion funnel and showcasing products effectively to drive sales.";
    case "education":
      return "Emphasize clear learning paths and accessible educational content to engage students.";
    case "business":
      return "Strengthen your professional credibility and make it easier for potential clients to connect.";
    case "portfolio":
      return "Showcase your work more effectively and create compelling calls-to-action for potential clients.";
    case "blog":
      return "Enhance content engagement and build a stronger community around your content.";
    case "nonprofit":
      return "Clarify your mission and make it easier for supporters to contribute to your cause.";
    default:
      return "Focus on your core message and make it easier for visitors to take desired actions.";
  }
}

function generateCompetitiveAnalysis(data) {
  return {
    analysis: `Based on industry standards for ${
      data.websiteType
    } websites, your site ${
      data.hasTestimonials ? "effectively leverages" : "could better utilize"
    } social proof and ${
      data.hasNewsletter ? "implements" : "should consider implementing"
    } lead generation strategies.`,
    suggestions: [
      "Research competitor features and offerings",
      "Identify unique value propositions",
      "Implement industry best practices",
      "Monitor competitor strategies",
    ],
  };
}

function generateConversionOptimization(data) {
  const analysis = {
    analysis: "Your website's conversion optimization strategy ",
    suggestions: [],
  };

  // Analyze conversion elements
  if (!data.hasContactForm && !data.hasNewsletter) {
    analysis.analysis +=
      "needs significant improvement in lead capture mechanisms. ";
    analysis.suggestions.push(
      "Implement strategic contact forms",
      "Add newsletter subscription options",
      "Create compelling calls-to-action"
    );
  } else if (data.hasContactForm && data.hasNewsletter) {
    analysis.analysis += "includes multiple effective lead capture points. ";
    analysis.suggestions.push(
      "A/B test form placements",
      "Optimize form fields for higher conversion",
      "Enhance call-to-action messaging"
    );
  } else {
    analysis.analysis +=
      "has some effective elements but could be strengthened. ";
    analysis.suggestions.push(
      "Add more conversion opportunities",
      "Optimize existing forms",
      "Implement exit-intent strategies"
    );
  }

  return analysis;
}

function generatePrioritizedRecommendations(data, scores) {
  const recommendations = [];

  // High Priority Recommendations
  if (scores.content < 60) {
    recommendations.push({
      category: "Content Strategy",
      description: "Implement comprehensive content optimization",
      priority: "high",
    });
  }

  if (scores.ux < 60) {
    recommendations.push({
      category: "User Experience",
      description: `Improve ${data.websiteType}-specific user experience elements`,
      priority: "high",
    });
  }

  // Medium Priority Recommendations
  if (scores.engagement < 80) {
    recommendations.push({
      category: "Engagement",
      description: "Enhance user interaction opportunities",
      priority: "medium",
    });
  }

  if (scores.branding < 80) {
    recommendations.push({
      category: "Branding",
      description: "Strengthen brand identity and consistency",
      priority: "medium",
    });
  }

  // Low Priority Recommendations
  if (!data.hasNewsletter) {
    recommendations.push({
      category: "Lead Generation",
      description: "Implement newsletter subscription",
      priority: "low",
    });
  }

  if (data.socialLinks === 0) {
    recommendations.push({
      category: "Social Proof",
      description: "Add social media integration",
      priority: "low",
    });
  }

  return recommendations;
}
