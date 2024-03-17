const express = require('express');
const checkAuthentication = require('../middleware/checkAuthentication');
const ReferenceLogs = require('../models/ReferenceLogs');
const Users = require('../models/Users');
const CandidateCompliancy = require('../models/CandidateCompliancy');

const router = express.Router();

router.get('/reference-logs', checkAuthentication, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    try {
        let logsQuery = ReferenceLogs.find();

        if (search) {
            if (/^\d+$/.test(search)) {
                const searchCriteria = { $or: [
                    { oneUser: search },
                    { twoUser: search },
                    { threeUser: search },
                    { oneStatus: parseInt(search) },
                    { twoStatus: parseInt(search) },
                    { threeStatus: parseInt(search) },
                    { entityId: parseInt(search) }
                ]};
                logsQuery = logsQuery.find(searchCriteria);
            } else {
                const candidateIds = (await CandidateCompliancy.find({ name: search })).map(c => c.candidateId);
                const userIds = (await Users.find({ full_name: search }, 'id')).map(u => u.id);

                const searchCriteria = { $or: [
                    { entityId: { $in: candidateIds } },
                    { oneUser: { $in: userIds } },
                    { twoUser: { $in: userIds } },
                    { threeUser: { $in: userIds } }
                ]};
                logsQuery = logsQuery.find(searchCriteria);
            }
        }

        logsQuery = logsQuery.sort({ 'oneDate': -1, 'twoDate': -1, 'threeDate': -1 }).skip(skip).limit(limit);
        const logs = await logsQuery.exec();
        const totalCount = await ReferenceLogs.countDocuments(logsQuery.getQuery());
        const totalPages = Math.ceil(totalCount / limit);

        const augmentedLogs = await Promise.all(logs.map(async log => {
            const candidate = await CandidateCompliancy.findOne({ candidateId: log.entityId });
            const candidateName = candidate ? candidate.name : 'Unknown Entity';

            const oneUser = await Users.findOne({ id: log.oneUser });
            const twoUser = await Users.findOne({ id: log.twoUser });
            const threeUser = await Users.findOne({ id: log.threeUser });

            return {
                candidateId: log.entityId,
                candidateName,
                oneStatus: log.oneStatus,
                twoStatus: log.twoStatus,
                threeStatus: log.threeStatus,
                oneUser: log.oneUser,
                twoUser: log.twoUser,
                threeUser: log.threeUser,
                oneDate: log.oneDate,
                twoDate: log.twoDate,
                threeDate: log.threeDate,
                oneMsg: log.oneMsg,
                twoMsg: log.twoMsg,
                threeMsg: log.threeMsg,
                oneUsername: oneUser ? oneUser.full_name : 'Unknown User',
                twoUsername: twoUser ? twoUser.full_name : 'Unknown User',
                threeUsername: threeUser ? threeUser.full_name : 'Unknown User'
            };
        }));

        res.json({
            page,
            totalPages,
            totalCount,
            logs: augmentedLogs
        });
    } catch (error) {
        console.error('Error fetching reference logs:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
