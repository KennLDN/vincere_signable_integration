const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../../utils/logger')('ENVELOPE REJECTED WEBHOOK');
const ReferenceLogs = require('../../models/ReferenceLogs');

const router = express.Router();

router.post('/er-webhook', bodyParser.text({ type: '*/*' }), async (req, res) => {
  try {
    const params = new URLSearchParams(req.body);
    const envelopeFingerprint = params.get('envelope_fingerprint');

    if (!envelopeFingerprint) {
      throw new Error('Envelope fingerprint not found in webhook payload');
    }

    logger.res({ msg: `Webhook received with envelope fingerprint: ${envelopeFingerprint}` });

    const updateConditions = [
      { oneFingerprint: envelopeFingerprint },
      { twoFingerprint: envelopeFingerprint },
      { threeFingerprint: envelopeFingerprint }
    ];

    let updateApplied = false;

    for (let condition of updateConditions) {
      const keyToUpdateStatus = Object.keys(condition)[0].replace('Fingerprint', 'Status');
      const keyToUpdateMsg = Object.keys(condition)[0].replace('Fingerprint', 'Msg');
      const updatedDoc = await ReferenceLogs.findOneAndUpdate(condition, {
        $set: {
          [keyToUpdateStatus]: -1,
          [keyToUpdateMsg]: 'envelope was rejected by party'
        }
      }, { new: true });

      if (updatedDoc) {
        logger.res({ msg: `ReferenceLogs updated for fingerprint: ${envelopeFingerprint}`});
        updateApplied = true;
        break;
      }
    }

    if (!updateApplied) {
      logger.res({ msg: `No ReferenceLogs entry found for envelope fingerprint: ${envelopeFingerprint}` });
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    logger.res({
      msg: `Error processing webhook: ${error.message}`,
      error: error.stack,
      status: 500
    });
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
