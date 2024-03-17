const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('FETCH WEBHOOKS SCRIPT');

dotenv.config();

const fetchWebhooks = async () => {
  try {
    const tenantUrl = vincereTenantUrl;
    if (!tenantUrl) {
      throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
    }

    const response = await vincereRequest({
      method: 'get',
      url: `https://${tenantUrl}/api/v2/webhooks`,
    });

    logger.res({msg: 'Webhook fetched successfully.', error: JSON.stringify(response.data, null, 2)});
  } catch (error) {
    logger.res({msg: 'Error creating webhook.', error});
  }
};

module.exports = fetchWebhooks;