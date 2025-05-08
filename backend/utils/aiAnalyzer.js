const puppeteer = require('puppeteer');
const openai = require('../config/openai');
const logger = require('./logger');

class AiAnalyzer {
  constructor() {
    this.promptTemplates = {
      uiux: `Analyze this website's UI/UX design from the following data and provide specific insights:

Website Data:
{websiteData}

Provide analysis in JSON format with:
{
  "score": (number between 0-100),
  "strengths": [array of strengths],
  "weaknesses": [array of weaknesses],
  "suggestions": [specific actionable improvements]
}`,

      readability: `Analyze the following website content for readability and user engagement:

Content:
{content}

Provide analysis in JSON format with:
{
  "score": (number between 0-100),
  "readingLevel": (reading difficulty level),
  "suggestions": [specific improvements],
  "complexPhrases": [identified complex phrases]
}`,

      userBehavior: `Based on this website data, predict user behavior and engagement:

Website Data:
{websiteData}

Provide predictions in JSON format with:
{
  "bounceRatePrediction": (percentage),
  "engagementScore": (number between 0-100),
  "painPoints": [potential user friction points],
  "improvements": [specific actionable suggestions]
}`
    };
  }

  async analyze(url) {
    let browser;
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      logger.info('Starting AI analysis', { url });

      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();
      logger.info('Navigating to URL', { url });
      await page.setDefaultNavigationTimeout(300000);
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 300000 
      });

      // Extract website data
      logger.info('Extracting website data');
      const websiteData = await this.extractWebsiteData(page);
      
      // Analyze with OpenAI
      logger.info('Starting OpenAI analysis');
      const [uiuxAnalysis, readabilityAnalysis, userBehaviorPrediction] = await Promise.all([
        this.analyzeWithOpenAI('uiux', websiteData),
        this.analyzeWithOpenAI('readability', websiteData.content),
        this.analyzeWithOpenAI('userBehavior', websiteData)
      ]);

      // Generate content quality analysis
      logger.info('Analyzing content quality');
      const contentQuality = await this.analyzeContentQuality(websiteData);

      // Generate overall insights
      logger.info('Generating overall insights');
      const overallInsights = await this.generateOverallInsights({
        uiuxAnalysis,
        readabilityAnalysis,
        userBehaviorPrediction,
        contentQuality,
        websiteData
      });

      logger.info('AI analysis completed successfully');

      return {
        uiuxAnalysis,
        readabilityAnalysis,
        userBehaviorPrediction,
        contentQuality,
        overallInsights
      };

    } catch (error) {
      logger.error('AI analysis failed', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`AI analysis failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
          logger.info('Browser closed successfully');
        } catch (error) {
          logger.error('Error closing browser', { error: error.message });
        }
      }
    }
  }

  async analyzeWithOpenAI(analysisType, data) {
    try {
      logger.info(`Starting OpenAI analysis for ${analysisType}`);
      
      const prompt = this.promptTemplates[analysisType]
        .replace('{websiteData}', JSON.stringify(data, null, 2))
        .replace('{content}', typeof data === 'string' ? data : JSON.stringify(data));

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a website analysis expert. Provide detailed, actionable insights based on the data provided."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);

    } catch (error) {
      logger.error(`OpenAI analysis failed for ${analysisType}`, {
        error: error.message,
        data: data
      });
      // Fallback to heuristic analysis if OpenAI fails
      logger.info(`Using fallback analysis for ${analysisType}`);
      return this.fallbackAnalysis(analysisType, data);
    }
  }

  async extractWebsiteData(page) {
    return await page.evaluate(() => {
      const getColors = () => {
        const elements = document.querySelectorAll('*');
        const colors = new Set();
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          colors.add(style.color);
          colors.add(style.backgroundColor);
        });
        return Array.from(colors).filter(color => color !== 'rgba(0, 0, 0, 0)');
      };

      return {
        title: document.title,
        content: document.body.innerText,
        layout: {
          width: window.innerWidth,
          height: window.innerHeight,
          sections: document.querySelectorAll('section, div').length
        },
        colors: getColors(),
        navigation: {
          menuItems: document.querySelectorAll('nav a').length,
          links: document.querySelectorAll('a').length
        },
        images: {
          count: document.querySelectorAll('img').length,
          withAlt: document.querySelectorAll('img[alt]').length
        },
        forms: document.querySelectorAll('form').length,
        headings: {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length
        },
        meta: {
          description: document.querySelector('meta[name="description"]')?.content,
          keywords: document.querySelector('meta[name="keywords"]')?.content
        }
      };
    });
  }

  async analyzeUiUx(data) {
    // Rule-based UI/UX analysis
    const score = this.calculateUiUxScore(data);
    const analysis = {
      score,
      strengths: [],
      weaknesses: [],
      suggestions: []
    };

    // Analyze layout
    if (data.layout.sections > 3) {
      analysis.strengths.push('Good content structure with multiple sections');
    } else {
      analysis.weaknesses.push('Limited content structure');
      analysis.suggestions.push('Consider adding more sections to better organize content');
    }

    // Analyze navigation
    if (data.navigation.menuItems > 0) {
      analysis.strengths.push('Navigation menu present');
    } else {
      analysis.weaknesses.push('No navigation menu found');
      analysis.suggestions.push('Add a navigation menu for better user experience');
    }

    // Analyze colors
    if (data.colors.length >= 3) {
      analysis.strengths.push('Good color variety');
    } else {
      analysis.suggestions.push('Consider adding more color variety to improve visual appeal');
    }

    return analysis;
  }

  async analyzeReadability(data) {
    const text = data.content;
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    const score = this.calculateReadabilityScore(avgWordsPerSentence);
    const readingLevel = this.determineReadingLevel(score);

    return {
      score,
      readingLevel,
      suggestions: this.generateReadabilitySuggestions(score, avgWordsPerSentence),
      complexPhrases: this.findComplexPhrases(text)
    };
  }

  async predictUserBehavior(data) {
    // Simple heuristic-based prediction
    const bounceRatePrediction = this.calculateBounceRate(data);
    const engagementScore = this.calculateEngagementScore(data);

    return {
      bounceRatePrediction,
      engagementScore,
      painPoints: this.identifyPainPoints(data),
      improvements: this.suggestImprovements(data)
    };
  }

  async analyzeContentQuality(data) {
    try {
      return {
        score: 70,
        strengths: ['Content is present'],
        weaknesses: ['Automated analysis limited'],
        suggestions: ['Consider manual content review']
      };
    } catch (error) {
      logger.error('Content quality analysis failed', { error: error.message });
      return {
        score: 0,
        strengths: [],
        weaknesses: ['Analysis failed'],
        suggestions: ['Try analysis again']
      };
    }
  }

  // Helper methods
  calculateUiUxScore(data) {
    let score = 70; // Base score
    score += Math.min(data.navigation.menuItems * 5, 15);
    score += Math.min(data.colors.length * 3, 15);
    return Math.min(100, score);
  }

  calculateReadabilityScore(avgWordsPerSentence) {
    if (avgWordsPerSentence <= 14) return 100;
    if (avgWordsPerSentence <= 18) return 80;
    if (avgWordsPerSentence <= 21) return 60;
    if (avgWordsPerSentence <= 25) return 40;
    return 20;
  }

  determineReadingLevel(score) {
    if (score >= 90) return 'Easy to read';
    if (score >= 70) return 'Moderately easy to read';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Difficult';
    return 'Very difficult';
  }

  calculateBounceRate(data) {
    let bounceRate = 50; // Base rate
    if (data.navigation.menuItems > 0) bounceRate -= 10;
    if (data.images > 0) bounceRate -= 5;
    if (data.forms > 0) bounceRate -= 5;
    return Math.max(20, bounceRate);
  }

  calculateEngagementScore(data) {
    let score = 50; // Base score
    score += Math.min(data.images * 2, 20);
    score += Math.min(data.forms * 5, 15);
    score += Math.min(data.navigation.links * 1, 15);
    return Math.min(100, score);
  }

  findComplexPhrases(text) {
    const sentences = text.split(/[.!?]+/);
    return sentences.filter(sentence => 
      sentence.split(/\s+/).length > 25 || 
      sentence.match(/\b\w{13,}\b/g)
    ).slice(0, 5);
  }

  identifyPainPoints(data) {
    const painPoints = [];
    if (data.navigation.menuItems === 0) {
      painPoints.push('Lack of navigation menu');
    }
    if (data.images === 0) {
      painPoints.push('No images found');
    }
    if (data.forms === 0) {
      painPoints.push('No interactive elements');
    }
    return painPoints;
  }

  suggestImprovements(data) {
    const improvements = [];
    if (data.navigation.menuItems < 3) {
      improvements.push('Add more navigation options');
    }
    if (data.images < 3) {
      improvements.push('Include more visual content');
    }
    if (data.forms === 0) {
      improvements.push('Add interactive elements for better engagement');
    }
    return improvements;
  }

  generateReadabilitySuggestions(score, avgWordsPerSentence) {
    const suggestions = [];
    if (score < 70) {
      suggestions.push('Consider breaking down longer sentences');
      suggestions.push('Use simpler language where possible');
    }
    if (avgWordsPerSentence > 20) {
      suggestions.push('Your sentences are quite long. Aim for an average of 15-20 words per sentence.');
    }
    return suggestions;
  }

  calculateContentScore(data) {
    let score = 60; // Base score
    score += Math.min(data.images * 5, 20);
    score += Math.min(data.navigation.links * 2, 20);
    return Math.min(100, score);
  }

  identifyContentStrengths(data) {
    const strengths = [];
    if (data.images > 0) {
      strengths.push('Uses visual content to enhance engagement');
    }
    if (data.navigation.links > 5) {
      strengths.push('Good internal linking structure');
    }
    return strengths;
  }

  identifyContentWeaknesses(data) {
    const weaknesses = [];
    if (data.images === 0) {
      weaknesses.push('Lacks visual content');
    }
    if (data.navigation.links < 3) {
      weaknesses.push('Limited internal linking');
    }
    return weaknesses;
  }

  generateContentSuggestions(data) {
    const suggestions = [];
    if (data.images < 3) {
      suggestions.push('Add more images to improve engagement');
    }
    if (data.navigation.links < 5) {
      suggestions.push('Improve internal linking for better content discovery');
    }
    return suggestions;
  }

  async generateOverallInsights(analyses) {
    try {
      const prompt = `Based on the following website analysis results, provide 3-5 key overall insights and recommendations:

Analysis Results:
${JSON.stringify(analyses, null, 2)}

Provide response in JSON format as an array of strings, each containing one key insight or recommendation.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a website analysis expert. Provide clear, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return JSON.parse(completion.choices[0].message.content);

    } catch (error) {
      logger.error('Failed to generate overall insights', {
        error: error.message
      });
      return this.fallbackOverallInsights(analyses);
    }
  }

  // Add fallback method
  fallbackOverallInsights(analyses) {
    const insights = [];
    
    if (analyses.uiuxAnalysis.score >= 80) {
      insights.push('Strong UI/UX design with good user experience');
    } else {
      insights.push('UI/UX could be improved for better user experience');
    }

    if (analyses.readabilityAnalysis.score >= 80) {
      insights.push('Content is well-written and easy to understand');
    } else {
      insights.push('Content readability could be improved');
    }

    if (analyses.userBehaviorPrediction.engagementScore >= 80) {
      insights.push('High user engagement potential');
    } else {
      insights.push('Consider implementing suggested improvements to increase user engagement');
    }

    return insights;
  }

  // Fallback methods in case OpenAI API fails
  fallbackAnalysis(analysisType, data) {
    logger.info(`Using fallback analysis for ${analysisType}`);
    switch (analysisType) {
      case 'uiux':
        return {
          score: 70,
          strengths: ['Basic UI elements present'],
          weaknesses: ['Automated analysis limited'],
          suggestions: ['Consider manual UI review']
        };
      case 'readability':
        return {
          score: 70,
          readingLevel: 'Moderate',
          suggestions: ['Consider manual content review'],
          complexPhrases: []
        };
      case 'userBehavior':
        return {
          bounceRatePrediction: 50,
          engagementScore: 70,
          painPoints: ['Automated analysis limited'],
          improvements: ['Consider manual user testing']
        };
      default:
        return null;
    }
  }
}

module.exports = new AiAnalyzer(); 