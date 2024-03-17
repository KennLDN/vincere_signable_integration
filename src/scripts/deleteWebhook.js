const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('DELETE WEBHOOK SCRIPT');

dotenv.config();

const deleteWebhook = async (webhookId) => {
  try {
    const tenantUrl = vincereTenantUrl;
    if (!tenantUrl) {
      throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
    }

    const response = await vincereRequest({
      method: 'delete',
      url: `https://${tenantUrl}/api/v2/webhooks/${webhookId}`,
    });

    logger.res({msg: 'Webhook deleted successfully.', error: response.data});
  } catch (error) {
    logger.res({msg: `Error deleting webhook: ${webhookId}`, error: JSON.stringify(error.response.data, null, 2)});
  }
};

module.exports = deleteWebhook;
