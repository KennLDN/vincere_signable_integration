const express = require('express');
const axios = require('axios');
const Token = require('../models/Token');
const UserToken = require('../models/UserToken');
const { vincereClientId, vincereTokenUrl } = require('../config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger')('AUTH CALLBACK');

const router = express.Router();

router.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query;

    try {
        const params = new URLSearchParams({
            client_id: vincereClientId,
            grant_type: 'authorization_code',
            code: code,
        });

        const response = await axios.post(vincereTokenUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { refresh_token, id_token } = response.data;

        if (state === 'srvlogin') {
            await Token.findOneAndUpdate({}, {
                id_token: id_token,
                refresh_token: refresh_token,
                updatedAt: new Date(),
            }, { new: true, upsert: true });

            logger.res({msg: 'Server authentication successful. Tokens received and stored!', status: 200, res});
        } else if (state === 'usrlogin') {
            const uid = uuidv4();
            const userIp = req.ip;
    
            await UserToken.create({ uid: uid, idToken: id_token, ipAddress: userIp });

            res.cookie('userAuth', uid, { httpOnly: true, secure: true, maxAge: 3540000 }); 

            res.redirect('/admin');
        } else {
            throw new Error('Invalid state parameter');
        }
    } catch (error) {
        logger.res({msg: 'Error exchanging authorization code for tokens.', status: 500, res, error});
    }
});

module.exports = router;
