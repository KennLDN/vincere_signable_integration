const express = require('express');
const checkAuthentication = require('../middleware/checkAuthentication');
const CompliancyLogs = require('../models/CompliancyLogs');
const Users = require('../models/Users');
const CandidateCompliancy = require('../models/CandidateCompliancy');

const router = express.Router();

router.get('/compliancy-logs', checkAuthentication, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    try {
        let logsQuery = CompliancyLogs.find().sort({ changeTime: -1 }).skip(skip).limit(limit);

        if (search) {
            const searchAsNumber = parseInt(search, 10);
            if (!isNaN(searchAsNumber)) {
                logsQuery = logsQuery.or([{ userId: searchAsNumber }, { entityId: searchAsNumber }]);
            } else {
                const userIds = (await Users.find({ full_name: search }).select('id')).map(user => user.id);
                const candidateIds = (await CandidateCompliancy.find({ name: search }).select('candidateId')).map(candidate => candidate.candidateId);
                logsQuery = logsQuery.or([{ userId: { $in: userIds } }, { entityId: { $in: candidateIds } }]);
            }
        }

        const logs = await logsQuery.exec();
        const totalCount = await CompliancyLogs.countDocuments(logsQuery.getQuery());
        const totalPages = Math.ceil(totalCount / limit);

        const augmentedLogs = await Promise.all(logs.map(async log => {
            const user = await Users.findOne({ id: log.userId });
            const candidate = await CandidateCompliancy.findOne({ candidateId: log.entityId });
            
            return {
                userId: log.userId,
                entityId: log.entityId,
                compliantStatus: log.compliantStatus,
                changeTime: log.changeTime,
                username: user ? user.full_name : 'Unknown User',
                entityname: candidate ? candidate.name : 'Unknown Entity'
            };
        }));

        res.json({
            page,
            totalPages,
            totalCount,
            logs: augmentedLogs
        });
    } catch (error) {
        console.error('Error fetching compliancy logs:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
