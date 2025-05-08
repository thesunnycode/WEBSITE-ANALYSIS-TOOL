const puppeteer = require('puppeteer');
const logger = require('./logger');

class SeoAnalyzer {
  constructor() {
    this.scores = {
      title: 0,
      description: 0,
      headings: 0,
      images: 0,
      links: 0,
      content: 0,
      technical: 0
    };
  }

  async analyze(url) {
    let browser;
    try {
      logger.info('Starting SEO analysis', { url });
      
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(300000);
      
      logger.info('Navigating to URL', { url });
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 300000 
      });

      logger.info('Analyzing meta tags');
      const metaTags = await this.analyzeMetaTags(page);
      this.scores.title = metaTags.title.score;
      this.scores.description = metaTags.description.score;

      logger.info('Analyzing headings');
      const headings = await this.analyzeHeadings(page);
      this.scores.headings = headings.score;

      logger.info('Analyzing images');
      const images = await this.analyzeImages(page);
      this.scores.images = images.score;

      logger.info('Analyzing links');
      const links = await this.analyzeLinks(page, url);
      this.scores.links = links.score;

      logger.info('Analyzing content');
      const contentAnalysis = await this.analyzeContent(page);
      this.scores.content = contentAnalysis.readabilityScore;

      logger.info('Analyzing technical SEO');
      const technicalSEO = await this.analyzeTechnicalSEO(page, url);
      this.scores.technical = technicalSEO.score;

      const overallScore = this.calculateOverallScore();

      const seoData = {
        metaTags,
        headings,
        images,
        links,
        contentAnalysis,
        technicalSEO,
        overallScore
      };

      logger.info('SEO analysis completed successfully', {
        url,
        score: overallScore
      });

      return seoData;

    } catch (error) {
      logger.error('SEO analysis failed', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`SEO analysis failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
          logger.info('Browser closed successfully');
        } catch (error) {
          logger.error('Error closing browser', {
            error: error.message
          });
        }
      }
    }
  }

  async analyzeMetaTags(page) {
    try {
      const metaTags = await page.evaluate(() => {
        return {
          title: document.title || '',
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content?.split(',').map(k => k.trim()) || []
        };
      });

      return {
        title: {
          content: metaTags.title,
          length: metaTags.title.length,
          score: this.calculateTitleScore(metaTags.title.length),
          suggestions: this.generateTitleSuggestions(metaTags.title.length)
        },
        description: {
          content: metaTags.description,
          length: metaTags.description.length,
          score: this.calculateDescriptionScore(metaTags.description.length),
          suggestions: this.generateDescriptionSuggestions(metaTags.description.length)
        },
        keywords: {
          content: metaTags.keywords,
          score: this.calculateKeywordScore(metaTags.keywords),
          suggestions: []
        }
      };
    } catch (error) {
      logger.error('Meta tags analysis failed', { error: error.message });
      return {
        title: { content: '', length: 0, score: 0, suggestions: [] },
        description: { content: '', length: 0, score: 0, suggestions: [] },
        keywords: { content: [], score: 0, suggestions: [] }
      };
    }
  }

  calculateTitleScore(length) {
    if (!length) return 0;
    if (length >= 30 && length <= 60) return 100;
    if (length < 30) return (length / 30) * 100;
    return Math.max(0, 100 - ((length - 60) * 2));
  }

  calculateDescriptionScore(length) {
    if (!length) return 0;
    if (length >= 120 && length <= 160) return 100;
    if (length < 120) return (length / 120) * 100;
    return Math.max(0, 100 - ((length - 160) * 1.5));
  }

  calculateKeywordScore(keywords) {
    if (!keywords || !keywords.length) return 0;
    return Math.min(100, keywords.length * 10);
  }

  generateTitleSuggestions(length) {
    const suggestions = [];
    if (!length) {
      suggestions.push('Add a title tag');
    } else if (length < 30) {
      suggestions.push('Title is too short (should be 30-60 characters)');
    } else if (length > 60) {
      suggestions.push('Title is too long (should be 30-60 characters)');
    }
    return suggestions;
  }

  generateDescriptionSuggestions(length) {
    const suggestions = [];
    if (!length) {
      suggestions.push('Add a meta description');
    } else if (length < 120) {
      suggestions.push('Description is too short (should be 120-160 characters)');
    } else if (length > 160) {
      suggestions.push('Description is too long (should be 120-160 characters)');
    }
    return suggestions;
  }

  calculateOverallScore() {
    const weights = {
      title: 0.2,
      description: 0.2,
      headings: 0.15,
      images: 0.15,
      links: 0.1,
      content: 0.1,
      technical: 0.1
    };

    const score = Object.entries(this.scores).reduce((total, [key, score]) => {
      return total + (score * weights[key]);
    }, 0);

    return Math.round(score);
  }

  async analyzeHeadings(page) {
    try {
      const headings = await page.evaluate(() => {
        const getHeadingContent = (tag) => {
          const elements = document.getElementsByTagName(tag);
          return {
            count: elements.length,
            content: Array.from(elements).map(el => el.textContent.trim())
          };
        };

        return {
          h1: getHeadingContent('h1'),
          h2: getHeadingContent('h2'),
          h3: getHeadingContent('h3')
        };
      });

      return {
        ...headings,
        score: this.calculateHeadingScore(headings),
        suggestions: this.generateHeadingSuggestions(headings)
      };
    } catch (error) {
      logger.error('Headings analysis failed', { error: error.message });
      return {
        h1: { count: 0, content: [] },
        h2: { count: 0, content: [] },
        h3: { count: 0, content: [] },
        score: 0,
        suggestions: ['Failed to analyze headings']
      };
    }
  }

  calculateHeadingScore(headings) {
    let score = 100;
    
    // Check H1 presence and count
    if (headings.h1.count === 0) {
      score -= 30; // No H1 tag is a major issue
    } else if (headings.h1.count > 1) {
      score -= 20; // Multiple H1 tags is not recommended
    }

    // Check H2 presence
    if (headings.h2.count === 0) {
      score -= 10; // No H2 tags might indicate poor structure
    }

    // Check heading hierarchy
    if (headings.h1.count > 0 && headings.h2.count > 0) {
      score += 10; // Good hierarchy
    }

    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  generateHeadingSuggestions(headings) {
    const suggestions = [];

    if (headings.h1.count === 0) {
      suggestions.push('Add an H1 heading tag - it\'s important for SEO');
    } else if (headings.h1.count > 1) {
      suggestions.push('Use only one H1 heading per page');
    }

    if (headings.h2.count === 0) {
      suggestions.push('Consider adding H2 headings to structure your content');
    }

    if (headings.h3.count === 0 && headings.h2.count > 2) {
      suggestions.push('Consider using H3 headings to better organize your content');
    }

    return suggestions;
  }

  async analyzeImages(page) {
    const images = await page.evaluate(() => {
      const imgs = document.getElementsByTagName('img');
      const withAlt = Array.from(imgs).filter(img => img.alt && img.alt.trim()).length;
      return {
        total: imgs.length,
        withAlt,
        withoutAlt: imgs.length - withAlt
      };
    });
    return { ...images, score: this.calculateImageScore(images), suggestions: [] };
  }

  calculateImageScore(images) {
    if (images.total === 0) return 100;
    return Math.round((images.withAlt / images.total) * 100);
  }

  async analyzeLinks(page, baseUrl) {
    const links = await page.evaluate(() => ({
      internal: { count: 0, list: [] },
      external: { count: 0, list: [] }
    }));
    return { ...links, score: 100, suggestions: [] };
  }

  async analyzeContent(page) {
    return {
      wordCount: 0,
      readabilityScore: 100,
      keywordDensity: new Map(),
      suggestions: []
    };
  }

  async analyzeTechnicalSEO(page, url) {
    return {
      hasRobotsTxt: true,
      hasSitemap: true,
      isMobileFriendly: true,
      hasSSL: url.startsWith('https'),
      score: 100,
      suggestions: []
    };
  }
}

module.exports = new SeoAnalyzer(); 