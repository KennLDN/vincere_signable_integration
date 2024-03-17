const signableRequest = require('../utils/signableRequest');
const logger = require('../utils/logger')('SIGNABLE SCRIPTS');

const fetchEnvelopes = async () => {
  try {
    const options = {
      method: 'get',
      url: 'https://api.signable.co.uk/v1/envelopes?offset=0&limit=50',
    };

    const response = await signableRequest(options);
    logger.res({msg: 'Envelopes fetched successfully:', error: JSON.stringify(response.data)});
    
  } catch (error) {
    logger.res({msg: 'Failed to fetch envelopes:', error});
  }
};

const fetchTemplates = async () => {
    try {
      const options = {
        method: 'get',
        url: 'https://api.signable.co.uk/v1/templates?offset=0&limit=10',
      };
  
      const response = await signableRequest(options);
      logger.res({msg: 'Templates fetched successfully:', error: JSON.stringify(response.data)});
      
    } catch (error) {
      logger.res({msg: 'Failed to fetch templates:', error});
    }
  };

  const fetchUsers = async (logResults = true) => {
    try {
      const options = {
        method: 'get',
        url: 'https://api.signable.co.uk/v1/users?offset=0&limit=20',
      };
  
      const response = await signableRequest(options);
  
      if (logResults) {
        logger.res({msg: 'Users fetched successfully:', error: JSON.stringify(response.data)});
      }
      
      return response.data;
    } catch (error) {
      if (logResults) {
        logger.res({msg: 'Failed to fetch users:', error: error.toString()});
      }
      throw error;
    }
  };  

module.exports = {
  fetchEnvelopes,
  fetchTemplates,
  fetchUsers
};
