const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('CREATE WEBHOOK SCRIPT');

dotenv.config();

const createWebhook = async (webhookUrl, entityType, actionTypes) => {
  try {
    const webhookPayload = {
      webhook_url: webhookUrl,
      events: [{
        entity_type: entityType,
        action_types: actionTypes.split(',')
      }]
    };

    const tenantUrl = vincereTenantUrl;
    if (!tenantUrl) {
      throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
    }

    const response = await vincereRequest({
      method: 'post',
      url: `https://${tenantUrl}/api/v2/webhooks`,
      data: webhookPayload,
    });      

    logger.res({msg: 'Webhook created successfully.', error: JSON.stringify(response.data)});
  } catch (error) {
    logger.res({msg: 'Error creating webhook.', error});
  }
};

module.exports = createWebhook;
