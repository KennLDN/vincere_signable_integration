// utils/processCreateWebhookQueue.js

const CandidateCreateQueue = require('../models/CandidateCreateQueue');
const compliancyAdd = require('./compliancyAdd');
const processReferenceFields = require('./processReferenceFields');
const { vincereTenantUrl } = require('../config');
const dotenv = require('dotenv');
const logger = require('./logger')('CREATE WEBHOOK QUEUE PROCESS');

dotenv.config();

const processCreateWebhookQueue = async () => {
  const tenantUrl = vincereTenantUrl;
  if (!tenantUrl) {
    throw new Error('VINCERE_TENANT_URL is not defined in environment variables.');
  }

  while (true) {
    let item = null;
    try {
      item = await CandidateCreateQueue.findOne().sort({ timestamp: 1 });
      if (!item) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      compliancyAdd(item.entityId, item.userId);
      processReferenceFields(item.entityId, item.userId);

      await CandidateCreateQueue.findByIdAndDelete(item._id);
      logger.res({
        msg: 'New candidate processed and removed from the queue.',
        error: `Processed new candidate - entityId: ${item.entityId}, userId: ${item.userId}, timestamp: ${item.timestamp.toISOString()}`
      });

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      logger.res({msg: 'Error processing new candidate from the queue.', error});
      if (item && item._id) {
        await CandidateCreateQueue.findByIdAndDelete(item._id);
        logger.res({msg: 'Failed item removed from the create queue despite error.'});
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

module.exports = processCreateWebhookQueue;
