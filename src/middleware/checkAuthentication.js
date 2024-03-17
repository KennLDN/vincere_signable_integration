const cookieParser = require('cookie-parser');
const UserToken = require('../models/UserToken');
const { vincereClientId, vincereAuthUrl, vincereCallbackUrl } = require('../config');

async function checkAuthentication(req, res, next) {
    const uid = req.cookies['userAuth'];
    const userIp = req.ip;

    if (!uid) {
        redirectToLogin(res);
        return;
    }

    try {
        const userToken = await UserToken.findOne({ uid: uid });
        if (!userToken || userToken.ipAddress !== userIp) {
            redirectToLogin(res);
            return;
        }

        next();
    } catch (error) {
        console.error('Error checking user authentication:', error);
        res.status(500).send('Internal Server Error');
    }
}

function redirectToLogin(res) {
    const authUrl = `${vincereAuthUrl}?client_id=${vincereClientId}&state=usrlogin&redirect_uri=${vincereCallbackUrl}&response_type=code`;
    res.redirect(authUrl);
}

module.exports = checkAuthentication;
