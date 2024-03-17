const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('READ DLQ SCRIPT');

dotenv.config();

const readDLQ = async () => {
  try {
    const webhookId = '06d82c6e-7a85-4740-b841-b46c3fa0d202';
    const tenantUrl = vincereTenantUrl;
    if (!tenantUrl) {
      throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
    }

    const response = await vincereRequest({
      method: 'post',
      url: `https://${tenantUrl}/api/v2/webhooks/${webhookId}/dlq`,
    });

    logger.res({msg: 'DLQ request successful.', error: JSON.stringify(response.data, null, 2)});
  } catch (error) {
    logger.res({msg: 'Error reading DLQ.', error});
  }
};

module.exports = readDLQ;