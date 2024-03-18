const ReferenceQueue = require('../models/ReferenceQueue');
const ReferenceLogs = require('../models/ReferenceLogs');
const User = require('../models/Users');
const signableRequest = require('./signableRequest');
const vincereRequest = require('./vincereRequest');
const { vincereTenantUrl } = require('../config');
const logger = require('./logger')('REFERENCE QUEUE PROCESS');

const dbValueMap = ['one', 'two', 'three'];

const processEntry = async (entry, referenceLog, msgKey, statusKey, fingerprintKey, userKey, dateKey) => {
    try {
        const candidateResponse = await vincereRequest({
            method: 'get',
            url: `https://${vincereTenantUrl}/api/v2/candidate/${entry.entityId}`,
        });
        const candidateInfo = candidateResponse.data ? candidateResponse.data : candidateResponse;

        const user = await User.findOne({ id: entry.userId });
        if (!user || !user.signable_id) {
            logger.res({ msg: `User with ID ${entry.userId} not found or missing signable_id.` });
            referenceLog[statusKey] = -1;
            referenceLog[userKey] = entry.userId;
            referenceLog[dateKey] = new Date().toISOString();
            referenceLog[msgKey] = "user does not have a signable account.";
            await referenceLog.save();
            return;
        }

        if (!candidateInfo || !candidateInfo.first_name || !candidateInfo.last_name) {
            logger.res({ msg: `Candidate with ID ${entry.entityId} not found or missing name.` });
            referenceLog[statusKey] = -1;
            referenceLog[userKey] = entry.userId;
            referenceLog[dateKey] = new Date().toISOString();
            referenceLog[msgKey] = "candidate could not be found? this should not happen.";
            await referenceLog.save();
            return;
        }

        const candidateName = `${candidateInfo.first_name} ${candidateInfo.last_name}`;
        const docType = { SCHL: 'School', PROF: 'Professional', CHAR: 'Character' }[entry.type];
        const documentTemplateFingerprint = process.env[`${entry.type}_TEMPLATE`];
        const mergeFieldId = process.env[`${entry.type}_MERGE_ID`];
        const partyId = process.env[`${entry.type}_PARTY_ID`];

        const data = {
            envelope_title: `${candidateName} - ${docType} Reference Request`,
            user_id: user.signable_id,
            envelope_documents: [
                {
                    document_title: `${candidateName} - ${docType} Reference Request`,
                    document_template_fingerprint: documentTemplateFingerprint,
                    document_merge_fields: [
                        {
                            field_id: mergeFieldId,
                            field_value: candidateName
                        }
                    ]
                }
            ],
            envelope_parties: [
                {
                    party_name: entry.contact,
                    party_email: entry.email,
                    party_id: partyId,
                }
            ]
        };

        const response = await signableRequest({
            method: 'post',
            url: 'https://api.signable.co.uk/v1/envelopes',
            data: data,
            headers: { 'Content-Type': 'application/json' }
        });

        logger.res({ msg: `Reference request sent for ${candidateName} (${docType}).` });
        referenceLog[msgKey] = "reference request sent";
        referenceLog[userKey] = entry.userId;
        referenceLog[dateKey] = new Date().toISOString();
        referenceLog[fingerprintKey] = response.data.envelope_fingerprint;
        await referenceLog.save();
        await ReferenceQueue.deleteOne({ _id: entry._id });
    } catch (error) {
        logger.res({ msg: 'Error processing reference queue entry:', error });
        referenceLog[statusKey] = -1;
        referenceLog[userKey] = entry.userId;
        referenceLog[dateKey] = new Date().toISOString();
        referenceLog[msgKey] = "error sending reference request";
        await referenceLog.save();
    }
};

const processReferenceQueue = async () => {
    let lastProcessedAt = null;

    while (true) {
        const query = lastProcessedAt ? { updatedAt: { $gt: lastProcessedAt } } : {};
        const queueEntries = await ReferenceQueue.find(query).sort({ updatedAt: 1 }).limit(1);

        if (queueEntries.length === 0) {
            if (lastProcessedAt !== null) {
                lastProcessedAt = null;
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
        }

        const entry = queueEntries[0];
        const referenceLog = await ReferenceLogs.findOne({ entityId: entry.entityId });

        if (!referenceLog) {
            logger.res({ msg: `No matching ReferenceLogs found for entityId ${entry.entityId}.` });
            continue;
        }

        const statusKey = `${dbValueMap[entry.index - 1]}Status`;
        const fingerprintKey = `${dbValueMap[entry.index - 1]}Fingerprint`;
        const msgKey = `${dbValueMap[entry.index - 1]}Msg`;
        const userKey = `${dbValueMap[entry.index - 1]}User`;
        const dateKey = `${dbValueMap[entry.index - 1]}Date`;
        const currentStatus = referenceLog[statusKey];

        if (currentStatus === 0 || currentStatus === -1) {
            referenceLog[statusKey] = 1;
            referenceLog[dateKey] = new Date().toISOString();
            referenceLog[msgKey] = "sending reference request";
            await referenceLog.save();

            await processEntry(entry, referenceLog, msgKey, statusKey, fingerprintKey, userKey, dateKey);

        } else if (currentStatus === 2) {
            await ReferenceQueue.deleteOne({ _id: entry._id });
        }

        lastProcessedAt = entry.updatedAt;
    }
};

module.exports = processReferenceQueue;
