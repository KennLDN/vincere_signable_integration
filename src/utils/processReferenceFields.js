const dotenv = require('dotenv');
const ReferenceLogs = require("../models/ReferenceLogs");
const ReferenceQueue = require("../models/ReferenceQueue");
const InvalidEmails = require("../models/InvalidEmails");
const fetchCandidateCustomFields = require("../scripts/fetchCandidateCustomFields");
const { isEmailValid } = require("./validators");
const logger = require('./logger')('REFERENCE FIELDS PROCESS');

dotenv.config();

const dbValueMap = ['one', 'two', 'three'];
const schlFields = process.env.REFERENCE_SCHL_FIELDS.split(',');
const charFields = process.env.REFERENCE_CHAR_FIELDS.split(',');
const profFields = process.env.REFERENCE_PROF_FIELDS.split(',');

const checkReferenceFields = async (entityId, userId) => {
    const customFields = await fetchCandidateCustomFields(entityId, false);

    for (let i = 1; i <= 3; i++) {
        const typeFieldValue = customFields.find(field => field.key === process.env[`REFERENCE_${i}_TYPE`])?.field_value_ids;
        const contactFieldValue = customFields.find(field => field.key === process.env[`REFERENCE_${i}_CONTACT`])?.field_value;
        const emailFieldValue = customFields.find(field => field.key === process.env[`REFERENCE_${i}_EMAIL`])?.field_value;

        const isInvalidEmail = await InvalidEmails.findOne({ email: emailFieldValue });
        if (isInvalidEmail) {
            continue;
        }

        const allFields = [process.env.REFERENCE_SCHL_FIELDS, process.env.REFERENCE_PROF_FIELDS, process.env.REFERENCE_CHAR_FIELDS].join(',').split(',');
        let entryType = null;
        if (typeFieldValue && allFields.includes(String(typeFieldValue[0]))) {
            const matchesSchlFields = typeFieldValue.some(value => schlFields.includes(String(value)));
            const matchesCharFields = typeFieldValue.some(value => charFields.includes(String(value)));
            const matchesProfFields = typeFieldValue.some(value => profFields.includes(String(value)));
        
            if (matchesSchlFields) {
                entryType = 'SCHL';
            } else if (matchesCharFields) {
                entryType = 'CHAR';
            } else if (matchesProfFields) {
                entryType = 'PROF';
            }

            let referenceLog = await ReferenceLogs.findOne({ entityId: entityId });
            if (!referenceLog) {
                referenceLog = new ReferenceLogs({ entityId: entityId });
                await referenceLog.save();
                logger.res({ msg: `ReferenceLog entry created for entityId: ${entityId}`, error: null });
            }

            if (!contactFieldValue || !emailFieldValue || !isEmailValid(emailFieldValue)) {
                if (referenceLog[`${dbValueMap[i-1]}Status`] === 0) {
                    referenceLog[`${dbValueMap[i-1]}Msg`] = 'Fields are missing or invalid';
                    referenceLog[`${dbValueMap[i-1]}Date`] = new Date().toISOString();
                    referenceLog[`${dbValueMap[i-1]}User`] = userId;
                    referenceLog[`${dbValueMap[i-1]}Status`] = -1;
                    await referenceLog.save();
                }
                continue;
            }            

            if (referenceLog[`${dbValueMap[i - 1]}Status`] !== 2) {
                const existingEntry = await ReferenceQueue.findOne({
                    entityId,
                    userId,
                    index: i
                });

                if (existingEntry) {
                    if (existingEntry.contact !== contactFieldValue || existingEntry.email !== emailFieldValue || existingEntry.type !== entryType) {
                        existingEntry.contact = contactFieldValue;
                        existingEntry.email = emailFieldValue;
                        existingEntry.type = entryType;
                        await existingEntry.save();
                        logger.res({ msg: `Updated existing entry in Reference Queue.`, error: i });
                    }
                } else {
                    await ReferenceQueue.create({
                        entityId,
                        userId,
                        contact: contactFieldValue,
                        email: emailFieldValue,
                        type: entryType,
                        index: i
                    });
                    logger.res({ msg: `Entry added to Reference Queue.`, error: i });
                }
            }
        }
    }
};

module.exports = checkReferenceFields;
