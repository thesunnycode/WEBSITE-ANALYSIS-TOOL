const puppeteer = require("puppeteer");
const { AxePuppeteer } = require("@axe-core/puppeteer");
const logger = require("./logger");

class AccessibilityAnalyzer {
  async analyze(url) {
    let browser;
    try {
      logger.info("Starting accessibility analysis", { url });

      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setBypassCSP(true);

      logger.info("Loading page for analysis");
      await page.setDefaultNavigationTimeout(300000);
      
      // Navigate to the page and wait for it to be fully loaded
      await page.goto(url, {
        waitUntil: ["networkidle0", "domcontentloaded", "load"],
        timeout: 300000,
      });

      // Wait for any dynamic content to load using Promise
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Ensure the page is ready for analysis
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve();
          } else {
            window.addEventListener("load", resolve);
          }
        });
      });

      // Additional wait for any JavaScript execution
      await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      });

      logger.info("Running axe-core analysis");
      const results = await new AxePuppeteer(page).analyze();

      const categorizedResults = this.categorizeResults(results);
      const summary = this.generateSummary(results);
      const overallScore = this.calculateOverallScore(summary);

      logger.info("Accessibility analysis completed", {
        url,
        violations: results.violations.length,
        score: overallScore,
      });

      return {
        violations: this.formatViolations(results.violations),
        passes: this.formatPasses(results.passes),
        incomplete: this.formatIncomplete(results.incomplete),
        summary,
        categories: categorizedResults,
        overallScore,
      };
    } catch (error) {
      logger.error("Accessibility analysis failed", {
        url,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Accessibility analysis failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  formatViolations(violations) {
    return violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    }));
  }

  formatPasses(passes) {
    return passes.map((pass) => ({
      id: pass.id,
      description: pass.description,
      nodes: pass.nodes.map((node) => ({
        html: node.html,
        target: node.target,
      })),
    }));
  }

  formatIncomplete(incomplete) {
    return incomplete.map((item) => ({
      id: item.id,
      impact: item.impact,
      description: item.description,
      nodes: item.nodes.map((node) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    }));
  }

  categorizeResults(results) {
    const categories = {
      colorContrast: {
        score: 100,
        violations: [],
        suggestions: [],
      },
      keyboardNavigation: {
        score: 100,
        violations: [],
        suggestions: [],
      },
      screenReader: {
        score: 100,
        violations: [],
        suggestions: [],
      },
      ariaAttributes: {
        score: 100,
        violations: [],
        suggestions: [],
      },
    };

    results.violations.forEach((violation) => {
      if (violation.id.includes("color-contrast")) {
        categories.colorContrast.violations.push(violation.description);
        categories.colorContrast.suggestions.push(violation.help);
        categories.colorContrast.score -= 10;
      }
      if (violation.id.includes("keyboard")) {
        categories.keyboardNavigation.violations.push(violation.description);
        categories.keyboardNavigation.suggestions.push(violation.help);
        categories.keyboardNavigation.score -= 10;
      }
      if (violation.id.includes("aria")) {
        categories.ariaAttributes.violations.push(violation.description);
        categories.ariaAttributes.suggestions.push(violation.help);
        categories.ariaAttributes.score -= 10;
      }
      if (violation.id.includes("screen-reader")) {
        categories.screenReader.violations.push(violation.description);
        categories.screenReader.suggestions.push(violation.help);
        categories.screenReader.score -= 10;
      }
    });

    // Ensure scores don't go below 0
    Object.keys(categories).forEach((key) => {
      categories[key].score = Math.max(0, categories[key].score);
    });

    return categories;
  }

  generateSummary(results) {
    const violationsByImpact = results.violations.reduce((acc, violation) => {
      acc[`${violation.impact}Violations`] =
        (acc[`${violation.impact}Violations`] || 0) + 1;
      return acc;
    }, {});

    return {
      totalViolations: results.violations.length,
      criticalViolations: violationsByImpact.criticalViolations || 0,
      seriousViolations: violationsByImpact.seriousViolations || 0,
      moderateViolations: violationsByImpact.moderateViolations || 0,
      minorViolations: violationsByImpact.minorViolations || 0,
      totalPasses: results.passes.length,
      totalIncomplete: results.incomplete.length,
    };
  }

  calculateOverallScore(summary) {
    const baseScore = 100;
    const deductions = {
      critical: 10,
      serious: 5,
      moderate: 3,
      minor: 1,
    };

    const score =
      baseScore -
      summary.criticalViolations * deductions.critical -
      summary.seriousViolations * deductions.serious -
      summary.moderateViolations * deductions.moderate -
      summary.minorViolations * deductions.minor;

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new AccessibilityAnalyzer();
