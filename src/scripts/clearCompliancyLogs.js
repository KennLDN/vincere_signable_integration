const CompliancyLogs = require('../models/CompliancyLogs');
const logger = require('../utils/logger')('CLEAR COMPLIANCY LOGS');

const clearCompliancyLogs = async () => {
  try {
    const result = await CompliancyLogs.deleteMany({});
    logger.res({msg: `Cleared CompliancyLogs. Documents removed: ${result.deletedCount}`, status: 200});
  } catch (error) {
    logger.res({msg: 'Error clearing CompliancyLogs', error, status: 500});
  }
};

module.exports = clearCompliancyLogs;
