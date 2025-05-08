const puppeteer = require("puppeteer");
const logger = require("./logger");

class LighthouseAnalyzer {
  constructor() {
    // Performance thresholds based on industry standards
    this.thresholds = {
      loadTime: {
        good: 2000, // 2 seconds
        average: 4000, // 4 seconds
      },
      firstContentfulPaint: {
        good: 1800, // 1.8 seconds
        average: 3000, // 3 seconds
      },
      speedIndex: {
        good: 3400, // 3.4 seconds
        average: 5800, // 5.8 seconds
      },
    };
  }

  calculateMetricScore(value, metric) {
    const thresholds = this.thresholds[metric];
    if (!thresholds) return 0;

    if (value <= thresholds.good) {
      return 100;
    } else if (value <= thresholds.average) {
      return (
        60 +
        Math.round(
          (40 * (thresholds.average - value)) /
            (thresholds.average - thresholds.good)
        )
      );
    } else {
      return Math.max(
        0,
        Math.round(60 * (1 - (value - thresholds.average) / thresholds.average))
      );
    }
  }

  async analyze(url) {
    let browser;
    try {
      logger.info("Starting performance analysis", { url });

      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });

      const page = await browser.newPage();

      // Enable performance metrics
      await page.setCacheEnabled(false);
      const client = await page.target().createCDPSession();
      await client.send("Performance.enable");

      // Navigate to the page
      const navigationStart = Date.now();
      await page.setDefaultNavigationTimeout(300000);
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 300000,
      });

      // Collect metrics
      const metrics = await page.metrics();
      const performanceMetrics = await client.send("Performance.getMetrics");

      // Get resource information
      const resources = await page.evaluate(() => {
        const resourceList = window.performance.getEntriesByType("resource");
        return resourceList.map((resource) => ({
          type: resource.initiatorType,
          size: resource.transferSize || 0,
        }));
      });

      // Calculate resource totals
      const resourceTotals = resources.reduce(
        (acc, resource) => {
          acc.totalBytes += resource.size;
          switch (resource.type) {
            case "script":
              acc.scriptBytes += resource.size;
              break;
            case "css":
              acc.styleBytes += resource.size;
              break;
            case "img":
              acc.imageBytes += resource.size;
              break;
            case "font":
              acc.fontBytes += resource.size;
              break;
            default:
              acc.otherBytes += resource.size;
          }
          return acc;
        },
        {
          totalBytes: 0,
          scriptBytes: 0,
          styleBytes: 0,
          imageBytes: 0,
          fontBytes: 0,
          otherBytes: 0,
        }
      );

      // Calculate load time and other metrics
      const loadTime = Date.now() - navigationStart;
      const firstContentfulPaint = metrics.FirstContentfulPaint || loadTime;
      const speedIndex = loadTime;

      // Calculate individual metric scores
      const loadTimeScore = this.calculateMetricScore(loadTime, "loadTime");
      const fcpScore = this.calculateMetricScore(
        firstContentfulPaint,
        "firstContentfulPaint"
      );
      const speedIndexScore = this.calculateMetricScore(
        speedIndex,
        "speedIndex"
      );

      // Calculate weighted average for final score
      // Weights: FCP (40%), Speed Index (40%), Load Time (20%)
      const finalScore = Math.round(
        fcpScore * 0.4 + speedIndexScore * 0.4 + loadTimeScore * 0.2
      );

      const performanceData = {
        performance: {
          score: finalScore,
          firstContentfulPaint,
          speedIndex,
          largestContentfulPaint: metrics.LargestContentfulPaint || 0,
          timeToInteractive: loadTime,
          totalBlockingTime: metrics.TaskDuration || 0,
          cumulativeLayoutShift: 0,
        },
        resourceUsage: resourceTotals,
        metrics: {
          serverResponseTime: metrics.ResponseTime || 0,
          domSize: await page.evaluate(
            () => document.getElementsByTagName("*").length
          ),
          bootupTime: metrics.ScriptDuration || 0,
          mainThreadWork: metrics.TaskDuration || 0,
          resourceCount: resources.length,
        },
      };

      logger.info("Performance analysis completed", {
        url,
        score: performanceData.performance.score,
        metrics: {
          loadTime,
          firstContentfulPaint,
          speedIndex,
        },
      });

      return performanceData;
    } catch (error) {
      logger.error("Performance analysis failed", {
        url,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Performance analysis failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
          logger.info("Browser instance closed successfully");
        } catch (error) {
          logger.error("Error closing browser instance", {
            error: error.message,
          });
        }
      }
    }
  }
}

module.exports = new LighthouseAnalyzer();
