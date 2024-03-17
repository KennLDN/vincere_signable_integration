const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('UPDATE WEBHOOK SCRIPT');

dotenv.config();

const updateWebhook = async (id, entityType, actionTypes) => {
  try {
    const webhookPayload = {
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
      method: 'put',
      url: `https://${tenantUrl}/api/v2/webhooks/${id}`,
      data: webhookPayload,
    });

    logger.res({msg: 'Webhook updated successfully.', error: JSON.stringify(response.data, null, 2)});
  } catch (error) {
    logger.res({msg: 'Error updating webhook.', error});
  }
};

module.exports = updateWebhook;
