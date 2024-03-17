const ReferenceLogs = require('../models/ReferenceLogs');
const logger = require('../utils/logger')('CLEAR REFERENCE LOGS');

const clearReferenceLogs = async () => {
  try {
    const result = await ReferenceLogs.deleteMany({});
    logger.res({msg: `Cleared ReferenceLogs. Documents removed: ${result.deletedCount}`, status: 200});
  } catch (error) {
    logger.res({msg: 'Error clearing ReferenceLogs', error, status: 500});
  }
};

module.exports = clearReferenceLogs;
