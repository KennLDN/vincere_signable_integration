const vincereRequest = require('../utils/vincereRequest');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');

const logger = require('../utils/logger')('FETCH CANDIDATE CUSTOM FIELDS SCRIPT');

dotenv.config();

const fetchCandidateCustomFields = async (id, logResults = true) => {
  try {
    const tenantUrl = vincereTenantUrl;
    if (!tenantUrl) {
      throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
    }

    const url = `https://${tenantUrl}/api/v2/candidate/${id}/customfields`;

    const response = await vincereRequest({
      method: 'get',
      url: url,
    });

    if (logResults) {
      logger.res({msg: 'Candidate custom fields fetched successfully.', error: JSON.stringify(response.data, null, 2)});
    }
    return response.data;
  } catch (error) {
    if (logResults) {
      logger.res({msg: 'Error fetching candidate custom fields.', error});
    }
    throw error;
  }
};

module.exports = fetchCandidateCustomFields;
