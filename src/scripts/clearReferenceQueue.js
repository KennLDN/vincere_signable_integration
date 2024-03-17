const ReferenceQueue = require('../models/ReferenceQueue'); 
const logger = require('../utils/logger')('CLEAR REFERENCE QUEUE');

const clearReferenceQueue = async () => {
  try {
    const result = await ReferenceQueue.deleteMany({});
    logger.res({msg: `Cleared ReferenceQueue. Documents removed: ${result.deletedCount}`, status: 200});
  } catch (error) {
    logger.res({msg: 'Error clearing ReferenceQueue', error, status: 500});
  }
};

module.exports = clearReferenceQueue;