const express = require('express');
const bodyParser = require('body-parser');
const CandidateCreateQueue = require('../../models/CandidateCreateQueue');
const logger = require('../../utils/logger')('CANDIDATE CREATE WEBHOOK');

const router = express.Router();

router.post('/cc-webhook', bodyParser.text({ type: 'text/plain' }), async (req, res) => {
  try {
    const body = JSON.parse(req.body);

    const requiredFields = ['entityId', 'userId', 'timestamp'];
    const missingFields = requiredFields.filter(field => !body.hasOwnProperty(field));

    if (missingFields.length > 0) {
      return logger.res({msg: `Missing required fields: ${missingFields.join(', ')}`, status: 400, res, error: JSON.stringify(body)});
    }

    const { entityId, userId, timestamp } = body;
    const timestampDate = new Date(parseInt(timestamp));

    await CandidateCreateQueue.create({
      entityId,
      userId,
      timestamp: timestampDate
    });

    logger.res({msg: 'Webhook received and stored in Candidate Create Queue', status: 200, res});
  } catch (error) {
    logger.res({msg: 'Error processing webhook', error, status: 500, res});
  }
});

module.exports = router;
