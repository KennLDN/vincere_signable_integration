const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('FETCH USERS SCRIPT');

dotenv.config();

const fetchUsers = async (logResults = true) => {
  try {
    const tenantUrl = vincereTenantUrl;
    if (!tenantUrl) {
      throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
    }

    const response = await vincereRequest({
      method: 'get',
      url: `https://${tenantUrl}/api/v2/user/summaries/all`,
    });

    if (logResults) {
      logger.res({msg: 'Users fetched successfully.', error: JSON.stringify(response.data, null, 2)});
    }
    return response.data;
  } catch (error) {
    if (logResults) {
      logger.res({msg: 'Error fetching users.', error: error.toString()});
    }
    throw error;
  }
};

module.exports = fetchUsers;
