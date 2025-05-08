const puppeteer = require("puppeteer");
const lighthouseAnalyzer = require("./lighthouseAnalyzer");
const logger = require("./logger");
const accessibilityAnalyzer = require("./accessibilityAnalyzer");
const axios = require("axios");

class WebsiteScanner {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
    }
  }

  async close() {
    if (this.page) {
      await this.page
        .close()
        .catch((err) => logger.error("Error closing page:", err));
      this.page = null;
    }
    if (this.browser) {
      await this.browser
        .close()
        .catch((err) => logger.error("Error closing browser:", err));
      this.browser = null;
    }
  }

  async analyzePerformance(url) {
    try {
      await this.initialize();
      this.page = await this.browser.newPage();

      // Enable performance metrics
      await this.page.setCacheEnabled(false);
      const client = await this.page.target().createCDPSession();
      await client.send("Performance.enable");
      await client.send("Network.enable");

      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });

      // Collect metrics
      const navigationStart = Date.now();
      const response = await this.page.goto(url, { 
        waitUntil: "networkidle0",
        timeout: 300000 // Increase timeout to 300 seconds (5 minutes)
      });
      const navigationEnd = Date.now();

      // Get performance metrics
      const performanceMetrics = await this.page.metrics();
      const navigationTiming = await this.page.evaluate(() => {
        const timing = performance.getEntriesByType("navigation")[0];
        const paint = performance.getEntriesByType("paint");
        return {
          navigationStart: timing.startTime,
          responseStart: timing.responseStart,
          domInteractive: timing.domInteractive,
          domContentLoadedEvent: timing.domContentLoadedEventEnd,
          loadEventEnd: timing.loadEventEnd,
          firstPaint:
            paint.find((entry) => entry.name === "first-paint")?.startTime || 0,
          firstContentfulPaint:
            paint.find((entry) => entry.name === "first-contentful-paint")
              ?.startTime || 0,
        };
      });

      // Calculate timing metrics (convert to seconds)
      const loadTime = (navigationEnd - navigationStart) / 1000;
      const firstPaint = navigationTiming.firstPaint / 1000;
      const firstContentfulPaint = navigationTiming.firstContentfulPaint / 1000;
      const largestContentfulPaint = performanceMetrics.LargestContentfulPaint
        ? performanceMetrics.LargestContentfulPaint / 1000
        : 0;
      const timeToInteractive =
        (navigationTiming.domInteractive - navigationTiming.navigationStart) /
        1000;
      const domContentLoaded =
        (navigationTiming.domContentLoadedEvent -
          navigationTiming.navigationStart) /
        1000;
      const speedIndex = (firstContentfulPaint + largestContentfulPaint) / 2;

      // Get resource metrics
      const resourceMetrics = await this.page.evaluate(() => {
        const resources = performance.getEntriesByType("resource");
        return {
          totalRequests: resources.length,
          totalResourceSize: resources.reduce(
            (total, resource) => total + (resource.transferSize || 0),
            0
          ),
          htmlSize: document.documentElement.innerHTML.length,
        };
      });

      // Get memory metrics
      const memoryMetrics = await this.page.evaluate(() => ({
        jsHeapUsed: performance.memory
          ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))
          : 0,
        jsHeapTotal: performance.memory
          ? Math.round(performance.memory.totalJSHeapSize / (1024 * 1024))
          : 0,
      }));

      // Calculate performance score
      const score = Math.round(
        (Math.max(0, 100 - firstContentfulPaint * 10) +
          Math.max(0, 100 - timeToInteractive * 10) +
          Math.max(0, 100 - loadTime * 10)) /
          3
      );

      // Format all timing metrics to 2 decimal places
      const formatTime = (time) => Number(time.toFixed(2));

      // Return structured performance data
      return {
        score,
        metrics: {
          loadTime: formatTime(loadTime),
          firstContentfulPaint: formatTime(firstContentfulPaint),
          largestContentfulPaint: formatTime(largestContentfulPaint),
          timeToInteractive: formatTime(timeToInteractive),
          domContentLoaded: formatTime(domContentLoaded),
          firstPaint: formatTime(firstPaint),
          speedIndex: formatTime(speedIndex),
        },
        resourceMetrics: {
          totalRequests: resourceMetrics.totalRequests,
          totalResourceSize:
            Math.round(
              (resourceMetrics.totalResourceSize / (1024 * 1024)) * 100
            ) / 100,
          htmlSize: resourceMetrics.htmlSize,
        },
        memoryMetrics,
        recommendations: [],
      };
    } catch (error) {
      logger.error("Performance analysis error:", error);
      throw new Error(`Failed to analyze performance: ${error.message}`);
    }
  }

  async analyzeSEO(url) {
    try {
      await this.initialize();
      const page = await this.browser.newPage();
      await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 300000 // Increase timeout to 300 seconds (5 minutes)
      });

      const seoIssues = [];
      const seoMetrics = {};

      // Check title and meta tags
      const seoData = await page.evaluate(() => {
        const data = {
          title: document.title,
          metaTags: {},
          headings: {},
          links: {
            internal: 0,
            external: 0,
            broken: 0,
            total: document.links.length,
          },
          images: {
            total: document.images.length,
            withAlt: 0,
            withoutAlt: 0,
          },
          textContent: document.body.textContent.trim(),
          currentUrl: window.location.href,
        };

        // Analyze meta tags
        const metaTags = document.getElementsByTagName("meta");
        for (const tag of metaTags) {
          const name = tag.getAttribute("name") || tag.getAttribute("property");
          const content = tag.getAttribute("content");
          if (name && content) {
            data.metaTags[name] = content;
          }
        }

        // Analyze headings
        ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
          data.headings[tag] = document.getElementsByTagName(tag).length;
        });

        // Analyze images
        Array.from(document.images).forEach((img) => {
          if (img.alt && img.alt.trim()) {
            data.images.withAlt++;
          } else {
            data.images.withoutAlt++;
          }
        });

        // Analyze links
        Array.from(document.links).forEach((link) => {
          const href = link.href;
          if (href.startsWith(window.location.origin)) {
            data.links.internal++;
          } else if (href.startsWith("http")) {
            data.links.external++;
          }
        });

        return data;
      });

      // Title analysis
      if (!seoData.title) {
        seoIssues.push({
          severity: "high",
          description: "Missing page title",
          recommendation: "Add a descriptive title tag",
        });
      } else {
        const titleLength = seoData.title.length;
        if (titleLength < 30 || titleLength > 60) {
          seoIssues.push({
            severity: "medium",
            description: `Title length (${titleLength} characters) is ${
              titleLength < 30 ? "too short" : "too long"
            }`,
            recommendation:
              "Optimize title length to be between 30-60 characters",
          });
        }
      }

      // Meta description analysis
      if (!seoData.metaTags.description) {
        seoIssues.push({
          severity: "high",
          description: "Missing meta description",
          recommendation: "Add a meta description tag with relevant content",
        });
      } else {
        const descLength = seoData.metaTags.description.length;
        if (descLength < 120 || descLength > 160) {
          seoIssues.push({
            severity: "medium",
            description: `Meta description length (${descLength} characters) is ${
              descLength < 120 ? "too short" : "too long"
            }`,
            recommendation:
              "Optimize meta description length to be between 120-160 characters",
          });
        }
      }

      // Headings analysis
      if (seoData.headings.h1 === 0) {
        seoIssues.push({
          severity: "high",
          description: "Missing H1 heading",
          recommendation: "Add a primary H1 heading to the page",
        });
      } else if (seoData.headings.h1 > 1) {
        seoIssues.push({
          severity: "medium",
          description: `Multiple H1 headings (${seoData.headings.h1}) found`,
          recommendation: "Use only one H1 heading per page",
        });
      }

      // Image optimization
      if (seoData.images.withoutAlt > 0) {
        seoIssues.push({
          severity: "medium",
          description: `${seoData.images.withoutAlt} images missing alt text`,
          recommendation: "Add descriptive alt text to all images",
        });
      }

      // Mobile responsiveness
      const isMobileResponsive = await page.evaluate(() => {
        return !!document.querySelector('meta[name="viewport"]');
      });

      if (!isMobileResponsive) {
        seoIssues.push({
          severity: "high",
          description: "Page is not mobile-responsive",
          recommendation:
            "Add proper viewport meta tag and ensure responsive design",
        });
      }

      // URL structure
      const urlAnalysis = new URL(url);
      if (
        urlAnalysis.pathname.includes("?") ||
        urlAnalysis.pathname.includes("&")
      ) {
        seoIssues.push({
          severity: "medium",
          description: "URL contains query parameters",
          recommendation: "Consider using clean, semantic URLs",
        });
      }

      // Calculate SEO score
      const scoringCriteria = {
        title: 15,
        metaDescription: 15,
        headings: 15,
        images: 10,
        mobileResponsive: 15,
        urlStructure: 10,
        contentLength: 20,
      };

      let score = 100;

      // Deduct points based on issues
      seoIssues.forEach((issue) => {
        switch (issue.severity) {
          case "high":
            score -= 15;
            break;
          case "medium":
            score -= 10;
            break;
          case "low":
            score -= 5;
            break;
        }
      });

      // Ensure score stays within 0-100
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        issues: seoIssues,
        metrics: {
          titleLength: seoData.title.length,
          metaTagsCount: Object.keys(seoData.metaTags).length,
          headingStructure: seoData.headings,
          imagesWithAlt: seoData.images.withAlt,
          imagesWithoutAlt: seoData.images.withoutAlt,
          internalLinks: seoData.links.internal,
          externalLinks: seoData.links.external,
        },
      };
    } catch (error) {
      logger.error("SEO analysis error:", error);
      throw new Error(`Failed to analyze SEO: ${error.message}`);
    }
  }

  async analyzeSecurity(url) {
    let page = null;
    let client = null;
    try {
      await this.initialize();
      page = await this.browser.newPage();

      // Enable detailed security info collection
      client = await page.target().createCDPSession();
      await client.send("Security.enable");

      // Set longer timeout for security checks
      await page.setDefaultNavigationTimeout(300000);

      // Navigate to the URL and collect response
      const response = await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 300000,
      });

      if (!response) {
        throw new Error("Failed to get response from page");
      }

      const headers = response.headers();

      // Initialize security metrics
      const securityMetrics = {
        headers: {},
        vulnerabilities: [],
        ssl: null,
        mixedContent: [],
        cookies: [],
        jsLibraries: new Set(),
        forms: [],
      };

      // Check security headers with try-catch for each check
      try {
        const requiredHeaders = {
          "strict-transport-security": {
            severity: "high",
            description: "HSTS header missing",
            recommendation: "Implement HTTP Strict Transport Security",
          },
          "content-security-policy": {
            severity: "high",
            description: "CSP header missing",
            recommendation: "Implement Content Security Policy",
          },
          "x-frame-options": {
            severity: "medium",
            description: "X-Frame-Options header missing",
            recommendation: "Set X-Frame-Options to prevent clickjacking",
          },
          "x-content-type-options": {
            severity: "medium",
            description: "X-Content-Type-Options header missing",
            recommendation: "Set X-Content-Type-Options to nosniff",
          },
          "referrer-policy": {
            severity: "low",
            description: "Referrer-Policy header missing",
            recommendation: "Set appropriate Referrer-Policy",
          },
        };

        Object.entries(requiredHeaders).forEach(([header, info]) => {
          const headerValue = headers[header];
          securityMetrics.headers[header] = {
            present: !!headerValue,
            value: headerValue || null,
            ...info,
          };
        });
      } catch (headerError) {
        logger.error("Error checking security headers:", headerError);
      }

      // Check SSL certificate using response security details
      try {
        const securityDetails = response.securityDetails();
        if (securityDetails) {
          securityMetrics.ssl = {
            valid: true,
            protocol: securityDetails.protocol(),
            issuer: securityDetails.issuer(),
            validFrom: securityDetails.validFrom(),
            validTo: securityDetails.validTo(),
            issues: [],
          };

          const certExpiry = new Date(securityDetails.validTo());
          const daysUntilExpiry = Math.floor(
            (certExpiry - new Date()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilExpiry < 30) {
            securityMetrics.ssl.issues.push({
              severity: "high",
              description: `SSL certificate expires in ${daysUntilExpiry} days`,
              recommendation: "Renew SSL certificate soon",
            });
          }
        } else {
          securityMetrics.ssl = {
            valid: false,
            issues: [
              {
                severity: "high",
                description: "Unable to verify SSL certificate",
                recommendation: "Verify SSL certificate configuration",
              },
            ],
          };
        }
      } catch (sslError) {
        logger.error("Error checking SSL certificate:", sslError);
        securityMetrics.ssl = {
          valid: false,
          issues: [
            {
              severity: "high",
              description: "Unable to verify SSL certificate",
              recommendation: "Verify SSL certificate configuration",
            },
          ],
        };
      }

      // Check for mixed content
      try {
        const mixedContent = await page.evaluate(() => {
          const insecureElements = [];
          document
            .querySelectorAll("img, script, link, iframe")
            .forEach((el) => {
              const src = el.src || el.href;
              if (src && src.startsWith("http:")) {
                insecureElements.push({
                  type: el.tagName.toLowerCase(),
                  source: src,
                });
              }
            });
          return insecureElements;
        });

        if (mixedContent.length > 0) {
          securityMetrics.mixedContent = mixedContent.map((item) => ({
            severity: "high",
            description: `Mixed content found in ${item.type} element`,
            recommendation: "Replace HTTP resource with HTTPS equivalent",
            details: item,
          }));
        }
      } catch (mixedContentError) {
        logger.error("Error checking mixed content:", mixedContentError);
      }

      // Calculate security score
      let securityScore = 100;

      // Deduct points for missing security headers
      Object.values(securityMetrics.headers).forEach((header) => {
        if (!header.present) {
          switch (header.severity) {
            case "high":
              securityScore -= 15;
              break;
            case "medium":
              securityScore -= 10;
              break;
            case "low":
              securityScore -= 5;
              break;
          }
        }
      });

      // Deduct points for SSL issues
      if (!securityMetrics.ssl?.valid) {
        securityScore -= 30;
      }
      securityScore -= (securityMetrics.ssl?.issues?.length || 0) * 10;

      // Deduct points for mixed content
      securityScore -= securityMetrics.mixedContent.length * 15;

      // Ensure score stays within 0-100 range
      securityScore = Math.max(0, Math.min(100, securityScore));

      // Compile all issues
      const issues = [
        ...Object.values(securityMetrics.headers)
          .filter((h) => !h.present)
          .map((h) => ({
            severity: h.severity,
            description: h.description,
            recommendation: h.recommendation,
          })),
        ...(securityMetrics.ssl?.issues || []),
        ...securityMetrics.mixedContent,
      ];

      return {
        score: securityScore,
        metrics: securityMetrics,
        issues,
      };
    } catch (error) {
      logger.error("Security analysis error:", error);
      return {
        score: 0,
        metrics: {
          error: error.message,
        },
        issues: [
          {
            severity: "high",
            description: "Security analysis failed",
            recommendation: "Check server connectivity and try again",
          },
        ],
      };
    } finally {
      // Cleanup
      if (client) {
        try {
          await client.detach();
        } catch (error) {
          logger.error("Error detaching CDP client:", error);
        }
      }
      if (page) {
        try {
          await page.close();
        } catch (error) {
          logger.error("Error closing page:", error);
        }
      }
    }
  }

  async analyzeUptime(url) {
    try {
      const startTime = Date.now();
      let response, statusCode = 0, errorMsg = null;
      try {
        response = await axios.get(url, { timeout: 30000, validateStatus: null });
        statusCode = response.status;
      } catch (err) {
        errorMsg = err.message;
        statusCode = err.response ? err.response.status : 0;
      }
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const isAvailable = statusCode >= 200 && statusCode < 400;
      return {
        score: isAvailable ? 100 : 0,
        metrics: {
          availability: isAvailable ? 100 : 0,
          responseTime,
          statusCode,
          error: errorMsg,
        },
      };
    } catch (error) {
      logger.error("Uptime analysis error:", error);
      return {
        score: 0,
        metrics: {
          availability: 0,
          responseTime: -1,
          statusCode: 0,
          error: error.message,
        },
      };
    }
  }

  async analyzeAIInsights(url) {
    try {
      await this.initialize();
      this.page = await this.browser.newPage();
      await this.page.goto(url, { waitUntil: "networkidle0" });

      // Collect comprehensive website data
      const websiteData = await this.page.evaluate(() => {
        try {
          return {
            // Basic Info
            title: document.title || "",
            description:
              document.querySelector('meta[name="description"]')?.content || "",
            keywords:
              document.querySelector('meta[name="keywords"]')?.content || "",

            // Content Analysis
            headings: {
              h1: Array.from(document.querySelectorAll("h1")).map((h) => ({
                text: h.textContent.trim(),
                visible: window.getComputedStyle(h).display !== "none",
              })),
              h2: Array.from(document.querySelectorAll("h2")).map((h) =>
                h.textContent.trim()
              ),
            },
            paragraphs: Array.from(document.querySelectorAll("p")).map((p) => ({
              text: p.textContent.trim(),
              length: p.textContent.trim().length,
              hasLinks: p.querySelector("a") !== null,
            })),

            // User Experience
            callToAction: {
              buttons: Array.from(
                document.querySelectorAll('button, .btn, [role="button"]')
              ).map((btn) => ({
                text: btn.textContent.trim(),
                visible: window.getComputedStyle(btn).display !== "none",
              })),
              forms: document.querySelectorAll("form").length,
            },

            // Visual Content
            images: Array.from(document.querySelectorAll("img")).map((img) => ({
              alt: img.alt || "",
              src: img.src || "",
              size: {
                width: img.width,
                height: img.height,
              },
              visible: window.getComputedStyle(img).display !== "none",
            })),

            // Navigation
            navigation: {
              menuItems: Array.from(
                document.querySelectorAll("nav a, header a")
              ).map((a) => ({
                text: a.textContent.trim(),
                href: a.href,
                current: a.getAttribute("aria-current") || false,
              })),
              footerLinks: Array.from(document.querySelectorAll("footer a"))
                .length,
            },

            // Mobile & Accessibility
            viewport:
              document.querySelector('meta[name="viewport"]')?.content || "",
            responsiveDesign: {
              hasMediaQueries: Array.from(document.styleSheets).some(
                (sheet) => {
                  try {
                    return Array.from(sheet.cssRules).some(
                      (rule) => rule.type === CSSRule.MEDIA_RULE
                    );
                  } catch {
                    return false;
                  }
                }
              ),
            },

            // Contact & Trust Signals
            contactInfo: {
              hasContactForm:
                document.querySelector('form:has(input[type="email"])') !==
                null,
              hasPhone: /(\+?[\d\s-]{10,})/.test(document.body.textContent),
              hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
                document.body.textContent
              ),
            },
            socialLinks: Array.from(
              document.querySelectorAll(
                'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'
              )
            ).length,
          };
        } catch (error) {
          console.error("Error collecting website data:", error);
          return null;
        }
      });

      if (!websiteData) {
        throw new Error("Failed to analyze website data");
      }

      // Generate actionable insights
      const insights = this.generateActionableInsights(websiteData);

      // Calculate scores
      const scores = {
        content: this.calculateContentScore(websiteData),
        userExperience: this.calculateUXScore(websiteData),
        engagement: this.calculateEngagementScore(websiteData),
      };

      // Generate prioritized recommendations
      const recommendations = this.generatePrioritizedRecommendations(
        websiteData,
        scores
      );

      // Calculate overall score
      const overallScore = Math.round(
        scores.content * 0.4 +
          scores.userExperience * 0.35 +
          scores.engagement * 0.25
      );

      await this.page.close();

      return {
        score: Math.max(0, Math.min(100, overallScore)),
        summary: this.generateUserFriendlySummary(websiteData, scores),
        recommendations,
        insights,
      };
    } catch (error) {
      logger.error("AI Insights analysis error:", error);
      throw new Error(`Failed to analyze website: ${error.message}`);
    }
  }

  generateActionableInsights(data) {
    return [
      {
        aspect: "First Impression & Branding",
        analysis: this.analyzeFirstImpression(data),
        suggestions: this.generateBrandingSuggestions(data),
      },
      {
        aspect: "Content Quality & Structure",
        analysis: this.analyzeContentStructure(data),
        suggestions: this.generateContentSuggestions(data),
      },
      {
        aspect: "User Engagement & Conversion",
        analysis: this.analyzeUserEngagement(data),
        suggestions: this.generateEngagementSuggestions(data),
      },
      {
        aspect: "Trust & Credibility",
        analysis: this.analyzeTrustSignals(data),
        suggestions: this.generateTrustSuggestions(data),
      },
    ];
  }

  analyzeFirstImpression(data) {
    const hasTitle = data.title.length > 0;
    const hasDescription = data.description.length > 0;
    const mainHeading = data.headings.h1[0]?.text || "";

    return `Your website ${hasTitle ? "has" : "needs"} a title${
      hasTitle ? ` (${data.title})` : ""
    } and ${
      hasDescription ? "includes" : "should include"
    } a meta description. The main heading ${
      mainHeading ? `"${mainHeading}"` : "is missing but should"
    } clearly communicate your value proposition.`;
  }

  analyzeContentStructure(data) {
    const paragraphCount = data.paragraphs.length;
    const avgParagraphLength =
      data.paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphCount;
    const hasSubheadings = data.headings.h2.length > 0;

    return `Your content includes ${paragraphCount} paragraphs with an average length of ${Math.round(
      avgParagraphLength
    )} characters. ${
      hasSubheadings
        ? "Good use of subheadings helps structure the content."
        : "Consider adding subheadings to better organize your content."
    }`;
  }

  analyzeUserEngagement(data) {
    const visibleCTAs = data.callToAction.buttons.filter(
      (btn) => btn.visible
    ).length;
    const hasForms = data.callToAction.forms > 0;
    const hasImages = data.images.filter((img) => img.visible).length;

    return `Your website has ${visibleCTAs} call-to-action buttons${
      visibleCTAs === 0 ? " (consider adding some)" : ""
    }, ${
      hasForms ? "includes" : "could benefit from"
    } contact forms, and uses ${hasImages} visible images for visual engagement.`;
  }

  analyzeTrustSignals(data) {
    const hasContact =
      data.contactInfo.hasContactForm ||
      data.contactInfo.hasPhone ||
      data.contactInfo.hasEmail;
    const hasSocial = data.socialLinks > 0;

    return `Your website ${
      hasContact ? "provides" : "should provide"
    } contact information and ${
      hasSocial ? "includes" : "could benefit from"
    } social media presence to build trust with visitors.`;
  }

  generateBrandingSuggestions(data) {
    const suggestions = [];

    if (!data.title || data.title.length < 10) {
      suggestions.push(
        "Add a clear, descriptive title that includes your brand name and main service"
      );
    }
    if (!data.description || data.description.length < 50) {
      suggestions.push(
        "Create a compelling meta description that summarizes your value proposition"
      );
    }
    if (data.headings.h1.length !== 1) {
      suggestions.push(
        "Ensure you have exactly one main heading that clearly states what you offer"
      );
    }

    return suggestions;
  }

  generateContentSuggestions(data) {
    const suggestions = [];

    if (data.paragraphs.length < 3) {
      suggestions.push(
        "Add more content sections to fully explain your offerings"
      );
    }
    if (data.headings.h2.length < 2) {
      suggestions.push(
        "Use subheadings to break up your content and improve readability"
      );
    }
    if (data.images.length < 3) {
      suggestions.push(
        "Include more relevant images to illustrate your content"
      );
    }

    return suggestions;
  }

  generateEngagementSuggestions(data) {
    const suggestions = [];

    if (data.callToAction.buttons.length < 2) {
      suggestions.push(
        "Add clear call-to-action buttons to guide visitors towards conversion"
      );
    }
    if (!data.callToAction.forms) {
      suggestions.push(
        "Include a contact form to make it easy for visitors to reach you"
      );
    }
    if (!data.contactInfo.hasPhone && !data.contactInfo.hasEmail) {
      suggestions.push(
        "Display contact information prominently to build trust"
      );
    }

    return suggestions;
  }

  generateTrustSuggestions(data) {
    const suggestions = [];

    if (!data.contactInfo.hasContactForm) {
      suggestions.push(
        "Add a contact form to make it easy for potential customers to reach you"
      );
    }
    if (data.socialLinks < 2) {
      suggestions.push(
        "Include social media links to enhance credibility and engagement"
      );
    }
    if (data.navigation.footerLinks < 3) {
      suggestions.push(
        "Add important links in the footer (Privacy Policy, Terms, Contact)"
      );
    }

    return suggestions;
  }

  generateUserFriendlySummary(data, scores) {
    const strengths = [];
    const weaknesses = [];

    // Analyze strengths
    if (scores.content >= 80) strengths.push("well-structured content");
    if (scores.userExperience >= 80) strengths.push("good user experience");
    if (scores.engagement >= 80) strengths.push("strong engagement elements");
    if (data.images.length >= 5) strengths.push("good visual presentation");
    if (data.callToAction.forms > 0) strengths.push("clear conversion paths");

    // Analyze weaknesses
    if (scores.content < 60) weaknesses.push("content structure");
    if (scores.userExperience < 60) weaknesses.push("user experience");
    if (scores.engagement < 60) weaknesses.push("visitor engagement");
    if (!data.viewport) weaknesses.push("mobile optimization");
    if (data.callToAction.buttons.length < 2)
      weaknesses.push("call-to-action elements");

    return `Your website ${
      strengths.length > 0
        ? `shows strength in ${strengths.join(", ")}`
        : "needs improvement"
    }.${
      weaknesses.length > 0
        ? ` Focus on improving ${weaknesses.join(", ")} for better results.`
        : ""
    } ${this.getScoreMessage(
      Math.round(
        (scores.content + scores.userExperience + scores.engagement) / 3
      )
    )}`;
  }

  getScoreMessage(score) {
    if (score >= 90) return "Overall, your website is performing excellently.";
    if (score >= 70)
      return "Your website is performing well but has room for improvement.";
    if (score >= 50)
      return "Your website needs several improvements to reach its full potential.";
    return "Your website requires significant improvements to effectively reach and convert visitors.";
  }

  calculateContentScore(data) {
    let score = 100;

    if (!data.title) score -= 15;
    if (!data.description) score -= 15;
    if (data.paragraphs.length < 3) score -= 20;
    if (data.headings.h1.length !== 1) score -= 15;
    if (data.headings.h2.length < 2) score -= 10;
    if (data.images.length < 3) score -= 10;

    return Math.max(0, score);
  }

  calculateUXScore(data) {
    let score = 100;

    if (!data.viewport) score -= 25;
    if (!data.responsiveDesign.hasMediaQueries) score -= 20;
    if (data.callToAction.buttons.length < 2) score -= 15;
    if (!data.callToAction.forms) score -= 15;
    if (data.navigation.menuItems.length < 3) score -= 10;

    return Math.max(0, score);
  }

  calculateEngagementScore(data) {
    let score = 100;

    if (!data.contactInfo.hasContactForm) score -= 20;
    if (!data.contactInfo.hasPhone && !data.contactInfo.hasEmail) score -= 20;
    if (data.socialLinks < 2) score -= 15;
    if (data.callToAction.buttons.length < 2) score -= 15;
    if (data.images.length < 3) score -= 15;

    return Math.max(0, score);
  }

  generatePrioritizedRecommendations(data, scores) {
    const recommendations = [];

    // High Priority (Critical for website success)
    if (!data.viewport || !data.responsiveDesign.hasMediaQueries) {
      recommendations.push({
        category: "Mobile Optimization",
        description: "Your website needs to be mobile-friendly",
        priority: "high",
        impact: "Critical for reaching mobile users and SEO",
      });
    }

    if (scores.content < 70) {
      recommendations.push({
        category: "Content Quality",
        description: "Improve your website's content structure and quality",
        priority: "high",
        impact: "Essential for engaging visitors and SEO",
      });
    }

    // Medium Priority (Important for conversion)
    if (data.callToAction.buttons.length < 2) {
      recommendations.push({
        category: "Conversion Optimization",
        description: "Add clear call-to-action buttons",
        priority: "medium",
        impact: "Important for converting visitors into customers",
      });
    }

    if (!data.contactInfo.hasContactForm) {
      recommendations.push({
        category: "Lead Generation",
        description: "Add a contact form for lead capture",
        priority: "medium",
        impact: "Crucial for business growth",
      });
    }

    // Low Priority (Enhancement opportunities)
    if (data.socialLinks < 2) {
      recommendations.push({
        category: "Social Proof",
        description: "Add social media integration",
        priority: "low",
        impact: "Helps build trust and engagement",
      });
    }

    return recommendations;
  }

  async analyzeAccessibility(url) {
    try {
      // Use the shared accessibilityAnalyzer utility
      const result = await accessibilityAnalyzer.analyze(url);
      
      // Map violations to issues for frontend compatibility
      const issues = result.violations
        ? result.violations.map(v => ({
            impact: v.impact || "unknown",
            description: v.description,
            solution: v.help || "",
            wcagGuideline: v.helpUrl || "",
            priority: v.impact === "critical" ? "high" : 
                     v.impact === "serious" ? "high" :
                     v.impact === "moderate" ? "medium" : "low"
          }))
        : [];

      // --- Consistency Enforcement ---
      if (result.overallScore < 100 && issues.length === 0) {
        issues.push({
          impact: "unknown",
          description: "Accessibility issue detected but no details were provided.",
          solution: "",
          wcagGuideline: "",
          priority: "medium"
        });
      }
      if (issues.length === 0) {
        result.overallScore = 100;
      }
      // --- End Consistency Enforcement ---

      return {
        score: result.overallScore,
        summary: result.summary,
        categories: result.categories,
        issues: issues,
        passes: result.passes,
        incomplete: result.incomplete,
      };
    } catch (error) {
      logger.error("Accessibility analysis error:", error);
      return {
        score: 0,
        issues: [{
          impact: "error",
          description: "Failed to perform accessibility analysis",
          solution: "Please try again later",
          wcagGuideline: "",
          priority: "high"
        }],
        error: error.message,
      };
    }
  }

  async scanWebsite(url, options) {
    const results = { results: {} };
    logger.info("Website scan started", { url, options });
    const scanStart = Date.now();
    try {
      await this.initialize();
      const page = await this.browser.newPage();
      await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 300000 // Increase timeout to 300 seconds (5 minutes)
      });

      for (const option of options) {
        try {
          const analysisStart = Date.now();
          logger.info(`Starting ${option} analysis`, { url });

          switch (option.toLowerCase()) {
            case "performance":
              results.results.performance = await this.analyzePerformance(url);
              break;
            case "seo":
              results.results.seo = await this.analyzeSEO(url);
              break;
            case "security":
              results.results.security = await this.analyzeSecurity(url);
              break;
            case "uptime":
              results.results.uptime = await this.analyzeUptime(url);
              break;
            case "ai_insights":
              results.results.ai_insights = await this.analyzeAIInsights(url);
              break;
            case "accessibility":
              results.results.accessibility = await this.analyzeAccessibility(url);
              break;
          }
          const analysisEnd = Date.now();
          logger.info(`Completed ${option} analysis`, {
            url,
            option,
            durationMs: analysisEnd - analysisStart,
            resultSummary: results.results[option.toLowerCase()]?.score !== undefined
              ? { score: results.results[option.toLowerCase()]?.score }
              : undefined
          });
        } catch (error) {
          logger.error(`Error in ${option} analysis:`, error);
          // Set a default error result for the failed analysis
          results.results[option.toLowerCase()] = {
            error: error.message,
            score: 0,
            issues: []
          };
        }
      }

      logger.info("Website scan completed", {
        url,
        options,
        durationMs: Date.now() - scanStart,
        resultKeys: Object.keys(results.results)
      });
      return results;
    } catch (error) {
      logger.error("Scan error:", error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = WebsiteScanner;
