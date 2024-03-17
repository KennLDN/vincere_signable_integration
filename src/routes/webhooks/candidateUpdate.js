const express = require('express');
const bodyParser = require('body-parser');
const CandidateUpdateQueue = require('../../models/CandidateUpdateQueue');
const logger = require('../../utils/logger')('CANDIDATE UPDATE WEBHOOK');

const router = express.Router();

router.post('/cu-webhook', bodyParser.text({ type: 'text/plain' }), async (req, res) => {
  let body = '';
  try {
    body = JSON.parse(req.body);

    const requiredFields = ['entityId', 'userId', 'timestamp'];
    const missingFields = requiredFields.filter(field => !body.hasOwnProperty(field));

    if (missingFields.length > 0) {
      return logger.res({msg: `Missing required fields: ${missingFields.join(', ')}`, status: 400, res, error: JSON.stringify(body)});
    }

    const { entityId, userId, timestamp } = body;
    const timestampDate = new Date(parseInt(timestamp));

    await CandidateUpdateQueue.create({
      entityId,
      userId,
      timestamp: timestampDate
    });

    logger.res({msg: 'Webhook received and stored in Candidate Update Queue', status: 200, res});
  } catch (error) {
    logger.res({
      msg: `Error processing webhook: ${error.message}`,
      status: 500,
      res
    });
  }
});

module.exports = router;
