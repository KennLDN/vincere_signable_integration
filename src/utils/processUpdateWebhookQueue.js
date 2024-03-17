const CandidateUpdateQueue = require('../models/CandidateUpdateQueue');
const compliancyCheck = require('./compliancyCheck');
const processReferenceFields = require('./processReferenceFields');
const populateCandidateName = require('./populateCandidateName');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');
const logger = require('./logger')('UPDATE WEBHOOK QUEUE PROCESS');

dotenv.config();

const processUpdateWebhookQueue = async () => {
  const tenantUrl = vincereTenantUrl;
  if (!tenantUrl) {
    throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
  }

  while (true) {
    let item = null;
    try {
      item = await CandidateUpdateQueue.findOne().sort({ timestamp: 1 });
      if (!item) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      const timestampUpperBound = new Date(item.timestamp.getTime() + 10);
      const timestampLowerBound = new Date(item.timestamp.getTime() - 10);

      const duplicates = await CandidateUpdateQueue.find({
        entityId: item.entityId,
        userId: item.userId,
        timestamp: {
          $gte: timestampLowerBound,
          $lte: timestampUpperBound
        },
        _id: { $ne: item._id }
      });

      if (duplicates.length > 0) {
        await CandidateUpdateQueue.findByIdAndDelete(item._id);
        logger.res({msg: 'Duplicate item found in queue, skipping.'});
      } else {
        
        populateCandidateName(item.entityId);
        compliancyCheck(item.entityId, item.userId);
        processReferenceFields(item.entityId, item.userId);

        await CandidateUpdateQueue.findByIdAndDelete(item._id);
        logger.res({
          msg: 'Successful item removed from the queue.',
          error: `Processed item details - entityId: ${item.entityId}, userId: ${item.userId}, timestamp: ${item.timestamp.toISOString()}`
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      logger.res({msg: 'Error processing item from the queue.', error});
      if (item && item._id) {
        await CandidateUpdateQueue.findByIdAndDelete(item._id);
        logger.res({msg: 'Failed item removed from the queue despite error.'});
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

module.exports = processUpdateWebhookQueue;
