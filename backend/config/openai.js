const OpenAI = require('openai');
const logger = require('../utils/logger');

if (!process.env.OPENAI_API_KEY) {
  logger.warn('OpenAI API key is missing. Some AI features may not work.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
});

module.exports = openai; 