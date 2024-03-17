const CandidateCompliancy = require('../models/CandidateCompliancy');
const vincereRequest = require('./vincereRequest');
const { vincereTenantUrl } = require('../config');
const logger = require('./logger')('CANDIDATE NAME POPULATE');

const populateCandidateName = async (candidateId) => {
    try {
        const candidateCompliancy = await CandidateCompliancy.findOne({ candidateId });

        if (!candidateCompliancy) {
            throw new Error(`CandidateCompliancy entry not found for candidate ID: ${candidateId}`);
        }

        if (candidateCompliancy.name) {
            return;
        }

        const candidateInfoResponse = await vincereRequest({
            method: 'get',
            url: `https://${vincereTenantUrl}/api/v2/candidate/${candidateId}`,
        });

        const fullName = `${candidateInfoResponse.first_name} ${candidateInfoResponse.last_name}`;

        candidateCompliancy.name = fullName;
        await candidateCompliancy.save();

        logger.res({ msg: `Name populated for candidate ID: ${candidateId} - ${fullName}`, status: 200 });
    } catch (error) {
        logger.res({ msg: `Error populating name for candidate ID: ${candidateId}.`, error: error.toString(), status: 500 });
    }
};

module.exports = populateCandidateName;
