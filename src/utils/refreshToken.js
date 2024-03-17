const axios = require('axios');
const Token = require('../models/Token');
const { vincereClientId, vincereTokenUrl } = require('../config');

const logger = require('../utils/logger')('TOKEN REFRESH');

const refreshToken = async () => {
  try {
    const tokenDoc = await Token.findOne({});
    if (!tokenDoc || !tokenDoc.refresh_token) {
      throw new Error('No refresh token found');
    }

    const params = new URLSearchParams();
    params.append('client_id', vincereClientId);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', tokenDoc.refresh_token);

    const response = await axios.post(vincereTokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { id_token, refresh_token } = response.data;

    await Token.findOneAndUpdate({}, {
      id_token: id_token,
      refresh_token: refresh_token,
      updatedAt: Date.now(),
    }, { new: true });

    logger.res({msg: 'Token refreshed successfully.'});
  } catch (error) {
    logger.res({msg: 'Error refreshing token', error});
  }
};

module.exports = refreshToken;