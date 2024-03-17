const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('../utils/logger')('SIGNABLE REQUEST');

dotenv.config();

const signableRequest = async (options) => {
  try {
    const apiKey = process.env.SIGNABLE_API_KEY;
    if (!apiKey) {
      throw new Error('SIGNABLE_API_KEY not found in environment variables.');
    }

    const auth = Buffer.from(`${apiKey}:x`).toString('base64');

    const headers = {
      ...options.headers,
      'Authorization': `Basic ${auth}`,
    };

    const response = await axios({
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    logger.res({msg: 'Error making authenticated request to Signable.', error});
    throw error;
  }
};

module.exports = signableRequest;
