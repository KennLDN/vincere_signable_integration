const CandidateCompliancy = require('../models/CandidateCompliancy');
const CompliancyLogs = require('../models/CompliancyLogs');
const vincereRequest = require('./vincereRequest');
const config = require('../config');
const logger = require('./logger')('COMPLIANCY CHECK');

const compliancyCheck = async (entityId, userId) => {
    try {
        const customFieldsResponse = await vincereRequest({
            method: 'get',
            url: `https://${config.vincereTenantUrl}/api/v2/candidate/${entityId}/customfields`,
        });

        const candidateResponse = await vincereRequest({
            method: 'get',
            url: `https://${config.vincereTenantUrl}/api/v2/candidate/${entityId}`,
        });

        const compliancyField = customFieldsResponse.data.find(field => field.key === config.compliantKey);
        let compliantStatus = 'null';
        if (compliancyField && compliancyField.field_value_ids) {
            compliantStatus = config.compliantYesFields.includes(compliancyField.field_value_ids[0].toString()) ? 'yes' :
                              config.compliantNoFields.includes(compliancyField.field_value_ids[0].toString()) ? 'no' : 'null';
        }

        const name = `${candidateResponse.data.first_name} ${candidateResponse.data.last_name}`;

        const existingCompliance = await CandidateCompliancy.findOne({ candidateId: entityId });
        
        const isComplianceChanged = !existingCompliance || existingCompliance.compliant !== compliantStatus;
        const isNameChanged = existingCompliance && existingCompliance.name !== name;
        
        if (isComplianceChanged || isNameChanged) {
            if (existingCompliance) {
                await CandidateCompliancy.updateOne({ candidateId: entityId }, { compliant: compliantStatus, name: name });
            } else {
                await CandidateCompliancy.create({ candidateId: entityId, compliant: compliantStatus, name: name });
            }
        
            if (isComplianceChanged) {
                await CompliancyLogs.create({
                    userId,
                    entityId,
                    compliantStatus,
                });
        
                logger.res({ msg: `Compliance status updated for candidate ID: ${entityId}`, status: 200 });
            } else if (isNameChanged) {
                logger.res({ msg: `Candidate name updated for candidate ID: ${entityId}`, status: 200 });
            }
        }
    } catch (error) {
        logger.res({ msg: `Error in compliance check for candidate ID: ${entityId}.`, error: error.toString(), status: 500 });
    }
};

module.exports = compliancyCheck;
