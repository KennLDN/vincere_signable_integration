const axios = require('axios');
const Token = require('../models/Token');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('VINCERE REQUEST');

dotenv.config();

const vincereRequest = async (options) => {
  try {
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
