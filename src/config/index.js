const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
    port: process.env.PORT || 4000,
    vincereClientId: process.env.VINCERE_CLIENT_ID,
    vincereCallbackUrl: process.env.VINCERE_CALLBACK_URL,
    vincereTenantUrl: process.env.VINCERE_TENANT_ID,
    vincereAuthUrl: `https://id.vincere.io/oauth2/authorize`,
    vincereTokenUrl: `https://id.vincere.io/oauth2/token`,
    compliantKey: process.env.COMPLIANT_KEY,
    compliantYesFields: process.env.COMPLIANT_YES_FIELDS ? process.env.COMPLIANT_YES_FIELDS.split(',') : [],
    compliantNoFields: process.env.COMPLIANT_NO_FIELDS ? process.env.COMPLIANT_NO_FIELDS.split(',') : [],
};

module.exports = config;
