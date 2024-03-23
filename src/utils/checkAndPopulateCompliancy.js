const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CandidateCompliancy = require('../models/CandidateCompliancy');
const vincereRequest = require('../utils/vincereRequest');
const config = require('../config');
const logger = require('../utils/logger')('POPULATE COMPLIANCY');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkAndPopulateCompliancy() {
    let existingIds = await CandidateCompliancy.find().sort({ candidateId: 1 }).distinct('candidateId');
    let consecutiveFailures = 0;
    let addedEntries = 0;
    let requestCount = 0;
    let startTime = Date.now();

    const currentCount = await CandidateCompliancy.countDocuments();
    let id = 62800 + currentCount;

    let skipStart = null;
    let skipEnd = null;

    const logSkipRange = () => {
        if (skipStart !== null) {
            let msg = `Entries exist for candidate IDs ${skipStart}`;
            if (skipEnd) {
                msg += ` to ${skipEnd}`;
            }
            msg += `, skipping.`;
            logger.res({ msg, status: 200 });
            skipStart = null;
            skipEnd = null;
        }
    };

    while (consecutiveFailures < 100) {
        if (requestCount >= 10) {
            let elapsedTime = Date.now() - startTime;
            if (elapsedTime < 1000) {
                await sleep(1000 - elapsedTime);
            }
            requestCount = 0;
            startTime = Date.now();
        }

        if (existingIds.includes(id)) {
            if (skipStart === null) {
                skipStart = id;
            }
            skipEnd = id;
            id++;
            continue;
        } else {
            logSkipRange();
        }

        try {
            const response = await vincereRequest({
                method: 'get',
                url: `https://${config.vincereTenantUrl}/api/v2/candidate/${id}/customfields`,
            });
            requestCount++;

            if (response && response.data) {
                const compliancyField = response.data.find(field => field.key === config.compliantKey);
                let compliantStatus = 'null';
                if (compliancyField && compliancyField.field_value_ids) {
                    compliantStatus = config.compliantYesFields.includes(compliancyField.field_value_ids[0].toString()) ? 'yes' :
                                      config.compliantNoFields.includes(compliancyField.field_value_ids[0].toString()) ? 'no' : 'null';
                }

                await CandidateCompliancy.create({ candidateId: id, compliant: compliantStatus });
                logger.res({msg: `Successful request for candidate ID: ${id} with status: ${compliantStatus}`, status: 200});
                addedEntries++;
                consecutiveFailures = 0;
            } else {
                logger.res({msg: `No data returned for candidate ID: ${id}`, status: 404});
                consecutiveFailures++;
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                logger.res({msg: `Rate limit exceeded at candidate ID: ${id}. Pausing requests.`, status: 429});
                await sleep(1000);
                continue;
            } else {
                logger.res({msg: `Request failed for candidate ID: ${id}. Error: ${error.message}`, status: 500});
                consecutiveFailures++;
            }
        }
        id++;
    }

    logSkipRange();

    const finalCount = await CandidateCompliancy.countDocuments();
    logger.res({msg: `Compliancy population process complete. Total entries added: ${addedEntries}. Total entries in collection now: ${finalCount}.`, status: 200});
}

module.exports = checkAndPopulateCompliancy;
