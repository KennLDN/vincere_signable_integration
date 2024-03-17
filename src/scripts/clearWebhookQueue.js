const CandidateUpdateQueue = require('../models/CandidateUpdateQueue');
const logger = require('../utils/logger')('CLEAR WEBHOOK QUEUE');

const clearWebhookQueue = async () => {
  try {
    const result = await CandidateUpdateQueue.deleteMany({});
    logger.res({msg: `Cleared CandidateUpdateQueue. Documents removed: ${result.deletedCount}`, status: 200});
  } catch (error) {
    logger.res({msg: 'Error clearing CandidateUpdateQueue', error, status: 500});
  }
};

module.exports = clearWebhookQueue;
