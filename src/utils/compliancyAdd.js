const CandidateCompliancy = require('../models/CandidateCompliancy');
const CompliancyLogs = require('../models/CompliancyLogs');
const vincereRequest = require('./vincereRequest');
const { vincereTenantUrl } = require('../config');
const logger = require('./logger')('COMPLIANCY ADD');

const compliancyAdd = async (entityId, userId) => {
    try {
        const customFieldsResponse = await vincereRequest({
            method: 'get',
            url: `https://${vincereTenantUrl}/api/v2/candidate/${entityId}/customfields`,
        });

        const compliancyField = customFieldsResponse.find(field => field.key === compliantKey);
        let compliantStatus = 'null';
        if (compliancyField && compliancyField.field_value_ids) {
            compliantStatus = compliantYesFields.includes(compliancyField.field_value_ids[0].toString()) ? 'yes' :
                              compliantNoFields.includes(compliancyField.field_value_ids[0].toString()) ? 'no' : 'null';
        }

        const candidateInfoResponse = await vincereRequest({
            method: 'get',
            url: `https://${vincereTenantUrl}/api/v2/candidate/${entityId}`,
        });

        const fullName = `${candidateInfoResponse.first_name} ${candidateInfoResponse.last_name}`;

        await CandidateCompliancy.create({ 
            candidateId: entityId, 
            compliant: compliantStatus,
            name: fullName
        });

        await CompliancyLogs.create({
            userId,
            entityId,
            compliantStatus,
        });

        logger.res({ msg: `New compliance status added for candidate ID: ${entityId} - ${fullName}`, status: 200 });
    } catch (error) {
        logger.res({ msg: `Error in compliance addition for candidate ID: ${entityId}.`, error: error.toString(), status: 500 });
    }
};

module.exports = compliancyAdd;