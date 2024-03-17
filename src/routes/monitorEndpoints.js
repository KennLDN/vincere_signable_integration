const express = require('express');
const os = require('os');
const osUtils = require('os-utils');
const checkAuthentication = require('../middleware/checkAuthentication');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const models = {
    CandidateCompliancy: require('../models/CandidateCompliancy'),
    CandidateCreateQueue: require('../models/CandidateCreateQueue'),
    CandidateUpdateQueue: require('../models/CandidateUpdateQueue'),
    CompliancyLogs: require('../models/CompliancyLogs'),
    LastProcessedTimestamp: require('../models/LastProcessedTimestamp'),
    Token: require('../models/Token'),
    UserToken: require('../models/UserToken'),
    Users: require('../models/Users')
};

const router = express.Router();

router.use(checkAuthentication);

router.get('/monitor-cpu', (req, res) => {
    osUtils.cpuUsage((v) => {
        res.json({ cpuUsage: (v * 100).toFixed(2) + '%' });
    });
});

router.get('/monitor-ram', (req, res) => {
    const totalRam = os.totalmem();
    const freeRam = os.freemem();
    const usedRam = totalRam - freeRam;
    const ramUsage = (usedRam / totalRam) * 100;
    res.json({ ramUsage: ramUsage.toFixed(2) + '%' });
});

router.get('/monitor-storage', (req, res) => {
    exec('df -k /', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const lines = stdout.trim().split('\n');
        const result = lines[1].split(/\s+/);
        const total = parseFloat(result[1]) / 1024; 
        const used = parseFloat(result[2]) / 1024; 
        res.json({ totalStorageMB: total.toFixed(2), usedStorageMB: used.toFixed(2) });
    });
});

router.get('/monitor-dbs', async (req, res) => {
    try {
        const documentSizes = {
            CandidateCompliancy: 128,
            CandidateCreateQueue: 34,
            CandidateUpdateQueue: 34,
            CompliancyLogs: 84,
            LastProcessedTimestamp: 18,
            Token: 218,
            Users: 118,
            UserToken: 175
        };

        const dbStats = await Promise.all(Object.entries(models).map(async ([modelName, model]) => {
            const count = await model.countDocuments();
            const estimatedSizeBytes = documentSizes[modelName] * count;
            return {
                modelName,
                count,
                estimatedSizeBytes
            };
        }));

        res.json(dbStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/monitor-logs', (req, res) => {
    const logFilePath = path.join(__dirname, '../log.txt');
    const page = parseInt(req.query.page, 10) || 1;
    const count = Math.min(parseInt(req.query.count, 10) || 20, 100);

    fs.stat(logFilePath, (err, stats) => {
        if (err) {
            console.error('Error accessing log file:', err);
            return res.status(500).json({ error: 'Error reading log file' });
        }

        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading log file:', err);
                return res.status(500).json({ error: 'Error reading log file' });
            }

            const lines = data.trim().split('\n').reverse();

            const startIndex = (page - 1) * count;
            const endIndex = startIndex + count;

            const selectedLines = lines.slice(startIndex, endIndex);

            const fileSize = stats.size;

            res.json({
                page,
                count: selectedLines.length,
                logs: selectedLines,
                fileSize
            });
        });
    });
});

module.exports = router;

