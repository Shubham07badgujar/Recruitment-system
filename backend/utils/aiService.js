const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Call AI microservice endpoints
 * @param {string} endpoint - The AI service endpoint to call
 * @param {Object} data - The data to send to the AI service
 * @returns {Promise<Object>} - The response data from the AI service
 */
const callAIService = async (endpoint, data) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calling AI service ${endpoint}:`, error.message);
    throw new Error(`AI service error: ${error.message}`);
  }
};

module.exports = {
  callAIService
};
