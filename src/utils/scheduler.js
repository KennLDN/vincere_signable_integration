const logger = require('./logger')('SCHEDULER');
const cron = require('node-cron');
const refreshToken = require('./refreshToken');
const trimLogFile = require('./logTrim');

const setupCronJobs = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.res({msg: 'Running scheduled token refresh'});
      await refreshToken();
    } catch (error) {
      logger.res({msg: 'Failed to refresh token', error: error.message, status: 500});
    }
  });

  cron.schedule('0 0 * * *', () => {
    try {
      logger.res({msg: 'Running scheduled log trimming'});
      trimLogFile();
    } catch (error) {
      logger.res({msg: 'Failed to trim log file', error: error.message, status: 500});
    }
  });
};

module.exports = setupCronJobs;
