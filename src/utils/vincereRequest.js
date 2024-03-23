const axios = require('axios');
const Token = require('../models/Token');
const dotenv = require('dotenv');
const { getClient } = require('../config/redis');
const logger = require('../utils/logger')('VINCERE REQUEST');

dotenv.config();

const PER_SECOND_LIMIT = 8;
const DAILY_LIMIT = 45000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkRateLimit = async () => {
  const redisClient = getClient();
  while (true) {
    const currentSecond = Math.floor(Date.now() / 1000);
    const currentDay = Math.floor(Date.now() / 1000 / 86400);
    const secondKey = `vincereRateLimit:perSecond:${currentSecond}`;
    const dayKey = `vincereRateLimit:perDay:${currentDay}`;

    // Ensure these commands are supported and correctly used in your Redis client version
    const requestsThisSecond = await redisClient.incr(secondKey);
    const requestsToday = await redisClient.incr(dayKey);
    await redisClient.expire(secondKey, 2); // Handle edge cases by allowing a 2-second expiration
    await redisClient.expire(dayKey, 86400); // Set to expire after 24 hours

    if (requestsThisSecond <= PER_SECOND_LIMIT && requestsToday <= DAILY_LIMIT) {
      return; // Exit the loop and proceed with the request
    }

    await delay(1000); // Wait and retry
  }
};

const vincereRequest = async (options) => {
  try {
    await checkRateLimit();

    const tokenDoc = await Token.findOne({});
    if (!tokenDoc || !tokenDoc.id_token) {
      throw new Error('No ID token found. Please authenticate.');
    }

    const headers = {
      ...options.headers,
      'id-token': tokenDoc.id_token,
      'x-api-key': process.env.VINCERE_API_KEY,
    };

    const response = await axios({
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    logger.res({msg: 'Error making authenticated request to Vincere.', error});
    throw error;
  }
};

module.exports = vincereRequest;
