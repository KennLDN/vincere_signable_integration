const express = require('express');
const { vincereClientId, vincereCallbackUrl, vincereAuthUrl } = require('../config');

const router = express.Router();

router.get('/login-cs-server', (req, res) => {
    const callbackUrl = encodeURIComponent(vincereCallbackUrl);
    const authUrl = `${vincereAuthUrl}?client_id=${vincereClientId}&state=srvlogin&redirect_uri=${callbackUrl}&response_type=code`;

    res.redirect(authUrl);
});

module.exports = router;
