const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const checkAuthentication = require('../middleware/checkAuthentication');

const router = express.Router();
router.use(cookieParser());

router.use('/admin', checkAuthentication);

router.use('/assets', express.static(path.resolve(__dirname, '../../frontend/dist/assets')));

router.get('/admin', (req, res) => {
    const indexPath = path.resolve(__dirname, '../../frontend/dist/index.html');
    res.sendFile(indexPath);
});

router.get('/admin/*', (req, res) => {
    const requestedPath = path.resolve(__dirname, '../../frontend/dist', req.path.replace(/^\/admin/, ''));
    if (fs.existsSync(requestedPath)) {
        return res.sendFile(requestedPath);
    }

    const indexPath = path.resolve(__dirname, '../../frontend/dist/index.html');
    res.sendFile(indexPath);
});

module.exports = router;

