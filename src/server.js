const connectDB = require('./config/database');
const express = require('express');
const dotenv = require('dotenv');
const { port } = require('./config');
const setupRoutes = require('./routes');

const setupCronJobs = require('./utils/scheduler');
const refreshToken = require('./utils/refreshToken');
const processUpdateWebhookQueue = require('./utils/processUpdateWebhookQueue');
const processCreateWebhookQueue = require('./utils/processCreateWebhookQueue');
const checkAndPopulateCompliancy = require('./utils/checkAndPopulateCompliancy');
const processReferenceQueue = require('./utils/processReferenceQueue');
const fetchAndStoreUsers = require('./utils/fetchAndStoreUsers');

const cookieParser = require('cookie-parser');

const logger = require('./utils/logger')('SERVER ROOT');

dotenv.config();

const startTime = Date.now();

connectDB();

const app = express();
app.use(cookieParser());

setupRoutes(app);

setupCronJobs();

refreshToken().then(() => {
    app.listen(port, () => {
        const endTime = Date.now();
        const startupTime = ((endTime - startTime) / 1000).toFixed(2);
        logger.res({msg: `Server is running on port ${port}. Startup took ${startupTime} seconds.`});

        processUpdateWebhookQueue();
        processCreateWebhookQueue();
        processReferenceQueue();
    });
});

/*checkAndPopulateCompliancy()*/ /* Use if server has been offline for a while and missed candidates */
fetchAndStoreUsers();

// CLEAR USER TOKEN SCRIPT
/*
const clearUserToken = require('./scripts/clearUserToken');
clearUserToken();
*/

// CLEAR REFERENCE LOGS SCRIPT
/*
const clearReferenceLogs = require('./scripts/clearReferenceLogs');
clearReferenceLogs();

// CLEAR REFERENCE QUEUE SCRIPT

const clearReferenceQueue = require('./scripts/clearReferenceQueue');
clearReferenceQueue();
*/

// WEBHOOK CREATION SCRIPT
/*
const createWebhook = require('./scripts/createWebhook');
createWebhook('https://api.classroomsupport.co.uk/cc-webhook', 'CANDIDATE', 'CREATE');
*/

// WEBHOOK DELETE SCRIPT
/*
const deleteWebhook = require('./scripts/deleteWebhook');
deleteWebhook("827b99fb-1efb-43d8-a9af-a21b8fa9f4ac");
*/

// WEBHOOK LIST SCRIPT
/*
const fetchWebhooks = require('./scripts/fetchWebhooks');
fetchWebhooks()
*/

// PRINT DLQ SCRIPT
/*
const readDLQ = require('./scripts/readDeadLetterQueue.js');
readDLQ()
*/

// FETCH CANDIDATE CUSTOM FIELDS
/*
const fetchCandidateCustomFields = require('./scripts/fetchCandidateCustomFields.js');
fetchCandidateCustomFields(69752, true);
*/

// WEBHOOK UPDATE SCRIPT
/*
const updateWebhook = require('./scripts/updateWebhook');
updateWebhook('9be68a4a-3678-422c-b784-b13b37d7c625', 'CANDIDATE', 'UPDATE');
*/

// CLEAR WEBHOOK QUEUE SCRIPT
/*
const clearWebhookQueue = require('./scripts/clearWebhookQueue');
clearWebhookQueue();
*/

// CLEAR COMPLIANCY LOGS SCRIPT
/*
const clearCompliancyLogs = require('./scripts/clearCompliancyLogs');
clearCompliancyLogs();
*/

// SIGNABLE SCRIPTS
/*
const { fetchEnvelopes, fetchTemplates, fetchUsers } = require('./scripts/signableScripts');
fetchEnvelopes();
*/