// ./scripts/testRateLimit.js
const vincereRequest = require('../utils/vincereRequest');
const logger = require('../utils/logger')('RATE LIMIT TEST');
const config = require('../config'); // Assuming this contains `tenantUrl`

async function testRateLimit() {
  while (true) {
    try {
      const response = await vincereRequest({
        method: 'get',
        url: `https://${config.vincereTenantUrl}/api/v2/user/summaries/all`,
      });

      
    logger.res({msg: `Request successful at ${new Date().toISOString()}`});

    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Log when rate limit is hit
        logger.res({msg: 'Rate limit hit'});
      } else {
        // Log other errors
        logger.res({msg: `Error: ${error.message}`});
      }
    }
  }
}

module.exports = testRateLimit;
