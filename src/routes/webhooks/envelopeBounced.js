const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../../utils/logger')('ENVELOPE BOUNCED WEBHOOK');
const ReferenceLogs = require('../../models/ReferenceLogs');
const InvalidEmails = require('../../models/InvalidEmails');

const router = express.Router();

router.post('/eb-webhook', bodyParser.text({ type: '*/*' }), async (req, res) => {
  try {
    const params = new URLSearchParams(req.body);
    const envelopeFingerprint = params.get('envelope_fingerprint');
    const bouncedEmail = params.get('envelope_bounce_email');

    if (!envelopeFingerprint || !bouncedEmail) {
      throw new Error('Envelope fingerprint or bounced email not found in webhook payload');
    }

    logger.res({ msg: `Webhook received with envelope fingerprint: ${envelopeFingerprint} and bounced email: ${bouncedEmail}` });

    await InvalidEmails.create({ email: bouncedEmail });
    logger.res({ msg: `Invalid email logged: ${bouncedEmail}` });

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
          [keyToUpdateMsg]: 'envelope bounced back'
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
