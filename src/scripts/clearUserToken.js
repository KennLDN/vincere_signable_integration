const UserToken = require('../models/UserToken');
const logger = require('../utils/logger')('CLEAR USER TOKEN');

const clearUserToken = async () => {
  try {
    const result = await UserToken.deleteMany({});
    logger.res({msg: `Cleared UserToken. Documents removed: ${result.deletedCount}`, status: 200});
  } catch (error) {
    logger.res({msg: 'Error clearing UserToken', error, status: 500});
  }
};

module.exports = clearUserToken;
